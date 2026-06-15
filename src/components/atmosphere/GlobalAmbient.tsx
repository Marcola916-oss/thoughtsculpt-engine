import { useRouterState } from "@tanstack/react-router";
import { useDeviceTier } from "@/hooks/use-device-tier";

const SYMBOLS = ["€", "$", "¥", "₿", "£", "¢", "×", "÷", "≈", "π", "Σ", "∞"];

const SYMBOL_SLOTS = [
  [8, 16, 24, 0, 18],
  [79, 18, 28, 2.2, -16],
  [17, 45, 22, 1.1, 20],
  [88, 54, 26, 3.1, -22],
  [44, 10, 20, 0.7, 14],
  [64, 79, 24, 2.8, -18],
  [26, 84, 22, 1.8, 16],
  [92, 88, 26, 3.7, -20],
  [38, 31, 18, 1.4, 22],
  [58, 61, 20, 4.2, -14],
  [12, 70, 18, 2.5, 12],
  [82, 39, 20, 1.6, -18],
] as const;

/**
 * GlobalAmbient — Background orchestrator for the entire application.
 * Tier-aware and route-aware to adjust intensity without blocking the UI.
 */
export function GlobalAmbient() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tier = useDeviceTier();
  // On low-tier devices (mobile/touch), render a much cheaper version:
  // no animated symbols, no scanbeam — just the static mesh background.
  const isLow = tier === "low";
  const visibleSymbols = isLow ? [] : SYMBOL_SLOTS.slice(0, 8);

  return (
    <div className="mindreset-global-ambient" aria-hidden="true">
      <div className="mindreset-ambient-mesh" />
      {!isLow && (
        <>
          <div className="mindreset-ambient-fog mindreset-ambient-fog-a" />
          <div className="mindreset-ambient-fog mindreset-ambient-fog-b" />
          <div className="mindreset-ambient-fog mindreset-ambient-fog-c" />
        </>
      )}
      <div className="mindreset-ambient-symbols">
        {visibleSymbols.map(([x, y, size, delay, drift], index) => (
          <span
            key={`${pathname}-${index}`}
            className="mindreset-ambient-symbol"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              fontSize: `${size}px`,
              animationDelay: `${delay}s`,
              ["--ambient-symbol-drift" as string]: `${drift}px`,
            }}
          >
            {SYMBOLS[index % SYMBOLS.length]}
          </span>
        ))}
      </div>
      <div className="mindreset-ambient-scanlines" />
      {!isLow && <div className="mindreset-ambient-scanbeam" />}
    </div>
  );
}
