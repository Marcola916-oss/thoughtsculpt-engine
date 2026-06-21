import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FRAME_COUNT,
  getBrainFrames,
  startBrainFramesPreload,
} from "@/lib/brainFramesCache";
import { useDeviceTier } from "@/hooks/use-device-tier";

const FPS = 30;
const FRAME_MS = 1000 / FPS;

type Props = {
  className?: string;
  archetype?: "AO" | "SS" | "EA" | "HI";
};

export function ArchetypeCanvasBrain({ className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const rafRef = useRef<number | null>(null);
  const tier = useDeviceTier();
  const [reducedMotion, setReducedMotion] = useState(false);
  // Rim-light backlight only on mid/high tiers — uses GPU `filter: blur`
  // which is fine on modern devices but expensive on old Android.
  const useRimLight = tier !== "low";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);

  // Seed synchronously from cache so the first paint already has frames.
  const initial = typeof window !== "undefined" ? getBrainFrames() : null;
  const [ready, setReady] = useState<boolean>(!!initial && initial.length > 0);

  if (initial && initial.length > 0 && framesRef.current.length === 0) {
    framesRef.current = initial;
  }

  // Fallback: if cache was empty (direct navigation, etc.), preload now.
  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    startBrainFramesPreload().then((frames) => {
      if (cancelled || frames.length === 0) return;
      framesRef.current = frames;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  // Draw frame 0 synchronously on mount, before the browser paints —
  // eliminates the blank/grey flash.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const first = framesRef.current[0];
    if (!canvas || !first) return;
    canvas.width = first.width;
    canvas.height = first.height;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(first, 0, 0, canvas.width, canvas.height);
    // Mirror first frame into the glow canvas too.
    const glow = glowCanvasRef.current;
    if (glow) {
      glow.width = first.width;
      glow.height = first.height;
      const gctx = glow.getContext("2d", { alpha: true });
      if (gctx) {
        gctx.clearRect(0, 0, glow.width, glow.height);
        gctx.drawImage(first, 0, 0, glow.width, glow.height);
      }
    }
  }, [ready]);

  // 30fps loop, pulling straight from the in-memory cache.
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const glow = glowCanvasRef.current;
    const gctx = glow ? glow.getContext("2d", { alpha: true }) : null;

    let frame = 1; // frame 0 already drawn by the layout effect
    let last = performance.now();

    const draw = (now: number) => {
      const elapsed = now - last;
      if (elapsed >= FRAME_MS) {
        const img = framesRef.current[frame];
        if (img) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          if (gctx && glow) {
            gctx.clearRect(0, 0, glow.width, glow.height);
            gctx.drawImage(img, 0, 0, glow.width, glow.height);
          }
        }
        frame = (frame + 1) % FRAME_COUNT;
        last = now - (elapsed % FRAME_MS);
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [ready]);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      style={{ background: "transparent" }}
    >
      {/* Rim-light backlight — a blurred + tinted copy of the SAME brain
          frame, sitting behind the main canvas. Because it's the exact
          silhouette (not a circle), the glow follows the brain shape and
          only escapes around the edges — no bleed through the gaps
          between neurons. Low-tier devices fall back to a soft radial
          glow to avoid GPU blur cost on old Android. */}
      {useRimLight ? (
        <canvas
          ref={glowCanvasRef}
          aria-hidden
          className="pointer-events-none absolute max-w-full max-h-full w-auto h-auto"
          style={{
            zIndex: 0,
            // Heavy blur smears the silhouette outward → rim halo.
            // drop-shadow re-colors the alpha into the archetype hue.
            filter:
              "blur(18px) saturate(1.4) drop-shadow(0 0 14px var(--arch-primary)) drop-shadow(0 0 28px var(--arch-glow))",
            opacity: 0.95,
            willChange: "filter",
            animation: reducedMotion
              ? undefined
              : "arch-breathe 5.5s ease-in-out infinite",
          }}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <div
            className="rounded-full"
            style={{
              width: "70%",
              height: "70%",
              background:
                "radial-gradient(circle at 50% 50%, var(--arch-primary) 0%, var(--arch-glow) 35%, transparent 70%)",
              filter: "blur(28px)",
              opacity: 0.75,
            }}
          />
        </div>
      )}

      <canvas
        ref={canvasRef}
        aria-label="Animação do cérebro"
        className="relative max-w-full max-h-full w-auto h-auto"
        style={{
          zIndex: 1,
          mixBlendMode: "normal",
          background: "transparent",
          display: "block",
          filter: "drop-shadow(0 10px 18px rgba(0, 0, 0, 0.32))",
        }}
      />
    </div>
  );
}

export default ArchetypeCanvasBrain;