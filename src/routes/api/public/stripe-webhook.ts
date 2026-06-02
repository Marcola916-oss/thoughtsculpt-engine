import { createFileRoute } from "@tanstack/react-router";
import { getStripe } from "../../../lib/stripe.server";
import { supabaseAdmin } from "../../../integrations/supabase/client.server";
import type Stripe from "stripe";

function planFromMeta(plan?: string | null) {
  if (plan === "30d") return "p30d";
  if (plan === "6m") return "p6m";
  if (plan === "1y") return "p1y";
  return null;
}

async function ensureUserForEmail(email: string, displayName?: string | null, lang?: string | null) {
  // Find existing auth user
  const list = await supabaseAdmin.auth.admin.listUsers();
  if (list.error) throw new Error(list.error.message);
  const existing = list.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) return existing.id;

  // Create new auth user with auto-generated password & magic link flow handled later
  const created = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { display_name: displayName ?? undefined, lang: lang ?? "en" },
  });
  if (created.error) throw new Error(created.error.message);
  return created.data.user.id;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email ?? (session.metadata?.email as string | undefined);
  if (!email) return;
  const planMeta = planFromMeta(session.metadata?.plan as string | undefined);
  if (!planMeta) return;

  const userId = await ensureUserForEmail(
    email,
    session.customer_details?.name,
    (session.metadata?.lang as string | undefined) ?? "en",
  );

  // Attach lead to user
  const leadId = session.metadata?.lead_id;
  if (leadId) {
    await supabaseAdmin.from("quiz_leads").update({ user_id: userId }).eq("id", leadId);
  }

  // Upsert subscription
  const sub = session.subscription as string | null;
  const customer = session.customer as string;
  const stripe = getStripe();
  let currentPeriodEnd: string | null = null;
  let currentPeriodStart: string | null = null;
  let amount = (session.amount_total ?? 0);
  let currency = (session.currency ?? "usd").toUpperCase();
  if (sub) {
    const s = await stripe.subscriptions.retrieve(sub);
    const item = s.items.data[0];
    if (item?.current_period_start) currentPeriodStart = new Date(item.current_period_start * 1000).toISOString();
    if (item?.current_period_end) currentPeriodEnd = new Date(item.current_period_end * 1000).toISOString();
    amount = item?.price.unit_amount ?? amount;
    currency = (item?.price.currency ?? currency).toUpperCase();
  }

  await supabaseAdmin.from("subscriptions").upsert({
    user_id: userId,
    plan: planMeta as "p30d" | "p6m" | "p1y",
    currency,
    amount_cents: amount,
    status: "active",
    stripe_customer_id: customer,
    stripe_subscription_id: sub ?? null,
    stripe_checkout_session_id: session.id,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
  }, { onConflict: "stripe_subscription_id" });
}

async function handleSubscriptionUpdated(s: Stripe.Subscription) {
  const item = s.items.data[0];
  const periodEnd = item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null;
  const periodStart = item?.current_period_start ? new Date(item.current_period_start * 1000).toISOString() : null;
  const status: "active" | "past_due" | "canceled" | "expired" | "incomplete" =
    s.status === "active" || s.status === "trialing" ? "active"
    : s.status === "past_due" ? "past_due"
    : s.status === "canceled" ? "canceled"
    : s.status === "incomplete_expired" ? "expired"
    : "incomplete";

  await supabaseAdmin.from("subscriptions").update({
    status,
    current_period_start: periodStart,
    current_period_end: periodEnd,
  }).eq("stripe_subscription_id", s.id);
}

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const stripe = getStripe();
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        const sig = request.headers.get("stripe-signature");
        const body = await request.text();
        if (!secret || !sig) return new Response("Missing signature", { status: 400 });

        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(body, sig, secret);
        } catch (err) {
          return new Response(`Invalid signature: ${(err as Error).message}`, { status: 400 });
        }

        try {
          switch (event.type) {
            case "checkout.session.completed":
              await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
              break;
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
              await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
              break;
            default:
              break;
          }
        } catch (err) {
          console.error("[stripe-webhook]", event.type, err);
          return new Response((err as Error).message, { status: 500 });
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});