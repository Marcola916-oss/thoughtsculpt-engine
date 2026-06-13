import { useEffect, useRef, memo, useCallback } from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────────
   ArchetypeRetroBrain — Procedural 3-D canvas brain renderer.

   Strategy for 60 FPS even on old phones:
   1. Pre-calculate 3-D brain geometry once on mount (no per-frame math).
   2. Render at a tiny internal resolution (INTERNAL_SIZE × INTERNAL_SIZE).
   3. Scale to display size with CSS image-rendering: pixelated → free retro look.
   4. One requestAnimationFrame loop that only updates rotation angle + paints.

   Brain shape: deformed sphere using fBm-inspired sinusoid bumps on longitude
   and latitude to simulate the two cerebral hemispheres, longitudinal fissure,
   and cortical surface texture.
─────────────────────────────────────────────────────────────────────────────── */

export type ArchetypeKey = "AO" | "SS" | "EA" | "HI";

export interface ArchetypeRetroBrainProps {
  archetype?: ArchetypeKey;
  /** CSS display size (canvas is rendered at INTERNAL_SIZE then scaled) */
  size?: number;
  className?: string;
  /** Rotation speed in radians per frame (default 0.008) */
  speed?: number;
}

// ── Archetype colour palette ──────────────────────────────────────────────────
const ARCHETYPE_COLORS: Record<ArchetypeKey, { primary: string; glow: string; secondary: string }> = {
  AO: { primary: "#CC0000", glow: "rgba(204,0,0,0.55)",   secondary: "#FF4040" },
  SS: { primary: "#FFD700", glow: "rgba(255,215,0,0.50)", secondary: "#FFF176" },
  EA: { primary: "#4A90D9", glow: "rgba(74,144,217,0.50)", secondary: "#82C3FF" },
  HI: { primary: "#FF6B00", glow: "rgba(255,107,0,0.50)", secondary: "#FFAA55" },
};

// ── Render constants ──────────────────────────────────────────────────────────
const INTERNAL_SIZE = 180;   // actual canvas pixels — tiny = fast + pixelated
const POINT_SIZE    = 2;     // pixels per "voxel" at internal resolution
const NUM_LAT       = 28;    // latitude rings on sphere
const NUM_LON       = 44;    // longitude segments
const NUM_PARTICLES = 14;    // orbiting data particles

// ── 3-D point type ────────────────────────────────────────────────────────────
interface Point3D { x: number; y: number; z: number; brightness: number }
interface Particle { angle: number; radius: number; speed: number; tilt: number; size: number; phase: number }

// ── Pre-compute brain geometry (once per mount) ───────────────────────────────
function buildBrainPoints(): Point3D[] {
  const points: Point3D[] = [];
  const BASE_R = 0.7;

  for (let li = 0; li <= NUM_LAT; li++) {
    const lat = (li / NUM_LAT) * Math.PI;        // 0 … π
    for (let lo = 0; lo < NUM_LON; lo++) {
      const lon = (lo / NUM_LON) * 2 * Math.PI;  // 0 … 2π

      // ── Brain deformation ─────────────────────────────────────────────────
      // 1. Longitudinal fissure: flatten the top centre
      const fissure = Math.abs(Math.sin(lon)) < 0.18 && lat < Math.PI * 0.6
        ? 0.82
        : 1;

      // 2. Hemisphere bulge: make each half (left/right) slightly asymmetric
      const hemi = 1 + 0.06 * Math.cos(lon * 2);

      // 3. Cortical folds: high-frequency wrinkle using lon × lat harmonics
      const fold1 = 0.04 * Math.sin(lat * 5) * Math.cos(lon * 7);
      const fold2 = 0.03 * Math.sin(lat * 8) * Math.cos(lon * 5 + 1.2);

      // 4. Overall skull shape: slightly elongated & flattened at bottom
      const skull = 1 - 0.12 * Math.pow(Math.cos(lat), 2);

      const r = BASE_R * fissure * hemi * skull + fold1 + fold2;

      // ── Spherical to Cartesian ─────────────────────────────────────────────
      const x = r * Math.sin(lat) * Math.cos(lon);
      const y = r * Math.cos(lat) * 0.88;         // slightly shorter vertically
      const z = r * Math.sin(lat) * Math.sin(lon);

      // Skip bottom third — brains don't have a neck
      if (y < -0.45) continue;

      // Brightness from fold depth — gives a nice depth-map look
      const brightness = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(lat * 4 + lon * 3));

      points.push({ x, y, z, brightness });
    }
  }
  return points;
}

// ── Pre-compute orbiting particles ────────────────────────────────────────────
function buildParticles(): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < NUM_PARTICLES; i++) {
    out.push({
      angle:  (i / NUM_PARTICLES) * Math.PI * 2,
      radius: 0.85 + Math.random() * 0.25,
      speed:  0.003 + Math.random() * 0.008,
      tilt:   (Math.random() - 0.5) * 0.8,
      size:   POINT_SIZE * (0.8 + Math.random()),
      phase:  Math.random() * Math.PI * 2,
    });
  }
  return out;
}

// ── Component ─────────────────────────────────────────────────────────────────
function ArchetypeRetroBrainImpl({
  archetype = "AO",
  size = 300,
  className,
  speed = 0.008,
}: ArchetypeRetroBrainProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const angleRef   = useRef<number>(0);
  const brainPts   = useRef<Point3D[]>([]);
  const particles  = useRef<Particle[]>([]);

  // Build geometry once
  useEffect(() => {
    brainPts.current  = buildBrainPoints();
    particles.current = buildParticles();
  }, []);

  // Projection helper
  const project = useCallback(
    (x: number, y: number, z: number, cos: number, sin: number) => {
      const half = INTERNAL_SIZE / 2;
      const scale = half * 0.92;           // world-to-canvas scale
      // Rotate around Y axis
      const rx = x * cos - z * sin;
      const rz = x * sin + z * cos;
      // Simple perspective divide
      const d = 2.2;
      const pz = rz + d;
      const px = (rx / pz) * scale + half;
      const py = (-y / pz) * scale + half;
      return { px, py, depth: rz };
    },
    [],
  );

  const lastTimeRef = useRef<number>(0);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ARCHETYPE_COLORS[archetype];

    // Parse hex to rgb once per effect
    const hex = colors.primary;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const hex2 = colors.secondary;
    const sr = parseInt(hex2.slice(1, 3), 16);
    const sg = parseInt(hex2.slice(3, 5), 16);
    const sb = parseInt(hex2.slice(5, 7), 16);

    const draw = (time: number) => {
      // Calculate delta time for consistent speed on any refresh rate (e.g. 120Hz/144Hz)
      const dt = lastTimeRef.current ? (time - lastTimeRef.current) : 16.66;
      lastTimeRef.current = time;
      
      const frameSpeed = speed * (dt / 16.66);
      const angle = angleRef.current;
      const cosA  = Math.cos(angle);
      const sinA  = Math.sin(angle);

      ctx.clearRect(0, 0, INTERNAL_SIZE, INTERNAL_SIZE);

      // ── Draw glowing core (low-res inner glow) ────────────────────────────
      const grd = ctx.createRadialGradient(
        INTERNAL_SIZE / 2, INTERNAL_SIZE / 2, 0,
        INTERNAL_SIZE / 2, INTERNAL_SIZE / 2, INTERNAL_SIZE * 0.36,
      );
      grd.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, INTERNAL_SIZE, INTERNAL_SIZE);

      // We collect all points (brain + particles) to sort them together by depth (Painter's Algorithm)
      const renderQueue: { px: number; py: number; depth: number; r: number; g: number; b: number; a: number; size: number }[] = [];

      // 1. Brain points
      brainPts.current.forEach((p) => {
        const { px, py, depth } = project(p.x, p.y, p.z, cosA, sinA);
        if (px < 0 || px > INTERNAL_SIZE || py < 0 || py > INTERNAL_SIZE) return;
        
        // Depth Fade: Far points (positive depth) become dimmer. Close points (negative depth) become brighter.
        const depthFade = Math.max(0.1, Math.min(1, (1.5 - depth) / 2.5));
        const alpha     = p.brightness * depthFade;

        renderQueue.push({ px, py, depth, r, g, b, a: alpha, size: POINT_SIZE });
      });

      // 2. Orbiting particles
      const t = angle * 60; // use angle as time proxy
      particles.current.forEach((p) => {
        const pa = p.angle + angle * (p.speed / speed);
        const ty = Math.sin(pa + p.tilt) * 0.3;  // tilted plane wobble
        const px3d = p.radius * Math.cos(pa);
        const pz3d = p.radius * Math.sin(pa);
        const { px: ppx, py: ppy, depth: pd } = project(px3d, ty, pz3d, cosA, sinA);

        if (ppx < -4 || ppx > INTERNAL_SIZE + 4 || ppy < -4 || ppy > INTERNAL_SIZE + 4) return;

        const pulse  = 0.7 + 0.3 * Math.sin(t * p.speed * 6 + p.phase);
        // Particles behind the brain (depth > 0) are slightly dimmer to simulate atmospheric scattering
        const pAlpha = pd > 0 ? 0.35 * pulse : 0.9 * pulse;

        renderQueue.push({ px: ppx, py: ppy, depth: pd, r: sr, g: sg, b: sb, a: pAlpha, size: p.size });
      });

      // ── Painter's Algorithm: Sort Back to Front (descending depth) ────────
      renderQueue.sort((A, B) => B.depth - A.depth);

      // Draw all points
      renderQueue.forEach((pt) => {
        ctx.fillStyle = `rgba(${pt.r},${pt.g},${pt.b},${pt.a.toFixed(2)})`;
        ctx.fillRect(Math.floor(pt.px), Math.floor(pt.py), pt.size, pt.size);
      });

      // Advance rotation
      angleRef.current += frameSpeed;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [archetype, speed, project]);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center select-none", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
      role="img"
    >
      {/* Outer ambient glow — CSS, zero canvas cost */}
      <div
        className="absolute inset-0 rounded-full animate-pulse pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${ARCHETYPE_COLORS[archetype].glow} 0%, transparent 70%)`,
          filter: "blur(12px)",
          transform: "scale(0.8)",
        }}
      />

      {/* The tiny canvas, scaled up via CSS pixelated rendering */}
      <canvas
        ref={canvasRef}
        width={INTERNAL_SIZE}
        height={INTERNAL_SIZE}
        style={{
          width:           size,
          height:          size,
          imageRendering:  "pixelated",
          display:         "block",
          position:        "relative",
          zIndex:          1,
        }}
      />

      {/* Scan-line overlay for extra retro crispness */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-sm"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 3px,
            rgba(0,0,0,0.08) 3px,
            rgba(0,0,0,0.08) 4px
          )`,
          zIndex: 2,
        }}
      />
    </div>
  );
}

export const ArchetypeRetroBrain = memo(ArchetypeRetroBrainImpl);
