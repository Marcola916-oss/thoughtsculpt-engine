import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getProgressData, getAchievements } from "../../lib/progress.functions";

export const Route = createFileRoute("/_authenticated/dashboard/progress")({
  head: () => ({ meta: [{ title: "Progress — MindReset" }] }),
  component: ProgressPage,
});

// A predefined list of possible achievements (in a real app this would be synced with the DB definitions)
const ALL_ACHIEVEMENTS = [
  { code: "ACH_001", name: "Primeiro Passo", desc: "Completar o Dia 1 do protocolo.", icon: "🏆", points: 50 },
  { code: "ACH_002", name: "7 Dias de Reset", desc: "Completar 7 dias consecutivos.", icon: "🔥", points: 50 },
  { code: "ACH_003", name: "Exportador", desc: "Exportar seu calendário pela 1ª vez.", icon: "📥", points: 25 },
  { code: "ACH_004", name: "15 Dias Imparável", desc: "Manter o streak por 15 dias.", icon: "⚡", points: 100 },
  { code: "ACH_005", name: "Meio Caminho", desc: "Chegar ao Dia 15 do protocolo.", icon: "⚖️", points: 80 },
  { code: "ACH_006", name: "30 Days Complete", desc: "Completar os primeiros 30 dias.", icon: "👑", points: 200 },
];

function ProgressPage() {
  const fetchProgress = useServerFn(getProgressData);
  const fetchAchievs = useServerFn(getAchievements);

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
  const report = progData?.report;

  // Donut chart logic for points until next reward
  const nextRewardTier = Math.ceil((points + 1) / 500) * 500;
  const chartData = [
    { name: "Points", value: points },
    { name: "Remaining", value: Math.max(nextRewardTier - points, 0) },
  ];
  const COLORS = ["var(--color-primary)", "var(--color-border)"];

  // Prepare consistency grid (GitHub style) - assume 30 slots for month 1
  const gridCells = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const task = tasks.find((t) => t.day_number === day);
    if (!task) return "empty";
    if (task.is_completed) return "complete";
    if (task.is_milestone) return "milestone";
    return "missed";
  });

  return (
    <div className="mx-auto max-w-5xl">
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

        {/* Widget 2: Points */}
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

        {/* Widget 5: Monthly Report */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div>
            <div className="mb-3 text-3xl">📊</div>
            <h2 className="font-display text-xl font-bold">Relatório Mensal</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {report 
                ? "Seu relatório de evolução deste mês já está disponível."
                : "Seu relatório gerado por IA estará disponível após 30 dias de protocolo."}
            </p>
          </div>
          {report ? (
            <button className="mt-4 w-full rounded-lg bg-primary/10 px-4 py-2 font-semibold text-primary transition hover:bg-primary/20">
              Ver Relatório
            </button>
          ) : (
            <div className="mt-4 rounded-lg bg-secondary px-4 py-2 text-center text-sm font-semibold text-muted-foreground">
              Em breve
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Widget 3: Consistency Grid */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Consistência (Mês 1)</h3>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
            {gridCells.map((state, i) => (
              <div
                key={i}
                className={`aspect-square rounded-sm border ${
                  state === "complete" ? "border-success/40 bg-success/80"
                  : state === "milestone" ? "border-primary/40 bg-primary"
                  : state === "missed" ? "border-border bg-secondary"
                  : "border-border bg-background"
                }`}
                title={`Dia ${i + 1}`}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-background border border-border" /> Pendente</div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-success/80 border border-success/40" /> Concluído</div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-primary border border-primary/40" /> Marco</div>
          </div>
        </section>

        {/* Widget 4: Achievements */}
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
                    <h4 className={`text-sm font-bold ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{a.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{unlocked ? `Desbloqueado` : a.desc}</p>
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
