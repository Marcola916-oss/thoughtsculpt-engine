/**
 * VSLScrollAnim — animação por scroll de 35 frames WebP.
 *
 * Técnica de fundo transparente: mix-blend-mode: screen
 * (fundo preto desaparece, elementos claros ficam visíveis)
 *
 * Os frames são pré-carregados silenciosamente e o frame
 * correto é escolhido com base na posição de scroll dentro
 * da seção pai (Block 1 do VSL).
 */

import { useEffect, useRef, useState, useCallback } from "react";

const TOTAL_FRAMES = 35;
const FRAME_BASE = "/vsl-frames/VSL(MindReset)-Video_";

/** Gera o path de um frame pelo índice (ex: 000, 001 ... 034) */
function framePath(index: number): string {
  return `${FRAME_BASE}${String(index).padStart(3, "0")}.webp`;
}

/** Pré-carrega todas as imagens em background */
function preloadFrames(): Promise<HTMLImageElement[]> {
  const promises = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
    return new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img); // silencioso em caso de erro
      img.src = framePath(i);
    });
  });
  return Promise.all(promises);
}

interface VSLScrollAnimProps {
  /** Largura em px do container */
  size?: number;
  className?: string;
}

export function VSLScrollAnim({ size = 340, className = "" }: VSLScrollAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Pré-carrega os frames
  useEffect(() => {
    preloadFrames().then(() => setLoaded(true));
  }, []);

  // Handler de scroll — calcula o frame com base no scroll
  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;

      // Pega o elemento section pai (Block 1) para calcular o range
      const section = el.closest("section") ?? el;
      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;

      // progress: 0 quando a seção entra na tela, 1 quando sai
      const progress = Math.max(0, Math.min(1, (windowH - rect.top) / (windowH + rect.height)));

      const idx = Math.min(TOTAL_FRAMES - 1, Math.round(progress * (TOTAL_FRAMES - 1)));
      setFrameIndex(idx);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // disparo inicial
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Camada de glow vermelho sutil atrás da imagem */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 55%, rgba(204,0,0,0.18) 0%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />

      {/* Imagem atual — mix-blend-mode: screen faz o preto ficar transparente */}
      <img
        key={frameIndex}
        src={framePath(frameIndex)}
        alt=""
        width={size}
        height={size}
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          // fundo preto → transparente; elementos claros permanecem visíveis
          mixBlendMode: "screen",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
          display: "block",
          pointerEvents: "none",
        }}
      />

      {/* Shimmer de loading enquanto as imagens carregam */}
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse rounded-full"
          style={{ background: "radial-gradient(ellipse at 50% 50%, #1a1a1a 0%, transparent 70%)" }}
        />
      )}
    </div>
  );
}
