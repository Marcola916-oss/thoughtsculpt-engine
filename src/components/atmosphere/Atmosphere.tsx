/**
 * Atmosphere — Single-import orchestrator for VolumetricFog + FloatingSymbols + ScanLines.
 *
 * Use this when a page wants a complete atmosphere with a one-liner.
 * For surgical opt-in (e.g. only scan lines on the dashboard), import the
 * individual components instead.
 *
 * @example
 *   <Atmosphere fog="dramatic" scan="subtle">{children}</Atmosphere>
 *   <Atmosphere fog="subtle" symbols="subtle" scan="normal" pinned />
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
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
  return (
    <div aria-hidden="true" className={cn("relative", className)}>
      {withAmbient && <BackgroundAmbient variant="landing" />}
      {fog !== "off" && <VolumetricFog intensity={FOG_TO_INTENSITY[fog]} pinned={pinned} />}
      {symbols !== "off" && (
        <FloatingSymbols
          set={symbolsSet}
          density={SYMBOLS_TO_DENSITY[symbols]}
          pinned={pinned}
          withGlow={symbols === "dense"}
        />
      )}
      {scan !== "off" && <ScanLines intensity={scan} pinned={pinned} />}
      {children}
    </div>
  );
}
