import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  listCalendar,
  generateCalendar,
  toggleTaskComplete,
  saveTaskNote,
  markCalendarExported,
} from "../../lib/calendar.functions";
import { useI18n } from "../../lib/i18n/LanguageProvider";
import { TaskCheckbox } from "../../components/calendar/TaskCheckbox";

export const Route = createFileRoute("/_authenticated/dashboard/calendar")({
  head: () => ({ meta: [{ title: "Action Matrix — MindReset" }] }),
  component: CalendarPage,
});

// In-memory store for pending per-task checkbox states (resets on page refresh)
type CheckState = { reflective: boolean; action: boolean };
const pendingChecks: Record<string, CheckState> = {};

// Helper to safely access is_unlocked from server-enriched tasks
type TaskWithUnlock = { is_unlocked?: boolean; [key: string]: unknown };
const isUnlocked = (t: TaskWithUnlock) => t.is_unlocked === true;

function fireConfetti() {
  const count = 180;
  const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 100 };
  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  confetti({ ...defaults, particleCount: Math.floor(count * 0.25), origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ["#CC0000", "#ff4444", "#ffffff"] });
  confetti({ ...defaults, particleCount: Math.floor(count * 0.25), origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ["#CC0000", "#ff4444", "#ffffff"] });
  setTimeout(() => {
    confetti({ ...defaults, particleCount: Math.floor(count * 0.2), origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ["#ff8800", "#ffcc00", "#ffffff"] });
    confetti({ ...defaults, particleCount: Math.floor(count * 0.2), origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ["#ff8800", "#ffcc00", "#ffffff"] });
  }, 200);
}

function CalendarPage() {
  const { t } = useI18n();
  const list = useServerFn(listCalendar);
  const gen = useServerFn(generateCalendar);
  const toggle = useServerFn(toggleTaskComplete);
  const saveNoteFn = useServerFn(saveTaskNote);
  const markExported = useServerFn(markCalendarExported);
  const qc = useQueryClient();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  // Per-task checkbox states (in-memory)
  const [checks, setChecks] = useState<Record<string, CheckState>>({});

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["calendar"],
    queryFn: () => list(),
  });

  const handleMonthChange = (m: number) => {
    setSelectedMonth(m);
    const monthTasks = tasks.filter((task) => Math.ceil(task.day_number / 30) === m);
    const unlockedMonthTasks = monthTasks.filter((task) => isUnlocked(task));
    if (unlockedMonthTasks.length > 0) {
      const uncompleted = unlockedMonthTasks.find((task) => !task.is_completed);
      if (uncompleted) {
        setSelectedDay(uncompleted.day_number);
      } else {
        setSelectedDay(unlockedMonthTasks[unlockedMonthTasks.length - 1].day_number);
      }
    } else {
      setSelectedDay(null);
    }
  };

  const generate = useMutation({
    mutationFn: () => gen(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar"] }),
  });

  const toggleMut = useMutation({
    mutationFn: (vars: { task_id: string; is_completed: boolean }) => toggle({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar"] }),
  });

  const saveNoteMut = useMutation({
    mutationFn: (vars: { task_id: string; notes: string }) => saveNoteFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar"] }),
  });

  const markExportedMut = useMutation({
    mutationFn: (format: "csv" | "md" | "ics") => markExported({ data: { format } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar"] }),
  });

  // Handle checkbox change — only commit to DB when both are checked
  const handleCheck = useCallback(
    (taskId: string, field: "reflective" | "action", wasCompleted: boolean) => {
      if (wasCompleted) {
        // Already completed — unmark via the DB toggle
        toggleMut.mutate({ task_id: taskId, is_completed: false });
        setChecks((prev) => ({ ...prev, [taskId]: { reflective: false, action: false } }));
        return;
      }

      setChecks((prev) => {
        const current = prev[taskId] ?? { reflective: false, action: false };
        const next = { ...current, [field]: !current[field] };

        // If both are now checked → mark complete in DB and fire confetti
        if (next.reflective && next.action) {
          setTimeout(() => {
            toggleMut.mutate({ task_id: taskId, is_completed: true });
            fireConfetti();
            setChecks((prev) => {
              const newState = { ...prev };
              delete newState[taskId];
              return newState;
            });
          }, 300);
        }
        return { ...prev, [taskId]: next };
      });
    },
    [toggleMut],
  );

  // Auto-select first uncompleted unlocked day when tasks load
  useEffect(() => {
    if (tasks.length > 0 && selectedDay === null) {
      const firstUncompletedUnlocked = tasks.find((task) => isUnlocked(task) && !task.is_completed);
      if (firstUncompletedUnlocked) {
        setSelectedDay(firstUncompletedUnlocked.day_number);
        setSelectedMonth(Math.ceil(firstUncompletedUnlocked.day_number / 30));
      } else {
        const unlocked = tasks.filter((task) => isUnlocked(task));
        if (unlocked.length > 0) {
          const lastUnlocked = unlocked[unlocked.length - 1];
          setSelectedDay(lastUnlocked.day_number);
          setSelectedMonth(Math.ceil(lastUnlocked.day_number / 30));
        }
      }
    }
  }, [tasks, selectedDay]);

  if (isLoading) return <div className="h-64 max-w-4xl animate-pulse rounded-2xl bg-card" />;

  if (tasks.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center py-12">
        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 shadow-[0_0_40px_var(--accent-glow)]">
          <span className="text-6xl animate-pulse">📅</span>
        </div>
        <h1 className="font-display text-3xl font-bold">{t.dashboard.calendar.empty.heading}</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {t.dashboard.calendar.empty.description}
        </p>
        {generate.error && (
          <p className="mt-4 text-sm text-primary">{(generate.error as Error).message}</p>
        )}
        <button
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          className="mt-8 group relative overflow-hidden rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(204,0,0,0.45)] disabled:scale-100 disabled:opacity-50"
        >
          {generate.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              {t.dashboard.calendar.generating}
            </span>
          ) : (
            t.dashboard.calendar.generateButton
          )}
        </button>
      </div>
    );
  }

  const active = tasks.find((task) => task.day_number === selectedDay);
  const totalMonths = Math.ceil(tasks.length / 30);
  const visibleTasks = tasks.filter((task) => Math.ceil(task.day_number / 30) === selectedMonth);
  const activeChecks = active ? (checks[active.id] ?? { reflective: false, action: false }) : null;

  const exportCSV = () => {
    const header = `${t.dashboard.calendar.export.csvHeader}\n`;
    const rows = tasks
      .filter((task) => isUnlocked(task))
      .map(
        (task) =>
          `${task.day_number},${task.phase},${task.is_milestone ? t.dashboard.calendar.export.yes : t.dashboard.calendar.export.no},"${task.reflective_task?.replace(/"/g, '""') || ""}","${task.action_task?.replace(/"/g, '""') || ""}",${task.is_completed ? t.dashboard.calendar.export.yes : t.dashboard.calendar.export.no}`,
      )
      .join("\n");
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mindreset_action_matrix.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
    markExportedMut.mutate("csv");
  };

  const exportMD = () => {
    const md =
      t.calendarExportLabels.markdownHeader +
      tasks
        .filter((task) => isUnlocked(task))
        .map(
          (task) =>
            `## ${t.dashboard.calendar.export.markdownDay(task.day_number)} (${task.phase})${task.is_milestone ? " ⭐" : ""}\n- [${task.is_completed ? "x" : " "}] **${t.dashboard.calendar.export.markdownReflection}:** ${task.reflective_task}\n- [${task.is_completed ? "x" : " "}] **${t.dashboard.calendar.export.markdownAction}:** ${task.action_task}\n`,
        )
        .join("\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mindreset_action_matrix.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
    markExportedMut.mutate("md");
  };

  const exportICS = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const fmtDate = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//MindReset//Action Matrix//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:" + t.dashboard.calendar.ics.calName,
    ];

    tasks
      .filter((task) => isUnlocked(task))
      .forEach((task) => {
        const dt = new Date(now);
        dt.setDate(dt.getDate() + (task.day_number - 1));
        dt.setHours(9, 0, 0, 0);
        const dtEnd = new Date(dt);
        dtEnd.setHours(9, 30, 0, 0);

        const uid = `mindreset-day-${task.day_number}@mindreset.app`;
        const summary = t.dashboard.calendar.ics.daySummary(task.day_number, task.phase || "");
        const description = [
          task.reflective_task ? `${t.dashboard.calendar.ics.reflective}: ${task.reflective_task}` : "",
          task.action_task ? `${t.dashboard.calendar.ics.action}: ${task.action_task}` : "",
          task.is_milestone ? t.dashboard.calendar.ics.milestone : "",
        ]
          .filter(Boolean)
          .join("\\n");

        lines.push(
          "BEGIN:VEVENT",
          `UID:${uid}`,
          `DTSTART:${fmtDate(dt)}`,
          `DTEND:${fmtDate(dtEnd)}`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${description}`,
          "STATUS:CONFIRMED",
          "BEGIN:VALARM",
          "TRIGGER:-PT15M",
          "ACTION:DISPLAY",
          "DESCRIPTION:" + t.dashboard.calendar.ics.alarmDesc,
          "END:VALARM",
          "END:VEVENT",
        );
      });

    lines.push("END:VCALENDAR");

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mindreset_action_matrix.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
    markExportedMut.mutate("ics");
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_400px]">
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-display text-3xl font-extrabold">{t.dashboard.calendar.pageTitle}</h1>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary hover:shadow-[0_0_15px_rgba(204,0,0,0.25)] transition"
            >
              📥 {t.dashboard.calendar.export.button}
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-xl z-10">
                <button
                  onClick={exportCSV}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
                >
                  {t.dashboard.calendar.export.csvOption}
                </button>
                <button
                  onClick={exportMD}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
                >
                   {t.calendarExportLabels.markdownOption}
                </button>
                <button
                  onClick={exportICS}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
                >
                   {t.calendarExportLabels.icsOption}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Month Tabs pagination */}
        {totalMonths > 1 && (
          <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
            {Array.from({ length: totalMonths }).map((_, idx) => {
              const m = idx + 1;
              return (
                <button
                  key={m}
                  onClick={() => handleMonthChange(m)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    selectedMonth === m
                      ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(204,0,0,0.45)] font-bold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {t.dashboard.calendar.monthTab(m)}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-5 gap-3 md:grid-cols-7">
          {visibleTasks.map((task, i) => {
            const taskUnlocked = isUnlocked(task);
            const isActive = task.day_number === selectedDay;
            return (
              <motion.button
                key={task.id}
                disabled={!taskUnlocked}
                onClick={() => taskUnlocked && setSelectedDay(task.day_number)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01, duration: 0.2, ease: "easeOut" }}
                whileHover={taskUnlocked ? { scale: 1.08, y: -2 } : {}}
                whileTap={taskUnlocked ? { scale: 0.95 } : {}}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl border transition-colors duration-300 ${
                  !taskUnlocked
                    ? "border-border bg-card/50 opacity-40 blur-[1px] cursor-not-allowed"
                    : isActive
                      ? "border-primary bg-primary/20 shadow-[0_0_15px_rgba(204,0,0,0.35)]"
                      : task.is_completed
                        ? "border-success/40 bg-success/10 text-success"
                        : task.is_milestone
                          ? "border-gold/50 bg-gold-surface"
                          : "border-border bg-card hover:border-primary/60"
                }`}
              >
                {taskUnlocked && task.is_milestone && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/20 via-transparent to-gold/10 pointer-events-none"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <div className="relative z-10 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {taskUnlocked ? t.dashboard.calendar.grid.dayLabel : t.dashboard.calendar.grid.lockedLabel}
                </div>
                <div
                  className={`relative z-10 font-display text-2xl font-bold ${isActive || task.is_completed ? "text-foreground" : ""}`}
                >
                  {taskUnlocked ? task.day_number : "🔒"}
                </div>
                {taskUnlocked && task.is_milestone && (
                  <motion.div
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] shadow-lg"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ⭐
                  </motion.div>
                )}
                {taskUnlocked && task.is_completed && (
                  <div className="absolute bottom-1 right-1 text-success text-xs">✓</div>
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col h-fit">
        {active ? (
          <>
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t.dashboard.calendar.sidebar.phaseLabel(active.phase ?? "")}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold">{t.dashboard.calendar.sidebar.dayHeading(active.day_number)}</h2>
              </div>
              {active.is_milestone && (
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                  {t.dashboard.calendar.sidebar.milestoneBadge}
                </span>
              )}
            </div>

            {/* Task content */}
            <div className="space-y-4">
              <div className={`rounded-xl border p-4 transition-all ${active.is_completed || activeChecks?.reflective ? "border-success/30 bg-success/5" : "border-border bg-background"}`}>
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.dashboard.calendar.reflectiveLabel}</div>
                <p className={`text-sm leading-relaxed ${active.is_completed || activeChecks?.reflective ? "text-foreground line-through opacity-70" : "text-foreground"}`}>
                  {active.reflective_task ?? ""}
                </p>
              </div>
              <div className={`rounded-xl border p-4 transition-all ${active.is_completed || activeChecks?.action ? "border-success/30 bg-success/5" : "border-border bg-background"}`}>
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.dashboard.calendar.actionLabel}</div>
                <p className={`text-sm leading-relaxed ${active.is_completed || activeChecks?.action ? "text-foreground line-through opacity-70" : "text-foreground"}`}>
                  {active.action_task ?? ""}
                </p>
              </div>
            </div>

            {/* Dual checkboxes */}
            {!active.is_completed && (
              <div className="mt-6 space-y-3 border-t border-border pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  {t.dashboard.calendar.checkboxes.instruction}
                </p>

                {/* Reflective checkbox */}
                <div className={`rounded-xl border p-4 transition-all ${
                  activeChecks?.reflective
                    ? "border-success/40 bg-success/10 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                    : "border-border bg-background hover:border-primary/40"
                }`}>
                  <TaskCheckbox
                    checked={activeChecks?.reflective ?? false}
                    onChange={() => handleCheck(active.id, "reflective", false)}
                    label={t.dashboard.calendar.checkboxes.reflectiveCompleted}
                    type="reflective"
                  />
                </div>

                {/* Action checkbox */}
                <div className={`rounded-xl border p-4 transition-all ${
                  activeChecks?.action
                    ? "border-success/40 bg-success/10 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                    : "border-border bg-background hover:border-primary/40"
                }`}>
                  <TaskCheckbox
                    checked={activeChecks?.action ?? false}
                    onChange={() => handleCheck(active.id, "action", false)}
                    label={t.dashboard.calendar.checkboxes.actionCompleted}
                    type="action"
                  />
                </div>

                {/* Progress indicator */}
                {(activeChecks?.reflective || activeChecks?.action) && !(activeChecks?.reflective && activeChecks?.action) && (
                  <p className="text-xs text-muted-foreground text-center animate-pulse">
                    {t.dashboard.calendar.checkboxes.almostThere}
                  </p>
                )}
              </div>
            )}

            {/* Already completed — show undo */}
            {active.is_completed && (
              <button
                onClick={() => {
                  toggleMut.mutate({ task_id: active.id, is_completed: false });
                  setChecks((prev) => ({ ...prev, [active.id]: { reflective: false, action: false } }));
                }}
                className="mt-6 w-full rounded-xl border border-border bg-background py-3 text-sm font-semibold text-muted-foreground transition hover:bg-secondary"
              >
                {t.dashboard.calendar.undoButton}
              </button>
            )}

            <div className="mt-6 border-t border-border pt-6">
              <label className="mb-2 block text-sm font-bold text-foreground">
                {t.dashboard.calendar.journal.label}
              </label>
              <textarea
                className="w-full min-h-[120px] rounded-xl border border-border bg-background p-3 text-sm outline-none transition focus:border-primary resize-y"
                placeholder={t.dashboard.calendar.journal.placeholder}
                defaultValue={active.notes ?? ""}
                onBlur={(e) => saveNoteMut.mutate({ task_id: active.id, notes: e.target.value })}
              />
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground py-12 opacity-50">
            <span className="text-4xl mb-4">👆</span>
            <p>{t.dashboard.calendar.emptyState.hint}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
