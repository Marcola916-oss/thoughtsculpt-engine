/**
 * NeuralLoader — Cinematic analysis loader.
 *
 * Shows between email capture and archetype reveal.
 * Redesigned with CircuitBrain identity:
 * - CircuitBrain central with ambient glow
 * - Horizontal progress bar with glow
 * - Cycling analysis messages
 * - Real percentage counter
 * - Simplified terminal
 * - Calls onComplete after `durationMs`
 */

import { useState, useEffect, useRef } from "react";
import { useI18n } from "../../lib/i18n/LanguageProvider";
import { LoaderAmbient } from "./LoaderAmbient";

interface NeuralLoaderProps {
  onComplete: () => void;
  durationMs?: number;
  messages?: string[];
  analysisLogs?: string[];
}

export function NeuralLoader({ onComplete, durationMs = 3000, messages, analysisLogs }: NeuralLoaderProps) {
  const { t } = useI18n();
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const startTime = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const lastUpdate = useRef(0);

  const msgs = messages ?? t.loader.steps;
  const logs = analysisLogs ?? t.loader.analysis;

  useEffect(() => {
    startTime.current = Date.now();
    lastUpdate.current = 0;
    function tick() {
      const elapsed = Date.now() - (startTime.current ?? 0);
      const pct = Math.min((elapsed / durationMs) * 100, 100);
      const now = Date.now();
      // Throttle React re-renders to ~10fps; the % counter is visually
      // indistinguishable from 60fps but costs 6x less main-thread time.
      if (pct >= 100 || now - lastUpdate.current >= 100) {
        setProgress(pct);
        lastUpdate.current = now;
      }
      if (pct < 100) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setTimeout(onComplete, 300);
      }
    }
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current != null) cancelAnimationFrame(raf.current); };
  }, [durationMs, onComplete]);

  useEffect(() => {
    const interval = durationMs / msgs.length;
    const id = setInterval(() => {
      setMsgIndex((prev) => Math.min(prev + 1, msgs.length - 1));
    }, interval);
    return () => clearInterval(id);
  }, [msgs, durationMs]);

  useEffect(() => {
    const id = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % logs.length);
    }, 600);
    return () => clearInterval(id);
  }, [logs]);

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] text-center relative w-full max-w-lg mx-auto px-4 z-10">
      {/* Exclusive ambient layer — neural grid, data streams, drifting symbols */}
      <LoaderAmbient />

      {/* Cycling message — protagonist of the upper composition */}
      <div
        role="status"
        aria-live="polite"
        className="h-9 overflow-hidden w-full mb-10 z-10"
      >
        <p
          key={msgIndex}
          className="loader-msg-enter text-lg md:text-xl font-medium tracking-tight text-foreground/90"
        >
          {msgs[msgIndex]}
        </p>
      </div>

      {/* Progress bar — protagonist */}
      <div className="w-full max-w-md z-10">
        <div className="h-[2px] w-full bg-foreground/[0.06] rounded-full overflow-hidden relative">
          <div
            className="loader-progress-bar h-full rounded-full"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, hsl(var(--accent) / 0.7) 0%, hsl(var(--accent)) 50%, hsl(var(--accent) / 0.7) 100%)",
              boxShadow:
                "0 0 16px hsl(var(--accent) / 0.55), 0 0 32px hsl(var(--accent) / 0.25)",
            }}
          />
        </div>
        <div className="mt-3 flex items-baseline justify-between font-mono text-[11px] tracking-[0.2em] uppercase text-foreground/40">
          <span>analyzing</span>
          <span className="tabular-nums text-foreground/70">
            {Math.round(progress).toString().padStart(2, "0")}
            <span className="text-foreground/40 ml-0.5">%</span>
          </span>
        </div>
      </div>

      {/* Terminal — refined, calmer */}
      <div className="mt-12 w-full bg-card/30 backdrop-blur-md border border-border/40 rounded-xl p-4 text-left font-mono text-xs text-foreground/70 z-10">
        <div className="flex items-center justify-between mb-3 border-b border-border/30 pb-2">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--accent))] opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/60">
              MindReset Cognitive Analyzer
            </span>
          </div>
          <span className="text-[9px] opacity-40">v3.0.0</span>
        </div>
        <div className="h-10 overflow-hidden relative">
          <div key={logIndex} className="loader-log-enter space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[hsl(var(--accent))] font-semibold">[SYS]</span>
              <span className="text-foreground/75">{logs[logIndex]}</span>
            </div>
            <div className="opacity-30 text-[9px] truncate">
              {`0x${(100000 + logIndex * 4096).toString(16).toUpperCase()} // ${new Date().toISOString().slice(11, 19)}`}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
