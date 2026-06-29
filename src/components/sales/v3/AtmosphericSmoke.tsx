/**
 * AtmosphericSmoke — premium volumetric smoke atmosphere.
 *
 * Engine canônica adaptada do mockup HTML validado:
 *  - SVG fractal turbulence (feTurbulence + feDisplacementMap) p/ bordas orgânicas
 *  - Puffs radial-gradient em camadas (floor + main core + halo + lateral)
 *  - Canvas 2D wisps (partículas finas) por cima
 *  - Ground-fog CSS estático + base-vignette
 *
 * Adaptações p/ React/Sales:
 *  - Cobertura página inteira (fixed inset-0), não só hero
 *  - Ancoragem dinâmica via targetRef -> base do busto
 *  - Tingimento sutil c/ --arch-primary (~15%)
 *  - prefers-reduced-motion + mobile -> contagens reduzidas, loops parados
 *  - IntersectionObserver pausa quando page off-screen
 */
import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Archetype } from "@/lib/quiz/scoring";

export type AtmosphericSmokeProps = {
  archetype: Archetype;
  /** Ref para a escultura (aside) — ancora a fumaça densa na sua base. */
  targetRef?: RefObject<HTMLElement | null>;
  /** Ref para o root da página — pausa loops quando off-screen. */
  rootRef?: RefObject<HTMLElement | null>;
};

const r = (a: number, b: number) => a + Math.random() * (b - a);
const ri = (a: number, b: number) => Math.floor(r(a, b));

/** Lê --arch-primary computado e devolve {r,g,b}. Fallback pérola neutro. */
function readArchTint(): { r: number; g: number; b: number } {
  if (typeof window === "undefined") return { r: 220, g: 220, b: 230 };
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--arch-primary")
    .trim();
  // Aceita #rrggbb, rgb(...), oklch(...) (fallback genérico).
  if (raw.startsWith("#") && raw.length === 7) {
    return {
      r: parseInt(raw.slice(1, 3), 16),
      g: parseInt(raw.slice(3, 5), 16),
      b: parseInt(raw.slice(5, 7), 16),
    };
  }
  const m = raw.match(/rgb[a]?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
    return { r: parts[0] | 0, g: parts[1] | 0, b: parts[2] | 0 };
  }
  // Pérola neutro p/ oklch/outros formatos.
  return { r: 220, g: 220, b: 230 };
}

/** Mix de cor base pérola c/ tint do arquétipo (mix ~15%). */
function tintedBase(
  base: number,
  tint: { r: number; g: number; b: number },
  mix = 0.15,
) {
  const pearl = { r: base * 0.92, g: base * 0.95, b: base };
  return {
    r: Math.round(pearl.r * (1 - mix) + tint.r * mix),
    g: Math.round(pearl.g * (1 - mix) + tint.g * mix),
    b: Math.round(pearl.b * (1 - mix) + tint.b * mix),
  };
}

export default function AtmosphericSmoke({
  archetype,
  targetRef,
  rootRef,
}: AtmosphericSmokeProps) {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  const floorRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tMainRef = useRef<SVGFETurbulenceElement | null>(null);
  const tFloorRef = useRef<SVGFETurbulenceElement | null>(null);
  const runningRef = useRef(true);

  // ── Build puffs + start loops ──────────────────────────
  useEffect(() => {
    const floorEl = floorRef.current;
    const mainEl = mainRef.current;
    const canvas = canvasRef.current;
    if (!floorEl || !mainEl || !canvas) return;

    const tint = readArchTint();

    // Contagens (reduzidas em mobile/reduced-motion).
    const counts = reduced
      ? { floorBack: 8, floorFront: 8, core: 8, halo: 4, lateral: 3 }
      : isMobile
        ? { floorBack: 9, floorFront: 9, core: 12, halo: 6, lateral: 4 }
        : { floorBack: 16, floorFront: 18, core: 22, halo: 12, lateral: 8 };

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    // ── PUFF DO CHÃO (sidebar horizontal) ──
    function makeFloorPuff() {
      const el = document.createElement("div");
      const fw = floorEl!.offsetWidth || W();
      const fh = floorEl!.offsetHeight || H() * 0.48;
      const w = r(240, 620);
      const h = w * r(0.32, 0.6);
      const x = r(-w * 0.4, fw + w * 0.4);
      const y = fh * r(0.48, 1.08);
      const bl = r(30, 72);
      const du = r(24, 48);
      const de = -r(0, du);
      const sw = r(-70, 70);
      const base = ri(188, 252);
      const c = tintedBase(base, tint);
      const op = r(0.38, 0.7);
      const lx = r(18, 72),
        ly = r(14, 58);
      el.style.cssText = `
        position:absolute;border-radius:50%;pointer-events:none;
        width:${w}px;height:${h}px;
        left:${x - w / 2}px;top:${y - h / 2}px;
        background:radial-gradient(ellipse at ${lx}% ${ly}%,
          rgba(${Math.min(c.r + 36, 255)},${Math.min(c.g + 28, 255)},${Math.min(c.b + 18, 255)},${op}) 0%,
          rgba(${c.r},${c.g},${c.b},${op * 0.62}) 30%,
          rgba(${Math.max(c.r - 22, 0)},${Math.max(c.g - 15, 0)},${Math.max(c.b - 9, 0)},${op * 0.28}) 62%,
          transparent 82%);
        filter:blur(${bl}px);
        --sw:${sw}px;--fp:${op * 0.78};
        ${reduced ? "" : `animation:atmsmoke-floor-sway ${du}s cubic-bezier(.45,.05,.55,.95) infinite ${de}s;`}
      `;
      floorEl!.appendChild(el);
    }

    type RisingCfg = {
      cx: number;
      cy: number;
      sx: number;
      sy: number;
      wn: number;
      wx: number;
      bn: number;
      bx: number;
      on: number;
      ox: number;
      dn: number;
      dx: number;
      rn: number;
      rx: number;
      dx2: number;
    };

    function makeRisingPuff(cfg: RisingCfg) {
      const el = document.createElement("div");
      const w = r(cfg.wn, cfg.wx);
      const h = w * r(0.44, 0.8);
      const x = cfg.cx + r(-cfg.sx, cfg.sx);
      const y = cfg.cy + r(-cfg.sy, cfg.sy);
      const bl = r(cfg.bn, cfg.bx);
      const du = r(cfg.dn, cfg.dx);
      const de = -r(0, du * 0.92);
      const riV = -r(cfg.rn, cfg.rx);
      const dr = r(-cfg.dx2, cfg.dx2);
      const es = r(1.32, 1.9);
      const rs = r(-9, 9);
      const re = r(-14, 14);
      const base = ri(192, 252);
      const c = tintedBase(base, tint);
      const op = r(cfg.on, cfg.ox);
      const pk = op * 0.8;
      const lx = r(20, 72),
        ly = r(16, 58);
      el.style.cssText = `
        position:absolute;border-radius:50%;pointer-events:none;
        width:${w}px;height:${h}px;
        left:${x - w / 2}px;top:${y - h / 2}px;
        background:radial-gradient(ellipse at ${lx}% ${ly}%,
          rgba(${Math.min(c.r + 34, 255)},${Math.min(c.g + 26, 255)},${Math.min(c.b + 18, 255)},${op}) 0%,
          rgba(${c.r},${c.g},${c.b},${op * 0.64}) 26%,
          rgba(${Math.max(c.r - 22, 0)},${Math.max(c.g - 15, 0)},${Math.max(c.b - 9, 0)},${op * 0.3}) 58%,
          transparent 80%);
        filter:blur(${bl}px);
        --ri:${riV}px;--dr:${dr}px;--es:${es};
        --pk:${pk};--rs:${rs}deg;--re:${re}deg;
        ${reduced ? "" : `animation:atmsmoke-rise ${du}s cubic-bezier(.28,.0,.72,1.0) infinite ${de}s;`}
      `;
      mainEl!.appendChild(el);
    }

    function buildClouds() {
      floorEl!.innerHTML = "";
      mainEl!.innerHTML = "";
      floorEl!.style.filter = "url(#atmsmoke-f-floor)";
      mainEl!.style.filter = "url(#atmsmoke-f-main)";

      // Ancoragem dinâmica na base do busto.
      let bx = W() * 0.66;
      let by = H() * 0.78;
      const target = targetRef?.current;
      if (target) {
        const rect = target.getBoundingClientRect();
        // Base do busto ≈ pescoço (centro-x, ~78% do height do aside).
        bx = rect.left + rect.width * 0.5;
        by = rect.top + rect.height * 0.78;
      }

      for (let i = 0; i < counts.floorBack; i++) makeFloorPuff();
      for (let i = 0; i < counts.floorFront; i++) makeFloorPuff();

      // Núcleo denso na base
      for (let i = 0; i < counts.core; i++)
        makeRisingPuff({
          cx: bx,
          cy: by,
          sx: 125,
          sy: 48,
          wn: 160,
          wx: 400,
          bn: 22,
          bx: 56,
          on: 0.54,
          ox: 0.88,
          dn: 14,
          dx: 26,
          rn: 160,
          rx: 360,
          dx2: 95,
        });

      // Halo difuso
      for (let i = 0; i < counts.halo; i++)
        makeRisingPuff({
          cx: bx,
          cy: by + r(25, 65),
          sx: 230,
          sy: 55,
          wn: 280,
          wx: 540,
          bn: 36,
          bx: 74,
          on: 0.25,
          ox: 0.5,
          dn: 20,
          dx: 38,
          rn: 80,
          rx: 210,
          dx2: 140,
        });

      // Lateral esquerda muito suave
      for (let i = 0; i < counts.lateral; i++)
        makeRisingPuff({
          cx: W() * 0.26,
          cy: H() * 0.87,
          sx: 200,
          sy: 28,
          wn: 200,
          wx: 440,
          bn: 40,
          bx: 76,
          on: 0.08,
          ox: 0.2,
          dn: 20,
          dx: 36,
          rn: 55,
          rx: 160,
          dx2: 145,
        });
    }

    // ── Canvas wisps ──
    const ctx = canvas.getContext("2d");
    const resizeCanvas = () => {
      canvas.width = W();
      canvas.height = H();
    };
    resizeCanvas();

    class Wisp {
      x = 0;
      y = 0;
      r = 0;
      mop = 0;
      op = 0;
      vx = 0;
      vy = 0;
      lf = 0;
      ml = 0;
      cr = 0;
      cg = 0;
      cb = 0;
      constructor() {
        this.reset();
      }
      reset() {
        const inMain = Math.random() < 0.58;
        const cw = canvas!.width;
        const ch = canvas!.height;
        this.x = inMain ? cw * 0.66 + r(-140, 140) : r(0, cw);
        this.y = inMain ? ch * r(0.68, 0.82) : ch * r(0.86, 0.98);
        this.r = r(7, 26);
        this.mop = r(0.04, 0.17);
        this.op = 0;
        this.vx = r(-0.28, 0.28);
        this.vy = r(-0.48, -0.12);
        this.lf = 0;
        this.ml = r(90, 220);
        const b = ri(168, 238);
        const c = tintedBase(b, tint);
        this.cr = c.r;
        this.cg = c.g;
        this.cb = c.b;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.r += 0.12;
        this.vx += r(-0.018, 0.018);
        this.vx *= 0.992;
        this.lf++;
        const q = this.lf / this.ml;
        this.op =
          q < 0.2
            ? this.mop * (q / 0.2)
            : q < 0.7
              ? this.mop
              : this.mop * (1 - (q - 0.7) / 0.3);
        return this.lf < this.ml && this.op > 0.001;
      }
      draw() {
        if (!ctx || this.op <= 0.001) return;
        ctx.save();
        ctx.globalAlpha = this.op;
        const g = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.r,
        );
        g.addColorStop(0, `rgba(${this.cr},${this.cg},${this.cb},.70)`);
        g.addColorStop(0.5, `rgba(${this.cr},${this.cg},${this.cb},.28)`);
        g.addColorStop(1, `rgba(${this.cr},${this.cg},${this.cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    let wisps: Wisp[] = [];
    let wf = 0;
    let rafTurb = 0;
    let rafWisp = 0;
    let t = 0;

    const animTurb = () => {
      if (!runningRef.current) {
        rafTurb = requestAnimationFrame(animTurb);
        return;
      }
      t += 0.00058;
      tMainRef.current?.setAttribute(
        "baseFrequency",
        `${(0.0135 + Math.sin(t) * 0.0048).toFixed(5)} ${(0.0088 + Math.cos(t * 0.68) * 0.003).toFixed(5)}`,
      );
      tFloorRef.current?.setAttribute(
        "baseFrequency",
        `${(0.0055 + Math.sin(t * 0.65 + 1.8) * 0.0022).toFixed(5)} ${(0.0038 + Math.cos(t * 0.85 + 0.9) * 0.0016).toFixed(5)}`,
      );
      rafTurb = requestAnimationFrame(animTurb);
    };

    const animWisps = () => {
      if (!ctx) return;
      if (!runningRef.current) {
        rafWisp = requestAnimationFrame(animWisps);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      wf++;
      if (wf % 5 === 0) {
        wisps.push(new Wisp());
        if (Math.random() < 0.45) wisps.push(new Wisp());
      }
      if (wisps.length > 100) wisps = wisps.slice(-100);
      wisps = wisps.filter((w) => {
        const a = w.update();
        if (a) w.draw();
        return a;
      });
      rafWisp = requestAnimationFrame(animWisps);
    };

    buildClouds();
    if (!reduced) {
      rafTurb = requestAnimationFrame(animTurb);
      if (!isMobile) rafWisp = requestAnimationFrame(animWisps);
    }

    // Rebuild on resize (debounced).
    let resizeTimer: number | undefined;
    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resizeCanvas();
        buildClouds();
      }, 180);
    };
    window.addEventListener("resize", onResize);

    // Pause when root scrolled out of viewport.
    let io: IntersectionObserver | null = null;
    const rootEl = rootRef?.current;
    if (rootEl && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          runningRef.current = entry.isIntersecting;
        },
        { threshold: 0 },
      );
      io.observe(rootEl);
    }

    return () => {
      cancelAnimationFrame(rafTurb);
      cancelAnimationFrame(rafWisp);
      window.removeEventListener("resize", onResize);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      io?.disconnect();
      floorEl.innerHTML = "";
      mainEl.innerHTML = "";
    };
  }, [archetype, reduced, isMobile, targetRef, rootRef]);

  return (
    <>
      {/* Filtros SVG (turbulência fractal) */}
      <svg
        aria-hidden
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <defs>
          <filter
            id="atmsmoke-f-main"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={tMainRef}
              type="fractalNoise"
              baseFrequency="0.0135 0.0088"
              numOctaves={6}
              seed={7}
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale={68}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter
            id="atmsmoke-f-floor"
            x="-22%"
            y="-22%"
            width="144%"
            height="144%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={tFloorRef}
              type="fractalNoise"
              baseFrequency="0.0055 0.0038"
              numOctaves={5}
              seed={17}
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale={48}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Camadas atmosféricas — fixed na página inteira */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 0 }}
      >
        {/* Reflexo quente sutil */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[45%] w-full"
          style={{
            background:
              "radial-gradient(ellipse 75% 100% at 62% 100%, color-mix(in oklab, var(--arch-primary) 18%, transparent) 0%, transparent 58%)",
          }}
        />
        {/* Sidebar de fumaça (chão de nuvens) */}
        <div
          ref={floorRef}
          className="pointer-events-none absolute bottom-0 left-0 h-[48%] w-full overflow-visible"
        />
        {/* Núcleo (à volta da base do busto) */}
        <div
          ref={mainRef}
          className="pointer-events-none absolute inset-0 overflow-visible"
        />
        {/* Canvas wisps */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ opacity: 0.65 }}
        />
        {/* Ground fog estático CSS */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-[290px] w-full atmsmoke-ground-fog" />
        {/* Vinheta base */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[70px] w-full"
          style={{
            background:
              "linear-gradient(to top, #000 0%, transparent 100%)",
          }}
        />
      </div>
    </>
  );
}