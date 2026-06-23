import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  leadId: z.string().uuid(),
  bumps: z.array(z.enum(["bump1", "bump2"])).max(2).default([]),
  origin: z.string().url().optional(),
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

    const lang = lead.lang || "en";
    const { items, totalCents, currency } = buildLineItems(lang, data.bumps, lead.currency);

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
    form.set("success_url", `${origin}/obrigado?order=${order.id}`);
    form.set("cancel_url", `${origin}/?canceled=1`);
    form.set("locale", stripeLocale(lang));
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