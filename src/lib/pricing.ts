import type { Currency } from "./i18n/types";

export type PlanKey = "30d" | "6m" | "1y";

type PriceRow = Record<PlanKey, number>;

export const PRICES: Record<Currency, PriceRow> = {
  PLN: { "30d": 79,  "6m": 199, "1y": 319 },
  RON: { "30d": 89,  "6m": 229, "1y": 369 },
  SAR: { "30d": 89,  "6m": 229, "1y": 369 },
  USD: { "30d": 22,  "6m": 55,  "1y": 89  },
  EUR: { "30d": 20,  "6m": 50,  "1y": 82  },
};

export const PLAN_DAYS: Record<PlanKey, number> = { "30d": 30, "6m": 180, "1y": 365 };

export function formatPrice(currency: Currency, amount: number, opts?: { minimumFractionDigits?: number; maximumFractionDigits?: number }): string {
  const locale =
    currency === "PLN" ? "pl-PL" :
    currency === "RON" ? "ro-RO" :
    currency === "SAR" ? "ar-SA" :
    currency === "EUR" ? "de-DE" : "en-US";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: opts?.minimumFractionDigits ?? 0, maximumFractionDigits: opts?.maximumFractionDigits ?? 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function pricePerDay(currency: Currency, plan: PlanKey): string {
  const total = PRICES[currency][plan];
  const days = PLAN_DAYS[plan];
  return formatPrice(currency, +(total / days).toFixed(2), { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}