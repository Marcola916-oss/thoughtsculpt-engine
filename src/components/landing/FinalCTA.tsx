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
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[600px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[120px]"
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
          className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground md:text-6xl lg:text-7xl"
        >
          {c.titleBefore}
          <span className="text-arch-primary">{c.titleHighlight}</span>
          {c.titleAfter}
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground/70 md:text-xl">
          {c.sub}
        </p>

        {onCta && (
          <ButtonPress
            onClick={onCta}
            className="group relative mt-10 inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-arch-primary px-9 py-5 font-display text-base font-extrabold tracking-tight text-primary-foreground shadow-[0_24px_60px_-12px_var(--arch-glow)] transition-transform hover:-translate-y-0.5 md:text-lg"
          >
            <span className="relative z-10">{c.cta}</span>
            <ArrowRight className="relative z-10 h-5 w-5 transition-transform duration-500 group-hover:translate-x-1.5" />
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
          </ButtonPress>
        )}

        <div className="mt-7 flex flex-col items-center justify-center gap-3 text-xs font-semibold text-foreground/60 md:flex-row md:gap-6">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> {c.guarantee}
          </span>
          <span className="hidden h-3 w-px bg-white/15 md:block" />
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> SSL · Dados protegidos
          </span>
        </div>
      </Reveal>
    </section>
  );
}
