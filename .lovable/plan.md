# Moldura Imersiva da Página de Vendas — Plano de Execução

## Diagnóstico (o que está acontecendo hoje)

**Desktop (≥1024px)** — `SalesPageV2.tsx:465-485`
- A arte vive numa `<aside>` sticky de 420px no grid `[1fr_420px]`.
- Tem `sales-sculpture-halo` (radial blur), `sales-sculpture-mask` (fade vertical), `sculpture-col::before` (linha vertical archetype) e `SculptureParticles`.
- Sintoma: a arte fica visualmente "presa" numa coluna lateral isolada, sem dialogar com a copy do lado esquerdo. Vira "ilustração ao lado", não moldura.

**Tablet/Mobile (<1024px)** — `SalesPageV2.tsx:489-499`
- A arte é renderizada de novo em `fixed inset-0 -z-0` com `opacity:0.45` + `mix-blend-screen` + máscara vertical.
- Sintoma: vira um wallpaper desbotado atrás do texto. Não conta história. Não há sensação de "câmera imersiva" que o produto promete.

**Atmosfera competindo** — `SalesPageV2.tsx:208-212`
- Um `<Atmosphere>` global já pinta névoa archetype sobre tudo, o que dilui o protagonismo da arte.

**Tentativas anteriores ainda no código** (a "lápide" que o usuário mencionou)
- `sales-sculpture-halo`, `sculpture-col::before`, `haloIntensity` reativo no scroll, `SceneBackground sales-vignette`, máscara dupla — tudo "isolado", nunca formou moldura coerente.

---

## Conceito da solução — "Câmera Imersiva"

A arte deixa de ser ilustração lateral e passa a ser **a sala onde a copy acontece**. Três camadas sincronizadas:

```text
┌───────────────────────────────────────────────────────────┐
│  CAMADA 1 — STAGE GLOW (fixed, atrás de tudo)            │
│    radial + conic gradient archetype, respira no scroll   │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ CAMADA 2 — ARTE (a peça)                            │ │
│  │   desktop: sticky centralizada, integrada via       │ │
│  │   "spotlight" que vaza para a copy                  │ │
│  │   mobile:  parallax sutil + recortes "janela"       │ │
│  │ ┌─────────────────────────────────────────────────┐ │ │
│  │ │ CAMADA 3 — COPY                                 │ │ │
│  │ │   cards com glass-frame que "reagem" à arte:    │ │ │
│  │ │   borda interna iluminada pelo halo da arte     │ │ │
│  │ └─────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

Resultado-alvo: usuário sente que a copy está **dentro** da arte, não ao lado dela.

---

## Diretrizes inegociáveis

1. **Não tocar em `ScrollAnimationSequence.tsx`** — o canvas com 50 frames keyed continua exatamente como está.
2. **Manter o fluxo de scroll-progress** que dirige os frames; tudo novo apenas envelopa.
3. **Performance**: nada de novo em `position: fixed` com `backdrop-filter` em mobile low-end. Tier-aware via `useDeviceTier` (já existe).
4. **Acessibilidade**: respeitar `prefers-reduced-motion` (desliga parallax, mantém arte estática).
5. **RTL**: usar `inset-inline-*`, gradientes simétricos.
6. **Build limpo** ao final de cada fase (`npm run build` + `tsgo`).

---

## Fase 1 — Desktop: "Spotlight Bridge"

Objetivo: a arte deixa de viver numa coluna isolada e ganha uma ponte luminosa que conecta com a copy.

- **Substituir** `sculpture-col::before` (linha vertical fria) por um **gradiente cônico archetype** que emana da arte e cobre 30% da largura da coluna de copy. Cria sensação de "luz do palco caindo no leitor".
- **Adicionar um "frame ring"** SVG ao redor da arte: anel fino archetype com gaps + 4 marcadores de canto estilo visor cinematográfico (não-decorativo: reforça narrativa "diagnóstico/scanner").
- **Halo reativo ao scroll** já existe (`haloIntensity`); estender para também escalar a intensidade do spotlight bridge — assim a arte respira junto com o leitor.
- **Cards de copy adjacentes** (`SceneFrame`) ganham uma classe `sales-frame-react` que aceita a luz do halo via `box-shadow: inset … color-mix(in oklab, var(--arch-primary) X%, transparent)` calculado por CSS var herdada do root `--arch-halo`.

Arquivos:
- `src/components/sales/SalesPageV2.tsx` — substituir `<aside>` por novo `SculptureStage`, adicionar var CSS `--arch-halo` no `rootRef` ligada a `haloIntensity`.
- `src/components/sales/v3/SculptureStage.tsx` (novo) — encapsula frame ring + halo + spotlight bridge + ScrollAnimationSequence + particles.
- `src/styles.css` — atualizar `.sales-sculpture-col`, adicionar `.sales-spotlight-bridge`, `.sales-frame-ring`, `.sales-frame-react`.

---

## Fase 2 — Mobile/Tablet: "Window Imersiva"

Objetivo: a arte deixa de ser wallpaper desbotado e vira **janelas controladas** entre seções da copy.

Em vez de UM fixed background a 45% opacity por toda a página, fazer **3 "estações imersivas"** ancoradas em scroll milestones:

1. **Estação Pain (após B2)** — arte aparece em full-bleed dentro de um card 16:9 com mask radial e legenda micro "scanner: padrão detectado".
2. **Estação 4D (após B4)** — arte com overlay de 4 quadrantes (money/career/love/personal) pulsando.
3. **Estação Bridge (antes da Tela 13)** — arte "saindo" do frame com glow máximo, ponte visual para o CTA.

Entre as estações, fundo limpo (sem o wallpaper). Isso **aumenta o contraste** da arte e **mantém legibilidade** da copy, sem perder presença.

- Remover o bloco `fixed inset-0 -z-0 lg:hidden`.
- Adicionar `<MobileSculptureStation variant="pain|fourD|bridge">` entre as `SceneFrame` correspondentes.
- Cada estação usa `ScrollAnimationSequence` com `targetRef` próprio (a própria estação) — permite que o canvas renderize só quando visível (`IntersectionObserver`).

Arquivos:
- `src/components/sales/v3/MobileSculptureStation.tsx` (novo)
- `src/components/sales/SalesPageV2.tsx` — remover wallpaper, intercalar 3 estações.

---

## Fase 3 — Atmosfera coerente (global)

- O `<Atmosphere fog="subtle">` global concorre com a arte. **Reduzir para `fog="off"`** e mover a névoa para dentro do `SculptureStage` (desktop) e `MobileSculptureStation` (mobile) — assim a névoa só existe onde a arte pulsa.
- Aplicar `--arch-halo` no `<html data-arch>` em vez de só no rootRef, para componentes globais (StickyOfferBar, ExitIntent) também respirarem.

Arquivo: `src/components/sales/SalesPageV2.tsx`, `src/styles.css`.

---

## Fase 4 — Limpeza das tentativas antigas

Remover tudo que ficou como "tentativa flutuante" e que será substituído pela nova moldura:
- `sales-sculpture-col::before` (linha vertical) → substituído pelo spotlight bridge.
- Bloco mobile `fixed inset-0 -z-0` → substituído por estações.
- `sales-vignette` em `SceneBackground` — manter (ainda usado em outras cenas) mas confirmar que não duplica com novo halo.

Arquivo: `src/styles.css` (deletar regras obsoletas), `src/components/sales/v3/SceneBackground.tsx` (auditar uso).

---

## Fase 5 — QA visual + performance

| Viewport | Verificar |
|---|---|
| 1440px desktop | Spotlight bridge alinha com cards; halo respira no scroll; frame ring visível mas discreto |
| 1024px tablet  | Estações renderizam; entre elas o fundo fica limpo |
| 768px iPad     | Estações ocupam ~70vh, copy continua legível |
| 414px mobile   | Canvas das estações não trava scroll; mask circular nítido |
| 375px iPhone   | Mesma checagem; tier=low desliga parallax |
| RTL (AR)       | Spotlight bridge e frame ring espelham corretamente |

Comandos: `npm run build`, `tsgo`, Playwright screenshots nos 5 viewports (`/vsl` via seed do quiz).

---

## Ordem de execução (em PRs sequenciais — pequenos e reversíveis)

1. **PR Imersão-1 (Desktop Spotlight)** — Fase 1. Risco baixo, ganho visual imediato.
2. **PR Imersão-2 (Mobile Estações)** — Fase 2. Risco médio (remover wallpaper); A/B mental: estação > wallpaper.
3. **PR Imersão-3 (Atmosfera coerente)** — Fase 3.
4. **PR Imersão-4 (Cleanup + QA)** — Fases 4+5.

Cada PR termina com build verde, screenshots dos 6 viewports anexados e check manual de RTL.

---

## Notas técnicas

- `useScroll` do `ScrollAnimationSequence` continua intacto; o novo `SculptureStage` apenas envelopa o canvas — `targetRef` desktop continua sendo `rootRef`, mobile passa a ser o próprio nó da estação.
- `--arch-halo` é setada via `useEffect` no `SalesPageV2` lendo `haloIntensity` (já existe). CSS consome com `color-mix(in oklab, var(--arch-primary) calc(var(--arch-halo) * 40%), transparent)`.
- Para evitar repaint pesado: o spotlight bridge usa `transform: translateZ(0)` + `will-change: opacity`, não `filter: blur` por viewport inteiro.
- Estações mobile fazem `IntersectionObserver` para pausar o canvas quando fora da tela — economiza CPU em scroll longo.

Pronto para começar pelo **PR Imersão-1 (Desktop Spotlight)** assim que aprovares.
