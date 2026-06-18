import type { SVGProps } from "react";

type SymbolProps = SVGProps<SVGSVGElement>;

/** AO — Escudo heráldico + cadeado central (Avarento Oculto) */
export function AoShield(props: SymbolProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={0.8} {...props}>
      {/* Escudo heráldico: ombros retos, lados verticais, ponta inferior definida */}
      <path
        d="M50 40 H150 V108 C150 138 128 158 100 168 C72 158 50 138 50 108 Z"
        strokeWidth={1.4}
      />
      {/* Linha interna do escudo (dupla borda heráldica) */}
      <path
        d="M58 48 H142 V107 C142 133 123 151 100 160 C77 151 58 133 58 107 Z"
        strokeWidth={0.7}
        opacity="0.55"
      />
      {/* Cadeado — arco superior */}
      <path
        d="M86 96 V86 C86 78 92 72 100 72 C108 72 114 78 114 86 V96"
        strokeWidth={1.2}
      />
      {/* Cadeado — corpo */}
      <rect x="80" y="96" width="40" height="34" rx="2" strokeWidth={1.2} />
      {/* Cadeado — buraco da fechadura */}
      <circle cx="100" cy="110" r="3" strokeWidth={1} />
      <line x1="100" y1="112" x2="100" y2="120" strokeWidth={1} />
    </svg>
  );
}

/** SS — Coroa solar refinada (Soberano do Status) */
export function SsCrown(props: SymbolProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={0.8} {...props}>
      <circle cx="100" cy="100" r="84" opacity="0.25" />
      {/* 12 raios solares uniformes */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 12;
        const x1 = 100 + Math.cos(a) * 86;
        const y1 = 100 + Math.sin(a) * 86;
        const x2 = 100 + Math.cos(a) * 96;
        const y2 = 100 + Math.sin(a) * 96;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} opacity="0.6" />;
      })}
      {/* Coroa — 3 pontas simétricas com vales suaves */}
      <path
        d="M62 122 L72 78 L86 102 L100 64 L114 102 L128 78 L138 122 Z"
        strokeWidth={1.3}
      />
      {/* Base da coroa */}
      <line x1="62" y1="122" x2="138" y2="122" strokeWidth={1.4} />
      <line x1="66" y1="130" x2="134" y2="130" strokeWidth={0.9} opacity="0.7" />
      {/* Gemas: central + duas laterais */}
      <circle cx="100" cy="64" r="3" fill="currentColor" opacity="0.9" />
      <circle cx="72" cy="78" r="1.8" fill="currentColor" opacity="0.7" />
      <circle cx="128" cy="78" r="1.8" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

/** EA — Lótus geométrica / mandala (Evasor Ansioso → reconexão, centro, observação) */
export function EaMist(props: SymbolProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={0.8} {...props}>
      {/* Círculo de contorno externo */}
      <circle cx="100" cy="100" r="76" opacity="0.3" />
      {/* 6 pétalas geométricas em forma de amêndoa, rotacionadas a cada 60° */}
      {Array.from({ length: 6 }).map((_, i) => (
        <path
          key={i}
          d="M100 30 C 118 60 118 100 100 130 C 82 100 82 60 100 30 Z"
          strokeWidth={1.1}
          transform={`rotate(${i * 60} 100 100)`}
          opacity="0.85"
        />
      ))}
      {/* 6 pétalas internas menores, offset 30° (cria a mandala dupla) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <path
          key={`inner-${i}`}
          d="M100 60 C 110 78 110 100 100 118 C 90 100 90 78 100 60 Z"
          strokeWidth={0.9}
          transform={`rotate(${i * 60 + 30} 100 100)`}
          opacity="0.55"
        />
      ))}
      {/* Núcleo */}
      <circle cx="100" cy="100" r="8" strokeWidth={1.1} />
      <circle cx="100" cy="100" r="2.5" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

/** HI — Chama real com ondulações + faíscas (Hedonista Impulsivo) */
export function HiFlame(props: SymbolProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={0.8} {...props}>
      {/* Halo discreto */}
      <circle cx="100" cy="100" r="88" opacity="0.18" />
      {/* Chama principal — silhueta clássica de tocha: ponta afilada, ombros curvos, base arredondada */}
      <path
        d="M100 28
           C 108 52 128 70 138 92
           C 148 116 144 140 128 156
           C 118 166 108 172 100 174
           C 92 172 82 166 72 156
           C 56 140 52 116 62 92
           C 72 70 92 52 100 28 Z"
        strokeWidth={1.4}
      />
      {/* Lambida lateral — sugere o movimento da chama */}
      <path
        d="M100 64
           C 92 82 78 96 80 118
           C 82 134 92 146 100 154"
        strokeWidth={1}
        opacity="0.55"
      />
      {/* Chama interna (núcleo quente) — gota menor centralizada */}
      <path
        d="M100 86
           C 106 102 116 116 112 134
           C 110 146 104 154 100 158
           C 96 154 90 146 88 134
           C 84 116 94 102 100 86 Z"
        strokeWidth={1.1}
        opacity="0.8"
      />
      {/* Núcleo brilhante */}
      <circle cx="100" cy="138" r="3" fill="currentColor" opacity="0.9" />
      {/* Faíscas subindo discretas */}
      {[
        [70, 56],
        [132, 60],
        [54, 96],
        [148, 104],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="currentColor" opacity="0.7" />
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