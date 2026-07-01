import { Star } from "lucide-react";
import { Reveal } from "@/components/interaction/Reveal";
import { AnimatedCounter } from "@/components/sales/AnimatedCounter";
import adamPhoto from "@/assets/testimonials/adam.jpg";
import mariaPhoto from "@/assets/testimonials/maria.jpg";
import ramiPhoto from "@/assets/testimonials/rami.jpg";

const AVATAR_PHOTOS = [adamPhoto, mariaPhoto, ramiPhoto] as const;

type Testimonial = {
  stars: number;
  quote: string;
  author: string;
  country: string;
  arch: string;
  hasPhoto?: boolean;
};

interface SalesTestimonialsProps {
  counter: string;
  rating: string;
  testimonials: Testimonial[];
  lang: string;
}

function getArchLabel(arch: string, lang: string): string {
  const labels: Record<string, Record<string, string>> = {
    AO: {
      pt: "Guardião Obsessivo",
      en: "Obsessive Saver",
      pl: "Obsesyjna Oszczędna",
      ro: "Econom Obsesiv",
      ar: "المدخر القهري",
    },
    SS: {
      pt: "Caçador de Status",
      en: "Status Seeker",
      pl: "Poszukiwacz Statusu",
      ro: "Căutător de Statut",
      ar: "باحث عن المكانة",
    },
    EA: {
      pt: "Fantasma Evasivo",
      en: "Avoidant Ghost",
      pl: "Unikający Duch",
      ro: "Fantasmă Evazionistă",
      ar: "الشبح المتجنب",
    },
    HI: {
      pt: "Hedonista Impulsivo",
      en: "Impulsive Hedonist",
      pl: "Impulsywny Hedonista",
      ro: "Hedonist Impulsiv",
      ar: "الملذّ المندفع",
    },
  };
  return labels[arch]?.[lang] ?? arch;
}

function AvatarPlaceholder({ author, arch }: { author: string; arch: string }) {
  const initial = author.charAt(0).toUpperCase();
  return (
    <div
      aria-hidden
      className="h-11 w-11 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-1 ring-white/10"
      style={{
        background: `linear-gradient(135deg, var(--arch-primary), color-mix(in oklab, var(--arch-primary) 40%, black))`,
      }}
    >
      {initial}
    </div>
  );
}

export function SalesTestimonials({ counter, rating, testimonials, lang }: SalesTestimonialsProps) {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative mx-auto w-full max-w-7xl px-4 py-24 md:px-8 md:py-32"
    >
      <Reveal variant="fade-up" className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
        <span className="mb-5 inline-block rounded-full border border-arch-primary/30 bg-arch-primary/10 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-arch-primary shadow-[0_0_18px_-4px_var(--arch-glow)] badge-pulse">
          {rating}
        </span>
        <h2
          id="testimonials-heading"
          className="font-display font-extrabold uppercase text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.1] tracking-[-0.02em] text-balance break-words text-white"
        >
          <AnimatedCounter end={12000} prefix="+" className="inline" />{" "}
          {counter.replace(/\+\s?12[.,]?000\s?/i, "").trim()}
        </h2>
      </Reveal>

      <Reveal.Group
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        stagger="fast"
        amount={0.2}
      >
        {testimonials.map((item, i) => (
          <Reveal
            key={i}
            variant="fade-up"
            className="group flex flex-col gap-6 rounded-[2.5rem] border border-white/10 bg-black/40 p-6 sm:p-8 md:p-10 transition-all duration-500 hover:border-arch-primary/40 hover:bg-black/60 md:hover:-translate-y-2 shadow-2xl md:backdrop-blur-3xl overflow-hidden min-w-0"
          >
            <div
              className="flex items-center gap-1 text-amber-400 group-hover:text-amber-300 transition-colors"
              role="img"
              aria-label={`${item.stars} de ${item.stars} estrelas`}
            >
              {Array.from({ length: item.stars }).map((_, s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>

            <blockquote className="flex-1 font-sans text-[16px] font-semibold leading-[1.7] text-white/80 group-hover:text-white transition-colors drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] break-words hyphens-none [overflow-wrap:break-word]">
              &ldquo;{item.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-4 border-t border-white/[0.07] pt-5">
              {item.hasPhoto ? (
                <img
                  src={AVATAR_PHOTOS[i % AVATAR_PHOTOS.length]}
                  alt={item.author}
                  loading="lazy"
                  className="h-11 w-11 shrink-0 rounded-full object-cover object-center shadow-lg ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <AvatarPlaceholder author={item.author} arch={item.arch} />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm font-bold uppercase tracking-[0.12em] text-white break-words">
                  {item.author}
                </p>
                <p className="mt-0.5 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-arch-primary break-words whitespace-pre-line">
                  {item.country} · {getArchLabel(item.arch, lang)}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </Reveal.Group>
    </section>
  );
}
