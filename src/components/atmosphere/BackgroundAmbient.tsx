import { memo } from "react";
import { cn } from "@/lib/utils";

interface BackgroundAmbientProps {
  variant?: "landing" | "dashboard";
  className?: string;
}

export const BackgroundAmbient = memo(({ variant = "landing", className }: BackgroundAmbientProps) => {
  return (
    <div className={cn("flowing-ambient pointer-events-none fixed inset-0 z-[-10] overflow-hidden bg-black", className)}>
      {/* Background stays deep black to ensure text always has maximum contrast base */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Primary Ambient Light - Shifted away from text center to edges */}
      <div 
        className={cn(
          "absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[140px] mix-blend-screen opacity-10",
          variant === "landing" ? "bg-arch-primary animate-pulse" : "bg-primary/30 animate-pulse"
        )} 
        style={{ animationDuration: '12s' }}
      />
      
      <div 
        className={cn(
          "absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[140px] mix-blend-screen opacity-10",
          variant === "landing" ? "bg-accent-dark animate-pulse" : "bg-arch-primary/20 animate-pulse"
        )}
        style={{ animationDuration: '15s', animationDelay: '3s' }}
      />

      {/* Grid stays very subtle as texture, doesn't fight for attention */}
      <div className="absolute inset-0 grid-pattern opacity-[0.02]" />
      
      {/* Central Mask - CRITICAL: This ensures the center behind the text is always darker */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_80%)] opacity-60" />

      {/* Noise Overlay */}
      <div className="noise-overlay opacity-[0.015]" />
    </div>
  );
});

BackgroundAmbient.displayName = "BackgroundAmbient";
