import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useI18n } from "../lib/i18n/LanguageProvider";
import { getSharedQuiz } from "../lib/quiz.functions";
import type { Archetype } from "../lib/quiz/scoring";

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
  const fetcher = useServerFn(getSharedQuiz);
  const { data, isLoading } = useQuery({
    queryKey: ["share", token],
    queryFn: () => fetcher({ data: { token } }),
  });

  const arch = (data?.winner as Archetype | undefined) ?? null;
  const meta = arch ? t.archetypes[arch] : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">MindReset</p>
      {isLoading && <p className="mt-10 text-muted-foreground">Loading…</p>}
      {!isLoading && !meta && (
        <>
          <h1 className="mt-4 font-display text-3xl font-extrabold">Share not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This link is invalid or has expired.</p>
        </>
      )}
      {meta && (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            {data?.display_name ?? "Someone"} is a
          </p>
          <h1 className="mt-2 font-display text-5xl font-extrabold text-primary md:text-7xl">{meta.name}</h1>
          <p className="mt-4 text-lg text-foreground/90">{meta.tagline}</p>
        </>
      )}
      <Link to="/" className="mr-glow mt-10 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
        {t.share.cta} →
      </Link>
    </div>
  );
}