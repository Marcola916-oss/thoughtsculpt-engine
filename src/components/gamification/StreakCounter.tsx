import { motion, AnimatePresence } from "framer-motion";
import { Flame, AlertTriangle, Award } from "lucide-react";

interface StreakCounterProps {
  streak: number;
  longestStreak?: number;
  compact?: boolean;
  className?: string;
}

const MILESTONES = [7, 14, 21, 30, 60, 90, 180, 365];

export function StreakCounter({
  streak,
  longestStreak = 0,
  compact = false,
  className = "",
}: StreakCounterProps) {
  // Check if current streak is a milestone
  const isMilestone = MILESTONES.includes(streak);
  const nextMilestone = MILESTONES.find((m) => m > streak) || 365;
  const isRiskState = streak === 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
        isRiskState
          ? "border-red-500/20 bg-red-950/10 text-red-500 animate-pulse"
          : isMilestone
            ? "border-gold/30 bg-gold-surface text-gold"
            : "border-border bg-card/40 text-foreground"
      } ${className}`}>
        <Flame className={`h-4 w-4 ${isRiskState ? "text-red-500" : isMilestone ? "text-gold animate-bounce" : "text-primary"}`} />
        <span className="text-sm font-black tabular-nums">{streak}</span>
      </div>
    );
  }

  return (
    <div className={`glass-card p-6 border border-border relative overflow-hidden flex flex-col items-center text-center ${className}`}>
      {/* Background radial gradient */}
      <div className={`absolute -inset-10 opacity-[0.03] pointer-events-none rounded-full blur-2xl ${
        isRiskState
          ? "bg-red-500"
          : isMilestone
            ? "bg-gold"
            : "bg-primary"
      }`} />

      {/* Main flame/indicator */}
      <motion.div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${
          isRiskState
            ? "border-red-500/20 bg-red-950/20 text-red-500"
            : isMilestone
              ? "border-gold/30 bg-gold-surface text-gold shadow-[0_0_20px_var(--color-gold-surface)]"
              : "border-primary/20 bg-primary/5 text-primary shadow-[0_0_15px_var(--accent-glow)]"
        }`}
        animate={
          isRiskState
            ? { scale: [1, 1.05, 1] }
            : isMilestone
              ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
              : { y: [0, -4, 0] }
        }
        transition={{
          duration: isRiskState ? 1.5 : isMilestone ? 2 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {isRiskState ? (
          <AlertTriangle className="h-8 w-8 stroke-[1.5]" />
        ) : isMilestone ? (
          <Award className="h-8 w-8 stroke-[1.5]" />
        ) : (
          <Flame className="h-8 w-8 stroke-[1.5] fill-current" />
        )}
      </motion.div>

      {/* Streak number with roll-up animation */}
      <div className="flex flex-col items-center">
        <div className="h-10 overflow-hidden relative flex items-baseline justify-center">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={streak}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`text-4xl font-black italic tracking-tighter tabular-nums ${
                isMilestone ? "gold-shimmer font-display" : "text-foreground"
              }`}
            >
              {streak}
            </motion.span>
          </AnimatePresence>
          <span className="text-sm font-black uppercase text-muted-foreground ml-1.5 tracking-wider">
            {streak === 1 ? "dia" : "dias"}
          </span>
        </div>

        {isRiskState ? (
          <p className="text-xs text-red-500 font-bold mt-2 animate-pulse uppercase tracking-wider">
            Consistência Zerada. Comece Hoje!
          </p>
        ) : isMilestone ? (
          <p className="text-xs text-gold font-bold mt-2 uppercase tracking-widest font-display">
            ✨ Recorde de {streak} Dias Reclasmado!
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Próxima meta em <span className="text-primary font-bold">{nextMilestone} dias</span>
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-border/40 my-4" />

      {/* Record info */}
      <div className="flex justify-between w-full text-xs text-muted-foreground font-semibold">
        <span>Maior Sequência:</span>
        <span className="text-foreground font-black tabular-nums">{Math.max(streak, longestStreak)} dias</span>
      </div>
    </div>
  );
}
