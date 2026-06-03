export type Archetype = "AO" | "SS" | "EA" | "HI";

export const ARCHETYPE_NAMES: Record<Archetype, { en: string; pt: string; pl: string; ro: string; ar: string }> = {
  AO: { en: "Obsessive Accumulator", pt: "Acumulador Obsessivo", pl: "Obsesyjny Akumulator", ro: "Acumulator Obsesiv", ar: "المُدَّخِر الهَوَسِي" },
  SS: { en: "Status Seeker", pt: "Buscador de Status", pl: "Poszukiwacz Statusu", ro: "Căutător de Status", ar: "باحث عن المَقام" },
  EA: { en: "Escapist Alienated", pt: "Escapista Alienado", pl: "Uciekinier Alienowany", ro: "Evadat Alienat", ar: "المَهَرب المُنفَرَد" },
  HI: { en: "Impulsive Hedonist", pt: "Hedonista Impulsivo", pl: "Impulsywny Hedonista", ro: "Hedonist Impulsiv", ar: "المُتَنَعِّم الاندفاعي" },
};

export const ARCHETYPE_TAGLINES: Record<Archetype, { en: string; pt: string; pl: string; ro: string; ar: string }> = {
  AO: { en: "Fear of scarcity, compulsive saving", pt: "Medo da escassez, poupança compulsiva", pl: "Lęk przed niedostatkiem, kompulsywna oszczędność", ro: "Teamă de penurie, economisire compulsivă", ar: "خوف من الندرة، توفير قهري" },
  SS: { en: "Spends for social approval, buys identity", pt: "Gasta para aprovação social, compra identidade", pl: "Wydatki dla akceptacji społecznej, kupuje tożsamość", ro: "Cheltuiește pentru aprobare socială, cumpără identitate", ar: "ينفق للقبول الاجتماعي، يشتري الهوية" },
  EA: { en: "Avoids the money topic, uses spending as escape", pt: "Evita o tema dinheiro, usa gastos como fuga", pl: "Unika tematu pieniędzy, używa wydatków jako ucieczki", ro: "Evită subiectul banilor, folosește cheltuielile ca scăpare", ar: "يتجنّب موضوع المال، يستخدم الإنفاق كهروب" },
  HI: { en: "Lives for now, emotional impulse decisions", pt: "Vive o agora, decisões por impulso emocional", pl: "Żyje chwilą, decyzje pod wpływem emocji", ro: "Trăiește pentru acum, decizii impulsuale emoționale", ar: "يعيش للآن، قرارات اندفاعية عاطفية" },
};