import { memo } from "react";
import { cn } from "@/lib/utils";

export interface CelebrationBrainProps {
  size?: number;
  className?: string;
}

/**
 * CelebrationBrain — Specialized brain SVG for the success/thank-you page.
 * Uses a more "complete" and bright version of the circuit pattern.
 */
const CelebrationBrainImpl = ({ size = 200, className }: CelebrationBrainProps) => {
  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <defs>
          <filter id="celebration-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background circle of light */}
        <circle cx="100" cy="100" r="70" fill="var(--primary)" fillOpacity="0.05" />
        <circle cx="100" cy="100" r="50" fill="var(--primary)" fillOpacity="0.1" className="brain-glow-pulse" />

        {/* Brain nodes & connections */}
        <g stroke="var(--primary)" strokeWidth="1.5" filter="url(#celebration-glow)">
          {/* Main structure */}
          <path d="M100 40 C60 40 40 65 40 100 C40 135 60 160 100 160 C140 160 160 135 160 100 C160 65 140 40 100 40" strokeOpacity="0.4" />
          <path d="M100 40 V160" strokeOpacity="0.3" />
          
          {/* Circuit nodes */}
          <circle cx="100" cy="60" r="3" fill="var(--primary)" />
          <circle cx="100" cy="100" r="4" fill="var(--primary)" />
          <circle cx="100" cy="140" r="3" fill="var(--primary)" />
          
          <circle cx="70" cy="80" r="2.5" fill="var(--primary)" fillOpacity="0.8" />
          <circle cx="130" cy="80" r="2.5" fill="var(--primary)" fillOpacity="0.8" />
          
          <circle cx="65" cy="120" r="2.5" fill="var(--primary)" fillOpacity="0.8" />
          <circle cx="135" cy="120" r="2.5" fill="var(--primary)" fillOpacity="0.8" />
          
          {/* Internal connections */}
          <path d="M100 60 L70 80 L65 120 L100 140" strokeOpacity="0.6" strokeDasharray="2 2" />
          <path d="M100 60 L130 80 L135 120 L100 140" strokeOpacity="0.6" strokeDasharray="2 2" />
          <path d="M70 80 L100 100 L130 80" strokeOpacity="0.6" />
          <path d="M65 120 L100 100 L135 120" strokeOpacity="0.6" />
        </g>
      </svg>
    </div>
  );
};

export const CelebrationBrain = memo(CelebrationBrainImpl);
