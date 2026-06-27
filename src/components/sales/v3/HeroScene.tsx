import { useI18n } from "@/lib/i18n/LanguageProvider";
import { SceneFrame } from "./SceneFrame";
import { BrainIcon } from "@/components/icons/BrainIcon";

interface HeroSceneProps {
  name: string;
  archetype: string;
  title: string;
  promise: string;
  cta: string;
  timerLabel: string;
  timeLeft: number;
  onCta: () => void;
}

export function HeroScene({
  name,
  archetype,
  title,
  promise,
  cta,
  timerLabel,
  timeLeft,
  onCta,
}: HeroSceneProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <SceneFrame archetype={archetype} className="pt-12 md:pt-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Pulsing Badge Eyebrow */}
        <div className="mb-8 flex justify-center">
          <span className="badge-pulse inline-flex items-center gap-2 rounded-full border border-arch-primary/30 bg-arch-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-arch-primary shadow-[0_0_20px_-5px_var(--arch-glow)]">
            <BrainIcon className="h-3 w-3 animate-pulse" />
            DIAGNÓSTICO REVELADO
          </span>
        </div>

        <h1 
          className="font-sans text-[clamp(2rem,7vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-foreground [&::first-letter]:uppercase"
        >
          {title}
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-white/60 md:text-2xl">
          {promise}
        </p>

        <div className="mt-12 flex flex-col items-center gap-6">
          <button
            onClick={onCta}
            className="group relative h-20 w-full max-w-2xl overflow-hidden rounded-full bg-white text-black transition-all hover:scale-[1.03] active:scale-95 shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)]"
          >
            {/* Archetype color overlay on hover */}
            <div className="absolute inset-0 overflow-hidden rounded-full bg-arch-primary opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            
            <span className="relative z-10 flex items-center justify-center px-8 text-xl font-extrabold uppercase tracking-tight group-hover:text-white transition-colors">
              {cta}
            </span>

            {/* Shimmer effect */}
            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
          </button>

          {timeLeft > 0 && (
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/40">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-arch-primary" />
              {timerLabel}: <span className="font-mono text-arch-primary">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>
    </SceneFrame>
  );
}
