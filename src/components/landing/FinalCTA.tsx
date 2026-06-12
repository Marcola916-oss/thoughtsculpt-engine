import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { Reveal } from "@/components/interaction/Reveal";

export function FinalCTA({ onCta }: { onCta?: () => void }) {
  const { t } = useI18n();
  const c = t.landing.finalCta;

  return (
    <section aria-labelledby="final-cta-title" className="relative overflow-hidden py-28 md:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[600px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[12px] lg:blur-[120px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(204,0,0,0.20) 0%, rgba(204,0,0,0.06) 45%, transparent 70%)",
        }}
      />

      <Reveal
        variant="scale-spring"
        amount={0.3}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <h2
          id="final-cta-title"
          className="font-display text-4xl font-black italic uppercase leading-[1.1] tracking-[-0.04em] text-foreground md:text-6xl lg:text-7xl py-2"
        >
          {c.titleBefore}
          <span className="text-arch-primary drop-shadow-[0_0_20px_var(--arch-glow)]">{c.titleHighlight}</span>
          {c.titleAfter}
        </h2>

        <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-white/60 md:text-2xl tracking-tight drop-shadow-xl">
          {c.sub}
        </p>

        {onCta && (
          <ButtonPress
            onClick={onCta}
            className="group relative mt-12 inline-flex items-center gap-4 overflow-hidden rounded-2xl bg-white px-10 py-6 font-display text-xl font-black italic uppercase tracking-widest text-black shadow-[0_24px_60px_-12px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:-translate-y-1 active:scale-95 md:text-2xl"
          >
            <span className="relative z-10">{c.cta}</span>
            <ArrowRight className="relative z-10 h-7 w-7 transition-transform duration-500 group-hover:translate-x-2" />
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
          </ButtonPress>
        )}

        <div className="mt-7 flex flex-col items-center justify-center gap-3 text-xs font-semibold text-white/60 md:flex-row md:gap-6 drop-shadow-md">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> {c.guarantee}
          </span>
          <span className="hidden h-3 w-px bg-white/15 md:block" />
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> {c.trustLine}
          </span>
        </div>
      </Reveal>
    </section>
  );
}
