import { useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { Reveal } from "@/components/interaction/Reveal";

export function FAQ({ onCta }: { onCta?: () => void }) {
  const { t } = useI18n();
  const f = t.landing.faq;
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      aria-labelledby="faq-title"
      className="relative mx-auto w-full max-w-7xl px-4 py-24 md:px-8 md:py-32"
    >
      <Reveal variant="fade-up" className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
        <span
          aria-hidden
          className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-arch-primary"
        >
          <span className="h-px w-6 bg-arch-primary" />
          {f.tag}
        </span>
        <h2
          id="faq-title"
          className="font-display text-[24px] md:text-[24px] lg:text-[24px] font-black italic uppercase leading-[35px] tracking-[-0.05em] text-balance break-words whitespace-pre-line"
        >
          {f.title}
        </h2>
        <p className="mt-6 mx-auto max-w-md text-base font-medium leading-relaxed text-white/50 drop-shadow-md">{f.sub}</p>
        {onCta && (
          <ButtonPress
            onClick={onCta}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-arch-primary px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-[0_18px_40px_-12px_var(--arch-glow)] transition-transform hover:-translate-y-0.5"
          >
            {f.cta}
            <ArrowRight className="h-4 w-4" />
          </ButtonPress>
        )}
      </Reveal>

      <div className="mx-auto max-w-3xl">
        <Reveal variant="fade-up" delay={0.1} className="flex flex-col">
          {f.items.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className={`border-b border-white/[0.07] ${i === 0 ? "border-t" : ""} transition-colors hover:bg-white/[0.01]`}>
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center justify-between gap-4 py-6 text-left transition-colors group"
                >
                  <span className={`font-display text-lg font-black uppercase italic tracking-tight transition-colors ${isOpen ? "text-arch-primary" : "text-white"} group-hover:text-arch-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]`}>
                    {item.q}
                  </span>
                  <Plus
                    aria-hidden
                    className={`h-5 w-5 shrink-0 text-arch-primary transition-transform duration-300 ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                    strokeWidth={1.8}
                  />
                </button>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-hidden={!isOpen}
                  className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-400 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="min-h-0 text-[15px] font-medium leading-relaxed text-white/70 md:text-base drop-shadow-sm">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
