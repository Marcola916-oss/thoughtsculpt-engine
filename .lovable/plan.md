# Plano — Revisão Tipográfica Completa da Landing Page (v2)
## Referência oficial: peso de "QUAL É O TEU PADRÃO INVISÍVEL?" / "QUEM JÁ ENTENDEU O SEU PADRÃO"

Entendi agora — invertido em relação ao que eu tinha assumido. Esses dois títulos (atualmente em Syne **800** / `font-extrabold`) são o **gabarito oficial**. O "O PROBLEMA NÃO É O TEU DINHEIRO" ficou **leve demais** (foi rebaixado pra 700) e precisa **voltar pra 800** pra casar com os outros.

---

## ⚠️ Nota técnica importante sobre "Syne 900"

Você escreveu **Syne 900** para Hero/H1. Tecnicamente:
- **Syne só existe oficialmente até 800 (ExtraBold)** no Google Fonts — não tem peso 900.
- Se eu colocar `font-weight: 900`, o browser **sintetiza** um falso negrito (fica borrado, anti-aliasing ruim, especialmente em telas Retina). Resultado pior, não melhor.
- Solução: Hero/H1 fica em **Syne 800** (o peso máximo real), mas **maior em tamanho** (`clamp(3rem,8vw,5.25rem)`) — a hierarquia vem do tamanho, não do peso falso.

**Confirma que posso usar Syne 800 + escala maior para Hero/H1?** É o caminho honesto. Se insistir em 900, eu aplico mas vai sair com peso sintético (qualidade visual pior).

---

## 1. Diretriz mestra (v2 — fonte da verdade)

| Nível | Uso | Fonte | Peso real | Tamanho | Classe Tailwind canônica |
|---|---|---|---|---|---|
| **D1** | Hero H1 / FinalCTA H1 | Syne | **800** (máx real) | `clamp(3rem,8vw,5.25rem)` | `font-display font-extrabold` (italic opcional só aqui) |
| **D2** | H2 — TODOS os títulos de bloco | Syne | **800** | `clamp(1.75rem,4.5vw,2.75rem)` | `font-display font-extrabold` |
| **D3** | H3 — sub-títulos / cards | Syne | **800** | `1.125–1.5rem` (18–24px) | `font-display font-extrabold` |
| **B1** | Body padrão | Inter | **500** | 1rem / 1.0625rem | `font-sans font-medium` |
| **B2** | Lead / quote / parágrafo destacado | Inter | **600** | 1.125–1.25rem | `font-sans font-semibold` |
| **B3** | UI / botão / badge / label | Inter | **700** | 0.75–0.875rem | `font-sans font-bold uppercase tracking-[0.18em]` |
| **AR** | Árabe (RTL) | Noto Naskh Arabic | 400/700 | herdado | `[dir="rtl"] body` (já existe) |

**Hierarquia D1 vs D2 vs D3:** mesma fonte (Syne 800), diferenciados por **tamanho** — não por peso. É exatamente o que você descreveu: "tamanhos menores de uma para outra".

**Body em Inter 500/600/700 (subiu de 400/500/600):** texto mais firme, mais "presente" no preto. Combina com a densidade dos H2 em 800.

### Proibições inegociáveis
1. **Zero `font-bold` (700) em H2/H3** — fica leve demais (foi o erro do BeliefBreak).
2. **Zero `font-black` (900) em Syne** — peso sintético, qualidade ruim.
3. **Zero `font-normal` (400) em body de marketing** — texto fica "raquítico" no preto. Mínimo é 500.
4. **Zero `italic` em H2/H3** — só Hero H1 e FinalCTA H1 (assinatura).
5. **Zero `style={{ fontFamily }}` inline.**
6. **Zero `text-[XXpx]` arbitrário em H2** — usar `clamp()` único.

### Regra de ouro
> TODOS os H2 de bloco da landing usam exatamente: `font-display font-extrabold uppercase text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.1] tracking-[-0.02em]`. Sem exceção. Diferenciação entre blocos vem da cor/decoração do badge eyebrow, NÃO do peso do título.

---

## 2. Auditoria atual — o que precisa mudar

### H2 de bloco (devem TODOS ficar em Syne 800)

| # | Arquivo | Estado atual | Ação |
|---|---|---|---|
| 1 | `ArchetypeShowcase.tsx:38` ("QUAL É O TEU PADRÃO INVISÍVEL?") | ✅ `font-extrabold` (Syne 800) | **Manter — é o gabarito** |
| 2 | `Testimonials.tsx:29` ("QUEM JÁ ENTENDEU O SEU PADRÃO") | ✅ `font-extrabold` (Syne 800) | **Manter — é o gabarito** |
| 3 | `BeliefBreak.tsx:31` ("O PROBLEMA NÃO É O TEU DINHEIRO") | ❌ `font-bold` (Syne 700) — leve demais | **→ `font-extrabold` (800)** + ajustar escala para `clamp(1.75rem,4.5vw,2.75rem)` |
| 4 | `HowItWorks.tsx` H2 | verificar | **→ `font-extrabold` (800) + remover width fixo** |
| 5 | `FeaturesGrid.tsx` H2 | verificar | **→ `font-extrabold` (800)** |
| 6 | `FAQ.tsx:27` | ✅ `font-extrabold` (Syne 800) | **Manter** |
| 7 | `ProofBar.tsx` (se tiver H2) | verificar | **→ `font-extrabold` (800)** |
| 8 | `routes/index.tsx` Pain Mirror H2 (~1183) | verificar | **→ `font-extrabold` (800)** |

### H1 — assinatura (Syne 800 + tamanho hero)

| # | Arquivo | Ação |
|---|---|---|
| 9 | `routes/index.tsx` Hero H1 (~1120) | Confirmar `font-extrabold`, escala `clamp(3rem,8vw,5.25rem)`, italic OK |
| 10 | `FinalCTA.tsx` H1 (~28) | Confirmar `font-extrabold`, italic OK |

### H3 cards (devem TODOS ficar em Syne 800)

| # | Arquivo | Estado | Ação |
|---|---|---|---|
| 11 | `ArchetypeShowcase.tsx:77` cards | `font-bold` (700) | **→ `font-extrabold` (800)** |
| 12 | `BeliefBreak.tsx` punchline + quote cards | `font-bold` (700) | **→ `font-extrabold` (800)** |
| 13 | `HowItWorks.tsx` H3 step | verificar | **→ Syne 800** |
| 14 | `FeaturesGrid.tsx` H3 cards | verificar | **→ Syne 800** |
| 15 | `FAQ.tsx:56` pergunta accordion | `font-bold` | **→ `font-extrabold` (800)** |

### Body — Inter 500/600/700

| # | Arquivo | O que mudar |
|---|---|---|
| 16 | Todos os `<p>` body padrão da landing | `font-normal`/`text-foreground/70` → `font-medium` (500) |
| 17 | Quotes/leads (Testimonials, BeliefBreak quote, sub-headlines) | `font-medium` → `font-semibold` (600) |
| 18 | Badges/labels/CTAs (B3) | confirmar `font-bold` (700) — já está em vários (`font-bold uppercase tracking-[0.18em]`) ✅ |

### Limpeza geral
- Remover qualquer `font-black` (900) restante
- Remover `italic` de qualquer H2/H3
- Remover larguras fixas (`style={{ width: "290px" }}`) e leading arbitrário (`leading-[35px]`)
- Consolidar escalas H2 numa única `clamp()`

---

## 3. Foundation — fontes carregadas

Verificar `src/routes/__root.tsx` Google Fonts URL:
- **Inter:** precisa carregar 500, 600, 700 (atualmente 400/500/600/700/800 — OK ✅)
- **Syne:** precisa carregar 800 (atualmente 700/800 — OK ✅, vamos remover 700 não usado)
- **Noto Naskh Arabic:** 400/700 — OK ✅

Ação: **remover Syne 700 do `<link>`** depois que tudo migrar pra 800. Economiza ~15kB de fonte.

---

## 4. Plano em fases (ordem de execução top-down)

Cada fase = 1 arquivo (ou seção contígua), build verde entre fases.

### **FASE 0 — Foundation** (5 min)
- `src/styles.css`: adicionar comentário-âncora `/* === TYPOGRAPHY CONTRACT v2 (Opção A) === */` com a tabela D1/D2/D3/B1/B2/B3 como referência permanente.
- Opcional: adicionar utilitários `@utility text-h2-block { @apply font-display font-extrabold uppercase text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.1] tracking-[-0.02em]; }` para reuso.

### **FASE 1 — Hero + Pain Mirror** (`src/routes/index.tsx`)
- Hero H1 (~1120): confirmar Syne 800 italic + escala `clamp(3rem,8vw,5.25rem)`
- Pain Mirror H2 (~1183): aplicar D2 padrão exato

### **FASE 2 — ProofBar** (`ProofBar.tsx`)
- Stats numéricos: Syne 800 sem italic (consolidar)
- Labels: Inter 600 uppercase (B2) ou 700 (B3) — definir baseado no tamanho
- H2 (se houver): D2 padrão

### **FASE 3 — BeliefBreak** (`BeliefBreak.tsx`) — **CRÍTICO**
- H2 linha 31: `font-bold text-[clamp(2rem,5vw,3.4rem)]` → **`font-extrabold text-[clamp(1.75rem,4.5vw,2.75rem)]`** (alinha com os outros blocos)
- Punchline (linha ~41): `font-bold` → `font-extrabold`
- Quote cards (linha ~67): `font-bold` → `font-extrabold`
- Intro `<p>` (linha ~38): `font-normal` → `font-medium` (B1)
- Badge tag: confirmar Inter 600/700

### **FASE 4 — ArchetypeShowcase** (`ArchetypeShowcase.tsx`)
- H2 (linha 38): ✅ manter `font-extrabold` (gabarito)
- H3 cards (linha 77): `font-bold` → `font-extrabold` (D3)
- Body cards (linha ~85): `font-normal` → `font-medium` (B1)
- Eyebrow + code: confirmar Inter 600/700

### **FASE 5 — HowItWorks** (`HowItWorks.tsx`)
- H2: → `font-extrabold` (D2) + remover width fixo se houver
- H3 step: → `font-extrabold` (D3) + remover italic
- Número do step: Syne 800 sem italic
- Descrição: Inter 500 (B1)

### **FASE 6 — FeaturesGrid** (`FeaturesGrid.tsx`)
- H2: → `font-extrabold` (D2)
- H3 cards: → `font-extrabold` (D3)
- Body: Inter 500 (B1)

### **FASE 7 — Testimonials** (`Testimonials.tsx`)
- H2 (linha 29): ✅ manter `font-extrabold` (gabarito)
- Quote (`<blockquote>`): `font-medium` → `font-semibold` (B2 — destaque)
- Nome autor: Inter 700 uppercase (B3) ✅
- Arquétipo label: Inter 600/700 (B3) ✅

### **FASE 8 — FAQ** (`FAQ.tsx`)
- H2 (linha 27): ✅ manter `font-extrabold` (gabarito) — remover `whitespace-pre-line` se causar quebra estranha
- Sub `<p>` (linha 36): `font-medium` ✅, considerar subir cor para `text-white/70`
- Pergunta accordion (linha 56): `font-bold` → `font-extrabold` (D3)
- Resposta accordion: `font-medium` ✅ (B1)
- CTA button text: Inter 700 (B3)

### **FASE 9 — FinalCTA** (`FinalCTA.tsx`)
- H1: confirmar `font-extrabold` italic + escala hero
- Sub-texto: Inter 500/600 (B1/B2)
- CTA: Inter 700 (B3)
- Guarantee row: Inter 500 (B1)

### **FASE 10 — Validação global**
- `bun run build` → zero erros novos
- `tsgo --noEmit` → zero erros
- Grep de regressões:
  ```bash
  rg "font-black" src/components/landing/ src/routes/index.tsx        # esperado: 0
  rg "font-bold[^-]" src/components/landing/ src/routes/index.tsx     # esperado: só em CTAs/badges (B3)
  rg "font-display.*italic" src/components/landing/ src/routes/index.tsx  # esperado: só Hero H1 e FinalCTA H1
  rg "font-normal" src/components/landing/                            # esperado: 0 (body mínimo é 500)
  rg "style=\{\{\s*fontFamily" src/components/landing/                # esperado: 0
  ```
- Remover Syne 700 do Google Fonts `<link>` em `src/routes/__root.tsx` (já não é usado em lugar nenhum)
- Screenshots Playwright (mobile 375 + desktop 1440) das 9 sections + scroll completo
- **Critério de aceite visual:** todos os H2 de bloco têm peso visual IDÊNTICO ao de "QUAL É O TEU PADRÃO INVISÍVEL?" e "QUEM JÁ ENTENDEU O SEU PADRÃO". Hero H1 e FinalCTA H1 ficam visivelmente maiores (mesmo peso, mas escala hero + italic).
- Smoke RTL (AR) + Smoke PL/RO (textos longos) — zero overflow

---

## 5. Ordem de execução

```
F0 (Foundation) → F1 (Hero+Pain) → F2 (ProofBar) → F3 (BeliefBreak ⚠️) →
F4 (Showcase) → F5 (HowItWorks) → F6 (Features) → F7 (Testimonials) →
F8 (FAQ) → F9 (FinalCTA) → F10 (Validação + remoção Syne 700)
```

Posso parar entre fases para você revisar, ou rodar F0→F10 direto e te entregar screenshots no final.

---

## 6. Estimativas

- **Arquivos tocados:** 10 (1 css + 1 routes/index.tsx + 1 __root.tsx + 7 componentes landing)
- **Tempo total:** ~60 min
- **Risco:** baixo — só Tailwind classes, zero markup/lógica/i18n alterados
- **Bundle:** -15kB (remoção Syne 700 não usado)
- **SEO:** zero impacto (hierarquia semântica inalterada)
- **Conversão esperada:** + hierarquia visual cristalina, autoridade máxima, peso consistente bloco-a-bloco

---

## 7. Decisões que preciso de você ANTES de "vai"

1. **Syne 900 → confirma usar Syne 800 + escala maior?** (alternativa: 900 sintético, qualidade pior)
2. **Body Inter 500 mínimo (vs 400 atual) — confirma?** Texto vai ficar visualmente mais "presente" e menos transparente. É mudança perceptível.
3. **Execução: tudo de uma vez (F0→F10) ou fase-a-fase com sua revisão entre cada?**

Responde essas 3 e eu executo.