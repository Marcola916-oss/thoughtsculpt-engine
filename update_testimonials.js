const fs = require('fs');

const file = 'src/lib/i18n/translations.ts';
let content = fs.readFileSync(file, 'utf8');

// We will use regex to find `testimonials: [` under `landing` and add the 3 extra items.
// Actually, it's easier to just replace the whole array.
// For PT:
content = content.replace(
  /items: \[\s*\{ stars: 5, quote: "Nunca entendi por que gastava tudo antes do dia 15.*?\},\s*\{ stars: 5, quote: "Eu achava que era disciplinada.*?\},\s*\{ stars: 5, quote: "A parte sobre carreira e relacionamentos doeu.*?\},?\s*\]/s,
  `items: [
        { stars: 5, quote: "Nunca entendi por que gastava tudo antes do dia 15. O diagnóstico nomeou exatamente o que eu sentia. Parece que finalmente alguém me explicou a mim próprio.", name: "Adam K.", arch: "Arquétipo: HEDONISTA\\nIMPULSIVO" },
        { stars: 5, quote: "Eu achava que era disciplinada com dinheiro. O MindReset mostrou que eu tinha medo de gastar — e que isso também é um problema. Foi revelador.", name: "Maria C.", arch: "Arquétipo: Guardadora Obsessiva" },
        { stars: 5, quote: "A parte sobre carreira e relacionamentos doeu — e foi exatamente onde eu precisava ver. Não é só um relatório financeiro, é um espelho.", name: "Rami S.", arch: "Arquétipo: Fantasma Evasivo" },
        { stars: 5, quote: "Pela primeira vez entendi por que nunca conseguia guardar. Não era falta de disciplina — era meu padrão.", name: "Mariana S.", arch: "Arquétipo: EA" },
        { stars: 5, quote: "O Compass mudou minha relação com meu parceiro. Entendi o arquétipo dele e finalmente paramos de brigarmos por dinheiro.", name: "Andrzej K.", arch: "Arquétipo: AO" },
        { stars: 5, quote: "Em 15 dias já estava reconhecendo o gatilho antes de comprar. Isso nunca aconteceu com nenhum app.", name: "Alexandru P.", arch: "Arquétipo: HI" },
      ]`
);

// We need to do this for EN, PL, RO, AR as well.
// Since the user said they are okay with me updating the testimonials, let's just make the changes directly to `SalesPageV2.tsx` and hardcode the new testimonials array there, passing it to the `Testimonials` component, OR better, create a unified testimonials array inside `SalesPageV2.tsx` that combines `landing.testimonials` with `salesV2.b6.testimonials`.
console.log('Done');
