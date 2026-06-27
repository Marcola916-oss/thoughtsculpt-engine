import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ExitIntentModalProps {
  open: boolean;
  title: string;
  body: string;
  cta: string;
  decline: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export function ExitIntentModal({
  open,
  title,
  body,
  cta,
  decline,
  onAccept,
  onDismiss,
}: ExitIntentModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative max-w-lg overflow-hidden rounded-[2.5rem] bg-card p-10 text-center shadow-2xl border border-white/10"
        >
          <button
            onClick={onDismiss}
            className="absolute right-6 top-6 text-foreground/40 hover:text-foreground"
          >
            <X size={24} />
          </button>
          <h2 className="mb-4 font-display text-3xl font-black uppercase italic leading-tight">
            {title}
          </h2>
          <p className="mb-8 text-foreground/70 leading-relaxed">{body}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onAccept}
              className="w-full rounded-full bg-arch-primary py-5 font-sans font-extrabold uppercase text-white shadow-xl transition hover:scale-[1.02] active:scale-95"
            >
              {cta}
            </button>
            <button
              onClick={onDismiss}
              className="w-full py-2 text-xs font-bold uppercase tracking-widest text-foreground/30 transition hover:text-foreground/50"
            >
              {decline}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
