import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const Spline = lazy(() => import("@splinetool/react-spline"));

export type ArchetypeKey = "AO" | "SS" | "EA" | "HI";

interface Props {
  archetype: ArchetypeKey;
  size?: number;
  className?: string;
  /** Radians per frame for the horizontal 360° spin (default ≈ slow). */
  speed?: number;
}

/** Hex tint applied as CSS blend on top of the Spline canvas, per archetype. */
const ARCHETYPE_HEX: Record<ArchetypeKey, string> = {
  AO: "#0F4C5C", // Azul Petróleo
  SS: "#6B2D8C", // Roxo Vibrante
  EA: "#C44900", // Laranja Queimado
  HI: "#2E7D32", // Verde Esmeralda
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
  size = 420,
  className,
  speed = 0.004,
}: Props) {
  const rootRef = useRef<unknown>(null);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const hex = ARCHETYPE_HEX[archetype];

  // Drive a slow Y-axis rotation once the scene is loaded.
  useEffect(() => {
    if (!ready) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let lastT = performance.now();
    const tick = (t: number) => {
      const dt = (t - lastT) / 16.6667; // normalize to frames @60fps
      lastT = t;
      const obj = rootRef.current as { rotation?: { y: number } } | null;
      if (obj && obj.rotation) {
        obj.rotation.y += speed * dt;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, speed]);

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

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
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
        <div className="absolute inset-0">
          <Spline scene={SCENE_URL} onLoad={handleLoad} />
        </div>
      </Suspense>

      {/* Color tint — blends the brain particles into the archetype hex */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: hex,
          mixBlendMode: "color",
          opacity: 0.85,
        }}
      />
      {/* Extra saturation boost */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: hex,
          mixBlendMode: "overlay",
          opacity: 0.25,
        }}
      />

      {/* Cover the "Built with Spline" badge (bottom-right) */}
      <div
        aria-hidden
        className="pointer-events-auto absolute bottom-0 right-0 z-20 h-12 w-44 bg-black"
        style={{ borderTopLeftRadius: 6 }}
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