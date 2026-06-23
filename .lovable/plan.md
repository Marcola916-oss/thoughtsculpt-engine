
# Fase D — Pagamento Stripe + Gating do Diagnóstico

Objetivo: o utilizador só recebe o PDF + e-mail **depois de pagar**. Stripe Checkout cria a ordem, o webhook verifica e marca como paga, o `/obrigado` só gera com `order_id` válido.

## Visão Geral do Fluxo

```text
Quiz → Reveal (showsa preview) → CTA "Comprar diagnóstico" (D2)
   ↓
[server fn] createCheckoutSession(leadId, bumps)
   ↓ Stripe Checkout (hosted)
   ↓ success_url=/obrigado?order={order_id}
[webhook] POST /api/public/stripe/webhook
   ↓ verifica assinatura HMAC + idempotência
   ↓ marca orders.status='paid'
/obrigado lê order_id → valida 'paid' → gera PDF (C7) → envia email (C8)
```

## D1 — Schema: tabela `orders`

Criar via migration (não usar `subscriptions`, é para outro fluxo):

```text
orders
├─ id              uuid PK
├─ lead_id         uuid FK quiz_leads(id)  not null
├─ stripe_session_id  text unique           not null
├─ stripe_payment_intent  text
├─ status          text  default 'pending'  -- pending|paid|failed|expired|refunded
├─ amount_cents    integer not null
├─ currency        text not null            -- iso lowercase (usd/eur/brl/...)
├─ bumps           jsonb default '[]'       -- ['bump1','bump2'] selecionados
├─ customer_email  text
├─ paid_at         timestamptz
├─ raw_event       jsonb                    -- último evento processado
├─ created_at      timestamptz default now()
└─ updated_at      timestamptz default now()
```

- `GRANT SELECT, INSERT, UPDATE ON public.orders TO service_role` (escrita só do webhook/server fn admin).
- `GRANT SELECT ON public.orders TO anon` apenas via RPC com filtro por `id` (não SELECT direto).
- RLS ON, sem policies para `anon`/`authenticated`.
- RPC `get_order_status(_id uuid) RETURNS text` security definer → devolve só `status`.
- Tabela `stripe_events` para idempotência: `event_id text PK, processed_at timestamptz`.

## D2 — Reveal: CTA de compra

Em `index.tsx` no estágio `reveal`, depois do preview do arquétipo, substituir o botão atual ("Ver diagnóstico completo" que vai direto para /obrigado) por:

- Cartão de oferta: preço principal + 2 order bumps (checkboxes) usando `getPricing(lang)`.
- CTA "Desbloquear diagnóstico" → chama server fn `createCheckoutSession({ leadId, bumps })`.
- Redirect para a URL do Stripe Checkout (hosted, sem ter de embed nada).
- Mantém o look MindReset (CC0000, hover translateY, micro-interações).

## D3 — Server fn `createCheckoutSession`

`src/lib/payments/checkout.functions.ts` (público, sem auth — quiz não tem login):

- Input: `{ leadId: uuid, bumps: ('bump1'|'bump2')[] }`
- Valida lead existe + tem winner.
- Calcula `amount_cents` server-side a partir de tabela autoritativa em `src/lib/funnel/pricing.server.ts` (NUNCA confiar no client).
- Cria `orders` row `status='pending'`.
- Cria Stripe Checkout Session via REST `https://api.stripe.com/v1/checkout/sessions` (sem SDK — bundle leve em Worker):
  - `mode=payment`
  - `line_items[]` com `price_data` (currency/unit_amount/product name por arquétipo+lang)
  - `success_url={origin}/obrigado?order={ORDER_ID}` (placeholder real, não session)
  - `cancel_url={origin}/?canceled=1`
  - `client_reference_id=<order.id>`
  - `metadata={ lead_id, order_id, archetype, lang }`
  - `customer_email=lead.email`
  - `payment_intent_data.metadata` espelhada
- Atualiza `orders.stripe_session_id` com o id retornado.
- Devolve `{ url: session.url }`.

## D4 — Webhook `/api/public/stripe/webhook`

`src/routes/api/public/stripe/webhook.ts`:

- Lê body raw (`request.text()`).
- Verifica assinatura `Stripe-Signature` com `STRIPE_WEBHOOK_SECRET` (HMAC SHA-256 com timing-safe compare + tolerância 5 min).
- Idempotência: insert em `stripe_events(event_id)`; se já existe → 200 OK no-op.
- Eventos tratados:
  - `checkout.session.completed` → marca order `paid`, guarda `payment_intent`, `paid_at`, `customer_email`, `raw_event`.
  - `checkout.session.async_payment_succeeded` → idem (boleto/SEPA).
  - `checkout.session.async_payment_failed` / `expired` → `failed`/`expired`.
  - `charge.refunded` → `refunded`.
- Tudo via `supabaseAdmin` carregado dentro do handler.
- Responde sempre 200 a eventos válidos (evita retry storm); 401 só em assinatura inválida.

## D5 — Gating no `/obrigado`

Refactor de `src/routes/obrigado.tsx`:

- Search params passam de `?lead=<uuid>` para `?order=<uuid>` (lead vem via order no servidor).
- Novo estado inicial: `verifying` (polling).
- `verifyOrderStatus({ orderId })` server fn → RPC `get_order_status` → devolve `{ status, leadId }`.
- Polling com backoff (2s → 4s → 6s, máx 30s) enquanto `status='pending'` (webhook pode demorar ~1-3s).
- Quando `status='paid'`: chama `generateDiagnosisPdf({ leadId })` (já existe, C7).
- Quando `status='failed'/'expired'`: mostra "Pagamento não confirmado" + link de retry para checkout.
- `pending` após timeout: mensagem "Estamos a confirmar…" + botão refresh.
- Email C8 dispara igual depois de `ready`.

## D6 — Hardening

- **Rate limit do checkout**: `daily_limits` table já existe — limita 5 sessions/IP/hora.
- **Replay protection**: campo `created` do evento Stripe vs `now()`, rejeita > 5 min.
- **Anti-tampering**: server reusa `getPricing(lang)` autoritativo, ignora qualquer `amount` do client.
- **`/obrigado?order=` sem order válido**: 404 friendly.
- **Logs**: `audit_logs` table — escrever em cada `paid`/`failed`/`refunded`.

## D7 — i18n dos textos novos

Adicionar a `landing.checkout.*` em PT/EN/PL/RO/AR:
- `unlockCta`, `bumpsTitle`, `bump1Title/Desc`, `bump2Title/Desc`, `securePayment`, `moneyBackGuarantee`, `verifying`, `paymentFailed`, `retryPayment`.

## D8 — Smoke test

Antes de fechar a fase:
1. Quiz completo → reveal → checkout (Stripe test mode card `4242 4242 4242 4242`).
2. Webhook recebido em ≤3s → order `paid`.
3. `/obrigado?order=…` gera PDF + envia email Brevo.
4. Refresh em `/obrigado?order=…` → usa cache do `pdf_generations` (não regenera).
5. Card `4000 0000 0000 0002` (decline) → order `failed` → UI mostra retry.
6. Webhook duplicado → 200 OK sem efeito (idempotência via `stripe_events`).

## Detalhes Técnicos

- **Stripe API**: chamada REST direta (`fetch` com `Authorization: Bearer ${STRIPE_SECRET_KEY}`). Evita o SDK Node-only no Worker.
- **Webhook URL fixa**: `https://thoughtsculpt-engine.lovable.app/api/public/stripe/webhook` (estável, prod). Tu configuras no painel Stripe depois do deploy.
- **Test vs Live**: o mesmo código serve. Secret atual é live ou test conforme o `STRIPE_SECRET_KEY` definido. Para a Fase D, recomendo modo **test** até validares ponta a ponta.
- **`createServerFn` público**: `createCheckoutSession` não usa `requireSupabaseAuth` — quiz é pré-login. Validação por `lead.id` + `lead.winner` é suficiente; rate limit por IP cobre abuso.

## O Que Não Entra Nesta Fase

- Conta de utilizador / login (vem depois, Fase E).
- Subscrições recorrentes (tabela `subscriptions` fica intocada).
- Order bumps no PDF gerado (afeta só `total_amount` no Stripe; o PDF já é único pelo arquétipo).
- Recibo/invoice — Stripe envia automaticamente se `customer_email` estiver presente.

## Ordem de Implementação

1. D1 (migration `orders` + `stripe_events` + RPC) — primeiro, base de tudo.
2. D3 (server fn checkout) — testável isoladamente com curl.
3. D4 (webhook) — depende de D1, testável com `stripe trigger`.
4. D5 (gating /obrigado) — depende de D1+D4.
5. D2 (CTA no reveal) — wires tudo no front.
6. D6+D7 (hardening + i18n) — polish.
7. D8 (smoke).

Confirma e arranco por D1.
