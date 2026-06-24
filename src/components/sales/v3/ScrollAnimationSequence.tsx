import { useEffect, useRef, useState, type RefObject } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

type Props = {
  /** Element whose scroll progress drives the animation. */
  targetRef: RefObject<HTMLElement | null>;
  className?: string;
  archetype?: any; // kept for compatibility if needed, though unused
};

/**
 * ScrollAnimationSequence — scroll-driven image sequence renderer.
 *
 * Preloads 50 frames of animation and renders them directly to a Canvas
 * based on the user's scroll progress in the targetRef.
 */
export function ScrollAnimationSequence({ targetRef, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const currentFrameRef = useRef(1);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Preload frames 0001 to 0050
  useEffect(() => {
    let isCancelled = false;
    const preload = async () => {
      const imgPromises: Promise<HTMLImageElement>[] = [];

      for (let i = 1; i <= 50; i++) {
        // e.g. 1 -> "0001"
        const paddedIndex = i.toString().padStart(4, "0");
        const src = `/anim-webp/ArtePV_${paddedIndex}.webp`;

        const p = new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(img);
          img.onerror = () => {
            console.warn(`[ScrollAnim] Failed to load frame: ${src}`);
            // Resolve with the broken image object anyway to not block Promise.all,
            // or we could reject it. Let's just resolve so we don't break the whole sequence.
            resolve(img);
          };
        });

        imgPromises.push(p);
      }

      const results = await Promise.all(imgPromises);
      if (!isCancelled) {
        setImages(results);
        setLoaded(true);
      }
    };
    preload();

    return () => {
      isCancelled = true;
    };
  }, []);

  const drawFrame = (frameIndex: number) => {
    if (!loaded || images.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // frameIndex is 1-indexed
    const img = images[frameIndex - 1];
    
    // Check if the image loaded successfully (naturalWidth > 0)
    if (!img || img.naturalWidth === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image scaled to fit the 1080x1080 canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!loaded) return;
    // Map 0 -> 1 progress to 1 -> 50 frame
    let frame = Math.floor(latest * 50) + 1;
    if (frame > 50) frame = 50;
    if (frame < 1) frame = 1;
    
    if (frame !== currentFrameRef.current) {
      currentFrameRef.current = frame;
      drawFrame(frame);
    }
  });

  // Initial draw
  useEffect(() => {
    if (loaded) {
      drawFrame(currentFrameRef.current);
    }
  }, [loaded]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden ${className}`}
      style={{ zIndex: 1 }}
    >
      {/* We use a high-res base canvas to avoid blurry upscaling, then CSS downscales it */}
      <canvas
        ref={canvasRef}
        width={1080}
        height={1080}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export default ScrollAnimationSequence;
