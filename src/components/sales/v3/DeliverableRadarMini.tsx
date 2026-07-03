/**
 * DeliverableRadarMini — Tiny 4-axis radar used inside the hero deliverable card.
 * Pure SVG, no deps. Scores are 0-100 (clamped). Purely decorative preview of the
 * user's Diagnóstico 4D, tinted with --arch-primary.
 */

import type { AreaScores } from "@/lib/funnel/area-scores";

type Props = {
  scores: AreaScores;
  labels: { money: string; career: string; love: string; personal: string };
  ariaLabel: string;
};

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 84;

// Axis order: top=money, right=career, bottom=love, left=personal
const AXES: Array<{ key: keyof AreaScores; angle: number }> = [
  { key: "money", angle: -Math.PI / 2 },
  { key: "career", angle: 0 },
  { key: "love", angle: Math.PI / 2 },
  { key: "personal", angle: Math.PI },
];

function polar(angle: number, r: number) {
  return { x: CENTER + Math.cos(angle) * r, y: CENTER + Math.sin(angle) * r };
}

export function DeliverableRadarMini({ scores, labels, ariaLabel }: Props) {
  const points = AXES.map(({ key, angle }) => {
    const v = Math.max(15, Math.min(100, Number(scores?.[key] ?? 60)));
    return polar(angle, (v / 100) * RADIUS);
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={ariaLabel}
      className="block h-full w-full"
    >
      <defs>
        <radialGradient id="deliverRadarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--arch-primary)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--arch-primary)" stopOpacity="0.05" />
        </radialGradient>
      </defs>

      {/* concentric rings */}
      {[0.35, 0.6, 0.85, 1].map((f, i) => (
        <circle
          key={i}
          cx={CENTER}
          cy={CENTER}
          r={RADIUS * f}
          fill="none"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth={1}
        />
      ))}

      {/* axes */}
      {AXES.map(({ angle }, i) => {
        const end = polar(angle, RADIUS);
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={end.x}
            y2={end.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        );
      })}

      {/* score polygon */}
      <path
        d={path}
        fill="url(#deliverRadarFill)"
        stroke="var(--arch-primary)"
        strokeWidth={1.75}
        strokeLinejoin="round"
        style={{
          filter: "drop-shadow(0 6px 22px color-mix(in oklab, var(--arch-primary) 55%, transparent))",
        }}
      />

      {/* score dots */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill="var(--arch-primary)"
          stroke="#0b0b0b"
          strokeWidth={1.5}
        />
      ))}

      {/* axis labels */}
      {AXES.map(({ key, angle }, i) => {
        const p = polar(angle, RADIUS + 18);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9.5"
            fontWeight={700}
            letterSpacing="1.4"
            fill="rgba(255,255,255,0.72)"
            style={{ textTransform: "uppercase" }}
          >
            {labels[key]}
          </text>
        );
      })}
    </svg>
  );
}

export default DeliverableRadarMini;