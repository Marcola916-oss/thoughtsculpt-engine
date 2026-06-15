import { useEffect } from "react";

type RevealWindow = {
  __revealObserver?: IntersectionObserver;
  __revealMutationObserver?: MutationObserver;
};

/**
 * Sets up a single global IntersectionObserver for CSS-based scroll reveals.
 *
 * Finds all `.reveal` elements and adds `.is-visible` when they enter the viewport.
 * Uses a SINGLE observer for all elements (not one per element like Framer Motion).
 *
 * This is the mobile-optimized alternative to Framer Motion's whileInView.
 * Zero JS animation — all transitions are pure CSS (transform + opacity = GPU composited).
 *
 * Called once in the root layout. No-op if observer already exists.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prevent double-initialization
    const w = window as RevealWindow;
    if (w.__revealObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // animate once
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    const observe = (el: Element) => {
      if (el.hasAttribute("data-reveal-observed")) return;
      el.setAttribute("data-reveal-observed", "");
      observer.observe(el);
    };

    const REVEAL_SELECTOR =
      ".reveal, .reveal-scale, .reveal-slide-left, .reveal-slide-right";

    // Observe all current reveal elements (any variant)
    document.querySelectorAll(REVEAL_SELECTOR).forEach(observe);

    // Watch for .reveal elements added later (quiz stages, route changes, etc.).
    // Without this, dynamically mounted .reveal nodes stay invisible forever on mobile.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.(REVEAL_SELECTOR)) observe(node);
          node.querySelectorAll?.(REVEAL_SELECTOR).forEach(observe);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Store for cleanup
    w.__revealObserver = observer;
    w.__revealMutationObserver = mo;

    return () => {
      observer.disconnect();
      mo.disconnect();
      delete w.__revealObserver;
      delete w.__revealMutationObserver;
    };
  }, []);
}
