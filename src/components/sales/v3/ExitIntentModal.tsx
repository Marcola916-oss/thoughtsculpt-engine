import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function ExitIntentModal({ onAccept }: { onAccept: () => void }) {
  const [show, setShow] = useState(false);
  const { t } = useI18n();
  const { title, desc, cta } = t.salesV2.exit;

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !show) {
        setShow(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative max-w-lg overflow-hidden rounded-[2.5rem] bg-card p-10 text-center shadow-2xl border border-white/10"
        >
          <button
            onClick={() => setShow(false)}
            className="absolute right-6 top-6 text-foreground/40 hover:text-foreground"
          >
            <X size={24} />
          </button>
          <h2 className="mb-4 font-display text-3xl font-black uppercase italic leading-tight">
            {title}
          </h2>
          <p className="mb-8 text-foreground/70 leading-relaxed">{desc}</p>
          <button
            onClick={() => {
              onAccept();
              setShow(false);
            }}
            className="w-full rounded-full bg-arch-primary py-5 font-sans font-extrabold uppercase text-white shadow-xl transition hover:scale-[1.02]"
          >
            {cta}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
