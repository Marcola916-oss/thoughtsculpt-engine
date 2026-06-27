import { SceneFrame } from "./SceneFrame";
import { Brain } from "lucide-react";

interface HeroSceneProps {
  eyebrow: string;
  title: string;
  promise: string;
  cta: string;
  timer: string;
  onCta: () => void;
  proofs: { value: string; label: string }[];
}

export function HeroScene({
  eyebrow,
  title,
  promise,
  cta,
  timer,
  onCta,
  proofs,
}: HeroSceneProps) {
  return (
    <SceneFrame sceneId="hero" className="pt-12 md:pt-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Pulsing Badge Eyebrow */}
        <div className="mb-8 flex justify-center">
          <span className="badge-pulse inline-flex items-center gap-2 rounded-full border border-arch-primary/30 bg-arch-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-arch-primary shadow-[0_0_20px_-5px_var(--arch-glow)]">
            <Brain className="h-3 w-3 animate-pulse" />
            {eyebrow || "DIAGNÓSTICO REVELADO"}
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

          {/* Proofs Row */}
          <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-4">
            {proofs.map((p, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-black text-white">{p.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{p.label}</div>
              </div>
            ))}
          </div>

          {timer && (
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/40">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-arch-primary" />
              {timer}
            </div>
          )}
        </div>
      </div>
    </SceneFrame>
  );
}
