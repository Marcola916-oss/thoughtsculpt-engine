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
          className="font-display text-[24px] md:text-[24px] lg:text-[24px] font-black italic uppercase leading-[35px] tracking-[-0.05em] text-balance break-words"
        >
          {a.title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg drop-shadow-lg">
          {a.sub}
        </p>
      </Reveal>

      <Reveal.Group
        className="grid grid-cols-1 overflow-hidden rounded-3xl lg:rounded-[2.5rem] border border-white/10 bg-black/30 md:backdrop-blur-3xl sm:grid-cols-2 lg:grid-cols-4 shadow-2xl divide-y divide-white/10 sm:divide-y-0"
        stagger="fast"
      >
        {ARCH_KEYS.map((key) => {
          const item = a.items[key];
          const Icon = ICONS[key];
          return (
            <Reveal
              key={key}
              variant="fade-up"
              className="group relative flex min-w-0 flex-col gap-4 border-white/10 bg-white/[0.02] p-6 sm:p-7 lg:p-8 transition-all duration-500 hover:bg-white/[0.08] sm:[&:not(:nth-child(2n))]:border-r lg:[&:not(:nth-child(2n))]:border-r lg:[&:not(:last-child)]:border-r sm:[&:nth-child(-n+2)]:border-b sm:[&:nth-child(n+3)]:border-t lg:[&:nth-child(-n+2)]:border-b-0 lg:[&:nth-child(n+3)]:border-t-0 md:hover:-translate-y-1"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-arch-primary transition-transform duration-500 ease-out group-hover:scale-x-100 shadow-[0_0_15px_var(--arch-glow)]"
              />

              <div className="flex items-center justify-between gap-3 min-w-0">
                <span
                  aria-hidden
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-arch-primary/20 bg-arch-primary/10 text-arch-primary shadow-[0_0_20px_-6px_var(--arch-glow)] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-[10px] font-black uppercase tracking-[0.3em] text-arch-primary/40 group-hover:text-arch-primary transition-colors">
                  {CODES[key]}
                </span>
              </div>

              <h3 className="font-display text-[clamp(1.25rem,4.5vw,1.75rem)] font-black italic uppercase tracking-tighter text-white group-hover:text-arch-primary transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] text-center break-words">
                {item.name}
              </h3>

              <p className="border-b border-white/[0.07] pb-4 text-[11px] font-black uppercase tracking-[0.15em] text-white/40 group-hover:text-white/60 transition-colors break-words">
                {item.trigger}
              </p>

              <p className="text-sm leading-relaxed text-white/60 group-hover:text-white/80 transition-colors">{item.desc}</p>
            </Reveal>
          );
        })}
      </Reveal.Group>
    </section>
  );
}
