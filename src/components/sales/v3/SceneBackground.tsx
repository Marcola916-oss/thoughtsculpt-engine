import { type ReactNode } from "react";

/**
 * Sales v3 — radial archetypal gradient background for a single scene.
 * Consumes `--arch-primary` set on a `data-arch` ancestor.
 */
export function SceneBackground({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: "default" | "deep" | "soft";
  className?: string;
}) {
  const intensity = variant === "deep" ? 0.18 : variant === "soft" ? 0.06 : 0.1;
  return (
    <div
      className={`relative sales-vignette ${className}`}
      style={{
        background: `radial-gradient(ellipse at 50% 40%, color-mix(in oklab, var(--arch-primary) ${intensity * 100}%, transparent) 0%, transparent 70%)`,
      }}
    >
      {children}
    </div>
  );
}

export default SceneBackground;
