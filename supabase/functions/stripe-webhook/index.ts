// Supabase Edge Function — stripe-webhook
// Runtime: Deno (deployed via Supabase Edge Functions)
// Blueprint: MindReset V2 Professional — Stripe Webhook Signature Validation section
//
// Handles: checkout.session.completed, invoice.payment_succeeded,
//          invoice.payment_failed, charge.refunded,
//          customer.subscription.updated, customer.subscription.deleted
//
// SECURITY: STRIPE_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY must be set
//           in Supabase Dashboard → Project Settings → Edge Functions → Secrets.
//           NEVER expose these to client-side code.

import Stripe from "https://esm.sh/stripe@14?target=deno&deno-std=0.177.0&no-check";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno&deno-std=0.177.0&no-check";

// ---------------------------------------------------------------------------
// Environment / Clients
// ---------------------------------------------------------------------------
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-04-30.basil" as any,
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function planFromMeta(plan?: string | null): "p30d" | "p6m" | "p1y" | null {
  if (plan === "30d") return "p30d";
  if (plan === "6m") return "p6m";
  if (plan === "1y") return "p1y";
  return null;
}

async function ensureUserForEmail(
  email: string,
  displayName?: string | null,
  lang?: string | null,
): Promise<string> {
  // Query profiles table by email first to avoid listUsers page limits
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("user_id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (existingProfile) {
    return existingProfile.user_id;
  }

  // Fallback search by listing users
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (!error && data) {
    const existing = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (existing) return existing.id;
  }

  // Create new auth user — email auto-confirmed so they can log in via magic link
  const { data: created, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        display_name: displayName ?? undefined,
        lang: lang ?? "en",
      },
    });
  if (createError || !created.user) {
    throw new Error(createError?.message ?? "Failed to create user");
  }
  return created.user.id;
}

async function syncProfileSubscription(
  userId: string,
  plan: string,
  status: string,
  periodEnd: string | null,
) {
  const planType =
    plan === "p30d" ? "30d" : plan === "p6m" ? "6m" : plan === "p1y" ? "1y" : null;
  const start = new Date().toISOString();

  let featuresExpiresAt: string | null = null;
  let accessLevel = "active";

  if (periodEnd) {
    featuresExpiresAt = periodEnd;
  } else if (planType) {
    const days = planType === "30d" ? 30 : planType === "6m" ? 180 : 365;
    featuresExpiresAt = new Date(Date.now() + days * 86_400_000).toISOString();
  }

  if (status === "active" || status === "trialing") {
    accessLevel = "active";
  } else if (status === "past_due") {
    accessLevel = "grace";
  } else if (
    status === "unpaid" ||
    status === "incomplete_expired" ||
    status === "canceled"
  ) {
    accessLevel = "locked";
  }

  await supabaseAdmin
    .from("profiles")
    .update({
      plan_type: planType,
      plan_started_at: start,
      features_expires_at: featuresExpiresAt,
      access_level: accessLevel,
    })
    .eq("user_id", userId);
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const email =
    session.customer_details?.email ??
    (session.metadata?.email as string | undefined);
  if (!email) return;

  const planMeta = planFromMeta(session.metadata?.plan as string | undefined);
  if (!planMeta) return;

  const userId = await ensureUserForEmail(
    email,
    session.customer_details?.name,
    (session.metadata?.lang as string | undefined) ?? "en",
  );

  // Link quiz lead to user record
  const leadId = session.metadata?.lead_id;
  if (leadId) {
    await supabaseAdmin
      .from("quiz_leads")
      .update({ user_id: userId })
      .eq("id", leadId);
  }

  // Resolve subscription period details
  const sub = session.subscription as string | null;
  const customer = session.customer as string;
  let currentPeriodEnd: string | null = null;
  let currentPeriodStart: string | null = null;
  let amount = session.amount_total ?? 0;
  let currency = (session.currency ?? "usd").toUpperCase();

  if (sub) {
    const s = await stripe.subscriptions.retrieve(sub);
    const item = s.items.data[0];
    if (item?.current_period_start)
      currentPeriodStart = new Date(item.current_period_start * 1000).toISOString();
    if (item?.current_period_end)
      currentPeriodEnd = new Date(item.current_period_end * 1000).toISOString();
    amount = item?.price.unit_amount ?? amount;
    currency = (item?.price.currency ?? currency).toUpperCase();
  }

  await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        plan: planMeta,
        currency,
        amount_cents: amount,
        status: "active",
        stripe_customer_id: customer,
        stripe_subscription_id: sub ?? null,
        stripe_checkout_session_id: session.id,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
      },
      { onConflict: "stripe_subscription_id" },
    );

  await syncProfileSubscription(userId, planMeta, "active", currentPeriodEnd);

  // Welcome notification (multi-language supported via metadata)
  const welcomeDict = {
    pt: { title: "🎉 Bem-vindo ao MindReset!", body: "Sua assinatura está ativa. Clique aqui para começar seu diagnóstico." },
    en: { title: "🎉 Welcome to MindReset!", body: "Your subscription is active. Click here to start your diagnosis." },
    pl: { title: "🎉 Witaj w MindReset!", body: "Twoja subskrypcja jest aktywna. Kliknij tutaj, aby rozpocząć diagnozę." },
    ro: { title: "🎉 Bine ai venit la MindReset!", body: "Abonamentul tău este activ. Click aici pentru a începe diagnoza." },
    ar: { title: "🎉 مرحباً بك في MindReset!", body: "اشتراكك نشط الآن. انقر هنا لبدء التشخيص." }
  };
  const userLang = (session.metadata?.lang as keyof typeof welcomeDict | undefined) ?? 'en';
  const msg = welcomeDict[userLang] || welcomeDict.en;

  await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    type: "system",
    title: msg.title,
    body: msg.body,
    icon: "🎉",
    action_url: "/dashboard/diagnosis",
  });
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
): Promise<void> {
  const subId = (invoice as any).subscription as string;
  if (!subId) return;

  const s = await stripe.subscriptions.retrieve(subId);
  const item = s.items.data[0];
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;
  const periodStart = item?.current_period_start
    ? new Date(item.current_period_start * 1000).toISOString()
    : null;

  const { data: existingSub } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id, plan")
    .eq("stripe_subscription_id", subId)
    .maybeSingle();

  if (!existingSub) return;

  await supabaseAdmin
    .from("subscriptions")
    .update({
      status: "active",
      current_period_start: periodStart,
      current_period_end: periodEnd,
    })
    .eq("stripe_subscription_id", subId);

  await syncProfileSubscription(
    existingSub.user_id,
    existingSub.plan,
    "active",
    periodEnd,
  );

  await supabaseAdmin.from("notifications").insert({
    user_id: existingSub.user_id,
    type: "system",
    title: "💳 Pagamento Confirmado",
    body: "Sua assinatura foi renovada com sucesso! Continue aproveitando o MindReset.",
    icon: "💳",
  });
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const subId = (invoice as any).subscription as string;
  if (!subId) return;

  const { data: existingSub } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id, plan")
    .eq("stripe_subscription_id", subId)
    .maybeSingle();

  if (!existingSub) return;

  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", subId);

  await syncProfileSubscription(
    existingSub.user_id,
    existingSub.plan,
    "past_due",
    null,
  );

  await supabaseAdmin.from("notifications").insert({
    user_id: existingSub.user_id,
    type: "expiry",
    title: "⚠️ Falha no Pagamento",
    body: "Não conseguimos processar sua cobrança. Seu acesso continuará ativo em período de tolerância enquanto tentamos cobrar novamente.",
    icon: "⚠️",
  });
}

async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const customerId = charge.customer as string;
  if (!customerId) return;

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!sub) return;

  await supabaseAdmin
    .from("profiles")
    .update({
      access_level: "revoked",
      features_expires_at: new Date().toISOString(),
    })
    .eq("user_id", sub.user_id);

  await supabaseAdmin.from("notifications").insert({
    user_id: sub.user_id,
    type: "expiry",
    title: "🚫 Acesso Revogado",
    body: "Sua assinatura foi reembolsada e seu acesso foi encerrado.",
    icon: "🚫",
  });
}

async function handleSubscriptionUpdated(
  s: Stripe.Subscription,
): Promise<void> {
  const item = s.items.data[0];
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;
  const periodStart = item?.current_period_start
    ? new Date(item.current_period_start * 1000).toISOString()
    : null;

  const status =
    s.status === "active" || s.status === "trialing"
      ? "active"
      : s.status === "past_due"
        ? "past_due"
        : s.status === "canceled"
          ? "canceled"
          : s.status === "incomplete_expired"
            ? "expired"
            : "incomplete";

  await supabaseAdmin
    .from("subscriptions")
    .update({ status, current_period_start: periodStart, current_period_end: periodEnd })
    .eq("stripe_subscription_id", s.id);

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id, plan")
    .eq("stripe_subscription_id", s.id)
    .maybeSingle();

  if (sub) {
    const accessLevel =
      status === "active" ? "active" : status === "past_due" ? "grace" : "locked";

    await supabaseAdmin
      .from("profiles")
      .update({ access_level: accessLevel, features_expires_at: periodEnd })
      .eq("user_id", sub.user_id);

    if (s.status === "canceled") {
      await supabaseAdmin.from("notifications").insert({
        user_id: sub.user_id,
        type: "expiry",
        title: "🔒 Acesso Bloqueado",
        body: "Sua assinatura foi encerrada. Seus dados estão salvos e você pode reativá-la a qualquer momento.",
        icon: "🔒",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Main Handler — Deno.serve
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!webhookSecret || !sig) {
    return new Response("Missing stripe-signature header or secret", {
      status: 400,
    });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return new Response(`Webhook signature invalid: ${(err as Error).message}`, {
      status: 400,
    });
  }

  console.log(`[stripe-webhook] Processing event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[stripe-webhook] Error handling event ${event.type}:`, err);
    return new Response(`Handler error: ${(err as Error).message}`, {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});
