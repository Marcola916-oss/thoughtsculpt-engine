import { useEffect, useRef, useState } from "react";

/**
 * Fase 4 — Hook de exit intent (1× por sessão, em memória — iframe-safe).
 *
 * Desktop: mouseleave no document quando o cursor sai pelo topo da viewport.
 * Mobile : popstate (back) + visibilitychange (troca de aba) como fallback.
 */
export function useExitIntent(opts: {
  enabled?: boolean;
  onTrigger?: () => void;
}): { triggered: boolean; reset: () => void; markDismissed: () => void } {
  const { enabled = true, onTrigger } = opts;
  const [triggered, setTriggered] = useState(false);
  const firedRef = useRef(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const fire = () => {
      if (firedRef.current || dismissedRef.current) return;
      firedRef.current = true;
      setTriggered(true);
      onTrigger?.();
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) fire();
    };

    const isMobile =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: none), (max-width: 768px)").matches;

    if (isMobile) {
      // Mobile: empurra um state para capturar o back
      try {
        window.history.pushState({ mrExitIntent: true }, "");
      } catch {
        /* ignore */
      }
      const onPop = () => fire();
      const onVis = () => {
        if (document.visibilityState === "hidden") fire();
      };
      window.addEventListener("popstate", onPop);
      document.addEventListener("visibilitychange", onVis);
      return () => {
        window.removeEventListener("popstate", onPop);
        document.removeEventListener("visibilitychange", onVis);
      };
    } else {
      document.documentElement.addEventListener("mouseleave", onMouseLeave);
      return () => {
        document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      };
    }
  }, [enabled, onTrigger]);

  return {
    triggered,
    reset: () => {
      firedRef.current = false;
      setTriggered(false);
    },
    markDismissed: () => {
      dismissedRef.current = true;
      setTriggered(false);
    },
  };
}