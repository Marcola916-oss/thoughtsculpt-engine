
# Fase 2 — Landing Page reescrita (1 PR, sem mexer em backend)

Objetivo único: **visitor → quiz_start ≥ 65%** (hoje ~30-45%). Mantém Fase 1 intacta (preço, banner recovery, analytics, getLocalPrice).

---

## Princípios da fase

- **Só toca em UI da landing pré-quiz** (`stage === "hero"`). Funil 0–14 fica congelado para Fase 3+.
- **Copy da Bible V2 é a fonte de verdade** — nada de paráfrase. "SABOTANDO" é literal.
- **5 idiomas em paridade total antes do merge.** Sem chave faltando = build quebra (script `i18n-sync` da Fase 1).
- **Dispara `track(EVENTS.LANDING_VIEW)`** no mount do hero e `track(EVENTS.QUIZ_START)` em todos os CTAs que setam stage `identity`.
- **Preço local via `getLocalPrice` da Fase 1** já visível na landing (Hero subtítulo + FinalCTA) para reduzir surpresa no checkout.

---

## Ordem de execução (1 PR, 5 commits lógicos)

### Commit 1 — Hero V2 (`src/components/landing/Hero.tsx` — novo)

Extrai o hero inline de `src/routes/index.tsx:258-280` para componente dedicado.

- **H1** Syne 800, 56px desktop / 36px mobile:
  > "Seu cérebro tem um padrão que está **SABOTANDO** suas finanças."
  - `SABOTANDO` em `text-arch-primary` com glow `text-shadow: 0 0 24px rgba(204,0,0,0.5)`.
- **Sub** Inter 20px / 16px mobile, `text-foreground/75`:
  > "Não é falta de força de vontade. É um arquétipo comportamental que você nunca soube que tinha."
- **MarbleBust** central já existente — manter, com glow vermelho + neblina via `Atmosphere fog="dramatic"`.
- **CTA primário**: PrimaryButton vermelho 18/700, padding 18×36, glow `0 0 20px rgba(204,0,0,0.4)`, hover `translateY(-2px) + glow-strong`, click `scale(0.97) 100ms`. Texto: "Quero descobrir meu arquétipo →".
- **Microcopy** abaixo: "⚡ 3 minutos · 100% gratuito · Resultado imediato".
- **Sem CTA secundário** acima da dobra (remove distração).

### Commit 2 — Quebra de crença (`src/components/landing/BeliefBreak.tsx` — novo)

Nova section entre `ProofBar` e `ArchetypeShowcase`. Layout asymmetric 60/40.

- **H2**: "Por que planilhas e apps de orçamento não funcionam para você."
- **3 cards horizontais** com nome + 1 linha:
  - **Kahneman** — "90% das decisões financeiras são automáticas, não racionais."
  - **Thaler** — "Você gasta diferente conforme a origem do dinheiro — sem perceber."
  - **Ariely** — "Pequenas escolhas previsíveis destroem grandes planos."
- **Punch line** Syne 800 32px: "O problema não é o teu dinheiro. É o teu padrão."
- Reveal.Group stagger 80ms.

### Commit 3 — ArchetypeShowcase, ProofBar, Testimonials, FinalCTA — alinhamento Bible

- **ArchetypeShowcase**: trocar copy dos 4 cards para os nomes provocativos Bible:
  - Acumulador Obsessivo · Buscador de Status · Alienado Financeiro · Hedonista Impulsivo
  - 1 linha de descrição cada (já curta da Bible).
- **ProofBar**: substituir números genéricos por "**14.832** diagnósticos · **4** países · Desde **2025**". Animar contadores leve (CountUp on intersect).
- **Testimonials**: 3 depoimentos curtos da Bible com país + arquétipo (PT/PL/RO/BR ou US).
- **FinalCTA**: headline urgência Bible + mesmo CTA do Hero + microcopy de preço local (`getLocalPrice` → "Diagnóstico completo por R$ 49,90 / $9.90 / etc.").

### Commit 4 — Limpeza de distração

- Auditar `TopBar` e remover qualquer link externo/secundário acima da dobra (manter só logo + LanguageSwitcher).
- Remover `HowItWorks` e `FeaturesGrid` da landing pré-quiz **OU** movê-los para baixo dos testemunhos (decisão no Gate 2 baseado em altura mobile). Recomendação: manter, mas comprimir altura.
- Auditar `FAQ` — só 3 perguntas (objeções top, não FAQ longo).
- Validar que **não há scroll horizontal em 375px**.

### Commit 5 — i18n + analytics + instrumentação

- Adicionar chaves `landing.hero.*`, `landing.belief.*`, `landing.archetypes.*`, `landing.proof.*`, `landing.testimonials.*`, `landing.faq.*`, `landing.cta.*` em `src/lib/i18n/types.ts` + `translations.ts` (PT/EN/PL/RO/AR).
- Revisar AR culturalmente (zero referência a juros/riba; "SABOTANDO" = "يُخرّب" não "يُدمّر").
- `track(EVENTS.LANDING_VIEW, { lang, country })` no mount do Hero.
- `track(EVENTS.QUIZ_START, { source: 'hero' | 'final_cta' | 'sticky' })` em cada CTA.
- Carregar `getLocalPrice` em paralelo (useQuery), mostrar skeleton até resolver.

---

## Gate 2 — Critérios objetivos antes de avançar para Fase 3

| # | Critério | Como medir |
|---|---|---|
| G2.1 | Build verde | `tsgo --noEmit` + `npm run build` |
| G2.2 | Lighthouse mobile Perf ≥ 90 | Chrome DevTools → device emulation 375x667 |
| G2.3 | Contraste AA em todas as superfícies novas | `contrast-audit` tool sobre #000 + #1A1A1A |
| G2.4 | 375 / 768 / 1440 sem scroll horizontal e com hierarquia preservada | Visual diff |
| G2.5 | i18n-sync verde nos 5 idiomas | Script local |
| G2.6 | PostHog (ou console em dev) recebendo `landing_view` + `quiz_start` | DevTools console |
| G2.7 | `getLocalPrice` renderiza preço local correto em PT/EN | Preview test BR/US |
| G2.8 | Banner de recovery da Fase 1 não conflita com Hero novo | Testar `?canceled=1&recover=test-id` |

---

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| MarbleBust + Atmosphere derruba Lighthouse mobile | `use-device-tier` desativa fog em low-tier; lazy MarbleBust |
| Glow vermelho no H1 falha contraste AA sobre preto puro | Testar `text-shadow` glow não conta como cor de texto; texto base permanece #F5F5F7 |
| Copy "SABOTANDO" em AR (RTL) quebra alinhamento | Validar com `dir="rtl"` antes do merge; usar `unicode-bidi: isolate` se preciso |
| `BeliefBreak` adiciona muita altura mobile | Comprimir para 1 card por linha em <768px com swiper horizontal opcional |
| ArchetypeShowcase nomes novos quebram chaves Reveal existentes | Manter ids dos cards; só trocar strings |

---

## Estimativa de impacto

- Hero V2 (headline + glow + first-person CTA) → **+8-12pp**
- Quebra de crença (Kahneman/Thaler/Ariely) → **+3-5pp**
- Preço local visível pré-checkout → **+2-3pp**
- Limpeza de distração + microcopy → **+2pp**
- **Total esperado:** visitor→quiz_start de ~40% → **~57-62%**. Restante alcançado em Fase 3 (quiz auto-advance + Reveal multi-área).

---

## Entregáveis ao final da Fase 2

1. `src/components/landing/Hero.tsx` novo (extraído + V2).
2. `src/components/landing/BeliefBreak.tsx` novo.
3. `ArchetypeShowcase`, `ProofBar`, `Testimonials`, `FinalCTA`, `TopBar` refinados.
4. Chaves `landing.*` completas em 5 idiomas.
5. PostHog/console capturando `landing_view` + `quiz_start`.
6. `getLocalPrice` consumido na landing.
7. Lighthouse mobile baseline registrado em `tmp/audit/LH-FASE2.md`.

**Próximo passo:** aprovar este plano → começo pelo Commit 1 (Hero V2) e mando para revisão antes de seguir para o Commit 2.
