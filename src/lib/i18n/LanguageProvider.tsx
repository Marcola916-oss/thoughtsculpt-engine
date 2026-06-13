import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Dict } from "./translations";
import { LANGS, LANG_BY_COUNTRY, CURRENCY_BY_COUNTRY, type Lang, type Currency } from "./types";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  dir: "ltr" | "rtl";
  country: string | null;
  currency: Currency;
  consent: "all" | "essential" | null;
  setConsent: (c: "all" | "essential") => void;
  locale: string;
};

const LanguageContext = createContext<Ctx | null>(null);

const STORAGE_LANG = "mindreset_lang";
const STORAGE_CONSENT = "mindreset_cookie_consent";

const LOCALE_MAP: Record<Lang, string> = {
  pt: "pt-BR", en: "en-US", pl: "pl-PL", ro: "ro-RO", ar: "ar-SA",
};

function safeGet(key: string): string | null {
  try { return typeof window !== "undefined" ? window.localStorage.getItem(key) : null; } catch { return null; }
}
function safeSet(key: string, val: string) {
  try { if (typeof window !== "undefined") window.localStorage.setItem(key, val); } catch { /* ignore */ }
}

function detectNavLang(): Lang | null {
  if (typeof navigator === "undefined") return null;
  const n = navigator.language.toLowerCase();
  if (n.startsWith("pt")) return "pt";
  if (n.startsWith("pl")) return "pl";
  if (n.startsWith("ro")) return "ro";
  if (n.startsWith("ar")) return "ar";
  if (n.startsWith("en")) return "en";
  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [country, setCountry] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [consent, setConsentState] = useState<"all" | "essential" | null>(null);

  // Hydration: lang + consent from storage
  useEffect(() => {
    const savedLang = safeGet(STORAGE_LANG) as Lang | null;
    const savedConsent = safeGet(STORAGE_CONSENT) as "all" | "essential" | null;
    if (savedConsent) setConsentState(savedConsent);
    if (savedLang && LANGS.find((l) => l.code === savedLang)) {
      setLangState(savedLang);
      return;
    }
    const nav = detectNavLang();
    if (nav) setLangState(nav);
  }, []);

  // IP detection only if user accepted "all"
  useEffect(() => {
    if (consent !== "all" || typeof window === "undefined") return;

    // Skip geolocation in iframe/preview environments
    if (window.self !== window.top) return;

    let cancelled = false;
    (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch("https://geo.kamero.ai/api/geo", {
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        const cc: string | undefined = data?.country;
        if (cc) {
          setCountry(cc);
          const c = CURRENCY_BY_COUNTRY[cc] ?? "USD";
          setCurrency(c);
          if (!safeGet(STORAGE_LANG)) {
            const detected = LANG_BY_COUNTRY[cc];
            if (detected) setLangState(detected);
          }
        }
      } catch (err) {
        if (cancelled) return;
        console.debug("Geolocation API unavailable");
      }
    })();
    return () => { cancelled = true; };
  }, [consent]);

  // Sync <html lang> + dir
  useEffect(() => {
    if (typeof document === "undefined") return;
    const meta = LANGS.find((l) => l.code === lang)!;
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
  }, [lang]);

  const value = useMemo<Ctx>(() => ({
    lang,
    setLang: (l) => { safeSet(STORAGE_LANG, l); setLangState(l); },
    t: translations[lang],
    dir: LANGS.find((l) => l.code === lang)!.dir,
    country,
    currency,
    consent,
    setConsent: (c) => { safeSet(STORAGE_CONSENT, c); setConsentState(c); },
    locale: LOCALE_MAP[lang],
  }), [lang, country, currency, consent]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
