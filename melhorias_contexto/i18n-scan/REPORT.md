# i18n Leak Scan — SA (ar) · PL · RO × mobile+desktop

Simulação real via Playwright (Chromium, `mobile 375×812` + `desktop 1440×900`, locale nativo).
Fluxo percorrido em cada combinação: `/` → quiz completo (8 telas) → email → loader → reveal → sales (scroll integral) → `/privacy` → `/terms` → `/obrigado?order_id=demo-test-preview`.

Dumps completos: `report.json` (mesma pasta).

**Nada foi alterado no código** — só diagnóstico. Diff-plan segue no fim.

---

## 🎯 Causa-raiz única

`src/lib/i18n/translations.ts` — os dicionários **PL, RO e AR** fazem `...EN` no topo mas **NÃO sobrescrevem** as seguintes chaves. Tudo que depende delas é servido em **inglês** nos três mercados:

| Chave em falta | Onde vaza |
|---|---|
| `q: [ … 8 perguntas × 4 opções ]` | **TODAS as 8 telas do quiz** (títulos + botões de resposta) |
| `loader.analysis: string[]` | Logs animados do `NeuralLoader` (ex.: "Analyzing impulsivity flows…") |
| `legal.privacyBody` | Página `/privacy` — corpo inteiro em EN |
| `legal.termsBody` | Página `/terms` — corpo inteiro em EN |
| `sales.AO / SS / EA / HI` (`name`, `tagline`, `bullets` …) | Sales page: nome do arquétipo, tagline, dores, ofertas — todos em EN quando o arquétipo servido pelo scoring cai em qualquer non-PT/EN |

Só PT e EN têm essas chaves completas (linhas 490 e 1194).

---

## 🧾 Bugs específicos encontrados (independentes da causa acima)

### 1. Blur hint com PT hard-coded no reveal
`src/routes/index.tsx:1014`
```tsx
{props.name}, o teu arquétipo é:
```
Aparece nos 3 idiomas (PL/RO/AR) sob o `blur-sm` da preview do arquétipo antes do email-gate. É o texto **"o teu arquétipo é:"** em português vazando dentro de Anna/Ana/سارة.
**Fix:** trocar por `t.reveal.kicker(props.name)` (já traduzido em PL/RO/AR).

### 2. Página `/privacy` em inglês em PL/RO/AR
`translations.ts:1418` — só EN define `legal.privacyBody`. `terms.tsx` e `privacy.tsx` renderizam `t.legal.termsBody / privacyBody`, então mostram texto EN mesmo com UI em polaco/romeno/árabe.

### 3. Página `/terms` em inglês em PL/RO/AR
Mesma raiz que #2 — `legal.termsBody` só existe em EN.

### 4. `NeuralLoader` — logs em inglês em PL/RO/AR
`translations.ts:1228` define `loader.analysis` só em EN. Como PL/RO/AR spread `...EN.loader`, o array vaza. Ex.: **"Analyzing impulsivity flows…"** aparece no meio de um loader com título "Przetwarzam Twoje odpowiedzi".

### 5. Quiz inteiro em inglês em PL/RO/AR (crítico)
Perguntas capturadas em PL/RO/AR:
- "You receive an unexpected sum equal to your salary. First impulse?"
- "When you overspend, the trigger is usually:"
- "Thinking about your financial future you mostly feel:"
- "At month's end your account is usually:"
- "Before a major purchase you:"
- "The word that best describes your relationship with money is:"
- "Your biggest financial aspiration is:"
- "If you could change ONE thing in your money behavior it would be:"

E as 32 opções em inglês ("Save almost all of it — safety first", "Stop living in scarcity mode", "Delay one purchase by 24h" etc.).

### 6. Sales page — arquétipo em inglês em PL/RO/AR
`translations.ts:1236` (`sales.AO/SS/EA/HI`) só definido em EN completo. PL/RO/AR herdam. Ex.: **"You live in scarcity mode — even when there's plenty."** aparece no bloco tagline dos três mercados.

### 7. Seletor de idioma mostra rótulos em outros scripts
`src/lib/i18n/types.ts` — as `<option>` do `LanguageSwitcher` listam "العربية" numa página polaca/romena e "Polski/Português" numa página árabe. É **comportamento aceito** para language switchers (endonyms) — não é bug funcional, mas foi flag pelo scanner.

---

## 📊 Contagem por locale × device (após dedupe)

| Locale | Mobile | Desktop | Categorias dominantes |
|---|---|---|---|
| **AR (SA)** | 58 | 58 | Quiz (32) · privacy/terms (2) · sales (~5) · reveal blur (1) · loader logs (variável) · nomes próprios científicos (Kahneman, Thaler, Ariely — aceitáveis) |
| **PL** | 18 | 18 | Quiz (16) · privacy/terms (2) · reveal blur (1) · loader (1) · sales (1) |
| **RO** | 17 | 17 | Quiz (16) · privacy/terms (2) · reveal blur (1) · loader (1) · sales (1) |

> Falsos positivos identificados (não são bugs):
> - `Impulsywny Hedonista` em PL — "hedonista" é palavra válida em polaco (o scanner marca por overlap com dicionário PT).
> - Nomes próprios: **Daniel Kahneman, Richard Thaler, Dan Ariely, Nobel** — devem permanecer em Latin em qualquer idioma.
> - Endonyms do `<select>` de idioma (ver #7).

---

## 🛠 Plano de fix mínimo (não aplicado — aguardando OK)

Ordem por impacto de conversão:

1. **P0 — Reveal blur (#1)** — 1 linha em `src/routes/index.tsx:1014`. Corrige 3 mercados de uma vez.
2. **P0 — Quiz (#5)** — adicionar `q: [ … ]` completo (8 perguntas × 4 opções) em PL, RO, AR na `translations.ts`. Sem isso o quiz não é vendável nesses mercados.
3. **P1 — Sales AO/SS/EA/HI (#6)** — adicionar `sales.AO/SS/EA/HI` completo em PL/RO/AR (name, tagline, painPoints, bullets…). Sem isso a reveal + oferta chegam em EN.
4. **P1 — NeuralLoader logs (#4)** — adicionar `loader.analysis: string[]` em PL/RO/AR (frases curtas, 8-10 linhas cada).
5. **P2 — Privacy/Terms (#2, #3)** — traduzir `legal.privacyBody` e `legal.termsBody` para PL/RO/AR (revisão jurídica leve por mercado — SA precisa versão em árabe formal, PL/RO padrão UE).

Volume estimado: ~3.500 caracteres × 3 idiomas = ~10.5k caracteres de tradução nativa (não literal — respeitando nuances culturais já documentadas no `AGENTS.md`, ex.: "Oszczędny" não "Skąpy" para SS em PL, "المدخر القهري" não "البخيل" para AO em AR).

---

## Evidências

- Scanner: `/tmp/browser/i18n/scan.py` (Playwright, headless Chromium, dedupe por (route, text, reason)).
- Log de execução: `/tmp/browser/i18n/run.log`.
- Findings brutos: `report.json` (esta pasta).
- Racional das regras: PT-leak = tokens exclusivos de português (você/teu/dossiê/arquétipo…); EN-leak = tokens funil (unlock/scarcity/purchase/your/analyzing…) em página não-EN; AR-in-latin / Latin-in-AR = script incorreto para o locale.