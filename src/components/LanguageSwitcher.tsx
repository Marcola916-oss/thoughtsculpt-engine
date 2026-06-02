import { useI18n } from "../lib/i18n/LanguageProvider";
import { LANGS, type Lang } from "../lib/i18n/types";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <select
      aria-label="Language"
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      className={`bg-card border border-border rounded-md px-2 py-1 text-xs text-foreground ${className}`}
    >
      {LANGS.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
}

export function CookieBanner() {
  const { t, consent, setConsent } = useI18n();
  if (consent) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur px-4 py-3 text-sm text-foreground">
      <div className="mx-auto max-w-5xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-muted-foreground">{t.cookies.body}</p>
        <div className="flex gap-2">
          <button onClick={() => setConsent("essential")} className="rounded-md border border-border px-3 py-1.5">{t.common.essential}</button>
          <button onClick={() => setConsent("all")} className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground">{t.common.accept}</button>
        </div>
      </div>
    </div>
  );
}