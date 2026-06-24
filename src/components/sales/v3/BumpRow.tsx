import { Check, Plus } from "lucide-react";

/**
 * Premium bump toggle — pill row with state. No native checkbox.
 * Click toggles. Visual states:
 *   off → border arch/30, plus icon
 *   on  → border arch full + glow + check icon + filled bg
 */
export function BumpRow({
  active,
  onToggle,
  title,
  description,
  price,
  badge,
}: {
  active: boolean;
  onToggle: () => void;
  title: string;
  description: string;
  price: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-start transition-all duration-300 ${active ? "sales-bump-active" : ""}`}
      style={{
        borderColor: active
          ? "var(--arch-primary)"
          : "color-mix(in oklab, var(--arch-primary) 22%, transparent)",
        background: active
          ? "color-mix(in oklab, var(--arch-primary) 14%, rgba(0,0,0,0.4))"
          : "color-mix(in oklab, var(--arch-primary) 4%, rgba(0,0,0,0.3))",
      }}
    >
      <span
        aria-hidden
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors"
        style={{
          borderColor: active ? "transparent" : "color-mix(in oklab, var(--arch-primary) 50%, transparent)",
          background: active ? "var(--arch-primary)" : "transparent",
          color: active ? "white" : "var(--arch-primary)",
        }}
      >
        {active ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={2.5} />}
      </span>
      <span className="flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-semibold text-foreground">{title}</span>
          <span
            className="font-bold tabular-nums"
            style={{ color: "var(--arch-primary)" }}
          >
            +{price}
          </span>
        </span>
        <span className="mt-1 block text-sm text-foreground/70">{description}</span>
        {badge && (
          <span
            className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: "color-mix(in oklab, var(--arch-primary) 22%, transparent)",
              color: "var(--arch-primary)",
            }}
          >
            {badge}
          </span>
        )}
      </span>
    </button>
  );
}

export default BumpRow;