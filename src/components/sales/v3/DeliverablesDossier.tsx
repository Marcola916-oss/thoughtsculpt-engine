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
        "deliver-card group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#2A2A2A] bg-[#0D0D0D] p-6 sm:p-7 transition-all duration-500 ease-out",
        "hover:scale-[0.99] hover:border-[var(--arch-primary)] hover:shadow-[0_20px_40px_-15px_color-mix(in_oklab,var(--arch-primary)_20%,transparent),inset_0_0_20px_color-mix(in_oklab,var(--arch-primary)_8%,transparent)]",
        isHero ? "deliver-card--hero sm:p-9" : "",
        className,
      ].join(" ")}
      style={{
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.8)",
      }}
    >
      {/* spotlight / ambient light layer */}
      <div 
        aria-hidden 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "radial-gradient(600px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklab, var(--arch-primary) 8%, transparent), transparent 40%)"
        }}
      />

      {/* Hero scanlines effect */}
      {isHero && (
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem] opacity-30 mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9InRyYW5zcGFyZW50Ii8+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjAuNSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] opacity-20" />
          <div className="absolute top-0 w-full h-[10%] animate-[scan_6s_linear_infinite]" 
               style={{ background: "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--arch-primary) 20%, transparent), transparent)" }} />
        </div>
      )}

      {/* Top row: number + chip */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="font-display text-4xl sm:text-5xl font-black leading-none tracking-tight opacity-30 transition-all duration-500 group-hover:opacity-100"
          style={{
            background: "linear-gradient(135deg, #FFF 0%, rgba(255,255,255,0.1) 100%)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.1)",
          }}
        >
          {num}
        </span>
        <span
          aria-label={`Valor: ${chip}`}
          className="relative rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-500"
          style={{
            color: "var(--arch-primary)",
            background: "#1A1A1A",
            border: "1px solid #2A2A2A",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
          }}
        >
          <span className="absolute inset-0 rounded-full bg-[var(--arch-primary)] opacity-0 group-hover:opacity-[0.15] blur-sm transition-opacity duration-500" />
          {chip}
        </span>
      </div>

      {/* Optional visual (hero radar) */}
      {children && (
        <div className="relative z-10 mt-4 mb-3 flex flex-1 items-center justify-center min-h-[220px]">
          {/* Subtle pulse behind radar */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-48 h-48 rounded-full bg-[var(--arch-primary)] opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-700" />
          </div>
          {children}
        </div>
      )}

      {/* Icon + title + desc */}
      <div className={`relative z-10 ${children ? "mt-2" : "mt-6 flex flex-1 flex-col"}`}>
        <div className="mb-3 flex items-center gap-3">
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-500 group-hover:border-[var(--arch-primary)]"
            style={{
              borderColor: "#2A2A2A",
              background: "#1A1A1A",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
            }}
          >
            <Icon size={18} strokeWidth={2} style={{ color: "var(--arch-primary)" }} className="transition-transform duration-500 group-hover:scale-110" />
          </span>
          <h4
            className={`font-display font-extrabold uppercase leading-tight text-white transition-colors duration-500 group-hover:text-white ${
              isHero ? "text-xl sm:text-2xl" : "text-[15px] sm:text-base tracking-tight"
            }`}
          >
            {title}
          </h4>
        </div>
        <p
          className={`text-white/60 leading-relaxed group-hover:text-white/80 transition-colors duration-500 ${
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
            className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 rounded-[2rem] border border-[#2A2A2A] bg-[#0D0D0D] p-5 sm:p-6 relative overflow-hidden group transition-all duration-500 hover:border-[#3A3A3A] hover:shadow-[0_15px_30px_-15px_rgba(0,0,0,0.8)]"
          >
            {/* Ambient glow inside the seal bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--arch-primary)] to-transparent opacity-0 group-hover:opacity-[0.03] blur-2xl transition-opacity duration-700 pointer-events-none" />
            
            {seals.map((label, i) => {
              const Icon = SEAL_ICONS[i] ?? ShieldCheck;
              return (
                <div
                  key={i}
                  className="flex items-center justify-center gap-3 px-3 py-2 text-center"
                >
                  <Icon
                    size={20}
                    strokeWidth={2}
                    className="transition-transform duration-500 group-hover:scale-110"
                    style={{ color: "var(--arch-primary)", filter: "drop-shadow(0 0 8px color-mix(in oklab, var(--arch-primary) 50%, transparent))" }}
                    aria-hidden
                  />
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-white/80 group-hover:text-white transition-colors duration-500">
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