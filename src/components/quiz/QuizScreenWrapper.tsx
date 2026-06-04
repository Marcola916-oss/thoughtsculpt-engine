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
    <div className="relative min-h-[70vh] flex flex-col justify-center items-center py-6 w-full max-w-2xl mx-auto px-4">
      {/* Fixed top progress bar inside the wrapper container */}
      <div className="w-full mb-8 z-20">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1 rounded-lg hover:bg-white/5 transition text-muted-foreground hover:text-foreground mr-1"
                aria-label={t.common.back}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {progressTitle && (
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                {progressTitle}
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-secondary/40 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${visualProgress}%` }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="h-full bg-primary shadow-[0_0_15px_var(--accent-glow)]"
          />
        </div>
      </div>

      {/* Grid Pattern and Ambient Glow */}
      <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary opacity-[0.05] blur-[100px] rounded-full pointer-events-none" />

      {/* Slide transition container using AnimatePresence */}
      <div className="w-full flex-1 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepKey}
            initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex flex-col justify-center"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
