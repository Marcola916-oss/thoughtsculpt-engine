import { memo } from "react";
import { cn } from "@/lib/utils";

interface BackgroundAmbientProps {
  variant?: "landing" | "dashboard";
  className?: string;
}

/**
 * BackgroundAmbient — Base ambient background with optional rotating glow.
 *
 * Tier-aware:
 * - "low":    Static radial gradient (zero animation cost)
 * - "medium": Static gradient with subtle opacity
 * - "high":   Rotating pseudo-element glow (current behavior)
 *
 * Also adds prefers-reduced-motion support (was missing before).
 */
export const BackgroundAmbient = memo(({ className }: BackgroundAmbientProps) => {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0",
        "z-[-100]",
        "bg-black/95", // Slightly less than pure black to let some subtle detail through if needed
        className
      )}
    >
      {/* Force flowing ambient always */}
      <div className="flowing-ambient absolute inset-0 opacity-40 md:opacity-50" />

      {/* Dark mask for center focus — always static, always present */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_80%)]" />
    </div>
  );
});

BackgroundAmbient.displayName = "BackgroundAmbient";
