/**
 * ArchetypeHover — 3D tilt + spotlight glow + reveal slot for archetype cards.
 *
 * Wraps any card-like surface in a premium hover treatment:
 * - 3D tilt (±maxTilt degrees) that tracks the cursor within the card
 * - Spotlight glow that follows the mouse (reuses `use-mouse-position`)
 * - Optional reveal slot at the bottom that slides up on hover
 * - Per-archetype accent colours (AO/SS/EA/HI), or default red
 *
 * Touch devices and reduced-motion users see the spotlight + reveal but
 * no tilt — accessibility preserved.
 *
 * @example
 *   <ArchetypeHover archetype="SS" maxTilt={10}
 *     revealSlot={<button>View deep analysis →</button>}>
 *     <h3>Status Seeker</h3>
 *     <p>You buy identity through spending.</p>
 *   </ArchetypeHover>
 */

import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { useMousePosition } from "@/hooks/use-mouse-position";
import { cn } from "@/lib/utils";

export type ArchetypeCode = "AO" | "SS" | "EA" | "HI";

interface ArchetypeToken {
  primary: string;
  glow: string;
  glowStrong: string;
}

const ARCHETYPE_TOKENS: Record<ArchetypeCode, ArchetypeToken> = {
  AO: { primary: "#38BDF8", glow: "rgba(56,189,248,0.30)", glowStrong: "rgba(56,189,248,0.55)" },
  SS: { primary: "#EAB308", glow: "rgba(234,179,8,0.30)", glowStrong: "rgba(234,179,8,0.55)" },
  EA: { primary: "#94A3B8", glow: "rgba(148,163,184,0.30)", glowStrong: "rgba(148,163,184,0.55)" },
  HI: { primary: "#EF4444", glow: "rgba(239,68,68,0.30)", glowStrong: "rgba(239,68,68,0.55)" },
};

const DEFAULT_TOKENS: ArchetypeToken = {
  primary: "var(--accent)",
  glow: "var(--accent-glow)",
  glowStrong: "var(--accent-glow-strong)",
};

export interface ArchetypeHoverProps {
  /** Optional archetype code to apply the matching colour palette. */
  archetype?: ArchetypeCode;
  /** Max tilt in degrees on each axis. Default 8. */
  maxTilt?: number;
  /** Spotlight intensity 0-1. Default 1. */
  glowIntensity?: number;
  /** Slot rendered at the bottom, revealed on hover. */
  revealSlot?: ReactNode;
  /** Disable the entire effect (still renders wrapper). */
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function ArchetypeHover({
  archetype,
  maxTilt = 8,
  glowIntensity = 1,
  revealSlot,
  disabled = false,
  className,
  children,
}: ArchetypeHoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  useMousePosition(ref);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || reducedMotion) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: -(ny - 0.5) * 2 * maxTilt,
      y: (nx - 0.5) * 2 * maxTilt,
    });
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const tokens = archetype ? ARCHETYPE_TOKENS[archetype] : DEFAULT_TOKENS;
  const allowTilt = !disabled && !reducedMotion;
  const tiltTransform = allowTilt
    ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
    : "perspective(1000px)";

  return (
    <div
      ref={ref}
      data-archetype-hover={archetype ?? "default"}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("archetype-hover relative isolate", isHovered && "is-hovered", className)}
      style={
        {
          "--arch-primary": tokens.primary,
          "--arch-glow": tokens.glow,
          "--arch-glow-strong": tokens.glowStrong,
          "--glow-intensity": String(glowIntensity),
        } as React.CSSProperties
      }
    >
      {/* Animated gradient border (visible on hover) */}
      <div
        aria-hidden
        className="archetype-hover-border pointer-events-none absolute inset-0 z-[2]"
      />

      {/* Tilt inner */}
      <div
        className="archetype-hover-tilt relative h-full w-full"
        style={{
          transform: tiltTransform,
          transition: "transform 0.18s ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Spotlight glow following cursor */}
        <div
          aria-hidden
          className="archetype-hover-glow pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: `radial-gradient(420px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--arch-glow), transparent 55%)`,
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.35s ease",
          }}
        />

        {/* Main content */}
        <div className="relative z-[1] h-full w-full">{children}</div>

        {/* Reveal slot (bottom) */}
        {revealSlot && (
          <div
            className="archetype-hover-reveal pointer-events-auto absolute inset-x-0 bottom-0 z-[2] p-4"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: `translateY(${isHovered ? "0" : "12px"})`,
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            {revealSlot}
          </div>
        )}
      </div>
    </div>
  );
}
