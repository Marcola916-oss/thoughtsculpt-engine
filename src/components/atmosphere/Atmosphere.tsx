/**
 * Atmosphere — Single-import orchestrator for VolumetricFog + FloatingSymbols + ScanLines.
 *
 * Tier-aware: detects device capability and adjusts layer count automatically.
 *
 * - "low":    1 breathing orb, no floating symbols, subtle scan lines
 * - "medium": 2 breathing orbs, 4 sparse symbols, subtle scan lines
 * - "high":   3 orbs, full symbols, beam, scan lines — desktop full magic
 *
 * @example
 *   <Atmosphere fog="dramatic" scan="subtle">{children}</Atmosphere>
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useDeviceTier, type DeviceTier } from "@/hooks/use-device-tier";
import { VolumetricFog, type VolumetricFogIntensity } from "./VolumetricFog";
import {
  FloatingSymbols,
  type FloatingSymbolsDensity,
  type FloatingSymbolsSet,
} from "./FloatingSymbols";
import { ScanLines, type ScanLinesIntensity } from "./ScanLines";
import { BackgroundAmbient } from "./BackgroundAmbient";

export type AtmosphereFog = "off" | VolumetricFogIntensity;
export type AtmosphereSymbols = "off" | FloatingSymbolsDensity;
export type AtmosphereScan = "off" | ScanLinesIntensity;

export interface AtmosphereProps {
  /** Fog layer. Default 'off'. */
  fog?: AtmosphereFog;
  /** Floating symbols layer. Density maps to fog-like intensity. Default 'off'. */
  symbols?: AtmosphereSymbols;
  /** Scan lines layer. Default 'off'. */
  scan?: AtmosphereScan;
  /** Which symbol collection to use when symbols != 'off'. Default 'currency'. */
  symbolsSet?: FloatingSymbolsSet;
  /** Pin all layers to the viewport (default true). */
  pinned?: boolean;
  /** Forwarded to the wrapper. */
  className?: string;
  children?: ReactNode;
  /** Whether to show the base ambient background (default true if fog/scan used) */
  withAmbient?: boolean;
}

const FOG_TO_INTENSITY: Record<VolumetricFogIntensity, VolumetricFogIntensity> = {
  subtle: "subtle",
  normal: "normal",
  dramatic: "dramatic",
};

const SYMBOLS_TO_DENSITY: Record<FloatingSymbolsDensity, FloatingSymbolsDensity> = {
  sparse: "sparse",
  normal: "normal",
  dense: "dense",
};

/** How many orbs to render per tier */
const TIER_ORBS: Record<DeviceTier, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/** How many floating symbols to render per tier */
const TIER_SYMBOLS: Record<DeviceTier, number> = {
  low: 0,
  medium: 4,
  high: 8,
};

/** Opacity multiplier for scan lines per tier */
const TIER_SCAN_OPACITY: Record<DeviceTier, string> = {
  low: "opacity-15",
  medium: "opacity-20",
  high: "opacity-100",
};

export function Atmosphere({
  fog = "off",
  symbols = "off",
  scan = "off",
  symbolsSet = "currency",
  pinned = true,
  className,
  children,
  withAmbient = false,
}: AtmosphereProps) {
  const tier = useDeviceTier();

  // Premium experience: always show effects regardless of tier detection
  const effectiveFog = fog;
  const effectiveSymbols = symbols;
  const effectiveScan = scan;

  const showFog = effectiveFog !== "off";
  // Ensure symbols show up even if tier detection is conservative
  const showSymbols = effectiveSymbols !== "off";
  const showScan = effectiveScan !== "off";

  return (
    <div aria-hidden="true" className={cn("relative z-10 pointer-events-none", className)}>
      <BackgroundAmbient variant="landing" className="z-[-1]" />

      {/* Fog — tier-aware orb count */}
      {showFog && (
        <VolumetricFog
          intensity={FOG_TO_INTENSITY[effectiveFog]}
          pinned={pinned}
          maxOrbs={TIER_ORBS[tier]}
          className={cn(
            "opacity-100", // Force full opacity for fog

          )}
        />
      )}

      {/* Floating symbols — tier-aware count */}
      {showSymbols && (
        <FloatingSymbols
          set={symbolsSet}
          count={TIER_SYMBOLS[tier]}
          density={SYMBOLS_TO_DENSITY[effectiveSymbols]}
          pinned={pinned}
          withGlow={true} // Always enable glow for premium feel
          className="z-[5]"
        />
      )}

      {/* Scan lines — tier-aware opacity */}
      {showScan && (
        <ScanLines
          intensity={effectiveScan}
          pinned={pinned}
          className="opacity-100" // Force full opacity for scan lines
        />
      )}

      <div className="relative z-20 pointer-events-auto min-h-screen">
        {children}
      </div>
    </div>
  );
}
