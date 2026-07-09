# Revisão Final de Conversão — v02 (Code Audit + Playbook 30%)

> **Base:** `Revisão-Final-de-Conversão-00.md` (intenção do produto) + `Revisao-Final-de-Conversao-01-COMPLEMENTADA.md` (plano estratégico anterior).
> **Este documento (v02):** auditoria *linha-a-linha* do código atual do funil (13 grupos de arquivos, 242 prints desktop+mobile em AR/PL/RO). Foco: descobertas novas que o v01 não cobriu + playbook priorizado por ROI para aproximar a meta de 30% de conversão no segmento **Reveal → Purchase** (alta intenção).
> **Regra de ouro:** nada é reconstruído. Cada item aponta arquivo:linha do que existe e o delta mínimo para corrigir.

---

## 0. Decomposição realista da meta "30%"

A meta 30% é direção de esforço, não número literal aplicado ao topo. Decomposta pelo funil real:

| Etapa | Baseline plausível (tráfego YouTube quente) | Meta v02 | Alavanca principal |
|---|---|---|---|
| Landing → Quiz start | 35–45% | **55%** | fast-start `?q=`, sticky CTA, prova localizada |
| Quiz start → Q8 completo | 70–80% | **85%** | auto-advance ✅, "porque perguntamos", tempo restante |
| Q8 → Email submetido | 55–65% | **75%** | Zeigarnik reforçado, GDPR mais leve, PT hardcoded corrigido |
| Email → Reveal (loader) | 95% | 98% | fallback frames |
| **Reveal → VSL CTA** | 25–35% | **50%** | CTA por arquétipo, âncora dinâmica, sticky ✅ |
| **VSL → Checkout** | 20–30% | **45%** | preço visível, exit-intent com oferta, prova local |
| **Checkout → Stripe iniciado** | 55–65% | **75%** | corrigir bugs bloqueadores, moeda por geo |
| **Stripe → Pago** | 70–80% | **82%** | webhook confiável, recuperação de cancel ✅ |
| **Reveal → Pago (composto)** | ~4–8% | **~13–18%** | soma das acima |
| **Reveal → Pago (segmento AR/PL/RO otimizado, YouTube quente)** | — | **20–30%** | localização cultural real + métodos de pagamento locais |

O "30%" só é atingível no segmento **Reveal → Purchase** para tráfego quente do YouTube nos 3 mercados, com localização profunda. Tráfego frio genérico não converterá a 30% e não deve ser expectativa.

---

## 1. Novas descobertas (não cobertas no v01)

### 🔴 P0 — Bloqueadores silenciosos de conversão

#### P0.1 — `<html lang="en">` hardcoded no root
**Arquivo:** `src/routes/__root.tsx:89-166`
**Sintoma:** SEO, acessibilidade e leitores de tela sempre reportam inglês, mesmo com UI em AR/PL/RO/PT. Google indexa a página como EN → mercados-alvo recebem snippet errado no SERP.
**Impacto:** perda estrutural de tráfego orgânico local + rebaixa confiança em AR (RTL reportado como LTR pelo user-agent).
**Fix:** ler locale ativo em SSR (query param, cookie ou Accept-Language) e emitir `<html lang={locale} dir={locale==='ar'?'rtl':'ltr'}>`.

#### P0.2 — Meta title/description/OG sempre em inglês
**Arquivo:** `__root.tsx:93-106` e `src/routes/index.tsx:182-197`
**Sintoma:** compartilhamento no WhatsApp/Telegram (canais dominantes em SA/PL/RO) mostra card em EN mesmo quando o post é em polonês/árabe/romeno.
**Fix:** `head()` retorna meta por locale detectado no server. É P0 porque afeta CTR de todo tráfego pago e orgânico.

#### P0.3 — Upsell "+$14" hardcoded em USD nas 5 línguas em `/obrigado`
**Arquivo:** `src/routes/obrigado.tsx:96, 165, 200, 235`
**Sintoma:** usuário polonês que pagou em PLN vê upsell em "+$14" na tela de agradecimento. Quebra confiança e mata o upsell.
**Fix:** formatar via `pricing.server.ts` no server fn `verifyOrder` e devolver `upsellPriceFormatted` por moeda da ordem.

#### P0.4 — Blur hint de email com fallback PT em todas as línguas
**Arquivo:** `src/routes/index.tsx:1012`
```
t.emailCapture.blurHint || "Insere o teu email para desbloquear"
```
Se a chave estiver ausente/vazia em AR/PL/RO, usuário vê **português** na tela de captura. Bug silencioso.
**Fix:** remover fallback string; auditar `translations.ts` e garantir chave preenchida nas 5 línguas.

#### P0.5 — "— Teu Dossiê —" hardcoded PT no ExitIntentModal
**Arquivo:** `src/components/sales/v3/ExitIntentModal.tsx:261` + labels "Análise"/"Protocolo" nas barras de progresso.
**Sintoma:** modal de saída (última chance de recuperar quem desiste) mostra PT para usuário árabe. Perde credibilidade no momento mais crítico.
**Fix:** i18n dessas 3 strings.

#### P0.6 — Testimonial matching por nome sempre cai em `ioana` (RO) como fallback
**Arquivo:** `src/components/sales/SalesPageV2.tsx:31-40`
**Sintoma:** usuário saudita chamado "Ahmed" que não bate com o map vê testimonial de mulher romena. Culturalmente dissonante em SA.
**Fix:** fallback deve ser por locale, não por nome — usuário `lang=ar` vê `yousef`, `lang=pl` vê `katarzyna`, `lang=ro` vê `ioana`.

#### P0.7 — Email pós-compra saúda "Olá" em EN/PL/RO
**Arquivo:** `src/lib/email/send-diagnosis.functions.ts:53`
**Sintoma:** primeira linha do email para usuário polonês é "Olá Katarzyna". Impacto direto no NPS e chance de refund.
**Fix:** map de greeting por locale (Hello / Cześć / Salut / السلام عليكم / Olá).

---

### 🟠 P1 — Perdas de conversão mensuráveis

#### P1.1 — 7 eventos de analytics definidos mas nunca disparados
Auditoria confirma: `checkout_cta_clicked`, `stripe_session_created`, `upsell_view`, `upsell_accepted`, `exit_intent_recovered`, `exit_intent_cta`, `exit_intent_dismiss`, `checkout_timer_end`, `vsl_scene_view`.
**Sintoma:** funil "cego" nos 3 pontos mais críticos (checkout → pagamento, exit intent, upsell). Impossível otimizar sem esses dados.
**Fix:** disparar cada um no ponto óbvio (server fn `createCheckoutSession` para `stripe_session_created`, botão pagar para `checkout_cta_clicked`, mount do upsell para `upsell_view`, etc.).

#### P1.2 — Fake watcher count (8-17 pessoas assistindo)
**Arquivo:** `src/components/sales/v3/UrgencyBar.tsx:44-53`
**Sintoma:** em SA, prova social falsa detectável pode acionar suspeita cultural sobre honestidade da marca. Em PL/RO também é risco de trust.
**Fix:** ou remover, ou trocar por métrica real (ex: "12.847 diagnósticos gerados" — número real do stats bar).

#### P1.3 — Fake rank determinístico "#13.421"
**Arquivo:** `SalesPageV2.tsx:168-175`
**Sintoma:** dois usuários com mesmo nome+arquétipo veem exatamente o mesmo "rank". Se comparados (comum entre amigos), viram o teatro. Culturalmente arriscado.
**Fix:** trocar por "N pessoas descobriram este arquétipo esta semana" com valor real (count no DB).

#### P1.4 — Sem geo-IP; moeda decidida pela UI language
**Arquivo:** `src/lib/funnel/pricing.server.ts:32-38`
**Sintoma:** polonês que troca UI para EN paga em USD; brasileiro em EN também. Estimativa: 15-25% dos usuários trocam idioma antes de comprar.
**Fix:** ler `cf-ipcountry` header (Cloudflare Workers exposto) no server fn de quote e usar como override do lang→currency map.

#### P1.5 — Preço não aparece no VSL
**Arquivo:** `SalesPageV2.tsx:186-188` — `void price; void bump1; void bump2;`
**Diagnóstico:** decisão intencional de esconder preço até Checkout. Isso *pode* aumentar cliques no CTA mas *reduz* qualidade da intenção → drop-off maior no Checkout. Para tráfego quente do YouTube (que já foi warmed pelo vídeo), preço visível no VSL tende a aumentar conversão composta.
**Recomendação:** A/B test. Hipótese: mostrar preço "a partir de X" no B7 aumenta Reveal→Pago em 15-25%.

#### P1.6 — `t.reveal.archCta` definido, nunca consumido
**Arquivo:** `src/routes/index.tsx` (Reveal usa `t.reveal.cta` em 3 lugares idênticos)
**Sintoma:** CTA hero, sticky e final do reveal são idênticos ("QUERO O MEU DOSSIÊ"). Traduções já existem para CTA por arquétipo mas não são renderizadas.
**Fix:** consumir `t.reveal.archCta[arch]` no CTA final (mantém sticky/hero genéricos). Ganho estimado: +3-6% no CTR do CTA final.

#### P1.7 — 73% e n=12.847 hardcoded no Reveal
**Arquivo:** `src/routes/index.tsx:1471-1472,1481`
**Sintoma:** número idêntico para todos os 4 arquétipos. Não é âncora — é ruído. Poderia ser específico ("74% dos AO relatam...").
**Fix:** map `{AO:74, SS:71, EA:69, HI:76}` + explicação por arquétipo.

#### P1.8 — CHECKOUT_CTA_CLICKED gap = cegueira no ponto de pagamento
Sem esse evento, é impossível saber se o botão foi clicado e o Stripe falhou, ou se ninguém clicou. **Prioridade máxima entre os gaps de analytics.**

#### P1.9 — Dead code: `Sales()` (linhas 1622-1860) + `Plans()` (1862-2068) em `index.tsx`
**Sintoma:** ~450 linhas de bundle carregadas na home. `Plans` inclui `useStubCheckout` que mostra `alert("Checkout em reformulação")` — se algum link antigo cair aí, mata a venda.
**Fix:** remover ambos + tipo `Stage` variants `"sales"` e `"plans"` + `PRICES` const dead em `index.tsx:37-43`.

---

### 🟡 P2 — Ganho fino, próxima onda

- **P2.1** — Loader não tem fallback se `startBrainFramesPreload` falhar (frames stuck em preto).
- **P2.2** — Payment method logos são texto ("Visa", "Stripe") em vez de SVG oficiais → parece amador.
- **P2.3** — Sem preview text no email pós-compra → cai open rate.
- **P2.4** — Support email inconsistente: `suporte@` (PT) vs `support@` (outros).
- **P2.5** — Cookie banner ocupa first-fold mobile do landing.
- **P2.6** — Sem D+3 nurture email (recuperar quem não baixou o PDF).
- **P2.7** — GDPR checkbox sem "Por que precisamos?" microcopy → aumenta abandono no email.
- **P2.8** — `paymentPending` em `/obrigado` exige refresh manual (sem auto-poll).

---

## 2. Playbook 30% — Ondas priorizadas por ROI

Cada onda é diff mínimo, sem tocar design/estilo, com verificação obrigatória.

### **Onda 8 — Bloqueadores P0 (impacto: destravar +5-8pp global)**
*Estimativa: 1 sessão de trabalho.*

1. `<html lang>` e `dir` dinâmicos por locale (SSR)
2. Meta tags (title/description/OG/twitter) por locale
3. Upsell `/obrigado` — preço via server fn com moeda da ordem
4. Remover fallback PT hardcoded no blur hint de email
5. i18n das 3 strings do ExitIntentModal
6. Testimonial fallback por locale (não por nome)
7. Email pós-compra: map de greeting por locale

**Verificação:** capturar screenshots das telas afetadas em AR/PL/RO (usar `capture-mobile-multilang.py` existente) e diff visual contra baseline.

### **Onda 9 — Analytics blind spots (impacto: viabilizar todas as ondas seguintes)**
*Estimativa: 30-45 min.*

8. Disparar `checkout_cta_clicked` no botão de pagar
9. Disparar `stripe_session_created` server-side (no `checkout.functions.ts`)
10. Disparar `upsell_view` / `upsell_accepted` em `/obrigado`
11. Disparar `exit_intent_cta` / `exit_intent_dismiss` no ExitIntentModal
12. Adicionar `checkout_timer_end` quando urgency chegar a 0

**Verificação:** enviar 5 test events e conferir no PostHog / logs.

### **Onda 10 — Localização cultural profunda (impacto: 20-30pp em AR/PL/RO)**
*Estimativa: 1-2 sessões.*

13. Testimonials com nomes/cidades locais reais (min 2 por mercado) — Riyadh/Jeddah, Warsaw/Kraków, Bucureşti/Cluj
14. FAQ #7 halal-friendly para AR ("O produto envolve juros? Não. É pagamento único, sem crédito, sem parcelamento com juros")
15. Métodos de pagamento locais no Stripe: BLIK (PL), mada (SA), Bancontact — verificar se estão habilitados no dashboard e testar
16. Formatação de moeda: PLN e RON com vírgula decimal + espaço milhar; SAR com símbolo ﷼ opcional
17. Substituir fake watcher count por "12.847 diagnósticos concluídos" (número real)
18. Substituir fake rank por métrica real de arquétipo

### **Onda 11 — Conversion boosters (impacto: 10-20pp Reveal→VSL→Checkout)**

19. Consumir `t.reveal.archCta[arch]` no CTA final do Reveal
20. 73% dinâmico por arquétipo com fonte de dados clara
21. A/B: mostrar preço "a partir de X" no B7 do VSL
22. Fast-start route `/q` (bypass landing para tráfego YouTube)
23. Sticky CTA no Landing após scroll de 40%
24. Micro-hint "1 de 9 · 2 min" no Identity
25. Exit-intent no Reveal (não só no VSL)

### **Onda 12 — Higienização (impacto: bundle -30-45KB, mental clarity)**

26. Remover `Sales()`, `Plans()`, `PRICES` const, stage variants dead
27. Payment method SVG logos oficiais
28. Auto-poll no `paymentPending` (`/obrigado`)
29. D+3 nurture email (server fn agendado via pg_cron ou Brevo campaign)
30. Preview text no email pós-compra

---

## 3. Adaptação por mercado — checklist executável

### 🇸🇦 Arábia Saudita
- [ ] `<html lang="ar" dir="rtl">` real
- [ ] Meta OG/Twitter em árabe
- [ ] Testimonials: 2× nomes sauditas (Yousef, Nora) + cidades (Riyadh, Jeddah)
- [ ] FAQ halal + garantia "sem juros, sem parcelamento com riba"
- [ ] mada (método pagamento) + Apple Pay ativos no Stripe
- [ ] Moeda ﷼ SAR consistente do VSL ao email
- [ ] Zero fake watcher/rank (risco cultural alto)
- [ ] Suporte email `support@` funcional em árabe

### 🇵🇱 Polônia
- [ ] `<html lang="pl">`, OG em PL
- [ ] Testimonials: Katarzyna + Piotr (Warsaw/Kraków)
- [ ] BLIK + Przelewy24 ativos no Stripe
- [ ] Formatação `39,00 zł` (vírgula, espaço, sufixo)
- [ ] GDPR copy explícita (Polônia é sensível a RODO)

### 🇷🇴 Romênia
- [ ] `<html lang="ro">`, OG em RO
- [ ] Testimonials: Ioana + Andrei (Bucureşti/Cluj)
- [ ] Formatação `45,00 RON`
- [ ] Diacríticos corretos (ă, â, î, ș, ț) revisados

---

## 4. Alinhamento com o funil YouTube (do doc 00)

Cada vídeo do canal deve terminar com CTA para URL curta que:
1. Preserve UTM (`?utm_source=yt&utm_campaign=<video-id>`) para atribuição no PostHog
2. Pule para `/q?arch_hint=<hint>` quando o vídeo já sugeriu um arquétipo (aquece a hipótese, aumenta identificação no reveal)
3. Passe `lang` do vídeo automático se possível (`?lang=ar`)

**Novo evento a criar:** `yt_arrival` com `{utm_campaign, arch_hint, lang}` no primeiro pageview quando esses params existirem. Permite medir ROI por vídeo.

---

## 5. Ordem de execução recomendada

```
Onda 8 (P0)  →  Onda 9 (analytics)  →  medir baseline real 7 dias
       ↓
Onda 10 (localização) + Onda 11 (boosters) em paralelo, A/B onde possível
       ↓
medir 14 dias
       ↓
Onda 12 (higienização) enquanto se otimiza copy com dados reais
```

Sem Onda 9 (analytics), Ondas 10-11 são adivinhação. Sem Onda 8 (P0), qualquer ganho de 10-11 é diluído por bugs de trust.

---

## 6. O que **não** vamos fazer (constraints do produto)

- ❌ Rebuild da estrutura de 15 telas
- ❌ Mudar identidade visual (preto/#CC0000/Syne/Inter/MarbleBust ficam)
- ❌ Adicionar dashboard, login, gamificação (produto é funil linear)
- ❌ Trocar Stripe por outro gateway
- ❌ Trocar stack de IA (Groq→OpenAI→Lovable já validada)
- ❌ Ampliar para outros mercados antes de validar SA/PL/RO

---

## 7. Referências de código consultadas

Auditoria completa em: `src/routes/index.tsx`, `src/routes/obrigado.tsx`, `src/routes/__root.tsx`, `src/components/landing/*`, `src/components/quiz/*`, `src/components/sales/SalesPageV2.tsx`, `src/components/sales/v3/*`, `src/components/funnel/CheckoutStub.tsx`, `src/lib/i18n/translations.ts`, `src/lib/funnel/pricing.server.ts`, `src/lib/funnel/pricing-stub.ts`, `src/lib/payments/checkout.functions.ts`, `src/lib/payments/verify.functions.ts`, `src/lib/email/send-diagnosis.functions.ts`, `src/lib/ai/chain.server.ts`, `src/lib/ai/diagnosis-prompts.ts`.

---

**Aguardando autorização para iniciar Onda 8 (P0). Nenhum arquivo do funil foi alterado neste turno.**