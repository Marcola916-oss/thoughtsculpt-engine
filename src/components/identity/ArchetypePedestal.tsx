import { memo } from "react";

type Arch = "AO" | "SS" | "EA" | "HI";

/**
 * Pedestal holográfico sob o cérebro.
 * - Estático na estrutura, mas com efeitos sutis de "vida":
 *   anéis rotacionando lentamente, glow pulsando e um feixe de scan circular.
 * - Cores puxam dos tokens --arch-primary / --arch-glow / --arch-edge.
 */
export const ArchetypePedestal = memo(function ArchetypePedestal({
  arch: _arch,
  className = "",
}: {
  arch: Arch;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none relative ${className}`}
      style={{ perspective: "900px" }}
    >
      {/* Glow ambiente da base — pulsa devagar */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-[2/1] rounded-[50%] blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--arch-glow) 0%, transparent 70%)",
          opacity: 0.75,
          animation: "ped-glow 4.5s ease-in-out infinite",
        }}
      />

      {/* Plataforma 3D */}
      <div
        className="relative w-full aspect-[3/1]"
        style={{ transform: "rotateX(62deg)", transformStyle: "preserve-3d" }}
      >
        {/* Anel externo — gira no sentido horário */}
        <div
          className="absolute inset-0 rounded-full border-2"
          style={{
            borderColor: "color-mix(in oklab, var(--arch-primary) 65%, transparent)",
            boxShadow:
              "0 0 30px var(--arch-glow), inset 0 0 30px color-mix(in oklab, var(--arch-primary) 35%, transparent)",
            animation: "ped-spin-cw 24s linear infinite",
          }}
        >
          {/* marcadores no anel externo */}
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-0 h-2 w-[2px] -translate-x-1/2 -translate-y-1/2"
              style={{
                background: "var(--arch-primary)",
                boxShadow: "0 0 6px var(--arch-glow)",
                transform: `rotate(${i * 30}deg) translateY(-50%)`,
                transformOrigin: "center 50vh",
              }}
            />
          ))}
        </div>

        {/* Anel médio — gira contra */}
        <div
          className="absolute rounded-full border"
          style={{
            inset: "10%",
            borderColor: "color-mix(in oklab, var(--arch-edge) 80%, transparent)",
            borderStyle: "dashed",
            animation: "ped-spin-ccw 32s linear infinite",
          }}
        />

        {/* Anel interno sólido — base do cérebro */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "22%",
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--arch-primary) 30%, transparent) 0%, color-mix(in oklab, var(--arch-primary) 8%, transparent) 60%, transparent 100%)",
            border:
              "1px solid color-mix(in oklab, var(--arch-primary) 50%, transparent)",
            boxShadow:
              "inset 0 0 40px color-mix(in oklab, var(--arch-glow) 60%, transparent)",
          }}
        />

        {/* Feixe de scan — varre o disco */}
        <div
          className="absolute rounded-full overflow-hidden"
          style={{ inset: "22%" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, var(--arch-primary) 18deg, transparent 36deg, transparent 360deg)",
              opacity: 0.55,
              animation: "ped-spin-cw 6s linear infinite",
              mixBlendMode: "screen",
            }}
          />
        </div>

        {/* Núcleo brilhante no centro */}
        <div
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "var(--arch-primary)",
            boxShadow:
              "0 0 20px var(--arch-primary), 0 0 40px var(--arch-glow)",
            animation: "ped-glow 2.4s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
});