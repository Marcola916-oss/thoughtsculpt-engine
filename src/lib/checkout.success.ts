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
    
    // 1. Query profiles table by email first to avoid listUsers page limits
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      userId = existingProfile.user_id;
    } else {
      // 2. Fallback to listUsers search if profile lookup failed
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
    }

    const leadId = session.metadata?.lead_id as string | undefined;

    // Proactive plan & subscription provisioning/hydration
    const paymentStatus = session.payment_status;
    const sessionStatus = session.status;
    if (paymentStatus === "paid" || sessionStatus === "complete") {
      // Check if subscription is already recorded
      const { data: existingSub } = await supabaseAdmin
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingSub) {
        const planMeta = session.metadata?.plan as string | undefined;
        const planKind = planMeta === "30d" ? "p30d" : planMeta === "6m" ? "p6m" : planMeta === "1y" ? "p1y" : null;

        if (planKind) {
          const stripeSubId = session.subscription as string | null;
          const customer = session.customer as string | null;
          let currentPeriodEnd: string | null = null;
          let currentPeriodStart: string | null = null;
          let amount = session.amount_total ?? 0;
          let currency = (session.currency ?? "usd").toUpperCase();

          if (stripeSubId) {
            try {
              const s = await stripe.subscriptions.retrieve(stripeSubId);
              const item = s.items.data[0];
              if (item?.current_period_start)
                currentPeriodStart = new Date(item.current_period_start * 1000).toISOString();
              if (item?.current_period_end)
                currentPeriodEnd = new Date(item.current_period_end * 1000).toISOString();
              amount = item?.price.unit_amount ?? amount;
              currency = (item?.price.currency ?? currency).toUpperCase();
            } catch (e) {
              console.error("Failed to retrieve subscription details from Stripe:", e);
            }
          }

          if (!currentPeriodEnd) {
            const days = planMeta === "30d" ? 30 : planMeta === "6m" ? 180 : 365;
            currentPeriodEnd = new Date(Date.now() + days * 86_400_000).toISOString();
          }

          await supabaseAdmin
            .from("subscriptions")
            .upsert(
              {
                user_id: userId,
                plan: planKind,
                currency,
                amount_cents: amount,
                status: "active",
                stripe_customer_id: customer,
                stripe_subscription_id: stripeSubId ?? null,
                stripe_checkout_session_id: session.id,
                current_period_start: currentPeriodStart ?? new Date().toISOString(),
                current_period_end: currentPeriodEnd,
              },
              { onConflict: "stripe_subscription_id" }
            );

          // Retrieve archetype from quiz lead
          let archetype: string | null = null;
          if (leadId) {
            const { data: leadData } = await supabaseAdmin
              .from("quiz_leads")
              .select("winner")
              .eq("id", leadId)
              .maybeSingle();
            if (leadData?.winner) {
              archetype = leadData.winner;
            }
          }

          // Safe profile update rather than full upsert (prevents overwriting names/langs)
          await supabaseAdmin
            .from("profiles")
            .update({
              plan_type: planMeta,
              plan_started_at: new Date().toISOString(),
              features_expires_at: currentPeriodEnd,
              access_level: "active",
              ...(archetype ? { archetype } : {}),
              ...(leadId ? { quiz_lead_id: leadId } : {}),
            })
            .eq("user_id", userId);

          // Insert welcome notification
          await supabaseAdmin.from("notifications").insert({
            user_id: userId,
            type: "system",
            title: "🎉 Bem-vindo ao MindReset!",
            body: "Sua assinatura está ativa. Clique aqui para começar seu diagnóstico.",
            icon: "🎉",
            action_url: "/dashboard/diagnosis",
          });
        }
      }
    }

    // Link lead to profile and update user_id in quiz_leads if metadata exists
    if (leadId) {
      const { data: leadData } = await supabaseAdmin
        .from("quiz_leads")
        .select("winner")
        .eq("id", leadId)
        .maybeSingle();

      await supabaseAdmin
        .from("profiles")
        .update({
          quiz_lead_id: leadId,
          ...(leadData?.winner ? { archetype: leadData.winner } : {}),
        })
        .eq("user_id", userId);

      await supabaseAdmin
        .from("quiz_leads")
        .update({ user_id: userId })
        .eq("id", leadId);
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
