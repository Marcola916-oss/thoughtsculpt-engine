import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { MarbleBust } from "@/components/identity/MarbleBust";
import { useAwakening } from "./awakening-context";
import { getSigil } from "@/lib/sales/sigils";
import type { Archetype } from "@/lib/quiz/scoring";

interface Props {
  archetype: Archetype;
  children?: ReactNode;
}

/**
 * SceneElements — SVG scene layer for The Awakening Protocol.
 *
 * Renders the cinematic visual elements (cracks, shards, sigil, reassembly)
 * driven by the scroll progress from the AwakeningScroll context.
 *
 * Extracted and unified from ScrollSculpture.tsx logic.
 */
export function SceneElements({ archetype, children }: Props) {
  const { scrollProgress, reduced, tier } = useAwakening();
  const sigil = useMemo(() => getSigil(archetype), [archetype]);

  // Phase transforms — same ranges as ScrollSculpture.
  const progress = scrollProgress;
  const crackProg = clamp((progress - 0.1) / 0.3, 0, 1);
  const crackGlow = clamp((progress - 0.25) / 0.3, 0, 1);
  const shardOffset = clamp((progress - 0.4) / 0.18, 0, 1);
  const reassembly = 1 - clamp((progress - 0.82) / 0.13, 0, 1);
  const coreReveal = clamp((progress - 0.58) / 0.12, 0, 1);
  const coreRotation = clamp((progress - 0.58) / 0.42, 0, 1) * 540;
  const bustReveal = clamp((progress - 0.82) / 0.13, 0, 1);
  const finalPulse = clamp((progress - 0.92) / 0.08, 0, 1);

  const bustOpacity = interpolate(progress, [0, 0.4, 0.58, 0.82, 0.95], [1, 0.95, 0.15, 0.15, 1]);

  // Cracks: 7 paths (4 in low tier).
  const cracks = useMemo(() => {
    const all = [
      "M100,38 L94,58 L102,82 L88,108",
      "M100,38 L108,56 L100,78",
      "M100,38 L116,62 L130,96",
      "M94,58 L72,72 L60,98",
      "M108,56 L132,68 L150,84",
      "M102,82 L122,98 L138,124",
      "M88,108 L74,128 L66,156",
    ];
    return reduced ? [] : tier === "low" ? all.slice(0, 4) : all;
  }, [tier, reduced]);

  const shards = [
    { id: "head", d: "M-40,-90 L40,-90 L30,-30 L-30,-30 Z", dx: 0, dy: -80 },
    { id: "left", d: "M-90,-20 L-30,-30 L-25,40 L-95,40 Z", dx: -80, dy: 0 },
    { id: "right", d: "M30,-30 L90,-20 L95,40 L25,40 Z", dx: 80, dy: 0 },
    { id: "base", d: "M-50,40 L50,40 L60,95 L-60,95 Z", dx: 0, dy: 80 },
  ];

  const showCracks = !reduced && cracks.length > 0;
  const showShards = !reduced;
  const showCore = !reduced;

  return (
    <>
      {/* Layer 1 — radial bg */}
      <motion.div
        className="absolute inset-0"
        aria-hidden
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse at 50% 45%, color-mix(in oklab, var(--arch-primary) 32%, transparent) 0%, transparent 60%)",
          rotate: reduced ? 0 : interpolate(progress, [0, 1], [0, 30]),
        }}
      />

      {/* Layer 2 — base MarbleBust (fades during shard phase) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden
        style={{ zIndex: 2, opacity: reduced ? 1 : bustOpacity }}
      >
        <div className="relative h-[58vh] max-h-[520px] w-[58vh] max-w-[520px] sales-breathe">
          <MarbleBust variant="full" />
        </div>
      </motion.div>

      {/* Layer 3 — cracks SVG */}
      {showCracks && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden
          style={{ zIndex: 3 }}
        >
          <svg
            viewBox="0 0 200 200"
            className="h-[60vh] max-h-[540px] w-[60vh] max-w-[540px]"
            style={{ overflow: "visible" }}
          >
            <defs>
              <filter id="crack-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" />
              </filter>
            </defs>
            {cracks.map((d, i) => (
              <motion.path
                key={i}
                d={d}
                fill="none"
                stroke="var(--arch-primary)"
                strokeWidth={1.2}
                strokeLinecap="round"
                style={{
                  pathLength: crackProg,
                  filter: "url(#crack-glow)",
                  opacity: crackGlow,
                }}
              />
            ))}
            {cracks.map((d, i) => (
              <motion.path
                key={`s-${i}`}
                d={d}
                fill="none"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth={0.5}
                strokeLinecap="round"
                style={{ pathLength: crackProg }}
              />
            ))}
          </svg>
        </div>
      )}

      {/* Layer 4 — 4 shards */}
      {showShards && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden
          style={{ zIndex: 4 }}
        >
          <svg
            viewBox="-100 -100 200 200"
            className="h-[60vh] max-h-[540px] w-[60vh] max-w-[540px]"
            style={{ overflow: "visible" }}
          >
            {shards.map((s) => (
              <ShardPath
                key={s.id}
                d={s.d}
                dx={s.dx}
                dy={s.dy}
                rot={s.id === "head" ? -8 : s.id === "base" ? 6 : s.dx > 0 ? 10 : -10}
                shardOffset={shardOffset}
                reassembly={reassembly}
              />
            ))}
          </svg>
        </div>
      )}

      {/* Layer 5 — inner core sigil */}
      {showCore && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden
          style={{ zIndex: 5, opacity: coreReveal }}
        >
          <motion.div
            className="relative h-[38vh] max-h-[340px] w-[38vh] max-w-[340px]"
            style={{ rotate: coreRotation, color: "var(--arch-primary)" }}
          >
            <svg
              viewBox="0 0 200 200"
              className="h-full w-full"
              style={{
                filter:
                  "drop-shadow(0 0 14px color-mix(in oklab, var(--arch-primary) 70%, transparent))",
              }}
            >
              {sigil.map((el, i) => {
                const stroke = "currentColor";
                const sw = el.strokeWidth ?? 1;
                if (el.kind === "circle") {
                  return (
                    <circle
                      key={i}
                      cx={el.cx}
                      cy={el.cy}
                      r={el.r}
                      fill={el.fill ?? "none"}
                      stroke={stroke}
                      strokeWidth={sw}
                    />
                  );
                }
                if (el.kind === "polygon") {
                  return (
                    <polygon
                      key={i}
                      points={el.points}
                      fill={el.fill ?? "none"}
                      stroke={stroke}
                      strokeWidth={sw}
                    />
                  );
                }
                return (
                  <path
                    key={i}
                    d={el.d}
                    fill={el.fill ?? "none"}
                    stroke={stroke}
                    strokeWidth={sw}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}
            </svg>
          </motion.div>
        </motion.div>
      )}

      {/* Layer 6 — reassembled bust glow */}
      {!reduced && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden
          style={{ zIndex: 6, opacity: bustReveal, mixBlendMode: "screen" as const }}
        >
          <div
            className="h-[40vh] max-h-[380px] w-[40vh] max-w-[380px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--arch-primary) 55%, transparent) 0%, transparent 70%)",
            }}
          />
        </motion.div>
      )}

      {/* Layer 7 — final red pulse */}
      {!reduced && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden
          style={{ zIndex: 7, opacity: finalPulse }}
        >
          <div
            className="h-[44vh] max-h-[420px] w-[44vh] max-w-[420px] rounded-full sales-final-pulse"
            style={{
              background: "radial-gradient(circle, rgba(204,0,0,0.45) 0%, transparent 65%)",
            }}
          />
        </motion.div>
      )}

      {/* Ambient content passed from parent */}
      {children}
    </>
  );
}

export default SceneElements;

// ─── Helpers ────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

function interpolate(v: number, input: number[], output: number[]): number {
  if (v <= input[0]) return output[0];
  if (v >= input[input.length - 1]) return output[output.length - 1];
  for (let i = 0; i < input.length - 1; i++) {
    if (v >= input[i] && v <= input[i + 1]) {
      const t = (v - input[i]) / (input[i + 1] - input[i]);
      return output[i] + t * (output[i + 1] - output[i]);
    }
  }
  return output[output.length - 1];
}

// ─── Shard sub-component ───────────────────────────────────────

function ShardPath({
  d,
  dx,
  dy,
  rot,
  shardOffset,
  reassembly,
}: {
  d: string;
  dx: number;
  dy: number;
  rot: number;
  shardOffset: number;
  reassembly: number;
}) {
  const x = shardOffset * dx;
  const y = shardOffset * dy;
  const r = shardOffset * rot;
  const op = (1 - reassembly) * 0.85;

  return (
    <motion.path
      d={d}
      style={{
        x,
        y,
        rotate: r,
        opacity: op,
      }}
      fill="color-mix(in oklab, var(--arch-primary) 18%, #1a1a1a)"
      stroke="color-mix(in oklab, var(--arch-primary) 60%, transparent)"
      strokeWidth={0.6}
    />
  );
}
