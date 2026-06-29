# Atmosfera Volumétrica Cinematográfica — SalesPageV2

## Objetivo
Substituir a "faixa de fumaça" amadora por uma atmosfera real, viva e contínua: a estátua **emerge** de uma coluna densa de fumaça que sobe do pescoço, e a página inteira respira numa névoa lateral que se move com o scroll. Sem retângulos, sem bordas, sem PNG estático esticado.

## Princípios técnicos (o que muda em relação à versão atual)
1. **Fumaça gerada, não pintada.** Camadas múltiplas com `radial-gradient` + `filter: blur()` + `mix-blend-screen`, deformadas em tempo real por SVG `feTurbulence` + `feDisplacementMap` com `seed` animado. Isso dá **textura volumétrica real**, não um PNG plano.
2. **Movimento contínuo, não loop curto.** 3 camadas com durações primas entre si (23s / 31s / 47s) → nunca sincronizam, parecem orgânicas. `translate3d` + `scale` + `rotate` sutis, todos em GPU.
3. **Sem retângulo no rodapé.** A "ambient floor" vira uma elipse difusa com centro fora do viewport — não há borda visível em lugar nenhum.
4. **Coluna lateral de fumaça (sidebar).** Faixa vertical à esquerda do conteúdo (desktop), parallax inverso ao scroll, tingida com `var(--arch-primary)` em `mix-blend-screen`. Em mobile vira um glow lateral fino que não rouba largura.
5. **Pluma do pescoço.** Ancorada no `<aside>` da escultura, posicionada no offset exato do pescoço do busto (~58% do height). Três sub-plumas: densa central subindo, dispersão lateral, levantamento vertical lento.
6. **Tint do arquétipo dinâmico.** Toda a atmosfera reage à cor `--arch-primary` ativa (AO azul, SS dourado, EA roxo, HI laranja) via `color-mix(in oklab, ...)` — sem hardcode.
7. **Performance.** `use-device-tier`: desktop = 3 camadas + turbulence; tablet = 2 camadas sem turbulence; mobile = 1 camada simplificada. `prefers-reduced-motion` desliga animação e mantém o gradiente estático.

## Estrutura de implementação

### Arquivo 1 — `src/components/sales/v3/CinematicSmoke.tsx` (novo, do zero)
Quatro componentes exportados:

- **`<SmokeTurbulence />`** — SVG `<defs>` único renderizado uma vez. Define `<filter id="smoke-turb">` com `feTurbulence baseFrequency="0.012" numOctaves="3"` + `feDisplacementMap scale="40"`. `<animate>` no atributo `seed` muda lentamente (loop 19s) → textura nunca congela. Reutilizado por todas as camadas via `filter: url(#smoke-turb)`.

- **`<NeckPlume />`** — coluna de fumaça ancorada na sticky sidebar da escultura.
  - 3 divs sobrepostos com `radial-gradient(ellipse 50% 80% at 50% 100%, ...)` em opacidades 0.7 / 0.5 / 0.3
  - `filter: blur(28px) url(#smoke-turb)`
  - Animações `smoke-rise-slow` (47s), `smoke-rise-mid` (31s), `smoke-drift` (23s)
  - Máscara radial nas bordas (fade total, sem corte)
  - Origem: `top: 58%` do `<aside>` (logo abaixo do pescoço)

- **`<SideMist />`** — sidebar de fumaça lateral.
  - Desktop: `fixed inset-y-0 left-0 w-[28vw]` com gradiente vertical + horizontal
  - Mobile: `w-[40vw] opacity-40`, sem parallax
  - Parallax leve: `transform: translate3d(0, calc(var(--smoke-scroll) * -0.3px), 0)` alimentado por rAF leve (1 listener, throttled)
  - `mix-blend-screen` para se misturar com o preto

- **`<GroundHaze />`** — substitui o retângulo amador.
  - `radial-gradient(ellipse 90% 45% at 50% 115%, ...)` — centro fora do viewport → zero borda visível
  - Sem máscara linear, sem faixa, só uma "respiração" no fundo (animação `haze-breathe` 11s opacity 0.4 → 0.6)

### Arquivo 2 — `src/styles.css` (acréscimos)
- Keyframes novos: `smoke-rise-slow`, `smoke-rise-mid`, `smoke-drift`, `side-mist-flow`, `haze-breathe`
- Todos com `transform` + `opacity` apenas (GPU)
- Guard `@media (prefers-reduced-motion: reduce)` zera todas as 5 animações

### Arquivo 3 — `src/components/sales/SalesPageV2.tsx`
- Remover imports e usos de `SculptureSmoke` e `AmbientSmokeFloor`
- Inserir `<SmokeTurbulence />` uma vez no topo do container raiz
- `<SideMist />` e `<GroundHaze />` no nível do `<section>` raiz (fixed, atrás de tudo, `z-[1]`)
- `<NeckPlume />` **dentro** do `<aside>` da escultura, `absolute`, posicionado a partir de `top: 58%`

### Arquivo 4 — Limpeza
- `lovable-assets delete --file src/assets/smoke-plume.png.asset.json`
- `lovable-assets delete --file src/assets/smoke-floor.png.asset.json`
- Remover `src/components/sales/v3/SmokeAtmosphere.tsx`

## Detalhes visuais que farão a diferença
- **Sem bordas duras em lugar nenhum.** Toda camada termina em `transparent` via radial mask.
- **Tint sutil mas presente.** `color-mix(in oklab, var(--arch-primary) 22%, #0a0a0a)` na base → fumaça preta com alma da cor do arquétipo.
- **Profundidade real.** Camada traseira mais blur + menos opacity + movimento lento; frontal mais nítida + mais rápida. O olho lê paralaxe.
- **Não compete com a copy.** Opacidade máxima 0.55 nas zonas de texto; densidade só na coluna da estátua e na lateral esquerda.

## Verificação
- `bun run build` limpo
- Playwright: screenshots desktop + mobile em 3 stages de scroll (topo, meio, fim)
- Confirmar tint correto nos 4 arquétipos (AO/SS/EA/HI)
- `prefers-reduced-motion`: animações param, gradientes permanecem
- Sem retângulo, sem faixa, sem PNG cinza em lugar nenhum
