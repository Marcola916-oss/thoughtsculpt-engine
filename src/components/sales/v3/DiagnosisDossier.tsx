import { useEffect, useRef, useState } from "react";
import { Coins, Briefcase, Heart, User, Lock } from "lucide-react";
import type { Archetype } from "@/lib/quiz/scoring";
import type { AreaScores } from "@/lib/funnel/area-scores";
import posterMoney from "@/assets/poster-money.jpg.asset.json";
import posterCareer from "@/assets/poster-career.jpg.asset.json";
import posterLove from "@/assets/poster-love.jpg.asset.json";
import posterPersonal from "@/assets/poster-personal.jpg.asset.json";

const POSTERS = {
  money: posterMoney.url,
  career: posterCareer.url,
  love: posterLove.url,
  personal: posterPersonal.url,
} as const;

type Area = keyof typeof POSTERS;

const AREA_META: Record<Area, { icon: typeof Coins }> = {
  money: { icon: Coins },
  career: { icon: Briefcase },
  love: { icon: Heart },
  personal: { icon: User },
};

export type DossierCopy = {
  caseLabel: string;
  subjectLabel: string;
  confidential: string;
  indexLabel: string;
  indexCaption: string;
  fileLabel: string;
  scoreLabel: string;
  severityLabel: string;
  severity: { low: string; moderate: string; critical: string };
  triggerLabel: string;
  frequencyLabel: string;
  impactLabel: string;
  frequency: { daily: string; weekly: string; sporadic: string };
  impact: { high: string; medium: string; low: string };
  triggers: { AO: string; SS: string; EA: string; HI: string };
  verdictLabel: string;
  verdictPivot: string;
};

type Feature = { title: string; description: string };

type Props = {
  archetype: Archetype;
  displayName: string;
  areaScores: AreaScores;
  features: Feature[];
  copy: DossierCopy;
  areaOrder: Area[];
};

function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSeen(true);
            io.disconnect();
          }
        });
      },
      { threshold },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen, threshold]);
  return { ref, seen };
}

function useCounter(target: number, active: boolean, duration = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return n;
}

function severityFor(score: number, copy: DossierCopy) {
  if (score >= 71) return copy.severity.critical;
  if (score >= 41) return copy.severity.moderate;
  return copy.severity.low;
}

function frequencyFor(score: number, copy: DossierCopy) {
  if (score >= 71) return copy.frequency.daily;
  if (score >= 41) return copy.frequency.weekly;
  return copy.frequency.sporadic;
}

function impactFor(score: number, copy: DossierCopy) {
  if (score >= 71) return copy.impact.high;
  if (score >= 41) return copy.impact.medium;
  return copy.impact.low;
}

function CornerBrackets() {
  const color = "color-mix(in oklab, var(--arch-primary) 55%, transparent)";
  const cls = "pointer-events-none absolute h-4 w-4";
  return (
    <>
      <span className={`${cls} left-2 top-2 border-l border-t`} style={{ borderColor: color }} />
      <span className={`${cls} right-2 top-2 border-r border-t`} style={{ borderColor: color }} />
      <span className={`${cls} left-2 bottom-2 border-l border-b`} style={{ borderColor: color }} />
      <span className={`${cls} right-2 bottom-2 border-r border-b`} style={{ borderColor: color }} />
    </>
  );
}

function CompositeRing({ value, size = 168 }: { value: number; size?: number }) {
  const { ref, seen } = useInView<HTMLDivElement>(0.5);
  const displayed = useCounter(value, seen);
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const pct = seen ? Math.max(0, Math.min(1, value / 100)) : 0;
  return (
    <div ref={ref} className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={6}
          className="stroke-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={6}
          strokeLinecap="round"
          stroke="var(--arch-primary)"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{
            transition: "stroke-dashoffset 1400ms cubic-bezier(0.22,1,0.36,1)",
            filter: "drop-shadow(0 0 12px var(--arch-glow, rgba(204,0,0,0.55)))",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display text-5xl font-extrabold tabular-nums leading-none"
          style={{ color: "var(--arch-primary)" }}
        >
          {displayed}
        </span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
          / 100
        </span>
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const { ref, seen } = useInView<HTMLDivElement>(0.4);
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div
      ref={ref}
      className="relative h-1.5 w-full overflow-hidden rounded-full"
      style={{ background: "color-mix(in oklab, var(--arch-primary) 12%, rgba(255,255,255,0.05))" }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: seen ? `${pct}%` : "0%",
          background:
            "linear-gradient(90deg, var(--arch-primary), color-mix(in oklab, var(--arch-primary) 65%, white))",
          boxShadow: "0 0 12px var(--arch-glow, rgba(204,0,0,0.5))",
          transition: "width 1200ms cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </div>
  );
}

function DossierCard({
  index,
  area,
  feature,
  score,
  archetype,
  copy,
  total,
}: {
  index: number;
  area: Area;
  feature: Feature;
  score: number;
  archetype: Archetype;
  copy: DossierCopy;
  total: number;
}) {
  const Icon = AREA_META[area].icon;
  const trigger = copy.triggers[archetype];
  const freq = frequencyFor(score, copy);
  const impact = impactFor(score, copy);
  const sev = severityFor(score, copy);
  const pad2 = (n: number) => n.toString().padStart(2, "0");
  return (
    <article
      className="group relative overflow-hidden rounded-3xl border bg-black/60 transition-all duration-500 hover:-translate-y-1"
      style={{
        borderColor: "color-mix(in oklab, var(--arch-primary) 22%, rgba(255,255,255,0.08))",
        boxShadow:
          "0 30px 80px -40px color-mix(in oklab, var(--arch-primary) 55%, transparent), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* File chip */}
      <span
        className="absolute end-4 top-4 z-10 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] tabular-nums backdrop-blur-md"
        style={{
          background: "color-mix(in oklab, var(--arch-primary) 22%, rgba(0,0,0,0.55))",
          borderColor: "color-mix(in oklab, var(--arch-primary) 55%, transparent)",
          color: "white",
        }}
      >
        {copy.fileLabel} {pad2(index + 1)}/{pad2(total)}
      </span>

      {/* Poster with fade-to-black mask */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={POSTERS[area]}
          alt=""
          loading="lazy"
          width={1024}
          height={576}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          style={{
            WebkitMaskImage:
              "linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)",
            maskImage: "linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(ellipse at 30% 30%, color-mix(in oklab, var(--arch-primary) 40%, transparent) 0%, transparent 65%)",
          }}
        />
        {/* Icon badge top-left */}
        <span
          className="absolute start-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md"
          style={{
            background: "rgba(0,0,0,0.6)",
            borderColor: "color-mix(in oklab, var(--arch-primary) 45%, transparent)",
            color: "var(--arch-primary)",
          }}
        >
          <Icon size={16} strokeWidth={2.2} />
        </span>
      </div>

      {/* Body */}
      <div className="relative -mt-2 space-y-4 p-5 sm:p-6 text-start">
        <h3
          className="font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-[26px]"
        >
          {feature.title}
        </h3>

        {/* Score block */}
        <div
          className="rounded-2xl border p-3 sm:p-4"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "color-mix(in oklab, var(--arch-primary) 18%, rgba(255,255,255,0.06))",
          }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-display text-4xl font-extrabold tabular-nums leading-none sm:text-5xl"
                style={{ color: "var(--arch-primary)" }}
              >
                {score}
              </span>
              <span className="font-mono text-xs text-white/45">/ 100</span>
            </div>
            <span
              className="rounded-full px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{
                background: "color-mix(in oklab, var(--arch-primary) 16%, transparent)",
                color: "var(--arch-primary)",
              }}
            >
              {copy.severityLabel}: {sev}
            </span>
          </div>
          <div className="mt-3">
            <ScoreBar score={score} />
          </div>
        </div>

        {/* Diagnosis text */}
        <p className="text-sm leading-relaxed text-white/75">{feature.description}</p>

        {/* Metadata */}
        <ul className="space-y-1.5 border-t border-white/[0.06] pt-3 font-mono text-[11px] text-white/55">
          <li className="flex items-center gap-2">
            <span
              className="inline-block h-1 w-1 rounded-full"
              style={{ background: "var(--arch-primary)" }}
            />
            <span className="uppercase tracking-wider text-white/45">{copy.triggerLabel}:</span>
            <span className="text-white/80">{trigger}</span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className="inline-block h-1 w-1 rounded-full"
              style={{ background: "var(--arch-primary)" }}
            />
            <span className="uppercase tracking-wider text-white/45">{copy.frequencyLabel}:</span>
            <span className="text-white/80">{freq}</span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className="inline-block h-1 w-1 rounded-full"
              style={{ background: "var(--arch-primary)" }}
            />
            <span className="uppercase tracking-wider text-white/45">{copy.impactLabel}:</span>
            <span className="text-white/80">{impact}</span>
          </li>
        </ul>
      </div>
    </article>
  );
}

export function DiagnosisDossier({
  archetype,
  displayName,
  areaScores,
  features,
  copy,
  areaOrder,
}: Props) {
  const scores = areaOrder.map((a) => areaScores[a]);
  const composite = Math.round(scores.reduce((s, n) => s + n, 0) / scores.length);
  const primaryLabel = copy.triggers[archetype];
  void primaryLabel;

  return (
    <div className="relative w-full text-start">
      {/* Header strip */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border border-b-0 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.25em]"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--arch-primary) 18%, rgba(0,0,0,0.65)) 0%, rgba(0,0,0,0.65) 100%)",
          borderColor: "color-mix(in oklab, var(--arch-primary) 35%, rgba(255,255,255,0.08))",
          color: "color-mix(in oklab, var(--arch-primary) 90%, white)",
        }}
      >
        <span className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 animate-pulse rounded-full"
            style={{ background: "var(--arch-primary)" }}
          />
          {copy.caseLabel}
          <span className="text-white/30">·</span>
          <span className="text-white/70">
            {copy.subjectLabel}: <span className="text-white">{displayName || "—"}</span>
          </span>
        </span>
        <span className="flex items-center gap-2 text-white/50">
          <span className="tabular-nums">04/04</span>
          <span className="text-white/30">·</span>
          <Lock size={11} strokeWidth={2.4} className="opacity-70" />
          <span>{copy.confidential}</span>
        </span>
      </div>

      {/* Wrapper body */}
      <div
        className="relative rounded-b-2xl border p-5 sm:p-8"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--arch-primary) 8%, rgba(0,0,0,0.65)) 0%, rgba(0,0,0,0.75) 60%)",
          borderColor: "color-mix(in oklab, var(--arch-primary) 22%, rgba(255,255,255,0.06))",
        }}
      >
        {/* Grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-b-2xl opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
            backgroundSize: "3px 3px, 5px 5px",
          }}
        />

        {/* Hero metric */}
        <div
          className="relative mb-8 overflow-hidden rounded-2xl border p-6 sm:p-8"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, color-mix(in oklab, var(--arch-primary) 10%, rgba(0,0,0,0.55)) 100%)",
            borderColor: "color-mix(in oklab, var(--arch-primary) 30%, rgba(255,255,255,0.08))",
          }}
        >
          <CornerBrackets />
          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 text-center sm:text-start">
              <p
                className="font-mono text-[10px] font-bold uppercase tracking-[0.35em]"
                style={{ color: "var(--arch-primary)" }}
              >
                {copy.indexLabel}
              </p>
              <p className="mt-3 font-display text-lg font-bold leading-tight text-white sm:text-xl">
                {copy.indexCaption.replace(/\[PRIMARY\]/g, copy.triggers[archetype])}
              </p>
              {/* Tick scale */}
              <div
                aria-hidden
                className="mt-4 hidden h-2 items-end gap-[3px] sm:flex"
                style={{ color: "color-mix(in oklab, var(--arch-primary) 60%, transparent)" }}
              >
                {Array.from({ length: 40 }).map((_, i) => (
                  <span
                    key={i}
                    className="block w-px"
                    style={{
                      height: i % 5 === 0 ? "100%" : "50%",
                      background: "currentColor",
                      opacity: i / 40 <= composite / 100 ? 0.9 : 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
            <CompositeRing value={composite} />
          </div>
        </div>

        {/* 4 Cards */}
        <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2">
          {areaOrder.map((area, i) => (
            <DossierCard
              key={area}
              index={i}
              area={area}
              feature={features[i] ?? { title: area, description: "" }}
              score={areaScores[area]}
              archetype={archetype}
              copy={copy}
              total={areaOrder.length}
            />
          ))}
        </div>

        {/* Verdict seal */}
        <div
          className="relative mt-8 overflow-hidden rounded-2xl border-l-4 bg-black/55 p-5 pl-6 sm:p-6 sm:pl-8"
          style={{
            borderLeftColor: "var(--arch-primary)",
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--arch-primary) 12%, rgba(0,0,0,0.6)) 0%, rgba(0,0,0,0.55) 100%)",
            boxShadow:
              "0 30px 80px -40px color-mix(in oklab, var(--arch-primary) 60%, transparent), inset 1px 0 0 var(--arch-primary)",
          }}
        >
          <p
            className="font-mono text-[10px] font-bold uppercase tracking-[0.4em]"
            style={{ color: "var(--arch-primary)" }}
          >
            {copy.verdictLabel}
          </p>
          <p className="mt-2 font-display text-xl font-extrabold leading-tight text-white sm:text-2xl">
            {copy.verdictPivot}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DiagnosisDossier;