import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "../lib/i18n/LanguageProvider";

export const Route = createFileRoute("/share/$token")({
  head: () => ({
    meta: [
      { title: "Someone shared their archetype — MindReset" },
      { name: "description", content: "Discover your own financial archetype in 3 minutes." },
      { property: "og:title", content: "Someone shared their archetype — MindReset" },
      { property: "og:description", content: "Discover your own financial archetype in 3 minutes." },
    ],
  }),
  component: SharePage,
});

function SharePage() {
  const { token } = Route.useParams();
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">MindReset</p>
      <h1 className="mt-4 font-display text-4xl font-extrabold md:text-6xl">
        <span className="text-primary">Archetype</span> reveal
      </h1>
      <p className="mt-3 text-muted-foreground">Share token: <code className="text-foreground">{token}</code></p>
      <p className="mt-2 text-sm text-muted-foreground">This page becomes a live archetype reveal once viral_shares is wired (Phase 1B).</p>
      <Link to="/" className="mr-glow mt-10 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
        {t.share.cta} →
      </Link>
    </div>
  );
}