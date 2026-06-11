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
    <div className={cn("relative flex items-center bg-transparent", className)}>
      <div className={cn(SIZE_MAP[size], "relative group overflow-hidden rounded-lg")}>
        <img
          src={logoImage}
          alt="MindReset"
          className="w-full h-full object-cover scale-[1.5] brightness-[1.1] contrast-[1.1]"
          style={{ 
            clipPath: 'inset(15% 15% 15% 15%)',
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))'
          }}
          loading="eager"
        />
      </div>
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
