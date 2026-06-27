## Objetivo

Auditar todo o funil MindReset contra o **GUIA MESTRE DE CONVERSÃO** (1266 linhas, 6 produtos de referência: 16Personalities, Sacred Money, HumanDesignHD, ASK Method, Mind Money Balance, Truity) e fechar TODOS os gaps que separam o produto de uma conversão ≥30%. **Nada será removido** — só melhorado, reescrito ou adicionado.

## Princípio orientador

Toda decisão segue o arco emocional do guia:
`DESCOBERTA → IMPACTO → ALÍVIO → ESPERANÇA → AÇÃO`

E a proposta-núcleo: **"você não precisa mudar quem você é — precisa DOMINAR quem você é"**. Não vendemos finanças, vendemos maestria de si.

## Estado atual vs guia (audit rápido)

✅ Já temos: 5 idiomas, quiz 8 perguntas + identidade, loader, reveal com typewriter, sales V3 cinematográfica, checkout redesenhado, thank-you com confetti, badges pulsantes, atmosphere, MarbleBust, Stripe hosted, webhook, PDF, i18n RTL.

⚠️ Gaps críticos vs guia mestre:
1. **Landing**: headline atual não usa o framework "curiosidade + dor + reframe de culpa" em 1 frase; falta contador específico ("14.832 diagnósticos"); CTA precisa ir 100% para 1ª pessoa em TODOS os idiomas.
2. **Quiz**: auto-advance 150ms não confirmado; barra começa em 0% (guia exige 12%); `[NOME]` não está em TODAS as 8 perguntas; arquétipo **secundário** não é calculado nem exposto; concordância de gênero parcial.
3. **Email gate (Tela 9)**: falta efeito "resultado desfocado ao fundo" criando tensão Zeigarnik.
4. **Loader**: validar 4 textos exatos + 3s + `[NOME]` no último.
5. **Reveal**: faltam os 3 níveis de copy (dor → custo oculto → expansão multi-área); CTAs por arquétipo em 1ª pessoa nos 5 idiomas; botão de **compartilhamento viral** (card Instagram Stories) ausente.
6. **Sales (Tela 12)**: hoje é boa mas falta a **estrutura emocional de 6 estados** (Validação→Nomeação→Compreensão→Expansão→Desejo→Ação) explícita; Order Bump 1 deveria viver DENTRO da sales (entre B6/B7), hoje só no checkout; falta sticky navbar com CTA pós-scroll; Exit-intent modal ausente.
7. **Checkout (Tela 13)**: já redesenhado; falta alinhar copy "Quase lá, [NOME]" + selos posicionados ABAIXO do CTA (não acima).
8. **Thank-you (Tela 14)**: falta **upsell Protocolo de 30 Dias +$14** aparecendo 2s após carregamento.
9. **Mecânica viral**: zero compartilhamento social hoje — gap grande de aquisição orgânica.
10. **Arquétipo secundário em todo o copy**: "[PRIMARY] com traço de [SECONDARY]" não existe.

## Plano em 6 PRs

### PR 1 — Scoring + personalização profunda (fundação técnica)
- `src/lib/quiz/scoring.ts`: devolver `{ winner, secondary, scores }` em vez de só `winner`.
- Persistir `secondary` em `quiz_leads` (migration leve, nullable).
- Propagar `secondary` via state da rota até reveal/sales/checkout/thank-you/PDF.
- `[NOME]` em TODAS as 8 perguntas (`src/lib/i18n/translations.ts`) nos 5 idiomas.
- Concordância de gênero (m/f/n) auditada e completada nas 8 perguntas.
- Auto-advance 150ms confirmado/ajustado em `QuizScreenWrapper`.
- Barra de progresso começa em **12%** e cresce não-linear.

### PR 2 — Landing + Reveal alinhadas ao guia
- Hero landing: novo headline em 5 idiomas no padrão "curiosidade + reframe": *"Não é falta de força de vontade. É um padrão instalado antes dos 15 anos."* + contador específico "14.832 diagnósticos · 4 países".
- Reveal: refatorar `ArchetypeRevealStage` para a cascata de 8 passos do guia (sub → typewriter → ícone → dor → custo oculto → expansão multi-área → CTA por arquétipo 1ª pessoa → botão "Compartilhar meu arquétipo").
- Copy de reveal nos 5 idiomas seguindo "reframe de culpa → precisão cirúrgica → expansão para outras áreas → identidade".
- CTAs específicos por arquétipo (AO/SS/EA/HI) em 1ª pessoa.

### PR 3 — Sales (Tela 12) com estrutura emocional de 6 estados
- Reescrita de B1–B9 mapeando 1:1 aos 6 estados emocionais (Validação→Ação).
- B1 com frase-âncora "dominar o que hoje domina você" em 5 idiomas.
- B2 com 6 bullets de dor real (não abstrações), por arquétipo.
- B3 com citações Kahneman/Thaler/Ariely em destaque visual (caixa borda vermelha) + frase "Planilhas não resolvem um problema que não é de planilha".
- B4 com "[NOME] — [PRIMARY] com traço de [SECONDARY]" + 4 áreas (financeiro/profissional/amoroso/pessoal) com impacto numérico do score.
- B5: ancoragem com "$200 consulta · $47 regular · hoje [PREÇO LOCAL]" (sem mostrar números aqui — só na Tela 13 conforme arquitetura atual; mantemos B5 como "valor entregue").
- B6: 9 testimonials (PT/EN/PL/RO/AR) com bandeira + arquétipo.
- **Order Bump 1 inline entre B6 e B7** ("Guia de Relações por Arquétipo +$4,99").
- Sticky navbar com CTA "Quero Meu Diagnóstico →" aparecendo após 600px de scroll.
- B8 FAQ com as 4 perguntas exatas do guia (genérico/diferencial/recebimento/garantia).
- B9 CTA final com frase "Você descobriu seu arquétipo. Falta o mais importante: O QUE FAZER COM ELE."

### PR 4 — Email gate + Loader + Exit-intent + Checkout polish
- Tela 9: resultado desfocado ao fundo (`backdrop-filter: blur(20px)` num preview do arquétipo) para criar tensão.
- Tela 10: 4 textos exatos do guia, fade 700ms, `[NOME]` no 4º, total 3s.
- Exit-intent modal já existente (`ExitIntentModal.tsx`) reescrito com copy "Espera, [NOME]. Você descobriu que é [ARQUÉTIPO]…" em 5 idiomas.
- Tela 13: "Quase lá, [NOME]" + selos SSL/Stripe/garantia ABAIXO do CTA; bumps com toggle visual claro.

### PR 5 — Thank-you upsell + mecânica viral
- `obrigado.tsx`: upsell **Protocolo de 30 Dias +$14** aparece 2s após load (modal/sheet), com copy do guia + CTAs "Sim, adicionar" / "Não, só quero o diagnóstico". Integra `createCheckoutSession` em modo "upsell" (one-click via customer já criado).
- Cria endpoint `api/public/upsell` server fn que reabre Stripe checkout pré-preenchido.
- Botão "Compartilhar meu arquétipo" no reveal: gera card 1080×1920 (canvas) com nome do arquétipo + sigil + frase-assinatura → download/share API; tracking `ARCHETYPE_SHARED`.
- Página pública `/arquetipo/[slug]` (4 rotas estáticas) para o link compartilhado dar voltar para o quiz.

### PR 6 — QA, analytics, contraste, performance, go-live
- 16 eventos PostHog canônicos do guia (LANDING_VIEW, QUIZ_START, QUIZ_Q_ANSWERED, EMAIL_CAPTURED, REVEAL_VIEW, REVEAL_SHARED, SALES_VIEW, SALES_BUMP_TOGGLED, EXIT_INTENT_SHOWN, CHECKOUT_VIEW, CHECKOUT_CTA_CLICK, PURCHASE_SUCCESS, UPSELL_VIEW, UPSELL_PURCHASED, PDF_DOWNLOADED, ARCHETYPE_SHARED).
- Checklist final do guia (Parte 5) auditado item por item.
- Contraste WCAG AA em 375px e 1440px em 5 idiomas.
- `npm run build` + `tsgo` limpos.
- Lighthouse mobile baseline + após melhorias.
- Smoke Playwright: funil completo PT/EN/AR (RTL).

## Decisões pendentes (preciso de OK antes de começar PR 1)

1. **Arquétipo secundário visível em todo o funil?** → recomendo sim, fortalece personalização e diferencia da concorrência.
2. **Upsell Protocolo $14 na thank-you** → criar como produto separado no Stripe ou usar bump pós-compra via Payment Intent? Recomendo **link to new Stripe Checkout em 1-click** (sem re-pedir cartão se Link/customer reused).
3. **Mecânica viral**: card de compartilhamento gerado client-side (canvas) ou server (PDF/imagem via worker)? Recomendo **client-side canvas** — zero infra extra.
4. **Headline da landing**: posso escolher entre as 3 fórmulas do guia (gap de info / reframe de culpa / contraste com solução) ou prefere votar?
5. **Ordem dos PRs**: posso começar pelo **PR 1 (scoring + secundário + [NOME] + gênero)** porque é fundação de todos os outros — confirma?

## Detalhes técnicos

Arquivos a tocar (resumo):
- `src/lib/quiz/scoring.ts`, `src/lib/quiz.functions.ts`
- `src/lib/i18n/translations.ts` + `types.ts` (extensão pesada — toda copy nova × 5 idiomas)
- `src/routes/index.tsx` (landing hero + quiz + email + reveal + sales)
- `src/components/landing/{Hero,ProofBar,FinalCTA}.tsx`
- `src/components/quiz/QuizScreenWrapper.tsx` (progresso 12%, auto-advance)
- `src/components/reveal/{ArchetypeRevealStage,ShareCard}.tsx` (novo ShareCard)
- `src/components/sales/SalesPageV2.tsx` + `v3/*` (B1–B9 reescritos + StickyNav + bump inline)
- `src/components/sales/v3/ExitIntentModal.tsx`
- `src/components/funnel/CheckoutStub.tsx`
- `src/routes/obrigado.tsx` (upsell modal)
- `src/routes/api/public/upsell.ts` (novo)
- `src/lib/analytics.ts` (16 eventos)
- `supabase migration`: `quiz_leads.secondary_archetype` nullable text

Sem novas dependências. `canvas-confetti` já instalado; share card usa Canvas API nativo + Web Share API.

---

Confirma se posso seguir com **PR 1** e me responde os 5 itens pendentes (ou simplesmente "ok, segue tudo" e eu decido).