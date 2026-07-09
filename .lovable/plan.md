# Plano — Fechar todos os vazamentos de idioma em SA / PL / RO

Objetivo: eliminar 100% dos vazamentos EN/PT nos três mercados prioritários, sem tocar em design, layout, componentes ou lógica de funil. Só dicionário de tradução + uma linha no reveal.

## Escopo (o que muda)

Um único arquivo grande — `src/lib/i18n/translations.ts` — recebe blocos completos em PL, RO e AR para as chaves que hoje caem em `...EN`. Mais uma linha em `src/routes/index.tsx` (bug do blur hint com PT hard-coded).

Nada muda em: componentes, rotas, estilos, tokens, Supabase, Stripe, analytics, imagens, animações, RTL sweep (já feito).

## Ordem de execução (5 ondas curtas, uma por PR mental)

### Onda A — P0 blur hint PT no reveal (1 linha)
- `src/routes/index.tsx:1014` — trocar o literal `{props.name}, o teu arquétipo é:` por `t.reveal.kicker(props.name)` (função já existe e já está traduzida em PL/RO/AR).
- Impacto: mata o vazamento PT que aparecia em Anna / Ana / سارة.

### Onda B — P0 Quiz completo (PL, RO, AR)
- Adicionar `q: [ … ]` nos 3 dicionários. 8 perguntas × 4 opções = 32 strings + 8 títulos por idioma.
- Fonte de referência: o array `q` em PT (linha 490) e EN (linha 1194).
- Tradução nativa, não literal — respeitando notas culturais do `AGENTS.md`:
  - PL: "Oszczędny" (não "Skąpy"), "Iskra" (spark), tom neutro sem julgamento.
  - RO: "Econom" (não "Zgârcit"), "Cumpătat", tom premium.
  - AR: zero referência a juros/riba, "المدخر القهري" para AO, "الباحث عن المكانة" para SS, "المنفصل" para EA, "المندفع" para HI, MSA (árabe padrão moderno) formal.
- Impacto: o quiz — coração do produto — passa a ser vendável nos 3 mercados.

### Onda C — P1 Sales por arquétipo (PL, RO, AR)
- Adicionar `sales.AO / SS / EA / HI` completo nos 3 dicionários (name, tagline, painPoints, bullets). Fonte: `sales.AO/SS/EA/HI` em EN (linha 1236).
- Nomes dos arquétipos por idioma (a validar com você antes de finalizar):
  - PL: `AO=Kompulsywny Oszczędny`, `SS=Poszukiwacz Statusu`, `EA=Odłączony`, `HI=Impulsywny Hedonista`.
  - RO: `AO=Acumulator Compulsiv`, `SS=Căutător de Status`, `EA=Deconectat`, `HI=Hedonist Impulsiv`.
  - AR: `AO=المدخر القهري`, `SS=الباحث عن المكانة`, `EA=المنفصل عن المال`, `HI=المندفع الباحث عن اللذة`.
- Impacto: reveal + tagline + dores + oferta chegam no idioma correto.

### Onda D — P1 Loader `analysis` (PL, RO, AR)
- Adicionar `loader.analysis: string[]` (8 linhas curtas por idioma), inspirado no array EN linha 1228 mas natural em cada idioma.
- Impacto: NeuralLoader deixa de mostrar "Analyzing impulsivity flows…" em polaco/romeno/árabe.

### Onda E — P2 Privacy + Terms bodies (PL, RO, AR)
- Adicionar `legal.privacyBody` e `legal.termsBody` nos 3 dicionários. Base: EN atual (linhas 1418–1419), adaptado para:
  - PL/RO: linguagem GDPR-UE padrão, e-mail `privacy@mindreset.app` mantido.
  - AR: MSA formal, RTL-safe (o `<p whitespace-pre-line>` já é RTL-aware pela raiz).
- Impacto: `/privacy` e `/terms` deixam de mostrar corpo em inglês.

## Validação após cada onda

Depois de cada onda, rodar o mesmo scanner Playwright de antes (`/tmp/browser/i18n/scan.py`) restrito ao locale afetado e comparar contagem de vazamentos. Meta:

| Locale | Antes | Depois de A+B+C+D+E |
|---|---|---|
| AR | 58 | ~4 (só nomes próprios científicos — Kahneman, Thaler, Ariely, Nobel — que ficam em Latin em qualquer idioma) |
| PL | 18 | 0 reais (2 falsos positivos aceitos: "hedonista" é polaco, endonyms do switcher) |
| RO | 17 | 0 reais |

Build check: `npm run build` deve continuar em 0 erros novos. TypeScript strict garante que se qualquer chave nova estiver mal tipada, o build quebra antes do deploy.

## Fora de escopo (deixar para depois, se você pedir)

- Traduzir `copy` inline de `/obrigado` (débito técnico já registrado no `AGENTS.md`).
- OG meta multi-lang no `__root.tsx` (requer detecção Accept-Language no SSR).
- Refatorar `LanguageSwitcher` para esconder endonyms de outros scripts.
- Ajustes de copy PT-BR vs PT-PT (o produto usa PT-PT hoje, decisão estável).

## Detalhes técnicos

- Todos os deltas vivem em um arquivo (`translations.ts`) + 1 linha em `index.tsx`. Diff previsível, review fácil.
- Não crio nenhuma chave nova — só preencho chaves que já existem no tipo `Dict` (linha 9 do arquivo) e hoje caem no spread `...EN`.
- Não removo nenhum `...EN` spread — se amanhã surgir uma chave nova só em EN, ela continua caindo lá até ser explicitamente traduzida (é o comportamento seguro atual).
- Traduções feitas por mim (o agente) usando os padrões culturais já anotados no `AGENTS.md`. Você revisa cada onda antes de eu abrir a próxima — se quiser revisão humana profissional depois, os blocos ficam claramente delimitados e trocáveis 1:1.

## Entregável final

1. Todos os 6 bugs do REPORT.md fechados.
2. Novo scan salvo em `melhorias_contexto/i18n-scan/REPORT-after.md` mostrando 0 vazamentos reais em PL/RO e só nomes próprios em AR.
3. Zero mudança visual, zero mudança de fluxo — pura entrega de idioma.
