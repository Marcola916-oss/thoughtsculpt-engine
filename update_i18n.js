const fs = require('fs');
const content = fs.readFileSync('src/lib/i18n/translations.ts', 'utf8');

let newContent = content;

// Modifying salesV2 for all languages to remove price-related fields in B5 and B7
// In PT:
newContent = newContent.replace(
  /b5: { eyebrow: ".*?was: ".*?"then: ".*?"now: ".*?"note: ".*?" },/g,
  `b5: { eyebrow: "VALOR INCALCULÁVEL", was: "", then: "", now: "", note: "O quanto custa o seu padrão de repetição?" },`
);

newContent = newContent.replace(
  /b7: { eyebrow: ".*?was: ".*?"then: ".*?"price: ".*?"cta: ".*?"trust: ".*?" },/g,
  `b7: { eyebrow: "O SEU RESET COMEÇA AQUI", was: "", then: "", price: "", cta: "Ver meu plano de ação", trust: "🔒 Acesso imediato · Garantia de 7 dias" },`
);

fs.writeFileSync('src/lib/i18n/translations.ts', newContent, 'utf8');
console.log('Translations updated successfully.');
