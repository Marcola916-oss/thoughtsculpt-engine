/**
 * Pricing stub — Fase B usa esta tabela como placeholder visual.
 * Fase D substitui por detecção real de país/moeda + Stripe Prices API.
 */
export type FunnelCurrency = "BRL" | "USD" | "PLN" | "RON" | "SAR" | "EUR";

export interface PriceTriplet {
  /** Produto principal — diagnóstico PDF */
  main: string;
  /** Order bump 1 — Guia de Relações por Arquétipo */
  bump1: string;
  /** Order bump 2 — Protocolo de Reset 30 dias */
  bump2: string;
  /** Total quando ambos os bumps estão ativos */
  totalWithBumps: string;
  currency: FunnelCurrency;
  symbol: string;
}

const TABLE: Record<FunnelCurrency, PriceTriplet> = {
  BRL: { main: "R$ 49,90", bump1: "R$ 24,90", bump2: "R$ 39,90", totalWithBumps: "R$ 114,70", currency: "BRL", symbol: "R$" },
  USD: { main: "$9.90", bump1: "$4.99", bump2: "$7.99", totalWithBumps: "$22.88", currency: "USD", symbol: "$" },
  EUR: { main: "€9,90", bump1: "€4,99", bump2: "€7,99", totalWithBumps: "€22,88", currency: "EUR", symbol: "€" },
  PLN: { main: "39 zł", bump1: "19 zł", bump2: "31 zł", totalWithBumps: "89 zł", currency: "PLN", symbol: "zł" },
  RON: { main: "45 RON", bump1: "22 RON", bump2: "36 RON", totalWithBumps: "103 RON", currency: "RON", symbol: "RON" },
  SAR: { main: "SAR 37", bump1: "SAR 19", bump2: "SAR 29", totalWithBumps: "SAR 85", currency: "SAR", symbol: "SAR" },
};

const LANG_TO_CURRENCY: Record<string, FunnelCurrency> = {
  pt: "BRL",
  en: "USD",
  pl: "PLN",
  ro: "RON",
  ar: "SAR",
};

export function getPricing(lang: string, currencyHint?: string | null): PriceTriplet {
  const upper = (currencyHint || "").toUpperCase();
  if (upper && upper in TABLE) return TABLE[upper as FunnelCurrency];
  return TABLE[LANG_TO_CURRENCY[lang] ?? "USD"];
}