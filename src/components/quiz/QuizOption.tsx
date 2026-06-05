/**
 * QuizOption — Premium animated answer option for the MindReset quiz.
 *
 * Features:
 * - Letter badge (A/B/C/D) with colour transition on select
 * - whileHover slide right + border flash
 * - Animated SVG checkmark (pathLength 0→1) on selection
 * - Red bottom-line reveal on selected state
 */

import { motion, AnimatePresence } from "framer-motion";

interface QuizOptionProps {
  label: string;
  letter: string;
  selected?: boolean;
  onClick: () => void;
}

export function QuizOption({ label, letter, selected = false, onClick }: QuizOptionProps) {
  return (
    <motion.button
      onClick={onClick}
      className={[
        "w-full text-left rounded-2xl border p-5 flex items-start gap-4",
        "relative overflow-hidden cursor-pointer outline-none",
        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        selected
          ? "border-primary bg-primary/5 shadow-[0_0_25px_var(--accent-glow)] scale-[1.01] z-10"
          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10",
      ].join(" ")}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={
        !selected
          ? { scale: 1.02, borderColor: "rgba(255,255,255,0.2)" }
          : {}
      }
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background glow on hover/selected */}
      <div 
        className={[
          "absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-primary/10 to-transparent",
          selected ? "opacity-100" : "group-hover:opacity-100"
        ].join(" ")} 
      />
      {/* Letter badge */}
      <span
        className={[
          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
          "text-xs font-bold mt-0.5 transition-all duration-200",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-muted-foreground",
        ].join(" ")}
      >
        {letter}
      </span>

      {/* Option text */}
      <span
        className={[
          "flex-1 text-[15px] leading-relaxed transition-colors duration-200",
          selected ? "text-foreground font-medium" : "text-muted-foreground",
        ].join(" ")}
      >
        {label}
      </span>

      {/* Animated checkmark */}
      <AnimatePresence>
        {selected && (
          <motion.span
            className="flex-shrink-0 mt-0.5"
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>

      {/* Red bottom bar reveal on selection */}
      <AnimatePresence>
        {selected && (
          <motion.span
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
