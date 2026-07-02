import { useEffect, useRef, useState } from "react";

type Author = { name: string; credential: string; field: string };
type TL = { year: string; event: string };

type Props = {
  body: string;
  kicker?: string;
  heroPercent: string;
  heroCaption: string;
  heroSource: string;
  authorityLabel: string;
  authors: Author[];
  timelineLabel: string;
  timeline: TL[];
  proofSeal: string;
  verdictLabel: string;
  pivot: string;
  solution: string;
};

function useInView<T extends HTMLElement>() {
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
      { threshold: 0.35 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);
  return { ref, seen };
}

function AnimatedNumber({ target, active }: { target: number; active: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);
  return <>{n}</>;
}

function CornerBrackets() {
  const color = "color-mix(in oklab, var(--arch-primary) 55%, transparent)";
  const cls = "pointer-events-none absolute h-4 w-4 border-white/40";
  return (
    <>
      <span className={`${cls} left-2 top-2 border-l border-t`} style={{ borderColor: color }} />
      <span className={`${cls} right-2 top-2 border-r border-t`} style={{ borderColor: color }} />
      <span className={`${cls} left-2 bottom-2 border-l border-b`} style={{ borderColor: color }} />
      <span className={`${cls} right-2 bottom-2 border-r border-b`} style={{ borderColor: color }} />
    </>
  );
}

function Monogram({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 30% 25%, color-mix(in oklab, var(--arch-primary) 30%, #0a0a0f) 0%, #050507 70%)",
        boxShadow:
          "inset 0 0 0 1px color-mix(in oklab, var(--arch-primary) 50%, transparent), inset 0 -18px 30px rgba(0,0,0,0.55)",
      }}
      aria-hidden
    >
      <span
        className="font-serif text-[26px] font-bold tracking-wider text-white/95"
        style={{ textShadow: "0 2px 6px rgba(0,0,0,0.55)" }}
      >
        {initials}
      </span>
      {/* nobel micro-badge */}
      <span
        className="absolute -bottom-0.5 right-0.5 rounded-full px-1.5 py-[2px] text-[8px] font-bold tracking-[0.15em]"
        style={{
          background: "linear-gradient(135deg, #d4b26a, #8a6a2c)",
          color: "#1a1204",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.35)",
        }}
      >
        ★
      </span>
    </div>
  );
}

export function ScienceDossier({
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
}: Props) {
  const heroTarget = Number.parseInt(heroPercent, 10) || 95;
  const { ref, seen } = useInView<HTMLDivElement>();
  const border = "color-mix(in oklab, var(--arch-primary) 22%, rgba(255,255,255,0.08))";
  const softBorder = "rgba(255,255,255,0.08)";

  return (
    <div ref={ref} className="mt-2">
      {/* Header strip — Nature/NYT style */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b px-1 pb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/55"
        style={{ borderColor: softBorder }}
      >
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: "var(--arch-primary)" }}
          />
          {kicker ?? "Peer-reviewed · Behavioral neuroscience"}
        </span>
        <span className="hidden sm:inline">DOSSIER · 03/07</span>
      </div>

      {/* Body kicker */}
      <p className="mt-6 text-[17px] leading-[1.75] text-white/85">{body}</p>

      {/* HERO — the 95% */}
      <div
        className="relative mt-8 overflow-hidden rounded-2xl border p-6 sm:p-10"
        style={{
          borderColor: border,
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--arch-primary) 8%, #06060a) 0%, #050508 100%)",
        }}
      >
        <CornerBrackets />
        {/* grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-[auto_1fr]">
          <div className="flex items-baseline">
            <span
              className="font-serif font-black leading-none tracking-tight"
              style={{
                fontSize: "clamp(120px, 22vw, 220px)",
                color: "var(--arch-primary)",
                textShadow:
                  "0 0 40px color-mix(in oklab, var(--arch-primary) 40%, transparent), 0 6px 0 rgba(0,0,0,0.35)",
              }}
            >
              <AnimatedNumber target={heroTarget} active={seen} />
            </span>
            <span
              className="ms-1 font-serif font-black leading-none"
              style={{ fontSize: "clamp(48px, 8vw, 90px)", color: "var(--arch-primary)" }}
            >
              %
            </span>
          </div>
          <div>
            <p className="text-[19px] leading-[1.55] text-white sm:text-[22px]">{heroCaption}</p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
              {heroSource}
            </p>
          </div>
        </div>
      </div>

      {/* AUTHORITY — 3 columns */}
      <div className="mt-10">
        <div
          className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white/50"
        >
          <span className="h-px flex-1" style={{ background: softBorder }} />
          <span>{authorityLabel}</span>
          <span className="h-px flex-1" style={{ background: softBorder }} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {authors.map((a) => (
            <article
              key={a.name}
              className="group relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:-translate-y-0.5"
              style={{
                borderColor: border,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-70"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--arch-primary), transparent)",
                }}
              />
              <div className="flex items-start gap-4">
                <Monogram name={a.name} />
                <div className="min-w-0">
                  <h4 className="font-serif text-[17px] font-bold leading-tight text-white">
                    {a.name}
                  </h4>
                  <p
                    className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: "var(--arch-primary)" }}
                  >
                    {a.credential}
                  </p>
                  <p className="mt-2 text-[13px] leading-snug text-white/70">{a.field}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* TIMELINE */}
      {timeline.length > 0 && (
        <div className="mt-10">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">
            {timelineLabel}
          </p>
          <div className="relative">
            <div
              className="absolute left-0 right-0 top-[13px] h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, color-mix(in oklab, var(--arch-primary) 55%, transparent), transparent)",
              }}
            />
            <ol className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
              {timeline.map((t, i) => (
                <li key={t.year} className="relative flex flex-col items-start">
                  <span
                    className="mb-2 inline-block h-[10px] w-[10px] rounded-full ring-2"
                    style={{
                      background: i === timeline.length - 1 ? "var(--arch-primary)" : "#0a0a10",
                      boxShadow:
                        i === timeline.length - 1
                          ? "0 0 12px color-mix(in oklab, var(--arch-primary) 60%, transparent)"
                          : "none",
                      ["--tw-ring-color" as string]:
                        "color-mix(in oklab, var(--arch-primary) 60%, transparent)",
                    }}
                  />
                  <span
                    className="font-serif text-[18px] font-bold text-white"
                    style={i === timeline.length - 1 ? { color: "var(--arch-primary)" } : undefined}
                  >
                    {t.year}
                  </span>
                  <span className="mt-0.5 text-[12px] leading-snug text-white/65">{t.event}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* PROOF SEAL */}
      <p
        className="mt-10 inline-flex items-center rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em]"
        style={{
          borderColor: "color-mix(in oklab, var(--arch-primary) 40%, transparent)",
          color: "var(--arch-primary)",
          background: "color-mix(in oklab, var(--arch-primary) 10%, transparent)",
        }}
      >
        {proofSeal}
      </p>

      {/* VERDICT card */}
      <div
        className="relative mt-6 overflow-hidden rounded-2xl border p-6 sm:p-8"
        style={{
          borderColor: border,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
          style={{ background: "var(--arch-primary)" }}
        />
        <p
          className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color: "var(--arch-primary)" }}
        >
          {verdictLabel}
        </p>
        <p className="text-[18px] leading-relaxed text-white sm:text-[20px]">
          <strong style={{ color: "var(--arch-primary)" }}>{pivot}</strong>{" "}
          <span className="text-white/90">{solution}</span>
        </p>
      </div>
    </div>
  );
}

export default ScienceDossier;