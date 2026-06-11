import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  link?: boolean;
}

const SIZE_MAP = {
  sm: "h-7 md:h-9",
  md: "h-10 md:h-12",
  lg: "h-14 md:h-20",
  xl: "h-24 md:h-32",
};

export function Logo({ className = "", size = "md", link = true }: LogoProps) {
  const content = (
    <div className={cn("relative flex items-center", className)}>
      <img
        src="/logo-mindreset.png"
        alt="MindReset"
        className={cn(
          SIZE_MAP[size], 
          "w-auto object-contain brightness-[1.25] drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] contrast-[1.1]"
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
