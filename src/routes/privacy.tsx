import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "../lib/i18n/LanguageProvider";

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
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Home</Link>
      <h1 className="mt-4 font-display text-4xl font-extrabold">{t.common.privacy}</h1>
      <p className="mt-6 whitespace-pre-line text-muted-foreground">{t.legal.privacyBody}</p>
    </div>
  );
}