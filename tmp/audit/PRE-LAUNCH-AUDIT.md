# FASE 0 — Audit Congelado (PRE-LAUNCH)

Data: agora. Baseline antes da revisão final para conversão ≥30%.
Nenhum código foi alterado nesta fase. Este documento é o backlog autoritativo das Fases 1–6.

---

## 0. Estado do build (baseline)

- `npm run build` → ✅ verde em 19.11s.
- Bundles relevantes (server): `splinetool/runtime` **5.69 MB** (suspeito — confirmar uso real), `brotli` 1.39 MB, `react-pdf/pdfkit` 530 KB. Client bundle não inspecionado em detalhe — fazer snapshot na Fase 1.
- TS / Lint: status conforme `AGENTS.md` (CRLF pré-existentes, 0 novos).
- Lighthouse mobile: **não medido** — registrar na Fase 1 como baseline real.

## 1. Mapeamento funil atual vs 14 telas da Bible

| # | Tela alvo | Estado hoje | Componente | Gap |
|---|---|---|---|---|
| L | Landing | ✅ existe (Hero+ProofBar+ArchetypeShowcase+HowItWorks+FeaturesGrid+Testimonials+FAQ+FinalCTA) | `src/routes/index.tsx` stage `hero` | Copy do hero precisa virar V2 ("SABOTANDO"), faltam seção "Quebra de crença" e ajuste dos 4 nomes de arquétipo |
| 0 | Identidade | ✅ existe | stage `identity` em `index.tsx` | Validar auto-focus, 3 botões de gênero, ativação do CTA |
| 1–8 | Quiz | ✅ existe | stage `q` + `QuizScreenWrapper` + `QuizOption` | **Falta auto-advance 150ms**; **progress bar inicia em 12%** (Bible) vs `(index+1)/8*85` atual; copy das 8 perguntas precisa virar V2; **scoring não devolve `secondary`** (só `winner`) |
| 9 | Email Gate | ✅ existe | stage `email` | Falta efeito de resultado borrado ao fundo (tensão Zeigarnik); checkbox LGPD presente? validar; progress 90% |
| 10 | Loader | ✅ existe | stage `loader` + `NeuralLoader` | Validar duração exata 3s + 4 textos fade 700ms com `[NOME]`; transição flash vermelho 600ms |
| 11 | Reveal | ✅ existe | stage `reveal` + `ArchetypeRevealStage` | **Falta gancho multi-área (trabalho+amor+autoestima)** — hoje só fala de dinheiro; typewriter 50ms/char; CTA first-person por arquétipo conforme Bible |
| 12 | **VSL / Sales Page** | ⚠️ parcial | stage `vsl` → `VSL.tsx` (componente existe), stage `sales` em `index.tsx` linhas 1154+ | **Maior gap.** Não tem os 9 blocos completos da Bible; sem StickyNavbar; sem Order Bumps na VSL; **sem Exit Intent Modal**; falta `[NOME]+[ARQUÉTIPO]` personalizados em todos os blocos; preço local por IP — confirmar |
| 13 | Checkout | ✅ Opção A já implementada | `CheckoutStub.tsx` → Stripe hosted | Decidir Fase 5: manter hosted (Apple/Google Pay automáticos) vs migrar p/ Stripe Elements embedded com identidade preta. Recomendação: manter hosted |
| 14 | Thank You | ✅ existe | `src/routes/obrigado.tsx` | **Sem upsell pós-compra** (Protocolo 30 Dias +$14); falta seção "O que você comprou" + "Como usar" 4 passos; sem confete |

## 2. Análise técnica do que já está bom

- ✅ **Stripe Checkout server fn** (`checkout.functions.ts`): otimizada com `customer_creation: always`, `allow_promotion_codes`, `expires_at` 30min, `custom_text[submit]/[after_submit]`, `statement_descriptor_suffix: MINDRESET`, `idempotency-key` por order, metadata completa.
- ✅ **Webhook Stripe** (`api/public/stripe/webhook.ts`): assinatura HMAC verificada, dedupe via `stripe_events`, MAX_AGE 5min.
- ✅ **Pricing server-side** (`pricing.server.ts`): tabela em centavos por moeda (USD/EUR/BRL/PLN/RON/SAR), mapa lang→currency. Bumps `bump1` ($4.99) / `bump2` ($7.99 — Bible exige $14, **divergência**).
- ✅ **AI chain** (`chain.server.ts`): Groq → OpenAI → Lovable (Gemini). OpenAI-compatible, tool-calling, attempts log sem PII.
- ✅ **Identity assets**: MarbleBust + Atmosphere + ArchetypeRevealStage com fog/glow por arquétipo já existem e funcionam.
- ✅ **i18n**: 5 idiomas, `translations.ts` com 1808 linhas, `types.ts` tipado, RTL para AR no `LanguageProvider`.
- ✅ **Tabelas Supabase**: `quiz_leads`, `orders`, `stripe_events`, `pdf_generations`, `diagnoses` — todas presentes.

## 3. Gaps numerados (vira backlog das Fases 1–6)

### Críticos (bloqueiam ≥30% — Fases 2–5)
1. **VSL Tela 12 incompleta** — 9 blocos da Bible não estão todos implementados/identificáveis dentro do componente `Sales` atual. Fase 4 reescreve.
2. **Exit Intent Modal ausente** — sem `mouseleave` no topo + popstate mobile. Fase 4.
3. **Upsell pós-compra ausente** na `/obrigado` — sem Protocolo 30 Dias +$14. Fase 5.
4. **Reveal só fala de dinheiro** — Bible exige gancho multi-área (trabalho+amor+autoestima). Fase 3.5.
5. **Auto-advance no quiz não confirmado** — verificar 150ms na Fase 3.2.
6. **Arquétipo secundário não calculado nem exposto** — `scoreAnswers` retorna só `winner`. Bible exige `secondary` para copy "[NOME], você é [PRIMARY] com traço de [SECONDARY]". Fase 3.2.
7. **Order Bumps na VSL inexistentes** — bumps só aparecem no CheckoutStub. Bible exige Bump 1 entre B6/B7 e Bump 2 após B9. Fase 4.
8. **Bump 2 com valor divergente** — código tem $7.99 (`bump2: 799`), Bible exige $14. Decidir na Fase 4 (alinhar código à Bible ou Bible ao código).
9. **Hero copy genérico** — falta o headline "SABOTANDO" + reframe "Não é falta de força de vontade". Fase 2.
10. **Seção "Quebra de crença" ausente** na landing (Kahneman/Thaler/Ariely como section dedicada). Fase 2.
11. **Preço local por IP no client** — confirmar se `getLocalPrice` existe e usa `cf-ipcountry`. Fase 1.
12. **Banner recuperação `?canceled=1&recover=X`** — `cancel_url` já gera o param, mas `index.tsx` não consome. Fase 1.

### Médios (afetam métricas secundárias — Fase 6)
13. **PostHog events não padronizados** — instrumentar 16 eventos canônicos da Fase 1.
14. **Apple Pay domain registration pendente** no Stripe Dashboard (ação manual do user).
15. **Lighthouse mobile não medido** — baseline pendente.
16. **Bundle `splinetool/runtime` 5.69 MB no server** — investigar se é tree-shakeable ou se entra em algum path SSR.
17. **`tsx` reveal: typewriter 50ms/char** — confirmar se já está com a velocidade correta.
18. **i18n: chaves `sales.*` para VSL nova** — adicionar ~12k chars em 5 idiomas na Fase 4.
19. **PDF generation: cobertura 4×5=20 (arquétipo×idioma)** — gerar e abrir todos na Fase 0.5 manual.

### Baixos (polimento — Fase 6)
20. **`splinetool` import** — verificar se algum componente o usa; remover se órfão.
21. **CRLF pré-existentes** — não bloqueiam, mas eventualmente rodar `prettier --write .`.
22. **`AGENTS.md` referência a `bun add` em build-secret pattern** — projeto usa `npm` no Windows; manter consistência.

## 4. Ações manuais do user (não bloqueantes mas necessárias)

- [ ] Registrar `thoughtsculpt-engine.lovable.app` em Stripe → Settings → Payment Methods → Apple Pay → Add Domain.
- [ ] Confirmar Stripe BR ativo se quer Pix na moeda BRL.
- [ ] Confirmar conta PostHog ativa + project key disponível (verificar `mcp_posthog_XYy5l` tem credenciais).
- [ ] Validar caixa de envio Brevo (sender autenticado, DKIM, SPF) para entrega do PDF não cair em spam.
- [ ] Comprar 1 PDF de teste end-to-end em produção antes do Gate 1.

## 5. Decisões pendentes para confirmar antes da Fase 1

| # | Decisão | Recomendação |
|---|---|---|
| D1 | Bump 2: $7.99 (código atual) ou $14 (Bible) | **$14** — Bible é a fonte de verdade pós-revisão |
| D2 | Checkout: hosted Stripe (atual Opção A) ou Elements embedded com preto | **Hosted** — preserva Apple/Google Pay auto + Link, menor risco |
| D3 | VSL: rota nova `/diagnostico` ou estágio `vsl` (atual) | **Estágio** — preserva estado in-memory do quiz |
| D4 | Conversion baseline: medir antes de tocar em algo ou tocar e medir junto | **Medir 50 sessões antes da Fase 2** — sem isso, não dá pra provar lift |

## 6. Critério de saída do Gate 0

Usuário aprova explicitamente:
- Lista dos 22 gaps numerados (sinaliza quais entram em escopo)
- 4 decisões D1–D4
- Ações manuais (item 4) que ele se compromete a executar entre Fase 1 e Fase 6

Após esses 3 OKs → abro a Fase 1 (infra silenciosa) com 1 PR.

---

**Próximo passo:** revisa este documento, responde ponto a ponto (ou "ok geral, segue") e diz se quer ajustar o backlog antes de eu começar a Fase 1.