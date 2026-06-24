import { useEffect, useRef, useState } from "react";
import { Sparkles, Star, ShieldCheck, Globe2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/components/interaction/Reveal";

const ICONS = [Sparkles, Star, ShieldCheck, Globe2] as const;

/**
 * AnimatedValue — counts from 0 to the numeric portion of the label when scrolled into view.
 * Preserves any prefix/suffix surrounding the number (e.g. "+12.000", "4.9 / 5", "100%", "5").
 * Honors prefers-reduced-motion by snapping to the final value immediately.
 */
function AnimatedValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Parse: prefix + first numeric run + suffix. Numeric run keeps , or . as thousand/decimal sep.
    const match = value.match(/^(\D*?)([\d.,]+)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }
    const [, prefix, numStr, suffix] = match;
    const hasComma = numStr.includes(",");
    const hasDot = numStr.includes(".");
    // Heuristic: if value has both, the LAST one is the decimal sep. If only one and digits after ≤ 2, treat as decimal.
    let decimalSep: "." | "," | null = null;
    if (hasComma && hasDot) {
      decimalSep = numStr.lastIndexOf(",") > numStr.lastIndexOf(".") ? "," : ".";
    } else if (hasComma && numStr.split(",")[1]?.length <= 2 && numStr.split(",")[1]?.length >= 1) {
      decimalSep = ",";
    } else if (hasDot && numStr.split(".")[1]?.length <= 2 && numStr.split(".")[1]?.length >= 1) {
      decimalSep = ".";
    }
    const thousandSep = decimalSep === "." ? "," : ".";
    let normalized = numStr.split(thousandSep).join("");
    if (decimalSep === ",") normalized = normalized.replace(",", ".");
    const target = parseFloat(normalized);
    if (!Number.isFinite(target)) {
      setDisplay(value);
      return;
    }
    const decimals = decimalSep ? (numStr.split(decimalSep)[1]?.length ?? 0) : 0;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const format = (n: number) => {
      let s = n.toFixed(decimals);
      if (decimalSep === ",") s = s.replace(".", ",");
      // Reapply thousand separators for integer part
      const [intPart, decPart] = s.split(decimalSep ?? ".");
      const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
      return prefix + (decPart != null ? `${grouped}${decimalSep}${decPart}` : grouped) + suffix;
    };

    if (reduced) {
      setDisplay(format(target));
      return;
    }

    let raf = 0;
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (started) return;
        if (entries.some((e) => e.isIntersecting)) {
          started = true;
          const duration = 1200;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            setDisplay(format(target * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

export function ProofBar() {
  const { t } = useI18n();
  const items = [
    t.landing.proofBar.diagnostics,
    t.landing.proofBar.rating,
    t.landing.proofBar.noBank,
    t.landing.proofBar.languages,
  ];

  return (
    <aside
      aria-label={`MindReset — ${t.landing.proofBar.ariaLabel}`}
      className="relative w-full border-y border-white/[0.1] bg-black/40 md:backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:divide-x divide-white/[0.1] px-4 md:grid-cols-4 md:px-8">
        {items.map((item, i) => {
          const Icon = ICONS[i];
          return (
            <Reveal
              key={i}
              variant="fade-up"
              delay={i * 0.08}
              className="group flex items-center gap-4 px-4 py-7 md:px-8 transition-colors hover:bg-white/[0.02] text-left"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-arch-primary/20 bg-arch-primary/10 text-arch-primary shadow-[0_0_18px_-4px_var(--arch-glow)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-arch-primary group-hover:text-primary-foreground"
                style={{ marginLeft: "0px" }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 transition-transform duration-500 group-hover:translate-x-1">
                <div className="font-display font-extrabold leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-[clamp(1.375rem,4vw,1.6875rem)]">
                  <AnimatedValue value={item.value} />
                </div>
                <div className="mt-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 group-hover:text-arch-primary transition-colors drop-shadow-sm">
                  {item.label}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </aside>
  );
}
