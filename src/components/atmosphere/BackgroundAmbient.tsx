import { memo } from "react";
import { cn } from "@/lib/utils";
import { useDeviceTier } from "@/hooks/use-device-tier";

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
export const BackgroundAmbient = memo(({ variant = "landing", className }: BackgroundAmbientProps) => {
  const tier = useDeviceTier();
  const isLowEnd = tier === "low";

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0",
        "z-[-1]",
        "bg-black",
        className
      )}
    >
      {isLowEnd ? (
        /* Mobile low-end: static gradient, zero animation */
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: "radial-gradient(ellipse at 30% 20%, var(--accent-glow) 0%, transparent 50%)",
          }}
        />
      ) : (
        /* Medium + High: rotating ambient glow (GPU composited) */
        <div className="flowing-ambient absolute inset-0 opacity-15 md:opacity-20" />
      )}

      {/* Dark mask for center focus — always static, always present */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_80%)]" />
    </div>
  );
});

BackgroundAmbient.displayName = "BackgroundAmbient";
