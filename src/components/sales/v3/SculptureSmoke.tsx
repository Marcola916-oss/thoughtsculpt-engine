import { memo } from "react";

export const SculptureSmoke = memo(function SculptureSmoke() {
  return (
    <div 
      aria-hidden
      className="absolute -inset-x-20 bottom-0 h-[400px] pointer-events-none z-10 overflow-hidden"
    >
      {/* Smoke puffs (white/gray with heavy blur and screen blend mode) */}
      {/* We use mix-blend-screen and opacities to simulate thick overlapping clouds */}
      <div className="absolute inset-0 z-10 mix-blend-screen opacity-60">
         <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-white/20 blur-[60px] rounded-full" />
         <div className="absolute bottom-[-5%] right-[-10%] w-[80%] h-[80%] bg-white/15 blur-[80px] rounded-full" />
         <div className="absolute bottom-[10%] left-[15%] w-[60%] h-[60%] bg-white/25 blur-[70px] rounded-full" />
         <div className="absolute bottom-[5%] right-[20%] w-[60%] h-[60%] bg-white/10 blur-[50px] rounded-full" />
         
         {/* Subtle red/accent tint in the smoke center to match brand */}
         <div className="absolute bottom-0 left-[30%] w-[40%] h-[40%] bg-arch-primary/10 blur-[80px] rounded-full" />
      </div>

      {/* Black fade to hide the hard edge of the sculpture and anchor it to the page */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-20" />
    </div>
  );
});
