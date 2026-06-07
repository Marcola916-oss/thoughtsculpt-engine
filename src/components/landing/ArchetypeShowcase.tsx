import { Shield, Crown, EyeOff, Flame, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/components/interaction/Reveal";

const ARCH_KEYS = ["AO", "SS", "EA", "HI"] as const;
const ICONS: Record<(typeof ARCH_KEYS)[number], LucideIcon> = {
  AO: Shield,
  SS: Crown,
  EA: EyeOff,
  HI: Flame,
};
const CODES: Record<(typeof ARCH_KEYS)[number], string> = {
  AO: "AO",
  SS: "SS",
  EA: "EA",
  HI: "HI",
};

export function ArchetypeShowcase() {
  const { t } = useI18n();
  const a = t.landing.archetypes;

  return (
    <section
      aria-labelledby="archetypes-title"
      className="relative mx-auto w-full max-w-7xl px-4 py-24 md:px-8 md:py-32"
    >
      <Reveal variant="fade-up" className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
        <span
          aria-hidden
          className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-arch-primary"
        >
          <span className="h-px w-6 bg-arch-primary" />
          {a.tag}
        </span>
        <h2
          id="archetypes-title"
          className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl"
        >
          {a.title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {a.sub}
        </p>
      </Reveal>

      <Reveal.Group
        className="grid grid-cols-1 overflow-hidden rounded-2xl border border-white/[0.07] sm:grid-cols-2 lg:grid-cols-4"
        stagger="fast"
      >
        {ARCH_KEYS.map((key) => {
          const item = a.items[key];
          const Icon = ICONS[key];
          return (
            <Reveal
              key={key}
              variant="fade-up"
              className="group relative flex flex-col gap-4 border-white/[0.07] bg-white/[0.012] p-7 transition-colors duration-300 hover:bg-white/[0.035] sm:border-r last:border-r-0 sm:[&:nth-child(2)]:border-r sm:[&:nth-child(even)]:lg:border-r-0"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-arch-primary transition-transform duration-500 ease-out group-hover:scale-x-100"
              />

              <div className="flex items-center justify-between">
                <span
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-arch-primary/20 bg-arch-primary/10 text-arch-primary shadow-[0_0_20px_-6px_var(--arch-glow)]"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-[10px] font-extrabold uppercase tracking-[0.2em] text-arch-primary">
                  {CODES[key]}
                </span>
              </div>

              <h3 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
                {item.name}
              </h3>

              <p className="border-b border-white/[0.07] pb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/80">
                {item.trigger}
              </p>

              <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </Reveal>
          );
        })}
      </Reveal.Group>
    </section>
  );
}
