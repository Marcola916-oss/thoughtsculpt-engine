export type Archetype = "AO" | "SS" | "EA" | "HI";

export const ARCHETYPE_NAMES: Record<Archetype, { en: string; pt: string }> = {
  AO: { en: "Obsessive Accumulator", pt: "Acumulador Obsessivo" },
  SS: { en: "Status Seeker", pt: "Buscador de Status" },
  EA: { en: "Escapist Alienated", pt: "Escapista Alienado" },
  HI: { en: "Impulsive Hedonist", pt: "Hedonista Impulsivo" },
};

export const ARCHETYPE_TAGLINES: Record<Archetype, string> = {
  AO: "Fear of scarcity, compulsive saving",
  SS: "Spends for social approval, buys identity",
  EA: "Avoids the money topic, uses spending as escape",
  HI: "Lives for now, emotional impulse decisions",
};