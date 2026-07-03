/**
 * DeliverablesDossier — Premium bento layout for the "O que vais receber" block.
 *
 * Layout (desktop 12-col):
 *   • Hero card (Diagnóstico 4D) — col-span-7, row-span-2, with animated radar preview
 *   • Protocolo 30d — col-span-5
 *   • Matriz Decisão — col-span-5
 *   • Compass / Relatório / 5 Idiomas — col-span-4 each
 *
 * Mobile: single column stack, same numbering + chips preserved.
 *
 * Zero i18n changes — reuses the 6 deliverables already translated. Metadata
 * chips and seal labels are derived per language inline.
 */

import { useRef } from "react";
import {
  Radar,
  CalendarCheck,
  Filter,
  Compass,
  LineChart,
  Globe2,
  Infinity as InfinityIcon,
  Ban,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/interaction";
import { DeliverableRadarMini } from "./DeliverableRadarMini";
import type { AreaScores } from "@/lib/funnel/area-scores";

type Lang = "pt" | "en" | "pl" | "ro" | "ar";

type Deliverable = { title: string; description: string };

type Props = {
  deliverables: Deliverable[]; // expected length 6, order from translations
  note: string;
  lang: Lang;
  areaScores: AreaScores;
};

const ICONS: LucideIcon[] = [Radar, CalendarCheck, Filter, Compass, LineChart, Globe2];

const CHIPS: Record<Lang, [string, string, string, string, string, string]> = {
  pt: ["PERSONALIZADO", "30 DIAS", "60 SEGUNDOS", "DIÁRIO", "DIA 30", "5 IDIOMAS"],
  en: ["PERSONALIZED", "30 DAYS", "60 SECONDS", "DAILY", "DAY 30", "5 LANGUAGES"],
  pl: ["SPERSONALIZOWANE", "30 DNI", "60 SEKUND", "CODZIENNIE", "DZIEŃ 30", "5 JĘZYKÓW"],
  ro: ["PERSONALIZAT", "30 DE ZILE", "60 SECUNDE", "ZILNIC", "ZIUA 30", "5 LIMBI"],
  ar: ["مخصص لك", "٣٠ يومًا", "٦٠ ثانية", "يوميًا", "اليوم ٣٠", "٥ لغات"],
};

const AREA_LABELS: Record<Lang, { money: string; career: string; love: string; personal: string }> = {
  pt: { money: "DINHEIRO", career: "CARREIRA", love: "AMOR", personal: "PESSOAL" },
  en: { money: "MONEY", career: "CAREER", love: "LOVE", personal: "PERSONAL" },
  pl: { money: "PIENIĄDZE", career: "KARIERA", love: "MIŁOŚĆ", personal: "OSOBISTE" },
  ro: { money: "BANI", career: "CARIERĂ", love: "IUBIRE", personal: "PERSONAL" },
  ar: { money: "المال", career: "العمل", love: "الحب", personal: "شخصي" },
};

const RADAR_ARIA: Record<Lang, string> = {
  pt: "Prévia do teu radar 4D",
  en: "Preview of your 4D radar",
  pl: "Podgląd twojego radaru 4D",
  ro: "Previzualizarea radarului tău 4D",
  ar: "معاينة الرادار الرباعي الأبعاد الخاص بك",
};

const SEAL_ICONS = [InfinityIcon, Ban, ShieldCheck];

function useSpotlight() {
  const ref = useRef<HTMLDivElement | null>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };
  return { ref, onMove };
}

function DeliverCard({
  index,
  chip,
  title,
  description,
  Icon,
  children,
  className = "",
  isHero = false,
}: {
  index: number;
  chip: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  children?: React.ReactNode;
  className?: string;
  isHero?: boolean;
}) {
  const { ref, onMove } = useSpotlight();
  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={[
        "deliver-card group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-black/50 p-6 sm:p-7 backdrop-blur-xl transition-all duration-500",
        "hover:-translate-y-1 hover:border-arch-primary/45",
        isHero ? "deliver-card--hero sm:p-9" : "",
        className,
      ].join(" ")}
      style={{
        boxShadow:
          "0 30px 80px -40px color-mix(in oklab, var(--arch-primary) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* spotlight layer */}
      <div aria-hidden className="deliver-spotlight" />
      {isHero && <div aria-hidden className="deliver-hero-ring" />}

      {/* Top row: number + chip */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="font-display text-4xl sm:text-5xl font-black leading-none tracking-tight"
          style={{
            color: "transparent",
            WebkitTextStroke: "1.5px color-mix(in oklab, var(--arch-primary) 55%, transparent)",
          }}
        >
          {num}
        </span>
        <span
          aria-label={`Valor: ${chip}`}
          className="rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{
            borderColor: "color-mix(in oklab, var(--arch-primary) 40%, transparent)",
            color: "var(--arch-primary)",
            background: "color-mix(in oklab, var(--arch-primary) 10%, transparent)",
          }}
        >
          {chip}
        </span>
      </div>

      {/* Optional visual (hero radar) */}
      {children && (
        <div className="relative z-10 mt-4 mb-3 flex flex-1 items-center justify-center min-h-[220px]">
          {children}
        </div>
      )}

      {/* Icon + title + desc */}
      <div className={`relative z-10 ${children ? "mt-2" : "mt-6 flex flex-1 flex-col"}`}>
        <div className="mb-3 flex items-center gap-3">
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
            style={{
              borderColor: "color-mix(in oklab, var(--arch-primary) 35%, transparent)",
              background: "color-mix(in oklab, var(--arch-primary) 8%, transparent)",
            }}
          >
            <Icon size={18} strokeWidth={2} style={{ color: "var(--arch-primary)" }} />
          </span>
          <h4
            className={`font-display font-extrabold uppercase leading-tight text-white ${
              isHero ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
            }`}
          >
            {title}
          </h4>
        </div>
        <p
          className={`text-white/70 leading-relaxed ${
            isHero ? "text-[15px] sm:text-base" : "text-sm"
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export function DeliverablesDossier({ deliverables, note, lang, areaScores }: Props) {
  const chips = CHIPS[lang] ?? CHIPS.en;
  const areaLabels = AREA_LABELS[lang] ?? AREA_LABELS.en;
  const radarAria = RADAR_ARIA[lang] ?? RADAR_ARIA.en;

  const seals = (note || "")
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const [d0, d1, d2, d3, d4, d5] = deliverables;

  return (
    <div className="mx-auto w-full">
      {/* Desktop bento — 12 columns */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12 lg:auto-rows-[minmax(0,1fr)]">
        {/* HERO — col-span 7, row-span 2 */}
        <Reveal className="lg:col-span-7 lg:row-span-2" variant="fade-up">
          <DeliverCard
            index={0}
            chip={chips[0]}
            title={d0.title}
            description={d0.description}
            Icon={ICONS[0]}
            isHero
          >
            <div className="w-full max-w-[280px]">
              <DeliverableRadarMini
                scores={areaScores}
                labels={areaLabels}
                ariaLabel={radarAria}
              />
            </div>
          </DeliverCard>
        </Reveal>

        {/* Row 1 right — Protocolo */}
        <Reveal className="lg:col-span-5" variant="fade-up" delay={0.05}>
          <DeliverCard
            index={1}
            chip={chips[1]}
            title={d1.title}
            description={d1.description}
            Icon={ICONS[1]}
          />
        </Reveal>

        {/* Row 2 right — Matriz */}
        <Reveal className="lg:col-span-5" variant="fade-up" delay={0.1}>
          <DeliverCard
            index={2}
            chip={chips[2]}
            title={d2.title}
            description={d2.description}
            Icon={ICONS[2]}
          />
        </Reveal>

        {/* Row 3 — 3 satellite cards */}
        <Reveal className="lg:col-span-4" variant="fade-up" delay={0.15}>
          <DeliverCard
            index={3}
            chip={chips[3]}
            title={d3.title}
            description={d3.description}
            Icon={ICONS[3]}
          />
        </Reveal>
        <Reveal className="lg:col-span-4" variant="fade-up" delay={0.2}>
          <DeliverCard
            index={4}
            chip={chips[4]}
            title={d4.title}
            description={d4.description}
            Icon={ICONS[4]}
          />
        </Reveal>
        <Reveal className="lg:col-span-4" variant="fade-up" delay={0.25}>
          <DeliverCard
            index={5}
            chip={chips[5]}
            title={d5.title}
            description={d5.description}
            Icon={ICONS[5]}
          />
        </Reveal>
      </div>

      {/* Seal footer */}
      {seals.length > 0 && (
        <Reveal variant="fade-up" delay={0.1}>
          <div
            className="mt-8 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md sm:grid-cols-3 sm:gap-2 sm:p-5"
            style={{
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {seals.map((label, i) => {
              const Icon = SEAL_ICONS[i] ?? ShieldCheck;
              return (
                <div
                  key={i}
                  className="flex items-center justify-center gap-2.5 px-2 py-1 text-center"
                >
                  <Icon
                    size={16}
                    strokeWidth={2}
                    style={{ color: "var(--arch-primary)" }}
                    aria-hidden
                  />
                  <span className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-white/85">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </Reveal>
      )}
    </div>
  );
}

export default DeliverablesDossier;