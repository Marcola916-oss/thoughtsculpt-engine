# Fase 3 — Quiz Flow + Reveal Conversion

## Objetivo

Elevar **quiz_start → reveal_view de ~60% para ≥85%** e **reveal_view → checkout_click de ~8% para ≥18%**.

Fase 1 (infra) e Fase 2 (landing) permanecem intactas. Esta fase ataca o meio e o fim do funil: a experiência do quiz em si e a página de revelação do arquétipo, que é o momento de máxima atenção emocional do utilizador.

## Diretrizes (não-negociáveis)

- **Copy estritamente Bible V2** — nada inventado.
- **5 idiomas em paridade** (PT/EN/PL/RO/AR) — `i18n-sync` verde antes de fechar cada commit.
- **Zero quebra de rotas existentes** — mudanças cirúrgicas em `index.tsx` stages `identity/q/email/loader/reveal`.
- **Mobile-first** — todo o quiz é consumido em 375-414px; desktop é polish.
- **Acessibilidade AA** — focus rings visíveis, `aria-live` nas transições, contraste verificado.
- **RTL preservado** para árabe em todas as novas peças.
- **Analytics canônicos** — cada microinteração relevante dispara `track()` com `source` apropriado.

## Ordem de execução (5 commits)

### Commit 1 — Quiz progress + back stack confiável

**Ficheiros:** `src/components/quiz/QuizScreenWrapper.tsx`, `src/routes/index.tsx`.

- Barra de progresso com gradiente vermelho + label "Pergunta N de 8" + percentagem real animada (`transition: width 0.6s ease-out`).
- Botão `← Voltar` em TODAS as etapas exceto a primeira; restaura a resposta anterior em vez de a apagar (atualmente perde estado).
- `track(EVENTS.QUIZ_BACK, { from_step })` em cada uso — para medir hesitação por pergunta.
- Persistência das respostas em `sessionStorage` (chave `mr_quiz_draft`) com TTL 30min, para recuperar se o utilizador refrescar acidentalmente.

### Commit 2 — Loader emocional (pré-revelação)

**Ficheiro:** `src/components/quiz/NeuralLoader.tsx`.

- Substituir os 5 steps actuais por um ciclo de **3 fases narrativas** (8s total, não mais):
  1. "A cruzar as tuas 8 respostas com 12.000 perfis…" (0-2.5s)
  2. "A identificar o teu padrão dominante…" (2.5-5s)
  3. "A preparar a tua revelação…" (5-8s)
- MarbleBust no centro com pulso vermelho sincronizado às transições.
- `track(EVENTS.LOADER_VIEW)` no mount, `track(EVENTS.LOADER_COMPLETE)` no fim.
- Reduzir para `prefers-reduced-motion`: substituir pulso por fade simples.
- Copy localizada nos 5 idiomas via `t.loader.steps` (já existe — só ajustar para 3 entradas).

### Commit 3 — Reveal: hierarquia visual + prova social ancorada

**Ficheiro:** `src/components/reveal/` (novos sub-componentes) + `src/routes/index.tsx` stage `reveal`.

Estrutura nova da página de reveal (mobile-first, fold por fold):

1. **Fold 1 — Nome do arquétipo (typewriter 1 char/40ms) + tagline + MarbleBust pulsando**. Sem CTA aqui — o utilizador respira o impacto.
2. **Fold 2 — "O que isto significa para ti, {nome}"**: 3 bullets vindos de `t.archetypes[arch].hooks` (já existem). Cada bullet com ícone Lucide.
3. **Fold 3 — Score por área** (AreaScoreCard × 4: dinheiro/carreira/amor/pessoal). Barras animadas 0→valor sobre `IntersectionObserver`.
4. **Fold 4 — Comparação ancorada**: "73% dos {arquétipo} relatam o mesmo padrão em pelo menos 3 áreas." Número derivado de `computeAreaScores`.
5. **Fold 5 — CTA primário** ("Quero o meu diagnóstico completo") com timer de 15 min visível (escassez genuína baseada no `recover` window) + microcopy "7 dias de garantia · Pagamento único · Sem assinatura".

`track(EVENTS.REVEAL_VIEW)` no mount, `track(EVENTS.REVEAL_CTA_CLICK)` no botão.

### Commit 4 — Checkout bump alinhado ao Bible V2 + Apple Pay/Google Pay

**Ficheiros:** `src/components/funnel/CheckoutStub.tsx` (rewrite) + nova `src/lib/funnel/checkout.functions.ts`.

- Produto principal: PDF do diagnóstico (preço local via `getLocalPrice` da Fase 1).
- **Order bump pré-tickado** (`bump2`): "Plano de 30 dias guiado por arquétipo — +$14.00" com checkbox visível e copy de valor.
- Stripe Elements com Apple Pay / Google Pay no topo, cartão abaixo.
- `track(EVENTS.CHECKOUT_VIEW)`, `track(EVENTS.BUMP_TOGGLE)`, `track(EVENTS.CHECKOUT_SUBMIT)`.
- Em caso de cancelamento Stripe → redirect para `/?canceled=1&recover={orderId}` (já tratado na Fase 1).
- Server function `createCheckoutSession` em `checkout.functions.ts` com `inputValidator` Zod + Stripe SDK; retorna `{ url }` para `window.location.assign`.

### Commit 5 — i18n parity + analytics sweep + Gate 3

- Adicionar chaves novas (`quiz.back`, `quiz.progress`, `reveal.fold2Title`, `reveal.fold4Anchor`, `checkout.*`) aos 5 idiomas em `translations.ts` + tipo em `Dict`.
- Confirmar que **todos** os 16 eventos canónicos de `EVENTS` estão a disparar pelo menos uma vez no fluxo end-to-end.
- Rodar `bunx tsgo --noEmit` (verde) e smoke test manual: PT desktop + AR mobile (RTL).

## Critérios de Gate 3 (antes de Fase 4)

- ✅ Build limpa, tsgo limpo, i18n-sync nos 5 idiomas.
- ✅ Quiz: voltar restaura resposta, refresh recupera draft, progress animada.
- ✅ Loader: 8s, 3 fases narrativas, sem flicker.
- ✅ Reveal: 5 folds, scores animados, timer de 15 min visível, CTA único.
- ✅ Checkout: Apple Pay visível em iOS, bump pré-tickado, recovery banner se cancelar.
- ✅ PostHog (se configurado) a receber `QUIZ_START`, `QUIZ_BACK`, `LOADER_VIEW`, `REVEAL_VIEW`, `REVEAL_CTA_CLICK`, `CHECKOUT_VIEW`, `BUMP_TOGGLE`, `CHECKOUT_SUBMIT`.

## Estimativas de impacto

- **Back stack confiável + draft recovery** → +5-8pp no quiz_start→reveal_view (reduz abandono por engano).
- **Loader narrativo 8s** → mantém atenção emocional (vs. ansiedade do loader atual).
- **Reveal em 5 folds + score animado** → +6-10pp no reveal_view→checkout_click (prova ancorada).
- **Apple Pay/Google Pay + bump pré-tickado** → +3-5pp no checkout_click→purchase + AOV +$8-12.

## Gates do utilizador antes de implementar

- **Stripe:** preciso de confirmação que `STRIPE_SECRET_KEY` está nos Secrets do projeto (já deve estar da Fase 1) e que o domínio Apple Pay foi adicionado.
- **Preço do bump:** confirmar `$14.00` para USD/EUR (já no `pricing.server.ts`).

## Próximo passo

Aprovar este plano → começar pelo **Commit 1 (Quiz progress + back stack)** e enviar para revisão antes de avançar.
