import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "../lib/i18n/LanguageProvider";
import { Logo } from "@/components/identity/Logo";
import { GlobalAmbient } from "@/components/atmosphere";


export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — MindReset" },
      { name: "description", content: "MindReset terms of service, refund policy and disclaimers." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useI18n();
  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">
      <GlobalAmbient />
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-20 relative z-10">
        <div className="flex flex-col items-center mb-12">
          <Logo size="md" className="mb-6" />
          <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-2">
            <span className="text-sm">←</span> {t.notFound.goHome}
          </Link>
        </div>

      <h1 className="mt-4 font-display text-4xl font-extrabold">{t.common.terms}</h1>
      <p className="mt-6 whitespace-pre-line text-muted-foreground">{t.legal.termsBody}</p>
      </div>
    </div>

  );
}