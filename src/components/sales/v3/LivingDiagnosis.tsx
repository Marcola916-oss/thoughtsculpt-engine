/**
 * LivingDiagnosis — "The Awakening Mesh"
 *
 * A living neural mesh built on Canvas 2D. Nodes drift with organic noise,
 * connect to nearest neighbors, react to pointer (repulsion + halo),
 * and morph target formation as the user scrolls through the sales scenes.
 *
 * Progressive quality by device tier:
 *   low    →  90 nodes, no glow, 45px link radius
 *   medium → 220 nodes, soft glow, 70px link radius
 *   high   → 460 nodes, layered glow, 95px link radius
 *
 * Uses --arch-primary as the living palette so it inherits the archetype.
 * Fully accessible: aria-hidden, respects prefers-reduced-motion (freezes
 * on a beautiful static formation instead of running the loop).
 */

import { useEffect, useRef } from "react";
import { useDeviceTier, type DeviceTier } from "@/hooks/use-device-tier";

type Formation = "brain" | "spiral" | "grid" | "cascade" | "portal";

interface Node {
  x: number;
  y: number;
  tx: number; // target x
  ty: number; // target y
  vx: number;
  vy: number;
  seed: number;
  size: number;
  pulse: number;
}

interface Props {
  /** Number of scroll checkpoints to morph through (root scroll). */
  scrollTargetRef?: React.RefObject<HTMLElement | null>;
  /** Opacity ceiling for the mesh (0-1). Defaults to 1. */
  intensity?: number;
  className?: string;
}

const TIER_CFG: Record<DeviceTier, { nodes: number; radius: number; glow: number; alphaNode: number; alphaLink: number }> = {
  low:    { nodes: 90,  radius: 45, glow: 0,  alphaNode: 0.55, alphaLink: 0.10 },
  medium: { nodes: 220, radius: 70, glow: 8,  alphaNode: 0.70, alphaLink: 0.14 },
  high:   { nodes: 460, radius: 95, glow: 14, alphaNode: 0.85, alphaLink: 0.18 },
};

// Deterministic pseudo-noise (cheap, no lib).
function noise(x: number, y: number, t: number) {
  return (
    Math.sin(x * 0.013 + t) * 0.5 +
    Math.sin(y * 0.017 - t * 0.8) * 0.3 +
    Math.sin((x + y) * 0.009 + t * 1.3) * 0.2
  );
}

// Read --arch-primary as [r,g,b] triplet.
function readArchRGB(): [number, number, number] {
  if (typeof window === "undefined") return [204, 0, 0];
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--arch-primary").trim();
  if (!raw) return [204, 0, 0];
  // Try hex
  const hex = raw.match(/^#?([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  // Fallback: paint into a probe and read back.
  const probe = document.createElement("div");
  probe.style.color = raw;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color.match(/\d+/g);
  document.body.removeChild(probe);
  if (rgb && rgb.length >= 3) return [Number(rgb[0]), Number(rgb[1]), Number(rgb[2])];
  return [204, 0, 0];
}

function seedTargets(nodes: Node[], formation: Formation, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * 0.42;
  const n = nodes.length;

  for (let i = 0; i < n; i++) {
    const node = nodes[i];
    const t = i / n;
    switch (formation) {
      case "brain": {
        // Two lobes (fibonacci-ish) forming a brain silhouette.
        const side = i % 2 === 0 ? -1 : 1;
        const a = t * Math.PI * 6 + side;
        const r = R * (0.35 + 0.5 * Math.sqrt(t)) * (0.85 + 0.15 * Math.sin(a * 3));
        node.tx = cx + side * R * 0.18 + Math.cos(a) * r * 0.55;
        node.ty = cy + Math.sin(a) * r * 0.55 - R * 0.05 * Math.sin(t * Math.PI * 2);
        break;
      }
      case "spiral": {
        const a = t * Math.PI * 10;
        const r = R * Math.sqrt(t);
        node.tx = cx + Math.cos(a) * r;
        node.ty = cy + Math.sin(a) * r;
        break;
      }
      case "grid": {
        const cols = Math.ceil(Math.sqrt(n));
        const gx = i % cols;
        const gy = Math.floor(i / cols);
        const gap = (R * 2) / cols;
        node.tx = cx - R + gx * gap + (gy % 2) * gap * 0.5;
        node.ty = cy - R + gy * gap;
        break;
      }
      case "cascade": {
        node.tx = cx + (node.seed - 0.5) * w * 0.9;
        node.ty = cy + (t - 0.5) * h * 0.9 + Math.sin(t * Math.PI * 4 + node.seed * 6) * R * 0.08;
        break;
      }
      case "portal": {
        const a = t * Math.PI * 2 + node.seed * Math.PI * 2;
        const r = R * (0.55 + 0.35 * Math.sin(t * Math.PI * 8));
        node.tx = cx + Math.cos(a) * r;
        node.ty = cy + Math.sin(a) * r;
        break;
      }
    }
  }
}

export function LivingDiagnosis({ scrollTargetRef, intensity = 1, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);
  const tier = useDeviceTier();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const cfg = TIER_CFG[tier];
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let formation: Formation = "brain";
    let arch = readArchRGB();
    const pointer = { x: -9999, y: -9999, active: false };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(rect.width, 1);
      h = Math.max(rect.height, 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedTargets(nodesRef.current, formation, w, h);
    };

    // Init nodes.
    nodesRef.current = Array.from({ length: cfg.nodes }, () => {
      const seed = Math.random();
      return {
        x: Math.random() * 800,
        y: Math.random() * 800,
        tx: 0,
        ty: 0,
        vx: 0,
        vy: 0,
        seed,
        size: 0.9 + Math.random() * 1.8,
        pulse: Math.random() * Math.PI * 2,
      };
    });
    resize();

    // Scroll → formation morph.
    const FORMATIONS: Formation[] = ["brain", "spiral", "grid", "cascade", "portal"];
    const onScroll = () => {
      const target = scrollTargetRef?.current;
      const rect = target ? target.getBoundingClientRect() : { top: 0, height: window.innerHeight };
      const vh = window.innerHeight;
      const total = Math.max(rect.height - vh, 1);
      const progressed = Math.min(Math.max(-rect.top / total, 0), 1);
      const idx = Math.min(Math.floor(progressed * FORMATIONS.length), FORMATIONS.length - 1);
      const next = FORMATIONS[idx];
      if (next !== formation) {
        formation = next;
        seedTargets(nodesRef.current, formation, w, h);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Pointer interactions (mouse + touch).
    const onMove = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.x <= w && pointer.y >= 0 && pointer.y <= h;
    };
    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => { if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY); };
    const onLeave = () => { pointer.active = false; pointer.x = -9999; pointer.y = -9999; };
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    // Refresh archetype color on class/attribute mutation (arch switch).
    const mo = new MutationObserver(() => { arch = readArchRGB(); });
    mo.observe(document.documentElement, { attributes: true });
    // And once on mount after paint.
    setTimeout(() => { arch = readArchRGB(); }, 0);

    const radiusSq = cfg.radius * cfg.radius;

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      const [r, g, b] = arch;
      // Snap to targets.
      for (const n of nodesRef.current) { n.x = n.tx; n.y = n.ty; }
      // Links
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodesRef.current.length; i++) {
        const a = nodesRef.current[i];
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const b2 = nodesRef.current[j];
          const dx = a.x - b2.x, dy = a.y - b2.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < radiusSq) {
            const alpha = (1 - d2 / radiusSq) * cfg.alphaLink * intensity;
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b2.x, b2.y);
            ctx.stroke();
          }
        }
      }
      // Nodes
      for (const n of nodesRef.current) {
        ctx.fillStyle = `rgba(${r},${g},${b},${cfg.alphaNode * intensity})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (reduced) {
      drawStatic();
      const ro = new ResizeObserver(() => { resize(); drawStatic(); });
      ro.observe(canvas);
      return () => { ro.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMouse); window.removeEventListener("touchmove", onTouch); window.removeEventListener("mouseleave", onLeave); mo.disconnect(); };
    }

    let last = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - last) / 16.6, 2);
      last = time;
      const t = time * 0.0004;
      const [r, g, b] = arch;

      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      // Update.
      for (const n of nodes) {
        // Organic drift towards target.
        const nx = noise(n.tx, n.ty, t + n.seed) * 22;
        const ny = noise(n.ty, n.tx, t + n.seed * 1.7) * 22;
        const dx = n.tx + nx - n.x;
        const dy = n.ty + ny - n.y;
        n.vx += dx * 0.006;
        n.vy += dy * 0.006;

        // Pointer repulsion.
        if (pointer.active) {
          const pdx = n.x - pointer.x;
          const pdy = n.y - pointer.y;
          const pd2 = pdx * pdx + pdy * pdy;
          const R2 = 140 * 140;
          if (pd2 < R2 && pd2 > 0.01) {
            const force = (1 - pd2 / R2) * 1.4;
            const inv = 1 / Math.sqrt(pd2);
            n.vx += pdx * inv * force;
            n.vy += pdy * inv * force;
          }
        }

        n.vx *= 0.86;
        n.vy *= 0.86;
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        n.pulse += 0.03 * dt;
      }

      // Links (nearest neighbors within radius).
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b2 = nodes[j];
          const dx = a.x - b2.x;
          const dy = a.y - b2.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < radiusSq) {
            const alpha = (1 - d2 / radiusSq) * cfg.alphaLink * intensity;
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b2.x, b2.y);
            ctx.stroke();
          }
        }
      }

      // Nodes with subtle pulse + optional glow.
      if (cfg.glow > 0) {
        ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
        ctx.shadowBlur = cfg.glow;
      }
      for (const n of nodes) {
        const p = 0.75 + Math.sin(n.pulse) * 0.25;
        ctx.fillStyle = `rgba(${r},${g},${b},${cfg.alphaNode * intensity * p})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * (0.9 + 0.2 * p), 0, Math.PI * 2);
        ctx.fill();
      }
      if (cfg.glow > 0) ctx.shadowBlur = 0;

      // Pointer halo.
      if (pointer.active) {
        const grd = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 160);
        grd.addColorStop(0, `rgba(${r},${g},${b},${0.14 * intensity})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 160, 0, Math.PI * 2);
        ctx.fill();
      }

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
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [tier, intensity, scrollTargetRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      role="presentation"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
    />
  );
}

export default LivingDiagnosis;