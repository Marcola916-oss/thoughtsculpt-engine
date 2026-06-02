import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../../lib/profile.functions";
import { ARCHETYPE_NAMES, ARCHETYPE_TAGLINES, type Archetype } from "../../lib/ai/archetypes";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "Hub — MindReset" }] }),
  component: HubPage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const cards = [
  {
    to: "/dashboard/diagnosis",
    title: "My Diagnosis",
    desc: "4-dimension psychological analysis of your archetype.",
    icon: "🧠",
  },
  {
    to: "/dashboard/calendar",
    title: "Action Matrix",
    desc: "Personalized day-by-day protocol designed for you.",
    icon: "📅",
  },
  {
    to: "/dashboard/compass",
    title: "Compass",
    desc: "Decode the archetype of anyone in your life.",
    icon: "🧭",
  },
] as const;

function HubPage() {
  const fetchProfile = useServerFn(getMyProfile);
  const { data } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
  });
  const archetype = data?.profile?.archetype as Archetype | null | undefined;
  const name = data?.profile?.display_name ?? "";

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <p className="text-sm text-muted-foreground">{greeting()}{name ? `, ${name}` : ""}.</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">
          {archetype ? (
            <>
              You are <span className="text-primary">{ARCHETYPE_NAMES[archetype].en}</span>
            </>
          ) : (
            "Your dashboard"
          )}
        </h1>
        {archetype && (
          <p className="mt-2 max-w-2xl text-muted-foreground">{ARCHETYPE_TAGLINES[archetype]}</p>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary"
          >
            <div className="mb-3 text-2xl">{c.icon}</div>
            <h2 className="font-display text-lg font-bold">{c.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            <span className="mt-4 inline-block text-xs text-primary opacity-0 transition group-hover:opacity-100">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}