import { useEffect, useRef, type ReactNode } from "react";
import { Reveal } from "@/components/interaction";
import { EVENTS, track } from "@/lib/analytics";

const ROMAN: Record<number, string> = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX",
};

/**
 * Editorial scene wrapper. Renders a giant Roman numeral behind the title,
 * fires VSL_SCENE_VIEW once when scrolled into view.
 */
export function SceneFrame({
  index,
  eyebrow,
  title,
  children,
  sceneId,
  dropCap = false,
}: {
  index?: number;
  eyebrow?: string;
  title?: React.ReactNode;
  children: ReactNode;
  sceneId: string;
  dropCap?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const el = ref.current;
    if (!el) return;
    let fired = false;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !fired) {
          fired = true;
          track(EVENTS.VSL_SCENE_VIEW, { scene: sceneId });
          obs.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [sceneId]);

  return (
    <section ref={ref} className="relative py-20 sm:py-28">
      {index && <span className="sales-roman" aria-hidden>{ROMAN[index] ?? index}</span>}
      <div className="relative z-10">
        <Reveal>
          {eyebrow && (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.4em]"
               style={{ color: "var(--arch-primary)" }}>
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="mb-8 font-display font-extrabold leading-[1.02] tracking-tight"
                style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}>
              {title}
            </h2>
          )}
          <div className={dropCap ? "sales-dropcap text-foreground/85 text-[17px] leading-[1.7]" : "text-foreground/85"}>
            {children}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default SceneFrame;