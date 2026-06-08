import { memo } from "react";
import { cn } from "@/lib/utils";

interface QuizOptionProps {
  label: string;
  letter: string;
  selected?: boolean;
  onClick: () => void;
}

/**
 * QuizOption — Pre-programmed optimized answer option.
 * 
 * Removed heavy Framer Motion whileHover/whileTap in favor of 
 * hardware-accelerated CSS transitions.
 */
function QuizOptionImpl({ label, letter, selected = false, onClick }: QuizOptionProps) {
  return (
    <button
      onClick={onClick}
      data-cursor="hover"
      className={cn(
        "w-full text-left rounded-2xl border p-5 flex items-start gap-4",
        "relative overflow-hidden cursor-pointer outline-none",
        "transition-all duration-300 ease-out",
        "active:scale-[0.98] will-change-transform",
        selected
          ? "border-primary bg-primary/5 shadow-[0_0_25px_var(--accent-glow)] scale-[1.01] z-10"
          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 hover:translate-x-1"
      )}
    >
      {/* Background glow overlay */}
      <div 
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-primary/10 to-transparent",
          selected && "opacity-100"
        )} 
      />

      {/* Letter badge */}
      <span
        className={cn(
          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
          "text-xs font-bold mt-0.5 transition-all duration-200",
          selected
            ? "bg-primary text-primary-foreground scale-110"
            : "bg-secondary text-muted-foreground"
        )}
      >
        {letter}
      </span>

      {/* Option text */}
      <span
        className={cn(
          "flex-1 text-[15px] leading-relaxed transition-colors duration-200",
          selected ? "text-foreground font-medium" : "text-muted-foreground"
        )}
      >
        {label}
      </span>

      {/* Checkmark icon (Static CSS transition) */}
      <div className={cn(
        "flex-shrink-0 mt-0.5 transition-all duration-300 transform",
        selected ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"
      )}>
        <svg
          className="w-5 h-5 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Red bottom indicator bar */}
      <span
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[2px] bg-primary transition-transform duration-300 origin-left",
          selected ? "scale-x-100" : "scale-x-0"
        )}
      />
    </button>
  );
}

export const QuizOption = memo(QuizOptionImpl);
