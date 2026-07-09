import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  leadId: z.string().uuid(),
  bumps: z.array(z.enum(["bump1", "bump2"])).max(2).default([]),
  origin: z.string().url().optional(),
  /** Idioma autoritativo do UI no momento do checkout — sobrepõe lead.lang */
  lang: z.string().min(2).max(5).optional(),
});

/**
 * Fase D3 — Cria uma Checkout Session no Stripe e devolve a URL hosted.
 * Público (sem auth). Pricing autoritativo do servidor.
 */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY missing");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { buildLineItems } = await import("@/lib/funnel/pricing.server");

    /* 1) lead */
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from("quiz_leads")
      .select("id, display_name, email, lang, currency, winner")
      .eq("id", data.leadId)
      .maybeSingle();
    if (leadErr) throw new Error(`lead fetch: ${leadErr.message}`);
    if (!lead) throw new Error("Lead not found");
    if (!lead.winner) throw new Error("Lead has no resolved archetype");

    const lang = data.lang || lead.lang || "en";
    // Currency é resolvida do `lang` autoritativo. NÃO usar lead.currency
    // (pode estar stale ou em fallback "usd" de um lead antigo).
    const { items, totalCents, currency } = buildLineItems(lang, data.bumps);

    /* 2) reserva order pending */
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        lead_id: lead.id,
        amount_cents: totalCents,
        currency,
        bumps: data.bumps,
        customer_email: lead.email,
        status: "pending",
      })
      .select("id")
      .single();
    if (orderErr) throw new Error(`order reserve: ${orderErr.message}`);

    /* 3) origin */
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const headerOrigin = getRequestHeader("origin") ?? getRequestHeader("referer");
    const origin = (data.origin || headerOrigin || "https://thoughtsculpt-engine.lovable.app")
      .replace(/\/$/, "");

    /* 4) Stripe Checkout via REST (form-encoded) */
    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("client_reference_id", order.id);
    if (lead.email) form.set("customer_email", lead.email);
    form.set(
      "success_url",
      `${origin}/obrigado?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    );
    form.set("cancel_url", `${origin}/?canceled=1&recover=${order.id}`);
    form.set("locale", stripeLocale(lang));
    // ── Conversion-tuned Checkout Session options ──
    // Don't restrict payment_method_types → Stripe auto-enables Apple Pay,
    // Google Pay, Link, Pix (BRL), BLIK (PLN), cards, etc. by locale/currency.
    form.set("customer_creation", "always");         // enables Stripe Link autofill
    form.set("allow_promotion_codes", "true");        // coupon field
    form.set("billing_address_collection", "auto");
    form.set("phone_number_collection[enabled]", "false");
    // Expire pending session after 30 min (Stripe minimum) — frees order intent.
    form.set("expires_at", String(Math.floor(Date.now() / 1000) + 30 * 60));
    // Microcopy INSIDE Stripe Checkout (above the Pay button + after submit).
    form.set("custom_text[submit][message]", stripeSubmitCopy(lang));
    form.set("custom_text[after_submit][message]", stripeAfterSubmitCopy(lang));
    // Card statement / receipt clarity (reduces chargebacks & refund requests).
    form.set(
      "payment_intent_data[description]",
      `MindReset — ${productLabel(lang)} (${lead.winner})`,
    );
    form.set("payment_intent_data[statement_descriptor_suffix]", "MINDRESET");
    form.set("payment_intent_data[metadata][order_id]", order.id);
    form.set("payment_intent_data[metadata][lead_id]", lead.id);
    form.set("payment_intent_data[metadata][archetype]", lead.winner);
    form.set("metadata[order_id]", order.id);
    form.set("metadata[lead_id]", lead.id);
    form.set("metadata[archetype]", lead.winner);
    form.set("metadata[lang]", lang);

    items.forEach((it, idx) => {
      form.set(`line_items[${idx}][quantity]`, "1");
      form.set(`line_items[${idx}][price_data][currency]`, it.currency);
      form.set(`line_items[${idx}][price_data][unit_amount]`, String(it.amount_cents));
      form.set(`line_items[${idx}][price_data][product_data][name]`, it.name);
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": `order-${order.id}`,
      },
      body: form.toString(),
    });

    if (!res.ok) {
      const body = await res.text();
      await supabaseAdmin
        .from("orders")
        .update({ status: "failed" })
        .eq("id", order.id);
      throw new Error(`Stripe ${res.status}: ${body.slice(0, 300)}`);
    }
    const session = (await res.json()) as { id: string; url: string };

    await supabaseAdmin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    // Track server-side event (PostHog)
    if (process.env.VITE_POSTHOG_KEY) {
      fetch(`${process.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com"}/capture/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.VITE_POSTHOG_KEY,
          event: "stripe_session_created",
          distinct_id: lead.id,
          properties: { lang, order_id: order.id, source: "server" },
        }),
      }).catch((e) => console.error("[checkout] PostHog SS error", e));
    }

    return { url: session.url, orderId: order.id };
  });

function stripeLocale(lang: string): string {
  switch (lang) {
    case "pt": return "pt-BR";
    case "pl": return "pl";
    case "ro": return "ro";
    case "ar": return "ar";
    default: return "en";
  }
}

// Microcopy that appears ABOVE the "Pay" button on Stripe's hosted page.
// Max 1200 chars per field, plain text only.
function stripeSubmitCopy(lang: string): string {
  switch (lang) {
    case "pt":
      return "✓ Garantia de 7 dias — reembolso integral. ✓ Acesso imediato por email. ✓ Pagamento único, sem subscrição.";
    case "pl":
      return "✓ Gwarancja 7 dni — pełen zwrot. ✓ Natychmiastowy dostęp na e-mail. ✓ Płatność jednorazowa, bez subskrypcji.";
    case "ro":
      return "✓ Garanție 7 zile — rambursare integrală. ✓ Acces imediat pe e-mail. ✓ Plată unică, fără abonament.";
    case "ar":
      return "✓ ضمان 7 أيام — استرداد كامل. ✓ وصول فوري عبر البريد الإلكتروني. ✓ دفعة واحدة، بدون اشتراك.";
    default:
      return "✓ 7-day money-back guarantee. ✓ Instant delivery to your email. ✓ One-time payment, no subscription.";
  }
}

function stripeAfterSubmitCopy(lang: string): string {
  switch (lang) {
    case "pt": return "A preparar o teu diagnóstico…";
    case "pl": return "Przygotowujemy twoją diagnozę…";
    case "ro": return "Pregătim diagnoza ta…";
    case "ar": return "نُجهّز تشخيصك…";
    default:   return "Preparing your diagnosis…";
  }
}

function productLabel(lang: string): string {
  switch (lang) {
    case "pt": return "Diagnóstico Comportamental";
    case "pl": return "Diagnoza Behawioralna";
    case "ro": return "Diagnoză Comportamentală";
    case "ar": return "التشخيص السلوكي";
    default:   return "Behavioral Diagnosis";
  }
}