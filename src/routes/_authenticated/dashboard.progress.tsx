import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getProgressData, getAchievements } from "../../lib/progress.functions";

export const Route = createFileRoute("/_authenticated/dashboard/progress")({
  head: () => ({ meta: [{ title: "Progresso — MindReset" }] }),
  component: ProgressPage,
});

const ALL_ACHIEVEMENTS = [
  { code: "ACH_001", name: "Primeiro Passo", desc: "Completar o Dia 1 do protocolo.", icon: "🏆", points: 50 },
  { code: "ACH_002", name: "7 Dias de Reset", desc: "Completar 7 dias consecutivos.", icon: "🔥", points: 50 },
  { code: "ACH_003", name: "Exportador", desc: "Exportar seu calendário pela 1ª vez.", icon: "📥", points: 25 },
  { code: "ACH_004", name: "15 Dias Imparável", desc: "Manter o streak por 15 dias.", icon: "⚡", points: 100 },
  { code: "ACH_005", name: "Meio Caminho", desc: "Chegar ao Dia 15 do protocolo.", icon: "⚖️", points: 80 },
  { code: "ACH_006", name: "30 Days Complete", desc: "Completar os primeiros 30 dias.", icon: "👑", points: 200 },
];

type Report = {
  month_number: number;
  consistency_score: number | null;
  summary: string | null;
  pattern_observed: string | null;
  next_focus: string | null;
  motivational_close: string | null;
  generated_at: string;
};

function consistencyBadge(score: number | null): { label: string; color: string } {
  if (!score || score < 30) return { label: "Iniciante", color: "text-muted-foreground" };
  if (score < 50) return { label: "Constante", color: "text-warning" };
  if (score < 75) return { label: "Disciplinado", color: "text-primary" };
  if (score < 90) return { label: "Imparável", color: "text-success" };
  return { label: "Mestre do Reset", color: "text-success" };
}

function ReportModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const badge = consistencyBadge(report.consistency_score);
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
                Relatório Mensal — Mês {report.month_number}
              </p>
              <h2 className="font-display text-2xl font-extrabold">Sua Evolução Comportamental</h2>
            </div>
          </div>

          {/* Consistency Score */}
          {report.consistency_score != null && (
            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-background p-5">
              <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 border-primary shadow-[0_0_20px_var(--accent-glow)]">
                <span className="font-display text-2xl font-extrabold text-primary">
                  {report.consistency_score}
                </span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Score</span>
              </div>
              <div>
                <p className={`font-display text-lg font-extrabold ${badge.color}`}>{badge.label}</p>
                <p className="mt-1 text-sm text-muted-foreground leading-snug">
                  Você completou <strong className="text-foreground">{report.consistency_score}%</strong> das tarefas deste mês. Continue nesse ritmo.
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
                📈 Análise do Mês
              </h3>
              <p className="text-sm leading-relaxed text-foreground">{report.summary}</p>
            </div>
          )}

          {/* Pattern */}
          {report.pattern_observed && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                🔍 Padrão Identificado
              </h3>
              <p className="text-sm leading-relaxed text-foreground">{report.pattern_observed}</p>
            </div>
          )}

          {/* Next Focus */}
          {report.next_focus && (
            <div className="rounded-xl border border-success/20 bg-success/5 p-5">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-success">
                🎯 Foco para o Próximo Mês
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
            Gerado em {new Date(report.generated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgressPage() {
  const fetchProgress = useServerFn(getProgressData);
  const fetchAchievs = useServerFn(getAchievements);
  const [showReport, setShowReport] = useState(false);

  const { data: progData, isLoading: isLoadingProg } = useQuery({
    queryKey: ["progress-data"],
    queryFn: () => fetchProgress(),
  });

  const { data: achievs, isLoading: isLoadingAchievs } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => fetchAchievs(),
  });

  if (isLoadingProg || isLoadingAchievs) {
    return <div className="h-64 animate-pulse rounded-2xl bg-card" />;
  }

  const p = progData?.progress;
  const streak = p?.streak_days || 0;
  const points = p?.total_points || 0;
  const tasks = progData?.tasks || [];
  const report = progData?.report as Report | null | undefined;

  // Donut chart
  const nextRewardTier = Math.ceil((points + 1) / 500) * 500;
  const chartData = [
    { name: "Points", value: points },
    { name: "Remaining", value: Math.max(nextRewardTier - points, 0) },
  ];
  const COLORS = ["var(--color-primary)", "var(--color-border)"];

  // Improved GitHub-style consistency grid
  // We display all tasks for a full overview, adding locked/unlocked visual states
  const gridCells = Array.from({ length: Math.max(30, tasks.length) }, (_, i) => {
    const day = i + 1;
    const task = tasks.find((t) => t.day_number === day);
    if (!task) return { state: "locked", day }; // No task entry = locked/not yet generated
    if (task.is_completed && task.is_milestone) return { state: "milestone", day };
    if (task.is_completed) return { state: "complete", day };
    return { state: "pending", day }; // unlocked but not completed
  });

  function cellClass(state: string) {
    switch (state) {
      case "complete":
        return "bg-success/80 border-success/50 shadow-[0_0_4px_rgba(34,197,94,0.4)]";
      case "milestone":
        return "bg-primary shadow-[0_0_8px_var(--accent-glow)] border-primary/60";
      case "pending":
        return "bg-secondary/60 border-border";
      case "locked":
      default:
        return "bg-card/20 border-border/40";
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Report Modal */}
      {showReport && report && (
        <ReportModal report={report} onClose={() => setShowReport(false)} />
      )}

      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Sua Evolução</h1>
        <p className="mt-2 text-muted-foreground">Acompanhe seu progresso, conquistas e relatórios de IA.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Widget 1: Streak */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mb-2 text-5xl">🔥</div>
          <h2 className="font-display text-4xl font-extrabold">{streak} dias</h2>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Streak Atual</p>
          {streak === 0 && (
            <p className="mt-4 rounded bg-warning/10 px-3 py-2 text-xs font-semibold text-warning">
              Complete uma tarefa hoje para iniciar sua sequência!
            </p>
          )}
        </div>

        {/* Widget 2: Points donut */}
        <div className="relative flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 shadow-sm">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold">{points}</span>
            <span className="text-[10px] uppercase text-muted-foreground">Pontos</span>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Faltam {nextRewardTier - points} pts para o próximo benefício
          </p>
        </div>

        {/* Widget 3: Monthly Report */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div>
            <div className="mb-3 text-3xl">📊</div>
            <h2 className="font-display text-xl font-bold">Relatório Mensal</h2>
            {report ? (
              <>
                <div className="mt-2 flex items-center gap-2">
                  {report.consistency_score != null && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {report.consistency_score}% consistência
                    </span>
                  )}
                  <span className={`text-xs font-bold ${consistencyBadge(report.consistency_score ?? null).color}`}>
                    {consistencyBadge(report.consistency_score ?? null).label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {report.summary ?? "Seu relatório deste mês está pronto."}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Seu relatório gerado por IA estará disponível após 30 dias de protocolo.
              </p>
            )}
          </div>
          {report ? (
            <button
              onClick={() => setShowReport(true)}
              className="mt-4 w-full rounded-lg bg-primary/10 px-4 py-2 font-semibold text-primary transition hover:bg-primary/20 hover:shadow-[0_0_10px_var(--accent-glow)]"
            >
              Ver Relatório Completo →
            </button>
          ) : (
            <div className="mt-4 rounded-lg bg-secondary px-4 py-2 text-center text-sm font-semibold text-muted-foreground">
              Em breve
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Consistency Grid */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-1 font-display text-lg font-bold">Consistência</h3>
          <p className="mb-5 text-xs text-muted-foreground">
            {tasks.filter((t) => t.is_completed).length} de {tasks.length} dias concluídos
          </p>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
            {gridCells.map(({ state, day }) => (
              <div
                key={day}
                title={`Dia ${day} — ${state === "complete" ? "Concluído" : state === "milestone" ? "Marco" : state === "pending" ? "Pendente" : "Bloqueado"}`}
                className={`aspect-square rounded-sm border transition-all duration-300 ${cellClass(state)}`}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-card/20 border border-border/40" />
              Bloqueado
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-secondary/60 border border-border" />
              Pendente
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-success/80 border border-success/50" />
              Concluído
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-primary border border-primary/60" />
              Marco
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Conquistas</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {ALL_ACHIEVEMENTS.map((a) => {
              const unlocked = achievs?.find((dbA) => dbA.achievement_code === a.code);
              return (
                <div
                  key={a.code}
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
                      {unlocked ? `Desbloqueado` : a.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
