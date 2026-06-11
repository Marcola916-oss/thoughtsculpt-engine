import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import React from "react";
import { useI18n } from "../../lib/i18n/LanguageProvider";

interface QuizScreenWrapperProps {
  children: React.ReactNode;
  progress: number; // 0 to 100
  onBack?: () => void;
  stepKey: string | number;
  progressTitle?: string;
}

export function QuizScreenWrapper({
  children,
  progress,
  onBack,
  stepKey,
  progressTitle,
}: QuizScreenWrapperProps) {
  const { t } = useI18n();

  // Accelerate progress visual after 80% to create urgency (Zeigarnik effect / goal gradient)
  const visualProgress = progress >= 80 ? 95 : progress;

  return (
    <div className="relative min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center items-center py-6 w-full max-w-2xl mx-auto px-4 perspective-[1000px] overflow-hidden">
      {/* Decorative circuit line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      {/* Fixed top progress bar */}
      <div className="w-full mb-6 md:mb-12 relative z-20">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                className="p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition text-muted-foreground hover:text-foreground"
                aria-label={t.common.back}
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
            )}
            {progressTitle && (
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary drop-shadow-[0_0_8px_var(--accent-glow)]">
                {progressTitle}
              </span>
            )}
          </div>
          <span className="text-xs font-black text-muted-foreground/60 tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${visualProgress}%` }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_15px_var(--accent-glow)]"
          />
        </div>
      </div>

      {/* Content transition container */}
      <div className="w-full flex-1 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepKey}
            initial={{ opacity: 0, scale: 0.95, y: 10, rotateX: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -10, rotateX: -5 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.16, 1, 0.3, 1]
            }}
            className="w-full flex flex-col justify-center"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
