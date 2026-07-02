import { useEffect, useRef, useState } from "react";

/**
 * ScienceDossier — editorial "peer-reviewed dossier" for the B3 science section.
 *
 * 7 layers (see .lovable/plan.md → B3 redesign):
 *   1. Header strip (i18n-safe: symbols + numbers only)
 *   2. Kicker + body lead
 *   3. Hero "95%" statistic with animated counter
 *   4. Authority cards — 3 scientists with monogram portraits
 *   5. Horizontal timeline of the field → product
 *   6. Authority seal (proofSeal)
 *   7. Verdict card (pivot + solution)
 *
 * Purely presentational. Copy stays in translations.ts (`salesV2.b3`).
 */

type Author = { name: string; credential: string; field: string };
type TimelineItem = { year: string; event: string };

type Props = {
  body: string;
  kicker?: string;
  heroPercent: string;
  heroCaption: string;
  heroSource: string;
  authorityLabel: string;
  authors: Author[];
  timelineLabel: string;
  timeline: TimelineItem[];
  proofSeal: string;
  verdictLabel: string;
  pivot: string;
  solution: string;
};

function useInViewOnce<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, seen };
}

function AnimatedNumber({ target }: { target: number }) {
  const { ref, seen } = useInViewOnce<HTMLSpanElement>(0.4);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setN(target);
      return;
    }
    const start = performance.now();
    const dur = 1100;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, target]);
  return (
    <span ref={ref} className="tabular-nums">
      {n}
    </span>
  );
}

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function ScienceDossier(props: Props) {
  const {
    body,
    kicker,
    heroPercent,
    heroCaption,
    heroSource,
    authorityLabel,
    authors,
    timelineLabel,
    timeline,
    proofSeal,
    verdictLabel,
    pivot,
    solution,
  } = props;

  const percentNumeric = parseInt(heroPercent, 10);
  const total = String(authors.length).padStart(2, "0");

  return (
    <div className="w-full">
      {/* 1. Header strip — coerência com PainDossier */}
      <div
        className="mb-10 flex items-center justify-center gap-4 border-y py-3 font-mono text-[10px] uppercase tracking-[0.4em] text-white/50"
        style={{ borderColor: "color-mix(in oklab, var(--arch-primary) 22%, transparent)" }}
      >
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
          style={{ background: "var(--arch-primary)", boxShadow: "0 0 8px var(--arch-primary)" }}
        />
        <span className="tracking-[0.5em]">PEER&nbsp;REVIEWED</span>
        <span aria-hidden className="text-white/25">·</span>
        <span>
          <span className="text-white">VOL</span>
          <span className="text-white/30"> 04</span>
        </span>
        <span aria-hidden className="text-white/25">·</span>
        <span className="tracking-[0.5em]">BEHAVIORAL&nbsp;SCIENCE</span>
      </div>

      {/* 2. Kicker + body lead */}
      {kicker && (
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.35em] text-white/55">
          {kicker}
        </p>
      )}
      <p className="max-w-3xl text-[17px] leading-[1.75] text-white/90">{body}</p>

      {/* 3. Hero 95% — momento wow */}
      <div
        className="relative mt-10 grid grid-cols-1 items-center gap-6 overflow-hidden rounded-2xl border p-6 sm:mt-12 sm:grid-cols-[auto_1fr] sm:gap-10 sm:p-10"
        style={{
          borderColor: "color-mix(in oklab, var(--arch-primary) 20%, rgba(255,255,255,0.08))",
          background:
            "linear-gradient(140deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.5) 60%, color-mix(in oklab, var(--arch-primary) 12%, transparent) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.05), 0 30px 80px -40px color-mix(in oklab, var(--arch-primary) 55%, transparent)",
        }}
      >
        <CornerBrackets />
        <div className="relative flex items-baseline">
          <span
            className="font-display font-extrabold leading-none tracking-tight"
            style={{
              fontSize: "clamp(88px, 14vw, 176px)",
              background:
                "linear-gradient(180deg, #fff 0%, color-mix(in oklab, var(--arch-primary) 85%, white) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter:
                "drop-shadow(0 8px 40px color-mix(in oklab, var(--arch-primary) 40%, transparent))",
            }}
          >
            {Number.isFinite(percentNumeric) ? <AnimatedNumber target={percentNumeric} /> : heroPercent}
          </span>
          <span
            className="ms-1 font-display text-4xl font-extrabold leading-none sm:text-6xl"
            style={{ color: "var(--arch-primary)" }}
          >
            %
          </span>
        </div>
        <div className="relative">
          <p className="text-[19px] font-medium leading-[1.55] text-white sm:text-[22px]">
            {heroCaption}
          </p>
          <p
            className="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-white/70"
            style={{ borderColor: "color-mix(in oklab, var(--arch-primary) 30%, transparent)" }}
          >
            <span aria-hidden>◆</span>
            {heroSource}
          </p>
        </div>
      </div>

      {/* 4. Authority — 3 scientists */}
      <div className="mt-12">
        <div className="mb-5 flex items-center gap-3">
          <span
            aria-hidden
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--arch-primary) 40%, transparent) 100%)",
            }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/55">
            {authorityLabel}
          </span>
          <span
            aria-hidden
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(90deg, color-mix(in oklab, var(--arch-primary) 40%, transparent) 0%, transparent 100%)",
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {authors.slice(0, 3).map((a, i) => (
            <article
              key={a.name}
              className="group/author relative overflow-hidden rounded-2xl border p-5 text-start transition-all duration-500 hover:-translate-y-1"
              style={{
                borderColor: "color-mix(in oklab, var(--arch-primary) 20%, rgba(255,255,255,0.08))",
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(0,0,0,0.45) 60%, color-mix(in oklab, var(--arch-primary) 8%, transparent) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 60px -30px color-mix(in oklab, var(--arch-primary) 45%, transparent)",
              }}
            >
              <CornerBrackets />
              <span
                aria-hidden
                className="absolute right-4 top-3 font-mono text-[10px] leading-none tracking-[0.2em] text-white/45"
              >
                <span className="text-white/75">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-white/25"> / {total}</span>
              </span>

              {/* Portrait frame — editorial monogram (safe from IP) */}
              <div
                className="relative mx-auto mt-3 grid aspect-square w-28 place-items-center overflow-hidden rounded-xl border sm:w-32"
                style={{
                  borderColor: "color-mix(in oklab, var(--arch-primary) 35%, transparent)",
                  background:
                    "radial-gradient(circle at 30% 25%, color-mix(in oklab, var(--arch-primary) 22%, transparent), transparent 65%), linear-gradient(160deg, rgba(255,255,255,0.04), rgba(0,0,0,0.6))",
                  boxShadow: "inset 0 0 40px -10px color-mix(in oklab, var(--arch-primary) 40%, transparent)",
                }}
              >
                {/* subtle scanlines for editorial feel */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-30 transition-opacity duration-500 group-hover/author:opacity-60"
                  style={{
                    background:
                      "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 4px)",
                  }}
                />
                <span
                  className="relative font-display text-5xl font-extrabold uppercase tracking-tight text-white transition-all duration-500 group-hover/author:scale-110 sm:text-6xl"
                  style={{
                    textShadow: "0 6px 30px color-mix(in oklab, var(--arch-primary) 60%, transparent)",
                  }}
                >
                  {monogram(a.name)}
                </span>
              </div>

              <div className="mt-5 text-center">
                <h4 className="font-display text-[15px] font-extrabold uppercase leading-tight tracking-[0.06em] text-white sm:text-base">
                  {a.name}
                </h4>
                <p
                  className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.28em]"
                  style={{ color: "color-mix(in oklab, var(--arch-primary) 85%, white)" }}
                >
                  {a.credential}
                </p>
                <p className="mt-3 text-[13px] leading-[1.5] text-white/70">{a.field}</p>
              </div>

              {/* Hover accent bar */}
              <span
                aria-hidden
                className="absolute inset-x-5 bottom-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 group-hover/author:scale-x-100"
                style={{
                  background: "linear-gradient(90deg, var(--arch-primary) 0%, transparent 100%)",
                  boxShadow: "0 0 12px var(--arch-primary)",
                }}
              />
            </article>
          ))}
        </div>
      </div>

      {/* 5. Timeline */}
      {timeline.length > 0 && (
        <div className="mt-12">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-white/55">
            {timelineLabel}
          </p>
          <div
            className="relative overflow-hidden rounded-2xl border p-6 sm:p-7"
            style={{
              borderColor: "color-mix(in oklab, var(--arch-primary) 18%, rgba(255,255,255,0.06))",
              background: "linear-gradient(120deg, rgba(0,0,0,0.4), rgba(0,0,0,0.15))",
            }}
          >
            {/* Desktop: horizontal */}
            <div className="hidden sm:block">
              <div className="relative">
                <span
                  aria-hidden
                  className="absolute left-0 right-0 top-[11px] h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--arch-primary) 55%, transparent) 15%, color-mix(in oklab, var(--arch-primary) 55%, transparent) 85%, transparent 100%)",
                  }}
                />
                <ul className="relative grid grid-cols-4 gap-4">
                  {timeline.map((t, i) => {
                    const isLast = i === timeline.length - 1;
                    return (
                      <li key={t.year + i} className="flex flex-col items-center text-center">
                        <span
                          aria-hidden
                          className={`relative h-[22px] w-[22px] rounded-full border-2 ${
                            isLast ? "animate-pulse" : ""
                          }`}
                          style={{
                            borderColor: "var(--arch-primary)",
                            background: isLast
                              ? "var(--arch-primary)"
                              : "color-mix(in oklab, var(--arch-primary) 25%, #000)",
                            boxShadow: isLast
                              ? "0 0 20px var(--arch-primary)"
                              : "0 0 10px color-mix(in oklab, var(--arch-primary) 40%, transparent)",
                          }}
                        />
                        <span
                          className="mt-3 font-display text-lg font-extrabold tracking-tight text-white"
                          style={{
                            color: isLast ? "var(--arch-primary)" : undefined,
                          }}
                        >
                          {t.year}
                        </span>
                        <span className="mt-1 text-[12px] leading-tight text-white/70">
                          {t.event}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Mobile: vertical */}
            <ul className="relative space-y-4 sm:hidden">
              <span
                aria-hidden
                className="absolute left-[10px] top-2 bottom-2 w-px"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in oklab, var(--arch-primary) 55%, transparent), transparent)",
                }}
              />
              {timeline.map((t, i) => {
                const isLast = i === timeline.length - 1;
                return (
                  <li key={t.year + i} className="relative flex items-start gap-4 ps-1">
                    <span
                      aria-hidden
                      className={`mt-1 h-[18px] w-[18px] shrink-0 rounded-full border-2 ${
                        isLast ? "animate-pulse" : ""
                      }`}
                      style={{
                        borderColor: "var(--arch-primary)",
                        background: isLast
                          ? "var(--arch-primary)"
                          : "color-mix(in oklab, var(--arch-primary) 25%, #000)",
                        boxShadow: isLast
                          ? "0 0 16px var(--arch-primary)"
                          : "0 0 8px color-mix(in oklab, var(--arch-primary) 35%, transparent)",
                      }}
                    />
                    <div>
                      <p
                        className="font-display text-base font-extrabold tracking-tight"
                        style={{ color: isLast ? "var(--arch-primary)" : "#fff" }}
                      >
                        {t.year}
                      </p>
                      <p className="text-[13px] leading-snug text-white/70">{t.event}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* 6. Authority seal */}
      <div
        className="mt-10 flex items-center justify-center rounded-full border px-5 py-3 text-center font-mono text-[11px] font-bold uppercase leading-tight tracking-[0.22em] sm:text-[12px] sm:tracking-[0.28em]"
        style={{
          borderColor: "color-mix(in oklab, var(--arch-primary) 45%, transparent)",
          color: "var(--arch-primary)",
          background: "color-mix(in oklab, var(--arch-primary) 10%, transparent)",
          boxShadow: "0 0 30px -10px var(--arch-glow)",
        }}
      >
        {proofSeal}
      </div>

      {/* 7. Verdict */}
      <div
        className="relative mt-8 overflow-hidden rounded-2xl border ps-8 pe-6 py-7 sm:ps-10 sm:pe-8 sm:py-8"
        style={{
          borderColor: "color-mix(in oklab, var(--arch-primary) 35%, transparent)",
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--arch-primary) 16%, transparent) 0%, rgba(0,0,0,0.4) 100%)",
          boxShadow: "0 20px 50px -25px var(--arch-glow)",
        }}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 start-0 w-[3px]"
          style={{
            background: "var(--arch-primary)",
            boxShadow: "0 0 20px var(--arch-primary)",
          }}
        />
        <p className="mb-2.5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em] text-white/55">
          <span
            aria-hidden
            className="inline-block h-1 w-1 rounded-full"
            style={{ background: "var(--arch-primary)", boxShadow: "0 0 6px var(--arch-primary)" }}
          />
          {verdictLabel}
        </p>
        <p className="font-display text-lg font-extrabold uppercase leading-[1.2] tracking-tight text-white sm:text-2xl">
          {pivot}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-white/85 sm:text-[16px]">{solution}</p>
      </div>
    </div>
  );
}

function CornerBrackets() {
  const common =
    "pointer-events-none absolute h-3 w-3 border-white/15 transition-all duration-500";
  return (
    <>
      <span aria-hidden className={`${common} left-2 top-2 border-l-2 border-t-2`} />
      <span aria-hidden className={`${common} right-2 top-2 border-r-2 border-t-2`} />
      <span aria-hidden className={`${common} bottom-2 left-2 border-b-2 border-l-2`} />
      <span aria-hidden className={`${common} bottom-2 right-2 border-b-2 border-r-2`} />
    </>
  );
}

export default ScienceDossier;