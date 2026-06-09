import { useEffect, useState } from "react";

export type DeviceTier = "low" | "medium" | "high";

/**
 * Detects device performance tier for progressive enhancement.
 *
 * - "low":    Mobile touch, low CPU/RAM → cheapest animations, fewer layers
 * - "medium": Mobile touch or mid-range → reduced layers, simplified effects
 * - "high":   Desktop with hover → full magic, all layers
 *
 * Detection is based on:
 * - Touch capability (hover: none)
 * - CPU cores (navigator.hardwareConcurrency)
 * - Device memory (navigator.deviceMemory — Chrome only)
 * - Screen width as fallback
 *
 * Returns "high" during SSR to avoid hydration mismatch.
 */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("high");

  useEffect(() => {
    const detected = detectTier();
    setTier(detected);
  }, []);

  return tier;
}

function detectTier(): DeviceTier {
  if (typeof window === "undefined") return "high";

  const isTouchDevice = window.matchMedia("(hover: none)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;
  const width = window.innerWidth;

  // Desktop with hover = always high
  if (!isTouchDevice && width >= 1024) return "high";

  // High-end mobile: 8+ cores, 6+ GB RAM, wide screen
  if (isTouchDevice && cores >= 8 && memory >= 6 && width >= 414) return "medium";

  // Mid-range: 4+ cores, 4+ GB RAM
  if (cores >= 4 && memory >= 4) return "medium";

  // Low-end: everything else (old phones, weak devices)
  return "low";
}

/**
 * CSS class helpers for tier-based styling.
 * Use in className strings: `${tierClass(tier, 'fog-mobile', 'fog-tablet', 'fog-desktop')}`
 */
export function tierClass<T extends string>(
  tier: DeviceTier,
  low: T,
  mid: T,
  high: T,
): T {
  if (tier === "low") return low;
  if (tier === "medium") return mid;
  return high;
}
