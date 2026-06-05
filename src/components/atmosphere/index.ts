/**
 * MindReset atmosphere module — barrel export.
 *
 *   import { Atmosphere, VolumetricFog, FloatingSymbols, ScanLines } from "@/components/atmosphere";
 */

export { VolumetricFog } from "./VolumetricFog";
export type { VolumetricFogProps, VolumetricFogIntensity } from "./VolumetricFog";

export { FloatingSymbols } from "./FloatingSymbols";
export type {
  FloatingSymbolsProps,
  FloatingSymbolsSet,
  FloatingSymbolsDensity,
} from "./FloatingSymbols";

export { ScanLines } from "./ScanLines";
export type { ScanLinesProps, ScanLinesIntensity, ScanLinesSpeed } from "./ScanLines";

export { Atmosphere } from "./Atmosphere";
export type {
  AtmosphereProps,
  AtmosphereFog,
  AtmosphereSymbols,
  AtmosphereScan,
} from "./Atmosphere";
