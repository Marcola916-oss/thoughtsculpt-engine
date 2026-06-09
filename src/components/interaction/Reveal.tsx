/**
 * Reveal — Declarative scroll-reveal wrapper.
 *
 * Tier-aware approach:
 * - "low"/"medium" (mobile): Pure CSS transitions + single global IntersectionObserver
 *   → Zero Framer Motion cost, GPU composited, 60fps on any device
 * - "high" (desktop): Full Framer Motion whileInView with variants
 *   → Richer animations (scale-spring, slide, stagger) preserved
 *
 * Compound API:
 *   <Reveal variant="fade-up">...</Reveal>              // single
 *   <Reveal.Group>                                       // stagger container
 *     <Reveal variant="fade-up">A</Reveal>
 *     <Reveal variant="fade-up">B</Reveal>
 *   </Reveal.Group>
 */

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { createContext, useContext, type ReactNode } from "react";
import {
  fadeIn,
  fadeInDown,
  fadeInUp,
  scaleIn,
  scaleInSpring,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerFast,
  staggerItem,
} from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useDeviceTier, type DeviceTier } from "@/hooks/use-device-tier";

const VARIANT_MAP = {
  fade: fadeIn,
  "fade-up": fadeInUp,
  "fade-down": fadeInDown,
  "slide-left": slideInLeft,
  "slide-right": slideInRight,
  scale: scaleIn,
  "scale-spring": scaleInSpring,
} as const;

/** CSS class mapping for mobile-tier reveals */
const CSS_VARIANT_MAP: Record<RevealVariant, string> = {
  fade: "reveal",
  "fade-up": "reveal",
  "fade-down": "reveal",
  "slide-left": "reveal-slide-left",
  "slide-right": "reveal-slide-right",
  scale: "reveal-scale",
  "scale-spring": "reveal-scale",
};

export type RevealVariant = keyof typeof VARIANT_MAP;
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

const RevealGroupContext = createContext(false);
const RevealTierContext = createContext<DeviceTier>("high");

export interface RevealProps {
  variant?: RevealVariant;
  /** Override variants directly (e.g. for custom animations). Wins over `variant`. */
  variants?: Variants;
  /** Delay in seconds before the visible animation starts. */
  delay?: number;
  /** Duration in seconds of the visible animation. */
  duration?: number;
  /** Viewport intersection amount 0-1. Default 0.2. */
  amount?: number;
  /** Viewport root margin. Default "0px". */
  margin?: string;
  /** Animate only the first time the element enters the viewport. Default true. */
  once?: boolean;
  /** HTML element to render. Default 'div'. */
  as?: RevealAs;
  className?: string;
  children: ReactNode;
}

function RevealRoot({
  variant = "fade-up",
  variants,
  delay,
  duration,
  amount = 0.2,
  margin = "0px",
  once = true,
  as = "div",
  className,
  children,
}: RevealProps) {
  const inGroup = useContext(RevealGroupContext);
  const tier = useContext(RevealTierContext);
  const reducedMotion = useReducedMotion();

  // Mobile/low-end tier: CSS-only reveal (zero Framer Motion cost)
  if (tier !== "high" || reducedMotion) {
    const cssClass = CSS_VARIANT_MAP[variant];
    return (
      <div className={cn(cssClass, className)}>
        {children}
      </div>
    );
  }

  // Desktop: full Framer Motion experience
  const baseVariants: Variants = inGroup
    ? {
        hidden: staggerItem.hidden,
        visible: {
          ...(typeof staggerItem.visible === "object" ? staggerItem.visible : {}),
          ...(typeof VARIANT_MAP[variant].visible === "object" ? VARIANT_MAP[variant].visible : {}),
        },
      }
    : (variants ?? VARIANT_MAP[variant]);

  const Component = motion[as] as typeof motion.div;

  const transitionOverride = delay != null || duration != null ? { delay, duration } : undefined;

  if (inGroup) {
    return (
      <div className={cn("will-change-transform", className)}>
        {children}
      </div>
    );
  }

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin }}
      variants={baseVariants}
      transition={transitionOverride}
      className={cn("will-change-[transform,opacity]", className)}
    >
      {children}
    </Component>
  );
}

export interface RevealGroupProps {
  /** Stagger cadence. Default 'normal'. */
  stagger?: RevealStagger;
  /** Pass-through to inner Reveal's viewport. */
  amount?: number;
  margin?: string;
  once?: boolean;
  /** Element type. Default 'div'. */
  as?: RevealAs;
  className?: string;
  children: ReactNode;
}

function RevealGroup({
  stagger = "normal",
  amount = 0.2,
  margin = "0px",
  once = true,
  as = "div",
  className,
  children,
}: RevealGroupProps) {
  const tier = useContext(RevealTierContext);
  const reducedMotion = useReducedMotion();

  // Mobile/low-end: CSS-only group with stagger delays
  if (tier !== "high" || reducedMotion) {
    return (
      <div className={cn("reveal-group", className)}>
        {children}
      </div>
    );
  }

  // Desktop: Framer Motion stagger container
  const containerVariants = stagger === "fast" ? staggerFast : staggerContainer;
  const Component = motion[as] as typeof motion.div;

  return (
    <RevealGroupContext.Provider value={true}>
      <Component
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount, margin }}
        variants={containerVariants}
        className={cn(className)}
      >
        {reducedMotion ? <>{children}</> : children}
      </Component>
    </RevealGroupContext.Provider>
  );
}

/** Provider that injects the device tier into all Reveal components */
export function RevealProvider({ children }: { children: ReactNode }) {
  const tier = useDeviceTier();
  return (
    <RevealTierContext.Provider value={tier}>
      {children}
    </RevealTierContext.Provider>
  );
}

export const Reveal = Object.assign(RevealRoot, {
  Group: RevealGroup,
  Item: RevealRoot,
});
RevealRoot.displayName = "Reveal";
RevealGroup.displayName = "Reveal.Group";
