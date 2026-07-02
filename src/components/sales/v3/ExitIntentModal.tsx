import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Lock, X } from "lucide-react";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import logoAsset from "@/assets/logo-official-transparent.webp";

type CopyBundle = {
  chip: string;
  reservedLabel: string;
  remainingLabel: string;
  progressAnalysis: string;
  progressProtocol: string;
  lossHeader: string;
  losses: string[];
  guarantee: string;
  closeLabel: string;
};

export function ExitIntentModal({
  open,
  title,
  body,
  cta,
  decline,
  copy,
  onAccept,
  onDismiss,
}: {
  open: boolean;
  title: string;
  body: string;
  cta: string;
  decline: string;
  copy: CopyBundle;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const caseId = useMemo(
    () =>
      Array.from({ length: 8 }, () =>
        "ABCDEFGHJKMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 31)),
      ).join(""),
    [],
  );
  const [remaining, setRemaining] = useState(10 * 60);
  const ctaRef = useRef<HTMLButtonElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Countdown
  useEffect(() => {
    if (!open) return;
    setRemaining(10 * 60);
    const id = window.setInterval(() => {
      setRemaining((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [open]);

  // Focus + Escape + body scroll lock
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => ctaRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
      if (e.key === "Tab" && cardRef.current) {
        const nodes = cardRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onDismiss]);

  if (!open) return null;

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 animate-fade-in"
      style={{
        background: "rgba(0,0,0,0.86)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      onClick={onDismiss}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border text-start"
        style={{
          background:
            "radial-gradient(ellipse at 50% -10%, color-mix(in oklab, var(--arch-primary) 14%, rgba(0,0,0,0.92)) 0%, rgba(0,0,0,0.96) 60%)",
          borderColor: "color-mix(in oklab, var(--arch-primary) 45%, transparent)",
          boxShadow:
            "0 60px 120px -30px color-mix(in oklab, var(--arch-primary) 60%, transparent), inset 0 1px 0 rgba(255,255,255,0.06)",
          animation: "exitCardIn 460ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
            backgroundSize: "3px 3px, 5px 5px",
          }}
        />
        {/* Corner brackets */}
        {[
          { pos: "left-3 top-3 border-l border-t" },
          { pos: "right-3 top-3 border-r border-t" },
          { pos: "left-3 bottom-3 border-l border-b" },
          { pos: "right-3 bottom-3 border-r border-b" },
        ].map((b, i) => (
          <span
            key={i}
            aria-hidden
            className={`pointer-events-none absolute h-4 w-4 ${b.pos} animate-pulse`}
            style={{
              borderColor: "color-mix(in oklab, var(--arch-primary) 60%, transparent)",
              animationDuration: "2.4s",
            }}
          />
        ))}

        {/* Header strip */}
        <div
          className="relative flex items-center justify-between gap-3 border-b px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.25em]"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--arch-primary) 22%, rgba(0,0,0,0.7)) 0%, rgba(0,0,0,0.7) 100%)",
            borderColor: "color-mix(in oklab, var(--arch-primary) 35%, rgba(255,255,255,0.08))",
            color: "color-mix(in oklab, var(--arch-primary) 90%, white)",
          }}
        >
          <span className="flex items-center gap-2 truncate">
            <span
              className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full"
              style={{ background: "var(--arch-primary)" }}
            />
            <span className="truncate">
              #MR-{caseId}
              <span className="mx-2 text-white/25">·</span>
              <span className="text-white/70">{copy.reservedLabel}</span>
              <span className="mx-2 text-white/25">·</span>
              <span className="tabular-nums text-white">{mm}:{ss}</span>
              <span className="ms-1 text-white/50 normal-case tracking-normal">
                {" "}{copy.remainingLabel}
              </span>
            </span>
          </span>
          <span className="flex items-center gap-2 text-white/55">
            <Lock size={11} strokeWidth={2.4} className="opacity-70" />
            <button
              type="button"
              onClick={onDismiss}
              aria-label={copy.closeLabel}
              className="rounded-full p-1 text-white/55 transition hover:bg-white/10 hover:text-white"
            >
              <X size={14} />
            </button>
          </span>
        </div>

        {/* Body */}
        <div className="relative px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
          {/* Logo with halo */}
          <div className="relative mx-auto mb-4 flex h-[92px] w-[92px] items-center justify-center sm:h-[108px] sm:w-[108px]">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--arch-primary) 55%, transparent) 0%, transparent 70%)",
                opacity: 0.75,
              }}
            />
            <span
              aria-hidden
              className="absolute inset-2 rounded-full"
              style={{
                border:
                  "1px solid color-mix(in oklab, var(--arch-primary) 40%, transparent)",
              }}
            />
            <img
              src={logoAsset}
              alt="MindReset"
              className="relative z-10 h-[72px] w-[72px] object-contain sm:h-[86px] sm:w-[86px]"
              loading="eager"
            />
          </div>

          {/* Chip */}
          <div className="mb-4 flex justify-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.28em]"
              style={{
                background: "color-mix(in oklab, var(--arch-primary) 20%, rgba(0,0,0,0.6))",
                borderColor: "color-mix(in oklab, var(--arch-primary) 55%, transparent)",
                color: "color-mix(in oklab, var(--arch-primary) 95%, white)",
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ background: "var(--arch-primary)" }}
              />
              {copy.chip}
            </span>
          </div>

          {/* Title */}
          <h2
            id="exit-intent-title"
            className="mx-auto max-w-md text-center font-display font-extrabold leading-[1.08] text-white"
            style={{ fontSize: "clamp(24px, 5vw, 32px)" }}
          >
            {title}
          </h2>

          {/* Body */}
          <p className="mx-auto mt-3 max-w-md text-center text-[13.5px] leading-relaxed text-white/70 sm:text-sm">
            {body}
          </p>

          {/* Progress bars — sunk cost */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { label: copy.progressAnalysis, pct: 100 },
              { label: copy.progressProtocol, pct: 0 },
            ].map((row) => (
              <div key={row.label} className="min-w-0">
                <div className="mb-1 flex items-baseline justify-between font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  <span>{row.label}</span>
                  <span className="tabular-nums text-white/70">{row.pct}%</span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full"
                  style={{
                    background:
                      "color-mix(in oklab, var(--arch-primary) 10%, rgba(255,255,255,0.05))",
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${row.pct}%`,
                      background:
                        "linear-gradient(90deg, var(--arch-primary), color-mix(in oklab, var(--arch-primary) 60%, white))",
                      boxShadow: "0 0 12px var(--arch-glow, rgba(204,0,0,0.55))",
                      transition: "width 1200ms cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Losses */}
          <div className="mt-6">
            <p
              className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em]"
              style={{ color: "color-mix(in oklab, var(--arch-primary) 85%, white)" }}
            >
              {copy.lossHeader}
            </p>
            <ul className="space-y-1.5">
              {copy.losses.map((loss, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] leading-snug">
                  <span
                    aria-hidden
                    className="mt-[3px] font-mono text-[13px] font-bold leading-none"
                    style={{ color: "var(--arch-primary)" }}
                  >
                    ✗
                  </span>
                  <span
                    className="text-white/80"
                    style={{
                      textDecoration: "line-through",
                      textDecorationColor:
                        "color-mix(in oklab, var(--arch-primary) 40%, transparent)",
                      textDecorationThickness: "1px",
                    }}
                  >
                    {loss}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-6">
            <ButtonPress>
              <button
                ref={ctaRef}
                type="button"
                onClick={onAccept}
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-white transition-transform duration-200 hover:-translate-y-[2px] hover:brightness-110 active:scale-[0.97]"
                style={{
                  background: "var(--arch-primary)",
                  boxShadow:
                    "0 24px 60px -14px color-mix(in oklab, var(--arch-primary) 70%, transparent), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                    transform: "translateX(-100%)",
                    animation: "exitShimmer 3.2s ease-in-out infinite",
                  }}
                />
                <span className="relative">{cta.replace(/\s*[→←]\s*$/, "")}</span>
                <ArrowRight size={16} className="relative" />
              </button>
            </ButtonPress>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-white/50">
              {copy.guarantee}
            </p>
          </div>

          {/* Decline */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onDismiss}
              className="text-[12px] text-white/40 underline-offset-4 transition hover:text-white/70 hover:underline"
            >
              {decline}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes exitCardIn {
            0% { opacity: 0; transform: translateY(24px) scale(0.96); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes exitShimmer {
            0% { transform: translateX(-100%); }
            60%, 100% { transform: translateX(100%); }
          }
          @media (prefers-reduced-motion: reduce) {
            [role="dialog"] * { animation: none !important; transition: none !important; }
          }
        `}</style>
      </div>
    </div>
  );
}

export default ExitIntentModal;