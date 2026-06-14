import { ShieldCheck, Lock } from "lucide-react";
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
          className="font-display text-4xl font-black italic uppercase leading-[0.95] tracking-[-0.05em] text-foreground md:text-7xl lg:text-8xl text-balance break-words pr-2"
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
            className="group relative mt-12 h-20 md:h-28 w-full max-w-2xl overflow-hidden rounded-full bg-white text-black transition-all hover:scale-[1.03] active:scale-95 shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)]"
          >
            <div className="absolute inset-0 overflow-hidden rounded-full bg-arch-primary opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            <span className="relative z-10 flex items-center justify-center gap-6 text-[21px] md:text-[21px] font-black italic tracking-tighter group-hover:text-white transition-colors mx-[5px] pr-[5px]">
              {c.cta.toUpperCase()}
            </span>
            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
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
