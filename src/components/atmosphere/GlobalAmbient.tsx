import { useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Atmosphere, type AtmosphereFog, type AtmosphereSymbols, type AtmosphereScan } from "./Atmosphere";
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
      symbols: "normal", // Ensure symbols are on even by default elsewhere
      scan: "crt",
      withAmbient: true
    };

    if (isLanding) {
      settings.fog = "dramatic";
      settings.symbols = "dense"; // Force dense symbols on landing
      settings.scan = "crt";
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
