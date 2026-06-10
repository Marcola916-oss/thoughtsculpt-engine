import { memo } from "react";
import { cn } from "@/lib/utils";

export interface CircuitBrainProps {
  size?: number;
  variant?: "hero" | "loader" | "mini" | "icon";
  withGlow?: boolean;
  animated?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const CircuitBrain = memo(({
  size = 160,
  variant = "loader",
  withGlow = true,
  animated = true,
  ariaLabel = "Brain",
  className,
}: CircuitBrainProps) => {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} className={cn(animated && "animate-pulse")}>
        <defs>
          <radialGradient id="brain-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#CC0000" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#CC0000" stopOpacity="0" />
          </radialGradient>
        </defs>
        {withGlow && <circle cx="100" cy="100" r="80" fill="url(#brain-glow)" />}
        <path
          d="M100,20 C130,20 160,30 170,60 C180,90 170,120 150,140 C130,160 100,170 80,160 C60,150 50,130 50,100 C50,70 70,50 100,20 Z"
          fill="none"
          stroke="#CC0000"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-primary"
        />
        {/* Simplified circuit lines */}
        <path d="M80,60 L120,60 M70,100 L130,100 M80,140 L120,140" stroke="#CC0000" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M100,40 L100,160" stroke="#CC0000" strokeWidth="1" strokeOpacity="0.5" />
      </svg>
    </div>
  );
});
CircuitBrain.displayName = "CircuitBrain";
