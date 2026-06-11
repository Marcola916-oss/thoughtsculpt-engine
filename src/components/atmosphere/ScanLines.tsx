/**
 * ScanLines — CRT-style horizontal scan overlay.
 *
 * Two layers:
 * - Static repeating horizontal lines (always on when component is rendered)
 * - A moving bright scan line that travels top-to-bottom (only on `crt` intensity)
 *
 * Uses the existing `@keyframes scan-line` already in src/styles.css. Adds
 * a new `.scan-crt-lines` and `.scan-overlay` pair to consume it.
 *
 * @example
 *   <ScanLines intensity="subtle" />          // static CRT pattern only
 *   <ScanLines intensity="crt" speed="slow" /> // pattern + moving scan line
 */

import { memo } from "react";
import { cn } from "@/lib/utils";

export type ScanLinesIntensity = "subtle" | "normal" | "crt";
export type ScanLinesSpeed = "slow" | "normal" | "fast";

export interface ScanLinesProps {
  intensity?: ScanLinesIntensity;
  /** Duration of one scan pass. Only affects `crt` intensity. */
  speed?: ScanLinesSpeed;
  /** Fixed in viewport (default) or absolute in parent. */
  pinned?: boolean;
  className?: string;
}

const SPEED_DURATION: Record<ScanLinesSpeed, string> = {
  slow: "14s",
  normal: "8s",
  fast: "5s",
};

const OVERLAY_OPACITY: Record<ScanLinesIntensity, string> = {
  subtle: "opacity-50",
  normal: "opacity-75",
  crt: "opacity-100",
};

function ScanLinesImpl({
  intensity = "subtle",
  speed = "normal",
  pinned = true,
  className,
}: ScanLinesProps) {
  const positionClass = pinned ? "fixed" : "absolute";

  return (
    <div
      aria-hidden
      data-scan-intensity={intensity}
      className={cn(
        positionClass,
        "inset-0",
        "pointer-events-none",
        pinned ? "z-[1]" : "z-0",
        "scan-overlay",
        // Subtler on mobile to reduce rendering cost
        "opacity-100",
        "opacity-100 mix-blend-screen",
        className,
      )}
    >
      {/* Static CRT horizontal pattern */}
      <div className="scan-crt-lines absolute inset-0" />

      {/* Moving scan line — only at crt intensity */}
      {intensity === "crt" && (
        <div
          className="scan-move absolute inset-0"
          style={{ animationDuration: SPEED_DURATION[speed], willChange: "transform" }}
        >
          <div
            className="absolute inset-x-0 top-0 h-[1.5px]"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)",
              boxShadow: "0 0 14px var(--accent-glow)",
            }}
          />
        </div>
      )}
    </div>
  );
}

export const ScanLines = memo(ScanLinesImpl);
ScanLines.displayName = "ScanLines";
