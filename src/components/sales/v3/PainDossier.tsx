import { Coins, Briefcase, Heart, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * PainDossier — clinical "behavioral case file" grid.
 *
 * Receives the raw 8 bullets from translations ("Category: symptom") and
 * groups them into 4 dossier cards (2 symptoms each). Purely presentational
 * — copy/i18n stays in translations.ts. Design tokens (CASE FILE, EVIDENCE,
 * DIAGNOSIS) are intentionally in English as universal clinical labels,
 * matching the dossier metaphor across all 5 locales.
 */

const ICONS: LucideIcon[] = [Coins, Briefcase, Heart, User];

type Card = { label: string; symptoms: string[]; Icon: LucideIcon; index: number };

function groupBullets(bullets: string[]): Card[] {
  const cards: Card[] = [];
  for (let i = 0; i < bullets.length; i += 2) {
    const a = bullets[i] ?? "";
    const b = bullets[i + 1] ?? "";
    const splitIdx = a.indexOf(":");
    const label = splitIdx >= 0 ? a.slice(0, splitIdx).trim() : "";
    const first = splitIdx >= 0 ? a.slice(splitIdx + 1).trim() : a;
    const bSplit = b.indexOf(":");
    const second = bSplit >= 0 ? b.slice(bSplit + 1).trim() : b;
    cards.push({
      label,
      symptoms: [first, second].filter(Boolean),
      Icon: ICONS[cards.length] ?? User,
      index: cards.length + 1,
    });
  }
  return cards.slice(0, 4);
}

export function PainDossier({ bullets, conclusion }: { bullets: string[]; conclusion?: string }) {
  const cards = groupBullets(bullets);
  const total = String(cards.length).padStart(2, "0");

  return (
    <div className="mt-12 w-full">
      {/* Dossier header strip — universal design tokens */}
      <div
        className="mb-8 flex items-center justify-between gap-4 border-y py-3 font-mono text-[10px] uppercase tracking-[0.35em] text-white/55"
        style={{ borderColor: "color-mix(in oklab, var(--arch-primary) 22%, transparent)" }}
      >
        <span className="flex items-center gap-2.5">
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: "var(--arch-primary)", boxShadow: "0 0 8px var(--arch-primary)" }}
          />
          <span>Case File</span>
          <span className="text-white/25">·</span>
          <span className="hidden sm:inline">Behavioral Pattern</span>
        </span>
        <span className="font-bold text-white/70">
          {total} <span className="font-normal text-white/40">areas mapped</span>
        </span>
      </div>

      {/* 2×2 grid of dossier cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {cards.map((c) => (
          <article
            key={c.index}
            className="group/dossier relative overflow-hidden rounded-2xl border p-6 sm:p-7 text-start transition-all duration-500 hover:-translate-y-1"
            style={{
              borderColor: "color-mix(in oklab, var(--arch-primary) 18%, rgba(255,255,255,0.08))",
              background:
                "linear-gradient(155deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.35) 55%, color-mix(in oklab, var(--arch-primary) 8%, transparent) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 60px -30px color-mix(in oklab, var(--arch-primary) 45%, transparent)",
            }}
          >
            {/* Corner brackets */}
            <CornerBrackets />

            {/* Grain overlay */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "3px 3px",
              }}
            />

            {/* Header: icon + label + case number */}
            <header className="relative mb-5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3.5">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border transition-transform duration-500 group-hover/dossier:scale-110"
                  style={{
                    borderColor: "color-mix(in oklab, var(--arch-primary) 45%, transparent)",
                    background:
                      "radial-gradient(circle at 30% 20%, color-mix(in oklab, var(--arch-primary) 30%, transparent), transparent 70%)",
                    boxShadow: "0 0 24px -6px var(--arch-glow)",
                  }}
                >
                  <c.Icon
                    className="h-[22px] w-[22px]"
                    strokeWidth={2.25}
                    style={{ color: "var(--arch-primary)" }}
                    aria-hidden
                  />
                </span>
                <p className="truncate font-display text-xl font-extrabold uppercase leading-none tracking-[0.06em] text-white sm:text-[22px]">
                  {c.label}
                </p>
              </div>
              <span
                className="shrink-0 font-mono text-[11px] tracking-[0.18em] text-white/40"
                aria-hidden
              >
                {String(c.index).padStart(2, "0")}<span className="text-white/20"> / {total}</span>
              </span>
            </header>

            {/* Divider + EVIDENCE label */}
            <div
              aria-hidden
              className="relative mb-4 h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--arch-primary) 55%, transparent) 20%, color-mix(in oklab, var(--arch-primary) 20%, transparent) 100%)",
              }}
            />
            <p className="relative mb-4 font-mono text-[9px] uppercase tracking-[0.4em] text-white/40">
              Evidence
            </p>

            {/* Symptoms */}
            <ul className="relative space-y-3">
              {c.symptoms.map((s, i) => (
                <li key={i} className="relative flex gap-3">
                  <span
                    aria-hidden
                    className="mt-[7px] h-4 w-[2px] shrink-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(180deg, var(--arch-primary) 0%, color-mix(in oklab, var(--arch-primary) 40%, transparent) 100%)",
                      boxShadow: "0 0 10px color-mix(in oklab, var(--arch-primary) 70%, transparent)",
                    }}
                  />
                  <p className="text-[15px] leading-[1.6] text-white/85">{s}</p>
                </li>
              ))}
            </ul>

            {/* Hover accent bar */}
            <span
              aria-hidden
              className="absolute inset-x-6 bottom-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 group-hover/dossier:scale-x-100"
              style={{
                background:
                  "linear-gradient(90deg, var(--arch-primary) 0%, transparent 100%)",
                boxShadow: "0 0 12px var(--arch-primary)",
              }}
            />
          </article>
        ))}
      </div>

      {/* Verdict strip */}
      {conclusion && (
        <div
          className="relative mt-8 overflow-hidden rounded-2xl border px-6 py-7 sm:px-9 sm:py-8"
          style={{
            borderColor: "color-mix(in oklab, var(--arch-primary) 35%, transparent)",
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--arch-primary) 12%, transparent) 0%, rgba(0,0,0,0.35) 100%)",
            boxShadow: "0 20px 50px -25px var(--arch-glow)",
          }}
        >
          <span
            aria-hidden
            className="absolute inset-y-0 start-0 w-[3px]"
            style={{
              background: "var(--arch-primary)",
              boxShadow: "0 0 20px var(--arch-primary)",
            }}
          />
          <div className="flex items-center gap-2.5 mb-3">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ background: "var(--arch-primary)", boxShadow: "0 0 8px var(--arch-primary)" }}
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/60">
              Diagnosis
            </p>
          </div>
          <p className="font-display text-xl font-extrabold uppercase leading-[1.2] tracking-tight text-white sm:text-[26px]">
            {conclusion}
          </p>
        </div>
      )}
    </div>
  );
}

function CornerBrackets() {
  const common =
    "pointer-events-none absolute h-3.5 w-3.5 border-white/20 transition-all duration-500 group-hover/dossier:border-arch-primary/70 group-hover/dossier:h-5 group-hover/dossier:w-5";
  return (
    <>
      <span aria-hidden className={`${common} left-2 top-2 border-l-2 border-t-2`} />
      <span aria-hidden className={`${common} right-2 top-2 border-r-2 border-t-2`} />
      <span aria-hidden className={`${common} bottom-2 left-2 border-b-2 border-l-2`} />
      <span aria-hidden className={`${common} bottom-2 right-2 border-b-2 border-r-2`} />
    </>
  );
}

export default PainDossier;