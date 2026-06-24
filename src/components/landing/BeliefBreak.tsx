import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/components/interaction/Reveal";

/**
 * BeliefBreak — Phase 2 / Commit 2.
 * Breaks the visitor's assumption ("it's my money") and reframes it as a behavioral pattern,
 * citing Kahneman / Thaler / Ariely. Asymmetric 60/40 layout on desktop, stacked on mobile.
 * Pure presentational — copy comes from i18n (t.landing.beliefBreak).
 */
export function BeliefBreak() {
  const { t } = useI18n();
  const bb = t.landing.beliefBreak;

  return (
    <section
      aria-labelledby="belief-break-title"
      className="relative w-full border-b border-white/[0.06] bg-black/40 py-20 md:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-8 lg:grid-cols-[3fr_2fr] lg:gap-16">
        {/* Left column — title + intro + punchline */}
        <div className="flex flex-col justify-between">
          <Reveal variant="fade-up">
            <span
              aria-hidden
              className="inline-block rounded-full border border-arch-primary/30 bg-arch-primary/10 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-arch-primary shadow-[0_0_18px_-4px_var(--arch-glow)]"
            >
              {bb.tag}
            </span>
            <h2
              id="belief-break-title"
              className="mt-5 whitespace-pre-line font-display text-[clamp(2rem,5vw,3.4rem)] font-bold leading-[1.02] text-foreground"
            >
              {bb.title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/70 md:text-lg">
              {bb.intro}
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={0.25} className="mt-10 lg:mt-14">
            <p className="relative border-l-2 border-arch-primary pl-5 font-display text-xl font-bold leading-snug text-foreground md:text-2xl">
              {bb.punchline}
            </p>
          </Reveal>
        </div>

        {/* Right column — 3 stacked author cards */}
        <div className="flex flex-col gap-4">
          {bb.cards.map((c, i) => (
            <Reveal
              key={c.author}
              variant="fade-up"
              delay={0.1 + i * 0.08}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-arch-primary/40 hover:shadow-[0_0_32px_-12px_var(--arch-glow)] md:p-6"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-arch-primary">
                  {c.author}
                </span>
                <span
                  aria-hidden
                  className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40"
                >
                  Nobel
                </span>
              </div>
              <p className="mt-3 font-display text-lg font-bold leading-snug text-foreground md:text-xl">
                “{c.quote}”
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-foreground/60">
                {c.insight}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}