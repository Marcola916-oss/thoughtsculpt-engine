import Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  _stripe = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  return _stripe;
}

export const PLAN_INTERVAL: Record<"30d" | "6m" | "1y", { interval: "day" | "month" | "year"; interval_count: number; days: number }> = {
  "30d": { interval: "day",   interval_count: 30,  days: 30  },
  "6m":  { interval: "month", interval_count: 6,   days: 180 },
  "1y":  { interval: "year",  interval_count: 1,   days: 365 },
};

export const PLAN_PRICES: Record<string, Record<"30d" | "6m" | "1y", number>> = {
  PLN: { "30d": 79,  "6m": 199, "1y": 319 },
  RON: { "30d": 89,  "6m": 229, "1y": 369 },
  SAR: { "30d": 89,  "6m": 229, "1y": 369 },
  USD: { "30d": 22,  "6m": 55,  "1y": 89  },
  EUR: { "30d": 20,  "6m": 50,  "1y": 82  },
};