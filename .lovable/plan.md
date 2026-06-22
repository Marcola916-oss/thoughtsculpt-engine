# Fase B — Funil de Vendas Premium

## Objetivo
Transformar a landing atual (focada em SaaS de finanças) num funil one-shot de diagnóstico comportamental cobrindo 4 áreas (Dinheiro, Carreira, Amor, Pessoal), com VSL de 8 blocos, reveal premium e checkout stub pronto para a Fase D plugar Stripe Elements.

## Princípios de execução
- Mantém o que já está excelente: Atmosphere, MarbleBust, quiz visual, identidade preto/#CC0000, micro-interações, i18n 5 idiomas.
- Sem auth, sem dashboard, sem localStorage. Estado em memória + Supabase (leads/orders na Fase D).
- Toda copy nova entra nos 5 idiomas (PT/EN/PL/RO/AR-RTL) na mesma PR.
- Build limpo, zero novos erros TS/lint, responsivo 375/1440, contraste AA.

## Arquitetura do funil (estágios em `src/routes/index.tsx`)

```text
hero (landing 9 blocos)
  └─ CTA "Iniciar diagnóstico"
       ↓
identity  → nome + idade (já existe, manter)
       ↓
quiz      → 8 perguntas (já existe, ajustar copy p/ 4 áreas)
       ↓
email     → captura email (lead salvo na Fase D)
       ↓
loader    → NeuralLoader 3-4s com textos rotativos das 4 áreas
       ↓
reveal    → arquétipo + 4 mini-cards (Dinheiro/Carreira/Amor/Pessoal)
       ↓
vsl       → 8 blocos de venda (novo, abaixo)
       ↓
checkout  → stub visual (Fase D vira Stripe Elements)
```

## Bloco VSL (novo componente `src/components/sales/VSL.tsx`)

Estrutura em 8 sub-seções, cada uma `<Reveal>` + Atmosphere local quando fizer sentido:

1. **Âncora emocional** — H1 do arquétipo revelado + sub citando as 4 áreas em colapso. MarbleBust à esquerda.
2. **Espelho de dor** — 4 cards (1 por área) com sintomas específicos do arquétipo do lead. Texto personalizado via template `{name}`.
3. **Revelação científica** — bloco editorial (Syne 800) explicando o método dos 4 arquétipos. Badges com "neurociência comportamental", "psicologia financeira", "8 anos de pesquisa".
4. **O produto** — mockup do PDF (placeholder visual por enquanto; Fase C gera real). Lista do que vem dentro: diagnóstico 4 áreas, plano de ação, mapa de relações.
5. **Prova social** — 3 testimonials novos (não os atuais), citando transformação nas 4 áreas. Avatar gradiente por arquétipo.
6. **Oferta + preço** — preço local (USD/BRL/PLN/RON/SAR detectado por idioma como proxy até Fase D), 2 order bumps visíveis: $4.99 Guia de Relações + $7.99 Protocolo 30d. CTA gigante.
7. **FAQ** — 6 perguntas focadas em objeções de compra one-shot (entrega, idioma, segurança Stripe, reembolso, é só financeiro?, funciona pra mim?).
8. **CTA Final** — urgência ("seu diagnóstico está pronto há {tempo}"), botão único, garantia Stripe + 7 dias.

## Reveal premium (refazer `Reveal` stage do `index.tsx`)

- Typewriter no nome do arquétipo (1 char / 50ms) — já existe lógica, manter.
- Abaixo: 4 mini-cards horizontais (Money/Career/Love/Personal) com:
  - Ícone Lucide (Coins/Briefcase/Heart/Sparkles)
  - Score (0–100) calculado a partir do `scoreAnswers` existente normalizado
  - 1 linha de diagnóstico curto por área (template fixo por arquétipo)
  - Barra de progresso animada (`transition: width 0.8s ease-out`)
- CTA "Ver diagnóstico completo" → desce para o VSL com `scrollIntoView`.

## Quiz — ajustes mínimos
- Manter as 8 perguntas e scoring (já cobre os 4 arquétipos).
- Revisar copy de cada pergunta para incluir gatilhos das 4 áreas (não só dinheiro). Ex.: Q6 ("sentimento dominante") já é universal; Q3 ("futuro") idem. Apenas trocar exemplos em Q1, Q4, Q5 para misturar carreira/amor/pessoal.
- Sem mudança no `scoring.ts`.

## Captura de email (novo `stage="email"`)
- Tela minimalista: MarbleBust pequeno + headline "Para onde enviamos seu diagnóstico?" + input email + botão.
- Validação client-side (regex + zod inline).
- Persistência: stub em memória agora; Fase D salva em `quiz_leads` no Supabase via server fn.
- i18n nas 5 línguas.

## Landing pré-quiz (`stage="hero"`)
Manter os 9 blocos atuais (ProofBar, ArchetypeShowcase, HowItWorks, FeaturesGrid, Testimonials, FAQ, FinalCTA), mas:
- **ArchetypeShowcase**: trocar copy de cada arquétipo para citar as 4 áreas, não só dinheiro.
- **FeaturesGrid**: reescrever para falar do PDF entregue (4 seções), não de ferramentas SaaS.
- **HowItWorks**: 3 passos = Quiz (2min) → Email → PDF entregue.
- **Hero H1**: novo headline "Descubra o padrão invisível que sabota suas 4 áreas da vida".
- **FAQ**: trocar para perguntas de produto one-shot.

## Checkout stub (`stage="checkout"`)
Componente visual completo, sem Stripe ainda:
- Resumo do pedido (Diagnóstico $9.90 + bumps toggle)
- Total dinâmico
- Campos fake (card, nome, email já preenchido)
- Botão "Pagar $X.XX" → simula sucesso → vai pra `/obrigado`
- Fase D substitui pelos componentes Stripe Elements reais sem mudar o layout.

## i18n
Novas chaves em `src/lib/i18n/translations.ts`:
- `vsl.block1` … `vsl.block8`
- `reveal.areas.{money|career|love|personal}.{label|description.{AO|SS|EA|HI}}`
- `email.{title|placeholder|cta|validation}`
- `checkout.{summary|bump1|bump2|total|payButton|secureBy}`
- `landing.*` revisado (headlines + ArchetypeShowcase + FeaturesGrid + HowItWorks + FAQ)
- Tudo nos 5 idiomas. AR validado RTL.

## Arquivos afetados (estimativa)
**Novos**
- `src/components/sales/VSL.tsx` (orchestrator dos 8 blocos)
- `src/components/sales/VSLBlock.tsx` (wrapper genérico)
- `src/components/sales/PdfMockup.tsx` (visual do produto)
- `src/components/sales/PricingCard.tsx`
- `src/components/sales/OrderBumps.tsx`
- `src/components/sales/index.ts`
- `src/components/reveal/AreaScoreCard.tsx`
- `src/components/funnel/EmailCapture.tsx`
- `src/components/funnel/CheckoutStub.tsx`
- `src/lib/funnel/area-scores.ts` (deriva 4 scores a partir do `scoreAnswers`)
- `src/lib/funnel/pricing-stub.ts` (moeda por idioma — placeholder Fase D)

**Editados**
- `src/routes/index.tsx` (orquestração dos estágios, remoção do `Sales` antigo)
- `src/lib/i18n/types.ts` (Dict expandido)
- `src/lib/i18n/translations.ts` (chaves novas em 5 idiomas)
- `src/components/landing/ArchetypeShowcase.tsx` (copy + 4 áreas)
- `src/components/landing/FeaturesGrid.tsx` (reposicionar para PDF)
- `src/components/landing/HowItWorks.tsx` (3 passos atualizados)
- `src/components/landing/FAQ.tsx` (perguntas one-shot)
- `src/components/landing/FinalCTA.tsx` (microcopy)
- `mem/index.md` + `mem/features/mvp-roadmap.md` (marcar Fase B ✅ no fim)

## Ordem de execução (PRs lógicos dentro da Fase B)
1. **B1 — Infra de estágios**: adicionar `email`/`checkout` ao tipo `Stage`, esqueleto navegação, sem UI nova.
2. **B2 — Email capture + roteamento** (com i18n).
3. **B3 — Reveal premium** (AreaScoreCard + score derivado das 4 áreas).
4. **B4 — VSL 8 blocos** (componente + i18n completo).
5. **B5 — Landing copy refresh** (ArchetypeShowcase, FeaturesGrid, HowItWorks, FAQ, Hero H1).
6. **B6 — Checkout stub** visual.
7. **B7 — Polish + responsivo + RTL audit + build clean + atualizar `mem/`**.

## Critérios de aceite (Definition of Done Fase B)
- [ ] `bun run build` limpo
- [ ] Funil completo navegável: hero → quiz → email → loader → reveal → vsl → checkout stub → /obrigado
- [ ] 4 arquétipos × 4 áreas com copy diferenciada
- [ ] 5 idiomas completos, AR RTL validado
- [ ] Responsivo 375 / 768 / 1440
- [ ] Sem regressão visual no Hero/quiz atual
- [ ] Checkout stub plug-and-play para Fase D

## Detalhes técnicos
- Estado de funil: `useState` no `index.tsx` (sem context novo; já está enxuto).
- Email/answers passados via props entre estágios; nada em localStorage.
- `scoreAnswers` retorna scores por arquétipo; `area-scores.ts` faz weighted mapping `(arquétipo × área) → score 0–100` via tabela fixa por arquétipo.
- VSL usa `Reveal.Group` para stagger, `Atmosphere fog="subtle"` só no bloco 3 (revelação) e bloco 8 (CTA final).
- Pricing stub: `{ lang: 'pt' → 'R$49,90', 'en' → '$9.90', 'pl' → '39 zł', 'ro' → '45 RON', 'ar' → 'SAR 37' }`.

## Fora do escopo (vai na Fase C/D)
- Geração de PDF real (Fase C)
- IA chain Groq/Gemini (Fase C)
- Stripe Elements real + webhook (Fase D)
- Persistência em Supabase de leads/orders (Fase D)
- Email transacional via Brevo (Fase D)
