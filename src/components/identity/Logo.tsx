import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-mindreset.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  link?: boolean;
}

const SIZE_MAP = {
  sm: "h-8 md:h-10",
  md: "h-12 md:h-16",
  lg: "h-20 md:h-28",
  xl: "h-32 md:h-44",
};

export function Logo({ className = "", size = "md", link = true }: LogoProps) {
  const content = (
    <div className={cn("relative flex items-center", className)}>
      <img
        src={logoImage}
        alt="MindReset"
        className={cn(
          SIZE_MAP[size], 
          "w-auto object-contain brightness-[1.1] contrast-[1.05] [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.2))_drop-shadow(0_0_20px_rgba(255,255,255,0.1))] mix-blend-screen"
        )}
        loading="eager"
      />
    </div>
  );

  if (link) {
    return (
      <Link to="/" className="group transition-transform active:scale-95 block">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {content}
        </motion.div>
      </Link>
    );
  }

  return content;
}
