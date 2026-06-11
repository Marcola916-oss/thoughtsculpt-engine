import { useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Atmosphere } from "./Atmosphere";
import { useDeviceTier } from "@/hooks/use-device-tier";

/**
 * GlobalAmbient — Background orchestrator for the entire application.
 * Tier-aware and route-aware to adjust intensity without blocking the UI.
 */
export function GlobalAmbient() {
  const tier = useDeviceTier();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Determine atmosphere settings based on route
  const atmosphereProps = useMemo(() => {
    const isLanding = pathname === "/";
    
    const settings: {
      fog: AtmosphereFog;
      symbols: AtmosphereSymbols;
      scan: AtmosphereScan;
      withAmbient: boolean;
    } = {
      fog: "normal",
      symbols: "off",
      scan: "subtle",
      withAmbient: true
    };

    if (isLanding) {
      settings.fog = "dramatic";
      settings.symbols = "sparse";
    }

    return settings;
  }, [pathname, tier]);

  return (
    <Atmosphere 
      {...atmosphereProps} 
      pinned 
      className="fixed inset-0 z-[-1] pointer-events-none" 
    />
  );
}
