import { useEffect, useRef } from "react";
import { useAwakening, type ActId } from "./awakening-context";

interface Particle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  size: number;
  alpha: number;
  phase: number;
  speed: number;
  seed: number;
}

type MorphFormation = "void" | "brain" | "shatter" | "symbols" | "cascade" | "grid" | "reassemble";

const ACT_TO_FORMATION: Record<ActId, MorphFormation> = {
  void: "void",
  awakening: "brain",
  map: "symbols",
  protocol: "cascade",
  proof: "grid",
  decision: "reassemble",
};

function computeTargets(formation: MorphFormation, w: number, h: number, seeds: Particle[]): void {
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * 0.42;
  const n = seeds.length;

  for (let i = 0; i < n; i++) {
    const p = seeds[i];
    const t = i / n;
    switch (formation) {
      case "void":
        // All particles hidden at center.
        p.tx = cx;
        p.ty = cy;
        break;
      case "brain": {
        // Two lobes forming a brain silhouette.
        const side = i % 2 === 0 ? -1 : 1;
        const a = t * Math.PI * 6 + side;
        const r = R * (0.35 + 0.5 * Math.sqrt(t)) * (0.85 + 0.15 * Math.sin(a * 3));
        p.tx = cx + side * R * 0.18 + Math.cos(a) * r * 0.55;
        p.ty = cy + Math.sin(a) * r * 0.55 - R * 0.05 * Math.sin(t * Math.PI * 2);
        break;
      }
      case "shatter": {
        // Explode outward into 4 quadrants.
        const q = i % 4;
        const angle = (q * Math.PI) / 2 + Math.PI / 4;
        const dist = R * (0.4 + 0.6 * Math.sqrt(t));
        p.tx = cx + Math.cos(angle) * dist + (p.seed - 0.5) * R * 0.15;
        p.ty = cy + Math.sin(angle) * dist + (p.seed - 0.5) * R * 0.15;
        break;
      }
      case "symbols": {
        // 4 compact clusters.
        const q = i % 4;
        const gcx = cx + (q % 2 === 0 ? -1 : 1) * R * 0.45;
        const gcy = cy + (q < 2 ? -1 : 1) * R * 0.45;
        const la = ((i - q) / (n / 4)) * Math.PI * 2;
        const lr = R * 0.12 * Math.sqrt(t);
        p.tx = gcx + Math.cos(la) * lr;
        p.ty = gcy + Math.sin(la) * lr;
        break;
      }
      case "cascade": {
        // Vertical cascade columns.
        p.tx = cx + (p.seed - 0.5) * w * 0.9;
        p.ty = cy + (t - 0.5) * h * 0.85 + Math.sin(t * Math.PI * 4 + p.seed * 6) * R * 0.08;
        break;
      }
      case "grid": {
        // Regular grid.
        const cols = Math.ceil(Math.sqrt(n));
        const gx = i % cols;
        const gy = Math.floor(i / cols);
        const gap = (R * 2) / cols;
        p.tx = cx - R + gx * gap + (gy % 2) * gap * 0.5;
        p.ty = cy - R + gy * gap;
        break;
      }
      case "reassemble": {
        // Converge to center, then orbit gently.
        const a = t * Math.PI * 2;
        const r = R * 0.25 + Math.sin(t * Math.PI * 8) * R * 0.08;
        p.tx = cx + Math.cos(a) * r;
        p.ty = cy + Math.sin(a) * r;
        break;
      }
    }
  }
}

function noise(x: number, y: number, t: number): number {
  return (
    Math.sin(x * 0.013 + t) * 0.5 +
    Math.sin(y * 0.017 - t * 0.8) * 0.3 +
    Math.sin((x + y) * 0.009 + t * 1.3) * 0.2
  );
}

function readArchRGB(): [number, number, number] {
  if (typeof window === "undefined") return [204, 0, 0];
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--arch-primary").trim();
  if (!raw) return [204, 0, 0];
  const hex = raw.match(/^#?([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const probe = document.createElement("div");
  probe.style.color = raw;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color.match(/\d+/g);
  document.body.removeChild(probe);
  if (rgb && rgb.length >= 3) return [Number(rgb[0]), Number(rgb[1]), Number(rgb[2])];
  return [204, 0, 0];
}

export function ParticleMorph() {
  const { scrollProgress, currentAct, tier, reduced } = useAwakening();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const formationRef = useRef<MorphFormation>("void");
  const actRef = useRef<ActId>("void");

  // Keep refs in sync with context.
  actRef.current = currentAct;

  useEffect(() => {
    if (reduced || tier === "low") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const count = tier === "medium" ? 60 : 150;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let arch = readArchRGB();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(rect.width, 1);
      h = Math.max(rect.height, 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      computeTargets(formationRef.current, w, h, particlesRef.current);
    };

    // Init particles at center.
    particlesRef.current = Array.from({ length: count }, (_, i) => ({
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      size: 0.8 + Math.random() * 1.6,
      alpha: 0.3 + Math.random() * 0.5,
      phase: (i / count) * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
      seed: Math.random(),
    }));
    resize();

    // Scroll → formation morph.
    const onScroll = () => {
      const act = actRef.current;
      const f = ACT_TO_FORMATION[act];
      if (f !== formationRef.current) {
        formationRef.current = f;
        computeTargets(f, w, h, particlesRef.current);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Pointer.
    const pointer = { x: -9999, y: -9999, active: false };
    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.x <= w && pointer.y >= 0 && pointer.y <= h;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    // Color refresh.
    const mo = new MutationObserver(() => {
      arch = readArchRGB();
    });
    mo.observe(document.documentElement, { attributes: true });
    setTimeout(() => {
      arch = readArchRGB();
    }, 0);

    let last = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - last) / 16.6, 2);
      last = time;
      const t = time * 0.0004;
      const [r, g, b] = arch;

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      for (const p of particles) {
        // Organic drift toward target.
        const nx = noise(p.tx, p.ty, t + p.seed) * 16;
        const ny = noise(p.ty, p.tx, t + p.seed * 1.7) * 16;
        const dx = p.tx + nx - p.x;
        const dy = p.ty + ny - p.y;
        p.x += dx * 0.04 * dt;
        p.y += dy * 0.04 * dt;

        // Pointer repulsion.
        if (pointer.active) {
          const pdx = p.x - pointer.x;
          const pdy = p.y - pointer.y;
          const pd2 = pdx * pdx + pdy * pdy;
          const R2 = 100 * 100;
          if (pd2 < R2 && pd2 > 0.01) {
            const force = (1 - pd2 / R2) * 1.0;
            const inv = 1 / Math.sqrt(pd2);
            p.x += pdx * inv * force;
            p.y += pdy * inv * force;
          }
        }
      }

      // Links.
      const radiusSq = 80 * 80 * dpr * dpr;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b2 = particles[j];
          const dx = a.x - b2.x;
          const dy = a.y - b2.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < radiusSq) {
            const alpha = (1 - d2 / radiusSq) * 0.12;
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b2.x, b2.y);
            ctx.stroke();
          }
        }
      }

      // Nodes with pulse.
      ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;
      ctx.shadowBlur = 6 * dpr;
      for (const p of particles) {
        const pulse = 0.7 + Math.sin(p.phase + t * p.speed) * 0.3;
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha * pulse * 0.85})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * dpr * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [tier, reduced]);

  if (reduced || tier === "low") return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      role="presentation"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

export default ParticleMorph;
