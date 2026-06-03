import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../../lib/profile.functions";
import { ARCHETYPE_NAMES, ARCHETYPE_TAGLINES, type Archetype } from "../../lib/ai/archetypes";
import { supabase } from "../../integrations/supabase/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "Hub — MindReset" }] }),
  component: HubPage,
});

const GREETINGS: Record<string, [string, string, string]> = {
  pt: ["Bom dia", "Boa tarde", "Boa noite"],
  en: ["Good morning", "Good afternoon", "Good evening"],
  pl: ["Dzień dobry", "Dzień dobry", "Dobry wieczór"],
  ro: ["Bună dimineața", "Bună ziua", "Bună seara"],
  ar: ["صباح الخير", "مساء الخير", "مساء الخير"],
};

function greeting(lang?: string | null) {
  const h = new Date().getHours();
  const set = GREETINGS[lang ?? "pt"] ?? GREETINGS["pt"];
  if (h < 12) return set[0];
  if (h < 18) return set[1];
  return set[2];
}

const cards = [
  {
    to: "/dashboard/diagnosis",
    title: "Meu Diagnóstico",
    desc: "Entenda seu arquétipo completo.",
    icon: "🧠",
  },
  {
    to: "/dashboard/calendar",
    title: "Matriz de Ação",
    desc: "Acesse seu protocolo diário personalizado.",
    icon: "📅",
  },
  {
    to: "/dashboard/compass",
    title: "Compass",
    desc: "Descubra o arquétipo de alguém na sua vida.",
    icon: "🧭",
  },
] as const;

function HubPage() {
  const fetchProfile = useServerFn(getMyProfile);
  const { data } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
  });
  
  const [streak, setStreak] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      
      // Fetch Gamification Stats
      supabase
        .from("user_progress")
        .select("streak_days, total_points")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setStreak(data.streak_days);
            setPoints(data.total_points);
          }
        });
        
      // Fetch Recent Notifications
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(3)
        .then(({ data }) => {
          if (data) setNotifications(data);
        });
    });
  }, []);

  const archetype = data?.profile?.archetype as Archetype | null | undefined;
  const name = data?.profile?.display_name ?? "";
  const lang = data?.profile?.lang ?? null;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <p className="text-sm text-muted-foreground">{greeting()}{name ? `, ${name}` : ""}.</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">
          {archetype ? (
            <div className="flex flex-col gap-2">
              <span>Seu hub de controle</span>
              <div className="inline-flex items-center gap-2 mt-1">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
                  {ARCHETYPE_NAMES[archetype].pt}
                </span>
              </div>
            </div>
          ) : (
            "Seu dashboard"
          )}
        </h1>
        {archetype && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{ARCHETYPE_TAGLINES[archetype]}</p>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c, i) => (
          <Link
            key={c.to}
            to={c.to}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_4px_20px_var(--accent-glow)]`}
          >
            <div className="mb-3 text-3xl transition-transform duration-300 group-hover:scale-110">{c.icon}</div>
            <h2 className="font-display text-xl font-bold">{c.title}</h2>
            
            {/* Custom descriptions based on gamification */}
            <p className="mt-2 text-sm text-muted-foreground">
              {i === 1 ? `Streak: ${streak}🔥` : c.desc}
            </p>
            
            <span className="mt-5 inline-block text-xs font-semibold text-primary opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
              Acessar →
            </span>
          </Link>
        ))}
      </div>

      {notifications.length > 0 && (
        <section className="mt-12 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold">Avisos Recentes</h3>
            <Link to="/dashboard/progress" className="text-xs text-primary hover:underline">Ver todas →</Link>
          </div>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-xl bg-background p-4">
                <span className="text-xl">{n.icon || "🔔"}</span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{n.title}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}