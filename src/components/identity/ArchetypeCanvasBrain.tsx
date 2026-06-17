import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 120;
const FPS = 30;
const FRAME_MS = 1000 / FPS;
const BLACK_CUTOFF = 10;
const FULL_ALPHA_AT = 150;

const frameUrl = (i: number) =>
  `/brain-frames/0617_${String(i).padStart(3, "0")}.webp`;

type Props = {
  className?: string;
  archetype?: "AO" | "SS" | "EA" | "HI";
};

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
}

function removeBlackMatte(img: HTMLImageElement) {
  const frame = document.createElement("canvas");
  frame.width = img.naturalWidth;
  frame.height = img.naturalHeight;

  const frameCtx = frame.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!frameCtx) return frame;

  frameCtx.clearRect(0, 0, frame.width, frame.height);
  frameCtx.drawImage(img, 0, 0);

  const imageData = frameCtx.getImageData(0, 0, frame.width, frame.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);

    if (max <= BLACK_CUTOFF) {
      data[i + 3] = 0;
      continue;
    }

    const alpha = smoothstep(BLACK_CUTOFF, FULL_ALPHA_AT, max);
    data[i + 3] = Math.round(alpha * 255);

    if (alpha > 0) {
      const recover = Math.min(3.5, 1 / alpha);
      data[i] = Math.min(255, Math.round(r * recover));
      data[i + 1] = Math.min(255, Math.round(g * recover));
      data[i + 2] = Math.min(255, Math.round(b * recover));
    }
  }

  frameCtx.putImageData(imageData, 0, 0);
  return frame;
}

export function ArchetypeCanvasBrain({ className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  // Preload all 120 frames before starting the loop.
  useEffect(() => {
    let cancelled = false;
    const frames: HTMLCanvasElement[] = new Array(FRAME_COUNT);
    let loaded = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = frameUrl(i);
      img.onload = () => {
        frames[i] = removeBlackMatte(img);
        loaded += 1;
        if (loaded === FRAME_COUNT && !cancelled) {
          framesRef.current = frames;
          setReady(true);
        }
      };
      img.onerror = () => {
        loaded += 1;
        if (loaded === FRAME_COUNT && !cancelled) {
          framesRef.current = frames.filter(Boolean);
          setReady(true);
        }
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // Animation loop at 30fps.
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const first = framesRef.current[0];
    if (first) {
      canvas.width = first.width;
      canvas.height = first.height;
    }

    let frame = 0;
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
          mixBlendMode: "screen",
          background: "transparent",
          display: "block",
        }}
      />
    </div>
  );
}

export default ArchetypeCanvasBrain;