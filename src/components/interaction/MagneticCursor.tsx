/**
 * MagneticCursor — Custom cursor follower for the MindReset visual system.
 *
 * A small red dot that follows the mouse with smooth lerp, scales up over
 * interactive elements marked with [data-cursor="hover"], and disappears
 * over text inputs. Touch devices and reduced-motion users are skipped.
 *
 * Mount once globally (Fase 4 — `__root.tsx`). Consumers opt into the
 * "hover" scale by adding `data-cursor="hover"` to any element.
 *
 * @example
 *   // In __root.tsx (single instance, fixed viewport)
 *   <MagneticCursor />
 *
 *   // In a component
 *   <button data-cursor="hover">Click me</button>
 *   <input type="text" />  // cursor auto-hides over this
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MagneticCursorProps {
  /** Cursor diameter in pixels. Default 18. */
  size?: number;
  /** Filled dot or hollow ring. Default 'filled'. */
  variant?: "filled" | "ring";
  /** Cursor color. Default accent. */
  color?: string;
  /** Scale multiplier when over [data-cursor="hover"]. Default 1.6. */
  hoverScale?: number;
  /** Scale multiplier on mousedown. Default 0.7. */
  pressScale?: number;
  /** Lerp factor 0-1. Higher = snappier. Default 0.18. */
  ease?: number;
  className?: string;
}

const INTERACTIVE_SELECTOR = '[data-cursor="hover"]';
const TEXT_SELECTOR = 'input, textarea, [contenteditable="true"], [data-cursor="text"]';

export function MagneticCursor({
  size = 18,
  variant = "filled",
  color = "var(--accent)",
  hoverScale = 1.6,
  pressScale = 0.7,
  ease = 0.18,
  className,
}: MagneticCursorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const position = useRef({ x: -size, y: -size });
  const target = useRef({ x: -size, y: -size });
  const scale = useRef(1);
  const targetScale = useRef(1);
  const opacity = useRef(0);
  const targetOpacity = useRef(0);
  const raf = useRef<number | null>(null);
  const isHovering = useRef(false);
  const isPressed = useRef(false);
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: none)").matches;
  });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined" || isTouch) return;

    const touchQuery = window.matchMedia("(hover: none)");
    const touchListener = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    touchQuery.addEventListener("change", touchListener);

    const handleMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (targetOpacity.current < 0.5) targetOpacity.current = 1;
    };
    const handleMouseOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest(INTERACTIVE_SELECTOR)) {
        if (!isHovering.current) {
          isHovering.current = true;
          targetScale.current = isPressed.current ? hoverScale * 0.9 : hoverScale;
        }
      } else if (t.closest(TEXT_SELECTOR)) {
        targetOpacity.current = 0;
      } else {
        if (isHovering.current) {
          isHovering.current = false;
          targetScale.current = isPressed.current ? pressScale : 1;
        }
      }
    };
    const handleMouseDown = () => {
      isPressed.current = true;
      targetScale.current = isHovering.current ? hoverScale * 0.85 : pressScale;
    };
    const handleMouseUp = () => {
      isPressed.current = false;
      targetScale.current = isHovering.current ? hoverScale : 1;
    };
    const handleDocLeave = () => {
      targetOpacity.current = 0;
    };
    const handleDocEnter = () => {
      targetOpacity.current = 1;
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mousedown", handleMouseDown, { passive: true });
    document.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleDocLeave);
    document.documentElement.addEventListener("mouseenter", handleDocEnter);

    const tick = () => {
      const px = position.current.x + (target.current.x - position.current.x) * ease;
      const py = position.current.y + (target.current.y - position.current.y) * ease;
      position.current.x = px;
      position.current.y = py;
      scale.current += (targetScale.current - scale.current) * 0.22;
      opacity.current += (targetOpacity.current - opacity.current) * 0.18;

      if (ref.current) {
        ref.current.style.transform = `translate3d(${px - size / 2}px, ${py - size / 2}px, 0) scale(${scale.current})`;
        ref.current.style.opacity = String(opacity.current);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      touchQuery.removeEventListener("change", touchListener);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.documentElement.removeEventListener("mouseleave", handleDocLeave);
      document.documentElement.removeEventListener("mouseenter", handleDocEnter);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [size, ease, hoverScale, pressScale]);

  if (isTouch || reducedMotion) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      data-magnetic-cursor
      className={cn(
        "magnetic-cursor pointer-events-none fixed top-0 left-0 z-[9999]",
        variant === "filled" ? "magnetic-cursor-filled" : "magnetic-cursor-ring",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
