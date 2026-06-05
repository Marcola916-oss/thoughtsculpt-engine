/**
 * BustMini — Compact identity symbol for navbar, buttons, favicons.
 *
 * Wraps MarbleBust with sensible defaults for tight spaces.
 * Drops halo, smoke, hair details, and currency symbols by default.
 */

import { memo } from "react";
import { MarbleBust, type MarbleBustProps } from "./MarbleBust";
import { cn } from "@/lib/utils";

export interface BustMiniProps extends Omit<MarbleBustProps, "variant" | "withSmoke"> {
  className?: string;
}

function BustMiniImpl({
  size = 28,
  intensity = "normal",
  ariaLabel = "MindReset",
  className,
  ...rest
}: BustMiniProps) {
  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      aria-hidden={ariaLabel === undefined}
    >
      <MarbleBust
        size={size}
        variant="mini"
        intensity={intensity}
        withSmoke={false}
        ariaLabel={ariaLabel}
        {...rest}
      />
    </span>
  );
}

export const BustMini = memo(BustMiniImpl);
BustMini.displayName = "BustMini";
