import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import brainAsset from "@/assets/archetype-brain.webm.asset.json";

export type ArchetypeKey = "AO" | "SS" | "EA" | "HI";

interface Props {
  archetype: ArchetypeKey;
  /** Fixed size override (px). When omitted, scales fluidly via clamp(). */
  size?: number;
  className?: string;
}

/**
 * Fluid size: scales with viewport, capped per breakpoint via clamp().
 * mobile ≈ 280–360px, tablet ≈ 480px, desktop ≈ 620px, XL ≈ 760px.
 */
const FLUID_SIZE = "clamp(280px, min(70vw, 70vh), 760px)";

/**
 * Archetype palette (official — see mem/design/archetype-colors.md).
 * `primary` paints the halo; `glow` is the outer aura.
 */
const ARCHETYPE_PALETTE: Record<
  ArchetypeKey,
  { primary: string; glow: string; accent: string }
> = {
  AO: { primary: "#0F4C5C", glow: "#3B82F6", accent: "#7DD3FC" }, // azul petróleo
  SS: { primary: "#7C3AED", glow: "#C084FC", accent: "#F5D0FE" }, // roxo imperial
  EA: { primary: "#64748B", glow: "#94A3B8", accent: "#CBD5E1" }, // cinza ardósia
  HI: { primary: "#F97316", glow: "#FBBF24", accent: "#FED7AA" }, // laranja
};

/**
 * CSS `filter` per archetype, applied directly on the <video>.
 * The source video is white-on-black; `mix-blend-mode: screen` drops the
 * black, and `sepia + saturate + hue-rotate` tints the white brain into
 * the archetype hue. EA uses `grayscale` since slate is desaturated.
 */
const ARCHETYPE_FILTER: Record<ArchetypeKey, string> = {
  AO: "sepia(1) saturate(5) hue-rotate(154deg) brightness(1.05) contrast(1.05)",
  SS: "sepia(1) saturate(6) hue-rotate(234deg) brightness(1.1) contrast(1.05)",
  EA: "grayscale(1) brightness(1.05) contrast(1.05)",
  HI: "sepia(1) saturate(8) hue-rotate(-11deg) brightness(1.15) contrast(1.05)",
};

/**
 * Pre-rendered rotating brain (transparent via `mix-blend-mode: screen`),
 * tinted live with the archetype color via CSS filters. Zero JS/WebGL at
 * runtime — decoded by the device's hardware video pipeline, so it runs
 * smoothly even on low-end Android.
 *
 * - Slow horizontal rotation comes baked into the WebM (no RAF loop).
 * - Halo glow behind the video matches the archetype palette.
 * - Auto-pauses when offscreen or the tab is hidden, to save battery.
 */
export function ArchetypeVideoBrain({ archetype, size, className }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const palette = ARCHETYPE_PALETTE[archetype];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Auto-pause when offscreen or tab is hidden (battery + CPU savings).
  useEffect(() => {
    const video = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    let inView = true;
    let tabVisible = document.visibilityState === "visible";

    const sync = () => {
      if (reducedMotion) {
        video.pause();
        return;
      }
      if (inView && tabVisible) {
        const p = video.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } else {
        video.pause();
      }
    };

    const onVis = () => {
      tabVisible = document.visibilityState === "visible";
      sync();
    };
    document.addEventListener("visibilitychange", onVis);

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          sync();
        },
        { threshold: 0.05 },
      );
      io.observe(wrapper);
    }

    sync();

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, [reducedMotion]);

  const sizeStyle = size
    ? { width: size, height: size }
    : { width: FLUID_SIZE, height: FLUID_SIZE };

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
      style={sizeStyle}
      role="img"
      aria-label={`Cérebro do arquétipo ${archetype}`}
    >
      {/* Outer halo: glow color, soft */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[-25%] -z-10 rounded-full blur-[90px] opacity-70"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${palette.glow}66 0%, ${palette.primary}33 40%, transparent 70%)`,
        }}
      />
      {/* Inner halo: primary color, tighter and more saturated */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[5%] -z-10 rounded-full blur-[28px] opacity-85"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 30%, ${palette.primary}cc 46%, ${palette.primary}55 62%, transparent 78%)`,
        }}
      />

      <video
        ref={videoRef}
        src={brainAsset.url}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        className="absolute inset-0 h-full w-full object-contain"
        style={{
          mixBlendMode: "screen",
          filter: ARCHETYPE_FILTER[archetype],
          transition: "filter 600ms ease-out",
        }}
      />
    </div>
  );
}

export default ArchetypeVideoBrain;