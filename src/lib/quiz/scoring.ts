export type Archetype = "AO" | "SS" | "EA" | "HI";

/**
 * Each of the 8 questions has 4 options in fixed order.
 * Option index → archetype mapping (per skill spec).
 */
export const OPTION_ARCHETYPE: Archetype[][] = [
  ["AO", "SS", "EA", "HI"], // Q1 unexpected money
  ["AO", "SS", "EA", "HI"], // Q2 trigger
  ["AO", "SS", "EA", "HI"], // Q3 future feeling
  ["AO", "SS", "EA", "HI"], // Q4 end of month
  ["AO", "SS", "EA", "HI"], // Q5 before purchase  (tiebreaker B)
  ["AO", "SS", "EA", "HI"], // Q6 dominant feeling
  ["AO", "SS", "EA", "HI"], // Q7 aspiration
  ["AO", "SS", "EA", "HI"], // Q8 desired change  (tiebreaker A)
];

export type Answers = Array<number | null>; // length 8, option index 0..3

export function scoreAnswers(answers: Answers): {
  scores: Record<Archetype, number>;
  winner: Archetype;
  secondary: Archetype | null;
} {
  const scores: Record<Archetype, number> = { AO: 0, SS: 0, EA: 0, HI: 0 };
  answers.forEach((opt, i) => {
    if (opt == null) return;
    if (i === 1 && opt === 2) {
      // Q2 Option C: EA +2, HI +1
      scores.EA += 2;
      scores.HI += 1;
    } else {
      const arch = OPTION_ARCHETYPE[i]?.[opt];
      if (arch) scores[arch] += 2;
    }
  });

  const ranked = (Object.keys(scores) as Archetype[]).sort((a, b) => scores[b] - scores[a]);
  let winner = ranked[0];

  // Tiebreakers per spec: Q8 first, then Q5
  if (scores[ranked[0]] === scores[ranked[1]]) {
    const q8 = answers[7] != null ? OPTION_ARCHETYPE[7][answers[7]!] : null;
    if (q8 && scores[q8] === scores[winner]) winner = q8;
    else {
      const q5 = answers[4] != null ? OPTION_ARCHETYPE[4][answers[4]!] : null;
      if (q5 && scores[q5] === scores[winner]) winner = q5;
    }
  }
  // Secondary = highest scoring archetype that is not the winner AND scored > 0.
  // Only expose it when there's meaningful signal (gap < winner and score >= 2).
  const secondary =
    ranked.find((a) => a !== winner && scores[a] >= 2) ?? null;
  return { scores, winner, secondary };
}