/**
 * AtmosphericSmoke — sculpture cradle + page-bottom smoke shelf.
 *
 * Goal: make the sales page look like it is emerging from smoke, with the
 * densest cloud hugging the animated sculpture just below the neck/shoulders.
 */
import { useEffect, useMemo, useRef, type CSSProperties, type RefObject } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Archetype } from "@/lib/quiz/scoring";

export type AtmosphericSmokeProps = {
  archetype: Archetype;
  /** Ref to the sculpture column. We measure the actual canvas inside it. */
  targetRef?: RefObject<HTMLElement | null>;
  /** Ref to the sales page root, used only to pause when off-screen. */
  rootRef?: RefObject<HTMLElement | null>;
};

type Puff = {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
  blur: number;
  delay: number;
  duration: number;
  drift: number;
};

const floorPuffs: Puff[] = [
  {
    left: 4,
    top: 50,
    width: 34,
    height: 38,
    opacity: 0.2,
    blur: 34,
    delay: -2,
    duration: 18,
    drift: 34,
  },
  {
    left: 18,
    top: 38,
    width: 38,
    height: 44,
    opacity: 0.17,
    blur: 42,
    delay: -10,
    duration: 25,
    drift: -42,
  },
  {
    left: 36,
    top: 46,
    width: 40,
    height: 40,
    opacity: 0.19,
    blur: 38,
    delay: -5,
    duration: 21,
    drift: 46,
  },
  {
    left: 56,
    top: 36,
    width: 42,
    height: 46,
    opacity: 0.18,
    blur: 44,
    delay: -14,
    duration: 28,
    drift: -38,
  },
  {
    left: 76,
    top: 48,
    width: 36,
    height: 38,
    opacity: 0.2,
    blur: 36,
    delay: -8,
    duration: 20,
    drift: 30,
  },
  {
    left: 92,
    top: 42,
    width: 32,
    height: 36,
    opacity: 0.14,
    blur: 40,
    delay: -17,
    duration: 26,
    drift: -34,
  },
];

const cradlePuffs: Puff[] = [
  {
    left: 50,
    top: 58,
    width: 60,
    height: 35,
    opacity: 0.8,
    blur: 34,
    delay: -1,
    duration: 8,
    drift: 12,
  },
  {
    left: 33,
    top: 62,
    width: 46,
    height: 31,
    opacity: 0.62,
    blur: 30,
    delay: -4,
    duration: 11,
    drift: -18,
  },
  {
    left: 67,
    top: 61,
    width: 48,
    height: 32,
    opacity: 0.64,
    blur: 31,
    delay: -6,
    duration: 10,
    drift: 16,
  },
  {
    left: 47,
    top: 72,
    width: 78,
    height: 28,
    opacity: 0.58,
    blur: 42,
    delay: -9,
    duration: 14,
    drift: -10,
  },
  {
    left: 55,
    top: 45,
    width: 40,
    height: 30,
    opacity: 0.34,
    blur: 38,
    delay: -3,
    duration: 13,
    drift: 9,
  },
  {
    left: 26,
    top: 78,
    width: 42,
    height: 24,
    opacity: 0.35,
    blur: 36,
    delay: -11,
    duration: 15,
    drift: 22,
  },
  {
    left: 75,
    top: 78,
    width: 44,
    height: 25,
    opacity: 0.36,
    blur: 36,
    delay: -12,
    duration: 16,
    drift: -24,
  },
];

const wispLines = Array.from({ length: 11 }, (_, i) => ({
  left: 9 + i * 8.2,
  delay: -(i * 1.75),
  duration: 12 + (i % 4) * 2.4,
  height: 120 + (i % 5) * 26,
  opacity: 0.14 + (i % 3) * 0.045,
}));

export default function AtmosphericSmoke({ archetype, targetRef, rootRef }: AtmosphericSmokeProps) {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const root = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const runningRef = useRef(true);

  const visibleFloorPuffs = useMemo(
    () => (isMobile ? floorPuffs.slice(0, 4) : floorPuffs),
    [isMobile],
  );
  const visibleCradlePuffs = useMemo(
    () => (isMobile ? cradlePuffs.slice(0, 5) : cradlePuffs),
    [isMobile],
  );

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const measure = () => {
      if (!runningRef.current) return;

      const target = targetRef?.current;
      const sculptureCanvas = target?.querySelector("canvas");
      const rect = sculptureCanvas?.getBoundingClientRect() ?? target?.getBoundingClientRect();

      if (!rect || rect.width <= 0 || rect.height <= 0) {
        el.style.setProperty("--smoke-x", `${window.innerWidth * 0.68}px`);
        el.style.setProperty("--smoke-y", `${window.innerHeight * 0.64}px`);
        el.style.setProperty("--smoke-scale", "1");
        return;
      }

      const x = rect.left + rect.width * 0.52;
      // A escultura é um busto: o abraço visual precisa começar no pescoço/ombros,
      // não no fundo do sticky aside.
      const y = rect.top + rect.height * 0.62;
      const scale = Math.max(0.76, Math.min(1.18, rect.width / 540));

      el.style.setProperty("--smoke-x", `${x}px`);
      el.style.setProperty("--smoke-y", `${y}px`);
      el.style.setProperty("--smoke-scale", `${scale}`);
    };

    const tick = () => {
      measure();
      rafRef.current = requestAnimationFrame(tick);
    };

    measure();
    rafRef.current = requestAnimationFrame(tick);

    let io: IntersectionObserver | null = null;
    const rootEl = rootRef?.current;
    if (rootEl && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          runningRef.current = entry.isIntersecting;
          if (entry.isIntersecting) measure();
        },
        { threshold: 0 },
      );
      io.observe(rootEl);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      io?.disconnect();
    };
  }, [targetRef, rootRef, archetype]);

  return (
    <div
      ref={root}
      aria-hidden
      className="sales-atmospheric-smoke pointer-events-none contents"
      data-reduced-motion={reduced ? "true" : "false"}
    >
      <div className="sales-smoke-page-tint" />

      {/* Full-width bottom shelf: the page/text visually rises out of it. */}
      <div className="sales-smoke-floor" style={{ zIndex: 3 }}>
        <div className="sales-smoke-floor-bed" />
        {visibleFloorPuffs.map((puff, i) => (
          <span
            key={`floor-${i}`}
            className="sales-smoke-puff sales-smoke-puff-floor"
            style={
              {
                "--p-left": `${puff.left}%`,
                "--p-top": `${puff.top}%`,
                "--p-width": `${puff.width}vw`,
                "--p-height": `${puff.height}vh`,
                "--p-opacity": puff.opacity,
                "--p-blur": `${puff.blur}px`,
                "--p-delay": `${puff.delay}s`,
                "--p-duration": `${puff.duration}s`,
                "--p-drift": `${puff.drift}px`,
              } as CSSProperties
            }
          />
        ))}
        {!isMobile &&
          wispLines.map((line, i) => (
            <span
              key={`wisp-${i}`}
              className="sales-smoke-wisp"
              style={
                {
                  "--w-left": `${line.left}%`,
                  "--w-height": `${line.height}px`,
                  "--w-delay": `${line.delay}s`,
                  "--w-duration": `${line.duration}s`,
                  "--w-opacity": line.opacity,
                } as CSSProperties
              }
            />
          ))}
      </div>

      {/* Back cradle sits behind the sculpture so the art is born from the cloud. */}
      <div className="sales-smoke-cradle" style={{ zIndex: 3 }}>
        <div className="sales-smoke-cradle-back" />
        <div className="sales-smoke-neck-ring" />
      </div>

      {/* Front veil crosses the neck/shoulders, creating the actual smoke embrace. */}
      <div className="sales-smoke-cradle" style={{ zIndex: 5 }}>
        {visibleCradlePuffs.map((puff, i) => (
          <span
            key={`cradle-${i}`}
            className="sales-smoke-puff sales-smoke-puff-cradle"
            style={
              {
                "--p-left": `${puff.left}%`,
                "--p-top": `${puff.top}%`,
                "--p-width": `${puff.width}%`,
                "--p-height": `${puff.height}%`,
                "--p-opacity": puff.opacity,
                "--p-blur": `${puff.blur}px`,
                "--p-delay": `${puff.delay}s`,
                "--p-duration": `${puff.duration}s`,
                "--p-drift": `${puff.drift}px`,
              } as CSSProperties
            }
          />
        ))}
        <div className="sales-smoke-cradle-front" />
      </div>

      <div className="sales-smoke-bottom-vignette" style={{ zIndex: 6 }} />
    </div>
  );
}
