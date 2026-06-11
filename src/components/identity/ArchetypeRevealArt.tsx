import { memo } from "react";
import { cn } from "@/lib/utils";

export interface ArchetypeRevealArtProps {
  size?: number;
  className?: string;
  archetype?: string;
}

/**
 * ArchetypeRevealArt — Premium SVG art for the archetype reveal screen.
 * Features a minimalist bust silhouette with a glowing red diagonal crack 
 * and subtle circuit board traces.
 */
const ArchetypeRevealArtImpl = ({ size = 320, className, archetype }: ArchetypeRevealArtProps) => {
  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 240 240"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <defs>
          <filter id="reveal-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="bust-grad" x1="120" y1="20" x2="120" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="100%" stopColor="white" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Ambient background glow */}
        <circle cx="120" cy="120" r="80" fill="var(--primary)" fillOpacity="0.03" className="brain-glow-pulse" />

        {/* Bust Silhouette */}
        <path
          d="M120 20
             C 95 20, 80 40, 80 65
             C 80 85, 85 105, 90 125
             L 80 140
             C 75 150, 70 160, 30 175
             C 25 177, 20 182, 20 190
             L 20 220
             L 220 220
             L 220 190
             C 220 182, 215 177, 210 175
             C 170 160, 165 150, 160 140
             L 150 125
             C 155 105, 160 85, 160 65
             C 160 40, 145 20, 120 20 Z"
          fill="url(#bust-grad)"
          stroke="white"
          strokeOpacity="0.1"
          strokeWidth="1"
        />

        {/* Circuit traces (Subtle) */}
        <g stroke="var(--primary)" strokeOpacity="0.2" strokeWidth="0.8" strokeLinecap="round">
          <path d="M100 60 L90 70 L90 90" />
          <path d="M140 60 L150 70 L150 90" />
          <path d="M120 150 L110 165 L90 170" />
          <path d="M120 150 L130 165 L150 170" />
          <circle cx="90" cy="90" r="1.5" fill="var(--primary)" fillOpacity="0.3" />
          <circle cx="150" cy="90" r="1.5" fill="var(--primary)" fillOpacity="0.3" />
        </g>

        {/* The "Red Crack" - Focal point */}
        <path
          d="M90 40 L105 80 L115 110 L130 150 L150 190 L170 215"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#reveal-glow)"
          className="bust-crack-glow"
        />
        
        {/* Fine highlight on crack */}
        <path
          d="M90 40 L105 80 L115 110 L130 150 L150 190 L170 215"
          stroke="white"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
      </svg>
    </div>
  );
};

export const ArchetypeRevealArt = memo(ArchetypeRevealArtImpl);
