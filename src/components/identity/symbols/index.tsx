import type { SVGProps } from "react";

type SymbolProps = SVGProps<SVGSVGElement>;

/** AO — Escudo + anéis de contenção */
export function AoShield(props: SymbolProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={0.8} {...props}>
      <circle cx="100" cy="100" r="90" opacity="0.25" />
      <circle cx="100" cy="100" r="72" opacity="0.4" />
      <circle cx="100" cy="100" r="54" opacity="0.55" />
      <path d="M100 38 L150 60 V108 C150 134 128 154 100 162 C72 154 50 134 50 108 V60 Z" strokeWidth={1.2} />
      <path d="M100 64 V134 M76 88 H124" strokeWidth={1} opacity="0.7" />
    </svg>
  );
}

/** SS — Coroa + raios */
export function SsCrown(props: SymbolProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={0.8} {...props}>
      <circle cx="100" cy="100" r="84" opacity="0.25" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 12;
        const x1 = 100 + Math.cos(a) * 88;
        const y1 = 100 + Math.sin(a) * 88;
        const x2 = 100 + Math.cos(a) * 96;
        const y2 = 100 + Math.sin(a) * 96;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} opacity="0.6" />;
      })}
      <path d="M60 110 L70 70 L86 96 L100 60 L114 96 L130 70 L140 110 Z" strokeWidth={1.2} />
      <line x1="60" y1="120" x2="140" y2="120" strokeWidth={1.4} />
      <circle cx="100" cy="60" r="3" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

/** EA — Círculo dissolvendo em fragmentos */
export function EaMist(props: SymbolProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={0.8} {...props}>
      <circle cx="100" cy="100" r="70" opacity="0.35" strokeDasharray="6 10" />
      <circle cx="100" cy="100" r="50" opacity="0.5" strokeDasharray="2 12" />
      <circle cx="100" cy="100" r="32" opacity="0.7" strokeDasharray="1 8" />
      <line x1="20" y1="100" x2="60" y2="100" opacity="0.4" />
      <line x1="140" y1="100" x2="180" y2="100" opacity="0.4" />
      <line x1="100" y1="20" x2="100" y2="50" opacity="0.3" />
      <line x1="100" y1="150" x2="100" y2="180" opacity="0.3" />
    </svg>
  );
}

/** HI — Chama + faíscas */
export function HiFlame(props: SymbolProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={0.8} {...props}>
      <circle cx="100" cy="100" r="86" opacity="0.2" />
      <path
        d="M100 30 C 80 70 60 90 70 130 C 76 156 90 170 100 170 C 110 170 124 156 130 130 C 140 90 120 70 100 30 Z"
        strokeWidth={1.4}
      />
      <path d="M100 80 C 92 100 88 116 100 140 C 112 116 108 100 100 80 Z" opacity="0.6" />
      {[
        [40, 50],
        [160, 60],
        [30, 130],
        [170, 130],
        [50, 170],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="currentColor" opacity="0.7" />
      ))}
    </svg>
  );
}

export function ArchetypeSymbol({
  arch,
  ...rest
}: { arch: "AO" | "SS" | "EA" | "HI" } & SymbolProps) {
  const C = arch === "AO" ? AoShield : arch === "SS" ? SsCrown : arch === "EA" ? EaMist : HiFlame;
  return <C {...rest} />;
}