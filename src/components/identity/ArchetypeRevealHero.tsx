import { ArchetypeSymbol } from "./symbols";

type Arch = "AO" | "SS" | "EA" | "HI";

/**
 * Arte animada do arquétipo — sem caixa, sem borda, totalmente transparente.
 * Concêntricos rotacionando, aura pulsante, partículas orbitando e símbolo
 * central respirando. Cores vêm dos tokens [data-arch].
 */
export function ArchetypeRevealHero({ arch }: { arch: Arch }) {
  return (
    <div
      className="relative mx-auto w-full max-w-[520px] aspect-square select-none"
      aria-hidden
    >
      {/* Aura externa pulsante (sem borda dura) */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--arch-glow) 0%, transparent 55%)",
          filter: "blur(40px)",
          animation: "arch-breathe 6s ease-in-out infinite",
        }}
      />

      {/* Halo médio */}
      <div
        className="absolute inset-[12%] rounded-full opacity-80"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--arch-primary) 0%, transparent 60%)",
          filter: "blur(28px)",
          animation: "arch-breathe 8s ease-in-out infinite reverse",
        }}
      />

      {/* Anel rotativo lento */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full"
        style={{ animation: "mr-spin 38s linear infinite" }}
      >
        <defs>
          <linearGradient id={`ring-${arch}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--arch-primary)" stopOpacity="0.9" />
            <stop offset="60%" stopColor="var(--arch-edge)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--arch-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle
          cx="100" cy="100" r="92"
          fill="none"
          stroke={`url(#ring-${arch})`}
          strokeWidth="0.6"
          strokeDasharray="2 6"
        />
        <circle
          cx="100" cy="100" r="78"
          fill="none"
          stroke="var(--arch-primary)"
          strokeOpacity="0.35"
          strokeWidth="0.4"
          strokeDasharray="14 4 2 4"
        />
      </svg>

      {/* Anel rotativo rápido em sentido contrário */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-[6%] w-[88%] h-[88%]"
        style={{ animation: "mr-spin 22s linear infinite reverse" }}
      >
        <circle
          cx="100" cy="100" r="96"
          fill="none"
          stroke="var(--arch-primary)"
          strokeOpacity="0.55"
          strokeWidth="0.5"
          strokeDasharray="1 5"
        />
      </svg>

      {/* Partículas orbitando */}
      <div
        className="absolute inset-0"
        style={{ animation: "mr-spin 14s linear infinite" }}
      >
        {[0, 72, 144, 216, 288].map((deg) => (
          <span
            key={deg}
            className="absolute left-1/2 top-1/2 block h-2 w-2 rounded-full"
            style={{
              background: "var(--arch-primary)",
              boxShadow: "0 0 12px var(--arch-glow)",
              transform: `rotate(${deg}deg) translate(0, -46%) translate(-50%, -50%)`,
            }}
          />
        ))}
      </div>
      <div
        className="absolute inset-0"
        style={{ animation: "mr-spin 28s linear infinite reverse" }}
      >
        {[36, 108, 180, 252, 324].map((deg) => (
          <span
            key={deg}
            className="absolute left-1/2 top-1/2 block h-1 w-1 rounded-full opacity-70"
            style={{
              background: "var(--arch-edge)",
              boxShadow: "0 0 8px var(--arch-glow)",
              transform: `rotate(${deg}deg) translate(0, -38%) translate(-50%, -50%)`,
            }}
          />
        ))}
      </div>

      {/* Símbolo central respirando */}
      <div
        className="absolute inset-[22%] flex items-center justify-center"
        style={{
          color: "var(--arch-primary)",
          filter: "drop-shadow(0 0 20px var(--arch-glow))",
          animation: "arch-breathe 5s ease-in-out infinite",
        }}
      >
        <ArchetypeSymbol arch={arch} className="w-full h-full" />
      </div>

      {/* Núcleo brilhante */}
      <div
        className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "var(--arch-primary)",
          boxShadow:
            "0 0 24px var(--arch-glow), 0 0 60px var(--arch-glow)",
          animation: "arch-pulse-core 2.4s ease-in-out infinite",
        }}
      />
    </div>
  );
}
