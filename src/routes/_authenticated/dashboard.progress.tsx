import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

import { getProgressData, getAchievements } from "../../lib/progress.functions";
import { claimAchievementReward } from "../../lib/rewards.functions";
import { useI18n } from "../../lib/i18n/LanguageProvider";
import type { Dict } from "../../lib/i18n/translations";
import { StreakCounter } from "../../components/gamification/StreakCounter";
import { AchievementUnlock } from "../../components/gamification/AchievementUnlock";
import { numberRollUp, achievementPop } from "../../lib/animations";

export const Route = createFileRoute("/_authenticated/dashboard/progress")({
  head: () => ({ meta: [{ title: "Evolution — MindReset" }] }),
  component: ProgressPage,
});

type Report = {
  month_number: number;
  consistency_score: number | null;
  summary: string | null;
  pattern_observed: string | null;
  next_focus: string | null;
  motivational_close: string | null;
  generated_at: string;
};

function consistencyBadge(score: number | null, t: Dict): { label: string; color: string } {
  if (!score || score < 30) return { label: t.dashboard.progress.consistencyBadge.beginner, color: "text-muted-foreground" };
  if (score < 50) return { label: t.dashboard.progress.consistencyBadge.constant, color: "text-warning" };
  if (score < 75) return { label: t.dashboard.progress.consistencyBadge.disciplined, color: "text-primary" };
  if (score < 90) return { label: t.dashboard.progress.consistencyBadge.unstoppable, color: "text-success" };
  return { label: t.dashboard.progress.consistencyBadge.master, color: "text-success" };
}

function ReportModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const { t, locale } = useI18n();
  const badge = consistencyBadge(report.consistency_score, t);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-border transition"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t.dashboard.progress.report.monthlyReportLabel(report.month_number)}
              </p>
              <h2 className="font-display text-2xl font-extrabold">{t.dashboard.progress.report.behavioralEvolution}</h2>
            </div>
          </div>

          {/* Consistency Score */}
          {report.consistency_score != null && (
            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-background p-5">
              <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 border-primary shadow-[0_0_20px_rgba(204,0,0,0.35)]">
                <span className="font-display text-2xl font-extrabold text-primary">
                  {report.consistency_score}
                </span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Score</span>
              </div>
              <div>
                <p className={`font-display text-lg font-extrabold ${badge.color}`}>{badge.label}</p>
                <p className="mt-1 text-sm text-muted-foreground leading-snug">
                  {t.dashboard.progress.report.scoreDescription(report.consistency_score)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Summary */}
          {report.summary && (
            <div className="rounded-xl border border-border bg-background p-5">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                📈 {t.dashboard.progress.report.monthAnalysis}
              </h3>
              <p className="text-sm leading-relaxed text-foreground">{report.summary}</p>
            </div>
          )}

          {/* Pattern */}
          {report.pattern_observed && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                🔍 {t.dashboard.progress.report.patternIdentified}
              </h3>
              <p className="text-sm leading-relaxed text-foreground">{report.pattern_observed}</p>
            </div>
          )}

          {/* Next Focus */}
          {report.next_focus && (
            <div className="rounded-xl border border-success/20 bg-success/5 p-5">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-success">
                🎯 {t.dashboard.progress.report.nextMonthFocus}
              </h3>
              <p className="text-sm leading-relaxed text-foreground">{report.next_focus}</p>
            </div>
          )}

          {/* Motivational close */}
          {report.motivational_close && (
            <blockquote className="border-l-4 border-primary pl-5 italic text-muted-foreground">
              "{report.motivational_close}"
            </blockquote>
          )}

          <p className="text-xs text-muted-foreground">
            {t.dashboard.progress.report.generatedOn} {new Date(report.generated_at).toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgressPage() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const fetchProgress = useServerFn(getProgressData);
  const fetchAchievs = useServerFn(getAchievements);
  const claimReward = useServerFn(claimAchievementReward);

  const [showReport, setShowReport] = useState(false);
  const [unclaimedAch, setUnclaimedAch] = useState<any | null>(null);

  const { data: progData, isLoading: isLoadingProg } = useQuery({
    queryKey: ["progress-data"],
    queryFn: () => fetchProgress(),
  });

  const { data: achievs, isLoading: isLoadingAchievs } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => fetchAchievs(),
  });

  // Detect unclaimed achievements on page load or achievs update
  useEffect(() => {
    if (achievs) {
      const unclaimed = achievs.find((a) => !a.is_claimed);
      if (unclaimed) {
        setUnclaimedAch(unclaimed);
      }
    }
  }, [achievs]);

  if (isLoadingProg || isLoadingAchievs) {
    return <div className="h-64 animate-pulse rounded-2xl bg-card" />;
  }

  const p = progData?.progress;
  const streak = p?.streak_days || 0;
  const longestStreak = p?.longest_streak || 0;
  const points = p?.total_points || 0;
  const tasks = progData?.tasks || [];
  const report = progData?.report as Report | null | undefined;

  const ALL_ACHIEVEMENTS = [
    { code: "ACH_001", name: t.dashboard.progress.achievements.ACH_001.name, desc: t.dashboard.progress.achievements.ACH_001.desc, icon: "🏆", points: 25 },
    { code: "ACH_002", name: t.dashboard.progress.achievements.ACH_002.name, desc: t.dashboard.progress.achievements.ACH_002.desc, icon: "🔥", points: 75 },
    { code: "ACH_003", name: t.dashboard.progress.achievements.ACH_003.name, desc: t.dashboard.progress.achievements.ACH_003.desc, icon: "📤", points: 25 },
    { code: "ACH_004", name: t.dashboard.progress.achievements.ACH_004.name, desc: t.dashboard.progress.achievements.ACH_004.desc, icon: "⚡", points: 100 },
    { code: "ACH_005", name: t.dashboard.progress.achievements.ACH_005.name, desc: t.dashboard.progress.achievements.ACH_005.desc, icon: "⚖️", points: 80 },
    { code: "ACH_006", name: t.dashboard.progress.achievements.ACH_006.name, desc: t.dashboard.progress.achievements.ACH_006.desc, icon: "👑", points: 200 },
  ];

  const unclaimedDetails = unclaimedAch
    ? ALL_ACHIEVEMENTS.find((aa) => aa.code === unclaimedAch.achievement_code)
    : null;

  const handleClaimReward = async (id: string) => {
    try {
      await claimReward({ data: { achievement_id: id } });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ["progress-data"] });
      setUnclaimedAch(null);
    } catch (e) {
      console.error("Error claiming reward:", e);
    }
  };

  // Donut chart
  const nextRewardTier = Math.ceil((points + 1) / 500) * 500;
  const chartData = [
    { name: "Points", value: points },
    { name: "Remaining", value: Math.max(nextRewardTier - points, 0) },
  ];
  const COLORS = ["var(--color-primary)", "var(--color-border)"];

  // Consistency grid cell mapper
  const gridCells = Array.from({ length: Math.max(30, tasks.length) }, (_, i) => {
    const day = i + 1;
    const task = tasks.find((task) => task.day_number === day);
    if (!task) return { state: "locked", day };
    if (task.is_completed && task.is_milestone) return { state: "milestone", day };
    if (task.is_completed) return { state: "complete", day };
    return { state: "pending", day };
  });

  function cellClass(state: string) {
    switch (state) {
      case "complete":
        return "bg-success/80 border-success/50 shadow-[0_0_4px_rgba(34,197,94,0.4)]";
      case "milestone":
        return "bg-primary shadow-[0_0_12px_rgba(204,0,0,0.4)] border-primary/60";
      case "pending":
        return "bg-secondary/60 border-border";
      case "locked":
      default:
        return "bg-card/20 border-border/40";
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Achievement Unlock Modal */}
      <AnimatePresence>
        {unclaimedAch && unclaimedDetails && (
          <AchievementUnlock
            achievement={{
              code: unclaimedDetails.code,
              name: unclaimedDetails.name,
              desc: unclaimedDetails.desc,
              icon: unclaimedDetails.icon
            }}
            onClose={() => setUnclaimedAch(null)}
          />
        )}
      </AnimatePresence>

      {/* Report Modal */}
      {showReport && report && (
        <ReportModal report={report} onClose={() => setShowReport(false)} />
      )}

      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">{t.dashboard.progress.pageTitle}</h1>
        <p className="mt-2 text-muted-foreground">{t.dashboard.progress.pageSubtitle}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Widget 1: Streak */}
        <StreakCounter streak={streak} longestStreak={longestStreak} />

        {/* Widget 2: Points donut */}
        <div className="relative flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 shadow-sm overflow-hidden">
          <div className="h-32 w-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  stroke="none"
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={points}
                variants={numberRollUp}
                initial="hidden"
                animate="visible"
                className="font-display text-2xl font-bold"
              >
                {points}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] uppercase text-muted-foreground">{t.dashboard.progress.points.label}</span>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {t.dashboard.progress.points.nextReward(nextRewardTier - points)}
          </p>
        </div>

        {/* Widget 3: Monthly Report */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div>
            <div className="mb-3 text-3xl">📊</div>
            <h2 className="font-display text-xl font-bold">{t.dashboard.progress.report.widgetTitle}</h2>
            {report ? (
              <>
                <div className="mt-2 flex items-center gap-2">
                  {report.consistency_score != null && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {report.consistency_score}% {t.dashboard.progress.consistencyGrid.title.toLowerCase()}
                    </span>
                  )}
                  <span className={`text-xs font-bold ${consistencyBadge(report.consistency_score ?? null, t).color}`}>
                    {consistencyBadge(report.consistency_score ?? null, t).label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {report.summary ?? t.dashboard.progress.report.readyFallback}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {t.dashboard.progress.report.notYetAvailable}
              </p>
            )}
          </div>
          {report ? (
            <button
              onClick={() => setShowReport(true)}
              className="mt-4 w-full rounded-lg bg-primary/10 px-4 py-2 font-semibold text-primary transition hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(204,0,0,0.25)]"
            >
              {t.dashboard.progress.report.viewFull}
            </button>
          ) : (
            <div className="mt-4 rounded-lg bg-secondary px-4 py-2 text-center text-sm font-semibold text-muted-foreground">
              {t.dashboard.progress.report.comingSoon}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Consistency Grid */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-1 font-display text-lg font-bold">{t.dashboard.progress.consistencyGrid.title}</h3>
          <p className="mb-5 text-xs text-muted-foreground">
            {t.dashboard.progress.consistencyGrid.completedDays(tasks.filter((task) => task.is_completed).length, tasks.length)}
          </p>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
            {gridCells.map(({ state, day }) => (
              <motion.div
                key={day}
                whileHover={{ scale: 1.15 }}
                title={`${t.dashboard.progress.consistencyGrid.dayLabel} ${day} — ${state === "complete" ? t.dashboard.progress.consistencyGrid.stateCompleted : state === "milestone" ? t.dashboard.progress.consistencyGrid.stateMilestone : state === "pending" ? t.dashboard.progress.consistencyGrid.statePending : t.dashboard.progress.consistencyGrid.stateLocked}`}
                className={`aspect-square rounded-sm border cursor-help transition-all duration-300 ${cellClass(state)}`}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-card/20 border border-border/40" />
              {t.dashboard.progress.consistencyGrid.legendLocked}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-secondary/60 border border-border" />
              {t.dashboard.progress.consistencyGrid.legendPending}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-success/80 border border-success/50" />
              {t.dashboard.progress.consistencyGrid.legendCompleted}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-primary border border-primary/60" />
              {t.dashboard.progress.consistencyGrid.legendMilestone}
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-display text-lg font-bold">{t.dashboard.progress.achievements.title}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {ALL_ACHIEVEMENTS.map((a, i) => {
              const unlocked = achievs?.find((dbA) => dbA.achievement_code === a.code);
              return (
                <motion.div
                  key={a.code}
                  variants={achievementPop}
                  initial={unlocked ? "hidden" : "visible"}
                  animate="visible"
                  className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${
                    unlocked
                      ? "border-primary/30 bg-primary/5 shadow-[0_0_15px_var(--accent-glow)]"
                      : "border-border bg-background opacity-60 grayscale"
                  }`}
                >
                  <div className="text-2xl">{unlocked ? a.icon : "🔒"}</div>
                  <div>
                    <h4 className={`text-sm font-bold ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                      {a.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      {unlocked ? t.dashboard.progress.achievements.unlocked : a.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
