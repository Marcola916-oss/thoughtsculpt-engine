
# Plano Mestre — Revisão Final MindReset para Conversão ≥30%

Unifica Mensagem 1 (auditoria geral em 8 etapas) + Mensagem 2 (Conversion Bible V2 com 14 telas, gatilhos, copy exato, design tokens). Execução em **6 Fases sequenciais** com gates de aprovação entre elas.

---

## Princípios não-negociáveis (valem para TODAS as fases)

1. **Conversão > tudo.** Cada PR responde: "isso aumenta a chance da pessoa comprar?" Se não → fora.
2. **Funil de 14 telas é a verdade.** Landing → 0 Identidade → 1–8 Quiz → 9 Email → 10 Loader → 11 Reveal → **12 VSL (nova)** → 13 Checkout → 14 Thank-You + Upsell.
3. **Identidade visual fixa:** preto #000, vermelho #CC0000 com glow, Syne 800 display + Inter body, MarbleBust central. Nada de roxo, nada de Inter no hero.
4. **First-person CTAs sempre.** "Quero meu X" (não "Receba seu X"). +94% conversão.
5. **Mobile-first.** Touch ≥44px, font ≥16px em inputs, single column <768px.
6. **i18n 5 idiomas em paridade total.** PT/EN/PL/RO/AR. Toda copy nova entra nas 5 antes do merge. AR = RTL + Noto Naskh.
7. **Sem regressão.** `npm run build` limpo + 0 erros TS novos + contrast AA + i18n-sync ok antes de cada gate.

---

## FASE 0 — Diagnóstico congelado (1 sessão, sem código)

Objetivo: travar o ponto de partida antes de mexer em nada.

1. Auditoria estado atual:
   - Listar discrepâncias entre funil atual e os 14 alvos (sei que faltam: Tela 12 VSL completa, Order Bumps na VSL, Exit Intent, Upsell pós-compra, Reveal multi-área).
   - Rodar `npm run build`, snapshot do bundle, snapshot de Lighthouse mobile.
   - Conferir Stripe live: webhook, success_url, statement_descriptor, Apple/Google Pay domain.
   - Conferir chain IA (Groq → Gemini → Cerebras → OpenRouter) com 1 geração real por idioma.
   - Conferir PDF: gerar 1 por arquétipo×idioma e abrir.
2. Entregável: `tmp/audit/PRE-LAUNCH-AUDIT.md` com lista de gaps numerados (vira backlog das fases seguintes).
3. **Gate 0:** usuário aprova lista de gaps antes da Fase 1.

---

## FASE 1 — Fundação técnica e infra de conversão (silenciosa, 1 PR)

Objetivo: instrumentar tudo que precisa estar pronto antes de mexer em UI.

1. **Analytics** (`src/lib/analytics.ts`): PostHog events padronizados:
   `landing_view, quiz_start, quiz_question_answered, quiz_completed, email_submitted, reveal_view, vsl_view, vsl_scroll_depth, bump_toggled, checkout_cta_clicked, stripe_session_created, purchase_completed, upsell_view, upsell_accepted, exit_intent_shown, exit_intent_recovered`.
2. **Cancel/recover**: rota `/?canceled=1&recover={orderId}` já planejada na Opção A — implementar banner de recuperação no `index.tsx`.
3. **Pricing por IP**: server fn `getLocalPrice` retorna `{ currency, amount, formatted, stripe_price_id }` por país via `cf-ipcountry` no header (Cloudflare Worker). Fallback navegador.
4. **Stripe checks**: validar webhook idempotente, adicionar domínio `thoughtsculpt-engine.lovable.app` no Apple Pay (ação manual do user — listar no gate).
5. **i18n util `i18n-sync`**: rodar no CI implicitamente (script local) — bloquear PRs com chaves faltando.
6. **Gate 1:** build verde + Lighthouse mobile baseline registrado + Stripe live com 1 compra de teste end-to-end.

---

## FASE 2 — Landing Page reescrita (1 PR grande)

Objetivo: levar visitante → quiz a ≥65%.

1. **Hero** (`src/components/landing/Hero.tsx` — novo ou refatorar atual):
   - H1 Syne 800 56/36px: "Seu cérebro tem um padrão que está **SABOTANDO** suas finanças." (variants PT/EN/PL/RO/AR).
   - Sub Inter 20px com reframe "Não é falta de força de vontade…".
   - MarbleBust central com glow vermelho + neblina (já existe Atmosphere).
   - CTA vermelho 18/700, padding 18×36, glow `0 0 20px rgba(204,0,0,0.4)`, hover translateY(-2px) + glow forte, click scale(0.97).
   - Microcopy "⚡ 3 minutos · 100% gratuito · Resultado imediato".
2. **ArchetypeShowcase** (existente) — revisar copy para os 4 nomes provocativos da Bible (Acumulador Obsessivo, Buscador de Status, Alienado Financeiro, Hedonista Impulsivo) com 1 linha cada.
3. **Quebra de crença** (nova section): "Por que planilhas e apps não funcionam para você" + Kahneman/Thaler/Ariely.
4. **ProofBar** existente — trocar números genéricos por "14.832 diagnósticos · 4 países · Desde 2025" (contador animado leve).
5. **Testimonials** existente — 3 depoimentos curtos com país + arquétipo (manter copy V2).
6. **FinalCTA** existente — headline urgência + botão máximo.
7. **Remover** qualquer link externo e secundário que distraia (auditar TopBar/Footer).
8. **Mobile**: validar 375px, touch targets, sticky CTA bottom opcional.
9. **i18n**: chaves `landing.*` atualizadas nas 5 línguas, AR revisado culturalmente.
10. **Gate 2:** review visual em 375/768/1440 + Lighthouse Perf ≥90 mobile + contrast AA + PostHog `landing_view`+`quiz_start` disparando.

---

## FASE 3 — Funil Quiz (Telas 0–11) — alinhar 100% à Bible (1–2 PRs)

Objetivo: completion ≥75%, email gate ≥80%, reveal→VSL ≥75%.

### 3.1 — Tela 0 Identidade
- Auto-focus nome, 3 botões de gênero, continuar só ativa com ambos preenchidos. Sem progress bar.

### 3.2 — Telas 1–8 Quiz
- 1 pergunta/tela, **auto-advance 150ms** (remover botão "próximo" se existir).
- Progress bar fixa top, 5px, #CC0000, glow pulsante, incrementos 12/23/33/43/52/61/70/78%.
- `[NOME]` em todas as 8 headlines, concordância de gênero m/f/n.
- Slide-right 300ms entre perguntas (já temos PageTransition — confirmar direção).
- Substituir copy das 8 perguntas + scoring exato da Bible (AO/SS/EA/HI +2). Tiebreaker Q8 → Q5.
- Tracking de **arquétipo secundário** (2º maior) — atualizar `quiz/scoring.ts` para retornar `{ primary, secondary, scores }`.
- Persistir `email + name + gender + scores + primary + secondary` em `leads` (Supabase) no Email Gate.

### 3.3 — Tela 9 Email Gate
- Resultado borrado (blur 20px, opacity 30%) ao fundo — tensão Zeigarnik.
- Progress 90%, headline "[NOME], seu diagnóstico está pronto.", checkbox LGPD obrigatório.
- CTA "Revelar Meu Arquétipo →" + "🔒 Sem spam".

### 3.4 — Tela 10 Loader (3s)
- Bust rotacionando + anel SVG stroke 0→100% em 3s + 4 textos fade 700ms (último com `[NOME]`).
- Progress 95%. **Nenhuma** chamada de API real aqui (a IA roda em paralelo desde o submit do email).
- Transição flash vermelho 600ms.

### 3.5 — Tela 11 Reveal — UPGRADE PROFUNDO
- Cascata: subtítulo → typewriter 50ms/char no nome (#CC0000 Syne 52px) → ícone scale → 3 linhas (dor primária, custo oculto, gancho multi-área **trabalho+amor+autoestima**, não só dinheiro) → CTA primary (first-person por arquétipo, copy exata da Bible) → CTA secundário "Compartilhar meu arquétipo".
- CTA primary navega para Tela 12 (VSL).
- **Gate 3:** funil 0→11 medido com PostHog em produção shadow, completion ≥70% em 50 sessões reais.

---

## FASE 4 — Tela 12: Página de Vendas (VSL) — CRIAÇÃO DO ZERO (PR maior do projeto)

Objetivo: reveal → checkout ≥45%. **Esta tela hoje não existe — é o maior gap.**

Estrutura `src/components/sales/SalesPageV2.tsx` (substitui `VSL.tsx`), montada numa rota nova `/diagnostico` ou estágio `vsl` do funil (decidir — recomendo estágio, não rota, para preservar estado).

Blocos (ordem fixa):
1. **B1 Emotional Anchor** (above fold): validação + ponte + CTA.
2. **B2 Pain Mirror**: checklist 6 situações com ✗ vermelho.
3. **B3 Scientific Breakthrough**: Kahneman/Thaler/Ariely.
4. **B4 Produto 4D**: grid 2×2 — Financeiro/Profissional/Amor/Pessoal.
5. **B5 Value Anchor**: $200 consulta vs $9.90.
6. **B6 Social Proof**: contador + 3 depoimentos detalhados (com arquétipo).
7. **Order Bump 1** (entre B6 e B7): "Guia de Relações +$4.99", checkbox unchecked, badge "MAIS PEDIDO".
8. **B7 Preço + CTA**: strikethrough $200 / $47 / **preço local IP**, botão máximo, microcopy seg.
9. **B8 FAQ**: 4 objeções (genérico? entrega? vs apps? garantia?).
10. **B9 Final CTA**: urgência + botão máximo + "[NOME], você é [PRIMARY] com traço de [SECONDARY]".
11. **Order Bump 2** (após B9): "Protocolo 30 Dias +$14" como seção separada com link "Não, prefiro descobrir sozinho".

Componentes auxiliares:
- **StickyNavbar VSL** (aparece após scroll do hero, slide-down 400ms).
- **ExitIntentModal** (desktop: mouseleave top; mobile: history popstate). Copy V2 com `[NOME]/[ARQUÉTIPO]`, botão "Quero entender meu padrão →" + link negativo "Prefiro sair sem descobrir".
- **AnimatedCounter** para diagnósticos (CountUp em viewport).

i18n: `sales.*` keys completas em 5 idiomas (volume grande — ~12k chars). AR revisado.

**Gate 4:** VSL renderiza com `[NOME]` + `[ARQUÉTIPO]` + preço local. Exit intent funcional. Bumps enviam payload correto ao checkout. Lighthouse Perf ≥85 mobile.

---

## FASE 5 — Checkout (Tela 13) + Thank-You + Upsell (Tela 14) (1 PR)

Objetivo: checkout abandono <30%, upsell take-rate 15–20%.

### 5.1 — Tela 13 Checkout
- **Decisão crítica reaberta**: Stripe Checkout hosted (Opção A já implementada) **vs** Stripe Elements embedded com identidade MindReset (preto, sem redirect).
- A Bible exige **embedded com identidade preservada**. Recomendação: manter Opção A por **velocidade + Apple/Google Pay automático**, mas **personalizar a página intermediária `CheckoutStub`** para parecer parte do funil (já feito). Documentar trade-off para o usuário decidir no Gate 5.
- Se embedded: implementar Stripe Elements em `CheckoutStub` com PaymentElement, 3DS auto, capturar AP/GP via PaymentRequest API.
- Resumo do pedido com itens + bumps marcáveis no próprio checkout (mudam o total live).
- Headline "Quase pronto, [NOME]." + selos SSL/Stripe/Visa/MC/Amex + garantia 7d.

### 5.2 — Tela 14 Thank-You + Upsell
- Checkmark verde animado scale 0→1.2→1 + confete vermelho sutil.
- Headline "✅ Diagnóstico confirmado, [NOME]!" + "Enviamos para [EMAIL]".
- **Upsell aparece após 2s**: Protocolo 30 Dias +$14, botão vermelho + link negativo "Não, só quero o diagnóstico que já comprei". One-click via saved payment method (Stripe `setup_future_usage: off_session` no checkout principal).
- Seção "O que você comprou" com cards.
- Seção "Como usar" 4 passos.
- Suporte por email.

**Gate 5:** compra de teste real (cartão Stripe live) → PDF chega no email em ≤60s → upsell aceito → segundo PDF chega.

---

## FASE 6 — Polimento, QA e go-live (1 PR + checklist manual)

1. **Checklist pré-lançamento da Bible Parte 13** — executar 100% dos itens (landing, telas 0–14, mobile, i18n, legal, performance).
2. **Cross-browser**: Chrome, Safari iOS, Safari macOS, Firefox, Samsung Internet. Verificar Atmosphere em GPU fraca (use `use-device-tier` para degradar).
3. **Lighthouse mobile**: Perf ≥90, A11y ≥95, SEO ≥95.
4. **A11y**: contrast AA em todas as superfícies (vermelho #CC0000 sobre preto = AA pass; verificar sobre #1A1A1A). aria-labels, focus-visible, reduced-motion.
5. **AR/RTL**: passar todo o funil em árabe — verificar bust não vira, progress bar inverte direção, typewriter funciona em RTL.
6. **Stripe modo live**: webhook secrets corretos, statement_descriptor "MINDRESET", Apple Pay domain registrado.
7. **PostHog dashboard**: funil 14 etapas montado, conversão ponta-a-ponta visível.
8. **Legal**: footer com Privacy + Terms em todas as telas, disclaimer IA no PDF, LGPD/GDPR checkbox no email gate.
9. **Backup**: snapshot do banco antes do go-live. Plano de rollback (revert do último deploy via Lovable).
10. **Gate 6 / GO-LIVE:** usuário aprova checklist completo → publish.

---

## Ordem de execução e dependências

```text
Fase 0 (audit) ──► Fase 1 (infra) ──► Fase 2 (landing) ──► Fase 3 (quiz)
                                                                  │
                                                                  ▼
                              Fase 6 (QA) ◄── Fase 5 (checkout+TY) ◄── Fase 4 (VSL)
```

Paralelizável dentro de cada fase: copy i18n (PT/EN/PL/RO/AR) podem ir em commits separados após estrutura pronta.

---

## Estimativa de impacto por fase (baseada em benchmarks da Bible)

| Fase | Gap atual | Lift esperado | Conversão acumulada |
|---|---|---|---|
| Baseline | — | — | ~5–8% |
| Fase 2 (landing) | hero genérico | +visitor→quiz para 65% | ~10–12% |
| Fase 3 (quiz + reveal multi-área) | reveal só fala de dinheiro | +reveal→sales para 75% | ~15–18% |
| Fase 4 (VSL nova) | **inexistente** | +sales→checkout para 45% | ~22–26% |
| Fase 5 (checkout otimizado + upsell) | upsell ausente | +AOV +5–10%, +abandono ↓ | ~26–30% |
| Fase 6 (QA + mobile + Apple Pay) | mobile abandono alto | +mobile conv +20% | **≥30%** alcançável |

---

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Stripe Elements embedded quebra Apple/Google Pay | Manter Opção A (hosted otimizado) como fallback — decidir no Gate 5 |
| VSL gigante derruba Lighthouse mobile | Code-split por bloco, lazy-load imagens, AnimatedCounter on intersect |
| AR/RTL quebra typewriter ou bust | Testar Fase 3 em AR antes de Fase 4; usar `dir="ltr"` localizado em typewriter se necessário |
| Tráfego YouTube desqualificado | Conversão real <30% mesmo com tudo ok — não é problema de produto, é de fonte. Documentar para o user |
| IA chain falha em pico | Cache pré-gerado por arquétipo×idioma já existe; fallback para PDF genérico personalizado só com nome+scores |
| Webhook Stripe duplicado | Idempotência por `event.id` em tabela `stripe_events` |

---

## Entregáveis ao final

1. Funil de 14 telas 100% alinhado à Conversion Bible V2.
2. i18n paridade total 5 idiomas (PT/EN/PL/RO/AR).
3. Stripe live com Apple/Google Pay + bumps + upsell one-click.
4. PostHog funil 14 etapas medindo conversão real.
5. Checklist Bible Parte 13 100% verde.
6. Lighthouse mobile ≥90 Perf, ≥95 A11y/SEO.
7. Compra teste end-to-end <90s do landing à entrega do PDF por email.

---

**Próximo passo:** aprovação deste plano. Após aprovado, abro a **Fase 0 (audit congelado)** e te devolvo `tmp/audit/PRE-LAUNCH-AUDIT.md` com a lista numerada de gaps reais antes de tocar em qualquer código.

Aprovas para começar pela Fase 0?
