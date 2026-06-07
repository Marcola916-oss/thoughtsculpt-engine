# MindReset Landing — Smoke Test Report

**Data:** 2026-06-07
**URL testada:** https://thoughtsculpt-engine.lovable.app
**Cobertura:** 5 locales × 3 viewports = 15 screenshots + axe-core a11y + custom contrast audit

---

## ✅ O que PASSOU

### 1. Renderização das 9 seções
Todas as seções da Fase 5 estão deployadas e renderizam corretamente:
- Navbar (com seletor de idioma)
- Hero
- ProofBar (4 stats)
- ArchetypeShowcase (4 cards)
- HowItWorks (3 steps)
- FeaturesGrid (4 features)
- Testimonials (3 cards)
- FAQ (6 itens, accordion single-open)
- FinalCTA
- Footer

### 2. i18n em 5 locales
| Locale | htmlLang | dir | h2 detectado | Screenshot |
|---|---|---|---|---|
| PT | pt | ltr | "Qual é o teu padrão com dinheiro?" | pt-{mobile,tablet,desktop}.png |
| EN | en | ltr | "What's your pattern with money?" | en-{mobile,tablet,desktop}.png |
| PL | pl | ltr | "Jaki jest Twój wzorzec z pieniędzmi?" | pl-{mobile,tablet,desktop}.png |
| RO | ro | ltr | "Care este tiparul tău cu banii?" | ro-{mobile,tablet,desktop}.png |
| AR | ar | **rtl** | "ما هو نمطك مع المال؟" | ar-{mobile,tablet,desktop}.png |

**AR/RTL confirmado:** `document.documentElement.dir === "rtl"`.

### 3. FAQ accordion
- 6 itens renderizam
- Estado inicial: item 0 aberto (`aria-expanded="true"`)
- Single-item-open behavior funciona
- `aria-controls`/`aria-expanded` corretos

### 4. axe-core a11y
- 25 regras WCAG 2.1 AA passaram
- 1 violação `aria-hidden-focus` (não-crítico, hover effects)
- 0 violações color-contrast no conteúdo principal

### 5. Network
- 0 404s em recursos críticos
- Único 404: `favicon.ico` (cosmético, fácil de resolver)

---

## ❌ O que FALHOU (achados principais)

### 🔴 Achar #1 — Texto "apagado" em 16% da página (CONFIRMADO)

**Root cause:** Token de design `--muted-foreground: oklch(65% .01 250)` resolve para `#42474D` (66, 71, 77 RGB), que dá **2.23:1** sobre fundo preto. WCAG AA exige **4.5:1** para texto normal e **3.0:1** para texto grande.

**Impacto:** 22 elementos visíveis com `text-muted-foreground` em PT (16% de todos os textos). Padrão se repete em EN/PL/RO/AR (mesmo token, mesmo problema).

**Elementos afetados (PT, piores 5):**

| Texto (truncado) | Tamanho | Peso | Ratio | WCAG | Onde |
|---|---|---|---|---|---|
| "GATILHO: MEDO DE FALTAR" | 11px | 600 | 2.23 | ❌ FAIL | ArchetypeShowcase |
| "Acumula com obsessão..." | 14px | 400 | 2.23 | ❌ FAIL | ArchetypeShowcase |
| "8 perguntas. 3 minutos..." | 20px | 400 | 2.23 | ❌ FAIL | FinalCTA |
| "7 dias de garantia" | 12px | 600 | 2.23 | ❌ FAIL | FinalCTA |
| "Privacidade" | 14px | 400 | 2.23 | ❌ FAIL | Footer |

(Full list de 22+ elementos em `CONTRAST-AUDIT.md`)

### 🟡 Achar #2 — Token `--muted-foreground` precisa ajuste

**Local:** `src/styles.css` (CSS custom property)
**Valor atual:** `oklch(65% .01 250)` = `#42474D` (contrast 2.23:1)
**Valor recomendado:** `oklch(75% 0.005 250)` ≈ `#A8ACB0` (contrast ~7.0:1) — AAA em texto normal
**Ou mais conservador:** `oklch(70% 0.005 250)` ≈ `#878B8E` (contrast ~5.5:1) — AA passa

### 🟡 Achar #3 — Hover state da nav (`Mind`/`Reset`/`Entrar`)

axe-core marcou 3 elementos como "incomplete" (não consegue calcular por hover dependency):
- `<span class="text-white">Mind</span>` — cor branca, OK no estado base
- `<span class="text-arch-primary/80">Reset</span>` — vermelho a 80% opacity
- `<span>Entrar</span>` — botão com `hover:bg-white/10`

**Diagnóstico:** O `text-arch-primary/80` no logo "Reset" gera vermelho com alpha 0.8 sobre preto. Cor resolvida: `oklab(0.52 0.24 27 / 0.8)` = vermelho escuro (220, 30, 20 effective). Contrast: ~5:1 — passa AA mas não AAA. **Visualmente pode parecer "apagado" no logo.**

### 🟢 Achar #4 — favicon 404 (cosmético)

Console: `Failed to load resource: 404 @ /favicon.ico`

**Fix:** Adicionar `favicon.ico` em `public/` ou configurar `<link rel="icon" />` no head.

---

## 📊 Estatísticas Gerais

| Categoria | Resultado |
|---|---|
| Screenshots gerados | 15 (5 locales × 3 viewports) + 2 hover/baseline |
| Console errors | 1 (favicon 404) |
| Network 404s | 1 (favicon) |
| Network falhas | 2 POST analytics (Lovable internal, ignorável) |
| axe-core violations | 1 (aria-hidden-focus, não-bloqueante) |
| **Elementos com contrast FAIL** | **22 (16% da página)** |
| Locales renderizadas OK | 5/5 |
| Viewports renderizadas OK | 3/3 (mobile 375px, tablet 768px, desktop 1440px) |
| AR/RTL funcionando | ✅ |
| FAQ accordion interativo | ✅ |

---

## 🎯 Recomendações Priorizadas

### Prioridade ALTA (impacto direto na percepção do usuário)

1. **Mudar `--muted-foreground` token em `src/styles.css`** (1 linha)
   - De: `oklch(65% .01 250)` (~`#42474D`)
   - Para: `oklch(72% 0.005 250)` (~`#929698`) — ratio ~5.8:1 (AAA para texto grande, AA para texto normal)
   - Cobre os 22 elementos flagged em uma só mudança
   - **Antes de mergear:** validar com screenshots que o "mood" dark premium não foi perdido

### Prioridade MÉDIA (polish)

2. **Adicionar favicon** em `public/favicon.ico` ou configurar via `<link rel="icon" />`
3. **Aumentar opacidade do "Reset" no logo** (de `/80` para sem opacity ou `/95`) para alinhar com o "Mind" branco

### Prioridade BAIXA (nice-to-have)

4. **FAQ schema.org JSON-LD** para SEO rich snippets (especialmente em PL/RO/AR)
5. **Limpar chaves i18n mortas** no `translations.ts` (S.faq, S.socialProof, S.howItWorks)

---

## 📁 Arquivos gerados (não commitados)

- `tmp/smoke/00-baseline-lovable.png` — full page inicial
- `tmp/smoke/{pt,en,pl,ro,ar}-{mobile,tablet,desktop}.png` — 15 screenshots
- `tmp/smoke/pt-archetype-hover.png` — hover state de archetype card
- `tmp/smoke/SMOKE-TEST-REPORT.md` — este arquivo
- `tmp/smoke/CONTRAST-AUDIT.md` — auditoria detalhada por elemento
- `tmp/smoke/CSS-FIX-PROPOSAL.md` — diff CSS proposto
