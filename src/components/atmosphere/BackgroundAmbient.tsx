import { memo } from "react";
import { cn } from "@/lib/utils";

interface BackgroundAmbientProps {
  variant?: "landing" | "dashboard";
  className?: string;
}

export const BackgroundAmbient = memo(({ variant = "landing", className }: BackgroundAmbientProps) => {
  return (
    <div className={cn("flowing-ambient pointer-events-none fixed inset-0 z-[-10]", className)}>
      <div className="absolute inset-0 bg-black" />
      
      {/* Dynamic Mesh Orbs */}
      <div 
        className={cn(
          "absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] mix-blend-screen opacity-20",
          variant === "landing" ? "bg-arch-primary animate-pulse" : "bg-primary/40 animate-pulse"
        )} 
        style={{ animationDuration: '8s' }}
      />
      
      <div 
        className={cn(
          "absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] mix-blend-screen opacity-15",
          variant === "landing" ? "bg-accent-dark animate-pulse" : "bg-arch-primary/30 animate-pulse"
        )}
        style={{ animationDuration: '12s', animationDelay: '2s' }}
      />

      {/* Grid Pattern with subtle opacity */}
      <div className="absolute inset-0 grid-pattern opacity-[0.03]" />
      
      {/* Noise Overlay */}
      <div className="noise-overlay opacity-[0.02]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-40" />
    </div>
  );
});

BackgroundAmbient.displayName = "BackgroundAmbient";
