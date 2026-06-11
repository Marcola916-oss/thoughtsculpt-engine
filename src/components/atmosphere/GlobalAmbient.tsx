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
    const isLoader = pathname.includes("loader"); // Custom loaders might use this path pattern
    const isQuiz = pathname === "/" && !isLanding; // Actually quiz stages are inside index.tsx
    
    // Low tier: minimalist static background handled by Atmosphere/BackgroundAmbient
    if (tier === "low") {
      return { 
        fog: "off" as const, 
        symbols: "off" as const, 
        scan: "off" as const,
        withAmbient: true 
      };
    }

    // High/Medium tiers: dynamic effects
    if (isLanding) {
      return { 
        fog: "dramatic" as const, 
        symbols: "sparse" as const, 
        scan: "subtle" as const,
        withAmbient: true 
      };
    }

    // Default for dashboard and other internal pages
    return { 
      fog: "subtle" as const, 
      symbols: "off" as const, 
      scan: "off" as const,
      withAmbient: true 
    };
  }, [pathname, tier]);

  return (
    <Atmosphere 
      {...atmosphereProps} 
      pinned 
      className="fixed inset-0 z-[-1] pointer-events-none" 
    />
  );
}
