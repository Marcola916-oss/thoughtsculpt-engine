import { Coins, Briefcase, Heart, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * PainDossier — clinical "behavioral case file" grid.
 *
 * Receives 8 bullets ("Category: symptom") and groups them into 4 dossier
 * cards (2 symptoms each). Purely presentational — copy stays in
 * translations.ts. i18n-safe: all chrome uses symbols/numbers only.
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
    <div className="mt-10 w-full">
      {/* Dossier header strip — minimal, i18n-safe (symbols + numbers only) */}
      <div
        className="mb-8 flex items-center justify-center gap-4 border-y py-3 font-mono text-[10px] uppercase tracking-[0.4em] text-white/50"
        style={{ borderColor: "color-mix(in oklab, var(--arch-primary) 22%, transparent)" }}
      >
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
          style={{ background: "var(--arch-primary)", boxShadow: "0 0 8px var(--arch-primary)" }}
        />
        <span className="tracking-[0.5em]">CASE&nbsp;FILE</span>
        <span aria-hidden className="text-white/25">·</span>
        <span>
          <span className="text-white">04</span>
          <span className="text-white/30"> / {total}</span>
        </span>
        <span aria-hidden className="text-white/25">·</span>
        <span className="tracking-[0.5em]">REC</span>
      </div>

      {/* 2×2 grid of dossier cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {cards.map((c) => (
          <article
            key={c.index}
            className="group/dossier relative overflow-hidden rounded-2xl border p-6 pb-7 sm:p-7 sm:pb-8 text-start transition-all duration-500 hover:-translate-y-1"
            style={{
              borderColor: "color-mix(in oklab, var(--arch-primary) 20%, rgba(255,255,255,0.08))",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(0,0,0,0.4) 55%, color-mix(in oklab, var(--arch-primary) 9%, transparent) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 60px -30px color-mix(in oklab, var(--arch-primary) 45%, transparent)",
            }}
          >
            {/* Subtle corner brackets — thematic, no grain */}
            <CornerBrackets />

            {/* Header: icon + label + case chip. Grid so title gets the
                remaining track and wraps cleanly instead of truncating. */}
            <header className="relative mb-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-all duration-500 group-hover/dossier:scale-110 sm:h-12 sm:w-12"
                style={{
                  borderColor: "color-mix(in oklab, var(--arch-primary) 45%, transparent)",
                  background:
                    "radial-gradient(circle at 30% 20%, color-mix(in oklab, var(--arch-primary) 32%, transparent), transparent 70%)",
                  boxShadow: "0 0 24px -6px var(--arch-glow)",
                }}
              >
                <c.Icon
                  className="h-5 w-5 sm:h-[22px] sm:w-[22px]"
                  strokeWidth={2.25}
                  style={{ color: "var(--arch-primary)" }}
                  aria-hidden
                />
              </span>
              <h3 className="min-w-0 font-display text-[19px] font-extrabold uppercase leading-[1.05] tracking-[0.04em] text-white break-words hyphens-none sm:text-[22px] sm:tracking-[0.06em]">
                {c.label}
              </h3>
              <span
                aria-hidden
                className="shrink-0 self-start font-mono text-[10px] leading-none tracking-[0.2em] text-white/45"
              >
                <span className="text-white/75">{String(c.index).padStart(2, "0")}</span>
                <span className="text-white/25"> / {total}</span>
              </span>
            </header>

            {/* Divider */}
            <div
              aria-hidden
              className="relative mb-5 h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, color-mix(in oklab, var(--arch-primary) 55%, transparent) 0%, color-mix(in oklab, var(--arch-primary) 18%, transparent) 40%, transparent 100%)",
              }}
            />

            {/* Symptoms — numbered chapters with scar bar */}
            <ul className="relative space-y-4">
              {c.symptoms.map((s, i) => (
                <li key={i} className="relative flex items-start gap-3.5">
                  {/* index chip */}
                  <span
                    aria-hidden
                    className="mt-[3px] grid h-5 w-5 shrink-0 place-items-center rounded-md border font-mono text-[10px] font-bold leading-none"
                    style={{
                      borderColor: "color-mix(in oklab, var(--arch-primary) 35%, transparent)",
                      color: "color-mix(in oklab, var(--arch-primary) 85%, white)",
                      background: "color-mix(in oklab, var(--arch-primary) 10%, transparent)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* scar bar */}
                  <span
                    aria-hidden
                    className="mt-[6px] h-4 w-[2px] shrink-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(180deg, var(--arch-primary) 0%, color-mix(in oklab, var(--arch-primary) 30%, transparent) 100%)",
                      boxShadow:
                        "0 0 10px color-mix(in oklab, var(--arch-primary) 70%, transparent)",
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
          className="relative mt-8 overflow-hidden rounded-2xl border ps-8 pe-6 py-6 sm:ps-10 sm:pe-8 sm:py-7"
          style={{
            borderColor: "color-mix(in oklab, var(--arch-primary) 35%, transparent)",
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--arch-primary) 14%, transparent) 0%, rgba(0,0,0,0.4) 100%)",
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
          <p
            className="mb-2.5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em] text-white/55"
          >
            <span
              aria-hidden
              className="inline-block h-1 w-1 rounded-full"
              style={{ background: "var(--arch-primary)", boxShadow: "0 0 6px var(--arch-primary)" }}
            />
            Verdict · 04 / {total}
          </p>
          <p className="font-display text-lg font-extrabold uppercase leading-[1.2] tracking-tight text-white sm:text-2xl">
            {conclusion}
          </p>
        </div>
      )}
    </div>
  );
}

function CornerBrackets() {
  const common =
    "pointer-events-none absolute h-3 w-3 border-white/15 transition-all duration-500 group-hover/dossier:border-arch-primary/60 group-hover/dossier:h-5 group-hover/dossier:w-5";
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