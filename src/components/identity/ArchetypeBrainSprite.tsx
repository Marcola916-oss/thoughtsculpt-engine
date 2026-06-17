import { useEffect, useRef } from "react";
import desktopSprite from "@/assets/brain-desktop-transparent.webp";
import mobileSprite from "@/assets/brain-mobile-transparent.webp";

const COLS = 12;
const ROWS = 10;
const FRAMES = 120;
const FPS = 30;
const FRAME_MS = 1000 / FPS;

/**
 * Cérebro animado universal — 120 frames WebP em sprite sheet, loop 4s @30fps.
 * Usa sprite com alpha real; não depende de blend-mode para esconder fundo preto.
 */
export function ArchetypeBrainSprite({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respeita prefers-reduced-motion: trava no frame do ápice
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setFrame = (i: number) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      el.style.backgroundPosition = `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`;
    };

    if (reduced) {
      setFrame(60);
      return;
    }

    let raf = 0;
    let last = performance.now();
    let frame = 0;
    setFrame(0);

    const tick = (now: number) => {
      const elapsed = now - last;
      if (elapsed >= FRAME_MS) {
        const steps = Math.floor(elapsed / FRAME_MS);
        frame = (frame + steps) % FRAMES;
        last += steps * FRAME_MS;
        setFrame(frame);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={`brain-sprite-wrapper ${className}`}
      aria-hidden
    >
      {/* Halo na cor do arquétipo, atrás do cérebro */}
      <div className="brain-sprite-halo" />
      <div
        ref={ref}
        className="brain-sprite"
        style={{
          backgroundImage: `image-set(url(${desktopSprite}) 1x)`,
        }}
      />
      {/* Mobile override via media query: usa sprite menor */}
      <style>{`
        @media (max-width: 768px) {
          .brain-sprite-wrapper .brain-sprite {
            background-image: image-set(url(${mobileSprite}) 1x) !important;
          }
        }
      `}</style>
    </div>
  );
}