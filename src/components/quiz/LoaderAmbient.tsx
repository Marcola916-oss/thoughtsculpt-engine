/**
 * LoaderAmbient — Exclusive ambient layer for the NeuralLoader screen.
 *
 * Renders five calm, premium layers behind the loader content:
 *  1. Central pulsing core halo (red glow heartbeat)
 *  2. Two slow-orbiting concentric rings (dashed)
 *  3. Neural grid (SVG, pulsing nodes)
 *  4. Diagonal data streams (CSS-animated gradient lines)
 *  5. Floating philosophy/tech symbols (slow drift)
 *
 * All decorative, non-interactive, reduced-motion aware.
 */

import { useMemo } from "react";

const SYMBOLS = ["Φ", "Ψ", "∞", "☯", "λ", "{ }", "</>", "01", "#", "Ω"];

interface Drift {
  ch: string;
  top: string;
  left: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

export function LoaderAmbient() {
  const drifts = useMemo<Drift[]>(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      ch: SYMBOLS[i % SYMBOLS.length],
      top: `${8 + ((i * 53) % 84)}%`,
      left: `${6 + ((i * 71) % 88)}%`,
      size: 13 + ((i * 4) % 9),
      opacity: 0.18 + ((i * 0.04) % 0.18),
      duration: 42 + ((i * 7) % 22),
      delay: -(i * 4.7),
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="loader-ambient pointer-events-none absolute inset-0 overflow-hidden z-0"
    >
      {/* 0. Central pulsing core halo — the "heartbeat" */}
      <div
        className="loader-ambient-core absolute top-1/2 left-1/2"
        style={{
          width: "min(70vh, 720px)",
          height: "min(70vh, 720px)",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent) 28%, transparent) 0%, color-mix(in oklab, var(--accent) 10%, transparent) 35%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* 0b. Orbiting concentric rings */}
      <svg
        className="loader-ambient-ring absolute top-1/2 left-1/2"
        style={{ width: "min(60vh, 560px)", height: "min(60vh, 560px)" }}
        viewBox="0 0 200 200"
      >
        <circle
          cx="100"
          cy="100"
          r="96"
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.35"
          strokeWidth="0.6"
          strokeDasharray="2 14"
        />
      </svg>
      <svg
        className="loader-ambient-ring-reverse absolute top-1/2 left-1/2"
        style={{ width: "min(82vh, 760px)", height: "min(82vh, 760px)" }}
        viewBox="0 0 200 200"
      >
        <circle
          cx="100"
          cy="100"
          r="96"
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.22"
          strokeWidth="0.4"
          strokeDasharray="1 22"
        />
      </svg>

      {/* 1. Neural grid */}
      <svg
        className="absolute inset-0 h-full w-full loader-ambient-grid"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 600 600"
      >
        <defs>
          <pattern
            id="loader-grid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="var(--accent)"
              strokeOpacity="0.22"
              strokeWidth="0.6"
            />
          </pattern>
          <radialGradient id="loader-grid-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="loader-grid-mask">
            <rect width="600" height="600" fill="url(#loader-grid-fade)" />
          </mask>
        </defs>
        <rect
          width="600"
          height="600"
          fill="url(#loader-grid)"
          mask="url(#loader-grid-mask)"
        />
        {/* Pulsing nodes at intersections */}
        {[
          [144, 192],
          [336, 144],
          [240, 336],
          [432, 288],
          [96, 432],
          [480, 432],
          [288, 96],
          [192, 480],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="2"
            fill="var(--accent)"
            className="loader-ambient-node"
            style={{ animationDelay: `${i * 0.42}s` }}
          />
        ))}
      </svg>

      {/* 2. Diagonal data streams */}
      <div className="absolute inset-0">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="loader-ambient-stream"
            style={{
              top: `${8 + i * 15}%`,
              animationDuration: `${11 + i * 2.5}s`,
              animationDelay: `${-i * 3.2}s`,
            }}
          />
        ))}
      </div>

      {/* 3. Floating symbols */}
      <div className="absolute inset-0 font-mono">
        {drifts.map((d, i) => (
          <span
            key={i}
            className="loader-ambient-symbol absolute select-none"
            style={{
              top: d.top,
              left: d.left,
              fontSize: `${d.size}px`,
              opacity: d.opacity,
              color: "var(--accent)",
              animationDuration: `${d.duration}s`,
              animationDelay: `${d.delay}s`,
            }}
          >
            {d.ch}
          </span>
        ))}
      </div>
    </div>
  );
}