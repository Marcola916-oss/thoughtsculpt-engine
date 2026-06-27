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
  badge,
  titleFont = "display",
}: {
  index?: number;
  eyebrow?: string;
  title?: React.ReactNode;
  children: ReactNode;
  sceneId: string;
  dropCap?: boolean;
  badge?: string;
  titleFont?: "display" | "sans";
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
    <section ref={ref} className="relative py-20 sm:py-28 w-full transition-all group">
      {index && <span className="sales-roman pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity" aria-hidden>{ROMAN[index] ?? index}</span>}
      <div className="relative z-10">
        <Reveal>
          {badge && (
            <span
              className="badge-pulse mb-5 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-arch-primary/40 bg-arch-primary/10 px-4 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-arch-primary shadow-[0_0_18px_-4px_var(--arch-glow)]"
              style={{ color: "var(--arch-primary)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                <path d="M9 4.5c-2 0-3.5 1.3-3.7 3-1.4.4-2.3 1.6-2.3 3 0 .9.4 1.7 1 2.2-.6.5-1 1.3-1 2.2 0 1.4.9 2.6 2.3 3 .2 1.7 1.7 3 3.7 3 .8 0 1.6-.3 2.2-.8.6.5 1.4.8 2.2.8 2 0 3.5-1.3 3.7-3 1.4-.4 2.3-1.6 2.3-3 0-.9-.4-1.7-1-2.2.6-.5 1-1.3 1-2.2 0-1.4-.9-2.6-2.3-3-.2-1.7-1.7-3-3.7-3-.8 0-1.6.3-2.2.8C10.6 4.8 9.8 4.5 9 4.5Z" />
                <path d="M11.2 5v14" opacity="0.85" />
              </svg>
              {badge}
            </span>
          )}
          {eyebrow && (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.4em]"
               style={{ color: "var(--arch-primary)" }}>
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className={`mb-8 ${titleFont === "sans" ? "font-sans" : "font-display"} font-extrabold uppercase leading-[1.02] tracking-tight text-white drop-shadow-md`}
                style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}>
              {title}
            </h2>
          )}
          <div className={dropCap ? "sales-dropcap text-white/90 text-[17px] leading-[1.7]" : "text-white/90"}>
            {children}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default SceneFrame;