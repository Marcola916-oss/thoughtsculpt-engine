import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type Lang = "pt" | "en" | "pl" | "ro" | "ar";

const COPY: Record<Lang, { privacy: string; terms: string; tag: string; rights: string }> = {
  pt: { privacy: "Privacidade", terms: "Termos", tag: "Psicologia comportamental financeira", rights: "Todos os direitos reservados." },
  en: { privacy: "Privacy", terms: "Terms", tag: "Behavioral financial psychology", rights: "All rights reserved." },
  pl: { privacy: "Prywatność", terms: "Regulamin", tag: "Behawioralna psychologia finansowa", rights: "Wszelkie prawa zastrzeżone." },
  ro: { privacy: "Confidențialitate", terms: "Termeni", tag: "Psihologie financiară comportamentală", rights: "Toate drepturile rezervate." },
  ar: { privacy: "الخصوصية", terms: "الشروط", tag: "علم النفس السلوكي المالي", rights: "جميع الحقوق محفوظة." },
};

export function SiteFooter() {
  const { lang } = useI18n();
  const c = COPY[(["pt", "en", "pl", "ro", "ar"] as const).includes(lang as Lang) ? (lang as Lang) : "en"];
  const year = new Date().getFullYear();
  return (
    <footer
      className="relative z-10 border-t border-[#2A2A2A] bg-background/80 px-4 py-8 text-xs text-foreground/55 backdrop-blur-sm"
      role="contentinfo"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-black italic uppercase tracking-tight text-foreground/80">
            MindReset
          </span>
          <span className="hidden sm:inline text-foreground/35">·</span>
          <span className="hidden sm:inline">{c.tag}</span>
        </div>
        <nav aria-label="Footer" className="flex items-center gap-5">
          <Link
            to="/privacy"
            className="rounded-sm text-foreground/70 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000]/60"
          >
            {c.privacy}
          </Link>
          <Link
            to="/terms"
            className="rounded-sm text-foreground/70 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000]/60"
          >
            {c.terms}
          </Link>
          <span className="text-foreground/35">© {year}</span>
        </nav>
      </div>
      <p className="mx-auto mt-3 max-w-6xl text-[11px] text-foreground/40">
        {c.rights}
      </p>
    </footer>
  );
}