---
name: MVP one-shot roadmap
description: 4-phase plan to ship $9.90 PDF-archetype product across SA/PL/RO/global. Records what was removed in Phase A and what each subsequent phase must build.
type: feature
---

# MVP One-Shot Roadmap (pivot jun/2026)

## Oferta
- Principal: $9.90 (BRL R$49,90 / SAR 37 / PLN 39 / RON 45) — Diagnóstico PDF (4 seções: Financeiro, Profissional, Amoroso, Pessoal).
- Order Bump 1 (checkout, $4.99): Guia de Relações por Arquétipo (PDF estático com combinações).
- Order Bump 2 (post-pay, $7.99): Protocolo de Reset 30 dias (PDF com plano diário).
- Ticket médio alvo: ~$12.

## Fase A — Limpeza ✅ (jun/2026)
Removidos: dashboard/* completo, _authenticated/*, login, reset-password, share, success, onboarding, sidebar, calendar, gamification, ArchetypeBrain variants não-essenciais (CelebrationBrain, ArchetypeRetroBrain, ArchetypeSplineBrain, ArchetypeBrainSprite, ArchetypeVideoBrain), server fns (diagnosis/calendar/compass/progress/rewards/report/notifications/profile/limits/checkout/checkout.success), pricing.ts, stripe.server.ts, email.ts, welcome_email template, supabase/functions/stripe-webhook, temp_extracted_*.
Mantidos: landing/*, quiz/*, atmosphere/*, interaction/*, MarbleBust+CircuitBrain+ArchetypeReveal*+Logo+IdentitySymbol, i18n 5 idiomas, archetype scoring, quiz.functions, brand tokens.
Stubs temporários no index.tsx (PRICES/formatPrice/useStubCheckout) e obrigado.tsx (placeholder) — Fase B/D reescrevem.

## Fase B — Funil de vendas premium
Reescrever index.tsx em 14 etapas (landing→quiz→email→loader→reveal→vsl→checkout). Plano completo em `.lovable/plan.md`.

Sub-passos:
- B1 — Infra de estágios (Stage type + scaffolding) ✅
- Fundamentos: `src/lib/funnel/area-scores.ts` (4 áreas derivadas do scoreAnswers) ✅
- Fundamentos: `src/lib/funnel/pricing-stub.ts` (BRL/USD/PLN/RON/SAR/EUR) ✅
- B2 — Email capture refinada (i18n) ✅ (stage `email` + `emailCapture` keys nos 5 idiomas + GDPR check)
- B3 — Reveal premium com 4 AreaScoreCards ✅ (PT/EN copy próprio + PL/RO/AR traduzidos; barra de progresso animada; CTA "Ver diagnóstico completo")
- B4 — VSL com 8 blocos (sales/VSL.tsx) ✅ (componente único com copy embedded nos 5 idiomas, 4 painCards por arquétipo, PDF mockup, 3 testimonials, pricing card com 2 order bumps, FAQ 6Q, CTA final)
- B5 — Landing copy refresh ✅ (Hero H1 "padrão invisível 4 áreas", ArchetypeShowcase com descs multi-área, HowItWorks step 3 "PDF entregue", FeaturesGrid reescrito como 4 dimensões do PDF Financeira/Profissional/Amorosa/Pessoal, FAQ sem Matriz/Compass/assinatura, FinalCTA com mensagem 4 áreas. 5 idiomas: PT/EN/PL/RO/AR)
- B6 — Checkout stub visual ✅ (CheckoutStub.tsx: resumo do pedido com OB1/OB2 toggleáveis, total dinâmico, formulário fake card/exp/cvc/email pré-preenchido, botão "Pagar $X" → /obrigado após 1.2s. i18n embedded 5 idiomas. VSL agora roteia para `checkout` em vez de `plans`. Layout plug-and-play para Fase D: trocar `<input>` por Stripe Elements + `setTimeout` por `stripe.confirmPayment()` sem mudar wireframe.)
- B7 — Polish + RTL + responsivo + build clean ✅ (auditoria de classes direcionais nos artefatos B3/B4/B6: `pr-12`/`right-4` → `pe-12`/`end-4` no CheckoutStub, `left-0` → `start-0` na barra de progresso do AreaScoreCard, `text-right`/`text-left` → `text-end`/`text-start`, `left-8 right-8` → `inset-x-8` no PDF mockup. Resto do funil já usava `text-start`, `inset-x-*`, `gap-*` e flex naturais — totalmente RTL-safe.)

Foco:
- Reveal premium com dor centrada nas 4 áreas (não só dinheiro).
- VSL com 8 blocos (âncora emocional, espelho de dor, revelação científica, produto, prova social, preço, FAQ, CTA final).
- Adaptar copy para "diagnóstico de comportamento humano" (não só finanças).
- Manter quiz visual atual, ajustar perguntas se necessário p/ scoring multi-dimensional.

## Fase C — Geração PDF + IA chain
Plano completo em `.lovable/plan.md` (sub-fases C1–C9).

- C1 — Migração ✅ (tabela `pdf_generations` com cache por content_hash, bucket privado `diagnoses`, policies só para `service_role`).
- C2/C3/C4/C5 — Template editorial ✅ (`src/lib/pdf/tokens.ts` + `Document.tsx`): 14 páginas A4 inspiradas em ref editorial zine/revista (tipografia massiva atrás de objeto, grid 12-col, duotone cor-arquétipo×creme×vermelho-marca, números de página estilo `01 / 14`, tags verticais, stamps, scoreBars). Capa, abertura, índice de scores, 4×(capa de área + dossiê com plano 7d + exercício box), protocolo 7 dias, gatilhos×5, contra-capa/ritual. Fontes via Google Fonts CDN (Syne 800, Inter 400/600/700, Noto Naskh Arabic). Paleta oficial por arquétipo aplicada em wash + chips.
- C6 — Cadeia de IA ✅ (`src/lib/ai/chain.server.ts` + `diagnosis-prompts.ts` + `diagnosis-schema.ts`): Zod schema completo, JSON Schema para tool-call forçado, 3 modelos em chain (Gemini 2.5 Flash → 2.5 Flash Lite → 2.0 Flash Exp), prompt system+user por idioma (PT-PT, EN, PL, RO, AR) com tom editorial provocador, attempts persistidas sem PII.
- C7 — Server fn `generateDiagnosisPdf` ✅ (`src/lib/pdf/generate.functions.ts`): cache lookup por sha256(name+arch+lang+areaScores+v), reserva de row, chain de IA, render @react-pdf/renderer dynamic import (out of client bundle), upload para Storage, signed URL 30d, persistência de status/attempts/error. Validações de lead, fallback de lang.
- C8 — Email Brevo ⏳ PENDENTE — requer secret `BREVO_API_KEY` do usuário. Template multi-idioma + envio com link signed URL.
- C9 — Integração `/obrigado` ✅: chama generateDiagnosisPdf via useServerFn, exibe MarbleBust loader durante geração, botão CTA vermelho de download quando ready, retry em caso de erro, indicador "fromCache" quando aplicável. CheckoutStub agora passa `leadId` via search params. Atmosphere subtle de fundo. Copy em 5 idiomas embedded.

## Fase D — Checkout Stripe Elements + multi-moeda
- Checkout custom (não hosted) com Stripe Elements para visual + OB1 toggle visível.
- Detecção IP → moeda (PLN/RON/SAR/BRL/USD/EUR).
- Webhook em `src/routes/api/public/stripe-webhook.ts` (verifica assinatura HMAC).
- Pós-pago: upsell OB2 one-click reaproveitando customer Stripe.
- Apple Pay + Google Pay (crítico para SA).
- Migration Supabase: dropar `diagnoses/compass_entries/calendar_tasks/progress/rewards/notifications/profiles/user_roles`, criar `quiz_leads/orders/pdf_generations`.