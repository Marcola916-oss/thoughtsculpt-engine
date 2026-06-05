import React from "react";
import { useMousePosition } from "../../hooks/use-mouse-position";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoCard({ children, className = "" }: BentoCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  useMousePosition(ref);

  return (
    <div ref={ref} className={`bento-card ${className}`}>
      {children}
    </div>
  );
}
