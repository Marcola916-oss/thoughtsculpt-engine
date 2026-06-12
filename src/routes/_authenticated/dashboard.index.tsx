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
import { Logo, CircuitBrain } from "@/components/identity";

const ARCHETYPE_GRADIENTS: Record<Archetype, string> = {
  AO: "from-blue-600/30",
  SS: "from-amber-600/30",
  EA: "from-purple-600/30",
  HI: "from-red-600/30",
};


export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "Hub — MindReset" }] }),
  component: HubPage,
});

function HubPage() {
  const { t, lang } = useI18n();
  const fetchProfile = useServerFn(getMyProfile);
  
  const [isClient, setIsClient] = useState(false);
  const [streak, setStreak] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [tasksCompleted, setTasksCompleted] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasDiagnosis, setHasDiagnosis] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, error, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    retry: false,
    enabled: isClient,
  });

  useEffect(() => {
    if (!isClient) return;

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
  }, [isClient]);

  if (!isClient || isLoading) {
    return null; // Parent layout handles loading
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-bold text-primary">{t.dashboardErrors.failedLoad}</h2>
        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  const archetype = data?.profile?.archetype as Archetype | null | undefined;
  const name = data?.profile?.display_name ?? "";

  const cards = [
    { to: "/dashboard/diagnosis" as const, icon: "🧠", ...t.dashboard.hub.cards.diagnosis, badge: !hasDiagnosis ? t.dashboard.hub.badges.new : null },
    { to: "/dashboard/calendar" as const, icon: "📅", ...t.dashboard.hub.cards.calendar, badge: t.dashboard.hub.badges.today },
    { to: "/dashboard/compass" as const, icon: "🧭", ...t.dashboard.hub.cards.compass, badge: null },
    { to: "/dashboard/progress" as const, icon: "📈", ...t.dashboard.hub.cards.progress, badge: streak > 0 ? `🔥${streak}` : null },
  ];

  const hour = String(new Date().getHours());

  return (
    <div className="mx-auto max-w-5xl relative pb-20">
      <div className="absolute top-0 -right-20 w-64 h-64 bg-arch-primary/5 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Header with greeting + archetype banner */}
      <motion.header
        className="mb-12 relative z-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.p variants={staggerItem} className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-3">
          {t.dashboard.hub.greeting(hour)}{name ? `, ${name}` : ""}.
        </motion.p>
        <motion.h1 variants={staggerItem} className="mt-2 font-display text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter italic leading-[1.1] py-2">
          {archetype ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <span>{t.dashboard.hub.headingWithArchetype(ARCHETYPE_NAMES[archetype][lang])}</span>
                <div className="inline-flex items-center gap-2 mt-1">
                  <div className="h-10 w-10 border border-primary/20 bg-primary/5 rounded-xl flex items-center justify-center shadow-lg">
                    <CircuitBrain size={24} variant="mini" animated={false} withGlow={false} />
                  </div>
                </div>
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
            className={`mt-8 p-6 rounded-[var(--radius-xl)] bg-gradient-to-r ${ARCHETYPE_GRADIENTS[archetype]} to-transparent border border-white/5 md:backdrop-blur-xl relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Logo link={false} size="sm" className="opacity-40 grayscale" />
            </div>
            <p className="text-sm italic" style={{ color: "var(--arch-primary)" }}>
              &ldquo;{t.dashboard.hub.quotes[archetype]}&rdquo;
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
          { label: t.dashboard.hub.stats.points, value: points.toLocaleString(), icon: "⭐" },
          { label: t.dashboard.hub.stats.streak, value: `${streak}d`, icon: "🔥" },
          { label: t.dashboard.hub.stats.tasks, value: tasksCompleted, icon: "✅" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            className="bg-white/5 border border-white/5 md:backdrop-blur-md rounded-[var(--radius-xl)] p-5 text-center relative overflow-hidden group"
            whileHover={{ borderColor: "var(--arch-primary)", y: -2, boxShadow: "0 10px 30px -10px var(--arch-glow)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{stat.icon}</div>
            <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">{stat.label}</div>
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
                        c.badge === t.dashboard.hub.badges.new
                          ? "text-primary bg-primary/10 border border-primary/30"
                          : c.badge.startsWith("🔥")
                          ? "text-warning bg-warning/10"
                          : "text-primary bg-primary/10"
                      }`}
                      animate={c.badge === t.dashboard.hub.badges.new ? { opacity: [1, 0.5, 1] } : {}}
                      transition={c.badge === t.dashboard.hub.badges.new ? { duration: 2, repeat: Infinity } : {}}
                    >
                      {c.badge}
                    </motion.span>
                  )}
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight">{c.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {typeof c.desc === 'function' ? c.desc(0) : c.desc}
                </p>
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
          className="mt-16 rounded-[var(--radius-xl)] border border-white/5 bg-white/5 md:backdrop-blur-xl p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-arch-primary/5 blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="font-display text-xl font-black italic tracking-tighter uppercase">{t.dashboard.hub.recentActivity.title}</h3>
            <Link to="/dashboard/progress" className="text-[10px] font-black uppercase tracking-widest text-arch-primary hover:underline">{t.dashboard.hub.recentActivity.viewAll} →</Link>
          </div>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-4 rounded-2xl bg-white/5 border border-white/5 p-5 transition-all hover:bg-white/10 group">
                <span className="text-2xl transition-transform group-hover:scale-110">{n.icon || "🔔"}</span>
                <div>
                  <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{n.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground/80 leading-relaxed font-medium">{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
