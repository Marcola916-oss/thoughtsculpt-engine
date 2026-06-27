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

  // Conversion guide: progress bar never starts at 0 — it begins at 12% to give
  // the user the feeling they're already moving (goal-gradient effect). After 80%
  // we accelerate to 95% to create urgency (Zeigarnik).
  const visualProgress =
    progress <= 0 ? 0 : progress >= 80 ? 95 : Math.max(12, progress);

  return (
    <div className="relative flex flex-col items-center pt-3 pb-8 md:min-h-[70vh] md:justify-center md:py-6 w-full max-w-2xl mx-auto px-5 md:px-4 perspective-[1000px]">
      {/* Decorative circuit line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent z-0" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent z-0" />

      {/* Fixed top progress bar */}
      <div className="w-full mb-10 md:mb-12 relative z-20">
        <div className="relative flex justify-between items-center mb-3">
          <div className="flex items-center">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="quiz-back-btn p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-muted-foreground hover:text-foreground"
                aria-label={t.common.back}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>
          {progressTitle && (
            <span className="absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary drop-shadow-[0_0_8px_var(--accent-glow)] whitespace-nowrap pointer-events-none">
              {progressTitle}
            </span>
          )}
          <span className="text-xs font-semibold text-muted-foreground/60 tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
          <div
            className="quiz-progress-bar h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_15px_var(--accent-glow)]"
            style={{ width: `${visualProgress}%` }}
          />
        </div>
      </div>

      {/* Content transition container */}
      <div className="w-full flex-1 flex flex-col justify-center relative z-10">
        <div key={stepKey} className="quiz-stage-enter w-full flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
