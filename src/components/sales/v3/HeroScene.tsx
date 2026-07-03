import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { Reveal } from "@/components/interaction";

/**
 * Sales v3 Hero — premium editorial. Eyebrow → archetype-personalized H1
 * → editorial divider → subtitle with archetype emphasis → CTA with
 * breathing halo → trust bar → microtext → proof stats. All spacing tuned
 * so the CTA lands above the fold on 1366×768.
 */
export function HeroScene({
  eyebrow,
  title,
  promise,
  emphasisWord,
  cta,
  timer,
  onCta,
  trust,
  proofs,
  rank,
  rankLabel,
}: {
  eyebrow: string;
  title: ReactNode;
  promise: string;
  emphasisWord?: string;
  cta: string;
  timer?: string;
  onCta: () => void;
  trust?: ReactNode;
  proofs?: Array<{ value: string; label: string }>;
  rank?: string;
  rankLabel?: string;
}) {
  const promiseNodes = renderPromise(promise, emphasisWord);
  return (
    <section className="hero-symbols-mask relative w-full text-center pt-10 pb-16 sm:pt-14 sm:pb-20">
      <Reveal className="flex flex-col items-center">
        <span
          className="badge-pulse relative inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-arch-primary/40 bg-arch-primary/10 px-4 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.3em] shadow-[0_0_18px_-4px_var(--arch-glow)]"
          style={{ color: "var(--arch-primary)" }}
          data-cursor="magnetic"
        >
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--arch-primary)",
              boxShadow: "0 0 8px var(--arch-glow)",
            }}
          />
          {eyebrow}
          {rank && (
            <>
              <span aria-hidden className="opacity-40">·</span>
              <span className="tabular-nums opacity-90">
                {rankLabel ? `${rankLabel} ` : ""}Nº {rank}
              </span>
            </>
          )}
        </span>

        <h1
          className="mt-5 font-sans font-extrabold leading-[0.98] tracking-tight text-white drop-shadow-md text-center [&::first-letter]:uppercase max-w-4xl"
          style={{
            fontSize: "clamp(2.5rem, 7vw, 5.25rem)",
            textShadow: "0 8px 40px color-mix(in oklab, var(--arch-primary) 22%, transparent)",
          }}
        >
          {title}
        </h1>

        <span
          aria-hidden
          className="mt-6 block h-[2px] w-12 rounded-full"
          style={{ background: "color-mix(in oklab, var(--arch-primary) 55%, transparent)" }}
        />

        <p className="mt-6 max-w-xl text-base leading-[1.55] text-white/85 sm:text-lg font-medium drop-shadow-sm text-center mx-auto">
          {promiseNodes}
        </p>

        <div className="relative mt-8 flex flex-col items-center gap-2">
          <span
            aria-hidden
            className="hero-halo pointer-events-none absolute -inset-x-16 -inset-y-10 -z-10 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--arch-primary) 45%, transparent) 0%, transparent 70%)",
            }}
          />
          <ButtonPress>
            <button
              type="button"
              onClick={onCta}
              data-cursor="magnetic"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-9 py-5 text-base font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97] sm:text-lg"
              style={{
                background: "var(--arch-primary)",
                boxShadow:
                  "0 24px 60px -20px color-mix(in oklab, var(--arch-primary) 70%, transparent), inset 0 1px 0 rgba(255,255,255,0.18)",
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
        </div>

        {trust && <div className="w-full">{trust}</div>}

        {timer && (
          <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-white/55 font-medium">
            {timer}
          </p>
        )}

        {proofs && proofs.length > 0 && (
          <ul
            className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-x-6 gap-y-6 border-t pt-8 sm:grid-cols-4 mx-auto text-center"
            style={{ borderColor: "color-mix(in oklab, var(--arch-primary) 25%, transparent)" }}
          >
            {proofs.map((p, i) => (
              <li key={i} className="min-w-0 text-center">
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

function renderPromise(text: string, emphasis?: string): ReactNode {
  if (!emphasis) return text;
  const idx = text.toLowerCase().indexOf(emphasis.toLowerCase());
  if (idx < 0) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + emphasis.length);
  const after = text.slice(idx + emphasis.length);
  return (
    <>
      {before}
      <strong className="font-bold" style={{ color: "var(--arch-primary)" }}>
        {match}
      </strong>
      {after}
    </>
  );
}

export default HeroScene;