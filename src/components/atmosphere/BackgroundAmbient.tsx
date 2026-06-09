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
        "z-[-100]", 
        "bg-black",
        className
      )}
    >
      {/* The animated atmospheric layer - Lower opacity on mobile */}
      <div className="flowing-ambient absolute inset-0 opacity-10 md:opacity-20" />
      
      {/* Dark mask for center focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_80%)]" />
    </div>
  );
});

BackgroundAmbient.displayName = "BackgroundAmbient";