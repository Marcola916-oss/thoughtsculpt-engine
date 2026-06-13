/**
 * AchievementUnlock — Premium modal to celebrate newly unlocked achievements.
 *
 * Features:
 * - achievementPop animation
 * - Confetti burst on mount
 * - Glassmorphism modal style
 * - Red accent glow
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { modalScale, achievementPop } from "@/lib/animations";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import confetti from "canvas-confetti";

interface Achievement {
  code: string;
  name: string;
  desc: string;
  icon: string;
}

interface AchievementUnlockProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementUnlock({ achievement, onClose }: AchievementUnlockProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsOpen(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#CC0000", "#FF4444", "#FFD700", "#FFFFFF"],
      });
    } else {
      setIsOpen(false);
    }
  }, [achievement]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-sm glass-modal overflow-hidden p-8 text-center"
          >
            {/* Glow background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />

            <motion.div
              variants={achievementPop}
              className="text-7xl mb-6 relative z-10"
            >
              {achievement.icon}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative z-10"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 block">
                Conquista Desbloqueada
              </span>
              <h2 className="font-display text-3xl font-bold mb-3">{achievement.name}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                {achievement.desc}
              </p>

              <PrimaryButton fullWidth onClick={onClose} size="lg">
                Continuar Jornada
              </PrimaryButton>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
