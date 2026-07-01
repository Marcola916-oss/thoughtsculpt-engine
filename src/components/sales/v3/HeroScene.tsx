import { ArrowRight } from "lucide-react";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { Reveal } from "@/components/interaction";

/**
 * Sales v3 Hero — editorial split. Copy is the dominant body; the sticky
 * ScrollSculpture lives in the right column at the page level.
 */
export function HeroScene({
  eyebrow,
  title,
  promise,
  cta,
  timer,
  onCta,
  proofs,
}: {
  eyebrow: string;
  title: React.ReactNode;
  promise: string;
  cta: string;
  timer?: string;
  onCta: () => void;
  proofs?: Array<{ value: string; label: string }>;
}) {
  return (
    <section className="relative pt-20 pb-24 sm:pt-32 sm:pb-32 w-full transition-all">
      <Reveal>
        <span
          className="badge-pulse inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-arch-primary/40 bg-arch-primary/10 px-4 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-arch-primary shadow-[0_0_18px_-4px_var(--arch-glow)]"
          style={{ color: "var(--arch-primary)" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          >
            <path d="M9 4.5c-2 0-3.5 1.3-3.7 3-1.4.4-2.3 1.6-2.3 3 0 .9.4 1.7 1 2.2-.6.5-1 1.3-1 2.2 0 1.4.9 2.6 2.3 3 .2 1.7 1.7 3 3.7 3 .8 0 1.6-.3 2.2-.8.6.5 1.4.8 2.2.8 2 0 3.5-1.3 3.7-3 1.4-.4 2.3-1.6 2.3-3 0-.9-.4-1.7-1-2.2.6-.5 1-1.3 1-2.2 0-1.4-.9-2.6-2.3-3-.2-1.7-1.7-3-3.7-3-.8 0-1.6.3-2.2.8C10.6 4.8 9.8 4.5 9 4.5Z" />
            <path d="M11.2 5v14" opacity="0.85" />
          </svg>
          {eyebrow}
        </span>
        <h1
          className="mt-6 font-sans font-extrabold leading-[0.98] tracking-tight text-white drop-shadow-md [&::first-letter]:uppercase"
          style={{ fontSize: "clamp(2.75rem, 7.5vw, 5.5rem)" }}
        >
          {title}
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl font-medium drop-shadow-sm">
          {promise}
        </p>
        <div className="mt-10 flex flex-col items-start gap-3">
          <ButtonPress>
            <button
              type="button"
              onClick={onCta}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-9 py-5 text-base font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97] sm:text-lg"
              style={{
                background: "var(--arch-primary)",
                boxShadow:
                  "0 24px 60px -20px color-mix(in oklab, var(--arch-primary) 65%, transparent)",
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
              <span className="relative z-10">{cta}</span>
              <ArrowRight
                size={20}
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </ButtonPress>
          {timer && <p className="text-xs text-white/70 font-medium tracking-wide">{timer}</p>}
        </div>
        {proofs && proofs.length > 0 && (
          <ul
            className="mt-14 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 border-t pt-8 sm:grid-cols-4"
            style={{ borderColor: "color-mix(in oklab, var(--arch-primary) 25%, transparent)" }}
          >
            {proofs.map((p, i) => (
              <li key={i} className="min-w-0">
                <p
                  className="font-display text-xl font-extrabold tabular-nums sm:text-2xl leading-none whitespace-nowrap drop-shadow-md"
                  style={{ color: "var(--arch-primary)" }}
                >
                  {p.value}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-wider text-white/70 font-semibold leading-snug">
                  {p.label}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </section>
  );
}

export default HeroScene;
