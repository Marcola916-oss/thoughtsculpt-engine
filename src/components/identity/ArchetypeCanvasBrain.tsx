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

function dilateMask(mask: Uint8Array, width: number, height: number, passes: number) {
  let current = mask;
  for (let pass = 0; pass < passes; pass++) {
    const next = new Uint8Array(current);
    for (let y = 1; y < height - 1; y++) {
      const row = y * width;
      for (let x = 1; x < width - 1; x++) {
        const idx = row + x;
        if (current[idx]) continue;
        if (
          current[idx - width - 1] || current[idx - width] || current[idx - width + 1] ||
          current[idx - 1] || current[idx + 1] ||
          current[idx + width - 1] || current[idx + width] || current[idx + width + 1]
        ) {
          next[idx] = 255;
        }
      }
    }
    current = next;
  }
  return current;
}

function fillClosedSilhouette(mask: Uint8Array, width: number, height: number) {
  const outside = new Uint8Array(width * height);
  const queue: number[] = [];
  const push = (idx: number) => {
    if (idx < 0 || idx >= outside.length || outside[idx] || mask[idx]) return;
    outside[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    push(y * width + width - 1);
  }

  for (let i = 0; i < queue.length; i++) {
    const idx = queue[i];
    const x = idx % width;
    if (x > 0) push(idx - 1);
    if (x < width - 1) push(idx + 1);
    if (idx >= width) push(idx - width);
    if (idx < width * (height - 1)) push(idx + width);
  }

  const filled = new Uint8Array(width * height);
  for (let i = 0; i < filled.length; i++) {
    filled[i] = outside[i] ? 0 : 255;
  }
  return filled;
}

function makeMaskCanvas(mask: Uint8Array, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return canvas;
  const imageData = ctx.createImageData(width, height);
  for (let i = 0; i < mask.length; i++) {
    imageData.data[i * 4] = 255;
    imageData.data[i * 4 + 1] = 255;
    imageData.data[i * 4 + 2] = 255;
    imageData.data[i * 4 + 3] = mask[i];
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function drawRimLight(
  source: HTMLCanvasElement,
  target: HTMLCanvasElement,
  color: string,
  tier: "low" | "medium" | "high",
) {
  target.width = source.width;
  target.height = source.height;

  const targetCtx = target.getContext("2d", { alpha: true });
  if (!targetCtx) return;

  const scale = 0.25;
  const maskWidth = Math.max(1, Math.round(source.width * scale));
  const maskHeight = Math.max(1, Math.round(source.height * scale));
  const sample = document.createElement("canvas");
  sample.width = maskWidth;
  sample.height = maskHeight;
  const sampleCtx = sample.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!sampleCtx) return;

  sampleCtx.clearRect(0, 0, maskWidth, maskHeight);
  sampleCtx.drawImage(source, 0, 0, maskWidth, maskHeight);
  const data = sampleCtx.getImageData(0, 0, maskWidth, maskHeight).data;
  const rawMask = new Uint8Array(maskWidth * maskHeight);
  for (let i = 0; i < rawMask.length; i++) {
    rawMask[i] = data[i * 4 + 3] > 18 ? 255 : 0;
  }

  const closedMask = fillClosedSilhouette(dilateMask(rawMask, maskWidth, maskHeight, 9), maskWidth, maskHeight);
  const solidMask = makeMaskCanvas(closedMask, maskWidth, maskHeight);

  targetCtx.clearRect(0, 0, target.width, target.height);

  const strongBlur = tier === "low" ? 28 : tier === "medium" ? 38 : 48;
  const edgeBlur = tier === "low" ? 8 : 12;

  targetCtx.save();
  targetCtx.filter = `blur(${strongBlur}px)`;
  targetCtx.globalAlpha = tier === "low" ? 0.9 : 1;
  targetCtx.drawImage(solidMask, 0, 0, target.width, target.height);
  targetCtx.restore();

  targetCtx.save();
  targetCtx.filter = `blur(${edgeBlur}px)`;
  targetCtx.globalAlpha = 0.95;
  targetCtx.drawImage(solidMask, 0, 0, target.width, target.height);
  targetCtx.restore();

  targetCtx.globalCompositeOperation = "source-in";
  targetCtx.fillStyle = color;
  targetCtx.fillRect(0, 0, target.width, target.height);

  targetCtx.globalCompositeOperation = "destination-out";
  targetCtx.drawImage(solidMask, 0, 0, target.width, target.height);
  targetCtx.globalCompositeOperation = "source-over";
}

export function ArchetypeCanvasBrain({ className = "", archetype }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const rafRef = useRef<number | null>(null);
  const tier = useDeviceTier();
  const [reducedMotion, setReducedMotion] = useState(false);

  const getRimColor = () => {
    const element = containerRef.current;
    if (!element || typeof window === "undefined") return "rgba(255, 255, 255, 0.95)";
    const styles = window.getComputedStyle(element);
    return (
      styles.getPropertyValue("--arch-edge").trim() ||
      styles.getPropertyValue("--arch-primary").trim() ||
      "rgba(255, 255, 255, 0.95)"
    );
  };

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
    // Real rim-light: build a closed silhouette from the brain alpha, blur it,
    // then subtract the solid core. The canvas contains only the OUTSIDE halo,
    // so light never appears inside the brain's transparent neural gaps.
    const glow = glowCanvasRef.current;
    if (glow) {
      drawRimLight(first, glow, getRimColor(), tier);
    }
  }, [ready, tier, archetype]);

  // 30fps loop, pulling straight from the in-memory cache.
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const glow = glowCanvasRef.current;

    let frame = 1; // frame 0 already drawn by the layout effect
    let last = performance.now();

    const draw = (now: number) => {
      const elapsed = now - last;
      if (elapsed >= FRAME_MS) {
        const img = framesRef.current[frame];
        if (img) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          if (glow && frame % 4 === 0) {
            drawRimLight(img, glow, getRimColor(), tier);
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
  }, [ready, tier, archetype]);

  return (
    <div
      ref={containerRef}
      data-arch={archetype}
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      style={{ background: "transparent" }}
    >
      <canvas
        ref={glowCanvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 m-auto max-w-full max-h-full w-auto h-auto"
        style={{
          zIndex: 0,
          opacity: 1,
          mixBlendMode: "screen",
          willChange: "opacity, transform",
          filter:
            "saturate(1.35) drop-shadow(0 0 18px var(--arch-edge, var(--arch-primary))) drop-shadow(0 0 42px var(--arch-glow))",
          animation: reducedMotion
            ? undefined
            : "arch-breathe 5.5s ease-in-out infinite",
        }}
      />

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