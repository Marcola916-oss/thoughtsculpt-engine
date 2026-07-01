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

  // Preload frames 0001 to 0035
  useEffect(() => {
    let isCancelled = false;
    const preload = async () => {
      const imgPromises: Promise<HTMLCanvasElement>[] = [];

      for (let i = 1; i <= 35; i++) {
        // e.g. 1 -> "0001"
        const paddedIndex = i.toString().padStart(4, "0");
        const src = `/anim-webp/ArtePV_${paddedIndex}.webp`;

        const p = new Promise<HTMLCanvasElement>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            if (img.naturalWidth === 0) {
              resolve(document.createElement("canvas"));
              return;
            }

            // Draw to offscreen canvas
            const c = document.createElement("canvas");
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const ctx = c.getContext("2d", { willReadFrequently: true });

            if (!ctx) {
              resolve(c);
              return;
            }

            ctx.drawImage(img, 0, 0);

            // Remove black background (luma keying)
            const imgData = ctx.getImageData(0, 0, c.width, c.height);
            const data = imgData.data;

            for (let j = 0; j < data.length; j += 4) {
              const r = data[j];
              const g = data[j + 1];
              const b = data[j + 2];

              // Find the brightest channel
              const maxRGB = Math.max(r, g, b);

              // If pixel is very dark, make it transparent
              // Smooth feathering for anti-aliased edges
              if (maxRGB < 35) {
                data[j + 3] = (maxRGB / 35) * 255;
              }
            }

            ctx.putImageData(imgData, 0, 0);
            resolve(c);
          };

          img.onerror = () => {
            console.warn(`[ScrollAnim] Failed to load frame: ${src}`);
            resolve(document.createElement("canvas"));
          };
        });

        imgPromises.push(p);
      }

      const results = await Promise.all(imgPromises);
      if (!isCancelled) {
        setImages(results as any); // Storing Canvas elements instead of Images, they are API-compatible for drawImage
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

    // images are now HTMLCanvasElement, so we use .width and .height instead of .naturalWidth
    if (!img || img.width === 0) return;

    // Set canvas dimensions to match image to avoid squishing
    if (canvas.width !== img.width || canvas.height !== img.height) {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!loaded) return;
    // Map 0 -> 1 progress to 1 -> 35 frame
    let frame = Math.floor(latest * 35) + 1;
    if (frame > 35) frame = 35;
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
      className={`pointer-events-none absolute inset-0 flex items-center justify-center ${className}`}
      style={{ zIndex: 1 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain object-center lg:translate-x-16 transition-opacity duration-300 mix-blend-screen"
        style={{ maxWidth: "600px", maxHeight: "600px", opacity: loaded ? 1 : 0 }}
      />
    </div>
  );
}

export default ScrollAnimationSequence;
