import { useRef, useEffect } from "react";

interface SculptureParticlesProps {
  count?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  drift: number;
  phase: number;
}

function createParticle(canvasW: number, canvasH: number, startAtTop = false): Particle {
  return {
    x: Math.random() * canvasW,
    y: startAtTop ? -10 : Math.random() * canvasH,
    size: 1 + Math.random() * 2,
    speed: 0.15 + Math.random() * 0.35,
    alpha: 0.15 + Math.random() * 0.35,
    drift: (Math.random() - 0.5) * 0.3,
    phase: Math.random() * Math.PI * 2,
  };
}

export function SculptureParticles({ count = 18, className }: SculptureParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    // Get arch-primary color from CSS variable
    const getCGColor = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--arch-primary")
        .trim();
      return raw || "oklch(0.52 0.24 27)";
    };

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, () => createParticle(w, h));

    let lastTime = 0;
    const loop = (time: number) => {
      const dt = lastTime ? Math.min(time - lastTime, 32) : 16;
      lastTime = time;

      ctx.clearRect(0, 0, w, h);

      const color = getCGColor();

      for (const p of particlesRef.current) {
        // Update position
        p.y += p.speed * (dt / 16);
        p.x += p.drift + Math.sin(p.phase + time * 0.0005) * 0.1;

        // Respawn at top when below canvas
        if (p.y > h + 10) {
          Object.assign(p, createParticle(w, h, true));
        }

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      role="presentation"
      className={`pointer-events-none absolute inset-0 z-[2] ${className ?? ""}`}
      style={{ opacity: 0.6 }}
    >
      Decorative particle animation
    </canvas>
  );
}
