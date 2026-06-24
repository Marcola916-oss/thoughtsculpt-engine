# Plano — Revisão Tipográfica Landing Page (v3)
## Regra-mãe: Syne 800 SÓ em TÍTULO. Subtítulos/quotes/punchlines caem para Syne 600 ou 700.

> **Por que v3:** a v2 aplicou Syne 800 em tudo que era "destaque" — incluindo quotes longas em cards estreitos (3 cards Nobel do BeliefBreak) e a punchline-eco. Resultado: texto entupido. A regra correta é: **Syne 800 é exclusivo de H1/H2/H3. Frases de apoio (subtítulo, quote, punchline, pergunta de FAQ) usam Syne 600 ou 700 conforme o espaço.**

---

## 1. Diretriz mestra (v3 — fonte da verdade)

| Nível | Uso | Fonte | Peso | Tamanho | Classe Tailwind canônica |
|---|---|---|---|---|---|
| **D1** | Hero H1 / FinalCTA H1 | Syne | **800** | `clamp(3rem,8vw,5.25rem)` | `font-display font-extrabold` (italic opcional só aqui) |
| **D2** | H2 — títulos de bloco | Syne | **800** | `clamp(1.75rem,4.5vw,2.75rem)` | `font-display font-extrabold uppercase` |
| **D3** | H3 — títulos de card | Syne | **800** | 1.125–1.5rem | `font-display font-extrabold` |
| **D4a** | Punchline / frase-eco (espaço folgado, frase curta) | Syne | **700** | 1.25–1.5rem | `font-display font-bold` |
| **D4b** | Quote destacada / pergunta longa em card (espaço apertado, texto longo) | Syne | **600** | 1–1.25rem | `font-display font-semibold` |
| **B1** | Body padrão | Inter | **400** | 1rem | `font-sans` |
| **B2** | Lead / parágrafo destacado | Inter | **500** | 1.125–1.25rem | `font-sans font-medium` |
| **B3** | UI / botão / badge / label | Inter | **600** | 0.75–0.875rem | `font-sans font-semibold uppercase tracking-[0.18em]` |
| **AR** | Árabe (RTL) | Noto Naskh Arabic | 400/700 | herdado | `[dir="rtl"] body` |

### Regra de bolso (D4a vs D4b)
> "Espaço folgado + frase curta → **Syne 700**. Espaço apertado + texto longo → **Syne 600**."
> Hierarquia D1/D2/D3 vem do **tamanho** (mesma fonte 800). D3 → D4 vem do **peso** (800 → 700/600).

### Proibições inegociáveis
1. **Zero Syne 800 em `<p>`, `<blockquote>`, quote, punchline, pergunta de FAQ** — Syne 800 é exclusivo de H1/H2/H3.
2. **Zero `font-black` (900) em Syne** — Syne só vai até 800 real; 900 é sintético/borrado.
3. **Zero `italic` em D2/D3/D4** — italic só em Hero H1 e FinalCTA H1.
4. **Zero `style={{ fontFamily }}` inline.**
5. **Zero `text-[XXpx]` arbitrário em H2** — usar a `clamp()` única da D2.
6. **Body padrão é Inter 400** (não 500). 500 é só "lead" destacado (B2). 600 é só UI/label (B3).

### Regra de ouro
> Todos os H2 de bloco usam: `font-display font-extrabold uppercase text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.1] tracking-[-0.02em]`. Diferenciação entre blocos vem do badge eyebrow, NÃO do peso/tamanho do título.

---

## 2. Auditoria pós-v2 — o que está pesado demais

### Mantém Syne 800 (gabarito correto)

| Arquivo | Elemento | Nível |
|---|---|---|
| `routes/index.tsx` Hero H1 | D1 | ✅ |
| `FinalCTA.tsx` H1 | D1 | ✅ |
| `ArchetypeShowcase.tsx` H2 (l.38) | D2 | ✅ gabarito |
| `Testimonials.tsx` H2 (l.29) | D2 | ✅ gabarito |
| `BeliefBreak.tsx` H2 (l.31) | D2 | ✅ |
| `FAQ.tsx` H2 (l.27) | D2 | ✅ |
| `ProofBar` / `HowItWorks` / `FeaturesGrid` H2 | D2 | ✅ |
| `ArchetypeShowcase.tsx` H3 cards (l.77) | D3 | ✅ |
| `FeaturesGrid.tsx` H3 cards | D3 | ✅ |
| `HowItWorks.tsx` H3 step | D3 | ✅ |

### REBAIXAR (Syne 800 onde não deveria)

| # | Arquivo | Elemento | Estado v2 | Ação v3 |
|---|---|---|---|---|
| 1 | `BeliefBreak.tsx:~41` | Punchline-eco "O problema não é o teu dinheiro…" | `font-extrabold` uppercase | **`font-bold` (Syne 700)** — D4a |
| 2 | `BeliefBreak.tsx:~67` | Quotes Nobel nos 3 cards | `font-extrabold` | **`font-semibold` (Syne 600)** — D4b |
| 3 | `FAQ.tsx:56` | Pergunta accordion | `font-extrabold` | **`font-bold` (Syne 700)** — D4a |

### Body — Inter volta para 400/500/600 (v2 estava 500/600/700)

| # | Arquivo | Elemento | v2 | v3 |
|---|---|---|---|---|
| 4 | `BeliefBreak.tsx:~38` intro `<p>` | B1 | `font-medium` | **remover** (default 400) |
| 5 | `BeliefBreak.tsx:~70` insight cards | B1 | `font-medium` | **remover** (400) |
| 6 | `FeaturesGrid.tsx` body cards | B1 | `font-medium` | **remover** (400) |
| 7 | `ArchetypeShowcase.tsx` sub (l.~46) | B2 lead | `font-medium` | ✅ manter 500 |
| 8 | `Testimonials.tsx` blockquote | B2 lead | `font-semibold` | ✅ manter 600 (lead destacado) |
| 9 | `Testimonials.tsx` nome autor | B3 | `font-bold` | **`font-semibold` (600)** |
| 10 | `Testimonials.tsx` arquétipo label | B3 | `font-bold` | **`font-semibold` (600)** |
| 11 | `ProofBar.tsx` labels | B3 | `font-bold` | **`font-semibold` (600)** |
| 12 | `FeaturesGrid.tsx` meta label | B3 | `font-bold` | **`font-semibold` (600)** |
| 13 | `ArchetypeShowcase.tsx` trigger label | B3 | `font-bold` | **`font-semibold` (600)** |
| 14 | Todos os badges eyebrow (`text-[11px] font-bold uppercase`) | B3 | `font-bold` | **`font-semibold` (600)** |

---

## 3. Foundation — fontes carregadas

`src/routes/__root.tsx` Google Fonts `<link>`:
- **Syne:** carregar **600, 700, 800** (hoje 700/800 — falta 600 para D4b/quotes)
- **Inter:** 400, 500, 600 (suficiente — v3 não usa 700/800 em body)
- **Noto Naskh Arabic:** 400/700 ✅

`src/styles.css`: trocar comentário-âncora para `/* === TYPOGRAPHY CONTRACT v3 === */` com a tabela completa.

---

## 4. Fases de execução

### F0 — Foundation
- `__root.tsx`: adicionar `wght@600` ao Syne.
- `styles.css`: comentário-âncora v3.

### F1 — BeliefBreak (crítico — é o bloco da imagem)
- Punchline (l.~41): `font-extrabold` → **`font-bold`** (700).
- Quotes Nobel cards (l.~67): `font-extrabold` → **`font-semibold`** (600).
- Intro + insight `<p>`: remover `font-medium` (default 400).

### F2 — FAQ
- Pergunta accordion (l.56): `font-extrabold` → **`font-bold`** (700).

### F3 — Demais blocos (rebaixar B3)
- `Testimonials.tsx`, `ProofBar.tsx`, `FeaturesGrid.tsx`, `ArchetypeShowcase.tsx`: trocar `font-bold` por `font-semibold` em badges/labels/eyebrows.
- `FeaturesGrid.tsx` body: remover `font-medium`.

### F4 — Validação
- `bun run build` → 0 erros.
- Grep:
  ```bash
  rg "font-extrabold" src/components/landing/    # esperado: SÓ em H1/H2/H3
  rg "font-black" src/components/landing/        # esperado: 0
  rg "italic" src/components/landing/            # esperado: só Hero/FinalCTA H1
  ```
- Playwright BeliefBreak (desktop 1440 + mobile 375). Critério: hierarquia visual H2 800 > Punchline 700 > Quotes 600.

---

## 5. Decisões confirmadas (2026-06-24)

1. ✅ Punchline-eco BeliefBreak → **Syne 700** (D4a).
2. ✅ Pergunta accordion FAQ → **Syne 700** (D4a).
3. ✅ Plano v3 atualizado. Aguardando "vai" para executar F0→F4.
