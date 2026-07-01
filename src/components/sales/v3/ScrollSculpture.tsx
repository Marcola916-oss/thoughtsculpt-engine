import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { MarbleBust } from "@/components/identity/MarbleBust";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { getSigil } from "@/lib/sales/sigils";
import type { Archetype } from "@/lib/quiz/scoring";

type Props = {
  archetype: Archetype;
  /** Element whose scroll progress drives the sculpture. */
  targetRef: RefObject<HTMLElement | null>;
  className?: string;
};

/**
 * "The Awakening" — sticky cinematic sculpture synchronized with page scroll.
 *
 * Layers (z-stack, low → high):
 *   0  radial archetype background (rotates)
 *   1  MarbleBust base (fades as shards depart)
 *   2  SVG cracks (stroke-dashoffset)
 *   3  4 marble shards (translate to corners)
 *   4  Inner core sigil (procedural, rotates)
 *   5  Particle dust (Canvas2D, tier-aware)
 *   6  Final red pulse overlay
 */
export function ScrollSculpture({ archetype, targetRef, className = "" }: Props) {
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const sigil = useMemo(() => getSigil(archetype), [archetype]);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 55, damping: 22, mass: 0.6 });

  // Phase transforms
  const bgRotate = useTransform(smooth, [0, 1], [0, 30]);
  const crackProg = useTransform(smooth, [0.1, 0.4], [0, 1]);
  const crackGlow = useTransform(smooth, [0.25, 0.55], [0, 1]);
  const shardOffset = useTransform(smooth, [0.4, 0.58], [0, 1]);
  const reassembly = useTransform(smooth, [0.82, 0.95], [1, 0]);
  const coreReveal = useTransform(smooth, [0.58, 0.7], [0, 1]);
  const coreRotation = useTransform(smooth, [0.58, 1.0], [0, 540]);
  const bustReveal = useTransform(smooth, [0.82, 0.95], [0, 1]);
  const finalPulse = useTransform(smooth, [0.92, 1.0], [0, 1]);

  // Bust opacity: visible at start, gone during shard phase, returns at reassembly
  const bustOpacity = useTransform(smooth, [0, 0.4, 0.58, 0.82, 0.95], [1, 0.95, 0.15, 0.15, 1]);

  // Particles --------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleCount = reduced ? 0 : tier === "low" ? 0 : tier === "medium" ? 50 : 120;
  const scrollNowRef = useRef(0);
  useMotionValueEvent(smooth, "change", (v) => {
    scrollNowRef.current = v;
  });

  useEffect(() => {
    if (particleCount === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    };
    resize();
    window.addEventListener("resize", resize);

    const seeds = Array.from({ length: particleCount }, (_, i) => ({
      ax: Math.random(),
      ay: Math.random(),
      rx: 30 + Math.random() * 90,
      ry: 30 + Math.random() * 90,
      phase: (i / particleCount) * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.8,
      size: 0.6 + Math.random() * 1.4,
      alpha: 0.25 + Math.random() * 0.5,
    }));

    let t = 0;
    const tick = () => {
      t += 0.008;
      const W = canvas.width;
      const H = canvas.height;
      const sy = scrollNowRef.current;
      // Only render particles between 0.55 and 0.95 (the orbital phase)
      const intensity =
        Math.max(0, Math.min(1, (sy - 0.55) / 0.3)) * Math.max(0, Math.min(1, (0.95 - sy) / 0.1));
      ctx.clearRect(0, 0, W, H);
      if (intensity > 0.01) {
        const cx = W * 0.5;
        const cy = H * 0.5;
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        for (let i = 0; i < seeds.length; i++) {
          const s = seeds[i];
          const ang = s.phase + t * s.speed;
          const x = cx + Math.cos(ang) * (s.rx * dpr) + Math.cos(ang * 1.7) * 8 * dpr;
          const y = cy + Math.sin(ang) * (s.ry * dpr) + Math.sin(ang * 1.3) * 8 * dpr;
          ctx.globalAlpha = s.alpha * intensity;
          ctx.beginPath();
          ctx.arc(x, y, s.size * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [particleCount]);

  // Cracks: 7 paths (4 in low tier). Real curves over a 200x200 viewBox.
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

  // 4 shards: head, left-shoulder, right-shoulder, chest. Translate to quadrants.
  const shards = [
    { id: "head", d: "M-40,-90 L40,-90 L30,-30 L-30,-30 Z", dx: 0, dy: -80 },
    { id: "left", d: "M-90,-20 L-30,-30 L-25,40 L-95,40 Z", dx: -80, dy: 0 },
    { id: "right", d: "M30,-30 L90,-20 L95,40 L25,40 Z", dx: 80, dy: 0 },
    { id: "base", d: "M-50,40 L50,40 L60,95 L-60,95 Z", dx: 0, dy: 80 },
  ];

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex: 1 }}
    >
      {/* Layer 0 — radial bg */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, color-mix(in oklab, var(--arch-primary) 32%, transparent) 0%, transparent 60%)",
          rotate: reduced ? 0 : bgRotate,
        }}
      />

      {/* Layer 1 — base MarbleBust (fades during shard phase) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: reduced ? 1 : bustOpacity }}
      >
        <div className="relative h-[58vh] max-h-[520px] w-[58vh] max-w-[520px] sales-breathe">
          <MarbleBust variant="full" />
        </div>
      </motion.div>

      {/* Layer 2 — cracks SVG */}
      {cracks.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
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
                  pathLength: reduced ? 1 : crackProg,
                  filter: "url(#crack-glow)",
                  opacity: crackGlow,
                }}
              />
            ))}
            {/* second pass — solid hairline */}
            {cracks.map((d, i) => (
              <motion.path
                key={`s-${i}`}
                d={d}
                fill="none"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth={0.5}
                strokeLinecap="round"
                style={{ pathLength: reduced ? 1 : crackProg }}
              />
            ))}
          </svg>
        </div>
      )}

      {/* Layer 3 — 4 shards */}
      {!reduced && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="-100 -100 200 200"
            className="h-[60vh] max-h-[540px] w-[60vh] max-w-[540px]"
            style={{ overflow: "visible" }}
          >
            {shards.map((s) => (
              <Shard
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

      {/* Layer 4 — inner core sigil */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: reduced ? 0.4 : coreReveal }}
      >
        <motion.div
          className="relative h-[38vh] max-h-[340px] w-[38vh] max-w-[340px]"
          style={{ rotate: reduced ? 0 : coreRotation, color: "var(--arch-primary)" }}
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

      {/* Layer 4.5 — reassembled bust glow (returns at 82%) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: reduced ? 0 : bustReveal, mixBlendMode: "screen" as const }}
      >
        <div
          className="h-[40vh] max-h-[380px] w-[40vh] max-w-[380px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--arch-primary) 55%, transparent) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Layer 5 — particle canvas */}
      {particleCount > 0 && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}

      {/* Layer 6 — final red pulse */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: finalPulse }}
      >
        <div
          className="h-[44vh] max-h-[420px] w-[44vh] max-w-[420px] rounded-full sales-final-pulse"
          style={{ background: "radial-gradient(circle, rgba(204,0,0,0.45) 0%, transparent 65%)" }}
        />
      </motion.div>
    </div>
  );
}

export default ScrollSculpture;

function Shard({
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
  shardOffset: MotionValue<number>;
  reassembly: MotionValue<number>;
}) {
  const x = useTransform(shardOffset, [0, 1], [0, dx]);
  const y = useTransform(shardOffset, [0, 1], [0, dy]);
  const r = useTransform(shardOffset, [0, 1], [0, rot]);
  const op = useTransform(reassembly, [0, 1], [0, 0.85]);
  return (
    <motion.path
      d={d}
      style={{ x, y, rotate: r, opacity: op, willChange: "transform" }}
      fill="color-mix(in oklab, var(--arch-primary) 18%, #1a1a1a)"
      stroke="color-mix(in oklab, var(--arch-primary) 60%, transparent)"
      strokeWidth={0.6}
    />
  );
}
