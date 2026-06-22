/**
 * MindReset identity module — barrel export.
 * Trimmed in Phase A (MVP cleanup). Variants kept here are those still
 * used by the funnel (landing → quiz → reveal → checkout → thanks).
 */

export { MarbleBust } from "./MarbleBust";
export type { MarbleBustProps, MarbleBustVariant, MarbleBustIntensity } from "./MarbleBust";

export { BustLoader } from "./BustLoader";
export type { BustLoaderProps } from "./BustLoader";

export { BustEmptyState } from "./BustEmptyState";
export type { BustEmptyStateProps } from "./BustEmptyState";

export { IdentitySymbol } from "./IdentitySymbol";
export type { IdentitySymbolProps } from "./IdentitySymbol";

export { CircuitBrain } from "./CircuitBrain";
export type { CircuitBrainProps, CircuitBrainVariant, BrainStyle } from "./CircuitBrain";

export { Logo } from "./Logo";
export { ArchetypeRevealArt } from "./ArchetypeRevealArt";
