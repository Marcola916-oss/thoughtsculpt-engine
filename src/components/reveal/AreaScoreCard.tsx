import { useEffect, useState } from "react";
import { Coins, Briefcase, Heart, Sparkles, type LucideIcon } from "lucide-react";
import type { LifeArea } from "@/lib/funnel/area-scores";

const ICONS: Record<LifeArea, LucideIcon> = {
  money: Coins,
  career: Briefcase,
  love: Heart,
  personal: Sparkles,
};

interface Props {
  area: LifeArea;
  label: string;
  description: string;
  score: number; // 0–100
  delayMs?: number;
}

/**
 * Card de diagnóstico por área da vida.
 * Anima a barra de progresso de 0 → score após mount.
 * Cores derivam do --arch-primary (definido pelo data-arch ancestral).
 */
export function AreaScoreCard({ area, label, description, score, delayMs = 0 }: Props) {
  const Icon = ICONS[area];
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(() => setAnimated(score), delayMs + 80);
    return () => window.clearTimeout(id);
  }, [score, delayMs]);

  const severity = score >= 75 ? "critical" : score >= 55 ? "warn" : "watch";
  const severityLabel =
    severity === "critical" ? "Alto impacto" : severity === "warn" ? "Impacto médio" : "Em observação";

  return (
    <article
      className="group relative flex flex-col gap-4 rounded-2xl border border-white/8 bg-card/40 p-6 backdrop-blur-sm transition-all hover:border-arch-primary/50 hover:-translate-y-1"
      style={{ animationDelay: `${delayMs}ms` }}
      aria-label={`${label}: ${score} de 100`}
    >
      {/* Header: ícone + label + score numérico */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-arch-primary/30 bg-arch-primary/10 text-arch-primary"
            aria-hidden
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/55">
              {severityLabel}
            </span>
            <h3 className="font-display text-lg font-extrabold uppercase leading-none tracking-tight text-foreground">
              {label}
            </h3>
          </div>
        </div>
        <div className="text-end">
          <div className="font-display text-3xl font-black leading-none text-arch-primary tabular-nums">
            {animated}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/45">/ 100</div>
        </div>
      </header>

      {/* Barra de progresso animada */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="absolute inset-y-0 start-0 rounded-full"
          style={{
            width: `${animated}%`,
            backgroundImage:
              "linear-gradient(90deg, var(--arch-primary) 0%, color-mix(in oklab, var(--arch-primary) 70%, white) 100%)",
            boxShadow: "0 0 18px color-mix(in oklab, var(--arch-primary) 55%, transparent)",
            transition: "width 900ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>

      {/* Descrição comportamental */}
      <p className="text-sm md:text-[15px] leading-relaxed text-foreground/75">{description}</p>
    </article>
  );
}