/**
 * CircuitBrain — MindReset digital identity symbol.
 *
 * A human brain silhouette (lateral view) entirely filled with PCB traces,
 * solder pads, and a central chip. Represents computational intelligence
 * and cutting-edge technology.
 *
 * NOT marble. NOT stone. NOT organic. It's a DIGITAL BRAIN made of
 * electronic circuit board (PCB).
 *
 * Pure inline SVG. No external assets, no runtime fetch.
 * Animations driven by CSS classes paired with @keyframes in src/styles.css.
 *
 * @example
 *   <CircuitBrain size={48} variant="mini" />
 *   <CircuitBrain variant="loader" />
 *   <CircuitBrain variant="hero" archetype="AO" />
 */

import { memo } from "react";
import { cn } from "@/lib/utils";

export type CircuitBrainVariant = "hero" | "loader" | "mini" | "icon";
export type BrainStyle = "premium" | "neon" | "archetype";

export interface CircuitBrainProps {
  /** Rendered width and height in pixels. Defaults follow variant. */
  size?: number;
  /** Visual variant controlling size defaults and detail level. */
  variant?: CircuitBrainVariant;
  /** Color style. "premium" = white/silver, "neon" = rainbow, "archetype" = archetype color. */
  style?: BrainStyle;
  /** Archetype code for style="archetype". Determines chip/trace color. */
  archetype?: "AO" | "SS" | "EA" | "HI";
  /** Toggle ambient glow behind the brain. */
  withGlow?: boolean;
  /** Toggle node pulse animation. */
  animated?: boolean;
  /** Accessible name. Defaults to "Circuit Brain". */
  ariaLabel?: string;
  /** Optional className for the wrapper. */
  className?: string;
}

/* Archetype color map */
const ARCH_COLORS: Record<string, { primary: string; glow: string; gradient: [string, string] }> = {
  AO: { primary: "#4A9EFF", glow: "rgba(74,158,255,0.6)", gradient: ["#2563EB", "#60A5FA"] },
  SS: { primary: "#FBBF24", glow: "rgba(251,191,36,0.6)", gradient: ["#D97706", "#FCD34D"] },
  EA: { primary: "#A78BFA", glow: "rgba(167,139,250,0.6)", gradient: ["#7C3AED", "#C4B5FD"] },
  HI: { primary: "#FB923C", glow: "rgba(251,146,60,0.6)", gradient: ["#EA580C", "#FDBA74"] },
};

/* Size defaults per variant */
const SIZE_MAP: Record<CircuitBrainVariant, number> = {
  hero: 320,
  loader: 140,
  mini: 40,
  icon: 24,
};

function CircuitBrainInner({
  size,
  variant = "loader",
  style = "premium",
  archetype,
  withGlow = true,
  animated = true,
  ariaLabel = "Circuit Brain",
  className,
}: CircuitBrainProps) {
  const s = size ?? SIZE_MAP[variant];
  const archColor = archetype ? ARCH_COLORS[archetype] : null;

  /* Resolve colors based on style */
  const traceColor =
    style === "archetype" && archColor
      ? archColor.primary
      : style === "neon"
        ? "#FFFFFF"
        : "#C8C8C8";

  const traceGlow =
    style === "archetype" && archColor
      ? archColor.glow
      : style === "neon"
        ? "rgba(255,255,255,0.5)"
        : "rgba(255,255,255,0.4)";

  const chipColor =
    style === "archetype" && archColor
      ? archColor.primary
      : "#FFFFFF";

  const chipGlow =
    style === "archetype" && archColor
      ? archColor.glow
      : "rgba(255,255,255,0.8)";

  const padColor =
    style === "archetype" && archColor
      ? archColor.primary
      : "#FFFFFF";

  /* Neon gradient ID */
  const neonGradId = `neon-grad-${variant}`;

  /* Premium gradient for traces */
  const premiumGradId = `premium-grad-${variant}`;

  /* Detail level: hero/loader get full detail, mini/icon get simplified */
  const isDetailed = variant === "hero" || variant === "loader";

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: s, height: s }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox="0 0 240 240"
        width={s}
        height={s}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(animated && "circuit-brain-pulse")}
      >
        <defs>
          {/* Brain silhouette clip-path — lateral view */}
          <clipPath id={`brain-clip-${variant}`}>
            <path d={BRAIN_PATH} />
          </clipPath>

          {/* Premium trace gradient */}
          <linearGradient id={premiumGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8E8E8" />
            <stop offset="50%" stopColor="#C8C8C8" />
            <stop offset="100%" stopColor="#A0A0A0" />
          </linearGradient>

          {/* Neon rainbow gradient */}
          <linearGradient id={neonGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5555FF" />
            <stop offset="20%" stopColor="#00CC44" />
            <stop offset="40%" stopColor="#FF2222" />
            <stop offset="60%" stopColor="#FF6600" />
            <stop offset="80%" stopColor="#FFCC00" />
            <stop offset="100%" stopColor="#FF9900" />
          </linearGradient>

          {/* Glow filter for traces */}
          <filter id={`trace-glow-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Intense glow for chip */}
          <filter id={`chip-glow-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Softer glow for pads */}
          <filter id={`pad-glow-${variant}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Ambient glow radial */}
          <radialGradient id={`ambient-glow-${variant}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={chipColor} stopOpacity="0.15" />
            <stop offset="60%" stopColor={chipColor} stopOpacity="0.05" />
            <stop offset="100%" stopColor={chipColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient glow background */}
        {withGlow && (
          <circle
            cx="120"
            cy="110"
            r="100"
            fill={`url(#ambient-glow-${variant})`}
          />
        )}

        {/* PCB traces inside brain silhouette */}
        <g clipPath={`url(#brain-clip-${variant})`}>
          {/* Background fill for brain */}
          <path d={BRAIN_PATH} fill="#0A0A0A" />

          {/* Main traces */}
          <g
            filter={isDetailed ? `url(#trace-glow-${variant})` : undefined}
            stroke={style === "neon" ? `url(#${neonGradId})` : `url(#${premiumGradId})`}
            strokeWidth={isDetailed ? "1.2" : "1"}
            strokeLinecap="square"
          >
            {isDetailed ? FULL_TRACES : SIMPLE_TRACES}
          </g>

          {/* Solder pads at terminals */}
          <g filter={isDetailed ? `url(#pad-glow-${variant})` : undefined}>
            {(isDetailed ? FULL_PADS : SIMPLE_PADS).map((p, i) => (
              <circle
                key={i}
                cx={p[0]}
                cy={p[1]}
                r={p[2]}
                fill={padColor}
                opacity={p[3] ?? 1}
                className={animated && p[4] ? "circuit-node-pulse" : undefined}
              />
            ))}
          </g>

          {/* Central chip */}
          <g filter={`url(#chip-glow-${variant})`}>
            <rect
              x="108"
              y="98"
              width="24"
              height="24"
              rx="2"
              fill={chipColor}
              className={animated ? "circuit-chip-pulse" : undefined}
            />
            {/* Chip internal detail */}
            {isDetailed && (
              <>
                <line x1="112" y1="104" x2="128" y2="104" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.3" />
                <line x1="112" y1="108" x2="128" y2="108" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.3" />
                <line x1="112" y1="112" x2="128" y2="112" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.3" />
                <line x1="112" y1="116" x2="128" y2="116" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.3" />
                {/* Chip pin connectors */}
                <rect x="106" y="103" width="2" height="2" fill={chipColor} opacity="0.7" />
                <rect x="106" y="109" width="2" height="2" fill={chipColor} opacity="0.7" />
                <rect x="106" y="115" width="2" height="2" fill={chipColor} opacity="0.7" />
                <rect x="132" y="103" width="2" height="2" fill={chipColor} opacity="0.7" />
                <rect x="132" y="109" width="2" height="2" fill={chipColor} opacity="0.7" />
                <rect x="132" y="115" width="2" height="2" fill={chipColor} opacity="0.7" />
              </>
            )}
          </g>
        </g>

        {/* Brain outline — subtle, defined by traces */}
        <path
          d={BRAIN_PATH}
          fill="none"
          stroke={traceColor}
          strokeWidth="0.5"
          opacity="0.2"
        />
      </svg>
    </div>
  );
}

export const CircuitBrain = memo(CircuitBrainInner);

/* ============================================
   BRAIN SILHOUETTE — Lateral view, facing right
   ============================================ */
const BRAIN_PATH =
  "M120,30 C140,30 160,35 175,48 C190,61 198,80 200,100 C202,120 198,140 188,155 " +
  "C178,170 165,180 150,188 C140,194 128,198 118,200 C108,202 96,200 86,195 " +
  "C76,190 68,182 60,172 C52,162 48,150 46,138 C44,126 44,114 48,102 " +
  "C52,90 58,80 66,72 C74,64 84,58 95,52 C106,46 114,40 120,30 Z";

/* ============================================
   PCB TRACES — Straight lines, 90° angles
   ============================================ */

/* Full traces (hero/loader) — high density */
const FULL_TRACES = (
  <g>
    {/* Horizontal main bus — top */}
    <line x1="70" y1="60" x2="170" y2="60" />
    <line x1="75" y1="70" x2="165" y2="70" />
    <line x1="80" y1="80" x2="160" y2="80" />

    {/* Horizontal main bus — middle */}
    <line x1="60" y1="90" x2="175" y2="90" />
    <line x1="55" y1="100" x2="180" y2="100" />
    <line x1="55" y1="110" x2="180" y2="110" />
    <line x1="60" y1="120" x2="175" y2="120" />

    {/* Horizontal main bus — bottom */}
    <line x1="65" y1="130" x2="170" y2="130" />
    <line x1="70" y1="140" x2="160" y2="140" />
    <line x1="75" y1="150" x2="150" y2="150" />
    <line x1="80" y1="160" x2="140" y2="160" />

    {/* Vertical connectors — left */}
    <line x1="80" y1="55" x2="80" y2="165" />
    <line x1="90" y1="50" x2="90" y2="170" />
    <line x1="100" y1="45" x2="100" y2="175" />

    {/* Vertical connectors — center */}
    <line x1="110" y1="40" x2="110" y2="180" />
    <line x1="120" y1="35" x2="120" y2="185" />
    <line x1="130" y1="40" x2="130" y2="180" />

    {/* Vertical connectors — right */}
    <line x1="140" y1="45" x2="140" y2="175" />
    <line x1="150" y1="50" x2="150" y2="165" />
    <line x1="160" y1="55" x2="160" y2="155" />

    {/* 90° bends — L shapes */}
    <polyline points="70,60 70,80 80,80" />
    <polyline points="170,60 170,80 160,80" />
    <polyline points="55,100 55,120 65,120" />
    <polyline points="180,100 180,120 170,120" />
    <polyline points="80,160 80,170 90,170" />
    <polyline points="140,160 140,170 130,170" />

    {/* T-junctions */}
    <polyline points="100,80 100,90 110,90" />
    <polyline points="140,80 140,90 130,90" />
    <polyline points="100,130 100,120 110,120" />
    <polyline points="140,130 140,120 130,120" />

    {/* Diagonal-ish through 90° steps */}
    <polyline points="75,70 75,90 90,90 90,70" />
    <polyline points="165,70 165,90 150,90 150,70" />
    <polyline points="65,140 65,155 80,155 80,140" />
    <polyline points="155,140 155,155 140,155 140,140" />

    {/* Additional density traces */}
    <line x1="85" y1="65" x2="85" y2="145" />
    <line x1="95" y1="55" x2="95" y2="155" />
    <line x1="105" y1="50" x2="105" y2="165" />
    <line x1="115" y1="45" x2="115" y2="175" />
    <line x1="125" y1="45" x2="125" y2="175" />
    <line x1="135" y1="50" x2="135" y2="170" />
    <line x1="145" y1="55" x2="145" y2="160" />
    <line x1="155" y1="60" x2="155" y2="150" />

    {/* Cross-connects */}
    <polyline points="95,65 110,65 110,75" />
    <polyline points="145,65 130,65 130,75" />
    <polyline points="95,145 110,145 110,135" />
    <polyline points="145,145 130,145 130,135" />
  </g>
);

/* Simple traces (mini/icon) — reduced density */
const SIMPLE_TRACES = (
  <g>
    <line x1="80" y1="80" x2="160" y2="80" />
    <line x1="70" y1="100" x2="170" y2="100" />
    <line x1="80" y1="120" x2="160" y2="120" />
    <line x1="80" y1="140" x2="150" y2="140" />
    <line x1="100" y1="50" x2="100" y2="170" />
    <line x1="120" y1="40" x2="120" y2="180" />
    <line x1="140" y1="50" x2="140" y2="170" />
    <polyline points="80,80 80,100 100,100" />
    <polyline points="160,80 160,100 140,100" />
    <polyline points="80,120 80,140 100,140" />
    <polyline points="150,140 150,120 130,120" />
  </g>
);

/* ============================================
   SOLDER PADS — [cx, cy, r, opacity, animated?]
   ============================================ */

/* Full pads (hero/loader) */
const FULL_PADS: [number, number, number, number?, boolean?][] = [
  // Top bus terminals
  [70, 60, 2.5, 1, true],
  [170, 60, 2.5, 1, true],
  [75, 70, 2, 0.8],
  [165, 70, 2, 0.8],
  [80, 80, 2, 0.9],
  [160, 80, 2, 0.9],

  // Middle bus terminals
  [55, 100, 3, 1, true],
  [180, 100, 3, 1, true],
  [55, 110, 2.5, 0.9],
  [180, 110, 2.5, 0.9],
  [60, 120, 2, 0.8],
  [175, 120, 2, 0.8],

  // Bottom bus terminals
  [65, 130, 2, 0.9],
  [170, 130, 2, 0.9],
  [70, 140, 2, 0.8],
  [160, 140, 2, 0.8],
  [80, 160, 2.5, 1, true],
  [140, 160, 2.5, 1, true],

  // Vertical top terminals
  [80, 55, 2, 0.7],
  [90, 50, 2, 0.7],
  [100, 45, 2.5, 0.8],
  [110, 40, 2.5, 0.9],
  [120, 35, 3, 1, true],
  [130, 40, 2.5, 0.9],
  [140, 45, 2.5, 0.8],
  [150, 50, 2, 0.7],
  [160, 55, 2, 0.7],

  // Vertical bottom terminals
  [90, 170, 2, 0.7],
  [100, 175, 2, 0.7],
  [110, 180, 2.5, 0.8],
  [120, 185, 3, 1, true],
  [130, 180, 2.5, 0.8],
  [140, 175, 2, 0.7],
  [150, 165, 2, 0.7],

  // L-junction pads
  [70, 90, 1.5, 0.6],
  [170, 90, 1.5, 0.6],
  [65, 120, 1.5, 0.6],
  [170, 120, 1.5, 0.6],

  // T-junction pads
  [100, 90, 1.5, 0.5],
  [130, 90, 1.5, 0.5],
  [100, 120, 1.5, 0.5],
  [130, 120, 1.5, 0.5],

  // Cross-connect pads
  [95, 65, 1.5, 0.5],
  [145, 65, 1.5, 0.5],
  [95, 145, 1.5, 0.5],
  [145, 145, 1.5, 0.5],
];

/* Simple pads (mini/icon) */
const SIMPLE_PADS: [number, number, number, number?, boolean?][] = [
  [80, 80, 2, 1],
  [160, 80, 2, 1],
  [70, 100, 2.5, 1, true],
  [170, 100, 2.5, 1, true],
  [80, 120, 2, 1],
  [160, 120, 2, 1],
  [80, 140, 2, 0.8],
  [150, 140, 2, 0.8],
  [100, 50, 2, 0.8],
  [120, 40, 2.5, 1, true],
  [140, 50, 2, 0.8],
  [100, 170, 2, 0.8],
  [120, 180, 2.5, 1, true],
  [140, 170, 2, 0.8],
];
