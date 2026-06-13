import React from "react";
import { motion } from "framer-motion";

interface HologramRingProps {
  size?: number;
  className?: string;
}

export function HologramRing({ size = 200, className = "" }: HologramRingProps) {
  const radius = size / 2;
  const strokeWidth = 2;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div 
      className={`relative pointer-events-none ${className}`} 
      style={{ width: size, height: size }}
    >
      {/* Outer spinning ring - Dash array for high-tech look */}
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 z-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius - strokeWidth * 2}
          fill="none"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth={strokeWidth}
          strokeDasharray="4 12 24 8 8 20"
          strokeLinecap="round"
          style={{
            filter: "drop-shadow(0px 0px 8px rgba(255,255,255,0.8))"
          }}
        />
        
        <circle
          cx={cx}
          cy={cy}
          r={radius - strokeWidth * 6}
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth={1}
          strokeDasharray="2 6"
        />
      </motion.svg>

      {/* Inner fast spinning counter-rotating ring */}
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 z-10"
        animate={{ rotate: -360 }}
        transition={{ duration: 12, ease: "linear", repeat: Infinity }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius - strokeWidth * 12}
          fill="none"
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth={1.5}
          strokeDasharray="60 40 10 20"
          strokeLinecap="round"
          style={{
            filter: "drop-shadow(0px 0px 4px rgba(255,255,255,0.5))"
          }}
        />
      </motion.svg>
    </div>
  );
}
