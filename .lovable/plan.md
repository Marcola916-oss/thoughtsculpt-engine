
# Padronização Tipográfica — Opção A
## Escopo desta fase: **somente Landing Page** (Hero + 9 sections pós-Hero do `stage="hero"`)

---

## 1. Diretrizes-mestras (regras inegociáveis)

Toda fonte usada na landing DEVE cair em uma destas 4 categorias. Nada fora disso.

| Categoria | Fonte | Peso | Tamanho típico | Classe Tailwind canônica |
|---|---|---|---|---|
| **D1 — Display / Hero H1** | Syne | **800** | clamp(2.5rem, 8vw, 5.25rem) | `font-display font-extrabold` (italic opcional só no Hero/FinalCTA) |
| **D2 — Section title (H2)** | Syne | **800** | clamp(1.75rem, 4.5vw, 2.75rem) | `font-display font-extrabold` |
| **D3 — Sub-section / Card H3** | Syne | **700** | 1.125–1.5rem (18–24px) | `font-display font-bold` |
| **B1 — Body / Parágrafo** | Inter | **400** | 1rem / 1.0625rem (16–17px) | `font-sans font-normal` (default body) |
| **B2 — Body emphasis / lead** | Inter | **500** | 1.125–1.25rem | `font-sans font-medium` |
| **B3 — UI / botão / label / badge** | Inter | **600** | 0.75–0.875rem, uppercase tracking | `font-sans font-semibold uppercase tracking-[0.18em]` |
| **AR (RTL)** | Noto Naskh Arabic | 400/700 | herdado | aplicado via `[dir="rtl"] body` (já existe) |

### Proibições absolutas
1. **Nada de `italic` fora do Hero H1 e do FinalCTA H1.** Toda H2/H3 de section deixa de ser italic — italic em série mata hierarquia e legibilidade.
2. **Nada de `font-black` (900).** Syne 900 não está carregado e o browser sintetiza um peso falso. Máximo = 800.
3. **Nada de `font-mono`** em texto de marketing (manter apenas em contadores/timers numéricos do quiz/sales — fora desta fase).
4. **Nada de `style={{ fontFamily: ... }}`** inline.
5. **Nada de `text-[XXpx]` arbitrário em H2 de section.** Usar a escala fluida `clamp()` da tabela.
6. **Nada de `tracking-[-0.05em]` em H3 pequenos** (<24px) — fecha demais o texto. Reservar tracking negativo para D1/D2.

### Padrão de hierarquia (regra de ouro)
> Em qualquer section: **um único H2 (D2 Syne 800)** + N H3 (D3 Syne 700) + body (B1/B2 Inter). Tudo o resto é UI (B3).

---

## 2. Estado atual auditado

Já fizemos o levantamento. A base está correta:
- `--font-display: Syne` e `--font-sans: Inter` em `src/styles.css`
- Google Fonts já carrega **Inter 400/500/600/700/800** + **Syne 700/800** + **Noto Naskh Arabic 400-700** em `src/routes/__root.tsx`
- **Nenhum** uso de serif (Instrument/Cormorant/DM Serif) na landing — boa notícia
- **Nenhum** `style={{ fontFamily }}` inline na landing

### Problemas reais encontrados (o que vai ser corrigido)

| # | Arquivo | Problema | Categoria errada → certa |
|---|---|---|---|
| 1 | `ArchetypeShowcase.tsx:38` | H2 com `text-[24px] font-black italic` | D2 errado → **D2: clamp + extrabold + sem italic** |
| 2 | `HowItWorks.tsx:25` | H2 com `text-[24px] font-black italic` + largura travada `290px` | D2 errado → **D2 + remover width fixo** |
| 3 | `FeaturesGrid.tsx:26` | H2 igual ao acima | D2 errado → **D2 padrão** |
| 4 | `Testimonials.tsx:29` | H2 igual + `mx-[-10px]` | D2 errado → **D2 padrão** |
| 5 | `FAQ.tsx:27` | H2 igual com `leading-[35px]` | D2 errado → **D2 padrão** |
| 6 | `FinalCTA.tsx:28` | H1 `font-black italic` clamp(1.5,8vw,5.25) — **OK como D1** (é o único H1 da página depois do Hero), só trocar `font-black` → `font-extrabold` |
| 7 | `ArchetypeShowcase.tsx:77` | H3 dos cards `font-black italic` | D3 errado → **D3: Syne 700, sem italic** |
| 8 | `HowItWorks.tsx:49` | H3 step `font-black italic` | D3 errado → **D3** |
| 9 | `FAQ.tsx:56` | Pergunta `font-black italic` | D3 errado → **D3** (não italic, 700) |
| 10 | `BeliefBreak.tsx:31` | H2 `font-extrabold` (✅ peso correto) só validar escala | D2 — só ajustar escala se necessário |
| 11 | `BeliefBreak.tsx:41,67` | "Punchline" + quote cards `font-bold` Syne | D3 — **manter** (intencional) |
| 12 | `ProofBar.tsx:127` | Stats com `font-display italic` mix de pesos via ternário | Caso especial numérico — **manter visual, padronizar para Syne 800 sem italic** |
| 13 | `ArchetypeShowcase.tsx:72` + `BeliefBreak:57` | Mini-labels `font-display ... font-black tracking` | B3 errado (badge UI) → **trocar para `font-sans font-semibold`** (Inter, não Syne) |
| 14 | `routes/index.tsx:1183` (Pain Mirror Sales block 2) | `font-display ... font-black uppercase italic` | D2 errado → **D2** (parte da landing porque Sales ainda renderiza dentro de `stage="hero"`)|
| 15 | Hero `index.tsx:1120` | H1 hero `font-black italic` clamp 5rem→8rem | D1 — **trocar `font-black` → `font-extrabold`**, manter italic (assinatura do hero) |

### Decisão de italic
- **Manter italic apenas em:** Hero H1 (index.tsx:1120), FinalCTA H1 (FinalCTA.tsx:28) — esses dois são a assinatura "MarbleBust × tech-editorial".
- **Remover italic** de toda H2 de section e toda H3 de card. Italic em série na landing inteira gera ruído e reduz scanabilidade — anti-conversão.

---

## 3. Plano em fases (ordem de execução)

### **FASE 0 — Foundation (5 min, 1 arquivo)**
Garantir que a infraestrutura está blindada antes de tocar componentes.

- [ ] **`src/styles.css`** — adicionar comentário-âncora `/* === TYPOGRAPHY CONTRACT (Opção A) === */` acima de `--font-display`, listando as 6 categorias D1–B3 como referência permanente para futuros agentes.
- [ ] Adicionar utilitários semânticos opcionais (não-quebrantes):
  ```css
  @utility text-display-hero { @apply font-display font-extrabold italic uppercase; }
  @utility text-display-h2   { @apply font-display font-extrabold uppercase; }
  @utility text-display-h3   { @apply font-display font-bold uppercase; }
  @utility text-ui-label     { @apply font-sans font-semibold uppercase tracking-[0.18em]; }
  ```
  (Adoção é opcional — componentes podem continuar usando classes Tailwind diretas. Servem como "convenção viva".)

**Verificação:** `tsgo --noEmit` + build OK.

---

### **FASE 1 — Hero (10 min, 1 arquivo)**
A primeira coisa que o visitante vê. Maior peso de conversão.

- [ ] `src/routes/index.tsx:1120` (Hero H1): trocar `font-black` → `font-extrabold`. Manter italic, uppercase, escala atual.
- [ ] `src/routes/index.tsx:1183` (Pain Mirror H2): aplicar **D2 puro** — `font-display font-extrabold uppercase` + remover italic + escala fluida `text-[clamp(1.75rem,4.5vw,2.75rem)]`.

**Verificação:** screenshot Playwright Hero (mobile 375 + desktop 1440), comparar antes/depois.

---

### **FASE 2 — BeliefBreak (5 min, 1 arquivo)**
Já está quase correto. Só ajustar mini-labels.

- [ ] `BeliefBreak.tsx:57` (badge "KAHNEMAN", "THALER", "ARIELY"): trocar `font-display ... font-bold` → **B3 (`font-sans font-semibold uppercase tracking-[0.18em]`)**. Badge é UI, não título.
- [ ] H2 (linha 31) e cards (41, 67) — **manter**, já estão dentro da grade.

---

### **FASE 3 — ProofBar (5 min, 1 arquivo)**
Stats numéricas. Caso especial: números grandes ficam em Syne 800 (D2), label embaixo em Inter B3.

- [ ] `ProofBar.tsx:127`: remover `italic`, consolidar para `font-display font-extrabold` + escala fluida única (`text-[clamp(1.5rem,4vw,1.75rem)]`) em vez de 4 ternários inline com `style`.
- [ ] Labels abaixo dos stats: garantir `font-sans font-medium text-[11px] uppercase tracking-[0.2em] text-foreground/60` (B3).

---

### **FASE 4 — ArchetypeShowcase (10 min, 1 arquivo)**
4 cards = onde italic+font-black acumula mais ruído visual.

- [ ] Title H2 (linha 38): aplicar **D2 padrão** (sem italic, sem `mx-[-10px]`, escala `clamp(1.75rem,4.5vw,2.75rem)`).
- [ ] Tag eyebrow (linha 72): trocar para **B3 Inter** (`font-sans font-semibold`).
- [ ] H3 dos cards (linha 77): trocar `font-black italic` → **D3 (`font-display font-bold uppercase`)** + remover italic, manter tracking-tight (negativo leve aceitável em 16px porque é uppercase curto).

---

### **FASE 5 — HowItWorks (10 min, 1 arquivo)**
3 steps. Repetição visual = maior chance de fadiga visual se italic acumular.

- [ ] H2 (linha 25): **D2 padrão**. **Remover `style={{ width: "290px" }}`** — largura travada quebra responsivo em outros idiomas (PL/RO/AR mais compridos).
- [ ] Número do step (linha 46): Syne 800 está OK, só trocar `font-black italic` → `font-extrabold` (sem italic — números italic em círculo ficam tortos).
- [ ] H3 step (linha 49): **D3** sem italic.

---

### **FASE 6 — FeaturesGrid (5 min, 1 arquivo)**
- [ ] H2 (linha 26): **D2 padrão**, remover `mx-[-10px]`.
- [ ] H3 de cada feature card: aplicar **D3** consistente (mesmo padrão).

---

### **FASE 7 — Testimonials (5 min, 1 arquivo)**
- [ ] H2 (linha 29): **D2 padrão**, remover `mx-[-10px]`.
- [ ] Nome do autor: **B3 Inter** (`font-sans font-semibold uppercase tracking-[0.16em]`) em vez de Syne — nome de pessoa em Syne 800 italic compete com a quote.
- [ ] Quote: **B2 Inter** (`font-sans font-medium`) — quote longa em Syne reduz legibilidade.

---

### **FASE 8 — FAQ (10 min, 1 arquivo)**
Accordion. Crítico para conversão (objeções).

- [ ] H2 (linha 27): **D2 padrão**, remover `leading-[35px]` arbitrário.
- [ ] Pergunta (linha 56): trocar `font-black italic` → **D3 (`font-display font-bold uppercase tracking-tight`)** — sem italic. Texto italic dentro de accordion clicável reduz tap-confidence.
- [ ] Resposta (corpo do accordion): garantir **B1 Inter `font-normal text-[15px] leading-relaxed`** — é onde o visitante REALMENTE lê.

---

### **FASE 9 — FinalCTA (5 min, 1 arquivo)**
Última conversão. Mantém personalidade do Hero.

- [ ] H1 (linha 28): trocar `font-black` → `font-extrabold`. **Manter italic** (assinatura, par com Hero).
- [ ] Sub-texto e guarantee row: garantir **B2/B3 Inter**, sem Syne.

---

### **FASE 10 — Validação global (15 min)**
- [ ] **Build:** `bun run build` — zero erros novos.
- [ ] **Typecheck:** `tsgo --noEmit` — zero erros.
- [ ] **Grep de regressões:**
  ```
  rg "font-black|font-display.*italic|style=\\{\\{\\s*fontFamily" src/components/landing/ src/routes/index.tsx
  ```
  Resultado esperado: APENAS Hero H1 (index.tsx:1120) e FinalCTA H1 com italic. Zero `font-black`. Zero `fontFamily` inline.
- [ ] **Playwright screenshots** (mobile 375 + desktop 1440):
  - Hero
  - 3 sections-amostra (ArchetypeShowcase, HowItWorks, FAQ)
  - FinalCTA
- [ ] **Smoke RTL:** trocar idioma para AR e screenshot do Hero + FinalCTA — garantir que Noto Naskh continua aplicado e nenhuma classe nova quebra RTL.
- [ ] **Smoke PL/RO:** os 2 idiomas com texto mais longo — confirmar que remover `width: 290px` e `mx-[-10px]` não causou overflow.

---

## 4. Ordem de execução (sequencial — top-down conforme o visitante rola)

```
F0 (Foundation) → F1 (Hero) → F2 (BeliefBreak) → F3 (ProofBar)
→ F4 (Showcase) → F5 (HowItWorks) → F6 (Features)
→ F7 (Testimonials) → F8 (FAQ) → F9 (FinalCTA) → F10 (Validation)
```

Cada fase é independente (um arquivo por fase, exceto F1 que toca duas seções no mesmo arquivo). Posso parar entre fases para você revisar visualmente antes de continuar.

---

## 5. Estimativas

- **Arquivos tocados:** 9 (1 css + 1 routes/index.tsx + 7 componentes landing)
- **Tempo total:** ~75 min
- **Risco:** baixo — só mudanças de classe Tailwind, sem alteração de markup, lógica ou i18n
- **Bundle:** zero impacto (mesmas fontes já carregadas)
- **Impacto SEO:** zero — sem mudança de hierarquia semântica (H1/H2/H3)
- **Impacto conversão esperado:** + (hierarquia mais clara, menos italic = mais autoridade, melhor scan-readability mobile)

---

## 6. Fora de escopo desta fase (próximas iterações)

Depois que a Landing estiver 100%, replicar o mesmo contrato tipográfico em:
1. Quiz (stages identity/q/email/loader) — index.tsx:691–914
2. Reveal (stages reveal) — index.tsx:1338+ e `src/components/reveal/`
3. Sales (blocks restantes) — index.tsx:1276–1660
4. /obrigado
5. Dashboard (quando existir)

Cada uma vira um plano próprio seguindo o mesmo padrão D1/D2/D3/B1/B2/B3.

---

**Pronto para começar pela Fase 0?** Posso executar fase-a-fase com você revisando entre cada uma, ou rodar tudo em sequência (F0→F10) e te entregar o screenshot final para validação.
