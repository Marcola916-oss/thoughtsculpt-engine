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
    <section className="relative pt-20 pb-24 sm:pt-32 sm:pb-32 my-4 rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/5 shadow-2xl p-6 md:p-12 overflow-hidden transition-all hover:bg-black/50 hover:border-white/10">
      <Reveal>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.45em]"
          style={{ color: "var(--arch-primary)" }}
        >
          {eyebrow}
        </p>
        <h1
          className="mt-6 font-display font-extrabold leading-[0.98] tracking-tight text-white drop-shadow-md"
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
              className="group inline-flex items-center gap-3 rounded-full px-9 py-5 text-base font-semibold text-white transition-all sm:text-lg"
              style={{
                background: "var(--arch-primary)",
                boxShadow:
                  "0 24px 60px -20px color-mix(in oklab, var(--arch-primary) 65%, transparent)",
              }}
            >
              {cta}
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
          </ButtonPress>
          {timer && <p className="text-xs text-white/70 font-medium tracking-wide">{timer}</p>}
        </div>
        {proofs && proofs.length > 0 && (
          <ul
            className="mt-14 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 border-t pt-8 sm:grid-cols-4"
            style={{ borderColor: "color-mix(in oklab, var(--arch-primary) 25%, transparent)" }}
          >
            {proofs.map((p, i) => (
              <li key={i}>
                <p
                  className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl drop-shadow-md"
                  style={{ color: "var(--arch-primary)" }}
                >
                  {p.value}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-white/70 font-semibold">
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