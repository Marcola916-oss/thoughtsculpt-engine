import { useI18n } from "../lib/i18n/LanguageProvider";
import { LANGS, type Lang } from "../lib/i18n/types";
import { Link } from "@tanstack/react-router";

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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/98 backdrop-blur-md px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="mx-auto max-w-5xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.cookies.body}
          </p>
          <div className="mt-1.5 flex gap-3 text-xs text-muted-foreground/70">
            <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">{t.common.privacy}</Link>
            <Link to="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">{t.common.terms}</Link>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setConsent("essential")}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            {t.common.essential}
          </button>
          <button
            onClick={() => setConsent("all")}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:shadow-[0_0_10px_var(--accent-glow)]"
          >
            {t.common.accept}
          </button>
        </div>
      </div>
    </div>
  );
}