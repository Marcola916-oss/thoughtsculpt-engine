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
      {/* -1. Conic radar sweep (deepest layer) */}
      <div className="loader-conic-sweep" />

      {/* -0.5. Aurora blobs — slow breathing colored fog */}
      <div
        className="loader-aurora-blob loader-aurora-a"
        style={{
          top: "-10%",
          left: "-10%",
          width: "55vmax",
          height: "55vmax",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent) 55%, transparent) 0%, transparent 65%)",
        }}
      />
      <div
        className="loader-aurora-blob loader-aurora-b"
        style={{
          top: "20%",
          right: "-15%",
          width: "50vmax",
          height: "50vmax",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent) 45%, transparent) 0%, transparent 70%)",
        }}
      />
      <div
        className="loader-aurora-blob loader-aurora-c"
        style={{
          bottom: "-12%",
          left: "20%",
          width: "60vmax",
          height: "60vmax",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent) 40%, transparent) 0%, transparent 65%)",
        }}
      />

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