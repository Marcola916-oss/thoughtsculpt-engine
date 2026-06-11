/**
 * FloatingSymbols — Background currency / math symbols drifting in the void.
 *
 * Distinct from the "Archetype Badges" pattern in routes/index.tsx: those
 * carry text labels and archetype colors. FloatingSymbols is purely
 * typographic glyphs at low opacity, atmospheric only.
 *
 * SSR-safe: positions and timings are seeded (no Math.random in render).
 * Each symbol hides on mobile (display: none) once the count crosses the
 * breakpoint threshold, so small viewports stay uncluttered.
 *
 * @example
 *   <FloatingSymbols set="currency" count={8} />
 *   <FloatingSymbols set="mixed" density="dense" withGlow />
 */

import { memo } from "react";
import { cn } from "@/lib/utils";

export type FloatingSymbolsSet = "currency" | "mixed" | "math";
export type FloatingSymbolsDensity = "sparse" | "normal" | "dense";

export interface FloatingSymbolsProps {
  /** Which symbol collection to draw from. */
  set?: FloatingSymbolsSet;
  /** How many symbols to render (1-16). Default 8. */
  count?: number;
  /** Density controls the visible character weight and motion. */
  density?: FloatingSymbolsDensity;
  /** Add a soft red drop-shadow glow. */
  withGlow?: boolean;
  /** Override prefers-reduced-motion. */
  reducedMotion?: boolean;
  /** Fixed in viewport (default) or absolute in parent. */
  pinned?: boolean;
  className?: string;
}

const SYMBOL_SETS: Record<FloatingSymbolsSet, string[]> = {
  currency: ["€", "$", "¥", "₿", "£", "¢"],
  mixed: ["€", "$", "¥", "₿", "£", "¢", "×", "÷", "≈", "π"],
  math: ["×", "÷", "≈", "π", "Σ", "Δ", "∞", "∂", "∫", "∮"],
};

/**
 * Seeded positions. Deterministic between SSR and CSR.
 * `mobileHidden` hides the symbol on viewports narrower than md (768px)
 * to keep small screens clean. About half the slots are mobile-hidden.
 */
interface SeededSlot {
  x: number;
  y: number;
  size: number;
  driftX: number;
  driftY: number;
  delay: number;
  duration: number;
  opacity: number;
  mobileHidden: boolean;
}

const SEEDED_SLOTS: SeededSlot[] = [
  {
    x: 8,
    y: 14,
    size: 22,
    driftX: 14,
    driftY: -22,
    delay: 0,
    duration: 14,
    opacity: 0.14,
    mobileHidden: false,
  },
  {
    x: 78,
    y: 18,
    size: 26,
    driftX: -16,
    driftY: -18,
    delay: 2,
    duration: 16,
    opacity: 0.12,
    mobileHidden: false,
  },
  {
    x: 15,
    y: 42,
    size: 20,
    driftX: 18,
    driftY: 20,
    delay: 1,
    duration: 18,
    opacity: 0.16,
    mobileHidden: true,
  },
  {
    x: 88,
    y: 52,
    size: 24,
    driftX: -20,
    driftY: 14,
    delay: 3,
    duration: 15,
    opacity: 0.13,
    mobileHidden: true,
  },
  {
    x: 45,
    y: 8,
    size: 18,
    driftX: 10,
    driftY: 24,
    delay: 0.5,
    duration: 17,
    opacity: 0.1,
    mobileHidden: false,
  },
  {
    x: 65,
    y: 78,
    size: 22,
    driftX: -12,
    driftY: -20,
    delay: 2.5,
    duration: 16,
    opacity: 0.15,
    mobileHidden: true,
  },
  {
    x: 25,
    y: 85,
    size: 20,
    driftX: 16,
    driftY: -14,
    delay: 1.5,
    duration: 14,
    opacity: 0.12,
    mobileHidden: true,
  },
  {
    x: 92,
    y: 88,
    size: 24,
    driftX: -18,
    driftY: 12,
    delay: 3.5,
    duration: 19,
    opacity: 0.13,
    mobileHidden: false,
  },
  {
    x: 38,
    y: 30,
    size: 16,
    driftX: 22,
    driftY: 16,
    delay: 0.8,
    duration: 20,
    opacity: 0.11,
    mobileHidden: true,
  },
  {
    x: 58,
    y: 60,
    size: 18,
    driftX: -14,
    driftY: -22,
    delay: 4,
    duration: 18,
    opacity: 0.1,
    mobileHidden: true,
  },
  {
    x: 12,
    y: 68,
    size: 16,
    driftX: 12,
    driftY: 18,
    delay: 2.2,
    duration: 16,
    opacity: 0.11,
    mobileHidden: true,
  },
  {
    x: 82,
    y: 38,
    size: 18,
    driftX: -20,
    driftY: 16,
    delay: 1.2,
    duration: 17,
    opacity: 0.1,
    mobileHidden: true,
  },
];

const DENSITY_OPACITY: Record<FloatingSymbolsDensity, number> = {
  sparse: 0.8,
  normal: 1.2,
  dense: 1.6,
};

const DENSITY_BLUR: Record<FloatingSymbolsDensity, string> = {
  sparse: "blur-[1px]",
  normal: "blur-[0.5px]",
  dense: "",
};

function FloatingSymbolsImpl({
  set = "currency",
  count = 8,
  density = "normal",
  withGlow = false,
  reducedMotion,
  pinned = true,
  className,
}: FloatingSymbolsProps) {
  const positionClass = pinned ? "fixed" : "absolute";
  const symbols = SYMBOL_SETS[set];
  const opacityMul = DENSITY_OPACITY[density];
  const blurClass = DENSITY_BLUR[density];
  const visible = SEEDED_SLOTS.slice(0, 12); // Always show all 12 slots for premium feel

  return (
    <div
      aria-hidden
      data-floating-set={set}
      className={cn(
        positionClass,
        "inset-0",
        "pointer-events-none",
        pinned ? "z-[5]" : "z-[1]", // Positioned firmly in front of the background layer

        "overflow-hidden",
        reducedMotion === true ? "motion-reduce" : "motion-safe",
        className,
      )}
    >
      {visible.map((slot, i) => {
        const char = symbols[i % symbols.length];
        // Elements are now pure white for maximum visibility on black, but very low opacity
        const finalOpacity = Math.min(slot.opacity * opacityMul, 0.45); // Slightly higher opacity for visibility
        return (
          <span
            key={i}
            aria-hidden
            className={cn(
              "absolute select-none font-serif leading-none",
              slot.mobileHidden && "block md:block", // Never hide on mobile
              "symbol-drift",
              blurClass,
              withGlow && "symbol-glow",
            )}
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              fontSize: `${slot.size}px`,
              opacity: 0.35, // Increased opacity to 35% for guaranteed visibility 
              color: "#FFFFFF", // Pure white for symbols
              animationDelay: `${slot.delay}s`,
              animationDuration: `${slot.duration}s`,
              willChange: "transform, opacity",
              ["--drift-x" as string]: `${slot.driftX}px`,
              ["--drift-y" as string]: `${slot.driftY}px`,
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}

export const FloatingSymbols = memo(FloatingSymbolsImpl);
FloatingSymbols.displayName = "FloatingSymbols";
