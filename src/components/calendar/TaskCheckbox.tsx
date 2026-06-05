import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

interface TaskCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  type: "reflective" | "action";
  disabled?: boolean;
  className?: string;
}

export function TaskCheckbox({
  checked,
  onChange,
  label,
  type,
  disabled = false,
  className = "",
}: TaskCheckboxProps) {
  const [justChecked, setJustChecked] = useState(false);

  const handleCheck = () => {
    if (!checked) {
      setJustChecked(true);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ["#CC0000", "#FF4444", "#FFD700", "#22C55E"],
        scalar: 0.8,
        gravity: 1.2,
      });
      setTimeout(() => setJustChecked(false), 600);
    }
    onChange(!checked);
  };

  return (
    <motion.label
      className={`flex cursor-pointer items-start gap-3 select-none group ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <div className="relative mt-0.5 shrink-0">
        <motion.div
          onClick={!disabled ? handleCheck : undefined}
          className={`w-6 h-6 rounded-[5px] border-2 flex items-center justify-center transition-colors duration-200 ${
            checked
              ? "bg-success border-success"
              : "border-border-strong bg-transparent group-hover:border-success"
          }`}
          animate={
            justChecked
              ? {
                  scale: [1, 1.4, 0.85, 1.1, 1],
                }
              : {}
          }
          transition={
            justChecked
              ? { duration: 0.5, times: [0, 0.3, 0.55, 0.75, 1] }
              : {}
          }
        >
          <AnimatePresence>
            {checked && (
              <motion.svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <div className="flex-1">
        <span
          className={`text-sm leading-relaxed flex items-center gap-1.5 transition-all duration-300 ${
            checked
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          <span className="text-base">{type === "reflective" ? "🧠" : "⚡"}</span>
          {label}
        </span>
      </div>
    </motion.label>
  );
}
