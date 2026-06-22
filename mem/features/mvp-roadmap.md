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
- B2 — Email capture refinada (i18n)
- B3 — Reveal premium com 4 AreaScoreCards
- B4 — VSL com 8 blocos (sales/VSL.tsx)
- B5 — Landing copy refresh (4 áreas, não só dinheiro)
- B6 — Checkout stub visual (plug-and-play Fase D)
- B7 — Polish + RTL + responsivo + build clean

Foco:
- Reveal premium com dor centrada nas 4 áreas (não só dinheiro).
- VSL com 8 blocos (âncora emocional, espelho de dor, revelação científica, produto, prova social, preço, FAQ, CTA final).
- Adaptar copy para "diagnóstico de comportamento humano" (não só finanças).
- Manter quiz visual atual, ajustar perguntas se necessário p/ scoring multi-dimensional.

## Fase C — Geração PDF + IA chain
- @react-pdf/renderer com template por arquétipo (cores oficiais: AO/SS/EA/HI).
- Server fn `generatePdf` chain: Groq → Gemini → Cerebras → OpenRouter. AR usa Gemini primeiro.
- Cache: pré-gerar 4 arquétipos × 5 idiomas = 20 PDFs-base, personalizar só nome+scores.
- Storage: Supabase bucket `diagnoses` (público com URL assinada 30d).
- Email: Brevo (anexo PDF + link download), template multi-idioma.

## Fase D — Checkout Stripe Elements + multi-moeda
- Checkout custom (não hosted) com Stripe Elements para visual + OB1 toggle visível.
- Detecção IP → moeda (PLN/RON/SAR/BRL/USD/EUR).
- Webhook em `src/routes/api/public/stripe-webhook.ts` (verifica assinatura HMAC).
- Pós-pago: upsell OB2 one-click reaproveitando customer Stripe.
- Apple Pay + Google Pay (crítico para SA).
- Migration Supabase: dropar `diagnoses/compass_entries/calendar_tasks/progress/rewards/notifications/profiles/user_roles`, criar `quiz_leads/orders/pdf_generations`.