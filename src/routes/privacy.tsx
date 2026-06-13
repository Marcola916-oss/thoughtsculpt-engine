import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "../lib/i18n/LanguageProvider";
import { Logo } from "@/components/identity/Logo";


export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — MindReset" },
      { name: "description", content: "How MindReset collects, uses and protects your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useI18n();
  return (
    <div className="relative min-h-screen bg-transparent overflow-x-hidden">
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-20 relative z-10">
        <div className="flex flex-col items-center mb-12">
          <Logo size="md" className="mb-6" />
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition-all hover:bg-white/10 hover:text-primary active:scale-95">
            <span className="text-sm">←</span> {t.notFound.goHome}
          </Link>
        </div>

      <h1 className="mt-4 font-display text-4xl font-extrabold">{t.common.privacy}</h1>
      <p className="mt-6 whitespace-pre-line text-muted-foreground">{t.legal.privacyBody}</p>
      </div>
    </div>

  );
}