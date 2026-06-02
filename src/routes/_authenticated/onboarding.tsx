import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { saveOnboarding } from "../../lib/profile.functions";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — MindReset" }] }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const save = useServerFn(saveOnboarding);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    wake_time: "07:00",
    sleep_time: "23:00",
    daily_minutes: 15,
    emotional_trigger: "",
    financial_goal: "",
    discipline_style: "",
    mobile_os: "none" as "ios" | "android" | "none",
  });

  const mut = useMutation({
    mutationFn: () => save({ data: form }),
    onSuccess: () => navigate({ to: "/dashboard" }),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    mut.mutate();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold">Calibrate your protocol</h1>
      <p className="mt-2 text-sm text-muted-foreground">7 quick questions so we can tailor your action matrix.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Row label="Wake time">
          <input type="time" value={form.wake_time} onChange={(e) => setForm({ ...form, wake_time: e.target.value })} className={inputCls} />
        </Row>
        <Row label="Sleep time">
          <input type="time" value={form.sleep_time} onChange={(e) => setForm({ ...form, sleep_time: e.target.value })} className={inputCls} />
        </Row>
        <Row label="Minutes per day you can commit">
          <input type="number" min={5} max={120} value={form.daily_minutes} onChange={(e) => setForm({ ...form, daily_minutes: Number(e.target.value) })} className={inputCls} />
        </Row>
        <Row label="What emotion triggers your spending?">
          <input required value={form.emotional_trigger} onChange={(e) => setForm({ ...form, emotional_trigger: e.target.value })} className={inputCls} placeholder="e.g. anxiety, boredom, celebration" />
        </Row>
        <Row label="Your #1 financial goal">
          <input required value={form.financial_goal} onChange={(e) => setForm({ ...form, financial_goal: e.target.value })} className={inputCls} placeholder="e.g. save 6 months emergency fund" />
        </Row>
        <Row label="How you stay disciplined">
          <input required value={form.discipline_style} onChange={(e) => setForm({ ...form, discipline_style: e.target.value })} className={inputCls} placeholder="e.g. strict rules / gentle nudges / rewards" />
        </Row>
        <Row label="Phone OS">
          <select value={form.mobile_os} onChange={(e) => setForm({ ...form, mobile_os: e.target.value as typeof form.mobile_os })} className={inputCls}>
            <option value="none">None / desktop only</option>
            <option value="ios">iOS</option>
            <option value="android">Android</option>
          </select>
        </Row>

        {mut.error && <p className="text-sm text-primary">{(mut.error as Error).message}</p>}
        <button disabled={mut.isPending} className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {mut.isPending ? "Saving…" : "Enter dashboard"}
        </button>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-card px-4 py-3 outline-none focus:border-primary";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}