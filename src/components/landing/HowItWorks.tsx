import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/components/interaction/Reveal";

export function HowItWorks() {
  const { t } = useI18n();
  const w = t.landing.howItWorks;

  return (
    <section
      aria-labelledby="how-title"
      className="relative mx-auto w-full max-w-7xl px-4 py-24 md:px-8 md:py-32"
    >
      <Reveal variant="fade-up" className="mx-auto max-w-2xl text-center">
        <span
          aria-hidden
          className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-arch-primary"
        >
          <span className="h-px w-6 bg-arch-primary" />
          {w.tag}
        </span>
        <h2
          id="how-title"
          className="font-display text-4xl font-black italic uppercase leading-[1.1] tracking-[-0.04em] md:text-5xl lg:text-6xl py-2"
        >
          {w.title}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-white/60 md:text-xl tracking-tight drop-shadow-lg">
          {w.sub}
        </p>
      </Reveal>

      <Reveal.Group
        className="mt-16 grid grid-cols-1 items-start gap-12 md:mt-24 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-0"
        stagger="normal"
        amount={0.3}
      >
        {w.steps.map((step, i) => (
          <Reveal
            key={i}
            variant="fade-up"
            className="group relative flex flex-col items-center text-center"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-arch-primary/40 bg-arch-primary/[0.04] font-display text-3xl font-black italic text-arch-primary shadow-[0_0_22px_-6px_var(--arch-glow)] transition-all duration-500 group-hover:scale-110 group-hover:bg-arch-primary group-hover:text-primary-foreground group-hover:rotate-6">
              {i + 1}
            </div>
            <h3 className="mb-3 font-display text-xl font-black uppercase italic tracking-tight text-foreground group-hover:text-arch-primary transition-colors">{step.title}</h3>
            <p className="max-w-[220px] text-[15px] font-medium leading-relaxed text-white/60 group-hover:text-white/90 transition-colors drop-shadow-md">
              {step.desc}
            </p>
          </Reveal>
        ))}

        <div
          aria-hidden
          className="hidden items-center self-center text-white/15 md:flex md:self-start md:pt-3"
        >
          <ArrowRight className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div
          aria-hidden
          className="hidden items-center self-center text-white/15 md:flex md:self-start md:pt-3"
        >
          <ArrowRight className="h-7 w-7" strokeWidth={1.5} />
        </div>

        <div
          aria-hidden
          className="mx-auto flex h-8 w-px items-center justify-center bg-gradient-to-b from-transparent via-white/15 to-transparent md:hidden"
        />
      </Reveal.Group>
    </section>
  );
}
