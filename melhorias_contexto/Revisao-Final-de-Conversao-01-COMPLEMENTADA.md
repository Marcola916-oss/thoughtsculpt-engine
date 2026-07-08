# Revisão Final de Conversão — v01 COMPLEMENTADA

> **Base:** `Revisao-Final-de-Conversao-00.md` (visão estratégica do fundador)
> **Complemento:** análise técnica ponta-a-ponta baseada nos **242 prints** em `.lovable/screenshots/` (desktop 1440×1800, pt-PT) e `.lovable/screenshots/mobile-low/{ar,pl,ro}/` (mobile 375×667, RTL/diacríticos), + leitura direta do código (`src/components/**`, `src/routes/index.tsx`, `src/lib/funnel/pricing.server.ts`, `src/lib/payments/checkout.functions.ts`).
> **Meta declarada:** 30% de conversão. **Meta operacional realista** (ver §2): 30% no segmento **Reveal → Purchase**; 3-6% no segmento **Landing → Purchase**.
> **Data:** 2026-07-08 · **Idiomas alvo:** AR (SA), PL, RO — tráfego YouTube.

---

## 0. TL;DR — o que muda em relação ao doc 00

O doc 00 está estrategicamente correto, mas é **direcional**. Este complemento traduz cada princípio em **intervenção concreta**, com **evidência visual** (prints) e **arquivo/linha** a tocar. Descobertas centrais depois de rever os 242 prints:

1. **O maior leak silencioso é moeda geo-incorreta.** Todos os checkouts em SA/PL/RO mostram `R$` ou `EUR` (ver `mobile-low/{ar,pl,ro}/08-checkout-01.png` e desktop `08-checkout-01.png`). Um sauditá vendo Real brasileiro fecha a aba. Fix está em `src/lib/funnel/pricing.server.ts` + resposta de `getLocalPrice` — não é reescrita, é mapping.
2. **Bug de concatenação de título "Arquétipo arquétipo:"** visível em `08-checkout-01.png` em TODOS os idiomas — quebra a percepção de "produto validado".
3. **CTA vermelho `#CC0000` não é sistemático.** Alguns CTAs herdam `--arch-primary` (azul AO, roxo SS, etc). Para conversão isso é ruído: o cérebro treina *um* botão de compra. Fix é usar sempre `#CC0000` no CTA de compra e reservar `--arch-primary` para o *conteúdo* do reveal.
4. **Landing (11 viewports mobile) está longa demais para tráfego YouTube.** Quem vem de vídeo já foi "aquecido" — a landing precisa de rota curta *quiz-first*. Recomendação: variante `/q` que abre direto na Tela 0 (identidade), mantendo `/` como landing SEO/orgânico.
5. **VSL de 20 viewports mobile é maratona.** Alto risco de scroll-fatigue. A intervenção de maior ROI é **sticky offer bar mobile** (componente já existe: `StickyOfferBar.tsx`) forçada em ativação a partir de 40% de scroll — hoje aparece tarde demais.
6. **Reveal (Tela 11) é a melhor tela do funil, mas o CTA "Quero acessar meu protocolo" está no fundo depois de ~4035px.** Precisa de sticky mobile + CTA repetido no fim do bloco "Anatomia do Padrão".
7. **Falta rastreio.** Sem PostHog/GA4/Meta Pixel disparando eventos por etapa, não dá para otimizar 30%. **Isto é pré-requisito 0** antes de qualquer outra onda.
8. **Localização cultural, não só tradução.** Nomes em testemunhos, cidades, moedas, métodos de pagamento (BLIK PL, mada SA, bancos RO), formatação de VAT.

---

## 1. Diagnóstico visual do funil atual (com evidência)

Leitura print-a-print. Cada linha é uma observação factual + intervenção priorizada.

### 1.1 Landing Page — `01-landing-01…05.png` (desktop) / `01-landing-01…12.png` (mobile)

**Observado:**
- Hero forte com H1 + CTA + MarbleBust. Bom.
- 11 blocos empilhados (Hero, ProofBar, ArchetypeShowcase, HowItWorks, FeaturesGrid, Testimonials, FAQ, FinalCTA, Footer). Em mobile são **11-12 viewports** para chegar ao FinalCTA.
- Cookie banner persiste em quase todos os prints — ocupa altura fixa útil no primeiro fold mobile.
- Testimonials sem cidade/país próximos ao mercado (falta "Ryiadh", "Warszawa", "București").

**Intervenções:**
| # | Ação | Ficheiro | Onda |
|---|---|---|---|
| L1 | Rota `/q` que abre em Tela 0 (identity) direto, para links de descrição do YouTube | novo route `src/routes/q.tsx` + `setStage({kind:"identity"})` | 8 |
| L2 | Sticky CTA "Fazer o Quiz (2 min)" no topo da landing após scroll > 400px | componente pequeno em `src/components/landing/StickyStart.tsx` | 9 |
| L3 | Substituir 3 testimonials genéricos por locais: 1 SA (masc, Riyadh), 1 PL (fem, Warszawa), 1 RO (masc, București) | `src/lib/i18n/translations.ts` | 10 |
| L4 | ProofBar: número "sem banco" trocar por "sem partilhar dados bancários" (mercado SA sensível) | i18n | 10 |
| L5 | FAQ: adicionar pergunta "É halal? Cobra juros?" só em `ar` | i18n `ar.landing.faq.*` | 10 |

### 1.2 Tela 0 — Identidade (`02-identidade.png`, `02b-identidade-preenchida.png`)

**Observado:** curta, 2 campos. Ótima. Botão "Continuar" só ativa quando ambos preenchidos — bom.

**Intervenções:**
| # | Ação | Onda |
|---|---|---|
| I1 | Micro-hint acima do input: "1 de 9 · 2 minutos" (progresso desde já) | 9 |
| I2 | AR: garantir que placeholder do input está em árabe *e* alinhado à direita (validar em `02-identidade.png` de `ar/`) | 8 |

### 1.3 Quiz 1-8 (`03-quiz-01…08.png`)

**Observado:**
- Barra de progresso presente, boa.
- 4 opções A/B/C/D com bom espaçamento em desktop; em mobile a área tap é aceitável mas o texto de opções longas quebra 3 linhas.
- Sem indicador de tempo restante ("~15s por pergunta"), sem *auto-advance* ao clicar.

**Intervenções:**
| # | Ação | Onda |
|---|---|---|
| Q1 | Auto-advance 250ms após clicar em opção (elimina o clique "Próximo") | `QuizOption.tsx` + parent | 8 |
| Q2 | Rótulo "Pergunta N de 8 · faltam ~M min" acima da pergunta | i18n | 9 |
| Q3 | Confirmação suave micro-animation (check verde 300ms) antes de avançar | `QuizOption.tsx` | 9 |
| Q4 | Perguntas 6-8: adicionar frase de "por que isto importa" abaixo (aumenta percepção de profundidade) | i18n | 11 |

### 1.4 Captura de e-mail (`04-email.png`, `04b-email-preenchido.png`)

**Observado:** headline personalizada com nome — bom. Checkbox de privacidade obrigatório — necessário para GDPR/PL/RO mas cria fricção. Autofill já corrigido (Onda 1).

**Intervenções:**
| # | Ação | Onda |
|---|---|---|
| E1 | Reforço de valor visível ("Enviamos o teu diagnóstico em PDF de 14 páginas por e-mail — sem spam, cancelas com 1 clique") | i18n | 8 |
| E2 | Trocar copy do checkbox de "Aceito a política" para consentimento explícito curto exigido por GDPR: "Aceito receber o meu diagnóstico e comunicações da MindReset. Posso sair a qualquer momento." | i18n | 8 |
| E3 | Botão social de continuar com Google (opcional, reduz digitação mobile) | `src/routes/index.tsx` + Supabase auth | 12 |
| E4 | AR: garantir keyboard `type="email"` + `dir="ltr"` no input (endereço é sempre LTR mesmo em página RTL) | 8 |

### 1.5 Loader (`05-loader.png`, `05b-loader-mid.png`, `05c-loader-late.png`)

**Observado:** MarbleBust + neural loader + textos rotativos. Muito bom visualmente. Duração ~10s parece adequada para "processamento real". Textos rotativos em EN foram corrigidos (Onda 5).

**Intervenções:**
| # | Ação | Onda |
|---|---|---|
| Ld1 | Adicionar textos progressivos personalizados: "A analisar as tuas respostas de {NOME}…", "A cruzar padrões com {N} outros perfis…", "A preparar o teu diagnóstico" | i18n + `NeuralLoader.tsx` | 9 |
| Ld2 | Ao invés de tempo fixo, ligar o loader ao próprio término do request de scoring (evita loader "vazio" enquanto backend já respondeu) | `src/lib/quiz.functions.ts` handoff | 11 |

### 1.6 Reveal — Tela 11 (`06-reveal-01…03.png` desktop / `06-reveal-01…07.png` mobile)

**Observado:** tela mais forte, correta. Bug de bloqueio: CTA está a ~4000px, e o mobile tem 7 viewports. Scores das 4 áreas com números concretos (91/77/…/68) — excelente ancoragem.

**Intervenções:**
| # | Ação | Onda |
|---|---|---|
| R1 | **CTA sticky bottom mobile** desde o primeiro scroll ("Ver o meu protocolo →") | novo componente reusar `StickyOfferBar` variant sem preço | 9 |
| R2 | CTA intermediário logo após o bloco "Anatomia do Padrão" (não esperar o fim) | `src/components/identity/ArchetypeRevealHero.tsx` ou o que compõe reveal | 9 |
| R3 | Adicionar "prova social específica do arquétipo": "1.847 pessoas com o mesmo padrão (AO) já receberam o seu protocolo" — dinâmico por arquétipo | i18n + hook | 11 |
| R4 | Explicar cada score em 1 linha ("Dinheiro 91: sinal muito forte de compulsão de retenção") — hoje o número está solto | i18n | 10 |

### 1.7 VSL / Página de Vendas — Tela 12 (`07-sales-01…08.png` / mobile `07-sales-01…20.png`)

**Observado:** 8 blocos desktop, **20 viewports mobile**. Estrutura correta (Hero → Pain → Ciência → Deliverables → Bridge → Trust → Testemunhos → Guarantee → CTA). Exit-intent modal existe (`07b-exit-intent.png`) — bom.

**Intervenções:**
| # | Ação | Onda |
|---|---|---|
| V1 | Sticky offer bar mobile ativa a partir de 30% scroll (hoje aparece tarde) — usar `StickyOfferBar.tsx` já criado | 8 |
| V2 | Reduzir 3 testemunhos → 3 testemunhos locais (SA/PL/RO) com foto realista + cidade | i18n | 10 |
| V3 | UrgencyBar honesta (não fake countdown): "Preço promocional válido até fim do mês" — evita quebra de confiança (SA especialmente) | `UrgencyBar.tsx` | 9 |
| V4 | Trust bar: adicionar selos Visa, Mastercard, mada (SA), BLIK (PL) — via SVG local, não hotlink | 11 |
| V5 | Guarantee bloco: reforçar "reembolso 7 dias sem perguntas" — em AR reforçar "sem juros, sem taxa oculta" | i18n | 10 |
| V6 | Exit-intent modal: adicionar oferta condicional (cupom -20%) apenas se vier de Landing/YT (usar UTM) | novo | 12 |

### 1.8 Checkout Produto — Tela 13 (`08-checkout-01.png`, `08-checkout-02.png`)

**Observado (crítico):**
- Bug "Arquétipo arquétipo:" — duplicação de rótulo (concat de traducão + prefixo hardcoded). Reproduzido em desktop e nos 3 mobiles.
- Preço `R$ 50 / R$ 49,90` mostrado a todos os países. Deve mostrar `SAR / PLN / RON` conforme geo.
- 2 order bumps presentes — bom, mas ambos pré-marcados? confirmar (se sim, dark-pattern → deixa desmarcado por default para SA).
- CTA cor varia por arquétipo — inconsistente com brand.

**Intervenções:**
| # | Ação | Ficheiro | Onda |
|---|---|---|---|
| C1 | Fix concatenação "Arquétipo arquétipo:" — remover prefixo hardcoded, deixar só chave i18n | `OfferMonolith.tsx` (procurar `Arquétipo` literal) | 8 |
| C2 | Preço geo-correto SAR/PLN/RON via `getLocalPrice` já existente — apenas garantir consumo no componente | `OfferMonolith.tsx` + `geo-price.functions.ts` | 8 |
| C3 | CTA "Desbloquear" sempre em `#CC0000` (brand), não em `--arch-primary` | `OfferMonolith.tsx` | 8 |
| C4 | Order bumps default OFF; label claro do preço extra ("+ SAR 15") | 9 |
| C5 | Métodos de pagamento visíveis no botão: "Cartão · Apple Pay · Google Pay · mada (SA) · BLIK (PL)" — condicional por país | 11 |
| C6 | Micro-copy anti-fricção acima do CTA: "Pagamento seguro · Reembolso 7 dias · SSL Stripe" com 3 iconezinhos | 9 |

### 1.9 Checkout Stripe — Tela 14 (`08b-stripe-attempt.png`)

**Observado:** Stripe hospedado, ok. Mostra dois preços simultâneos (€ 8,82 / R$ 49,90) — confuso; Stripe está a usar `currency_options` mas UI escolhe conforme browser locale. Confirmar que o `checkout.functions.ts` fixa `currency` conforme `getLocalPrice`.

**Intervenções:**
| # | Ação | Onda |
|---|---|---|
| S1 | Forçar `currency` única na Session (SAR/PLN/RON/EUR) baseada em `cf-ipcountry`, remover `currency_options` fallback | `src/lib/payments/checkout.functions.ts` | 8 |
| S2 | Habilitar em `payment_method_types`: `card` + `apple_pay` + `google_pay` + `blik` (PL) + `p24` (PL fallback). SA continua card (Stripe não tem mada nativo — deixar cartão) | 11 |
| S3 | Enviar `locale` para o Stripe Checkout (`ar`, `pl`, `ro`) | `checkout.functions.ts` | 8 |
| S4 | Enviar `customer_email` já capturado na Tela 9 (pré-preenche form) | 8 |

### 1.10 Thank You — Tela 15 (`09-obrigado-01.png`)

**Observado:** header ok. Body vazio porque `order_id` de teste. Não avaliável em profundidade neste snapshot.

**Intervenções:**
| # | Ação | Onda |
|---|---|---|
| T1 | Garantir download imediato do PDF (não só e-mail) — reduz pedidos de suporte | 9 |
| T2 | Bloco "próximos passos em 3 dias" (nurture) | 12 |
| T3 | Upsell honesto: "Sessão 1:1 15min por SAR X" (só se produto existir) | 12 |

### 1.11 E-mail automático — "Tela 16"

Sem snapshot (é backend). Consultar `src/lib/email/send-diagnosis.functions.ts`.

**Intervenções:**
| # | Ação | Onda |
|---|---|---|
| M1 | Assunto localizado + emoji leve: "✅ O teu diagnóstico MindReset chegou" | 8 |
| M2 | Preview text (primeiras 90 chars) com nome e arquétipo | 8 |
| M3 | Botão principal "Abrir o meu diagnóstico" apontando para link com token único (não anexo pesado) | 9 |
| M4 | Follow-up automático D+3 se não abriu: "Vale a pena os 12 min de leitura porque…" | 12 |

---

## 2. Meta realista de 30% — decomposição

30% de "conversão" é ambíguo. Decomponho o funil e ancoro o objetivo onde faz sentido:

```
Landing (100) ──► Start Quiz (55-70)  ──► Complete Quiz (75-85% de quem começa)
                                             │
                                             ▼
                                       Email (85-92%)
                                             │
                                             ▼
                                        Reveal (98%)  ◄── ponto de fé no funil
                                             │
                                             ▼
                                     Sales page view (100)
                                             │
                                             ▼
                                     Checkout iniciado (25-40%)
                                             │
                                             ▼
                                    Pagamento completo (50-70% do checkout)
```

**Benchmarks reais (fintech-behavioral, mobile, tráfego morno YT):**

| Etapa | Baseline razoável | Alvo pós-otimizações | Alvo stretch |
|---|---|---|---|
| Landing → Start | 55% | 65% | 75% |
| Start → Complete quiz | 78% | 85% | 90% |
| Complete → Email | 88% | 93% | 96% |
| Email → Reveal | 98% | 99% | 99% |
| Reveal → Checkout iniciado | 25% | 35% | 45% |
| Checkout → Pago | 55% | 68% | 78% |

**Landing → Pago (produto):**
- Baseline: 0.55 × 0.78 × 0.88 × 0.98 × 0.25 × 0.55 ≈ **5.1%**
- Alvo: 0.65 × 0.85 × 0.93 × 0.99 × 0.35 × 0.68 ≈ **12.1%**
- Stretch: 0.75 × 0.90 × 0.96 × 0.99 × 0.45 × 0.78 ≈ **22.7%**

**Reveal → Pago (segmento onde 30% é atingível):**
- Alvo: 0.35 × 0.68 ≈ **23.8%**
- Stretch: 0.45 × 0.78 ≈ **35.1%** ✅

**Conclusão:** os 30% são realistas *e mensuráveis* na janela `Reveal → Purchase`, que é onde a intenção está saturada. Este é o KPI operacional que proponho fixar. Landing→Purchase é KPI de negócio (12% alvo, 22% stretch).

---

## 3. Localização cultural (SA / PL / RO) — checklist além do idioma

### Arábia Saudita (ar-SA)
- **RTL:** já implementado (Onda 4). Validar em cada onda nova.
- **Moeda:** SAR (ر.س) — grafia à direita do número: `199 ر.س` ou `SAR 199`. Nunca `R$` nem `€`.
- **Riba/Juros:** evitar qualquer menção a "juros", "parcelamento com juros", "cashback". Reforçar "pagamento único, sem taxas ocultas".
- **Testemunho:** nomes plausíveis (Abdullah, Fatima, Khalid, Noor) + cidades (Riyadh, Jeddah, Dammam).
- **Métodos de pagamento:** Stripe não suporta mada nativamente. Manter cartão internacional + Apple Pay (adoção alta SA). Mencionar isto em FAQ.
- **Imagens:** rever qualquer foto humana feminina — usar ilustração ou foto neutra por default.
- **Timing:** evitar countdowns durante Ramadão; se possível, pausar campanha.

### Polónia (pl-PL)
- **Moeda:** PLN (zł) — número + `zł` (ex: `199 zł`). VAT 23% incluído no preço (obrigatório B2C).
- **Método nativo:** BLIK é dominante (>60% dos pagamentos digitais). Habilitar em `payment_method_types`. Fallback: Przelewy24 (p24).
- **Testemunho:** nomes (Anna, Piotr, Katarzyna, Michał) + cidades (Warszawa, Kraków, Wrocław).
- **Copy:** evitar diminutivos infantis; tom formal-profissional.
- **Diacríticos:** validar renderização de `ą ę ł ń ó ś ź ż` (fonte Inter cobre).

### Roménia (ro-RO)
- **Moeda:** RON (lei) — número + `lei` (ex: `199 lei`). VAT 19% incluído.
- **Método nativo:** cartão predominante. Stripe cobre. Considerar Netopia/Euplatesc no futuro (não via Stripe).
- **Testemunho:** nomes (Andrei, Ioana, Alexandru, Maria) + cidades (București, Cluj-Napoca, Timișoara).
- **Diacríticos:** validar `ă â î ș ț` (fonte Inter cobre; validar em `08-checkout-*.png` ro).
- **Tom:** direto e prático; roménos respondem bem a "resultado em X dias".

---

## 4. Alinhamento YouTube → Produto (jornada única)

Como o tráfego é 100% YouTube e o produto nasce dentro de um ecossistema de conteúdo, a landing genérica desperdiça a intenção do vídeo. Recomendo estrutura **duas portas**:

| Origem | URL | Página que abre | Racional |
|---|---|---|---|
| Link em descrição do vídeo | `/q?src=yt&v={videoId}` | **Tela 0 diretamente** (identidade) | espectador já está aquecido |
| SEO / orgânico | `/` | Landing completa | precisa de contexto |
| Ads pagos | `/lp?utm_campaign=…` | Landing curta (Hero + ProofBar + FAQ + CTA) | oxigênio de decisão |

A rota `/q` reaproveita 100% do `<QuizFlow>` já existente em `src/routes/index.tsx` — só um wrapper de rota + `setStage({kind:"identity"})` no mount.

**Continuidade de mensagem:**
- Cada vídeo termina com: "Se te reconheceste, faz o meu quiz gratuito de 2 minutos — o link está na descrição."
- Landing/Tela 0 replicam essa promessa no H1: "O quiz que revela o teu padrão financeiro em 2 minutos."
- Loader repete o vocabulário do canal ("padrão", "arquétipo", "bloqueio").
- Reveal usa o mesmo tom dos vídeos.

---

## 5. Rastreamento e experimentação (pré-requisito)

**Nada disto é otimizável sem dados.** Antes da Onda 8:

1. **PostHog (self-host ou cloud EU)** — GDPR-friendly, funil por evento:
   - `landing_view`, `quiz_start`, `quiz_q{1..8}_answer`, `email_submit`, `reveal_view`, `sales_view`, `sales_scroll_{25,50,75,100}`, `checkout_open`, `checkout_submit`, `purchase_success`, `stripe_error`.
2. **GA4** para atribuição YT + `utm_source=youtube&utm_medium=video&utm_content={videoId}`.
3. **Meta Pixel + TikTok Pixel** só se houver ads pagos no futuro.
4. **Server-side de compra**: webhook Stripe → PostHog `capture` server-side (evita ad-blockers).
5. **A/B via PostHog feature flags** para variantes de headline / preço / CTA.

Deliverable: `src/lib/analytics.ts` já existe — auditar cobertura e adicionar eventos em falta.

---

## 6. Roadmap priorizado por ROI (Ondas 8 → 12)

> Cada onda ≤ 1 dia de trabalho, diff mínimo, sem tocar fora do escopo — mesma regra das Ondas 1-6.

### 🚀 Onda 8 — Correções críticas de conversão (ROI imediato)
**Meta:** parar de perder venda por bugs óbvios e moeda errada.
- C1: fix "Arquétipo arquétipo:" (concat duplicado)
- C2 + S1 + S3 + S4: moeda geo-correta ponta-a-ponta (checkout produto + Stripe + email pré-preenchido + locale Stripe)
- C3: CTA "Desbloquear" sempre `#CC0000`
- Q1: auto-advance no quiz
- E1 + E2: reforço de valor + copy consentimento GDPR
- E4 + I2: AR — email input LTR + placeholder identity
- V1: sticky offer bar mobile a partir de 30% scroll
- M1 + M2: email — assunto + preview text localizados

### 🎯 Onda 9 — CTA fatigue & sticky (Reveal + Sales)
**Meta:** subir Reveal→Checkout de ~25% para ~35%.
- R1 + R2: sticky CTA + CTA intermediário no reveal
- L2: sticky start no topo da landing
- V3: UrgencyBar honesta
- C4 + C6: order bumps default OFF + micro-copy trust
- Q2 + Q3: progresso no quiz + confirmação micro-animation
- Ld1: textos personalizados do loader
- I1: hint de progresso na Tela 0
- M3: e-mail — botão principal com link tokenizado
- T1: download imediato PDF no /obrigado

### 🌍 Onda 10 — Localização cultural profunda
**Meta:** SA/PL/RO deixarem de parecer "traduções do PT".
- L3 + V2: testemunhos locais (nomes + cidades)
- L4 + L5: ProofBar copy sensível + FAQ halal AR
- R4: explicar cada score em 1 linha
- V5: guarantee reforçada com nuances locais

### 🛒 Onda 11 — Métodos de pagamento locais + conteúdo
**Meta:** habilitar o pagamento nativo do país + reforçar prova social.
- S2: BLIK PL + p24 fallback + Apple/Google Pay
- V4: selos Visa/Mastercard/mada/BLIK
- C5: métodos visíveis no botão de checkout
- Q4: "por que importa" nas perguntas 6-8
- R3: prova social específica do arquétipo
- Ld2: loader ligado ao término real do scoring

### 🔬 Onda 12 — Experimentação e nurture
**Meta:** infraestrutura de A/B + retenção pós-venda.
- E3: Google login opcional
- V6: exit-intent com cupom condicional por UTM
- T2 + T3: /obrigado com próximos passos + upsell
- M4: e-mail follow-up D+3
- PostHog feature flags: 2 experimentos ativos por vez (headline hero + preço)

---

## 7. Métricas de sucesso a fixar antes de cada onda

| KPI | Fonte | Meta 1º mês | Meta 3º mês |
|---|---|---|---|
| Landing → Start Quiz | PostHog | ≥ 60% | ≥ 70% |
| Quiz Complete Rate | PostHog | ≥ 82% | ≥ 88% |
| Email Capture | PostHog | ≥ 90% | ≥ 94% |
| **Reveal → Checkout iniciado** | PostHog | ≥ 30% | ≥ 40% |
| **Checkout → Pago** | Stripe + PostHog | ≥ 60% | ≥ 72% |
| **Reveal → Pago (KPI 30%)** | PostHog | ≥ 20% | ≥ **30%** |
| Refund rate 7 dias | Stripe | ≤ 5% | ≤ 3% |
| NPS pós-diagnóstico | Email survey D+3 | ≥ 40 | ≥ 55 |

---

## 8. O que NÃO fazer (guardrails)

1. **Não redesenhar** — o design premium é ativo, não custo. Mudanças são cirúrgicas.
2. **Não usar fake urgency** (countdown de 5 min). SA especialmente pune isto.
3. **Não adicionar login** antes do checkout — friction assassina.
4. **Não pedir cartão antes de mostrar preço final com moeda local.**
5. **Não misturar cores de arquétipo com brand no CTA de compra.**
6. **Não fazer 2 ondas em paralelo** — perde-se rastreabilidade de causa/efeito no A/B.
7. **Não lançar sem PostHog ativo.**

---

## 9. Próximo passo

Aprovar este documento e autorizar o início da **Onda 8** (correções críticas — C1/C2/C3/S1/S3/S4/Q1/E1/E2/E4/I2/V1/M1/M2). Estimativa: 1 dia de trabalho, diff em ~8 ficheiros, zero mudança de design.

Após Onda 8, medir 7 dias com PostHog antes de avançar para Onda 9 — para atribuir corretamente o delta de conversão.

---

*Fim do complemento v01. Este documento vive ao lado de `Revisao-Final-de-Conversao-00.md` — o 00 é a visão, o 01 é a execução. Atualizar após cada onda com resultados medidos.*