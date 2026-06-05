/**
 * Reveal — Declarative scroll-reveal wrapper.
 *
 * Wraps the verbose Framer Motion `whileInView` pattern in a clean API.
 * Reuses variants from `lib/animations.ts` (fadeIn, fadeInUp, slideInLeft,
 * etc.) — never redefines them.
 *
 * Compound API:
 *   <Reveal variant="fade-up">...</Reveal>              // single
 *   <Reveal.Group>                                       // stagger container
 *     <Reveal variant="fade-up">A</Reveal>               // auto-detected as item
 *     <Reveal variant="fade-up">B</Reveal>
 *   </Reveal.Group>
 *
 * When a `Reveal` is nested inside `Reveal.Group`, it inherits the
 * viewport trigger from the parent and uses staggerItem for its base.
 *
 * @example
 *   <Reveal variant="scale-spring" amount={0.4}>
 *     <h2>...</h2>
 *   </Reveal>
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

const VARIANT_MAP = {
  fade: fadeIn,
  "fade-up": fadeInUp,
  "fade-down": fadeInDown,
  "slide-left": slideInLeft,
  "slide-right": slideInRight,
  scale: scaleIn,
  "scale-spring": scaleInSpring,
} as const;

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
  const reducedMotion = useReducedMotion();

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
      <Component variants={baseVariants} className={className}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin }}
      variants={baseVariants}
      transition={transitionOverride}
      className={className}
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
  const reducedMotion = useReducedMotion();
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

export const Reveal = Object.assign(RevealRoot, {
  Group: RevealGroup,
  Item: RevealRoot,
});
RevealRoot.displayName = "Reveal";
RevealGroup.displayName = "Reveal.Group";
