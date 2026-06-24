# Plano — Padronização Tipográfica da Landing Page (v4)

## Regra-mãe
**Syne 800 = só títulos (H1/H2/H3). Subtítulos/punchlines/quotes = Syne 600 ou 700. Body/UI = Inter 400/500/600. Zero `font-black` (900). Zero `italic` fora do Hero H1.**

---

## 1. Contrato tipográfico (fonte da verdade)

| Nível | Uso | Fonte | Peso | Classe canônica |
|---|---|---|---|---|
| **D1** | Hero H1 / FinalCTA H1 | Syne | **800** | `font-display font-extrabold` (italic opcional só aqui) |
| **D2** | H2 de bloco | Syne | **800** | `font-display font-extrabold uppercase text-[clamp(1.75rem,4.5vw,2.75rem)]` |
| **D3** | H3 de card | Syne | **800** | `font-display font-extrabold` |
| **D4a** | Punchline / pergunta FAQ / frase-eco (espaço folgado, frase curta) | Syne | **700** | `font-display font-bold` |
| **D4b** | Quote em card / texto longo em espaço apertado | Syne | **600** | `font-display font-semibold` |
| **B1** | Body padrão | Inter | **400** | `font-sans` (sem modificador) |
| **B2** | Lead / parágrafo destacado | Inter | **500** | `font-sans font-medium` |
| **B3** | UI / botão / badge / label / eyebrow | Inter | **600** | `font-sans font-semibold uppercase tracking-[0.18em]` |
| **AR** | Árabe (RTL) | Noto Naskh Arabic | 400/700 | herdado |

### Proibições inegociáveis
1. **Zero `font-black`** (peso 900) em qualquer lugar — Syne só vai até 800 real; 900 é sintético/borrado.
2. **Zero `italic`** fora do Hero H1 e FinalCTA H1.
3. **Zero Syne 800 em `<p>`, `<blockquote>`, quote, punchline, pergunta de FAQ** — Syne 800 é exclusivo de H1/H2/H3.
4. **Zero `style={{ fontFamily }}` inline** e **zero `text-[XXpx]` arbitrário em H2** (usar a `clamp()` única da D2).
5. **Body padrão é Inter 400** (não 500). 500 = lead (B2). 600 = UI/label (B3). Nunca 700/800 em body.

### Regra de bolso (D4a vs D4b)
> Frase curta + espaço folgado → **Syne 700**. Texto longo + espaço apertado (cards estreitos) → **Syne 600**.

---

## 2. Auditoria — estado atual

### ✅ Componentes já corrigidos (v3 — base ok, ainda assim revisar contra contrato)
`BeliefBreak.tsx`, `FAQ.tsx`, `ProofBar.tsx`, `Testimonials.tsx`, `ArchetypeShowcase.tsx`, `HowItWorks.tsx`, `FeaturesGrid.tsx`, `FinalCTA.tsx`.

### 🔴 Pendências críticas

**`src/routes/__root.tsx`** — Google Fonts:
- Syne carrega apenas `wght@700;800`. Falta **600** (necessário para D4b).
- Inter carrega `400;500;600;700;800` — remover **700** e **800** (proibidos em body).

**`src/routes/index.tsx` — bloco `<Sales>` (linhas ~1100–1700) — MAIOR foco da v4:**
Esse bloco NÃO foi tocado nas v2/v3 e ainda está completamente fora do contrato. Inventário:
- **~30 ocorrências de `font-black`** (peso 900) em h1/h2/h3/h4/spans/labels — TODAS rebaixar para `font-extrabold` (titles) ou `font-semibold` (labels/UI).
- **~20 ocorrências de `italic`** fora do Hero — remover de todos exceto o H1 hero da Sales.
- **~12 ocorrências de `font-medium`** em `<p>` body — remover (default Inter 400).
- Labels/eyebrows com `text-xs font-bold` ou `font-black uppercase` — padronizar para `font-semibold` (Inter 600).
- `text-[25px]/[50px]/[26px]` arbitrários em H2/H1 — substituir pela `clamp()` D2/D1.

**`src/routes/index.tsx` — bloco Quiz (linhas ~700–960):**
- `font-black italic` em CTAs e botões → `font-semibold` (Inter 600, sem italic). CTA pode ficar `font-bold` (Inter 700) em botão único se necessário, mas **default = 600**.
- `font-bold` em labels/badges → `font-semibold`.
- `font-medium` em body → remover.

**`src/components/landing/TopBar.tsx`** — não auditado nas fases anteriores. Revisar.

**`src/styles.css`** — atualizar comentário-âncora para `/* === TYPOGRAPHY CONTRACT v4 === */`.

---

## 3. Fases de execução (ordem)

### F0 — Foundation (sem mexer em componentes)
1. `src/routes/__root.tsx`: trocar Google Fonts para:
   - `Syne:wght@600;700;800`
   - `Inter:wght@400;500;600`
2. `src/styles.css`: atualizar comentário-âncora v4 com a tabela.

### F1 — `src/routes/index.tsx` bloco `<Sales>` (CRÍTICO — maior débito)
- Substituir TODOS os `font-black` por `font-extrabold` (em h1/h2/h3/h4) ou `font-semibold` (em labels/spans UI).
- Remover TODOS os `italic` exceto no H1 hero da Sales (1 ocorrência).
- Remover `font-medium` de `<p>` body (volta default Inter 400).
- Substituir tamanhos arbitrários `text-[25px]/[50px]/[26px]` em H2 pela classe canônica D2.
- Padronizar eyebrows/labels para `text-[11px] font-semibold uppercase tracking-[0.2em]`.

### F2 — `src/routes/index.tsx` bloco Quiz + Hero externo
- CTAs: `font-black italic` → `font-semibold` (ou `font-bold` se botão primário único).
- Labels (`font-black uppercase`) → `font-semibold uppercase`.
- Inputs/options: remover `font-medium`/`font-bold` desnecessários do body.

### F3 — `TopBar.tsx`
- Auditar e alinhar ao contrato v4.

### F4 — Re-verificação dos 8 componentes v3
- `rg "font-(black|extrabold)" src/components/landing/` — confirmar que `font-extrabold` aparece SÓ em H1/H2/H3.
- `rg "italic" src/components/landing/` — esperado: 0 ocorrências (ou só Hero H1).
- `rg "font-medium" src/components/landing/` — esperado: só em lead `<p>` explícito (B2).

### F5 — Validação final
```bash
bun run build                                          # 0 erros
rg "font-black" src/components/landing/ src/routes/index.tsx    # esperado: 0
rg "italic" src/routes/index.tsx                                # esperado: ≤1 (Hero H1)
rg "text-\[\d+px\]" src/components/landing/ src/routes/index.tsx | rg "font-display"  # esperado: 0
```
- Playwright: screenshot desktop (1440) + mobile (375) da landing inteira. Critério visual:
  - H1 hero > H2 bloco > H3 card > Punchline > Body — hierarquia clara pelo peso/tamanho.
  - Nenhum texto borrado (sem 900 sintético).
  - Nenhum italic fora do Hero.

---

## 4. Após a Landing — próximas páginas (ordem sugerida)
1. `/obrigado` (`src/routes/obrigado.tsx`)
2. `/privacy`, `/terms`
3. Quiz/Reveal screens (dentro de `src/routes/index.tsx` + `src/components/quiz/`)
4. Componentes de sales (`src/components/sales/`)
5. `404` e `errorComponent` em `__root.tsx`

Cada página segue o mesmo ciclo: F0 (já feito) → auditoria → rebaixar `font-black`/`italic` → validar.

---

## 5. Notas técnicas
- **Não tocar copy** — só classes Tailwind. Texto e i18n permanecem idênticos.
- **Não mexer em cor, espaçamento, layout, animação** — escopo é APENAS peso/família/italic de fontes.
- **Sem novos arquivos.** Apenas edits em arquivos existentes.
- **Reduced motion / RTL** — nenhuma mudança necessária; tipografia não interfere.

## 6. Critérios de aceite
- ✅ `bun run build` passa.
- ✅ Zero `font-black` na landing (`index.tsx` + `components/landing/`).
- ✅ Italic só no Hero H1.
- ✅ Hierarquia visual H1 > H2 > H3 > D4 > body legível em desktop e mobile.
- ✅ Syne 600 carregado (Network tab mostra `Syne-SemiBold`).
