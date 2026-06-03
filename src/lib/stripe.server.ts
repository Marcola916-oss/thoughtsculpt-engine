import Stripe from "stripe";
import { PRICES, type PlanKey } from "./pricing";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  _stripe = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  return _stripe;
}

export const PLAN_INTERVAL: Record<PlanKey, { interval: "day" | "month" | "year"; interval_count: number; days: number }> = {
  "30d": { interval: "day",   interval_count: 30,  days: 30  },
  "6m":  { interval: "month", interval_count: 6,   days: 180 },
  "1y":  { interval: "year",  interval_count: 1,   days: 365 },
};

// Re-export from single source of truth in pricing.ts
export const PLAN_PRICES = PRICES;