import { memo } from "react";
import { cn } from "@/lib/utils";

interface BackgroundAmbientProps {
  variant?: "landing" | "dashboard";
  className?: string;
}

/**
 * BackgroundAmbient - Extreme Contrast Version
 * 
 * Forces the background to the absolute backmost layer (z-[-9999])
 * and ensures a solid black base with minimal peripheral glow to 
 * guarantee text readability and element separation.
 */
export const BackgroundAmbient = memo(({ variant = "landing", className }: BackgroundAmbientProps) => {
  return (
    <div 
      className={cn(
        "pointer-events-none fixed inset-0",
        "z-[-9999]", // Force to the bottom-most layer
        "bg-black",   // Solid black foundation
        className
      )}
      style={{ isolation: 'isolate' }}
    >
      {/* The animated atmospheric layer defined in styles.css */}
      <div className="flowing-ambient absolute inset-0 opacity-40" />
      
      {/* Dark mask to ensure center legibility remains perfect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_80%)]" />
      
      {/* Final black overlay to dampen any aggressive light */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
});

BackgroundAmbient.displayName = "BackgroundAmbient";