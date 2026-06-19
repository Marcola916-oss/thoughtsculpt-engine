/**
 * LoaderAmbient — Exclusive ambient layer for the NeuralLoader screen.
 *
 * Renders three calm, premium layers on top of the global Atmosphere:
 *  1. Neural grid (SVG, pulsing nodes)
 *  2. Diagonal data streams (CSS-animated gradient lines)
 *  3. Floating philosophy/tech symbols (low opacity, slow drift)
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
      size: 11 + ((i * 3) % 6),
      opacity: 0.04 + ((i * 0.013) % 0.06),
      duration: 42 + ((i * 7) % 22),
      delay: -(i * 4.7),
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="loader-ambient pointer-events-none absolute inset-0 overflow-hidden -z-10"
    >
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
              stroke="hsl(var(--accent))"
              strokeOpacity="0.08"
              strokeWidth="0.5"
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
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="1.4"
            fill="hsl(var(--accent))"
            className="loader-ambient-node"
            style={{ animationDelay: `${i * 0.42}s` }}
          />
        ))}
      </svg>

      {/* 2. Diagonal data streams */}
      <div className="absolute inset-0">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="loader-ambient-stream"
            style={{
              top: `${15 + i * 22}%`,
              animationDuration: `${16 + i * 3}s`,
              animationDelay: `${-i * 5}s`,
            }}
          />
        ))}
      </div>

      {/* 3. Floating symbols */}
      <div className="absolute inset-0 font-mono">
        {drifts.map((d, i) => (
          <span
            key={i}
            className="loader-ambient-symbol absolute select-none text-foreground"
            style={{
              top: d.top,
              left: d.left,
              fontSize: `${d.size}px`,
              opacity: d.opacity,
              animationDuration: `${d.duration}s`,
              animationDelay: `${d.delay}s`,
              filter: "blur(0.3px)",
            }}
          >
            {d.ch}
          </span>
        ))}
      </div>
    </div>
  );
}