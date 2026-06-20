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

const SYMBOLS = [
  "Φ", "Ψ", "∞", "☯", "λ", "Ω", "Δ", "Σ", "π", "∇",
  "{ }", "</>", "01", "#!", "=>", "&&", "[]", "()", "::", "fn",
];

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

// PCB-style circuit traces — orthogonal paths with 90° corners, like a
// real circuit board. Each path is drawn as a faint base stroke; a
// glowing dot then travels along it via SMIL <animateMotion>,
// simulating energy flowing through the trace.
const WIRES: Array<{ d: string; duration: number; delay: number; reverse?: boolean }> = [
  { d: "M -5 18 L 22 18 L 22 32 L 48 32 L 48 20 L 78 20 L 78 38 L 110 38", duration: 9, delay: 0 },
  { d: "M -5 52 L 14 52 L 14 44 L 36 44 L 36 58 L 62 58 L 62 48 L 88 48 L 88 60 L 110 60", duration: 11.5, delay: 1.4 },
  { d: "M -5 78 L 26 78 L 26 88 L 54 88 L 54 72 L 80 72 L 80 84 L 110 84", duration: 10, delay: 2.6 },
  { d: "M 16 -5 L 16 18 L 30 18 L 30 46 L 18 46 L 18 72 L 28 72 L 28 110", duration: 12.5, delay: 0.8, reverse: true },
  { d: "M 84 -5 L 84 22 L 70 22 L 70 50 L 88 50 L 88 78 L 76 78 L 76 110", duration: 10.5, delay: 3.2 },
  { d: "M -5 8 L 40 8 L 40 24 L 66 24 L 66 12 L 96 12 L 96 30 L 110 30", duration: 8, delay: 4.1, reverse: true },
  { d: "M -5 96 L 32 96 L 32 82 L 58 82 L 58 94 L 86 94 L 86 80 L 110 80", duration: 13.5, delay: 1.9 },
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

      {/* 1c. Energy wires — faint organic curves with a light dot flowing along each */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="loader-spark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="1" />
            <stop offset="40%" stopColor="var(--accent)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {WIRES.map((w, i) => {
          const pathId = `loader-wire-path-${i}`;
          return (
            <g key={i}>
              <path id={pathId} d={w.d} className="loader-wire-trace" />
              {/* Leading spark — large soft halo */}
              <circle r="0.85" fill="url(#loader-spark)" className="loader-wire-spark-halo">
                <animateMotion
                  dur={`${w.duration}s`}
                  repeatCount="indefinite"
                  begin={`${-w.delay}s`}
                  keyPoints={w.reverse ? "1;0" : "0;1"}
                  keyTimes="0;1"
                  rotate="auto"
                >
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </circle>
              {/* Bright core dot */}
              <circle r="0.28" fill="var(--accent)" className="loader-wire-spark-core">
                <animateMotion
                  dur={`${w.duration}s`}
                  repeatCount="indefinite"
                  begin={`${-w.delay}s`}
                  keyPoints={w.reverse ? "1;0" : "0;1"}
                  keyTimes="0;1"
                >
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </circle>
              {/* Trailing fade dot */}
            </g>
          );
        })}
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