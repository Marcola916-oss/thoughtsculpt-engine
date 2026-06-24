import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { BumpRow } from "./BumpRow";
import { parseMoney, formatMoneyLike } from "@/lib/sales/sigils";
import type { PriceTriplet } from "@/lib/funnel/pricing-stub";

/**
 * Offer Monolith — single decision surface. Main product fixed,
 * bump1/bump2 inline toggles, dynamic total, ONE red CTA.
 * This is the only place where brand red #CC0000 appears in the page body.
 */
export function OfferMonolith({
  eyebrow,
  productTitle,
  productSubtitle,
  price,
  bumps,
  onToggle,
  cta,
  trust,
  onCta,
  guaranteeLabel,
  speedLabel,
}: {
  eyebrow: string;
  productTitle: string;
  productSubtitle: string;
  price: PriceTriplet;
  bumps: {
    bump1: { active: boolean; title: string; description: string; badge?: string };
    bump2: { active: boolean; title: string; description: string; badge?: string };
  };
  onToggle: (which: "bump1" | "bump2") => void;
  cta: string;
  trust: string;
  onCta: () => void;
  guaranteeLabel?: string;
  speedLabel?: string;
}) {
  // Compute dynamic total in the same currency formatting as `main`.
  const main = parseMoney(price.main);
  const b1 = bumps.bump1.active ? parseMoney(price.bump1) : 0;
  const b2 = bumps.bump2.active ? parseMoney(price.bump2) : 0;
  const totalNumeric = main + b1 + b2;
  const total = formatMoneyLike(price.main, totalNumeric);

  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-6 sm:p-9 bg-black/50 backdrop-blur-2xl transition-all"
      style={{
        border: "1px solid color-mix(in oklab, var(--arch-primary) 35%, transparent)",
        boxShadow:
          "0 50px 120px -40px color-mix(in oklab, var(--arch-primary) 55%, transparent), inset 0 1px 0 color-mix(in oklab, var(--arch-primary) 25%, transparent)",
      }}
    >
      {/* eyebrow */}
      <p
        className="text-[11px] font-bold uppercase tracking-[0.4em]"
        style={{ color: "var(--arch-primary)" }}
      >
        {eyebrow}
      </p>

      {/* main product line */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            {productTitle}
          </h3>
          <p className="mt-1 text-sm text-white/65">{productSubtitle}</p>
        </div>
        <div className="shrink-0 text-end">
          <p className="font-display text-3xl font-extrabold tabular-nums text-white sm:text-4xl">
            {price.main}
          </p>
        </div>
      </div>

      <div className="my-6 h-px" style={{ background: "color-mix(in oklab, var(--arch-primary) 20%, transparent)" }} />

      {/* bumps */}
      <div className="space-y-3">
        <BumpRow
          active={bumps.bump1.active}
          onToggle={() => onToggle("bump1")}
          title={bumps.bump1.title}
          description={bumps.bump1.description}
          price={price.bump1}
          badge={bumps.bump1.badge}
        />
        <BumpRow
          active={bumps.bump2.active}
          onToggle={() => onToggle("bump2")}
          title={bumps.bump2.title}
          description={bumps.bump2.description}
          price={price.bump2}
          badge={bumps.bump2.badge}
        />
      </div>

      {/* total */}
      <div
        className="mt-7 flex items-baseline justify-between rounded-2xl px-5 py-4"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-white/55">
          Total
        </span>
        <span className="font-display text-3xl font-extrabold tabular-nums text-white sm:text-4xl">
          {total}
        </span>
      </div>

      {/* CTA — the only brand-red moment */}
      <ButtonPress>
        <button
          type="button"
          onClick={onCta}
          className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full px-8 py-5 text-lg font-bold uppercase tracking-wide text-white transition-all hover:brightness-110"
          style={{
            background: "#CC0000",
            boxShadow: "0 30px 80px -20px rgba(204, 0, 0, 0.65)",
          }}
        >
          {cta}
          <ArrowRight size={22} strokeWidth={2.5} />
        </button>
      </ButtonPress>

      {/* trust row */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/55">
        {guaranteeLabel && (
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} /> {guaranteeLabel}
          </span>
        )}
        {speedLabel && (
          <span className="inline-flex items-center gap-1.5">
            <Zap size={14} /> {speedLabel}
          </span>
        )}
        <span>{trust}</span>
      </div>
    </div>
  );
}

export default OfferMonolith;