import { Coins, Briefcase, Heart, Sparkles, Brain, TrendingUp, type LucideIcon } from "lucide-react";

/**
 * BrainOrbit — Hexágonos holográficos orbitando o cérebro, conectados por linhas
 * com nós luminosos. Inspirado em scenes de "constellation of capabilities".
 *
 * - Cor 100% derivada de `var(--arch-primary)` (definido pelo data-arch ancestral).
 * - Posicionamento absoluto sobre o container do cérebro (parent precisa ser `relative`).
 * - Decorativo: `aria-hidden`, `pointer-events-none`.
 * - Respeita `prefers-reduced-motion` (animações desligadas via CSS global).
 */

type Node = {
  icon: LucideIcon;
  /** Posição percentual no container (0–100). 50/50 = centro. */
  x: number;
  y: number;
  /** Delay da animação de pulso (s). */
  delay: number;
};

const NODES: Node[] = [
  { icon: Brain,       x: 50, y: 16, delay: 0.0 },  // topo
  { icon: Briefcase,   x: 12, y: 32, delay: 0.4 },  // sup-esq
  { icon: TrendingUp,  x: 88, y: 32, delay: 0.8 },  // sup-dir
  { icon: Coins,       x: 6,  y: 66, delay: 1.2 },  // meio-esq
  { icon: Sparkles,    x: 94, y: 66, delay: 1.6 },  // meio-dir
  { icon: Heart,       x: 50, y: 84, delay: 2.0 },  // base (escondido em mobile-tight)
];

const HEX_SIZE = 56; // px — tamanho do hexágono
const HEX_SIZE_SM = 44;

/** Path SVG de um hexágono "flat-top" centrado em (0,0), raio r. */
function hexPath(r: number) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
  });
  return `M${pts.join(" L")} Z`;
}

export function BrainOrbit({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ zIndex: 25 }}
    >
      {/* Linhas conectoras: SVG full-bleed, viewport em % (viewBox 0 0 100 100). */}
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ mixBlendMode: "screen" }}
      >
        <defs>
          <linearGradient id="brain-orbit-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--arch-primary)" stopOpacity="0.05" />
            <stop offset="50%" stopColor="var(--arch-primary)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--arch-primary)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {NODES.map((n, i) => (
          <g key={i}>
            <line
              x1="50"
              y1="50"
              x2={n.x}
              y2={n.y}
              stroke="url(#brain-orbit-line)"
              strokeWidth="0.18"
              strokeDasharray="0.8 1.4"
              style={{
                animation: `brain-orbit-flow 3.2s linear ${n.delay}s infinite`,
              }}
            />
            {/* Nó luminoso no fim da linha (junto ao hex) */}
            <circle
              cx={n.x}
              cy={n.y}
              r="0.45"
              fill="var(--arch-primary)"
              style={{
                filter: "drop-shadow(0 0 1.2px var(--arch-primary))",
                animation: `brain-orbit-pulse 2.6s ease-in-out ${n.delay}s infinite`,
              }}
            />
          </g>
        ))}
      </svg>

      {/* Hexágonos com ícones — posicionados em % do container. */}
      {NODES.map((n, i) => {
        const Icon = n.icon;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              transform: "translate(-50%, -50%)",
              animation: `brain-orbit-float 6s ease-in-out ${n.delay}s infinite`,
            }}
          >
            <div
              className="relative flex items-center justify-center"
              style={{
                width: HEX_SIZE_SM,
                height: HEX_SIZE_SM,
              }}
            >
              <svg
                viewBox="-32 -32 64 64"
                className="absolute inset-0 h-full w-full"
                style={{ filter: "drop-shadow(0 0 8px color-mix(in oklab, var(--arch-primary) 60%, transparent))" }}
              >
                <path
                  d={hexPath(28)}
                  fill="color-mix(in oklab, var(--arch-primary) 12%, transparent)"
                  stroke="var(--arch-primary)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  style={{
                    animation: `brain-orbit-pulse 2.6s ease-in-out ${n.delay}s infinite`,
                  }}
                />
              </svg>
              <Icon
                className="relative h-4 w-4 text-arch-primary md:h-5 md:w-5"
                strokeWidth={1.8}
                style={{ filter: "drop-shadow(0 0 4px var(--arch-primary))" }}
              />
            </div>
            {/* Versão maior em md+ via CSS sibling (overlay) — feito por escala no wrapper. */}
            <style>{`
              @media (min-width: 768px) {
                .brain-orbit-hex-${i} { width: ${HEX_SIZE}px; height: ${HEX_SIZE}px; }
              }
            `}</style>
          </div>
        );
      })}
    </div>
  );
}

export default BrainOrbit;