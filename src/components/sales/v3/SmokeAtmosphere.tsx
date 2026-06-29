/**
 * SmokeAtmosphere — cinematic volumetric smoke for SalesPageV2.
 *
 * Two pieces:
 *  - <SculptureSmoke />     dense plume anchored at the base of the sticky
 *                           sculpture column, so the bust "emerges" from fog.
 *  - <AmbientSmokeFloor />  thin ground-fog bank fixed at the viewport
 *                           bottom; copy reads as rising out of the mist.
 *
 * Implementation notes:
 *  - Real photographed-style smoke PNGs (solid black bg) layered with
 *    `mix-blend-screen` so the black drops out and only smoke remains.
 *  - Multiple parallax layers at different scale/speed/direction for
 *    volumetric depth — never a single static image.
 *  - Subtle archetype-primary tint overlay keeps continuity with the page.
 *  - All animation pure CSS (transform/opacity only) → GPU-friendly,
 *    respects `prefers-reduced-motion` via global CSS guard in styles.css.
 */

import smokePlume from "@/assets/smoke-plume.png";
import smokeFloor from "@/assets/smoke-floor.png";

export function SculptureSmoke() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-[-30%] bottom-[-8%] h-[78%] overflow-visible"
      style={{
        // soft radial mask so the plume fades into the page, no hard edges
        maskImage:
          "radial-gradient(ellipse 70% 65% at 50% 78%, #000 35%, rgba(0,0,0,0.85) 55%, transparent 92%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 65% at 50% 78%, #000 35%, rgba(0,0,0,0.85) 55%, transparent 92%)",
      }}
    >
      {/* Back plume — slow, large, soft */}
      <div
        className="sales-smoke-plume sales-smoke-plume--back absolute inset-0"
        style={{
          backgroundImage: `url(${smokePlume})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "140% 110%",
          mixBlendMode: "screen",
          opacity: 0.55,
          filter: "blur(2px) brightness(1.15)",
        }}
      />
      {/* Front plume — faster drift, sharper, mirrored for parallax */}
      <div
        className="sales-smoke-plume sales-smoke-plume--front absolute inset-0"
        style={{
          backgroundImage: `url(${smokePlume})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "115% 95%",
          mixBlendMode: "screen",
          opacity: 0.78,
          transform: "scaleX(-1)",
          filter: "brightness(1.1) contrast(1.05)",
        }}
      />
      {/* Archetype tint — subtle warm/cold breath of the arch color */}
      <div
        className="sales-smoke-tint absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 85%, color-mix(in oklab, var(--arch-primary) 40%, transparent) 0%, transparent 70%)",
          mixBlendMode: "overlay",
          opacity: 0.55,
        }}
      />
    </div>
  );
}

export function AmbientSmokeFloor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 -z-[1] h-[34vh] overflow-hidden"
      style={{
        // top fade so the floor blends into the page, no skyline edge
        maskImage:
          "linear-gradient(to top, #000 0%, #000 35%, rgba(0,0,0,0.7) 65%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to top, #000 0%, #000 35%, rgba(0,0,0,0.7) 65%, transparent 100%)",
      }}
    >
      {/* Far layer — slow drift left→right, mostly behind */}
      <div
        className="sales-smoke-floor sales-smoke-floor--far absolute inset-y-0 -left-[40%] -right-[40%]"
        style={{
          backgroundImage: `url(${smokeFloor})`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "left bottom",
          backgroundSize: "auto 100%",
          mixBlendMode: "screen",
          opacity: 0.42,
          filter: "blur(3px) brightness(1.1)",
        }}
      />
      {/* Near layer — counter-drift, sharper, lower */}
      <div
        className="sales-smoke-floor sales-smoke-floor--near absolute inset-y-0 -left-[40%] -right-[40%]"
        style={{
          backgroundImage: `url(${smokeFloor})`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "left bottom",
          backgroundSize: "auto 85%",
          mixBlendMode: "screen",
          opacity: 0.55,
          filter: "brightness(1.08) contrast(1.04)",
        }}
      />
      {/* Archetype-tinted glow on the floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background:
            "radial-gradient(ellipse 65% 100% at 50% 100%, color-mix(in oklab, var(--arch-primary) 32%, transparent) 0%, transparent 75%)",
          mixBlendMode: "screen",
          opacity: 0.7,
        }}
      />
    </div>
  );
}