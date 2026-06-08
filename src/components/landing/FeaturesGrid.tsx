import { Brain, CalendarDays, Compass, LineChart } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/components/interaction/Reveal";

const ICONS = [Brain, CalendarDays, Compass, LineChart] as const;

export function FeaturesGrid() {
  const { t } = useI18n();
  const f = t.landing.features;

  return (
    <section
      aria-labelledby="features-title"
      className="relative mx-auto w-full max-w-7xl px-4 py-24 md:px-8 md:py-32"
    >
      <Reveal variant="fade-up" className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
        <span
          aria-hidden
          className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-arch-primary"
        >
          <span className="h-px w-6 bg-arch-primary" />
          {f.tag}
        </span>
        <h2
          id="features-title"
          className="font-display text-4xl font-black italic uppercase leading-[0.95] tracking-[-0.05em] md:text-7xl whitespace-pre-line"
        >
          {f.title}
        </h2>
      </Reveal>

      <Reveal.Group
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
        stagger="fast"
      >
        {f.items.map((item, i) => {
          const Icon = ICONS[i] ?? Brain;
          return (
            <Reveal
              key={i}
              variant="fade-up"
              className="group relative flex flex-col gap-5 rounded-[2.5rem] border border-white/10 bg-black/60 backdrop-blur-3xl p-8 transition-all duration-500 hover:border-arch-primary/40 hover:bg-black/80 md:p-12 hover:-translate-y-2 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-arch-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <span
                aria-hidden
                className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-arch-primary/20 bg-arch-primary/10 text-arch-primary shadow-[0_0_22px_-6px_var(--arch-glow)] transition-all duration-500 group-hover:scale-110 group-hover:bg-arch-primary group-hover:text-primary-foreground group-hover:rotate-3"
              >
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="relative z-10 font-display text-2xl font-extrabold tracking-tight text-white md:text-[26px] group-hover:text-arch-primary transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {item.title}
              </h3>
              <p className="relative z-10 text-[15px] leading-relaxed text-foreground/70 md:text-base">
                {item.desc}
              </p>
              <span className="relative z-10 mt-auto pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-arch-primary/60 group-hover:text-arch-primary transition-colors">
                <span className="h-1 w-1 rounded-full bg-current" />
                {item.meta}
              </span>
            </Reveal>
          );
        })}
      </Reveal.Group>
    </section>
  );
}
