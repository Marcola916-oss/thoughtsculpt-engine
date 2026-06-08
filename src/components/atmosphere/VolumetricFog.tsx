/**
 * VolumetricFog — Atmospheric fog/mist layer for the MindReset visual system.
 *
 * Three overlapping layers:
 * - L1 base radial gradient (warm haze from the upper centre)
 * - L2 diagonal light beam (top-left to bottom-right)
 * - L3 three breathing blur orbs (slow opacity + scale pulse)
 *
 * Pure CSS. No JS in the loop. Animations are defined in src/styles.css
 * (fog-breathe-1/2/3 keyframes) and respect prefers-reduced-motion.
 *
 * @example
 *   <VolumetricFog intensity="subtle" />                    // scrolls with page
 *   <VolumetricFog intensity="dramatic" pinned />            // fixed full viewport
 *   <VolumetricFog intensity="normal" reducedMotion />      // explicit no-motion
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
  reducedMotion,
  className,
}: VolumetricFogProps) {
  const positionClass = pinned ? "fixed" : "absolute";

  return (
    <div
      aria-hidden
      data-fog-intensity={intensity}
      className={cn(
        positionClass,
        "inset-0",
        "pointer-events-none",
        "overflow-hidden",
        "z-[2]", // Fog stays just above the base background
        // Optimize mobile opacity and disable fog by default on very slow devices
        "opacity-40 md:opacity-100",
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

      {/* L2 — diagonal light beam (top-left to bottom-right) */}
      {intensity !== "subtle" && <div className="fog-layer-beam absolute inset-0" />}

      {/* L3 — breathing orbs - Reduced to 1 on mobile and no blur filter */}
      <div
        className="fog-breathe-1 absolute -left-[10%] top-[18%] h-[55vmin] w-[55vmin] rounded-full"
        style={{
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          filter: "var(--fog-blur-1, blur(70px))",
        }}
      />
      <div
        className="fog-breathe-2 absolute -right-[8%] top-[44%] h-[50vmin] w-[50vmin] rounded-full hidden md:block"
        style={{
          background: "radial-gradient(circle, var(--accent-glow-strong) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="fog-breathe-3 absolute left-[28%] bottom-[10%] h-[42vmin] w-[42vmin] rounded-full hidden md:block"
        style={{
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}

export const VolumetricFog = memo(VolumetricFogImpl);
VolumetricFog.displayName = "VolumetricFog";
