import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type Stripe from "stripe";
import { getStripe, PLAN_INTERVAL, PLAN_PRICES } from "./stripe.server";

const Input = z.object({
  plan: z.enum(["30d", "6m", "1y"]),
  currency: z.enum(["PLN", "RON", "SAR", "USD", "EUR"]),
  lead_id: z.string().uuid().optional(),
  email: z.string().email().max(255),
  display_name: z.string().min(1).max(80).optional(),
  lang: z.string().min(2).max(8),
  origin: z.string().url(),
});

const PRODUCT_NAME: Record<"30d" | "6m" | "1y", string> = {
  "30d": "MindReset — 30 Days Reset",
  "6m":  "MindReset — 6 Months Transformation",
  "1y":  "MindReset — 1 Year Mastery",
};

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const stripe = getStripe();
    const meta = PLAN_INTERVAL[data.plan];
    const amount = PLAN_PRICES[data.currency][data.plan];
    if (!amount) throw new Error("Invalid pricing");

    // Find or create customer
    const existing = await stripe.customers.list({ email: data.email, limit: 1 });
    const customer =
      existing.data[0] ??
      (await stripe.customers.create({
        email: data.email,
        name: data.display_name,
        metadata: { lead_id: data.lead_id ?? "", lang: data.lang },
      }));

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      locale: (data.lang === "pt" ? "pt-BR" : data.lang === "ar" ? "auto" : (data.lang as Stripe.Checkout.SessionCreateParams.Locale)),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: data.currency.toLowerCase(),
            unit_amount: amount * 100,
            product_data: { name: PRODUCT_NAME[data.plan] },
            recurring: { interval: meta.interval, interval_count: meta.interval_count },
          },
        },
      ],
      allow_promotion_codes: true,
      success_url: `${data.origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.origin}/?checkout=cancel`,
      metadata: {
        lead_id: data.lead_id ?? "",
        plan: data.plan,
        currency: data.currency,
        lang: data.lang,
        email: data.email,
      },
      subscription_data: {
        metadata: {
          lead_id: data.lead_id ?? "",
          plan: data.plan,
        },
      },
    });

    return { url: session.url, session_id: session.id };
  });

export const createCustomerPortalSession = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ customer_id: z.string(), origin: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: data.customer_id,
      return_url: `${data.origin}/dashboard/settings`,
    });
    return { url: session.url };
  });