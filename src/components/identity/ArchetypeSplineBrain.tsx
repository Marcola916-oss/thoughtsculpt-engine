import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { ArchetypeRetroBrain } from "./ArchetypeRetroBrain";

const Spline = lazy(() => import("@splinetool/react-spline"));

export type ArchetypeKey = "AO" | "SS" | "EA" | "HI";

interface Props {
  archetype: ArchetypeKey;
  /** Optional fixed size override (px). When omitted, the brain becomes fluid via clamp(). */
  size?: number;
  className?: string;
  /** Radians per frame for the horizontal 360° spin (default ≈ slow). */
  speed?: number;
}

/**
 * Fluid size: scales with viewport, capped per breakpoint via clamp().
 * mobile ≈ 320–360px, tablet ≈ 480px, desktop ≈ 620px, XL ≈ 760px.
 */
const FLUID_SIZE = "clamp(280px, min(70vw, 70vh), 760px)";

/** Hex tint used for the halo behind the canvas, per archetype. */
const ARCHETYPE_HEX: Record<ArchetypeKey, string> = {
  AO: "#0F4C5C", // Azul Petróleo
  SS: "#6B2D8C", // Roxo Vibrante
  EA: "#C44900", // Laranja Queimado
  HI: "#2E7D32", // Verde Esmeralda
};

/**
 * CSS `filter` per archetype. The base Spline scene is cyan (~190°), so we
 * hue-rotate from there. Applied directly to the canvas so only the brain
 * pixels are tinted — empty/transparent areas stay transparent.
 */
const ARCHETYPE_FILTER: Record<ArchetypeKey, string> = {
  AO: "saturate(1.1)", // already cyan/teal, just boost
  SS: "hue-rotate(95deg) saturate(1.4)", // → purple
  EA: "hue-rotate(-170deg) saturate(1.8)", // → burnt orange
  HI: "hue-rotate(-65deg) saturate(1.3)", // → emerald green
};

const SCENE_URL = "/brain.splinecode";

/**
 * 3-D particle brain (Spline) tinted with the archetype color.
 * - Slow horizontal 360° auto-rotation (Y axis).
 * - Respects prefers-reduced-motion.
 * - Covers the "Built with Spline" badge with an opaque overlay.
 */
export function ArchetypeSplineBrain({
  archetype,
  size,
  className,
  speed = 0.004,
}: Props) {
  const rootRef = useRef<unknown>(null);
  const rafRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const tier = useDeviceTier();
  const hex = ARCHETYPE_HEX[archetype];

  // Pause RAF when tab is hidden or element scrolls offscreen.
  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    let io: IntersectionObserver | null = null;
    if (wrapperRef.current && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => setVisible((v) => v && entry.isIntersecting),
        { threshold: 0.05 },
      );
      io.observe(wrapperRef.current);
    }
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, []);

  // Drive a slow Y-axis rotation once the scene is loaded.
  useEffect(() => {
    if (!ready || !visible) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const effSpeed = tier === "medium" ? speed * 0.6 : speed;
    let lastT = performance.now();
    const tick = (t: number) => {
      const dt = (t - lastT) / 16.6667; // normalize to frames @60fps
      lastT = t;
      const obj = rootRef.current as { rotation?: { y: number } } | null;
      if (obj && obj.rotation) {
        obj.rotation.y += effSpeed * dt;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, speed, visible, tier]);

  const handleLoad = (app: unknown) => {
    // Grab a rotatable root. Spline's findObjectByName / scene root both work.
    const a = app as {
      findObjectByName?: (n: string) => unknown;
      _scene?: { children?: unknown[] };
      setBackgroundColor?: (c: string) => void;
    };
    // Make the Spline canvas background transparent so the brain floats
    // on top of the page instead of sitting inside a dark "box".
    try {
      a.setBackgroundColor?.("transparent");
    } catch {
      /* noop */
    }
    let target: unknown = null;
    const candidates = ["Scene", "Group", "Brain", "Particles", "Root"];
    for (const name of candidates) {
      const found = a.findObjectByName?.(name);
      if (found) {
        target = found;
        break;
      }
    }
    if (!target) {
      const first = a._scene?.children?.[0];
      if (first) target = first;
    }
    rootRef.current = target;
    setReady(true);
  };

  const sizeStyle = size
    ? { width: size, height: size }
    : { width: FLUID_SIZE, height: FLUID_SIZE };

  // Low-tier devices (old phones, reduced-motion): render the lightweight
  // procedural retro brain instead of Spline. Same archetype color, no WebGL.
  if (tier === "low") {
    return (
      <div
        ref={wrapperRef}
        className={cn("relative", className)}
        style={sizeStyle}
        role="img"
        aria-label={`Cérebro do arquétipo ${archetype}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[-20%] -z-10 rounded-full blur-[60px]"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${hex}66 0%, transparent 65%)`,
          }}
        />
        <ArchetypeRetroBrain
          archetype={archetype}
          size={typeof size === "number" ? size : 320}
          className="absolute inset-0 m-auto"
        />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
      style={sizeStyle}
      role="img"
      aria-label={`Visualização 3D do arquétipo ${archetype}`}
    >
      {/* Radial halo behind the canvas, in archetype color */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[-20%] -z-10 rounded-full blur-[80px]"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${hex}66 0%, transparent 65%)`,
        }}
      />

      {/* Spline canvas */}
      <Suspense fallback={<SplineFallback hex={hex} />}>
        <div
          className="absolute inset-0 [&_canvas]:!bg-transparent [&_canvas]:!w-full [&_canvas]:!h-full [&_a]:!hidden"
          style={{ filter: ARCHETYPE_FILTER[archetype] }}
        >
          <Spline scene={SCENE_URL} onLoad={handleLoad} />
        </div>
      </Suspense>

      {/* Cover any "Built with Spline" badge (bottom-right) defensively */}
      <div
        aria-hidden
        className="pointer-events-auto absolute bottom-0 right-0 z-20 h-10 w-40"
      />
    </div>
  );
}

function SplineFallback({ hex }: { hex: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="h-24 w-24 animate-pulse rounded-full"
        style={{
          background: `radial-gradient(circle, ${hex} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

export default ArchetypeSplineBrain;