## Objetivo

Levar Tela 12 (SalesPageV2) e Tela 13 (CheckoutStub — telinha de escolha antes do Stripe) ao mesmo padrão visual da landing/reveal, sem quebrar a escultura de scroll (ScrollAnimationSequence) nem remover blocos existentes. Reposicionar a narrativa: Tela 12 é **prova + dor + solução** (sem preço), Tela 13 é **a decisão de compra** (toda a persuasão de preço/garantia/urgência mora aqui).

## Diretrizes globais

1. **Não remover blocos.** Só envelopar, reorganizar, repolir e adicionar.
2. **Não quebrar `ScrollAnimationSequence`** (escultura à direita). Vamos *enquadrar* ela — não mover, não trocar.
3. **Linguagem visual única** com a landing: badge pulsante vermelho (`.badge-pulse`), tipografia Syne 800 uppercase nos títulos de seção, Inter 800 nos CTAs, cards com a mesma borda/sombra/blur da landing.
4. **Tela 12 sem preço.** Todas as menções monetárias (B5 “Value Anchor”, OfferMonolith, StickyOfferBar com preço, sticky total) saem da Tela 12 e migram para a Tela 13. A B5 vira “Valor entregue” (lista de entregáveis + bônus, sem números).
5. **Tela 13 vira a verdadeira página de oferta** — escolha de bumps + ancoragem de preço + garantia + urgência + prova social condensada + CTA único vermelho.
6. **i18n nos 5 idiomas** (pt, en, pl, ro, ar) para toda copy nova/ajustada. AR mantém RTL.
7. **Sem novas dependências.** Reaproveitar `Reveal`, `ButtonPress`, `Atmosphere`, `badge-pulse`, tokens `--arch-*`.

---

## FASE 1 — Padronização visual da Tela 12 (sem mexer em copy)

Objetivo: cada bloco da página de vendas parecer “primo” da landing.

1. **Badges de seção (estilo landing).** Adicionar um pill vermelho com `.badge-pulse` + `BrainIcon` acima do título de **cada** `SceneFrame`:
   - Pain Mirror → “O PROBLEMA”
   - Science → “A CIÊNCIA”
   - 4D Diagnosis → “DIAGNÓSTICO REVELADO”
   - Value/Entregáveis → “O QUE VAIS RECEBER”
   - Social Proof → “DEPOIMENTOS REAIS”
   - FAQ → “DÚVIDAS FREQUENTES”
   - Final CTA → “A TUA DECISÃO”
   Implementação: prop opcional `badge?: string` em `SceneFrame.tsx`. Render acima do `title`, idêntico ao badge da landing.

2. **Tipografia uniforme.** Títulos de `SceneFrame` → `font-display font-extrabold uppercase tracking-tight`, sem itálico. Body → Inter 400/500. Eyebrows → Inter 600 uppercase tracking-widest. Remover dropcap solto onde estiver “flutuando”.

3. **Cards com identidade landing.** Padronizar `sales-card-arch` (depoimentos, FAQ, posters de área, oferta) para o mesmo recipe da landing: `rounded-2xl border border-arch-primary/25 bg-black/40 backdrop-blur-xl shadow-[0_30px_80px_-30px_var(--arch-glow)]` + hover `-translate-y-1` + borda intensificada.

4. **Atmosfera + escultura integradas.** Envolver a coluna de copy num `<Atmosphere fog="subtle" symbols="sparse" scan="off">` *pinned* ao container raiz, e adicionar um **halo gradiente radial** atrás da escultura (`aside` direito) que “derrama” cor do arquétipo sobre as bordas do texto. A escultura passa a parecer fonte de luz, não elemento solto.

5. **Grid mais firme.** Mudar split `1.5fr_1fr` → `minmax(0,1fr)_minmax(0,420px)` no lg, com `gap-20`, e prender a escultura com `sticky top-16` num wrapper que tem `mask-image: linear-gradient(...)` para fade nas pontas (escultura deixa de “flutuar” pois funde com o fundo).

6. **CTA por seção.** Substituir botões soltos por `ButtonPress` + estilo idêntico ao Hero da landing (Inter 800 uppercase, h-20/h-28, hover vira `bg-arch-primary`).

7. **Sticky bar.** Removida da Tela 12 (não faz mais sentido sem preço). Substituída por sticky compacta “VER MEU PROTOCOLO →” que faz scroll suave para o bloco final / leva à Tela 13.

## FASE 2 — Reescrita da copy da Tela 12 para conversão (sem preço)

Princípio: cada bloco entrega 1 emoção + 1 prova + 1 promessa que conecta arquétipo → problema → solução.

1. **Hero (B1):** manter H1, ajustar promessa para nomear o **custo do problema** (dinheiro, carreira, amor, paz) — não o produto. CTA → “VER MEU PROTOCOLO AGORA →”.
2. **Pain Mirror (B2):** acrescentar 1 bullet por área (4D) usando `[PRIMARY]`, conectando dor concreta a comportamento observável. Fechar com a frase “Não és tu. É um padrão.” (já existe — manter, só destacar).
3. **Science (B3):** adicionar selo “Baseado em 14 estudos · 12.000 diagnósticos”. Reforçar com 2 citações curtas (APA / Kahneman / Ariely) — já temos `references`, só formatar como cards de prova, não como blockquote escondida.
4. **4D Diagnosis (B4):** virar **a peça central** da Tela 12. Cada `AreaPoster` ganha:
   - badge do score real do usuário,
   - 1 micro-impacto numérico (“–R$ X / mês” / “–N horas / semana”) gerado a partir do score,
   - 1 promessa de transformação 90 dias.
5. **B5 (era Value Anchor com preço) → “O que vais receber”.** Sem números monetários. Lista de 6 entregáveis com ícone: Diagnóstico 4D · Protocolo 90 dias · Matriz de Decisão · Compass diário · Relatórios mensais · Acesso aos 5 idiomas. Cada item com 1 linha de benefício comportamental.
6. **Social Proof (B6):** trazer os **6 depoimentos da landing** (PT/EN/PL/RO/AR já existem em `landing.testimonials`) + **manter os 3 atuais** da Tela 12. Total 9 cards, layout 3×3 grid no lg, carrossel horizontal no mobile. Cada card mostra nome + país (Polônia/Romênia/Arábia Saudita destacados) + arquétipo.
7. **FAQ (B8):** acrescentar 2 perguntas focadas em objeção real:
   - “Funciona se eu já tentei terapia / coaching financeiro?”
   - “Sirve para a Arábia Saudita / Polónia / Roménia?”
8. **Final (B9):** virar “a ponte” — sem preço, com a frase “O próximo ecrã mostra o que recebes e quanto custa. Decides tu.” CTA → leva para Tela 13.
9. **Exit-intent:** reescrever para reforçar o custo de adiar (sem desconto), prometendo mostrar o protocolo na próxima tela.

## FASE 3 — Redesign da Tela 13 (Checkout-Stub) — onde a venda acontece

Hoje `CheckoutStub.tsx` é uma tela mínima. Vai virar a **página de decisão de compra**, com identidade visual idêntica à landing/reveal e densidade persuasiva máxima num único viewport (scroll curto).

Estrutura (top → bottom):

1. **Header de continuidade.** Badge `.badge-pulse` “DECIDE AGORA”, H1 `“[NOME], escolhe o teu protocolo.”` + sub `“Tudo o que viste nas últimas páginas, num só ecrã.”` (Syne 800, igual reveal).
2. **Stack de prova condensada (1 linha):** 4 stat chips (12.000 diagnósticos · 4.9★ · 60s PDF · 30 dias garantia).
3. **Card principal “Protocolo MindReset”** com:
   - O que está incluso (mesma lista de 6 entregáveis da Fase 2.5),
   - preço âncora riscado (`v2.b5.was` / `then`),
   - preço atual destacado grande (`price.main`),
   - selo “–N% só hoje” (com timer real reutilizando `b1.timer`).
4. **Bumps como decisões emocionais, não checkboxes:**
   - `BumpRow` redesenhada → card grande com ícone, headline em Syne, microcopy de benefício (“adiciona +X meses de plano alimentar do dinheiro”), preço “+X€”, toggle visual claro com animação de seleção (borda vermelha + glow). Cada toggle dispara micro-confete sutil.
5. **Total dinâmico** grande, com animação de roll-up (`AnimatedCounter`) ao mudar bumps.
6. **CTA único vermelho** — copy dependente de bumps:
   - 0 bumps: “DESBLOQUEAR PROTOCOLO POR X€ →”
   - 1+: “DESBLOQUEAR TUDO POR Y€ →”
   Botão idêntico ao Hero/Reveal (Inter 800, h-28, halo vermelho), com micro-shake sutil ao primeiro idle de 8s.
7. **Linha de confiança abaixo do CTA:** Stripe · SSL · 30 dias garantia incondicional · 5 idiomas. Ícones Lucide pequenos, texto Inter 500.
8. **Mini-depoimentos rolando** (3 últimos cards horizontais, autoplay 5s) — só nome + país + 1 linha. Lembrança final de que “gente como tu já decidiu”.
9. **Garantia em destaque** no rodapé: card com selo `ShieldCheck`, copy “Se em 30 dias não vires mudança real, devolvemos 100% sem perguntas.” (validada — já é padrão Stripe).
10. **Atmosphere sutil** atrás do card (mesmo `fog="subtle"`), MarbleBust mini no canto como assinatura.

## FASE 4 — i18n + analytics + QA

1. **Translations**: adicionar/ajustar chaves em `src/lib/i18n/translations.ts` para os 5 idiomas:
   - `salesV2.b5` reescrito sem preço (entregáveis),
   - `salesV2.b6.testimonials` expandido com os 6 da landing,
   - `salesV2.b8.items` +2 perguntas,
   - novo bloco `checkout.*` com toda copy da Tela 13.
   - AR validado para RTL (margens `-inline-*`, sem `left/right`).
2. **Analytics**: novos eventos `CHECKOUT_VIEW`, `CHECKOUT_BUMP_TOGGLED`, `CHECKOUT_CTA_CLICK`, `CHECKOUT_TIMER_END`. Manter os de VSL.
3. **A11y**: `aria-label` nos badges, `aria-pressed` nos bumps, foco visível no CTA, `prefers-reduced-motion` respeitado em confete/shake.
4. **Build/QA**: `npm run build`, `tsc --noEmit`, contraste WCAG AA em 375 px e 1440 px, smoke em PT/EN/AR.

## Ordem de execução (PRs sugeridos)

- **PR 1 — Visual Tela 12 (Fase 1):** badges, tipografia, cards, atmosfera, escultura enquadrada, sticky compacta, remover preço da B5/Offer/Sticky. Sem mexer em copy.
- **PR 2 — Copy Tela 12 (Fase 2):** reescrita de B1/B2/B4/B5/B6/B8/B9 + exit-intent, com i18n nos 5 idiomas.
- **PR 3 — Tela 13 redesenhada (Fase 3):** novo `CheckoutStub` premium com toda decisão de compra.
- **PR 4 — i18n + analytics + QA (Fase 4):** fechar idiomas, eventos, testes, build limpo.

## Detalhes técnicos

- Arquivos a editar:
  - `src/components/sales/SalesPageV2.tsx` (remover Offer/Sticky com preço, adicionar badges, novo grid)
  - `src/components/sales/v3/SceneFrame.tsx` (prop `badge`)
  - `src/components/sales/v3/AreaPoster.tsx` (score chip + impacto numérico)
  - `src/components/sales/v3/StickyOfferBar.tsx` (vira sticky “VER MEU PROTOCOLO”)
  - `src/components/sales/v3/ExitIntentModal.tsx` (copy)
  - `src/components/funnel/CheckoutStub.tsx` (redesign completo Fase 3)
  - `src/components/sales/v3/BumpRow.tsx` (card grande)
  - `src/lib/i18n/translations.ts` + `src/lib/i18n/types.ts` (chaves novas)
  - `src/lib/analytics.ts` (novos `EVENTS.CHECKOUT_*`)
  - `src/styles.css` (helpers `.sales-card-arch` alinhados ao recipe da landing, halo da escultura)
- O fluxo `onContinue({ bumps })` da Tela 12 continua chamando o gateway atual; a Tela 13 (`CheckoutStub`) recebe os bumps como estado inicial e segue para Stripe via `createCheckoutSession` já existente.
- Reaproveitar `getPricing(lang)` somente na Tela 13.
- Sem novas libs. Confete usa `canvas-confetti` já instalado.

Confirma que avanço pela **PR 1** primeiro? Quero validar a direção visual antes da reescrita de copy.
