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
    <div className="mx-auto max-w-2xl px-4 py-16 md:py-24 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-arch-primary">MindReset</p>
      {isLoading && <p className="mt-10 text-sm font-medium text-foreground/60">Loading…</p>}
      {!isLoading && !meta && (
        <>
          <h1 className="mt-4 font-display text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-tight">Share not found</h1>
          <p className="mt-3 text-sm md:text-base text-foreground/70 leading-relaxed">This link is invalid or has expired.</p>
        </>
      )}
      {meta && (
        <>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/60">
            {data?.display_name ?? "Someone"} is a
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.75rem,11vw,5.5rem)] font-black italic uppercase leading-[1.05] pt-2 pb-1 tracking-[-0.05em] text-primary text-balance whitespace-pre-line">{meta.name}</h1>
          <p className="mt-5 text-base md:text-lg leading-relaxed text-foreground/85">{meta.tagline}</p>
        </>
      )}
      <Link to="/" className="mr-glow mt-10 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-black italic uppercase tracking-tight text-primary-foreground transition hover:-translate-y-0.5">
        {t.share.cta} →
      </Link>
    </div>
  );
}