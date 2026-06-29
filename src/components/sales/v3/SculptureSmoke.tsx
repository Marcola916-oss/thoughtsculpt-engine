import { memo } from "react";

export const SculptureSmoke = memo(function SculptureSmoke() {
  return (
    <div 
      aria-hidden
      className="absolute -inset-x-24 bottom-0 h-[450px] pointer-events-none z-[5]"
    >
      {/* Black fade to completely hide the sharp bottom edge of the sculpture */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-transparent z-10" />

      {/* Cloud/Smoke volumetric puffs using fast radial gradients (no filter: blur) */}
      <div className="absolute inset-0 z-20 mix-blend-screen opacity-75">
        <div 
          className="absolute bottom-[-10%] left-[-15%] w-[80%] h-[70%]"
          style={{ background: "radial-gradient(ellipse at center, rgba(180,180,200,0.4) 0%, transparent 70%)" }}
        />
        <div 
          className="absolute bottom-[-5%] right-[-15%] w-[90%] h-[80%]"
          style={{ background: "radial-gradient(ellipse at center, rgba(200,200,220,0.5) 0%, transparent 65%)" }}
        />
        <div 
          className="absolute bottom-[10%] left-[20%] w-[60%] h-[50%]"
          style={{ background: "radial-gradient(ellipse at center, rgba(160,160,180,0.3) 0%, transparent 70%)" }}
        />
        {/* Subtle accent glow embedded in the smoke */}
        <div 
          className="absolute bottom-0 left-[30%] w-[50%] h-[50%]"
          style={{ background: "radial-gradient(ellipse at center, color-mix(in oklab, var(--arch-primary) 30%, transparent) 0%, transparent 70%)" }}
        />
      </div>
    </div>
  );
});
