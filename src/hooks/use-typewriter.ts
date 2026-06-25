import { useEffect, useState } from "react";

export interface TypewriterOptions {
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  gapMs?: number;
  respectReducedMotion?: boolean;
}

export function useTypewriter(words: string[], opts: TypewriterOptions = {}) {
  const { typeMs = 70, deleteMs = 40, holdMs = 1600, gapMs = 250, respectReducedMotion = true } = opts;
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!words.length) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (respectReducedMotion && reduce) {
      setText(words[0]);
      setIndex(0);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;
    let phase: "type" | "hold" | "delete" | "gap" = "type";
    let pos = 0;

    const tick = () => {
      if (cancelled) return;
      const word = words[i];
      if (phase === "type") {
        pos++;
        setText(word.slice(0, pos));
        if (pos >= word.length) {
          phase = "hold";
          timer = setTimeout(tick, holdMs);
        } else {
          timer = setTimeout(tick, typeMs);
        }
      } else if (phase === "hold") {
        phase = "delete";
        timer = setTimeout(tick, deleteMs);
      } else if (phase === "delete") {
        pos--;
        setText(word.slice(0, Math.max(0, pos)));
        if (pos <= 0) {
          phase = "gap";
          timer = setTimeout(tick, gapMs);
        } else {
          timer = setTimeout(tick, deleteMs);
        }
      } else {
        i = (i + 1) % words.length;
        setIndex(i);
        pos = 0;
        phase = "type";
        timer = setTimeout(tick, typeMs);
      }
    };

    setIndex(0);
    setText("");
    pos = 0;
    phase = "type";
    timer = setTimeout(tick, typeMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.join("|"), typeMs, deleteMs, holdMs, gapMs, respectReducedMotion]);

  return { text, index };
}