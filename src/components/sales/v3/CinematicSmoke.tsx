/**
 * CinematicSmoke — true volumetric atmosphere for SalesPageV2.
 *
 * Generated (not painted) smoke built from layered radial gradients deformed
 * by an animated SVG turbulence filter. No PNGs, no hard rectangles, no
 * footer strip. Every layer fades to transparent via radial masks.
 *
 * Exports:
 *  - <SmokeTurbulence />  SVG <defs> with the animated displacement filter
 *                         reused by every smoke layer (`filter: url(#smoke-turb)`).
 *  - <NeckPlume />        dense plume anchored below the sculpture's neck
 *                         (~58% of the sticky <aside>), three sub-plumes in
 *                         parallax: deep / mid / drift.
 *  - <SideMist />         vertical mist column hugging the left edge with a
 *                         soft scroll parallax; archetype-tinted, never
 *                         competes with copy.
 *  - <GroundHaze />       breathing radial haze whose center sits OUTSIDE the
 *                         viewport (50% 115%) so it has zero visible edge.
 *
 * Performance:
 *  - high tier (desktop):   all 3 plume layers + turbulence + parallax
 *  - medium tier:           2 plume layers, no turbulence, no parallax
 *  - low tier (mobile):     1 plume layer, no turbulence, no parallax
 *  - prefers-reduced-motion is fully respected via styles.css guards.
 */

import { useEffect, useRef } from "react";
import { useDeviceTier } from "@/hooks/use-device-tier";

export function SmokeTurbulence() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed -left-[9999px] top-0 h-0 w-0"
      focusable="false"
    >
      <defs>
        <filter id="smoke-turb" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves="3"
            seed="3"
            result="noise"
          >
            <animate
              attributeName="seed"
              from="0"
              to="32"
              dur="19s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="38" />
        </filter>
      </defs>
    </svg>
  );
}

export function NeckPlume() {
  const tier = useDeviceTier();
  const useFilter = tier === "high";
  const layers = tier === "low" ? 1 : tier === "medium" ? 2 : 3;
  const filterStyle = useFilter ? "url(#smoke-turb)" : undefined;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-[-30%] top-[52%] bottom-[-10%] overflow-visible"
      style={{
        maskImage:
          "radial-gradient(ellipse 65% 75% at 50% 70%, #000 35%, rgba(0,0,0,0.85) 55%, transparent 92%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 65% 75% at 50% 70%, #000 35%, rgba(0,0,0,0.85) 55%, transparent 92%)",
      }}
    >
      {/* Back plume — slowest, biggest, deepest blur */}
      <div
        className="cinema-smoke cinema-smoke--back absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 85% at 50% 100%, color-mix(in oklab, var(--arch-primary) 35%, #0a0a0a) 0%, color-mix(in oklab, var(--arch-primary) 15%, #050505) 35%, transparent 75%)",
          filter: useFilter ? `blur(34px) ${filterStyle}` : "blur(34px)",
          mixBlendMode: "screen",
          opacity: 0.55,
        }}
      />
      {/* Mid plume */}
      {layers >= 2 && (
        <div
          className="cinema-smoke cinema-smoke--mid absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 42% 80% at 50% 100%, rgba(220,220,225,0.55) 0%, rgba(180,180,190,0.28) 38%, transparent 72%)",
            filter: useFilter ? `blur(20px) ${filterStyle}` : "blur(22px)",
            mixBlendMode: "screen",
            opacity: 0.72,
          }}
        />
      )}
      {/* Front drift */}
      {layers >= 3 && (
        <div
          className="cinema-smoke cinema-smoke--front absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 36% 70% at 50% 100%, rgba(255,255,255,0.6) 0%, rgba(230,230,240,0.3) 32%, transparent 68%)",
            filter: useFilter ? `blur(12px) ${filterStyle}` : "blur(14px)",
            mixBlendMode: "screen",
            opacity: 0.85,
          }}
        />
      )}
    </div>
  );
}

export function SideMist() {
  const tier = useDeviceTier();
  const ref = useRef<HTMLDivElement | null>(null);

  // Subtle scroll parallax — one rAF-throttled listener.
  useEffect(() => {
    if (tier !== "high") return;
    let raf = 0;
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(() => {
        queued = false;
        if (ref.current) {
          ref.current.style.setProperty("--smoke-scroll", String(window.scrollY));
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [tier]);

  const isHigh = tier === "high";

  return (
    <div
      ref={ref}
      aria-hidden
      className="cinema-side-mist pointer-events-none fixed inset-y-0 left-0 z-[1]"
      style={
        {
          width: isHigh ? "28vw" : "40vw",
          opacity: isHigh ? 0.85 : 0.45,
          mixBlendMode: "screen",
          background:
            "radial-gradient(ellipse 70% 60% at 15% 50%, color-mix(in oklab, var(--arch-primary) 28%, #060606) 0%, color-mix(in oklab, var(--arch-primary) 14%, #030303) 35%, transparent 80%)",
          filter: "blur(40px)",
          transform: isHigh
            ? "translate3d(0, calc(var(--smoke-scroll, 0) * -0.08px), 0)"
            : undefined,
          willChange: isHigh ? "transform" : undefined,
          maskImage:
            "radial-gradient(ellipse 80% 100% at 15% 50%, #000 35%, rgba(0,0,0,0.7) 65%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 100% at 15% 50%, #000 35%, rgba(0,0,0,0.7) 65%, transparent 95%)",
        } as React.CSSProperties
      }
    />
  );
}

export function GroundHaze() {
  return (
    <div
      aria-hidden
      className="cinema-ground-haze pointer-events-none fixed inset-x-0 bottom-0 z-[1] h-[55vh]"
      style={{
        background:
          "radial-gradient(ellipse 95% 55% at 50% 115%, color-mix(in oklab, var(--arch-primary) 32%, #050505) 0%, color-mix(in oklab, var(--arch-primary) 14%, #020202) 35%, transparent 78%)",
        mixBlendMode: "screen",
        filter: "blur(28px)",
      }}
    />
  );
}