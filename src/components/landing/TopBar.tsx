import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useScroll, motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/identity/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useDeviceTier } from "@/hooks/use-device-tier";

export function TopBar() {
  const { t } = useI18n();
  const tier = useDeviceTier();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setScrolled(latest > 20);
    });
  }, [scrollY]);

  return (
    <header
      className={`absolute top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled
          ? "bg-black/60 backdrop-blur-md border-b border-white/5 py-2 md:py-3 shadow-2xl"
          : "bg-transparent py-4 md:py-6"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6" style={{ paddingTop: "0px", paddingBottom: "0px", marginTop: "-19px", marginBottom: "-19px" }}>
        {/* Logo Left */}
        <Logo size="md" />

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-6">
          <LanguageSwitcher className="opacity-80 hover:opacity-100 transition-opacity" />
          
          <Link to="/login">
            <PrimaryButton size="sm" className="hidden sm:flex">
              {t.common.login}
            </PrimaryButton>
          </Link>
          
          {/* Mobile Login Icon/Button could be added here if needed, 
              but for now keeping it clean as per plan */}
        </div>
      </div>
      
      {/* Scroll indicator for non-low-tier devices */}
      {tier !== "low" && scrolled && (
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />
      )}
    </header>
  );
}
