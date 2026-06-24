# Fase 4 — Tela 12: Página de Vendas (VSL) do zero

## Objetivo

Elevar **reveal → checkout de ~18% (pós-Fase 3) para ≥45%**. Esta é a tela de maior gap do funil: hoje o reveal envia direto para `CheckoutStub`, sem uma página de vendas estruturada que ancore valor, mostre prova e neutralize objeções. O `VSL.tsx` atual é placeholder leve — vamos **substituir** por uma página de vendas premium, modular, com 11 blocos fixos, exit-intent, sticky CTA e i18n completo.

## Decisão arquitetural — estágio vs rota

Vai como **estágio `vsl`** dentro de `src/routes/index.tsx`, **não** como rota `/diagnostico`. Razões:
- Preserva `winner`, `displayName`, `areaScores`, `leadId`, `currency`, `email` em memória sem precisar de loader server-side ou query params na URL.
- Mantém transições `Atmosphere` consistentes com o resto do funil.
- Evita exposição pública de URL — VSL é um destino interno pós-reveal.
- Compatível com analytics: `track(EVENTS.VSL_VIEW, { source: "reveal" })` sem confusão de rota.

Fluxo novo: `reveal → vsl → checkout` (atual: `reveal → checkout`).

## Diretrizes (não-negociáveis)

- **Copy Bible V2** — sem invenção; placeholders `[NOME]`, `[PRIMARY]`, `[SECONDARY]` substituídos em runtime via template functions.
- **5 idiomas em paridade** (PT/EN/PL/RO/AR) — chave nova `sales.*` ~12k chars/idioma. `i18n-sync` verde.
- **Mobile-first** — layout 375-414px é o caso de teste. Desktop é polish.
- **Preço local via `getLocalPrice`** (Fase 1) — já implementado, consumir.
- **Acessibilidade AA** — `aria-live` no exit-intent, focus trap no modal, sticky CTA com `aria-label`.
- **RTL completo** para árabe.
- **Lighthouse Perf ≥85 mobile** — lazy-load imagens, sem framer-motion novo (CSS keyframes), sem libs novas exceto `react-countup` (~3kb).
- **Zero quebra do funil atual** — só adiciona `stage="vsl"` entre reveal e checkout.

## Ordem de execução (5 commits)

### Commit 1 — Esqueleto da página + integração no funil

**Ficheiros:**
- `src/components/sales/SalesPageV2.tsx` (novo, ~400 linhas)
- `src/routes/index.tsx` (adicionar stage `vsl`, redirect reveal→vsl→checkout)
- `src/lib/i18n/types.ts` (`sales: { ... }` no `Dict`)
- Remoção: `src/components/sales/VSL.tsx` é mantido temporariamente para fallback, deletado no Commit 5.

Tipagem props:
```ts
type SalesPageV2Props = {
  archetype: Archetype;
  displayName: string;
  areaScores: AreaScores;
  leadId: string;
  localPrice: LocalPriceQuote;
  onContinue: (payload: { bumps: ("bump1"|"bump2")[] }) => void;
  onBack: () => void;
};
```

Estado interno:
- `bump1`, `bump2` (booleans, default `false`).
- `showSticky` (boolean, ativa via IntersectionObserver no fim do B1).
- `showExitIntent` (boolean, controlado por hook).

Estrutura JSX em ordem fixa: B1 → B2 → B3 → B4 → B5 → B6 → OB1 → B7 → B8 → B9 → OB2.

`track(EVENTS.VSL_VIEW)` no mount com `{ arch, has_lead }`.

### Commit 2 — Blocos B1–B5 (acima da dobra + dor + ciência + produto + âncora)

Implementa os 5 primeiros blocos com copy embedded via `t.sales.b1Anchor`, etc. PT canónico, traduções PL/RO/AR feitas em batch (volume).

- **B1 Emotional Anchor**: H1 com `[NOME], o teu padrão tem nome.` + parágrafo de validação + CTA primário ("Quero o diagnóstico completo").
- **B2 Pain Mirror**: checklist 6 itens com `<X className="text-destructive">` — situações específicas do arquétipo (puxa de `t.sales.painList[arch]`, 6 itens × 4 arquétipos).
- **B3 Scientific Breakthrough**: 3 cards (Kahneman / Thaler / Ariely) com citação + ano + tema. Componente `ScienceCard` interno.
- **B4 Produto 4D**: grid 2×2 (Financeiro / Profissional / Amor / Pessoal). Cada card mostra score do utilizador (puxa de `areaScores`) + 1 frase do que o PDF entrega naquela área.
- **B5 Value Anchor**: linha visual `$200 (consulta) ❯ $47 (curso médio) ❯ $9.90 (tu)` com strikethrough animado on scroll (CSS keyframe).

### Commit 3 — B6 Social Proof + OB1 + B7 Preço + B8 FAQ + B9 Final CTA + OB2

- **B6 Social Proof**: `AnimatedCounter` (componente novo `src/components/sales/AnimatedCounter.tsx`, usa `react-countup`, dispara em `IntersectionObserver`) — "12.847 diagnósticos entregues". Abaixo, 3 cards de depoimento com nome + arquétipo + texto longo + estrelas.
- **OB1**: card destacável (border amarelo) com checkbox unchecked, badge "MAIS PEDIDO" (top-right absoluto, fundo vermelho), preço `+$4.99` formatado por `localPrice`.
- **B7 Preço + CTA**: bloco hero de preço com 3 linhas (de $200 risca, por $47 risca, hoje $localPrice em destaque vermelho 6xl). Botão CTA máximo (full-width mobile, large desktop). Microcopy segurança ("✓ 7 dias garantia · ✓ Pagamento único · ✓ SSL · ✓ Sem subscrição").
- **B8 FAQ**: 4 accordions (genérico? entrega? vs apps? garantia?). Reusa pattern do `landing/FAQ.tsx` (sem importar — copy embedded em `t.sales.faq`).
- **B9 Final CTA**: urgência ("Esta análise expira em MM:SS" — timer real reusando hook de Fase 3) + botão máximo + linha "[NOME], você é [PRIMARY] com traço de [SECONDARY]" (substituição via template).
- **OB2**: seção separada pós-B9 com fundo `bg-card`, título "Antes de avançar…", proposta "Protocolo 30 Dias +$14.00", checkbox + link `<button>` discreto "Não, prefiro descobrir sozinho" que apenas fecha visualmente a seção (não bloqueia avanço).

Handler `onContinue`:
```ts
const handleAdvance = () => {
  const bumps = [bump1 && "bump1", bump2 && "bump2"].filter(Boolean);
  track(EVENTS.VSL_CTA_CLICK, { bumps, source });
  onContinue({ bumps });
};
```

### Commit 4 — StickyNavbar + ExitIntentModal + AnimatedCounter polish

- **`src/components/sales/StickyVSLBar.tsx`**: barra fixed top que aparece via `IntersectionObserver` quando B1 sai do viewport. Slide-down 400ms (CSS `@keyframes slide-down-bar`). Mostra: preço local + botão CTA mini. Esconde quando B9 entra em viewport (evita duplicação visual).
- **`src/components/sales/ExitIntentModal.tsx`** + **`src/hooks/use-exit-intent.ts`**:
  - Desktop: listener `mouseleave` no `document.documentElement` quando `clientY <= 0`.
  - Mobile: listener `popstate` (history back) + fallback `visibilitychange` ao trocar de aba.
  - Dispara uma única vez por sessão (flag em memória, não localStorage — iframe sandbox).
  - Modal centralizado com backdrop, focus trap, ESC fecha. Copy: H2 "[NOME], espera." + sub "Tu já és [ARQUÉTIPO]. Sair agora apaga o teu diagnóstico." + botão primário "Quero entender meu padrão →" (avança para checkout sem bumps) + link negativo "Prefiro sair sem descobrir" (fecha modal e marca como visto).
  - `track(EVENTS.EXIT_INTENT_SHOWN)`, `track(EVENTS.EXIT_INTENT_CTA)`, `track(EVENTS.EXIT_INTENT_DISMISS)`.
- **AnimatedCounter** polish: respeita `prefers-reduced-motion` (mostra valor final imediatamente).

### Commit 5 — i18n batch + analytics sweep + cleanup + smoke

- **i18n**: adiciona ~60 chaves `sales.*` × 5 idiomas. Estrutura:
  - `sales.b1Title(name)`, `sales.b1Sub`, `sales.b1Cta`
  - `sales.painList[arch]: string[6]` (24 strings × 5)
  - `sales.scienceCards: { name, quote, year }[3]`
  - `sales.area4d: { financial, professional, love, personal }`
  - `sales.valueAnchor: { consult, course, you }`
  - `sales.socialCount`, `sales.testimonials[3]`
  - `sales.bump1: { title, desc, badge }`, `sales.bump2: { title, desc, declineLink }`
  - `sales.priceBlock: { from, was, now, cta, micro }`
  - `sales.faq[4]: { q, a }`
  - `sales.finalCta: { urgency, cta, identity(name, primary, secondary) }`
  - `sales.exitIntent: { title(name), sub(arch), cta, dismiss }`
  - `sales.stickyCta`
- AR revisado culturalmente (sem juros/riba; "أنت" tom direto).
- **Analytics**: 6 eventos novos no `EVENTS`: `VSL_VIEW`, `VSL_CTA_CLICK`, `VSL_BUMP_TOGGLED`, `EXIT_INTENT_SHOWN`, `EXIT_INTENT_CTA`, `EXIT_INTENT_DISMISS`.
- **Cleanup**: deletar `src/components/sales/VSL.tsx` antigo.
- **Smoke**: `bunx tsgo --noEmit` verde + checklist manual PT desktop / AR mobile.
- **Lighthouse mobile**: rodar `lighthouse` em `/?stage=vsl` (modo dev) e confirmar Perf ≥85 — gate.

## Critérios de Gate 4 (antes de Fase 5)

- ✅ Build limpa, tsgo verde, i18n-sync verde 5 idiomas.
- ✅ VSL renderiza com `[NOME]`, `[PRIMARY]`, `[SECONDARY]` e preço local correto por país (testar BR/PT/PL/RO/SA via override `?country=`).
- ✅ Sticky CTA aparece após hero, esconde ao chegar em B9.
- ✅ Exit intent: dispara 1× por sessão, focus trap, ESC fecha, copy correta.
- ✅ Bumps enviam payload correto: `onContinue({ bumps: ["bump1","bump2"] })` → `CheckoutStub` recebe e o `createCheckoutSession` cria sessão Stripe com line items corretos.
- ✅ Lighthouse Perf ≥85 mobile em `/?stage=vsl`.
- ✅ AR RTL: layout espelhado, sem `left`/`right` hardcoded (auditar `pe-*`/`ps-*`/`start-*`/`end-*`).

## Detalhes técnicos

**Substituição de placeholders** (helper interno `src/lib/sales/template.ts`):
```ts
export const fillTpl = (
  tpl: string,
  vars: { name: string; primary: string; secondary: string }
) => tpl
  .replace(/\[NOME\]/g, vars.name)
  .replace(/\[PRIMARY\]/g, vars.primary)
  .replace(/\[SECONDARY\]/g, vars.secondary);
```

**Dependência nova:**
```bash
bun add react-countup  # ~3kb gzipped, mantido
```

**Reusos:**
- `getLocalPrice` (Fase 1) — preço.
- `t.archetypes[arch].colors.primary` para acentos do bloco.
- `MarbleBust` (mini, opacidade reduzida) como ornamento em B1.
- `Reveal` + `Reveal.Group` para entrada por scroll.
- Atmosphere wrapper já aplicado no estágio.

**Risco de bundle:** SalesPageV2 fica em chunk próprio via dynamic import no `index.tsx` (`React.lazy(() => import("@/components/sales/SalesPageV2"))`) — só carrega quando o utilizador chega ao reveal CTA.

## Gates do utilizador antes de implementar

- Confirmar copy V2 do Bible para os 11 blocos (PT canónico) — se já está em `melhorias e contexto/`, indicar caminho.
- Aprovar preço-âncora `$200` (consulta) e `$47` (curso médio) ou ajustar.
- Confirmar adição da dependência `react-countup`.

## Estimativas de impacto

- **VSL estruturado vs ausente** → +20-27pp em reveal→checkout (de ~18% para ~45%).
- **Exit intent** → recupera 5-9% dos abandonos pré-checkout.
- **Sticky CTA** → +3-5pp em mobile (reduz fricção de scroll).
- **OB1 com badge "MAIS PEDIDO"** → +12-18% attach rate vs OB1 plano.

## Próximo passo

Aprovar plano → começar **Commit 1 (esqueleto + integração no funil)** e enviar para revisão antes de avançar para os blocos.
