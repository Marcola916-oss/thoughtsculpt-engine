import { memo } from "react";
import { cn } from "@/lib/utils";
import brainImage from "@/assets/brain-circuit.png";

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
  const isProgress = progress < 100;
  const clipPath = isProgress
    ? `inset(${100 - progress}% 0 0 0)`
    : undefined;
  const glowSize = Math.round(size * 0.6);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
    >
      {withGlow && (
        <>
          <div
            className={cn(
              "absolute rounded-full pointer-events-none",
              animated && "brain-glow-pulse",
            )}
            style={{
              width: glowSize,
              height: glowSize,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(204,0,0,0.55) 0%, rgba(204,0,0,0.25) 35%, rgba(204,0,0,0) 70%)",
              filter: "blur(28px)",
              willChange: "opacity, transform",
            }}
          />
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 55%, rgba(204,0,0,0.15) 0%, transparent 60%)",
            }}
          />
        </>
      )}
      <img
        src={brainImage}
        alt=""
        aria-hidden
        width={size}
        height={size}
        loading={variant === "hero" ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className={cn(
          "relative block w-full h-full object-contain select-none",
          animated && "brain-image-pulse",
        )}
        style={{
          clipPath,
          WebkitClipPath: clipPath,
          filter:
            "drop-shadow(0 0 12px rgba(204,0,0,0.55)) drop-shadow(0 0 28px rgba(204,0,0,0.35))",
          transition: isProgress ? "clip-path 200ms linear" : undefined,
          willChange: "clip-path, filter",
        }}
      />
    </div>
  );
});
CircuitBrain.displayName = "CircuitBrain";
