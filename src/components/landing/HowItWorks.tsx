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
          className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl"
        >
          {w.title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
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
            className="relative flex flex-col items-center text-center"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-arch-primary/40 bg-arch-primary/[0.06] font-display text-2xl font-extrabold text-arch-primary shadow-[0_0_22px_-6px_var(--arch-glow)]">
              {i + 1}
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-foreground">{step.title}</h3>
            <p className="max-w-[220px] text-sm leading-relaxed text-muted-foreground">
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
