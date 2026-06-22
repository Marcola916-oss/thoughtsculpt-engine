import type { Answers, Archetype } from "@/lib/quiz/scoring";
import { scoreAnswers } from "@/lib/quiz/scoring";

export type LifeArea = "money" | "career" | "love" | "personal";

/**
 * Pesos por arquétipo × área (0–1). Usado para projetar o score do arquétipo
 * em um diagnóstico multi-dimensional (4 áreas da vida).
 * Valores derivados do briefing comportamental: cada arquétipo tem padrões
 * diferentes de impacto em dinheiro / carreira / amor / pessoal.
 */
const AREA_WEIGHTS: Record<Archetype, Record<LifeArea, number>> = {
  // Acumulador Obsessivo — alto em dinheiro, médio carreira, baixo amor/pessoal
  AO: { money: 0.95, career: 0.7, love: 0.55, personal: 0.6 },
  // Status Seeker — alto em status profissional/amor, dinheiro como vitrine
  SS: { money: 0.8, career: 0.9, love: 0.85, personal: 0.5 },
  // Evitador Ansioso — paralisia atinge tudo, especialmente carreira/pessoal
  EA: { money: 0.85, career: 0.9, love: 0.75, personal: 0.95 },
  // Hedonista Impulsivo — dinheiro descontrolado, amor intenso, pessoal volátil
  HI: { money: 0.9, career: 0.6, love: 0.85, personal: 0.8 },
};

export type AreaScores = Record<LifeArea, number>;

/**
 * Recebe os 8 answers e devolve scores 0–100 por área da vida.
 * Combina o score de cada arquétipo (do scoreAnswers) com a tabela de pesos.
 */
export function computeAreaScores(answers: Answers): {
  winner: Archetype;
  areas: AreaScores;
} {
  const { scores, winner } = scoreAnswers(answers);
  const totalArchScore = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0) || 1;

  const areas: AreaScores = { money: 0, career: 0, love: 0, personal: 0 };
  (Object.keys(scores) as Archetype[]).forEach((arch) => {
    const share = scores[arch] / totalArchScore; // 0–1
    (Object.keys(areas) as LifeArea[]).forEach((area) => {
      areas[area] += share * AREA_WEIGHTS[arch][area];
    });
  });

  // Normaliza para 30–95 (sempre tem algo a melhorar, nunca 0 ou 100).
  (Object.keys(areas) as LifeArea[]).forEach((area) => {
    areas[area] = Math.round(30 + areas[area] * 65);
  });

  return { winner, areas };
}

export const AREA_ORDER: LifeArea[] = ["money", "career", "love", "personal"];