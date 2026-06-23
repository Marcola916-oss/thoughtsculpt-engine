import { createServerFn } from "@tanstack/react-start";

/**
 * Fase 1 — Resolve preço local pelo país do visitante via `cf-ipcountry`
 * (header injetado pelo Cloudflare na borda). Sem PII, sem auth.
 *
 * Output já formatado para a UI: pronto para Hero/VSL/Checkout.
 */
export const getLocalPrice = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequestHeader } = await import("@tanstack/react-start/server");
  const { buildQuote } = await import("./pricing.server");

  const countryHeader =
    getRequestHeader("cf-ipcountry") ||
    getRequestHeader("x-vercel-ip-country") ||
    getRequestHeader("x-country-code") ||
    "";
  const country = countryHeader.toUpperCase().trim();

  // Country → currency. Default USD.
  const COUNTRY_TO_CURRENCY: Record<string, string> = {
    BR: "brl", PT: "eur",
    US: "usd", CA: "usd", GB: "usd",
    PL: "pln",
    RO: "ron", MD: "ron",
    SA: "sar", AE: "sar", KW: "sar", QA: "sar", BH: "sar", OM: "sar",
    // Eurozone fallback
    DE: "eur", FR: "eur", ES: "eur", IT: "eur", NL: "eur", BE: "eur",
    AT: "eur", IE: "eur", FI: "eur", GR: "eur", LU: "eur",
  };
  const currencyHint = COUNTRY_TO_CURRENCY[country] || null;

  // Lang é apenas pra nomear produtos no quote — preço só depende de currency.
  const quote = buildQuote("en", [], currencyHint);

  return {
    country: country || null,
    currency: quote.currency,
    prices: quote.prices,
  };
});
