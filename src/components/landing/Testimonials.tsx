import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/components/interaction/Reveal";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

const AVATAR_GRADIENTS = [
  "from-sky-500 to-indigo-600",
  "from-fuchsia-500 to-purple-600",
  "from-amber-500 to-orange-600",
] as const;

export function Testimonials() {
  const { t } = useI18n();
  const tt = t.landing.testimonials;

  return (
    <section
      aria-labelledby="testimonials-title"
      className="relative mx-auto w-full max-w-7xl px-4 py-24 md:px-8 md:py-32"
    >
      <Reveal variant="fade-up" className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
        <span
          aria-hidden
          className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-arch-primary"
        >
          <span className="h-px w-6 bg-arch-primary" />
          {tt.tag}
        </span>
        <h2
          id="testimonials-title"
          className="font-display text-[24px] md:text-[24px] lg:text-[24px] font-black italic uppercase leading-[35px] tracking-[-0.05em] text-balance break-words"
        >
          {tt.title}
        </h2>
      </Reveal>

      <Reveal.Group className="grid grid-cols-1 gap-4 md:grid-cols-3" stagger="fast" amount={0.2}>
        {tt.items.map((item, i) => (
          <Reveal
            key={i}
            variant="fade-up"
            className="group flex flex-col gap-6 rounded-[2.5rem] border border-white/10 bg-black/40 p-6 sm:p-8 md:p-10 transition-all duration-500 hover:border-arch-primary/40 hover:bg-black/60 md:hover:-translate-y-2 shadow-2xl md:backdrop-blur-3xl overflow-hidden min-w-0"
          >
            <div
              className="flex items-center gap-1 text-amber-400 group-hover:text-amber-300 transition-colors"
              role="img"
              aria-label={tt.starsAlt(item.stars)}
            >
              {Array.from({ length: item.stars }).map((_, s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>

            <blockquote className="flex-1 text-[16px] italic leading-[1.75] text-white/80 group-hover:text-white transition-colors drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] break-words hyphens-none [overflow-wrap:break-word]">
              &ldquo;{item.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-4 border-t border-white/[0.07] pt-5">
              <span
                aria-hidden
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} font-display text-sm font-black text-white shadow-lg transition-transform duration-500 group-hover:scale-110`}
              >
                {initials(item.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black tracking-tight text-white break-words">{item.name}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-arch-primary break-words">
                  {item.arch}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </Reveal.Group>
    </section>
  );
}
