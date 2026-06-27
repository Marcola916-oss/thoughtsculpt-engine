import { useI18n } from "@/lib/i18n/LanguageProvider";

type Archetype = "AO" | "SS" | "EA" | "HI";

export function useCascade(archetype: Archetype) {
  const { t } = useI18n();
  return t.reveal.cascade[archetype];
}

export function useArchCTA(archetype: Archetype) {
  const { t } = useI18n();
  const ctaMap = {
    AO: { label: t.reveal.archCta.AO, color: "#1e3a5f" },
    SS: { label: t.reveal.archCta.SS, color: "#b8860b" },
    EA: { label: t.reveal.archCta.EA, color: "#6b21a8" },
    HI: { label: t.reveal.archCta.HI, color: "#ea580c" },
  };
  return ctaMap[archetype];
}
