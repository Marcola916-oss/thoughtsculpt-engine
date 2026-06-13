import { memo } from "react";
import brainImg from "@/assets/reveal-brain.png";

/**
 * ArchetypeBrain — Pixel-art brain colored per archetype.
 * Based on the spec from melhoria_visual-3.docx (Mudança 1).
 *
 * - AO → #CC0000 (red)   - hue 0
 * - SS → #FFD700 (gold)  - hue 45
 * - EA → #4A90D9 (blue)  - hue 200
 * - HI → #FF6B00 (orange)- hue 20
 */

export type ArchetypeKey = "AO" | "SS" | "EA" | "HI";

const ARCHETYPE_COLORS: Record<ArchetypeKey, string> = {
  AO: "#CC0000",
  SS: "#FFD700",
  EA: "#4A90D9",
  HI: "#FF6B00",
};

const ARCHETYPE_NAMES: Record<ArchetypeKey, string> = {
  AO: "Accumulator Obsessive",
  SS: "Status Seeker",
  EA: "Escapist Alienated",
  HI: "Hedonist Impulsivo",
};

const HUE_ROTATE: Record<ArchetypeKey, number> = {
  AO: 0,
  SS: 45,
  EA: 200,
  HI: 20,
};

export interface ArchetypeBrainProps {
  archetype: ArchetypeKey;
  /** When false, hides the internal "Seu arquétipo é" label + H1 (host page already renders them). */
  showName?: boolean;
  /** Brain image size in px. */
  size?: number;
  /** Optional override for the small label above the H1. */
  label?: string;
  className?: string;
}

const ArchetypeBrainImpl = ({
  archetype,
  showName = true,
  size = 220,
  label = "Seu arquétipo é",
  className,
}: ArchetypeBrainProps) => {
  const color = ARCHETYPE_COLORS[archetype];
  const name = ARCHETYPE_NAMES[archetype];
  const hue = HUE_ROTATE[archetype];

  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
      }}
    >
      {/* Glow background */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: size * 1.4,
          height: size * 1.4,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}55 0%, ${color}22 35%, transparent 70%)`,
          filter: "blur(40px)",
          animation: "pulse-glow 3s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Pixel-art brain */}
      <img
        src={brainImg}
        alt={`Cérebro do arquétipo ${name}`}
        width={size}
        height={size}
        draggable={false}
        style={{
          position: "relative",
          zIndex: 1,
          width: size,
          height: size,
          objectFit: "contain",
          imageRendering: "pixelated",
          filter: `drop-shadow(0 0 20px ${color}) drop-shadow(0 0 40px ${color}88) hue-rotate(${hue}deg)`,
          animation: "brain-rotate 3s ease-in-out infinite",
        }}
      />

      {showName && (
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <p
            style={{
              color: "#929698",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.875rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: "0.75rem",
            }}
          >
            {label}
          </p>
          <h1
            style={{
              color,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1,
            }}
          >
            {name}
          </h1>
        </div>
      )}

      <style>{`
        @keyframes brain-rotate {
          0%   { transform: scale(1)    rotate(-3deg); }
          25%  { transform: scale(1.05) rotate(0deg);  }
          50%  { transform: scale(1)    rotate(3deg);  }
          75%  { transform: scale(1.05) rotate(0deg);  }
          100% { transform: scale(1)    rotate(-3deg); }
        }
        @keyframes pulse-glow {
          0%   { opacity: 0.4; transform: translate(-50%, -50%) scale(0.9); }
          50%  { opacity: 1;   transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.9); }
        }
      `}</style>
    </div>
  );
};

export const ArchetypeBrain = memo(ArchetypeBrainImpl);
export default ArchetypeBrain;