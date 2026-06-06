import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../../lib/profile.functions";
import { ARCHETYPE_NAMES, type Archetype } from "../../lib/ai/archetypes";
import { supabase } from "../../integrations/supabase/client";
import { useEffect, useState } from "react";
import { useI18n } from "../../lib/i18n/LanguageProvider";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../../lib/animations";
import { StreakCounter } from "../../components/gamification/StreakCounter";
import { BentoCard } from "../../components/ui/BentoCard";

const ARCHETYPE_QUOTES: Record<Archetype, string> = {
  AO: "Segurança real não vem de acumular — vem de confiar.",
  SS: "Sua riqueza real não precisa de aprovação.",
  EA: "Cada passo em direção à clareza é uma vitória.",
  HI: "A melhor recompensa vem de quem espera.",
};

const ARCHETYPE_GRADIENTS: Record<Archetype, string> = {
  AO: "from-blue-950/40",
  SS: "from-purple-950/40",
  EA: "from-amber-950/40",
  HI: "from-pink-950/40",
};


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
  const [tasksCompleted, setTasksCompleted] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasDiagnosis, setHasDiagnosis] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      
      supabase
        .from("user_progress")
        .select("streak_days, total_points, tasks_completed")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setStreak(data.streak_days);
            setPoints(data.total_points);
            setTasksCompleted(data.tasks_completed);
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

      supabase
        .from("diagnoses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .then(({ data }) => {
          setHasDiagnosis(!!(data && data.length > 0));
        });
    });
  }, []);

  const archetype = data?.profile?.archetype as Archetype | null | undefined;
  const name = data?.profile?.display_name ?? "";

  const cards = [
    { to: "/dashboard/diagnosis" as const, icon: "🧠", ...t.dashboard.hub.cards.diagnosis, badge: !hasDiagnosis ? "NOVO" : null },
    { to: "/dashboard/calendar" as const, icon: "📅", ...t.dashboard.hub.cards.calendar, badge: "Hoje" },
    { to: "/dashboard/compass" as const, icon: "🧭", ...t.dashboard.hub.cards.compass, badge: null },
    { to: "/dashboard/progress" as const, icon: "📈", title: lang === "pt" ? "Progresso" : "Progress", desc: lang === "pt" ? `${points} pontos acumulados` : `${points} points earned`, cta: lang === "pt" ? "Ver progresso" : "View progress", badge: streak > 0 ? `🔥${streak}` : null },
  ];

  const hour = String(new Date().getHours());

  return (
    <div className="mx-auto max-w-5xl relative">
      <div className="absolute inset-0 mesh-gradient opacity-10 pointer-events-none" />
      
      {/* Header with greeting + archetype banner */}
      <motion.header
        className="mb-10 relative z-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.p variants={staggerItem} className="text-sm text-muted-foreground">
          {t.dashboard.hub.greeting(hour)}{name ? `, ${name}` : ""}.
        </motion.p>
        <motion.h1 variants={staggerItem} className="mt-1 font-display text-3xl font-extrabold md:text-4xl">
          {archetype ? (
            <div className="flex flex-col gap-2">
              <span>{t.dashboard.hub.headingWithArchetype(ARCHETYPE_NAMES[archetype][lang])}</span>
              <div className="inline-flex items-center gap-2 mt-1">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary shadow-[0_0_10px_rgba(204,0,0,0.2)]">
                  {ARCHETYPE_NAMES[archetype][lang]}
                </span>
              </div>
            </div>
          ) : (
            t.dashboard.hub.headingFallback
          )}
        </motion.h1>

        {/* Archetype banner with gradient */}
        {archetype && (
          <motion.div
            variants={staggerItem}
            className={`mt-6 p-4 rounded-[var(--radius-lg)] bg-gradient-to-r ${ARCHETYPE_GRADIENTS[archetype]} to-transparent border border-border-subtle`}
          >
            <p className="text-sm italic" style={{ color: "var(--arch-primary)" }}>
              &ldquo;{ARCHETYPE_QUOTES[archetype]}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {ARCHETYPE_NAMES[archetype][lang]} — {new Date().toLocaleDateString(lang === "pt" ? "pt-BR" : lang === "pl" ? "pl-PL" : lang === "ro" ? "ro-RO" : "en-US", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </motion.div>
        )}
      </motion.header>

      {/* Quick stats row */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {[
          { label: lang === "pt" ? "Pontos" : "Points", value: points.toLocaleString(), icon: "⭐" },
          { label: "Streak", value: `${streak}d`, icon: "🔥" },
          { label: lang === "pt" ? "Tarefas" : "Tasks", value: tasksCompleted, icon: "✅" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            className="bg-card border border-border rounded-[var(--radius-md)] p-4 text-center"
            whileHover={{ borderColor: "rgba(204,0,0,0.5)", y: -2, boxShadow: "0 0 15px rgba(204,0,0,0.15)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-foreground tabular-nums">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Navigation cards */}
      <motion.div
        className="bento-grid relative z-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {cards.map((c, i) => (
          <Link key={c.to} to={c.to} className="block group">
            <motion.div
              variants={staggerItem}
              whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(204,0,0,0.3)" }}
              transition={{ duration: 0.2 }}
            >
              <BentoCard className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">{c.icon}</div>
                  {c.badge && (
                    <motion.span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        c.badge === "NOVO"
                          ? "text-primary bg-primary/10 border border-primary/30"
                          : c.badge.startsWith("🔥")
                          ? "text-warning bg-warning/10"
                          : "text-primary bg-primary/10"
                      }`}
                      animate={c.badge === "NOVO" ? { opacity: [1, 0.5, 1] } : {}}
                      transition={c.badge === "NOVO" ? { duration: 2, repeat: Infinity } : {}}
                    >
                      {c.badge}
                    </motion.span>
                  )}
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight">{c.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-arch-primary opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                  {c.cta} <span>→</span>
                </div>
              </BentoCard>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <motion.section
          className="mt-12 rounded-2xl border border-border bg-card p-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
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
        </motion.section>
      )}
    </div>
  );
}
