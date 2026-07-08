# MindReset — Auditoria de Conversão (Onda 0)

Documento-fonte para todas as ondas de execução (1-6). Consultar antes de iniciar cada onda.

## Contexto

- Funil linear estrito (15 telas): Landing → ProofBar → Archetypes → HowItWorks → Features → Testimonials → FAQ → FinalCTA → Identity → Q1-8 → Email → Loader → Reveal → Sales (VSL) → Plans/Checkout → Stripe → /obrigado
- 5 idiomas: PT (base) · EN · PL · RO · AR (RTL)
- Tráfego: YouTube AR/RO/PL
- Sem login, sem dashboard. Conversão = Landing + Reveal + Sales.

## Achados priorizados

### P0 — Bloqueadores (dead-paths que quebram compra)

| # | Ficheiro:linha | Problema | Fix |
|---|---|---|---|
| P0-1 | `src/routes/index.tsx:50-54` (`useStubCheckout`) usado por `Plans` em L1840 | `alert("Checkout em reformulação")` — se Sales→Plans for atingido, quebra pagamento | Redirecionar Sales/StickyCTA de `plans` para `checkout` (CheckoutStub real) OU trocar stub por `createCheckoutSession` |
| P0-2 | `src/routes/obrigado.tsx:525` | Upsell `href="#"` mas dispara `EVENTS.UPSELL_ACCEPTED` — conversão fantasma | Ocultar bloco de upsell até termos URL real |

### P1 — Mobile / autofill (baixo risco, <10 min cada)

| # | Ficheiro:linha | Problema | Fix |
|---|---|---|---|
| P1-1 | `src/routes/index.tsx:1031-1039` email input | Falta `autoComplete="email"` + `inputMode="email"` → teclado errado iOS | Adicionar ambos atributos |
| P1-2 | `src/routes/index.tsx:888-894` name input | Falta `autoComplete="given-name"` + `inputMode="text"` | Adicionar atributos |
| P1-3 | idem name input | Falta `enterKeyHint="next"` | Adicionar |
| P1-4 | idem email input | Falta `enterKeyHint="go"` | Adicionar |

### P2 — Alta alavancagem (Ondas 2-3)

- `src/components/quiz/NeuralLoader.tsx:135` — literal `analyzing` hardcoded EN em todos idiomas
- `src/routes/obrigado.tsx:16` — `title: "Obrigado — MindReset"` fixo em PT
- Reveal — garantia em `text-xs` opacity 55% → falta `ShieldCheck` visível
- Sales B7 Bridge — `<h3>` repete título do diagnóstico em vez de fechar decisão
- Sales — trust bar (Stripe/garantia/refund) ausente na fold final
- Reveal — ancoragem de preço 73% precisa font-mono destacada

### P3 — RTL (Onda 4 — desbloqueia AR)

- 10+ `margin-left/right`, `translate-x-*`, chevrons ltr-only sem contraparte RTL
- OG meta tags EN em todos idiomas (`__root.tsx`)

### P4 — i18n cleanup (Onda 5)

- Deduplicar `COPY` em `obrigado.tsx` (mover para `translations.ts`)
- Verificar chaves faltantes AR/RO/PL em `landing.*` e `sales.*`
- `NeuralLoader` msgs devem vir do dict

## Mapa de Ondas

| Onda | Escopo | Ficheiros | Estado |
|---|---|---|---|
| 0 | Auditoria (este doc) | — | ✅ |
| 1 | P0 + P1 (dead-paths + autofill mobile) | `index.tsx`, `obrigado.tsx` | 🔄 em execução |
| 2 | Reveal — garantia + ancoragem preço | `Reveal`/`ArchetypeRevealStage` | pendente |
| 3 | Sales — B7 bridge + trust bar + CTA final | `Sales` blocks, `StickyCTA` | pendente |
| 4 | RTL sweep completo AR | vários + `styles.css` | pendente |
| 5 | i18n cleanup (analyzing, obrigado head, COPY dedupe) | `translations.ts`, `NeuralLoader`, `obrigado.tsx` | pendente |
| 6 | Alinhamento SKILL.md + AGENTS.md | docs | pendente |

## Regra de ouro

Cada onda = diff mínimo, sem tocar fora do escopo. Consultar este doc no início de cada onda antes de qualquer edição.