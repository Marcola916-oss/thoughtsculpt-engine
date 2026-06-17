import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 120;
const FPS = 30;
const FRAME_MS = 1000 / FPS;

const frameUrl = (i: number) =>
  `/brain-frames/0617_${String(i).padStart(3, "0")}.webp`;

type Props = {
  className?: string;
  archetype?: "AO" | "SS" | "EA" | "HI";
};

export function ArchetypeCanvasBrain({ className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  // Preload all 120 frames before starting the loop.
  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    let loaded = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = frameUrl(i);
      img.onload = () => {
        loaded += 1;
        if (loaded === FRAME_COUNT && !cancelled) {
          framesRef.current = images;
          setReady(true);
        }
      };
      img.onerror = () => {
        loaded += 1;
        if (loaded === FRAME_COUNT && !cancelled) {
          framesRef.current = images;
          setReady(true);
        }
      };
      images[i] = img;
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
      canvas.width = first.naturalWidth;
      canvas.height = first.naturalHeight;
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