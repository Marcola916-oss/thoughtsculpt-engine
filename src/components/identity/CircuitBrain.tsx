import { memo } from "react";
import { cn } from "@/lib/utils";

export type CircuitBrainVariant = "hero" | "loader" | "mini" | "icon";
export type BrainStyle = "premium" | "neon" | "archetype";

export interface CircuitBrainProps {
  size?: number;
  variant?: CircuitBrainVariant;
  style?: BrainStyle;
  archetype?: "AO" | "SS" | "EA" | "HI";
  withGlow?: boolean;
  animated?: boolean;
  ariaLabel?: string;
  className?: string;
  progress?: number; // 0 to 100
}

export const CircuitBrain = memo(({
  size = 160,
  variant = "loader",
  style = "premium",
  archetype,
  withGlow = true,
  animated = true,
  ariaLabel = "Brain",
  className,
  progress = 100,
}: CircuitBrainProps) => {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {withGlow && (
        <div className="absolute inset-0 bg-[#CC0000]/10 blur-[40px] rounded-full animate-pulse pointer-events-none" />
      )}
      <svg viewBox="0 0 200 200" width={size} height={size} className={cn(animated && "animate-pulse")}>
        <defs>
          <radialGradient id="brain-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#CC0000" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#CC0000" stopOpacity="0" />
          </radialGradient>
          <mask id="brain-mask">
             <rect x="0" y={200 - (progress * 2)} width="200" height="200" fill="white" />
          </mask>
        </defs>
        
        <g mask={progress < 100 ? "url(#brain-mask)" : undefined}>
          <path
            d="M100,25 C135,25 165,35 175,65 C185,95 175,125 155,145 C135,165 100,175 80,165 C60,155 45,135 45,105 C45,75 65,55 100,25 Z"
            fill="none"
            stroke="#CC0000"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="stroke-primary"
            style={{ filter: "drop-shadow(0 0 8px #CC0000)" }}
          />
          
          <g stroke="#CC0000" strokeWidth="1" strokeOpacity="0.4" fill="none">
            <path d="M70,70 L130,70 M60,100 L140,100 M70,130 L130,130 M100,45 L100,155" />
            <circle cx="100" cy="70" r="2" fill="#CC0000" />
            <circle cx="100" cy="100" r="3" fill="#CC0000" />
            <circle cx="100" cy="130" r="2" fill="#CC0000" />
            <path d="M100,70 L120,85 L120,115 L100,130 L80,115 L80,85 Z" strokeOpacity="0.2" />
          </g>
        </g>
      </svg>
    </div>
  );
});
CircuitBrain.displayName = "CircuitBrain";
