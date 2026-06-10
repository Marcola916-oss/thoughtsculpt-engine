/**
 * BustLoader — Cinematic analysis loader with the MindReset symbol.
 *
 * Drop-in alternative to NeuralLoader for flows where the brand symbol
 * should lead (e.g. the Q10 transition, /onboarding, /share).
 *
 * Combines:
 * - Bust at center with dramatic intensity and smoke
 * - Concentric progress ring synced to elapsed time
 * - 6 orbital particles
 * - Cycling analysis messages (AnimatePresence)
 * - Real percentage counter
 *
 * Calls onComplete after `durationMs`. Honours prefers-reduced-motion.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MarbleBust } from "./MarbleBust";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export interface BustLoaderProps {
  onComplete: () => void;
  /** Duration in ms. Defaults to 3000. */
  durationMs?: number;
  /** Main cycling messages. Falls back to i18n loader.steps. */
  messages?: string[];
  /** Technical log lines. Falls back to i18n loader.analysis. */
  analysisLogs?: string[];
  /** Bust size in pixels. Defaults to 168 for a strong hero feel. */
  bustSize?: number;
}

const ORBITAL_ANGLES = [0, 60, 120, 180, 240, 300];

export function BustLoader({
  onComplete,
  durationMs = 3000,
  messages,
  analysisLogs,
  bustSize = 168,
}: BustLoaderProps) {
  const { t } = useI18n();
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const startTime = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  const msgs = messages ?? t.loader.steps;
  const logs = analysisLogs ?? t.loader.analysis;

  useEffect(() => {
    startTime.current = Date.now();
    function tick() {
      const elapsed = Date.now() - (startTime.current ?? 0);
      const pct = Math.min((elapsed / durationMs) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setTimeout(onComplete, 300);
      }
    }
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
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

  const radius = bustSize / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] text-center relative w-full max-w-lg mx-auto px-4">
      {/* Ambient red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary opacity-[0.08] blur-[12px] lg:blur-[120px] rounded-full pointer-events-none" />

      {/* Bust with progress ring */}
      <div className="relative mb-10" style={{ width: bustSize, height: bustSize }}>
        {/* Progress ring SVG, drawn behind the bust */}
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox={`0 0 ${bustSize} ${bustSize}`}
          aria-hidden
        >
          <circle
            cx={bustSize / 2}
            cy={bustSize / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
            className="opacity-20"
          />
          <motion.circle
            cx={bustSize / 2}
            cy={bustSize / 2}
            r={radius}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ filter: "drop-shadow(0 0 6px var(--color-primary))" }}
            transition={{ ease: "linear" }}
          />
        </svg>

        {/* Bust at center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <MarbleBust
            size={bustSize - 18}
            variant="loader"
            intensity="dramatic"
            withSmoke
            ariaLabel="MindReset analyzing your financial archetype"
          />
        </div>

        {/* Orbital particles */}
        {ORBITAL_ANGLES.map((angleDeg, i) => {
          const orbitRadius = bustSize / 2 - 2;
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `calc(50% + ${Math.sin((angleDeg * Math.PI) / 180) * orbitRadius}px)`,
                left: `calc(50% + ${Math.cos((angleDeg * Math.PI) / 180) * orbitRadius}px)`,
                width: 5,
                height: 5,
                borderRadius: "50%",
                backgroundColor: "var(--color-primary)",
                marginLeft: -2.5,
                marginTop: -2.5,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.3, 0.9, 0.3],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* Percentage */}
      <motion.p
        className="text-4xl font-bold text-foreground mb-6 tabular-nums"
        key={Math.round(progress)}
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.1 }}
      >
        {Math.round(progress)}%
      </motion.p>

      {/* Main cycling message */}
      <div className="h-8 overflow-hidden mb-8 w-full">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            className="text-lg font-semibold text-foreground"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {msgs[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Technical Data Stream */}
      <div className="bg-card/40 border border-border/60 rounded-2xl p-5 w-full text-left font-mono text-xs text-muted-foreground/80 shadow-inner relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
            Cognitive Analyzer
          </span>
          <span className="text-[9px] opacity-50">v3.0.0</span>
        </div>
        <div className="h-14 overflow-hidden relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={logIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">{`[SYS]`}</span>
                <span>{logs[logIndex]}</span>
              </div>
              <div className="opacity-40 text-[10px] truncate">
                {`ADDR: 0x${(100000 + logIndex * 4096).toString(16).toUpperCase()} // TIME: ${new Date().toISOString()}`}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
