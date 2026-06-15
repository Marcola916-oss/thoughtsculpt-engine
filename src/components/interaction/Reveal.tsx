/**
 * Reveal — Declarative scroll-reveal wrapper (Phase F: CSS-only, zero framer-motion).
 *
 * Uses the global IntersectionObserver from useScrollReveal() registered in __root.tsx.
 * Variants map to CSS classes defined in src/styles.css (.reveal, .reveal-scale,
 * .reveal-slide-left, .reveal-slide-right). The observer adds .is-visible on enter.
 *
 * `delay` (seconds) is applied via inline `transition-delay`.
 * `Reveal.Group` keeps the stagger nth-child cadence from styles.css.
 *
 * Compound API preserved:
 *   <Reveal variant="fade-up" delay={0.1}>...</Reveal>
 *   <Reveal.Group>...</Reveal.Group>
 */

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

const CSS_VARIANT_MAP = {
  fade: "reveal",
  "fade-up": "reveal",
  "fade-down": "reveal",
  "slide-left": "reveal-slide-left",
  "slide-right": "reveal-slide-right",
  scale: "reveal-scale",
  "scale-spring": "reveal-scale",
} as const;

export type RevealVariant = keyof typeof CSS_VARIANT_MAP;
export type RevealStagger = "normal" | "fast";
export type RevealAs =
  | "div"
  | "section"
  | "article"
  | "span"
  | "li"
  | "ul"
  | "main"
  | "aside"
  | "header"
  | "footer"
  | "nav";

export interface RevealProps {
  variant?: RevealVariant;
  /** Delay in seconds before the visible animation starts. */
  delay?: number;
  /** Duration in seconds of the visible animation (overrides CSS default). */
  duration?: number;
  /** Viewport intersection amount 0-1. Accepted for API compatibility (unused — observer uses a global threshold). */
  amount?: number;
  /** Viewport root margin. Accepted for API compatibility (unused). */
  margin?: string;
  /** Animate only the first time the element enters the viewport. Accepted for API compatibility (observer animates once). */
  once?: boolean;
  /** HTML element to render. Default 'div'. */
  as?: RevealAs;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

function RevealRoot({
  variant = "fade-up",
  delay,
  duration,
  as: Tag = "div",
  className,
  style,
  children,
}: RevealProps) {
  const cssClass = CSS_VARIANT_MAP[variant];
  const inlineStyle: CSSProperties = { ...style };
  if (delay != null) inlineStyle.transitionDelay = `${delay}s`;
  if (duration != null) inlineStyle.transitionDuration = `${duration}s`;

  const Component = Tag as unknown as "div";
  return (
    <Component className={cn(cssClass, className)} style={inlineStyle}>
      {children}
    </Component>
  );
}

export interface RevealGroupProps {
  stagger?: RevealStagger;
  amount?: number;
  margin?: string;
  once?: boolean;
  as?: RevealAs;
  className?: string;
  children: ReactNode;
}

function RevealGroup({ as: Tag = "div", className, children }: RevealGroupProps) {
  const Component = Tag as unknown as "div";
  return <Component className={cn("reveal-group", className)}>{children}</Component>;
}

/** No-op provider kept for API compatibility (tier-aware logic removed; CSS handles all tiers). */
export function RevealProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const Reveal = Object.assign(RevealRoot, {
  Group: RevealGroup,
  Item: RevealRoot,
});
RevealRoot.displayName = "Reveal";
RevealGroup.displayName = "Reveal.Group";
