/**
 * LandingCTAButton — botão primário unificado da landing page.
 *
 * Baseado no estilo do FinalCTA (pill branco com hover vermelho + shimmer).
 * Fonte 800 (extrabold). Dimensões responsivas seguras (mobile → desktop)
 * para nunca cortar o texto, mesmo em strings longas como
 * "COMEÇAR DIAGNÓSTICO GRATUITO".
 */

import { forwardRef, type ReactNode } from "react";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { cn } from "@/lib/utils";

interface LandingCTAButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  /** Atributo data-cursor para MagneticCursor. Default "hover". */
  dataCursor?: string;
}

export const LandingCTAButton = forwardRef<HTMLButtonElement, LandingCTAButtonProps>(
  ({ children, onClick, type = "button", className, dataCursor = "hover" }, ref) => {
    return (
      <ButtonPress
        ref={ref}
        type={type}
        onClick={onClick}
        data-cursor={dataCursor}
        className={cn(
          // Layout / dimensões responsivas — escalonam de 320px até desktop
          "group relative w-full max-w-2xl overflow-hidden rounded-full",
          "h-16 sm:h-20 md:h-24 lg:h-28",
          "px-5 sm:px-8 md:px-10",
          // Superfície
          "bg-white text-black",
          "shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)]",
          // Tipografia aplicada no <button> para vencer estilos user-agent
          // (sem isto, o peso 800 só "aparecia" no hover por causa de reflow).
          "font-display font-extrabold uppercase tracking-tight leading-none",
          "text-[clamp(0.9rem,3.6vw,1.375rem)]",
          // Interação
          "transition-all hover:scale-[1.03] active:scale-95",
          className,
        )}
      >
        {/* Hover red fill */}
        <span
          aria-hidden
          className="absolute inset-0 overflow-hidden rounded-full bg-arch-primary opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        />
        {/* Label — fonte 800, tamanhos responsivos seguros, sem corte */}
        <span
          className={cn(
            "relative z-10 flex items-center justify-center gap-2 sm:gap-4 md:gap-6",
            "font-display font-extrabold uppercase tracking-tight leading-none",
            "text-balance break-words",
            "transition-colors group-hover:text-white",
          )}
        >
          {children}
        </span>
        {/* Shimmer sweep */}
        <span
          aria-hidden
          className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_2s_infinite]"
        />
      </ButtonPress>
    );
  },
);
LandingCTAButton.displayName = "LandingCTAButton";
