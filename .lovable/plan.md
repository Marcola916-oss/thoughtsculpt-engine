# Plano de Ação — Cérebro 3D Responsivo + Sem Travamentos

## Diagnóstico (o que está acontecendo hoje)

1. **Tamanho fixo em px (`size={isMobileMotion ? 360 : 580}`)** — `ArchetypeSplineBrain` recebe `width/height` inline em pixels. Não responde a `resize`, não tem breakpoint para tablet (768–1023), e em telas grandes (≥1536px) fica pequeno porque o `font-size` do título cresce com `text-[10rem]`.
2. **Ícone do arquétipo sobreposto ao cérebro no mobile** — o `<motion.div>` do ícone usa `absolute top-1/2 left-1/2` relativo ao container `.text-center` inteiro (kicker + cérebro + h1 + tagline). O centro vertical desse container cai sobre o `<h1>`, mas no mobile a coluna é mais estreita e o ícone "sobe" para cima do cérebro.
3. **Delay para aparecer** — o preload do Spline (`import()` + `fetch("/brain.splinecode")`) só dispara quando `stage.kind === "email" | "loader"`. Se o usuário cair direto no quiz (refresh) ou pular etapas, a cena não está em cache.
4. **Performance em mobile/low-end** — Spline carrega um runtime WebGL de ~1.5MB + cena. Em dispositivos `low` (detectados por `useDeviceTier`), isso causa jank, drena bateria e às vezes trava o browser. Não há fallback leve por tier.
5. **Cor do arquétipo via `filter: hue-rotate`** — funciona bem, mas precisa ser preservada em qualquer fallback que substitua o Spline em dispositivos fracos.

## Ações

### 1. Responsividade real do cérebro (CSS-driven, não JS)
- Trocar `size` numérico por **tamanho fluido baseado em viewport** dentro do próprio `ArchetypeSplineBrain`:
  - mobile (<640px): `min(80vw, 360px)`
  - tablet (640–1023px): `min(60vw, 480px)`
  - desktop (1024–1535px): `min(48vw, 620px)`
  - desktop XL (≥1536px): `min(42vw, 760px)`
- Implementar via `clamp()` em CSS custom property (ex.: `--brain-size: clamp(280px, 60vw, 760px)`) aplicada no wrapper. Isso elimina recalc no resize e funciona até em SSR.
- Manter prop `size` opcional para overrides pontuais.

### 2. Corrigir sobreposição do ícone (mobile)
- Mover o `<ArchetypeIcon>` para **dentro do mesmo wrapper do cérebro** (`relative` no wrapper + `absolute inset-0 grid place-items-center` no ícone). Assim o ícone fica sempre centralizado *no* cérebro, em qualquer viewport.

### 3. Preload imediato + persistente
- Disparar o preload do Spline (`import("@splinetool/react-spline")` + `fetch("/brain.splinecode")`) **no mount da página** (`useEffect` com deps `[]`), e não apenas em `email`/`loader`. Latência de rede absorvida durante o tempo que o usuário lê o hero/quiz.
- Adicionar `<link rel="prefetch" href="/brain.splinecode">` no `__root.tsx` `head()` para que o browser baixe em idle, independente do JS.

### 4. Fallback por device tier (zero travamento em mobile fraco)
- Usar `useDeviceTier()` dentro de `ArchetypeSplineBrain`:
  - **`high` (desktop hover)** → Spline 3D completo + spin + filter de cor.
  - **`medium` (tablet / mobile bom)** → Spline com `speed` reduzido (0.002) e `dpr` limitado a 1 para economizar GPU.
  - **`low` (mobile fraco / `prefers-reduced-motion`)** → renderizar `ArchetypeRetroBrain` (já existe no projeto, procedural canvas, ~10x mais leve) com a mesma cor do arquétipo. Sem WebGL pesado, sem travamento.
- Decisão tomada **após mount** (evita mismatch de SSR); fallback inicial = halo CSS já existente.

### 5. Limitar custo do WebGL mesmo no `high`
- No `onLoad`, setar `app.setSize?.(...)` apenas se necessário e limitar `devicePixelRatio` do canvas a `Math.min(window.devicePixelRatio, 1.5)` — evita render em 3x em telas Retina, principal causa de jank.
- Pausar o RAF de rotação quando a aba está oculta (`document.visibilityState`) ou o elemento sai do viewport (`IntersectionObserver`). Economiza bateria e libera main thread.

### 6. Garantia de cor do arquétipo em qualquer caminho
- Centralizar `ARCHETYPE_HEX` + `ARCHETYPE_FILTER` em um único helper exportado.
- `ArchetypeRetroBrain` (fallback) já aceita cor — passar `ARCHETYPE_HEX[archetype]` para que o cérebro **sempre** carregue a cor do arquétipo, independentemente de qual renderer rodou.

### 7. Verificações antes de fechar
- `npm run build` limpo.
- Smoke test em 3 viewports: 375×667 (iPhone SE), 820×1180 (iPad), 1920×1080 (desktop) — cérebro centralizado, ícone sobre o cérebro, sem scroll horizontal, sem caixa.
- Console limpo (sem warnings de Spline / WebGL context lost).

## Arquivos a tocar

```text
src/components/identity/ArchetypeSplineBrain.tsx   (tamanho fluido + tier fallback + dpr + visibility pause)
src/routes/index.tsx                               (preload no mount + ícone dentro do wrapper do cérebro)
src/routes/__root.tsx                              (<link rel="prefetch"> do .splinecode)
```

Nenhuma mudança em lógica de negócio, i18n ou Supabase. Só camada de apresentação + performance.

Posso executar?
