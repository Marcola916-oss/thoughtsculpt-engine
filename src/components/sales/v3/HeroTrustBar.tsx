import { Lock, Star } from "lucide-react";
import { AnimatedCounter } from "@/components/sales/AnimatedCounter";

export function HeroTrustBar({
  countLabel,
  privacyLabel,
}: {
  countLabel: string;
  privacyLabel: string;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] font-medium text-white/85 sm:text-[13.5px]">
      <span className="flex items-center gap-1.5" aria-label="4.9 out of 5 stars">
        <span className="flex" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              strokeWidth={0}
              fill="var(--arch-primary)"
              style={{ color: "var(--arch-primary)" }}
            />
          ))}
        </span>
        <span className="font-semibold text-white/95 tabular-nums">4.9</span>
      </span>
      <span aria-hidden className="text-white/25">·</span>
      <span className="flex items-center gap-1 tabular-nums">
        <span className="text-white/95 font-semibold">
          +<AnimatedCounter to={12847} duration={1400} />
        </span>
        <span className="text-white/70">{countLabel}</span>
      </span>
      <span aria-hidden className="text-white/25">·</span>
      <span className="flex items-center gap-1.5 text-white/80">
        <Lock aria-hidden size={13} style={{ color: "var(--arch-primary)" }} />
        {privacyLabel}
      </span>
    </div>
  );
}

export default HeroTrustBar;