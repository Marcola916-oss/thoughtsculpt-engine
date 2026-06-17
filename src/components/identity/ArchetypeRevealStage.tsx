import type { ReactNode } from "react";
import { ArchetypeSymbol } from "./symbols";

type Arch = "AO" | "SS" | "EA" | "HI";

/**
 * Cena completa da página Reveal personalizada por arquétipo.
 * - Cortina escura que neutraliza o fog vermelho global
 * - Vinheta + fog na cor do arquétipo (--arch-fog / --arch-glow)
 * - Camada de partículas/atmosfera específica
 * - Símbolo SVG gigantesco atrás do conteúdo
 */
export function ArchetypeRevealStage({
  arch,
  children,
}: {
  arch: Arch;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden">
      {/* Fog atmosférico na cor do arquétipo — funde com o bg global do projeto,
          sem cortina/caixa. Mask radial suaviza todas as bordas. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, var(--arch-fog) 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, var(--arch-glow) 0%, transparent 65%)",
          opacity: 0.95,
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Atmosfera específica por arquétipo */}
      <ArchAtmosphere arch={arch} />

      {/* Símbolo gigantesco no fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[75%] z-0 aspect-square w-[min(60vw,460px)] -translate-x-1/2 -translate-y-1/2 text-[var(--arch-edge)] opacity-[0.07]"
      >
        <ArchetypeSymbol arch={arch} className="w-full h-full" />
      </div>

      {children}
    </div>
  );
}

/** Camadas de partículas/atmosfera distintas por arquétipo. */
function ArchAtmosphere({ arch }: { arch: Arch }) {
  if (arch === "AO") {
    // Pó frio caindo + brilho contido
    return (
      <div aria-hidden className="absolute inset-0 -z-[8] overflow-hidden">
        <div className="absolute inset-0 opacity-30 mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, var(--arch-edge) 0.5px, transparent 1px), radial-gradient(circle at 70% 60%, var(--arch-ink) 0.5px, transparent 1px), radial-gradient(circle at 40% 80%, var(--arch-edge) 0.5px, transparent 1px)",
            backgroundSize: "120px 200px, 180px 220px, 150px 180px",
            animation: "mr-rain-slow 18s linear infinite",
          }}
        />
      </div>
    );
  }
  if (arch === "SS") {
    // Brilhos dourados refletivos
    return (
      <div aria-hidden className="absolute inset-0 -z-[8] overflow-hidden">
        <div className="absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 25%, var(--arch-gold) 1px, transparent 2px), radial-gradient(circle at 80% 40%, var(--arch-edge) 1px, transparent 2px), radial-gradient(circle at 45% 75%, var(--arch-gold) 0.8px, transparent 1.5px)",
            backgroundSize: "200px 260px, 240px 200px, 180px 220px",
            animation: "mr-shimmer 8s ease-in-out infinite",
          }}
        />
      </div>
    );
  }
  if (arch === "EA") {
    // Névoa difusa fluindo lateralmente
    return (
      <div aria-hidden className="absolute inset-0 -z-[8] overflow-hidden">
        <div className="absolute inset-0 opacity-50"
          style={{
            background:
              "linear-gradient(100deg, transparent 0%, var(--arch-fog) 30%, transparent 60%, var(--arch-fog) 90%, transparent 100%)",
            filter: "blur(60px)",
            animation: "mr-drift 20s ease-in-out infinite",
          }}
        />
      </div>
    );
  }
  // HI — faíscas subindo
  return (
    <div aria-hidden className="absolute inset-0 -z-[8] overflow-hidden">
      <div className="absolute inset-0 opacity-45 mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 90%, var(--arch-primary) 1px, transparent 2px), radial-gradient(circle at 65% 95%, var(--arch-edge) 1px, transparent 2px), radial-gradient(circle at 80% 85%, var(--arch-ink) 0.8px, transparent 1.5px)",
          backgroundSize: "180px 300px, 220px 340px, 160px 280px",
          animation: "mr-spark-up 9s linear infinite",
        }}
      />
    </div>
  );
}