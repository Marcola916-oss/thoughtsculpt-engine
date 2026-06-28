import type { Archetype } from "@/lib/quiz/scoring";

type Props = {
  archetype: Archetype;
  /** Which frame (1..50) to render. */
  frame: number;
  /** Optional eyebrow caption shown above the bust. */
  eyebrow?: string;
  /** Optional one-liner shown below the bust. */
  caption?: string;
  /** Variant — adjusts internal vertical accent placement. */
  variant?: "opening" | "midpoint" | "closing";
};

/**
 * MobileSculptureStation — inline mobile-only "window" that anchors the
 * sculpture to a specific moment of the page instead of floating behind
 * everything as a fixed wallpaper.
 *
 * Each station is a self-contained scene: archetype halo + cinematic
 * frame brackets + static WebP frame + optional copy. Three of these
 * (opening / midpoint / closing) replace the lg:hidden fixed wallpaper
 * that used to fight the copy for contrast.
 */
export function MobileSculptureStation({
  archetype,
  frame,
  eyebrow,
  caption,
  variant = "midpoint",
}: Props) {
  const padded = String(Math.max(1, Math.min(50, frame))).padStart(4, "0");
  const src = `/anim-webp/ArtePV_${padded}.webp`;

  return (
    <section
      aria-hidden={!eyebrow && !caption}
      data-arch={archetype}
      data-variant={variant}
      className="sales-mobile-station relative my-10 lg:hidden"
    >
      <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-[2rem]">
        {/* Halo */}
        <div aria-hidden className="sales-mobile-station__halo" />

        {/* Bust frame */}
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.6))" }}
        />

        {/* Cinematic brackets */}
        <svg
          aria-hidden
          viewBox="0 0 400 400"
          className="sales-mobile-station__ring"
          preserveAspectRatio="xMidYMid meet"
        >
          <circle cx="200" cy="200" r="178" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="62 18" opacity="0.55" />
          <g stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7">
            <path d="M 12 36 L 12 12 L 36 12" />
            <path d="M 364 12 L 388 12 L 388 36" />
            <path d="M 388 364 L 388 388 L 364 388" />
            <path d="M 36 388 L 12 388 L 12 364" />
          </g>
        </svg>

        {/* Bottom fade so the next copy block reads cleanly */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
      </div>

      {(eyebrow || caption) && (
        <div className="mx-auto mt-5 max-w-[420px] px-4 text-center">
          {eyebrow && (
            <p
              className="text-[10px] font-bold uppercase tracking-[0.4em]"
              style={{ color: "var(--arch-primary)" }}
            >
              {eyebrow}
            </p>
          )}
          {caption && (
            <p className="mt-2 text-sm font-medium text-white/80">{caption}</p>
          )}
        </div>
      )}
    </section>
  );
}

export default MobileSculptureStation;