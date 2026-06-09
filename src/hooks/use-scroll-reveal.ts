import { useEffect } from "react";

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
    if ((window as { __revealObserver?: IntersectionObserver }).__revealObserver) return;

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

    // Observe all current .reveal elements
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Store for cleanup
    (window as { __revealObserver?: IntersectionObserver }).__revealObserver = observer;

    return () => {
      observer.disconnect();
      delete (window as { __revealObserver?: IntersectionObserver }).__revealObserver;
    };
  }, []);
}
