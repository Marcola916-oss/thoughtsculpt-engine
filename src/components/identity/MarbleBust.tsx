/**
 * MarbleBust — MindReset visual identity symbol.
 *
 * A stylized hybrid bust (Marcus Aurelius + Seneca) carved from light marble,
 * split by a diagonal crack that reveals a red PCB circuit carrying currency
 * symbols. A power button glows on the chest. Red eyes on both sides.
 *
 * Pure inline SVG. No external assets, no runtime fetch, no framer-motion.
 * Animations are driven by CSS classes that pair with @keyframes defined
 * in src/styles.css (see bust-pulse, bust-breathing, crack-pulse,
 * energy-blink, circuit-scan, currency-float, smoke-drift). All keyframes
 * respect @media (prefers-reduced-motion: reduce).
 *
 * @example
 *   <MarbleBust size={64} variant="mini" />
 *   <MarbleBust variant="loader" intensity="dramatic" withSmoke />
 *   <MarbleBust variant="full" ariaLabel="MindReset" />
 */

import { memo } from "react";
import { cn } from "@/lib/utils";

export type MarbleBustVariant = "full" | "loader" | "mini" | "empty";
export type MarbleBustIntensity = "subtle" | "normal" | "dramatic";

export interface MarbleBustProps {
  /** Rendered width and height in pixels. Defaults to 96. */
  size?: number;
  /**
   * Visual density of the symbol.
   * - `full`   — all 11 layers, used in hero/onboarding
   * - `loader` — Q10 quiz loader, drops hair/beard curls for a cleaner pulse
   * - `mini`   — navbar/favicon, only bust + eyes + crack + power
   * - `empty`  — empty states, lower contrast, currency symbols float around
   */
  variant?: MarbleBustVariant;
  /**
   * Glow and animation strength. `subtle` mutes halo, `dramatic` widens it.
   */
  intensity?: MarbleBustIntensity;
  /** Toggle the red smoke behind the bust. Defaults to true on full/loader. */
  withSmoke?: boolean;
  /**
   * Manual override for prefers-reduced-motion. Useful in tests or when
   * wrapping in a section that already controls motion.
   */
  reducedMotion?: boolean;
  /** Accessible name. Defaults to "MindReset". */
  ariaLabel?: string;
  /** Optional className for the wrapper. */
  className?: string;
}

const INTENSITY_CLASS: Record<MarbleBustIntensity, string> = {
  subtle: "[--bust-halo-opacity:0.25] [--bust-glow-strength:0.6]",
  normal: "[--bust-halo-opacity:0.55] [--bust-glow-strength:1]",
  dramatic: "[--bust-halo-opacity:0.85] [--bust-glow-strength:1.4]",
};

function MarbleBustImpl({
  size = 96,
  variant = "full",
  intensity = "normal",
  withSmoke,
  reducedMotion,
  ariaLabel = "MindReset",
  className,
}: MarbleBustProps) {
  const showSmoke = withSmoke ?? (variant === "full" || variant === "loader");
  const isMini = variant === "mini";
  const isEmpty = variant === "empty";
  const motionClass = reducedMotion === true ? "motion-reduce" : "motion-safe";

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "inline-block align-middle",
        INTENSITY_CLASS[intensity],
        motionClass,
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 240 240"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <defs>
          {/* Red glow filter applied to circuit + eyes + power button */}
          <filter id="bust-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft halo blur for the ambient background glow */}
          <filter id="bust-halo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>

          {/* Light marble gradient for the bust body */}
          <linearGradient id="bust-marble" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.94 0.012 80)" />
            <stop offset="55%" stopColor="oklch(0.88 0.014 78)" />
            <stop offset="100%" stopColor="oklch(0.78 0.018 72)" />
          </linearGradient>

          {/* Subtle marble veining overlay */}
          <linearGradient id="bust-vein" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.7 0.01 70)" stopOpacity="0" />
            <stop offset="50%" stopColor="oklch(0.65 0.012 70)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="oklch(0.7 0.01 70)" stopOpacity="0" />
          </linearGradient>

          {/* Red eye core — Marcus (left) is wider, Seneca (right) is sharper */}
          <radialGradient id="eye-marcus" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="oklch(0.85 0.22 25)" />
            <stop offset="55%" stopColor="oklch(0.55 0.22 25)" />
            <stop offset="100%" stopColor="oklch(0.35 0.18 25)" />
          </radialGradient>
          <radialGradient id="eye-seneca" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="oklch(0.9 0.25 22)" />
            <stop offset="60%" stopColor="oklch(0.5 0.23 22)" />
            <stop offset="100%" stopColor="oklch(0.3 0.18 22)" />
          </radialGradient>

          {/* Smoke gradient — fades from translucent red to transparent */}
          <linearGradient id="bust-smoke" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="oklch(0.45 0.18 25)" stopOpacity="0" />
            <stop offset="60%" stopColor="oklch(0.5 0.2 25)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="oklch(0.55 0.2 25)" stopOpacity="0" />
          </linearGradient>

          {/* Bust silhouette clipPath — used to clip hair, beard, smoke */}
          <clipPath id="bust-silhouette">
            <path
              d="M120 18
                     C 96 18, 80 36, 80 60
                     C 80 78, 84 96, 88 116
                     C 90 126, 92 134, 96 140
                     L 88 152
                     C 88 158, 86 162, 80 168
                     L 28 178
                     C 22 180, 18 184, 18 192
                     L 18 222
                     L 222 222
                     L 222 192
                     C 222 184, 218 180, 212 178
                     L 160 168
                     C 154 162, 152 158, 152 152
                     L 144 140
                     C 148 134, 150 126, 152 116
                     C 156 96, 160 78, 160 60
                     C 160 36, 144 18, 120 18 Z"
            />
          </clipPath>
        </defs>

        {/* L0 — Halo (ambient red glow behind the bust) */}
        {!isMini && (
          <g className="bust-halo" style={{ opacity: "var(--bust-halo-opacity, 0.55)" }}>
            <circle cx="120" cy="120" r="100" fill="oklch(0.5 0.22 25)" filter="url(#bust-halo)" />
          </g>
        )}

        {/* L1 — Smoke (ambient red atmosphere) */}
        {showSmoke && (
          <g
            className="bust-smoke"
            style={{ mixBlendMode: "screen" }}
            clipPath="url(#bust-silhouette)"
          >
            <path
              d="M 40 220 C 60 180, 80 200, 100 170 C 120 140, 140 180, 160 150 C 180 120, 200 160, 210 130 L 210 222 L 30 222 Z"
              fill="url(#bust-smoke)"
              opacity="0.55"
            />
            <path
              d="M 60 220 C 80 190, 100 200, 120 180 C 140 160, 160 190, 180 165 C 195 145, 205 170, 210 155 L 210 222 L 50 222 Z"
              fill="url(#bust-smoke)"
              opacity="0.4"
            />
          </g>
        )}

        {/* L2 — Bust silhouette (marble base) */}
        <path
          className="bust-body"
          d="M120 18
             C 96 18, 80 36, 80 60
             C 80 78, 84 96, 88 116
             C 90 126, 92 134, 96 140
             L 88 152
             C 88 158, 86 162, 80 168
             L 28 178
             C 22 180, 18 184, 18 192
             L 18 222
             L 222 222
             L 222 192
             C 222 184, 218 180, 212 178
             L 160 168
             C 154 162, 152 158, 152 152
             L 144 140
             C 148 134, 150 126, 152 116
             C 156 96, 160 78, 160 60
             C 160 36, 144 18, 120 18 Z"
          fill="url(#bust-marble)"
          stroke="oklch(0.55 0.02 70)"
          strokeWidth="0.6"
        />

        {/* Subtle marble veining overlay on bust */}
        {!isMini && (
          <path
            d="M120 18
               C 96 18, 80 36, 80 60
               C 80 78, 84 96, 88 116
               C 90 126, 92 134, 96 140
               L 88 152
               C 88 158, 86 162, 80 168
               L 28 178
               C 22 180, 18 184, 18 192
               L 18 222
               L 222 222
               L 222 192
               C 222 184, 218 180, 212 178
               L 160 168
               C 154 162, 152 158, 152 152
               L 144 140
               C 148 134, 150 126, 152 116
               C 156 96, 160 78, 160 60
               C 160 36, 144 18, 120 18 Z"
            fill="url(#bust-vein)"
            opacity="0.7"
            pointerEvents="none"
          />
        )}

        {/* L3 — Hair curls (top of head) */}
        {(variant === "full" || variant === "loader") && (
          <g className="bust-hair" clipPath="url(#bust-silhouette)">
            {/* Top row of curls */}
            {[78, 90, 102, 114, 126, 138, 150].map((cx, i) => (
              <path
                key={`hair-top-${i}`}
                d={`M ${cx} 30 a 8 8 0 0 1 12 0`}
                fill="none"
                stroke="oklch(0.2 0.01 70)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            ))}
            {/* Sideburn curls */}
            <path
              d="M 82 60 a 6 6 0 0 1 8 4 M 82 70 a 6 6 0 0 1 8 4 M 82 80 a 6 6 0 0 1 8 4"
              fill="none"
              stroke="oklch(0.2 0.01 70)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 158 60 a 6 6 0 0 0 -8 4 M 158 70 a 6 6 0 0 0 -8 4 M 158 80 a 6 6 0 0 0 -8 4"
              fill="none"
              stroke="oklch(0.2 0.01 70)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Beard curls under chin */}
            <path
              d="M 100 138 a 5 5 0 0 0 6 4 M 110 142 a 5 5 0 0 0 6 4 M 120 144 a 5 5 0 0 0 6 2 M 130 142 a 5 5 0 0 0 6 0 M 140 138 a 5 5 0 0 0 6 -2"
              fill="none"
              stroke="oklch(0.2 0.01 70)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* L4 — Facial features (brow, nose, mouth) */}
        {(variant === "full" || variant === "loader") && (
          <g className="bust-face" opacity="0.7">
            {/* Brow shadow — a faint horizontal band */}
            <path
              d="M 88 70 Q 120 64, 152 70"
              fill="none"
              stroke="oklch(0.5 0.02 70)"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.5"
            />
            {/* Nose — a small triangular ridge */}
            <path
              d="M 116 86 L 120 106 L 124 86"
              fill="none"
              stroke="oklch(0.45 0.02 70)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Mouth — stoic horizontal line */}
            <path
              d="M 108 122 L 132 122"
              fill="none"
              stroke="oklch(0.4 0.02 70)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* L5 — Eyes (red glow) */}
        <g className="bust-eyes" filter="url(#bust-glow)">
          {/* Marcus eye — wider, slightly oval, with inner core */}
          <g className="bust-eye-marcus">
            <ellipse cx="102" cy="80" rx="6.5" ry="4" fill="url(#eye-marcus)" />
            <circle cx="102" cy="80" r="1.4" fill="oklch(0.95 0.05 60)" />
          </g>
          {/* Seneca eye — sharper, slightly narrower, with inner core */}
          <g className="bust-eye-seneca">
            <ellipse cx="138" cy="80" rx="5.5" ry="3.6" fill="url(#eye-seneca)" />
            <circle cx="138" cy="80" r="1.4" fill="oklch(0.95 0.05 60)" />
          </g>
        </g>

        {/* L6 — Crack (diagonal split) */}
        <path
          className="bust-crack"
          d="M 86 32
             C 92 48, 98 62, 104 78
             C 110 94, 116 110, 124 128
             C 132 146, 142 164, 152 180
             C 158 190, 164 198, 170 206"
          fill="none"
          stroke="oklch(0.18 0.02 70)"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Crack inner glow — red light bleeding out */}
        <path
          className="bust-crack-glow"
          d="M 86 32
             C 92 48, 98 62, 104 78
             C 110 94, 116 110, 124 128
             C 132 146, 142 164, 152 180
             C 158 190, 164 198, 170 206"
          fill="none"
          stroke="oklch(0.6 0.24 25)"
          strokeWidth="1"
          strokeLinecap="round"
          filter="url(#bust-glow)"
        />

        {/* L7 — Circuit board (PCB traces following the crack) */}
        {variant !== "mini" && (
          <g
            className="bust-circuit"
            filter="url(#bust-glow)"
            stroke="oklch(0.6 0.22 25)"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Main trace — the spine */}
            <path d="M 92 40 L 96 56 L 102 60 L 106 76 L 112 80 L 118 96 L 122 112 L 130 128 L 136 146 L 144 162 L 150 178 L 158 192" />
            {/* Branch 1 — to left eye area */}
            <path d="M 96 56 L 88 60 L 84 70" />
            <circle cx="84" cy="70" r="1.6" fill="oklch(0.7 0.22 25)" />
            {/* Branch 2 — to left cheek */}
            <path d="M 112 80 L 100 92 L 92 100" />
            <circle cx="92" cy="100" r="1.6" fill="oklch(0.7 0.22 25)" />
            {/* Branch 3 — to right eye area */}
            <path d="M 130 128 L 142 124 L 148 116" />
            <circle cx="148" cy="116" r="1.6" fill="oklch(0.7 0.22 25)" />
            {/* Branch 4 — to right shoulder */}
            <path d="M 150 178 L 162 176 L 174 180" />
            <circle cx="174" cy="180" r="1.6" fill="oklch(0.7 0.22 25)" />
            {/* Branch 5 — to chest */}
            <path d="M 158 192 L 152 200 L 140 202" />
            <circle cx="140" cy="202" r="1.6" fill="oklch(0.7 0.22 25)" />
            {/* Junctions on the spine */}
            <circle cx="96" cy="56" r="1.8" fill="oklch(0.75 0.22 25)" />
            <circle cx="112" cy="80" r="1.8" fill="oklch(0.75 0.22 25)" />
            <circle cx="130" cy="128" r="1.8" fill="oklch(0.75 0.22 25)" />
            <circle cx="150" cy="178" r="1.8" fill="oklch(0.75 0.22 25)" />
          </g>
        )}

        {/* L8 — Currency symbols (at trace terminals) */}
        {variant === "full" || isEmpty ? (
          <g
            className="bust-currency"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="700"
            fontSize="11"
            textAnchor="middle"
            fill="oklch(0.7 0.22 25)"
            filter="url(#bust-glow)"
            opacity={isEmpty ? 0.85 : 0.95}
          >
            <text x="78" y="73">
              €
            </text>
            <text x="86" y="105">
              $
            </text>
            <text x="154" y="115">
              ¥
            </text>
            <text x="180" y="183">
              ₿
            </text>
            <text x="134" y="207">
              $
            </text>
          </g>
        ) : null}

        {/* L9 — Power button on chest (⏻ symbol in a circular shield) */}
        <g transform="translate(120 184)">
          <g className="bust-power">
            <circle
              r="9"
              fill="oklch(0.15 0.01 70)"
              stroke="oklch(0.6 0.22 25)"
              strokeWidth="1.2"
              filter="url(#bust-glow)"
            />
            <circle
              r="5"
              fill="none"
              stroke="oklch(0.7 0.22 25)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="18 7"
              transform="rotate(-90)"
            />
            <rect x="-1.2" y="-6.5" width="2.4" height="5" rx="1" fill="oklch(0.75 0.22 25)" />
          </g>
        </g>

        {/* L10 — Forehead brand mark (subtle, only in full) */}
        {variant === "full" && (
          <g opacity="0.5">
            <path
              d="M 114 56 L 120 50 L 126 56"
              fill="none"
              stroke="oklch(0.35 0.02 70)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

export const MarbleBust = memo(MarbleBustImpl);
MarbleBust.displayName = "MarbleBust";
