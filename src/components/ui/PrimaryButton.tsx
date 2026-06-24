/**
 * PrimaryButton — MindReset V3 premium action button.
 *
 * Features:
 * - Shimmer highlight sweep on hover
 * - whileHover lift + red glow shadow
 * - Loading spinner with continuous rotation
 * - Size variants: sm | md | lg | xl
 * - Optional leading icon
 * - Focus ring for accessibility
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type ButtonSize = "sm" | "md" | "lg" | "xl";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  id?: string;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm gap-1.5",
  md: "px-6 py-3 text-[15px] gap-2",
  lg: "px-8 py-4 text-lg gap-2",
  xl: "px-10 py-5 text-xl gap-3",
};

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  size = "md",
  fullWidth = false,
  loading = false,
  icon,
  className = "",
  type = "button",
  id,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      id={id}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        "relative overflow-hidden rounded-2xl font-semibold uppercase tracking-[0.18em]",
        "bg-primary text-primary-foreground",
        "flex items-center justify-center",
        SIZE_CLASSES[size],
        fullWidth ? "w-full" : "",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "transition-all duration-300",
        className,
      ].join(" ")}
      whileHover={
        !isDisabled
          ? {
              y: -4,
              scale: 1.02,
              boxShadow: "0 20px 40px rgba(204,0,0,0.55), 0 0 20px rgba(204,0,0,0.3)",
            }
          : {}
      }
      whileTap={!isDisabled ? { scale: 0.96 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Shimmer sweep on hover */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          backgroundPosition: "-200% 0",
        }}
        whileHover={{
          backgroundPosition: ["−200% 0", "200% 0"],
          transition: { duration: 0.6, ease: "linear" },
        }}
      />

      {/* Loading spinner */}
      {loading ? (
        <motion.span
          className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <>
          {icon && <span className="relative z-10 flex-shrink-0">{icon}</span>}
          <span className="relative z-10">{children}</span>
        </>
      )}
    </motion.button>
  );
}
