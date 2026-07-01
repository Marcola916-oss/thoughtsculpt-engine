import { useAwakening, ACTS } from "./awakening-context";

/**
 * ScrollProgressDots — 7-dot vertical progress indicator for The Awakening Protocol.
 *
 * Positioned on the right edge (desktop) or bottom edge (mobile).
 * Current act dot fills with --arch-primary, others are outline.
 * Clicking a dot navigates to that act's scroll position.
 */
export function ScrollProgressDots() {
  const { currentActIndex, reduced } = useAwakening();

  if (reduced) return null;

  const scrollToAct = (actIdx: number) => {
    const act = ACTS[actIdx];
    if (!act) return;
    const scrollTarget = act.start;
    // Find the scrollable container.
    const el = document.querySelector("[data-awakening-root]");
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const totalScroll = rect.height - window.innerHeight;
    const targetY = rect.top + window.scrollY + totalScroll * scrollTarget;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Scroll progress"
      className="fixed z-50 flex flex-col items-center gap-3 end-4 top-1/2 -translate-y-1/2 sm:end-6 pointer-events-auto"
    >
      {ACTS.map((act, i) => {
        const isActive = i === currentActIndex;
        const isPast = i < currentActIndex;
        return (
          <button
            key={act.id}
            type="button"
            aria-label={`Act ${act.roman}`}
            aria-current={isActive ? "step" : undefined}
            onClick={() => scrollToAct(i)}
            className="group relative flex items-center justify-center transition-all duration-300"
            style={{ width: 12, height: 12 }}
          >
            {/* Dot background */}
            <span
              className="absolute inset-0 rounded-full border transition-all duration-300"
              style={{
                borderColor: isActive
                  ? "var(--arch-primary)"
                  : isPast
                    ? "color-mix(in oklab, var(--arch-primary) 50%, transparent)"
                    : "color-mix(in oklab, var(--arch-primary) 20%, transparent)",
                background: isActive
                  ? "var(--arch-primary)"
                  : isPast
                    ? "color-mix(in oklab, var(--arch-primary) 30%, transparent)"
                    : "transparent",
                transform: isActive ? "scale(1.3)" : "scale(1)",
                boxShadow: isActive
                  ? "0 0 12px color-mix(in oklab, var(--arch-primary) 60%, transparent)"
                  : "none",
              }}
            />
            {/* Roman numeral tooltip on hover */}
            <span
              className="absolute end-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              style={{ color: "var(--arch-primary)" }}
            >
              {act.roman}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default ScrollProgressDots;
