export type Lang = "pt" | "en" | "pl" | "ro" | "ar";

export const LANGS: { code: Lang; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "en", label: "English",   dir: "ltr" },
  { code: "pl", label: "Polski",    dir: "ltr" },
  { code: "ro", label: "Română",    dir: "ltr" },
  { code: "ar", label: "العربية",   dir: "rtl" },
];

export type Currency = "PLN" | "RON" | "SAR" | "USD" | "EUR";

export const CURRENCY_BY_COUNTRY: Record<string, Currency> = {
  PL: "PLN", RO: "RON", SA: "SAR", AE: "SAR",
  // Eurozone fallback
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", PT: "EUR", NL: "EUR", BE: "EUR", IE: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",
  // Default everywhere else → USD
};

export const LANG_BY_COUNTRY: Record<string, Lang> = {
  PL: "pl", RO: "ro",
  SA: "ar", AE: "ar", EG: "ar", MA: "ar", DZ: "ar", TN: "ar", JO: "ar", QA: "ar", KW: "ar", BH: "ar", OM: "ar", IQ: "ar", LB: "ar", SY: "ar", YE: "ar",
  BR: "pt", PT: "pt", AO: "pt", MZ: "pt",
};