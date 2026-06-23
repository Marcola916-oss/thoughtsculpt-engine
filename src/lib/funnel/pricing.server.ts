/**
 * Pricing autoritativo — usado apenas em server fns.
 * Valores em centavos da menor unidade da moeda (Stripe convention).
 * NUNCA confiar em valor vindo do client.
 */
export type Bump = "bump1" | "bump2";
export type Currency = "usd" | "eur" | "brl" | "pln" | "ron" | "sar";

interface PriceRow {
  currency: Currency;
  main: number;
  bump1: number;
  bump2: number;
}

const TABLE: Record<Currency, PriceRow> = {
  // bump2 alinhado à Conversion Bible V2: $14 (D1 aprovada).
  usd: { currency: "usd", main: 990,  bump1: 499,  bump2: 1400 },
  eur: { currency: "eur", main: 990,  bump1: 499,  bump2: 1400 },
  brl: { currency: "brl", main: 4990, bump1: 2490, bump2: 6990 },
  pln: { currency: "pln", main: 3900, bump1: 1900, bump2: 5500 },
  ron: { currency: "ron", main: 4500, bump1: 2200, bump2: 6500 },
  sar: { currency: "sar", main: 3700, bump1: 1900, bump2: 5200 },
};

const LANG_TO_CURRENCY: Record<string, Currency> = {
  pt: "brl",
  en: "usd",
  pl: "pln",
  ro: "ron",
  ar: "sar",
};

export function resolveCurrency(lang: string, hint?: string | null): Currency {
  const h = (hint || "").toLowerCase();
  if (h && h in TABLE) return h as Currency;
  return LANG_TO_CURRENCY[lang] ?? "usd";
}

export interface LineItem {
  name: string;
  amount_cents: number;
  currency: Currency;
  kind: "main" | Bump;
}

const PRODUCT_NAMES: Record<string, { main: string; bump1: string; bump2: string }> = {
  pt: {
    main: "Diagnóstico MindReset — PDF completo",
    bump1: "Guia de Relações por Arquétipo",
    bump2: "Protocolo de Reset 30 dias",
  },
  en: {
    main: "MindReset Diagnosis — Full PDF",
    bump1: "Archetype Relationships Guide",
    bump2: "30-Day Reset Protocol",
  },
  pl: {
    main: "Diagnoza MindReset — pełny PDF",
    bump1: "Przewodnik po relacjach wg archetypu",
    bump2: "Protokół Resetu 30 dni",
  },
  ro: {
    main: "Diagnoză MindReset — PDF complet",
    bump1: "Ghid de relații pe arhetip",
    bump2: "Protocol Reset 30 de zile",
  },
  ar: {
    main: "تشخيص MindReset — PDF كامل",
    bump1: "دليل العلاقات حسب النمط",
    bump2: "بروتوكول إعادة الضبط 30 يومًا",
  },
};

export function buildLineItems(lang: string, bumps: Bump[], hint?: string | null): {
  items: LineItem[];
  totalCents: number;
  currency: Currency;
} {
  const currency = resolveCurrency(lang, hint);
  const row = TABLE[currency];
  const names = PRODUCT_NAMES[lang] ?? PRODUCT_NAMES.en;

  const items: LineItem[] = [
    { kind: "main", name: names.main, amount_cents: row.main, currency },
  ];
  if (bumps.includes("bump1")) {
    items.push({ kind: "bump1", name: names.bump1, amount_cents: row.bump1, currency });
  }
  if (bumps.includes("bump2")) {
    items.push({ kind: "bump2", name: names.bump2, amount_cents: row.bump2, currency });
  }
  const totalCents = items.reduce((s, i) => s + i.amount_cents, 0);
  return { items, totalCents, currency };
}

/**
 * Formata centavos numa string localizada por moeda.
 * Único formatador do projeto — UI e Stripe partilham este output.
 */
export function formatPrice(cents: number, currency: Currency): string {
  const amount = cents / 100;
  switch (currency) {
    case "brl":
      return `R$ ${amount.toFixed(2).replace(".", ",")}`;
    case "eur":
      return `€${amount.toFixed(2).replace(".", ",")}`;
    case "usd":
      return `$${amount.toFixed(2)}`;
    case "pln":
      return `${amount.toFixed(2).replace(".", ",")} zł`;
    case "ron":
      return `${amount.toFixed(2).replace(".", ",")} RON`;
    case "sar":
      return `SAR ${amount.toFixed(2)}`;
  }
}

/**
 * Quote completo: preços individuais + total + formatação pronta.
 */
export function buildQuote(lang: string, bumps: Bump[], hint?: string | null) {
  const currency = resolveCurrency(lang, hint);
  const row = TABLE[currency];
  const { items, totalCents } = buildLineItems(lang, bumps, hint);
  return {
    currency,
    totalCents,
    items,
    prices: {
      main: { cents: row.main, formatted: formatPrice(row.main, currency) },
      bump1: { cents: row.bump1, formatted: formatPrice(row.bump1, currency) },
      bump2: { cents: row.bump2, formatted: formatPrice(row.bump2, currency) },
      total: { cents: totalCents, formatted: formatPrice(totalCents, currency) },
    },
  };
}