/**
 * IdentitySymbol — Smart wrapper that picks the right variant.
 *
 * For "just put the symbol here" cases. Choose a size and let the component
 * decide between full / loader / mini / empty based on the rendering context.
 */

import { memo } from "react";
import { MarbleBust, type MarbleBustVariant } from "./MarbleBust";

export interface IdentitySymbolProps {
  size?: number;
  variant?: MarbleBustVariant;
  ariaLabel?: string;
}

const VARIANT_FOR_SIZE: Array<{ max: number; variant: MarbleBustVariant }> = [
  { max: 36, variant: "mini" },
  { max: 96, variant: "empty" },
  { max: Infinity, variant: "full" },
];

function pickVariant(size: number, explicit?: MarbleBustVariant): MarbleBustVariant {
  if (explicit) return explicit;
  return VARIANT_FOR_SIZE.find((r) => size <= r.max)!.variant;
}

function IdentitySymbolImpl({ size = 96, variant, ariaLabel = "MindReset" }: IdentitySymbolProps) {
  return (
    <MarbleBust
      size={size}
      variant={pickVariant(size, variant)}
      intensity={size >= 120 ? "dramatic" : "normal"}
      ariaLabel={ariaLabel}
    />
  );
}

export const IdentitySymbol = memo(IdentitySymbolImpl);
IdentitySymbol.displayName = "IdentitySymbol";
