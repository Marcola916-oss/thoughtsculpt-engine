/**
 * BustEmptyState — Empty state with the MindReset symbol.
 *
 * Drop-in for dashboard empty states, /share, /success, 404.
 * Bust sits above the heading with currency symbols floating around it.
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { MarbleBust } from "./MarbleBust";
import { cn } from "@/lib/utils";

export interface BustEmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  bustSize?: number;
  intensity?: "subtle" | "normal" | "dramatic";
  className?: string;
}

export function BustEmptyState({
  title,
  description,
  action,
  bustSize = 120,
  intensity = "subtle",
  className,
}: BustEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12 max-w-md mx-auto",
        className,
      )}
    >
      <div className="mb-8">
        <MarbleBust size={bustSize} variant="empty" intensity={intensity} ariaLabel="" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-sm">{description}</p>
      )}
      {action && <div className="flex items-center gap-2">{action}</div>}
    </motion.div>
  );
}
