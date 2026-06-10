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

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { CircuitBrain } from "@/components/identity";
import { useI18n } from "../../lib/i18n/LanguageProvider";

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
    <section className="flex flex-col items-center justify-center min-h-[70vh] text-center relative w-full max-w-lg mx-auto px-4">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary opacity-[0.04] blur-[12px] lg:blur-[120px] rounded-full pointer-events-none" />

      {/* CircuitBrain — central hero */}
      <div className="relative mb-10">
        <CircuitBrain
          variant="loader"
          size={160}
          withGlow
          animated
          progress={progress}
          ariaLabel="Cognitive analysis in progress"
        />
      </div>

      {/* Percentage */}
      <p className="text-5xl font-black text-foreground mb-8 tabular-nums tracking-tighter">
        {Math.round(progress)}
        <span className="text-2xl text-muted-foreground">%</span>
      </p>

      {/* Horizontal progress bar */}
      <div className="w-full max-w-md mb-10">
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary to-white/80 rounded-full"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 12px rgba(204,0,0,0.6), 0 0 24px rgba(204,0,0,0.3)",
            }}
            transition={{ ease: "linear" }}
          />
        </div>
      </div>

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
      <div className="bg-card/40 border border-border/60 rounded-2xl p-4 w-full text-left font-mono text-xs text-muted-foreground/80 shadow-inner relative overflow-hidden">
        <div className="flex items-center justify-between mb-2 border-b border-border/40 pb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Cognitive Analyzer</span>
          <span className="text-[9px] opacity-50">v3.0.0</span>
        </div>
        <div className="h-10 overflow-hidden relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={logIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">[SYS]</span>
                <span>{logs[logIndex]}</span>
              </div>
              <div className="opacity-30 text-[9px] truncate">
                {`0x${(100000 + logIndex * 4096).toString(16).toUpperCase()} // ${new Date().toISOString().slice(11, 19)}`}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
