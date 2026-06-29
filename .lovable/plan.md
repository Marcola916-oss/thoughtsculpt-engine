## Objetivo

Resolver o problema "a escultura está a flutuar" integrando-a num cenário atmosférico contínuo. A página inteira aparenta **emergir de um mar de fumaça**, com nuvens densas concentradas na base do busto (pescoço/ombros) e uma sidebar de névoa contínua no rodapé da página enquanto o utilizador scrolla.

Base: o arquivo HTML de referência que tu validaste visualmente. Reaproveito **a engine inteira** (filtros SVG turbulência, puffs em camadas, canvas wisps, paralaxe) e adapto só a "casca" para React + Sales.

---

## Diretrizes inegociáveis

1. **Não tocar em copy, CTAs, badges, FAQ, testimonials, sticky bar, exit-intent, checkout, sigilos.** Só adicionar uma camada atmosférica atrás de tudo.
2. **Não mexer na escultura** (`ScrollAnimationSequence`, `SculptureParticles`). Continuam intactas.
3. **A engine de fumaça do arquivo é canônica** — reaproveitar 1:1 (filtros, keyframes, ranges de puffs, modulação de turbulência, classe Wisp). Mudar só ancoragem e escopo.
4. **Performance**: `prefers-reduced-motion` desliga loops; mobile reduz contagens; `IntersectionObserver` pausa quando fora da viewport; cleanup correto no unmount.
5. **Identidade**: a fumaça é branco-pérola com **leve tingimento** de `--arch-primary` (~12–18%) para continuidade visual com o Reveal.
6. **Build limpo**: `tsgo` 0 erros novos, `bun run build` passa.

---

## Fases (ordem de execução)

### Fase 1 — Componente AtmosphericSmoke (isolado, testável)
**Arquivo novo:** `src/components/sales/v3/AtmosphericSmoke.tsx`

Encapsula a engine completa do arquivo de referência:
- `<svg>` com `<defs>` dos filtros `f-main` e `f-floor` (feTurbulence + feDisplacementMap idênticos ao arquivo).
- 5 divs/canvas: `warm-glow`, `cloud-floor`, `cloud-main`, `wisp-canvas`, `ground-fog` + `base-vignette`.
- `useEffect` único monta tudo: `buildClouds()` (constrói os puffs DOM), `animTurb()` (modula baseFrequency a 0.00058/frame), `animWisps()` (canvas loop).
- Cleanup: `cancelAnimationFrame` nos 2 loops, limpa innerHTML dos containers.
- Props: `archetype` (para tingimento), `targetRef` (ref do `<aside>` da escultura para ancoragem), `intensity?: "full" | "reduced"` (futuro tier mobile).

**Adaptações vs arquivo de referência:**
- `bx`/`by` lidos via `targetRef.current.getBoundingClientRect()` em vez de `W*0.66, H*0.78` fixos → fumaça gruda na base real do busto em qualquer breakpoint.
- Base RGB dos puffs (188–252) recebe mix sutil com `--arch-primary` lido via `getComputedStyle`.
- Containers usam `position: fixed; inset: 0; pointer-events: none` para cobrir a página inteira (não só o hero).
- `z-index: 0` (atrás de copy `z-10` e do `<aside>` sticky).

**Verificação:** componente renderizado isolado num storybook mental — só visual, sem afetar nada.

---

### Fase 2 — Hooks de performance e a11y
**Arquivo novo:** nenhum (usa hooks existentes do projeto).

Dentro de `AtmosphericSmoke.tsx`:
- `useReducedMotion()` (já existe em `src/hooks/use-reduced-motion.ts`) → quando `true`: puffs renderizados estáticos (sem animation), `animTurb` e `animWisps` não iniciam, canvas escondido.
- `useIsMobile()` (já existe em `src/hooks/use-mobile.tsx`) → no mobile: reduzir contagem total (`floor` 34→18, `main` 22→12, `halo` 12→6, `lateral` 8→4), desligar `wisp-canvas`.
- `IntersectionObserver` no root da Sales: quando fora da viewport, suspende loops via flag `runningRef.current = false`; retoma quando volta.

**Verificação:** DevTools Performance recording — frame budget < 4ms na thread principal em desktop; mobile não derruba FPS abaixo de 50.

---

### Fase 3 — Integração na SalesPageV2
**Arquivo editado:** `src/components/sales/SalesPageV2.tsx`

Mudanças mínimas e cirúrgicas:
- Importar `AtmosphericSmoke`.
- Substituir o atual wrapper `<div aria-hidden ... fixed inset-0 -z-[1]>` do `<Atmosphere>` por `<AtmosphericSmoke archetype={archetype} targetRef={sculptureRef} />`. (O `<Atmosphere>` ambient genérico pode ficar com `fog="subtle"` ainda mais reduzido OU sair — decidir após preview visual.)
- Adicionar `sculptureRef = useRef<HTMLElement | null>(null)` e passar como `ref` ao `<aside>` da escultura.
- Remover o bloco mobile `<div className="...fixed inset-0 -z-0 lg:hidden">` com `ScrollAnimationSequence` (a fumaça assume o papel de continuidade visual mobile; a escultura continua só no desktop sticky).
- Garantir `z-index` certos: smoke `0`, escultura aside `2`, copy column `10`, sticky bar `50`.

**Verificação visual com Playwright (desktop 1280 e mobile 375):**
- Hero: fumaça densa concentrada na base do busto, sidebar lateral inferior visível.
- Scroll: fumaça inferior contínua atrás de TODAS as cenas, escultura continua sticky.
- Sem clipping/overflow horizontal.
- CTA e badges legíveis (contraste WCAG AA mantido).

---

### Fase 4 — Tingimento por arquétipo + ajuste fino
**Arquivo editado:** `src/components/sales/v3/AtmosphericSmoke.tsx`.

Após Fase 3 funcionar visualmente em branco-pérola puro:
- Ler `--arch-primary` no mount via `getComputedStyle(document.documentElement).getPropertyValue('--arch-primary')`.
- Converter para RGB e fazer mix de ~15% no `base` dos puffs (mantém pérola, ganha matiz).
- Ajustar `warm-glow` para usar `color-mix(in oklab, var(--arch-primary) 18%, transparent)` em vez do laranja fixo do arquivo.
- Testar visualmente nos 4 arquétipos (AO/SS/EA/HI) — cada um deve ter atmosfera consistente mas tonalmente própria.

**Verificação:** screenshots Playwright dos 4 arquétipos lado a lado.

---

### Fase 5 — QA final e go/no-go
1. `tsgo` — 0 erros novos.
2. `bun run build` — passa, bundle não cresce mais que ~6 kB gzipped (o componente é pequeno; a engine é JS+CSS inline).
3. Playwright desktop (1280×1800) e mobile (375×812): screenshots de Hero + Cena Pain + Cena Bridge + B9 Final.
4. `prefers-reduced-motion: reduce` ativo → confirmar render estático sem loops.
5. Lighthouse mobile: Performance ≥ 85 (já é o teto atual com escultura; fumaça não pode degradar mais que 3 pontos).
6. Verificação manual: sem console errors, sem warnings de cleanup do React no StrictMode.

---

## Estrutura técnica (resumo)

```text
src/components/sales/v3/
├── AtmosphericSmoke.tsx        ← NOVO (engine do arquivo, encapsulada em React)
│   ├── <svg defs>              ← filtros f-main, f-floor (1:1 do arquivo)
│   ├── .warm-glow              ← tingido pelo arquétipo
│   ├── .cloud-floor            ← fixed bottom, página inteira
│   ├── .cloud-main             ← ancorado em targetRef (base do busto)
│   ├── #wisp-canvas            ← canvas 2D wisps (1:1 do arquivo)
│   ├── .ground-fog             ← CSS estático
│   └── .base-vignette          ← CSS estático
└── (nenhum outro arquivo desta pasta é alterado)

src/components/sales/SalesPageV2.tsx  ← EDITADO
├── + import AtmosphericSmoke
├── + sculptureRef
├── – wrapper <Atmosphere> de fundo (ou reduzido)
├── – bloco mobile <ScrollAnimationSequence fixed>
└── + <AtmosphericSmoke archetype={archetype} targetRef={sculptureRef} />
```

---

## Ordem de PR (sugestão)

**PR único** (todas as fases ficam triviais de revisar juntas, < 300 linhas de diff):
1. Cria `AtmosphericSmoke.tsx` completo (Fases 1+2+4).
2. Integra em `SalesPageV2.tsx` (Fase 3).
3. QA final (Fase 5).

Se preferires PRs separados: PR-A = só Fase 1 (componente isolado + storybook visual num route `/dev/smoke`); PR-B = Fases 2+3+4+5.

---

## Riscos e mitigações

- **Risco:** turbulência SVG pesa GPU em mobile antigo. **Mitigação:** Fase 2 reduz contagens e o `IntersectionObserver` pausa quando off-screen.
- **Risco:** fumaça branca reduz contraste do texto. **Mitigação:** `cloud-floor` tem opacidade máxima 0.75 nos puffs frontais e a copy fica em `z-10` com o fundo escuro da página entre ela e a fumaça.
- **Risco:** tingimento por arquétipo deixa fumaça "rosa/vermelho" demais e quebra realismo. **Mitigação:** mix máximo 18%; testar visualmente nos 4 arquétipos antes de merge.
- **Risco:** ancoragem ao busto desalinha em scroll porque `aside` é sticky. **Mitigação:** recalcular `bx/by` em `scroll` listener throttled (rAF), não só no mount.

---

Pronto para começar pela Fase 1. Confirmas?
