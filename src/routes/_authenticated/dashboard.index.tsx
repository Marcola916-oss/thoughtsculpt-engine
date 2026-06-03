import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../../lib/profile.functions";
import { ARCHETYPE_NAMES, ARCHETYPE_TAGLINES, type Archetype } from "../../lib/ai/archetypes";
import { supabase } from "../../integrations/supabase/client";
import { useEffect, useState } from "react";
import { useI18n } from "../../lib/i18n/LanguageProvider";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "Hub — MindReset" }] }),
  component: HubPage,
});

function HubPage() {
  const { t, lang } = useI18n();
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

  const cards = [
    { to: "/dashboard/diagnosis", icon: "🧠", ...t.dashboard.hub.cards.diagnosis },
    { to: "/dashboard/calendar", icon: "📅", ...t.dashboard.hub.cards.calendar },
    { to: "/dashboard/compass", icon: "🧭", ...t.dashboard.hub.cards.compass },
  ];

  const hour = String(new Date().getHours());

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <p className="text-sm text-muted-foreground">{t.dashboard.hub.greeting(hour)}{name ? `, ${name}` : ""}.</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">
          {archetype ? (
            <div className="flex flex-col gap-2">
              <span>{t.dashboard.hub.headingWithArchetype("")}</span>
              <div className="inline-flex items-center gap-2 mt-1">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
                  {ARCHETYPE_NAMES[archetype][lang]}
                </span>
              </div>
            </div>
          ) : (
            t.dashboard.hub.headingFallback
          )}
        </h1>
        {archetype && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{ARCHETYPE_TAGLINES[archetype][lang]}</p>
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
            <p className="mt-2 text-sm text-muted-foreground">
              {i === 1 ? `Streak: ${streak}🔥` : c.desc}
            </p>
            <span className="mt-5 inline-block text-xs font-semibold text-primary opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
              {c.cta}
            </span>
          </Link>
        ))}
      </div>

      {notifications.length > 0 && (
        <section className="mt-12 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold">{t.dashboard.hub.recentActivity.title}</h3>
            <Link to="/dashboard/progress" className="text-xs text-primary hover:underline">{t.dashboard.hub.recentActivity.viewAll}</Link>
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