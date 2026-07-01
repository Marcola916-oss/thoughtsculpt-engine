import posterMoney from "@/assets/poster-money.jpg.asset.json";
import posterCareer from "@/assets/poster-career.jpg.asset.json";
import posterLove from "@/assets/poster-love.jpg.asset.json";
import posterPersonal from "@/assets/poster-personal.jpg.asset.json";

const POSTERS = {
  money: posterMoney.url,
  career: posterCareer.url,
  love: posterLove.url,
  personal: posterPersonal.url,
} as const;

export type Area = keyof typeof POSTERS;

/**
 * 4D area poster — real photographic art, score badge overlay, archetypal
 * accent border on hover.
 */
export function AreaPoster({
  area,
  title,
  description,
  score,
}: {
  area: Area;
  title: string;
  description: string;
  score: number;
}) {
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border bg-black transition-all duration-500 hover:-translate-y-1"
      style={{
        borderColor: "color-mix(in oklab, var(--arch-primary) 25%, transparent)",
        boxShadow: "0 20px 60px -30px color-mix(in oklab, var(--arch-primary) 50%, transparent)",
      }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={POSTERS[area]}
          alt=""
          loading="lazy"
          width={1024}
          height={1280}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.95) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(ellipse at 50% 90%, color-mix(in oklab, var(--arch-primary) 50%, transparent) 0%, transparent 60%)",
          }}
        />
        <span
          className="absolute end-3 top-3 rounded-full px-3 py-1 text-xs font-bold tabular-nums backdrop-blur-md"
          style={{
            background: "color-mix(in oklab, var(--arch-primary) 25%, rgba(0,0,0,0.55))",
            color: "white",
            border: "1px solid color-mix(in oklab, var(--arch-primary) 60%, transparent)",
          }}
        >
          {score}/100
        </span>
      </div>
      <div className="relative -mt-16 p-5 pt-0">
        <h3 className="font-display text-2xl font-extrabold leading-tight text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/75">{description}</p>
      </div>
    </article>
  );
}

export default AreaPoster;
