import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FRAME_COUNT,
  getBrainFrames,
  startBrainFramesPreload,
} from "@/lib/brainFramesCache";

const FPS = 30;
const FRAME_MS = 1000 / FPS;

type Props = {
  className?: string;
  archetype?: "AO" | "SS" | "EA" | "HI";
};

export function ArchetypeCanvasBrain({ className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const rafRef = useRef<number | null>(null);
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
  }, [ready]);

  // 30fps loop, pulling straight from the in-memory cache.
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frame = 1; // frame 0 already drawn by the layout effect
    let last = performance.now();

    const draw = (now: number) => {
      const elapsed = now - last;
      if (elapsed >= FRAME_MS) {
        const img = framesRef.current[frame];
        if (img) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
      <canvas
        ref={canvasRef}
        aria-label="Animação do cérebro"
        className="max-w-full max-h-full w-auto h-auto"
        style={{
          mixBlendMode: "normal",
          background: "transparent",
          display: "block",
          filter: "drop-shadow(0 18px 34px rgba(0, 0, 0, 0.72))",
        }}
      />
    </div>
  );
}

export default ArchetypeCanvasBrain;