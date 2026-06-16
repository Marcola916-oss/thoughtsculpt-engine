import { memo } from "react";
import { cn } from "@/lib/utils";
import aoAsset from "@/assets/archetype-ao.jpg.asset.json";
import ssAsset from "@/assets/archetype-ss.jpg.asset.json";
import eaAsset from "@/assets/archetype-ea.jpg.asset.json";
import hiAsset from "@/assets/archetype-hi.jpg.asset.json";

export type ArchetypeCode = "AO" | "SS" | "EA" | "HI";

const POSTERS: Record<ArchetypeCode, { url: string; glow: string; ring: string }> = {
  AO: { url: aoAsset.url, glow: "rgba(15, 76, 92, 0.55)", ring: "rgba(56, 140, 168, 0.35)" },
  SS: { url: ssAsset.url, glow: "rgba(124, 58, 237, 0.55)", ring: "rgba(201, 168, 76, 0.30)" },
  EA: { url: eaAsset.url, glow: "rgba(100, 116, 139, 0.45)", ring: "rgba(148, 163, 184, 0.25)" },
  HI: { url: hiAsset.url, glow: "rgba(249, 115, 22, 0.55)", ring: "rgba(251, 191, 36, 0.35)" },
};

export interface ArchetypeRevealPosterProps {
  archetype: ArchetypeCode;
  className?: string;
  priority?: boolean;
}

/**
 * ArchetypeRevealPoster — cinematic campaign poster per archetype.
 * Premium dark editorial visual; one image per archetype, color-coordinated halos.
 */
const Impl = ({ archetype, className, priority = false }: ArchetypeRevealPosterProps) => {
  const cfg = POSTERS[archetype];
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[440px] aspect-[3/4] select-none",
        className,
      )}
    >
      {/* outer atmospheric halo */}
      <div
        aria-hidden
        className="absolute -inset-12 rounded-[3rem] blur-[80px] opacity-80 animate-pulse"
        style={{ background: `radial-gradient(circle at 50% 45%, ${cfg.glow}, transparent 65%)` }}
      />
      {/* secondary ring glow */}
      <div
        aria-hidden
        className="absolute -inset-4 rounded-[2.25rem] blur-[40px] opacity-70"
        style={{ background: `radial-gradient(circle at 50% 50%, ${cfg.ring}, transparent 70%)` }}
      />

      {/* poster frame */}
      <div
        className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.85)]"
        style={{ background: "#000" }}
      >
        <img
          src={cfg.url}
          alt={`MindReset ${archetype} archetype poster`}
          width={768}
          height={1024}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        {/* film grain / scanlines tint */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)",
          }}
        />
        {/* bottom vignette to fuse with page bg */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        {/* top accent line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px"
          style={{ background: `linear-gradient(to right, transparent, ${cfg.glow}, transparent)` }}
        />
      </div>
    </div>
  );
};

export const ArchetypeRevealPoster = memo(Impl);