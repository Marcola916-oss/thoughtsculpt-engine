import { Sparkles, Star, ShieldCheck, Globe2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/components/interaction/Reveal";

const ICONS = [Sparkles, Star, ShieldCheck, Globe2] as const;

export function ProofBar() {
  const { t } = useI18n();
  const items = [
    t.landing.proofBar.diagnostics,
    t.landing.proofBar.rating,
    t.landing.proofBar.noBank,
    t.landing.proofBar.languages,
  ];

  return (
    <aside
      aria-label={`MindReset — ${t.landing.proofBar.ariaLabel}`}
      className="relative w-full border-y border-white/[0.1] bg-black/40 md:backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:divide-x divide-white/[0.1] px-4 md:grid-cols-4 md:px-8">
        {items.map((item, i) => {
          const Icon = ICONS[i];
          return (
            <Reveal
              key={i}
              variant="fade-up"
              delay={i * 0.08}
              className="group flex items-center gap-4 px-4 py-7 md:px-8 transition-colors hover:bg-white/[0.02] text-left"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-arch-primary/20 bg-arch-primary/10 text-arch-primary shadow-[0_0_18px_-4px_var(--arch-glow)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-arch-primary group-hover:text-primary-foreground"
                style={{ marginLeft: "0px" }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 transition-transform duration-500 group-hover:translate-x-1">
                <div className={`font-display italic leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${i === 0 ? "text-[27px] font-bold" : i === 1 ? "text-[22px] font-bold" : i === 2 ? "text-[25px] font-bold" : "text-[22px] font-bold"}`} style={i === 0 ? { marginLeft: "-10px", marginRight: "-10px", fontSize: "27px" } : i === 1 ? { fontSize: "22px" } : i === 2 ? { fontSize: "25px" } : { fontSize: "22px" }}>
                  {item.value}
                </div>
                <div className="mt-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-arch-primary transition-colors drop-shadow-sm">
                  {item.label}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </aside>
  );
}
