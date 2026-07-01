import { ArrowRight } from "lucide-react";
import { ButtonPress } from "@/components/interaction/ButtonPress";

export function StickyOfferBar({
  show,
  price,
  cta,
  onCta,
}: {
  show: boolean;
  price?: string;
  cta: string;
  onCta: () => void;
}) {
  if (!show) return null;
  return (
    <div
      role="region"
      aria-label="Sticky checkout"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-black/92 px-4 py-3 backdrop-blur-md animate-fade-in"
      style={{ borderColor: "color-mix(in oklab, var(--arch-primary) 35%, transparent)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        {price ? (
          <div className="flex items-baseline gap-2">
            <span className="text-xs uppercase tracking-widest text-white/55">Total</span>
            <strong className="font-display text-xl font-extrabold tabular-nums text-white">
              {price}
            </strong>
          </div>
        ) : (
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">
            MindReset · Protocolo
          </span>
        )}
        <ButtonPress>
          <button
            type="button"
            onClick={onCta}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
            style={{ background: "#CC0000", boxShadow: "0 12px 30px -8px rgba(204,0,0,0.55)" }}
          >
            {cta} <ArrowRight size={16} />
          </button>
        </ButtonPress>
      </div>
    </div>
  );
}

export default StickyOfferBar;
