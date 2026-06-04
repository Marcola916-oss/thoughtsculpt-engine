import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface TaskCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function TaskCheckbox({
  checked,
  onChange,
  disabled = false,
  className = "",
}: TaskCheckboxProps) {
  const isMounted = useRef(false);

  useEffect(() => {
    if (checked && isMounted.current) {
      // Small localized confetti explosion at the cursor height (bottom center)
      confetti({
        particleCount: 16,
        angle: 90,
        spread: 45,
        origin: { y: 0.7 },
        colors: ["#CC0000", "#FFFFFF"],
        ticks: 60,
      });
    }
    isMounted.current = true;
  }, [checked]);

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      whileTap={!disabled ? { scale: 0.88 } : {}}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className={[
        "w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer outline-none transition-all duration-200 select-none shrink-0",
        checked
          ? "border-primary bg-primary text-primary-foreground shadow-[0_0_10px_var(--accent-glow)]"
          : "border-border bg-card/60 hover:border-primary/50",
        disabled ? "opacity-30 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3.5}
      >
        <motion.path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: checked ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
      </svg>
    </motion.button>
  );
}
