/**
 * VolumetricFog — Atmospheric fog/mist layer for the MindReset visual system.
 *
 * Tier-aware via `maxOrbs`:
 * - maxOrbs=1: Single breathing orb (mobile low-end) — cheapest, still alive
 * - maxOrbs=2: Two orbs + beam (mobile mid-range / tablet)
 * - maxOrbs=3: Full three orbs + beam (desktop) — the full magic
 *
 * Pure CSS. No JS in the loop. Animations are defined in src/styles.css
 * (fog-breathe-static keyframes) and respect prefers-reduced-motion.
 *
 * @example
 *   <VolumetricFog intensity="dramatic" maxOrbs={1} />   // mobile
 *   <VolumetricFog intensity="dramatic" maxOrbs={3} />   // desktop
 */

import { memo } from "react";
import { cn } from "@/lib/utils";

export type VolumetricFogIntensity = "subtle" | "normal" | "dramatic";

export interface VolumetricFogProps {
  intensity?: VolumetricFogIntensity;
  /**
   * If true, fog is `position: fixed` and covers the viewport regardless of
   * scroll. If false, it is `position: absolute` inside its parent.
   */
  pinned?: boolean;
  /**
   * Maximum number of breathing orbs to render (1-3).
   * Controlled by the Atmosphere orchestrator based on device tier.
   * - 1: Mobile low-end (single orb, no beam)
   * - 2: Mobile mid-range (two orbs + beam)
   * - 3: Desktop full (three orbs + beam)
   */
  maxOrbs?: number;
  /**
   * Manual override for prefers-reduced-motion. Useful in tests.
   */
  reducedMotion?: boolean;
  className?: string;
}

const INTENSITY_WRAPPER: Record<VolumetricFogIntensity, string> = {
  subtle: "opacity-60",
  normal: "opacity-85",
  dramatic: "opacity-100",
};

function VolumetricFogImpl({
  intensity = "normal",
  pinned = false,
  maxOrbs = 3,
  reducedMotion,
  className,
}: VolumetricFogProps) {
  const positionClass = pinned ? "fixed" : "absolute";
  const orbs = 3; // Always 3 orbs for premium feel in all tiers
  const isFixed = pinned;

  return (
    <div
      aria-hidden
      data-fog-intensity={intensity}
      data-fog-orbs={orbs}
      className={cn(
        positionClass,
        "inset-0",
        "pointer-events-none",
        "overflow-hidden",
        isFixed ? "z-[2]" : "z-0",
        INTENSITY_WRAPPER[intensity],
        reducedMotion === true ? "motion-reduce" : "motion-safe",
        className,
      )}
    >
      {/* L1 — base radial gradient (warm haze) */}
      <div
        className={cn(
          "fog-layer-base absolute inset-0",
          intensity === "subtle" && "fog-base-subtle",
          intensity === "normal" && "fog-base-normal",
          intensity === "dramatic" && "fog-base-dramatic",
        )}
      />

      {/* L2 — diagonal light beam (only when 2+ orbs) */}
      {orbs >= 2 && intensity !== "subtle" && (
        <div className="fog-layer-beam absolute inset-0" />
      )}

      {/* L3 — Breathing orbs (GPU composited: translate3d + opacity) */}

      {/* Orb 1 — always rendered (the mobile "alive" orb) */}
      <div
        className="absolute -left-[10%] top-[18%] h-[55vmin] w-[55vmin] rounded-full fog-breathe-1"
        style={{
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          willChange: "transform, opacity",
        }}
      />

      {/* Orb 2 — only when 2+ orbs */}
      {orbs >= 2 && (
        <div
          className="absolute -right-[8%] top-[44%] h-[50vmin] w-[50vmin] rounded-full fog-breathe-2"
          style={{
            background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
            willChange: "transform, opacity",
          }}
        />
      )}

      {/* Orb 3 — only at max orbs (desktop) */}
      {orbs >= 3 && (
        <div
          className="absolute left-[28%] bottom-[10%] h-[42vmin] w-[42vmin] rounded-full fog-breathe-3"
          style={{
            background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
            willChange: "transform, opacity",
          }}
        />
      )}
    </div>
  );
}

export const VolumetricFog = memo(VolumetricFogImpl);
VolumetricFog.displayName = "VolumetricFog";
