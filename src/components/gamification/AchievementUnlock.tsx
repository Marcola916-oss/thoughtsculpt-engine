import { motion } from "framer-motion";
import { useEffect } from "react";
import { Trophy, Gift, X } from "lucide-react";
import confetti from "canvas-confetti";

interface AchievementUnlockProps {
  achievementName: string;
  achievementDescription: string;
  rewardText?: string;
  onClose: () => void;
  onClaim?: () => void;
}

export function AchievementUnlock({
  achievementName,
  achievementDescription,
  rewardText,
  onClose,
  onClaim,
}: AchievementUnlockProps) {
  useEffect(() => {
    // Trigger cinematic confetti explosion on unlock
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ["#CC0000", "#D4AF37", "#ffffff"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ["#CC0000", "#D4AF37", "#ffffff"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Dark backdrop blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />

      {/* Cinematic Modal Container */}
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative bg-card border border-gold/30 rounded-[2.5rem] p-8 md:p-12 w-full max-w-lg text-center shadow-[0_30px_60px_rgba(212,175,55,0.15)] relative overflow-hidden"
      >
        {/* Gold radiant top glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold opacity-10 blur-[50px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Big Achievement Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.2, stiffness: 450, damping: 15 }}
          className="w-20 h-20 rounded-3xl bg-gold-surface border border-gold/30 flex items-center justify-center mx-auto mb-6 text-gold shadow-[0_0_20px_var(--color-gold-surface)]"
        >
          <Trophy className="h-10 w-10 stroke-[1.5]" />
        </motion.div>

        {/* Kicker tag */}
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-2 block">
          Conquista Desbloqueada!
        </span>

        {/* Achievement Details */}
        <h3 className="font-display text-2xl md:text-3xl font-black text-foreground mb-3 leading-tight tracking-tight">
          {achievementName}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 px-4">
          {achievementDescription}
        </p>

        {/* Reward section if present */}
        {rewardText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 rounded-2xl border border-success/20 bg-success/5 p-4 text-left mb-8 max-w-sm mx-auto"
          >
            <div className="h-9 w-9 rounded-xl bg-success/15 flex items-center justify-center shrink-0 text-success">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-success">
                Recompensa Recebida
              </p>
              <p className="text-xs text-foreground font-bold leading-tight mt-0.5">
                {rewardText}
              </p>
            </div>
          </motion.div>
        )}

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClaim || onClose}
          className="w-full rounded-2xl bg-gold py-4 text-base font-black italic tracking-tighter text-background shadow-[0_15px_30px_-10px_var(--color-gold-surface)] hover:brightness-110 transition-all uppercase"
        >
          {onClaim ? "Reivindicar Prêmio" : "Excelente!"}
        </motion.button>
      </motion.div>
    </div>
  );
}
