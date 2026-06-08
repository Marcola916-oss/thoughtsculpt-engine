/**
 * MindReset V3 — Centralized Animation Variants
 *
 * Single source of truth for all Framer Motion variants.
 * Import from here instead of defining inline variants.
 *
 * Usage:
 *   import { fadeInUp, staggerContainer } from '@/lib/animations';
 *   <motion.div variants={fadeInUp} initial="hidden" animate="visible" />
 */

import type { Variants, Transition } from "framer-motion";

// ─── Ease presets ─────────────────────────────────────────────
const ease = {
  smooth:  [0.22, 1, 0.36, 1]  as [number, number, number, number],
  spring:  [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  inOut:   [0.4, 0, 0.2, 1]    as [number, number, number, number],
} as const;

// ─── Fade variants ────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: ease.smooth } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

export const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.smooth } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

export const fadeInDown: Variants = {
  hidden:  { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0,   transition: { duration: 0.4, ease: ease.smooth } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.2 } },
};

// ─── Scale variants ───────────────────────────────────────────

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1,    transition: { duration: 0.35, ease: ease.spring } },
  exit:    { opacity: 0, scale: 0.94, transition: { duration: 0.2 } },
};

export const scaleInSpring: Variants = {
  hidden:  { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 22 } },
  exit:    { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
};

// ─── Slide variants ───────────────────────────────────────────

export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0,   transition: { duration: 0.4, ease: ease.smooth } },
  exit:    { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0,   transition: { duration: 0.4, ease: ease.smooth } },
  exit:    { opacity: 0, x: 16,  transition: { duration: 0.2 } },
};

// ─── Stagger containers ───────────────────────────────────────

export const staggerContainer: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const staggerFast: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0,   transition: { duration: 0.4, ease: ease.smooth } },
};

// ─── Page transitions ─────────────────────────────────────────

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: ease.smooth } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

export const quizScreenTransition: Variants = {
  hidden:  { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: ease.smooth } },
  exit:    { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

// ─── Drawer / sheet variants ──────────────────────────────────

export const drawerSlide: Variants = {
  hidden:  { x: "-100%", opacity: 0 },
  visible: { x: 0,       opacity: 1, transition: { duration: 0.35, ease: ease.smooth } },
  exit:    { x: "-100%", opacity: 0, transition: { duration: 0.25 } },
};

export const bottomSheetSlide: Variants = {
  hidden:  { y: "100%", opacity: 0 },
  visible: { y: 0,      opacity: 1, transition: { duration: 0.4, ease: ease.smooth } },
  exit:    { y: "100%", opacity: 0, transition: { duration: 0.3 } },
};

export const modalScale: Variants = {
  hidden:  { scale: 0.94, opacity: 0, y: 16 },
  visible: { scale: 1,    opacity: 1, y: 0,  transition: { duration: 0.35, ease: ease.spring } },
  exit:    { scale: 0.94, opacity: 0, y: 16, transition: { duration: 0.2 } },
};

// ─── Gamification variants ────────────────────────────────────

export const achievementPop: Variants = {
  hidden:  { scale: 0,    opacity: 0, rotate: -10 },
  visible: {
    scale: 1, opacity: 1, rotate: 0,
    transition: { type: "spring", stiffness: 500, damping: 25 },
  },
};

export const streakBounce: Variants = {
  idle:    { scale: 1 },
  animate: {
    scale: [1, 1.3, 0.9, 1.05, 1],
    transition: { duration: 0.5, times: [0, 0.3, 0.6, 0.8, 1] },
  },
};

export const numberRollUp: Variants = {
  hidden:  { y: "100%", opacity: 0 },
  visible: {
    y: 0, opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

// ─── Continuous animations (use with `animate` prop directly) ─

/** Glow pulse on elements with box-shadow */
export const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(204,0,0,0.2)",
      "0 0 40px rgba(204,0,0,0.4)",
      "0 0 20px rgba(204,0,0,0.2)",
    ],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

/** Horizontal shimmer sweep for loading states */
export const shimmerSweep = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: { duration: 2.5, repeat: Infinity, ease: "linear" },
  },
};

/** Float up-down for hero elements */
export const floatUpDown = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

/** Orbit particle — combine with individual delay offsets */
export const orbitParticle = (duration = 4): Transition => ({
  duration,
  repeat: Infinity,
  ease: "linear",
});

// ─── Typewriter helper ────────────────────────────────────────

/**
 * Returns per-character Framer Motion animate props for typewriter effect.
 * @param index - character index in the string
 * @param charDelay - ms per character (default 50ms)
 */
export function typewriterChar(index: number, charDelay = 0.05) {
  return {
    hidden:  { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: index * charDelay, duration: 0.01 },
    },
  };
}

// ─── Overlay / backdrop ───────────────────────────────────────

export const backdropFade: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};
