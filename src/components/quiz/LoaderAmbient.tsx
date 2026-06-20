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

// Pulsing nodes positioned in % of the container (no SVG viewBox).
const NODES: Array<{ top: string; left: string; delay: number }> = [
  { top: "18%", left: "22%", delay: 0 },
  { top: "26%", left: "68%", delay: 0.4 },
  { top: "42%", left: "12%", delay: 0.9 },
  { top: "48%", left: "82%", delay: 1.3 },
  { top: "62%", left: "30%", delay: 1.7 },
  { top: "72%", left: "72%", delay: 2.1 },
  { top: "80%", left: "44%", delay: 2.5 },
  { top: "14%", left: "48%", delay: 2.9 },
];

// Circuit wire paths (viewBox 100x100, slice-fitted to viewport).
// Each path is a polyline that snakes across the screen with right-angle bends,
// like a PCB trace. A pulse travels along it via stroke-dashoffset.
const WIRES: Array<{ d: string; duration: number; delay: number }> = [
  { d: "M -5 18 L 22 18 L 22 34 L 48 34 L 48 22 L 78 22 L 78 40 L 105 40", duration: 7,  delay: 0 },
  { d: "M 105 62 L 80 62 L 80 48 L 56 48 L 56 66 L 30 66 L 30 54 L -5 54", duration: 9,  delay: 1.2 },
  { d: "M -5 82 L 18 82 L 18 70 L 42 70 L 42 86 L 70 86 L 70 74 L 105 74", duration: 11, delay: 2.4 },
  { d: "M 12 -5 L 12 24 L 38 24 L 38 50 L 62 50 L 62 28 L 88 28 L 88 -5", duration: 8.5, delay: 0.6 },
  { d: "M 92 105 L 92 78 L 66 78 L 66 58 L 40 58 L 40 80 L 14 80 L 14 105", duration: 10, delay: 3.1 },
  { d: "M -5 38 L 14 38 L 14 50 L 32 50 L 32 38 L 50 38", duration: 6.5, delay: 1.8 },
  { d: "M 50 62 L 68 62 L 68 50 L 86 50 L 86 62 L 105 62", duration: 7.5, delay: 4.0 },
];

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
      className="loader-ambient pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      {/* 0. Central pulsing core halo — the "heartbeat" */}
      <div
        className="loader-ambient-core absolute top-1/2 left-1/2"
        style={{
          width: "min(70vh, 720px)",
          height: "min(70vh, 720px)",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent) 18%, transparent) 0%, color-mix(in oklab, var(--accent) 6%, transparent) 35%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* 0b. Orbiting concentric rings */}
      <svg
        className="loader-ambient-ring absolute top-1/2 left-1/2"
        style={{ width: "min(80vmin, 720px)", height: "min(80vmin, 720px)" }}
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
        style={{ width: "min(110vmin, 980px)", height: "min(110vmin, 980px)" }}
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

      {/* 1. Neural grid — pure CSS, no SVG viewBox edges */}
      <div className="loader-ambient-grid-css" />

      {/* 1c. Circuit wires — pulses flowing along PCB-style traces */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {WIRES.map((w, i) => (
          <g key={i}>
            <path d={w.d} className="loader-wire loader-wire-base" />
            <path
              d={w.d}
              className="loader-wire loader-wire-pulse"
              style={{
                animationDuration: `${w.duration}s`,
                animationDelay: `${-w.delay}s`,
              }}
            />
          </g>
        ))}
      </svg>

      {/* 1b. Pulsing nodes positioned in % */}
      {NODES.map((n, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: n.top,
            left: n.left,
            width: 5,
            height: 5,
            background: "var(--accent)",
            boxShadow:
              "0 0 8px color-mix(in oklab, var(--accent) 80%, transparent), 0 0 18px color-mix(in oklab, var(--accent) 45%, transparent)",
            animation: `loader-ambient-node-pulse 2.6s ease-in-out ${n.delay}s infinite`,
          }}
        />
      ))}

      {/* 2. Horizontal data streams — densified */}
      <div className="absolute inset-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="loader-ambient-stream"
            style={{
              top: `${4 + i * 9.5}%`,
              animationDuration: `${8 + (i % 5) * 1.8}s`,
              animationDelay: `${-i * 2.3}s`,
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