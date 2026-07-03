import { useEffect, useState } from "react";
import { Clock, Eye } from "lucide-react";

const STORAGE_KEY = "mr_sales_timer_start";
const DURATION_MS = 15 * 60 * 1000;

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function UrgencyBar({
  reserveLabel,
  watchingLabel,
  lastChanceLabel,
}: {
  reserveLabel: string;
  watchingLabel: string;
  lastChanceLabel: string;
}) {
  const [remaining, setRemaining] = useState<number>(DURATION_MS);
  const [watchers, setWatchers] = useState<number>(4);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const now = Date.now();
    let start = Number(window.sessionStorage.getItem(STORAGE_KEY));
    if (!start || Number.isNaN(start) || now - start > DURATION_MS * 2) {
      start = now;
      window.sessionStorage.setItem(STORAGE_KEY, String(start));
    }
    const tick = () => setRemaining(Math.max(0, DURATION_MS - (Date.now() - start)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Seed a stable-ish watcher count per session that jitters gently.
    const seed = 8 + Math.floor(Math.random() * 10);
    setWatchers(seed);
    const id = window.setInterval(
      () => setWatchers((w) => {
        const delta = Math.random() < 0.5 ? -1 : 1;
        const next = w + delta;
        return Math.min(17, Math.max(8, next));
      }),
      5000,
    );
    return () => window.clearInterval(id);
  }, []);

  const expired = remaining <= 0;
  const critical = remaining > 0 && remaining <= 60 * 1000;

  return (
    <div
      role="status"
      aria-live={critical ? "polite" : "off"}
      className="sticky top-0 z-40 w-full border-b backdrop-blur-xl"
      style={{
        background: "color-mix(in oklab, black 78%, transparent)",
        borderColor: "color-mix(in oklab, var(--arch-primary) 30%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90 sm:gap-4 sm:text-[12px]">
        <span className="flex items-center gap-2">
          <Clock
            aria-hidden
            size={14}
            className={critical ? "urgency-pulse" : ""}
            style={{ color: "var(--arch-primary)" }}
          />
          {expired ? (
            <span className="text-white/85 normal-case tracking-normal">{lastChanceLabel}</span>
          ) : (
            <>
              <span className="hidden sm:inline text-white/70 normal-case tracking-normal">
                {reserveLabel}
              </span>
              <span
                className="font-mono tabular-nums text-[13px] sm:text-[15px] tracking-normal"
                style={{ color: "var(--arch-primary)" }}
              >
                {format(remaining)}
              </span>
            </>
          )}
        </span>
        <span aria-hidden className="hidden sm:inline text-white/25">·</span>
        <span className="flex items-center gap-1.5 text-white/75 normal-case tracking-normal">
          <Eye aria-hidden size={13} style={{ color: "var(--arch-primary)" }} />
          <span className="font-semibold text-white/90 tabular-nums">{watchers}</span>
          <span className="hidden xs:inline sm:inline">{watchingLabel}</span>
        </span>
      </div>
    </div>
  );
}

export default UrgencyBar;