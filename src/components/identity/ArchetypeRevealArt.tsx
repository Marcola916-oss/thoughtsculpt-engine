import { memo } from "react";
import { cn } from "@/lib/utils";

export interface ArchetypeRevealArtProps {
  size?: number;
  className?: string;
  archetype?: string;
}

/**
 * ArchetypeRevealArt — High-end visual composition for the reveal moment.
 * Replaces the simple silhouette with a layered, glowing digital anatomy concept.
 */
const ArchetypeRevealArtImpl = ({ size = 320, className, archetype = "AO" }: ArchetypeRevealArtProps) => {
  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Background Bloom */}
      <div className="absolute inset-0 bg-arch-primary/20 blur-[60px] rounded-full animate-pulse" />
      
      <svg
        viewBox="0 0 400 400"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 block"
      >
        <defs>
          <filter id="hyper-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="metal-grad" x1="200" y1="50" x2="200" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.25" />
            <stop offset="50%" stopColor="white" stopOpacity="0.05" />
            <stop offset="100%" stopColor="white" stopOpacity="0.02" />
          </linearGradient>

          <radialGradient id="inner-energy" cx="200" cy="200" r="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--arch-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--arch-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Inner energy pulse */}
        <circle cx="200" cy="200" r="140" fill="url(#inner-energy)" className="animate-pulse" />

        {/* Main Structure - Artistic Bust-Brain Hybrid */}
        <path
          d="M200 40
             C 140 40, 100 80, 100 140
             C 100 180, 110 220, 130 260
             L 100 300
             C 80 320, 40 340, 40 360
             L 40 380
             L 360 380
             L 360 360
             C 360 340, 320 320, 300 300
             L 270 260
             C 290 220, 300 180, 300 140
             C 300 80, 260 40, 200 40 Z"
          fill="url(#metal-grad)"
          stroke="white"
          strokeOpacity="0.15"
          strokeWidth="1.5"
        />

        {/* Detailed Circuitry Overlay */}
        <g stroke="var(--arch-primary)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6">
          <path d="M160 100 L140 120 L140 160" />
          <path d="M240 100 L260 120 L260 160" />
          <path d="M200 280 L180 320 L150 330" />
          <path d="M200 280 L220 320 L250 330" />
          <circle cx="140" cy="160" r="3" fill="var(--arch-primary)" />
          <circle cx="260" cy="160" r="3" fill="var(--arch-primary)" />
        </g>

        {/* The Core Crack - High energy */}
        <path
          d="M140 70 L170 140 L190 200 L230 280 L280 360"
          stroke="var(--arch-primary)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#hyper-glow)"
          className="animate-pulse"
        />
        
        {/* Core highlight */}
        <path
          d="M140 70 L170 140 L190 200 L230 280 L280 360"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />

        {/* Data nodes floating around */}
        <g fill="var(--arch-primary)" className="animate-bounce" style={{ animationDuration: '3s' }}>
          <circle cx="80" cy="120" r="4" opacity="0.4" />
          <circle cx="320" cy="150" r="3" opacity="0.3" />
          <circle cx="100" cy="250" r="5" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
};

export const ArchetypeRevealArt = memo(ArchetypeRevealArtImpl);
