import { useI18n } from "@/lib/i18n/LanguageProvider";

interface StickyOfferBarProps {
  show: boolean;
  cta: string;
  onCta: () => void;
  price?: string; // Optional: can show price anchoring here too
}

export function StickyOfferBar({ show, cta, onCta, price }: StickyOfferBarProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-black/80 p-4 transition-transform duration-500 backdrop-blur-md ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div className="hidden items-center gap-3 sm:flex">
          <div className="h-2 w-2 animate-pulse rounded-full bg-arch-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            OFERTA EXCLUSIVA
          </span>
        </div>

        <button
          onClick={onCta}
          className="flex flex-1 items-center justify-center gap-3 rounded-full bg-arch-primary py-3 text-sm font-extrabold uppercase tracking-widest text-white transition-transform hover:scale-[1.02] active:scale-95 sm:flex-none sm:px-10"
        >
          <span className="flex items-center gap-2">
            {cta}
          </span>
        </button>
      </div>
    </div>
  );
}
