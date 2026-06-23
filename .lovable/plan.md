
# Opção A — Checkout de alta conversão (sem fricção dupla)

Objetivo: eliminar o formulário falso de cartão, levar o usuário direto ao Stripe Checkout (hosted), e cercar a transição com elementos de conversão para mirar ≥30%.

---

## 1) Página do produto (`CheckoutStub.tsx`) — redesenho focado em conversão

Remover por completo o painel direito (email/cartão/exp/cvc/nome falsos). A página passa a ser uma **landing de pré-checkout** centrada (1 coluna em mobile, 2 colunas em desktop com lado direito = "trust stack"), com:

### Acima do CTA (lado esquerdo / topo)
- **Headline curta** ("A 1 clique do teu diagnóstico") — em 5 idiomas.
- **Order Summary** (já existe) com:
  - Item principal + descrição
  - Bumps clicáveis (mantém atual)
  - **De/Por riscado** no item principal (preço ancora): ex. ~~R$ 149,90~~ → **R$ 49,90** (-66%)
  - **Badge "Oferta única — não reaparece"** abaixo do total
  - **Countdown discreto de 10 min** (sessão), reseta se sair — cria urgência sem ser cafona
- **Total** grande + microcopy "Pagamento único · Sem renovação"

### CTA primário (substitui o form falso)
- Botão GIGANTE: **"Pagar [Total] com segurança →"** (full-width, altura 64px desktop / 56px mobile)
- Microtexto abaixo: "Serás levado(a) para o ambiente seguro do **Stripe**. Aceitamos cartão, Apple Pay, Google Pay e Pix¹."
- ¹Pix só PT/BR — mostrar condicional por `lang`.
- Loading state: spinner + "A abrir checkout seguro…" (evita double-click)

### Lado direito — Trust Stack (novo componente `TrustStack`)
Sticky em desktop, acordeão em mobile. Conteúdo:
1. **Garantia 7 dias** — ícone shield + "Reembolso integral, sem perguntas"
2. **Pagamento processado por Stripe** — logo Stripe + "Mesma infra de Apple, Google, Amazon"
3. **SSL 256-bit · PCI-DSS Nível 1** — nunca tocamos no teu cartão
4. **Entrega em minutos** — PDF no email assim que pagares
5. **Mini-depoimento** (1 só, curto, com nome+foto+arquétipo) — prova social no momento da decisão
6. **FAQ rápido (3 perguntas)** — accordion:
   - "Vou ter que assinar algo?" → Não, pagamento único.
   - "E se não gostar?" → 7 dias, reembolso total.
   - "Quanto tempo até receber?" → Minutos, no email.

### Below the fold (mobile)
- Repete CTA fixo no rodapé (sticky bottom bar com Total + botão) — padrão Shopify mobile, +5-10% conversão mobile.

---

## 2) Transição → Stripe (server: `checkout.functions.ts`)

Otimizar a Stripe Checkout Session para máxima conversão:

- `payment_method_types`: **omitir** → Stripe auto-detecta e habilita Apple Pay / Google Pay / Link / cartão / métodos locais (Pix p/ BRL, BLIK p/ PLN, etc).
- `payment_method_options[card][request_three_d_secure]`: `automatic` (default — não forçar).
- `customer_creation`: `always` — habilita Link (auto-fill de cartão = +conversão recorrente).
- `phone_number_collection`: `disabled` (fricção desnecessária p/ produto digital).
- `billing_address_collection`: `auto` (Stripe decide pelo método).
- `allow_promotion_codes`: `true` (campo de cupom — usaremos depois p/ recuperação de carrinho).
- `consent_collection[terms_of_service]`: `none` (já aceitamos antes; evita 1 clique extra).
- `locale`: já está ok (pt-BR, pl, ro, ar, en).
- `custom_text[submit][message]`: **microcopy de fechamento** ("Garantia 7 dias · Entrega imediata por email") — aparece acima do botão "Pagar" do Stripe. Isso é o elemento que pediste DENTRO do Stripe.
- `custom_text[after_submit][message]`: "Estamos a preparar o teu diagnóstico…" (pós-clique, antes do redirect).
- `payment_intent_data[description]`: "Diagnóstico Comportamental — [Arquétipo]" (aparece na fatura do cartão = reduz chargeback).
- `payment_intent_data[statement_descriptor_suffix]`: "MINDRESET" (mesmo motivo).
- `expires_at`: `now + 30min` (libera estoque/intenção, força decisão).
- `success_url`: já redireciona p/ `/obrigado?order=...&session_id={CHECKOUT_SESSION_ID}` — adicionar `session_id` p/ analytics.
- `cancel_url`: novo destino → `/?canceled=1&recover=[orderId]` (vamos exibir banner "Quase lá! Retoma onde paraste" — recuperação).

---

## 3) Analytics & tracking de conversão (mínimo viável)

Adicionar eventos em `src/lib/analytics.ts`:
- `checkout_viewed` (entrou na página do produto)
- `bump_toggled` (qual bump, on/off)
- `checkout_cta_clicked` (clicou em pagar)
- `stripe_session_created` (server confirmou)
- `checkout_canceled` (voltou via cancel_url)
- `purchase_completed` (webhook → frontend via `/obrigado`)

Sem isso, não dá pra medir os 30%. Stack: já existe `posthog` no projeto (pelos MCPs). Confirmar.

---

## 4) Recuperação de carrinho (cancel_url)

Na home, se vier `?canceled=1&recover=X`:
- Banner topo: "Voltaste? O teu diagnóstico ainda está reservado por 30 min. **Continuar →**"
- Botão chama `createCheckoutSession` de novo com mesmo `orderId` (reaproveita order pending).

---

## 5) Arquivos afetados

| Arquivo | Mudança |
|---|---|
| `src/components/funnel/CheckoutStub.tsx` | Remover form fake; adicionar countdown, preço-âncora, sticky mobile CTA, microcopy de trust |
| `src/components/funnel/TrustStack.tsx` (novo) | Componente trust stack + mini-FAQ + depoimento |
| `src/components/funnel/CountdownPill.tsx` (novo) | Countdown 10min discreto |
| `src/lib/payments/checkout.functions.ts` | Adicionar custom_text, expires_at, customer_creation, allow_promotion_codes, statement_descriptor, description |
| `src/lib/i18n/translations.ts` | +chaves `checkout.*` (headline, trust items, FAQ, microcopy) nos 5 idiomas |
| `src/lib/i18n/types.ts` | Tipos das novas chaves |
| `src/routes/index.tsx` | Banner de recuperação se `?canceled=1` |
| `src/lib/analytics.ts` | Eventos novos |

---

## 6) Detalhes técnicos relevantes

- Stripe auto-habilita Apple/Google Pay quando o domínio está registrado em Stripe Dashboard → **TODO p/ ti**: registrar `thoughtsculpt-engine.lovable.app` em Settings → Payment Methods → Apple Pay → Add domain. Sem isso, AP não aparece (perda de ~20% mobile).
- Pix exige Stripe BR ativo na conta. Confirmar.
- Link (autofill Stripe) só funciona se `customer_creation: always` E o user já tiver Link em outro merchant. Ativar e deixar Stripe decidir.
- `expires_at` >30min é o mínimo do Stripe.
- Countdown é UI-only (não bloqueia compra após expirar — só cria urgência). Se quiseres bloqueio real, é outra fase.

---

## 7) Fora de escopo (proposto p/ depois — Fase G+)

- A/B test de headline e preço-âncora (precisa de tráfego mínimo)
- Email de recuperação de carrinho abandonado (precisa cron + template)
- Upsell pós-compra na `/obrigado` (one-click via saved payment method)
- Order bump dinâmico baseado em arquétipo (AO vê bump1, HI vê bump2, etc)

---

## 8) Resultado esperado

- Elimina re-digitação de cartão (-15-30% abandono recuperado)
- Apple/Google Pay ativos = +20-30% mobile
- Trust stack lateral + microcopy dentro do Stripe = redução de "vou pensar"
- Countdown + preço-âncora = urgência + valor percebido
- Cancel recovery = recupera 5-10% dos que saem

**Estimativa: passar de ~baseline atual para 25-35% em 2-4 semanas com tráfego real.** Os 30% são alcançáveis se o tráfego YouTube for qualificado.

Aprova p/ implementar?
