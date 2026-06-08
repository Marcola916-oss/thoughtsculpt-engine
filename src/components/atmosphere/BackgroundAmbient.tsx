import { memo } from "react";
import { cn } from "@/lib/utils";

interface BackgroundAmbientProps {
  variant?: "landing" | "dashboard";
  className?: string;
}

export const BackgroundAmbient = memo(({ variant = "landing", className }: BackgroundAmbientProps) => {
  return (
    <div className={cn("flowing-ambient pointer-events-none fixed inset-0 z-[-10] overflow-hidden bg-black", className)}>
      {/* Background stays pure black for absolute legibility */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Primary Ambient Light - MOVED COMPLETELY TO PERIPHERY */}
      {/* This ensures NO glow ever touches the center 60% of the screen */}
      <div 
        className={cn(
          "absolute top-[-30%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[160px] mix-blend-screen opacity-10",
          variant === "landing" ? "bg-arch-primary animate-pulse" : "bg-primary/30 animate-pulse"
        )} 
        style={{ animationDuration: '14s' }}
      />
      
      <div 
        className={cn(
          "absolute bottom-[-30%] right-[-20%] w-[50%] h-[50%] rounded-full blur-[160px] mix-blend-screen opacity-10",
          variant === "landing" ? "bg-accent-dark animate-pulse" : "bg-arch-primary/20 animate-pulse"
        )}
        style={{ animationDuration: '18s', animationDelay: '4s' }}
      />

      {/* Grid pattern - Made even more subtle */}
      <div className="absolute inset-0 grid-pattern opacity-[0.01]" />
      
      {/* CRITICAL: Central Legibility Mask */}
      {/* This creates a large 'dead zone' for background elements right behind the text */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_65%)] opacity-80" />

      {/* Noise Overlay */}
      <div className="noise-overlay opacity-[0.01]" />
    </div>
  );
});

BackgroundAmbient.displayName = "BackgroundAmbient";
