import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-official-transparent.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  link?: boolean;
}

const SIZE_MAP = {
  sm: "h-20 md:h-24",
  md: "h-32 md:h-40",
  lg: "h-52 md:h-64",
  xl: "h-72 md:h-96",
};

export function Logo({ className = "", size = "md", link = true }: LogoProps) {
  const content = (
    <div className={cn("relative flex items-center bg-transparent", className)}>
      <div className={cn(SIZE_MAP[size], "relative flex items-center justify-center")}>
        <img
          src={logoImage}
          alt="MindReset"
          className="max-w-full max-h-full object-contain relative z-10"
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
