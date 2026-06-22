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
          className="font-display text-[24px] md:text-[24px] lg:text-[24px] font-black italic uppercase leading-[30px] tracking-[-0.05em] text-balance break-words"
        >
          {a.title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg drop-shadow-lg">
          {a.sub}
        </p>
      </Reveal>

      <Reveal.Group
        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
        stagger="fast"
      >
        {ARCH_KEYS.map((key) => {
          const item = a.items[key];
          const Icon = ICONS[key];
          return (
            <Reveal
              key={key}
              variant="fade-up"
              className="group relative flex min-w-0 flex-col gap-5 overflow-hidden rounded-3xl lg:rounded-[2.5rem] border border-white/10 bg-black/40 p-8 md:p-10 lg:p-12 transition-all duration-500 hover:border-arch-primary/40 hover:bg-black/60 md:hover:-translate-y-2 shadow-2xl lg:backdrop-blur-3xl"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-arch-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="relative z-10 flex items-center justify-between gap-3 min-w-0">
                <span
                  aria-hidden
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-arch-primary/20 bg-arch-primary/10 text-arch-primary shadow-[0_0_22px_-6px_var(--arch-glow)] transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-arch-primary group-hover:text-primary-foreground"
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="font-display text-[11px] font-black uppercase tracking-[0.3em] text-arch-primary/50 group-hover:text-arch-primary transition-colors">
                  {CODES[key]}
                </span>
              </div>

              <h3 className="relative z-10 font-display text-[16px] font-black italic uppercase tracking-tight leading-[1.45] pt-1 text-white group-hover:text-arch-primary transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] break-words">
                {item.name}
              </h3>

              <p className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em] text-arch-primary/70 group-hover:text-arch-primary transition-colors break-words">
                {item.trigger}
              </p>

              <p className="relative z-10 text-[15px] leading-relaxed text-white/70 group-hover:text-white/85 transition-colors drop-shadow-sm">
                {item.desc}
              </p>
            </Reveal>
          );
        })}
      </Reveal.Group>
    </section>
  );
}
