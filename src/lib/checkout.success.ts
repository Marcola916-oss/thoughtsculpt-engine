import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getStripe } from "./stripe.server";
import { supabaseAdmin } from "../integrations/supabase/client.server";


/**
 * Retrieves a Stripe Checkout Session and generates a Supabase magic‑link login URL.
 * Called from the client after Stripe redirects to the success page.
 */
export const getCheckoutSessionStatus = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({ session_id: z.string().min(1) }).parse(d)
  )
  .handler(async ({ data }) => {
    const { session_id } = data;
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) throw new Error("Invalid checkout session");

    // Extract email from session – fallback to customer_email if details missing
    const email = session.customer_details?.email ?? session.customer_email;
    if (!email) throw new Error("Email not found in checkout session");

    // Ensure Supabase auth user exists (create if needed)
    let userId: string;
    const list = await supabaseAdmin.auth.admin.listUsers();
    if (list.error) throw new Error(list.error.message);
    const existing = list.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    
    if (existing) {
      userId = existing.id;
    } else {
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (createError || !created.user) {
        throw new Error(createError?.message ?? "Failed to create user");
      }
      userId = created.user.id;
    }

    // Link lead to profile if lead_id metadata exists
    const leadId = session.metadata?.lead_id as string | undefined;
    if (leadId) {
      await supabaseAdmin.from("profiles").upsert({
        user_id: userId,
        // other profile fields can be populated later during onboarding
      }, { onConflict: "user_id" });
    }

    // Generate magic‑link for login (type "magiclink" works for both new and existing users)
    const { data: link, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    });
    if (linkErr) throw new Error(linkErr.message);

    const magicLink = link?.properties?.action_link ?? "";

    // Send welcome email with magic link and plan information
    const planType = session.metadata?.plan ?? "unknown";
    try {
      const { sendWelcomeEmail } = await import("../lib/email");
      await sendWelcomeEmail(email, magicLink, planType);
    } catch (e) {
      console.error("Failed to send welcome email", e);
    }

    return { magicLink };
  });
