import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type RefObject,
} from "react";
import { useScroll, useSpring, useMotionValueEvent } from "framer-motion";
import { useDeviceTier, type DeviceTier } from "@/hooks/use-device-tier";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export type ActId = "void" | "awakening" | "map" | "protocol" | "proof" | "decision";

export interface Act {
  id: ActId;
  start: number; // 0-1
  end: number; // 0-1
  roman: string;
}

export const ACTS: Act[] = [
  { id: "void", start: 0.0, end: 0.15, roman: "I" },
  { id: "awakening", start: 0.15, end: 0.3, roman: "II" },
  { id: "map", start: 0.3, end: 0.5, roman: "III" },
  { id: "protocol", start: 0.5, end: 0.67, roman: "IV" },
  { id: "proof", start: 0.67, end: 0.83, roman: "V" },
  { id: "decision", start: 0.83, end: 1.0, roman: "VI" },
];

interface AwakeningState {
  scrollProgress: number; // 0-1 (smoothed)
  currentAct: ActId;
  currentActIndex: number;
  actProgress: number; // 0-1 within current act
  tier: DeviceTier;
  reduced: boolean;
}

const Ctx = createContext<AwakeningState>({
  scrollProgress: 0,
  currentAct: "void",
  currentActIndex: 0,
  actProgress: 0,
  tier: "high",
  reduced: false,
});

export function useAwakening(): AwakeningState {
  return useContext(Ctx);
}

interface ProviderProps {
  rootRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}

export function AwakeningProvider({ rootRef, children }: ProviderProps) {
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const [state, setState] = useState<AwakeningState>({
    scrollProgress: 0,
    currentAct: "void",
    currentActIndex: 0,
    actProgress: 0,
    tier,
    reduced,
  });

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 22,
    mass: 0.6,
  });

  useMotionValueEvent(smooth, "change", (v) => {
    const progress = Math.min(Math.max(v, 0), 1);
    let actIdx = 0;
    for (let i = ACTS.length - 1; i >= 0; i--) {
      if (progress >= ACTS[i].start) {
        actIdx = i;
        break;
      }
    }
    const act = ACTS[actIdx];
    const actProgress = Math.min(Math.max((progress - act.start) / (act.end - act.start), 0), 1);
    setState({
      scrollProgress: progress,
      currentAct: act.id,
      currentActIndex: actIdx,
      actProgress,
      tier,
      reduced,
    });
  });

  // Update tier/reduced if they change
  useEffect(() => {
    setState((prev) => ({ ...prev, tier, reduced }));
  }, [tier, reduced]);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}
