import { ArrowRight, X } from "lucide-react";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { MarbleBust } from "@/components/identity/MarbleBust";

export function ExitIntentModal({
  open,
  title,
  body,
  cta,
  decline,
  onAccept,
  onDismiss,
}: {
  open: boolean;
  title: string;
  body: string;
  cta: string;
  decline: string;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 animate-fade-in"
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border bg-black p-7 text-center"
        style={{
          borderColor: "color-mix(in oklab, var(--arch-primary) 45%, transparent)",
          boxShadow: "0 40px 100px -20px color-mix(in oklab, var(--arch-primary) 55%, transparent)",
        }}
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="absolute end-3 top-3 rounded-full p-1.5 text-white/55 hover:text-white"
        >
          <X size={18} />
        </button>
        <div className="mx-auto mb-4 h-20 w-20 opacity-80">
          <MarbleBust variant="mini" />
        </div>
        <h2 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/75">{body}</p>
        <div className="mt-6 space-y-3">
          <ButtonPress>
            <button
              type="button"
              onClick={onAccept}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white"
              style={{ background: "#CC0000", boxShadow: "0 20px 50px -12px rgba(204,0,0,0.6)" }}
            >
              {cta} <ArrowRight size={16} />
            </button>
          </ButtonPress>
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-white/45 underline-offset-4 hover:underline"
          >
            {decline}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExitIntentModal;
