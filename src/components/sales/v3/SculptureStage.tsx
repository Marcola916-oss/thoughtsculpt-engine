import { type RefObject } from "react";
import type { Archetype } from "@/lib/quiz/scoring";
import { ScrollAnimationSequence } from "./ScrollAnimationSequence";
import { SculptureParticles } from "./SculptureParticles";

type Props = {
  archetype: Archetype;
  targetRef: RefObject<HTMLElement | null>;
};

/**
 * SculptureStage — Desktop "Cinematic Frame" wrapper around the scroll art.
 *
 * Layers (back → front):
 *  1. Spotlight bridge: conic + radial archetype glow that leaks LEFT into
 *     the copy column, killing the "art floating in dead space" feeling.
 *  2. Frame ring SVG: thin archetype scanner ring + 4 corner markers that
 *     align with the currency symbols (€ £ $ ¢) baked into the artwork.
 *  3. Halo (radial blur).
 *  4. The actual ScrollAnimationSequence canvas.
 *  5. Drifting particles on top.
 *
 * All layers react to `--arch-halo` (0..1) set on the page root by the
 * IntersectionObserver in SalesPageV2, so the frame breathes with the copy.
 */
export function SculptureStage({ archetype, targetRef }: Props) {
  return (
    <aside
      className="pointer-events-none relative hidden lg:block h-full sales-sculpture-col"
      data-arch={archetype}
    >
      {/* Spotlight bridge — leaks archetype light back into the copy column */}
      <div aria-hidden className="sales-spotlight-bridge" />

      <div
        className="sticky top-16 h-[calc(100vh-4rem)] w-full sales-sculpture-mask"
        style={{ perspective: "1200px" }}
      >
        <div
          className="relative w-full h-full transition-transform duration-700 ease-out"
          style={{ transform: "rotateY(-2deg)", transformOrigin: "center center" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "rotateY(0deg) scale(1.02)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "rotateY(-2deg)"; }}
        >
          {/* Radial halo behind the bust */}
          <div aria-hidden className="sales-sculpture-halo" />

          {/* Cinematic frame ring — anchored to the artwork's currency symbols */}
          <FrameRing />

          <ScrollAnimationSequence archetype={archetype} targetRef={targetRef} />
          <SculptureParticles count={18} />
        </div>
      </div>
    </aside>
  );
}

/**
 * FrameRing — viewport-locked SVG. Thin archetype ring with 4 dashed arcs
 * (top/right/bottom/left) leaving gaps where currency symbols sit on the art.
 * Corner brackets reinforce the "diagnostic scanner" narrative.
 */
function FrameRing() {
  return (
    <svg
      aria-hidden
      className="sales-frame-ring"
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="ringFade" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </radialGradient>
      </defs>

      {/* 4 dashed arcs — gaps at 0/90/180/270 align with the £ $ € ¢ on the artwork */}
      <circle
        cx="200" cy="200" r="178"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="62 18"
        opacity="0.55"
      />

      {/* Inner ultra-thin orbit */}
      <circle
        cx="200" cy="200" r="158"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.25"
      />

      {/* 4 corner brackets — cinematic viewfinder */}
      <g stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7">
        <path d="M 12 36 L 12 12 L 36 12" />
        <path d="M 364 12 L 388 12 L 388 36" />
        <path d="M 388 364 L 388 388 L 364 388" />
        <path d="M 36 388 L 12 388 L 12 364" />
      </g>
    </svg>
  );
}

export default SculptureStage;