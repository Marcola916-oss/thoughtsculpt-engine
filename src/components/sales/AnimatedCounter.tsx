/**
 * Fase 4 — AnimatedCounter
 *
 * Conta de 0 até `end` quando entra em viewport. Usa react-countup
 * (≈3 kB gzipped) e IntersectionObserver. Respeita prefers-reduced-motion.
 */

import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";

export type AnimatedCounterProps = {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  separator?: string;
  className?: string;
};

export function AnimatedCounter({
  end,
  prefix = "",
  suffix = "",
  duration = 1.6,
  separator = ".",
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [started, setStarted] = useState(false);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (started || typeof IntersectionObserver === "undefined") return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  if (reduced) {
    return (
      <span ref={ref} className={className}>
        {prefix}
        {end.toLocaleString()}
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {started ? (
        <CountUp
          end={end}
          duration={duration}
          separator={separator}
          prefix={prefix}
          suffix={suffix}
        />
      ) : (
        <>
          {prefix}0{suffix}
        </>
      )}
    </span>
  );
}

export default AnimatedCounter;
