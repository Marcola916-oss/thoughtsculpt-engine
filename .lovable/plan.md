
# Fase F — Plano de Execução

**Objetivo:** Eliminar o grosso do `framer-motion` da landing/quiz (rota `/`) e dos primitivos de interação compartilhados (`Reveal`, `ArchetypeHover`, `ButtonPress`, `Logo`, `BustEmptyState`, `QuizScreenWrapper`, `NeuralLoader`), e fechar o BustLoader (mensagens/logs). Meta: rota `/` 100% framer-free; chunk inicial −80 a −120 kB gzipped. Zero mudança visual.

**Escopo:** P3-INDEX (refator `MSection`/`MFade`/`Hero`/`Sales`/`Plans` em `index.tsx`) · P3-REVEAL (Reveal → IntersectionObserver + CSS) · P3-HOVER (ArchetypeHover → CSS vars) · P3-BTN (ButtonPress → CSS) · P3-LOGO (Logo → CSS) · P3-BUSTEMPTY (BustEmptyState → CSS) · P3-QUIZWRAP (QuizScreenWrapper → CSS) · P3-NEURAL (NeuralLoader → CSS/SVG) · P3-BUSTLOADER-FINAL (mensagens/logs → CSS fade) · P3-VERIFY (medir bundle e validar).

**Out of scope (Fase G):** dashboard interno (`dashboard.*`, `Sidebar`, `StreakCounter`, `AchievementUnlock`, `TaskCheckbox`, `PrimaryButton`, `PageTransition`, `onboarding`, `obrigado`), `MarbleBust` (SVG complexa com `motion` em paths internos — refator dedicado), `ArchetypeRetroBrain` canvas internals.

---

## Arquivo 1 · `src/routes/index.tsx` (P3-INDEX — maior cirurgia)

### Problema
74 ocorrências de `motion.|AnimatePresence|useReducedMotion`. Componentes locais `MSection`, `MFade` envolvem cada bloco da landing e do quiz com `motion.div` + variants. `Hero`, `Sales`, `Plans` usam `motion.div` para entrance + stagger. `AnimatePresence` no switch de stages (`hero|identity|q|email|loader|reveal`).

### Mudança
1. **`MSection`** → `<section>` com `className="reveal-on-scroll"` (IntersectionObserver compartilhado, igual ao `Reveal` reescrito no item 2). Aceita `delay` como CSS var `--reveal-delay`.
2. **`MFade`** → `<div className="fade-in-up">` + `style={{ animationDelay }}`. CSS:
   ```css
   @keyframes fade-in-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
   .fade-in-up { animation: fade-in-up 600ms ease-out both; }
   .reveal-on-scroll { opacity: 0; }
   .reveal-on-scroll.is-visible { animation: fade-in-up 700ms ease-out both; animation-delay: var(--reveal-delay, 0ms); }
   ```
3. **Hero / Sales / Plans blocks** → trocar cada `motion.div` por `<div>` com classe `reveal-on-scroll` (entrada por viewport) ou `fade-in-up` (entrada imediata).
4. **Stagger** → herdar via `style={{ '--reveal-delay': \`${i * 80}ms\` }}` em vez de variants Framer.
5. **`AnimatePresence` do stage switch** → substituir por componente `<StageTransition>` que renderiza o filho com classe `stage-enter` por 400ms, sem unmount animado. Stages mudam tão raramente (≤6 transições no funil inteiro) que CSS-only basta.
6. **`useReducedMotion`** → remover o local hook; ler de `useIsReducedMotion()` (já criado na Fase D) só nos pontos que ainda precisam (provavelmente nenhum, pois as classes CSS já têm `@media (prefers-reduced-motion: reduce) { animation: none; }`).
7. **`isMobileMotion` / `reducedMotion` flags** → remover de uma vez; CSS cuida.
8. **Import** `framer-motion` removido do topo do arquivo.

### Impacto visual
- Entrada por viewport idêntica (fade + 16px translateY, 600-700ms ease-out).
- Stagger idêntico (delay incremental).
- Stage switch: ganha 400ms de fade em vez de cross-fade (já era praticamente isso; o `mode="wait"` mantinha unmount→mount sem overlap).

### Risco
- **Alto** (em volume): ~74 sites de mudança em 1 arquivo de 1500+ linhas. Mitigação: refator em 3 passes (1. helpers `MSection`/`MFade`; 2. blocos do Sales; 3. AnimatePresence). Build após cada pass.
- Visual idêntico se as classes CSS forem fiéis.

### Ganho
- Remove `framer-motion` do chunk inicial da rota `/` (era ~30-40 kB gzipped do vendor share).

---

## Arquivo 2 · `src/components/interaction/Reveal.tsx` (P3-REVEAL)

### Problema
`Reveal` usa `motion.div` + `useInView` + variants. É consumido em ~20 lugares (landing inteira, /obrigado, dashboard parcialmente).

### Mudança
Reescrever com IntersectionObserver nativo + classe CSS `reveal-on-scroll` (já definida no item 1):
```tsx
export function Reveal({ children, delay = 0, as: Tag = "div", className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { rootMargin: "-10% 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={cn("reveal-on-scroll", visible && "is-visible", className)} style={{ "--reveal-delay": `${delay}ms` } as any}>{children}</Tag>;
}
```
`Reveal.Group` → wrapper que injeta `style={{ '--reveal-delay': \`${i * stagger}ms\` }}` nos filhos via Children.map.

### Impacto visual
- IntersectionObserver fires igual; mesmo threshold (`-10%`); mesma animação CSS.
- API pública preservada (props `delay`, `as`, `className`, `<Reveal.Group stagger={80}>`).

### Risco
- Baixo. Reescrita isolada num único componente; consumers não mudam.

### Ganho
- Reveal vira ~30 linhas sem dependência framer. Todos os ~20 call sites deixam de puxar framer.

---

## Arquivo 3 · `src/components/interaction/ArchetypeHover.tsx` (P3-HOVER)

### Problema
Wrapper com `motion` + `useMousePosition` para efeito hover de tilt/glow.

### Mudança
- Trocar `motion.div` por `<div>` com `onPointerMove`/`onPointerLeave` setando CSS vars `--mx`, `--my`, `--hover` no `style`.
- CSS faz o resto: `transform: perspective(800px) rotateX(calc(var(--my)*-6deg)) rotateY(calc(var(--mx)*6deg))`.
- `transition: transform 200ms ease-out` para o easing.

### Impacto visual
- Mesma sensação de tilt.
- Pode haver micro-diferença no easing comparado a Framer spring — usar `cubic-bezier(0.16, 1, 0.3, 1)` para aproximar.

### Risco
- Baixo. Componente pequeno, ~40 linhas.

---

## Arquivo 4 · `src/components/interaction/ButtonPress.tsx` (P3-BTN)

### Problema
Halo vermelho que segue o cursor no botão CTA. `motion` + `useMousePosition`.

### Mudança
- Mesmo padrão do item 3: `onPointerMove` seta CSS vars `--cursor-x`, `--cursor-y`.
- Pseudo-elemento `::before` com `background: radial-gradient(120px at var(--cursor-x) var(--cursor-y), color-mix(in oklab, var(--accent) 30%, transparent), transparent)`.
- `:active` aplica `transform: scale(0.97)` via CSS.

### Impacto visual
- Idêntico (halo segue cursor com mesma curva).

### Risco
- Nenhum.

---

## Arquivo 5 · `src/components/identity/Logo.tsx` (P3-LOGO)

### Problema
2 usos de `motion`/`useReducedMotion` para entrada e hover.

### Mudança
- Entrada: classe `fade-in-up` (já existe).
- Hover scale: `transition: transform 200ms; &:hover { transform: scale(1.04); }` puro CSS.
- Remover import framer.

### Risco
- Nenhum.

---

## Arquivo 6 · `src/components/identity/BustEmptyState.tsx` (P3-BUSTEMPTY)

### Problema
2 usos de `motion` para entrada + breathe loop.

### Mudança
- Entrada: `fade-in-up`.
- Breathe: keyframe CSS `breathe` (scale 1 → 1.02 → 1, 4s ease-in-out infinite). Já pode existir; senão adicionar.

### Risco
- Nenhum.

---

## Arquivo 7 · `src/components/quiz/QuizScreenWrapper.tsx` (P3-QUIZWRAP)

### Problema
8 usos de motion/AnimatePresence para transição entre perguntas do quiz.

### Mudança
- Trocar `AnimatePresence` por re-mount via `key={questionIndex}` + classe `stage-enter`:
  ```css
  @keyframes stage-enter { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: none; } }
  .stage-enter { animation: stage-enter 350ms cubic-bezier(0.16,1,0.3,1) both; }
  ```
- Direção (forward/back) opcional via classe modifier `stage-enter--back` que inverte o `translateX`.

### Impacto visual
- Mesma transição. Sem cross-fade — outgoing question some instantly. Aceitável: usuário só vê 1 vez por transição, ~10 transições no quiz.

### Risco
- Médio. Se direção (forward/back) for visualmente importante, garantir que o state da direção chegue como prop.

---

## Arquivo 8 · `src/components/quiz/NeuralLoader.tsx` (P3-NEURAL)

### Problema
10 usos de motion para anel girando + textos fade-in.

### Mudança
- Anel girando: keyframe CSS `neural-spin` (já há `hologram-spin-cw` do P1-1 — reaproveitar ou criar variante).
- Textos: `<p key={msgIndex} className="neural-text fade-in-up">` — fade out via `key` re-mount.
- Pulsos de partícula: classe `neural-pulse` com `animation-delay` escalonado.

### Risco
- Baixo.

---

## Arquivo 9 · `src/components/identity/BustLoader.tsx` (P3-BUSTLOADER-FINAL)

### Problema (restante da Fase D)
`AnimatePresence` ainda envolve mensagens (msgs) e logs (logs scrollable). Cada uma anima entry/exit com `motion.p`.

### Mudança
- **Mensagens (slot único):** trocar `AnimatePresence mode="wait"` por re-mount via `key={msgIndex}` + classe `fade-in-up`. Outgoing some sem fade-out — aceitável (mensagens trocam a cada 700ms, usuário mal percebe).
- **Logs (lista crescente):** cada log entra com `motion.p` (slide+fade). Trocar por `<p className="log-enter">`:
  ```css
  @keyframes log-enter { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
  .log-enter { animation: log-enter 250ms ease-out both; }
  ```
  Logs nunca somem (lista cresce), então não precisa de exit animation.
- Remover import `motion`, `AnimatePresence`.

### Impacto visual
- Mensagens: idêntico na entrada, troca instantânea na saída (era 200ms fade-out — imperceptível em ciclo de 700ms).
- Logs: idêntico.

### Ganho
- BustLoader 100% framer-free. Ainda mais relevante porque é o loader rendered durante 3s em cada quiz.

---

## Arquivo 10 · `src/styles.css` (consolidar keyframes)

### Mudança
Adicionar/garantir keyframes globais usados acima:
- `fade-in-up` (já pode existir como `animate-fade-in-up`).
- `stage-enter` (+ variante `--back`).
- `log-enter`.
- `breathe` (se ainda não houver para BustEmptyState).
- Bloco `@media (prefers-reduced-motion: reduce) { .reveal-on-scroll, .fade-in-up, .stage-enter, .log-enter, .breathe { animation: none !important; opacity: 1 !important; transform: none !important; } }` no fim.

### Risco
- Nenhum.

---

## Ordem de execução

1. **Arquivo 10 (styles.css)** — criar keyframes primeiro; nada quebra.
2. **Arquivo 2 (Reveal)** — fundação compartilhada; build após.
3. **Arquivos 5/6/3/4 (Logo, BustEmptyState, ArchetypeHover, ButtonPress)** — primitivos pequenos, paralelos. Build.
4. **Arquivo 8 (NeuralLoader)** + **Arquivo 9 (BustLoader)** — loaders. Build.
5. **Arquivo 7 (QuizScreenWrapper)** — transições quiz. Build + smoke do quiz inteiro.
6. **Arquivo 1 (index.tsx)** — maior cirurgia, 3 passes. Build após cada pass.
7. **Verificação final:** `npm run build`, comparar `dist/assets/index-*.js` antes/depois; `rg "framer-motion" src/routes/index.tsx` deve retornar 0; rota `/` Lighthouse opcional.

## Rollback
- Cada arquivo é independente. Reveal é o mais crítico (cascata de consumers) — se quebrar, revert isolado e o resto da Fase F segue.

## Fora de escopo (Fase G)
- Dashboard interno (logged-in): `Sidebar`, `StreakCounter`, `AchievementUnlock`, `TaskCheckbox`, `PrimaryButton`, `PageTransition`, `dashboard.*`, `onboarding`.
- `MarbleBust` (SVG com motion em paths) — refator dedicado.
- `ArchetypeRetroBrain` canvas internals.
- CRLF auto-fix.

## Tempo estimado
- Arquivo 10: 3 min.
- Arquivo 2: 10 min.
- Arquivos 5/6/3/4: 15 min total.
- Arquivos 8/9: 15 min.
- Arquivo 7: 10 min.
- Arquivo 1: 40-60 min (maior risco).
- **Total: ~95-115 min.**

## Ganho esperado
- Rota `/` 100% framer-free (era 74 ocorrências em 1 arquivo + cascata dos primitivos).
- Chunk inicial: **−80 a −120 kB gzipped** (framer-motion sai do vendor share da landing).
- Dezenas de subscriptions Framer eliminadas permanentemente.
- API pública dos primitivos (`Reveal`, `ButtonPress`, `ArchetypeHover`) preservada → dashboard pode migrar gradualmente na Fase G sem breaking change.
- Zero mudança visual.

---

# Fase E — Plano de Execução (concluída)

**Objetivo:** Reduzir bundle inicial via lazy-load das brains de reveal/loader, eliminar framer remanescente do TopBar, e enxugar a barrel de identity para tree-shaking real. 5 itens, ~6 arquivos, zero mudança visual.

**Escopo:** P2-LAZY1 (reveal brains) · P2-LAZY2 (BustLoader) · P2-BARREL (split identity) · P2-TOPBAR (último framer) · P2-FS (FloatingSymbols mobile audit).

---

## Arquivo 1 · `src/routes/index.tsx` (P2-LAZY1 — reveal brains)

### Problema
`index.tsx` linha 36:
```ts
import { CircuitBrain, ArchetypeRevealArt, CelebrationBrain, ArchetypeRetroBrain, ArchetypeSplineBrain } from "@/components/identity";
```
- `ArchetypeRevealArt`, `CelebrationBrain`, `ArchetypeRetroBrain`, `ArchetypeSplineBrain` só renderizam no stage `reveal` (após ~3-5min de quiz). Hoje todos entram no chunk inicial da rota `/`.
- `ArchetypeRetroBrain` tem canvas + rAF próprio (235 linhas). `ArchetypeSplineBrain` já preload `@splinetool/react-spline` via prefetch, mas a casca do componente ainda é eager.
- **Estimativa:** ~25-40 kB gzipped fora do chunk de landing.

### Mudança
- Manter `CircuitBrain` eager (usado em loader stage e em outras rotas).
- Lazy-load das 4 brains de reveal:
  ```tsx
  const ArchetypeRevealArt    = lazy(() => import("@/components/identity/ArchetypeRevealArt").then(m => ({ default: m.ArchetypeRevealArt })));
  const CelebrationBrain      = lazy(() => import("@/components/identity/CelebrationBrain").then(m => ({ default: m.CelebrationBrain })));
  const ArchetypeRetroBrain   = lazy(() => import("@/components/identity/ArchetypeRetroBrain").then(m => ({ default: m.ArchetypeRetroBrain })));
  const ArchetypeSplineBrain  = lazy(() => import("@/components/identity/ArchetypeSplineBrain").then(m => ({ default: m.ArchetypeSplineBrain })));
  ```
- Envolver os usos no componente `Reveal` com `<Suspense fallback={<CircuitBrain .../>}>` (CircuitBrain já está no bundle, vira fallback grátis).
- Prefetch quando `stage.kind === "loader"` (similar ao que já é feito com Spline para `email`):
  ```tsx
  useEffect(() => {
    if (stage.kind !== "loader") return;
    import("@/components/identity/ArchetypeRevealArt");
    import("@/components/identity/CelebrationBrain");
    import("@/components/identity/ArchetypeRetroBrain");
    import("@/components/identity/ArchetypeSplineBrain");
  }, [stage.kind]);
  ```
  → durante os ~3s do loader o browser baixa as 4 brains. Reveal entra sem flash.

### Impacto visual
- Zero. Suspense fallback é o CircuitBrain (já existente no chunk), e o prefetch garante que reveal nunca veja o fallback de fato.

### Risco
- Baixo. Se prefetch falhar (sem rede), reveal mostra CircuitBrain brevemente antes do brain certo aparecer — não quebra.

---

## Arquivo 2 · `src/routes/index.tsx` (P2-LAZY2 — BustLoader)

### Estado atual
`BustLoader` **não é importado** em `index.tsx` (Sim/Não verificar via grep). Atualmente quem cobre o loader stage é `NeuralLoader`. Pular este item se confirmar não-uso, ou aplicar mesmo padrão lazy se `BustLoader` for adicionado ao quiz futuramente.

### Verificação obrigatória antes
`rg "BustLoader" src/routes/index.tsx` → se ausente, pular este item e fazer apenas em `/onboarding` ou `/share` quando aplicável.

---

## Arquivo 3 · `src/components/identity/index.ts` (P2-BARREL)

### Problema
Barrel exporta tudo. Quando uma rota só precisa de `CircuitBrain` (ex: `dashboard.index.tsx`), o bundler ainda tem que avaliar o módulo barrel inteiro — pega `MarbleBust` (468 linhas SVG), `BustLoader` (framer + AnimatePresence), `ArchetypeRetroBrain` (canvas), etc. Tree-shaking funciona em produção (Rollup), mas o grafo de análise fica maior e qualquer import side-effect num desses puxa todos.

### Mudança
- Manter o barrel para conveniência mas **migrar imports críticos para path direto**:
  - `routes/index.tsx`: `import { CircuitBrain } from "@/components/identity/CircuitBrain"`.
  - `routes/_authenticated/dashboard.index.tsx`: idem.
  - `routes/_authenticated/dashboard.settings.tsx`: `Logo` e `CircuitBrain` direto.
  - `components/quiz/NeuralLoader.tsx`: `CircuitBrain` direto.
- Barrel continua existindo para imports menos críticos (`obrigado.tsx`).
- Validar com `ls dist/assets/` antes/depois pra confirmar redução do chunk dashboard/landing.

### Impacto visual
- Zero. Mudança puramente de bundler.

### Risco
- Nenhum. Só refatoração de import paths.

---

## Arquivo 4 · `src/components/landing/TopBar.tsx` (P2-TOPBAR)

### Problema (linhas 47-53)
Único uso restante de `motion` no TopBar: barra inferior `scaleX 0→1` quando rola. Mantém framer-motion no chunk do TopBar/landing.

### Mudança
Trocar `motion.div` por `<div>` com classe CSS `topbar-scrollbar`:
```css
@keyframes topbar-scrollbar-in { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.topbar-scrollbar { animation: topbar-scrollbar-in 0.5s ease-out forwards; transform-origin: left; }
```
- Remover `import { motion } from "framer-motion"`.
- `TopBar` fica 100% framer-free.

### Impacto visual
- Zero. Mesma animação one-shot.

### Risco
- Nenhum.

---

## Arquivo 5 · `src/components/atmosphere/FloatingSymbols.tsx` (P2-FS — audit mobile)

### Estado atual
- Comentário no header diz "Each symbol hides on mobile once the count crosses the breakpoint threshold". Cerca de 50% dos slots têm `mobileHidden: true`.
- 50% restantes ainda podem rodar `animation drift` mesmo em mobile.

### Mudança
- Confirmar via leitura completa: se o keyframe drift estiver ativo em mobile, adicionar override em `styles.css`:
  ```css
  @media (hover: none), (max-width: 767px) {
    [data-floating-symbols] .symbol-drift { animation: none !important; }
  }
  ```
- Se 50% mobileHidden já garante experiência ok, **reduzir count efetivo no mobile** para 4 max (em vez de 8 default), via prop ou guard interno.

### Impacto visual
- Desktop: idêntico.
- Mobile: símbolos param de driftar (já são decoração de baixa opacidade, drift quase imperceptível em telas pequenas).

### Risco
- Baixíssimo. Decoração pura.

---

## Ordem de execução

1. **P2-BARREL** (arquivo 3) — refator mecânico de imports, ganho imediato de tree-shaking.
2. **P2-TOPBAR** (arquivo 4) — keyframe CSS + 1 div, ~3 linhas alteradas.
3. **P2-LAZY1** (arquivo 1) — lazy + Suspense + prefetch, mais cirúrgico.
4. **P2-FS** (arquivo 5) — CSS-only se aplicável.
5. **P2-LAZY2** (arquivo 2) — pular se `BustLoader` não estiver em uso na rota.
6. `npm run build` após cada item.

## Rollback
- Cada item independente, revert por arquivo.
- P2-LAZY1 é o maior — se Suspense piscar em algum cenário, basta voltar pro import eager.

## Fora de escopo
- Sales block 4 refactor (4D product grid) → Fase F.
- Refator dos Framer remanescentes em `Reveal.tsx`, `ArchetypeHover`, `ButtonPress`, `Logo`, `BustEmptyState`, `QuizScreenWrapper` → Fase F (são onipresentes ou pouco impacto individual).
- `ArchetypeRetroBrain` canvas internals → Fase F se Lighthouse ainda apontar.
- CRLF auto-fix do projeto inteiro → janela de manutenção dedicada.

## Tempo estimado
- P2-BARREL: ~5 min.
- P2-TOPBAR: ~3 min.
- P2-LAZY1: ~10 min.
- P2-FS: ~5 min.
- Total: ~25 min de edição + builds.

## Ganho esperado
- **Chunk inicial da rota `/`:** -25 a -40 kB gzipped (4 brains saem para chunks lazy).
- **TopBar:** sem framer (1 import a menos no chunk landing).
- **Tree-shaking real do dashboard:** evita avaliar MarbleBust/BustLoader/etc no chunk dashboard.
- **Mobile FloatingSymbols:** opcional, ainda alguns rAF de CSS a menos.
- Zero mudança visual.
- Zero feature removida.

---

# Fase D — Plano de Execução (concluída)

**Objetivo:** Eliminar as últimas subscriptions Framer caras nos loaders/identidade e corrigir o anti-pattern do `isMobileMotion` (variável de módulo). 3 itens, 3 arquivos, zero mudança visual no desktop.

**Escopo:** P1-1 (HologramRing → CSS) · P1-2 (BustLoader: orbitais + ring → CSS/SVG SMIL ou rAF único) · P1-8 (`isMobileMotion` virar estado reativo via Context).

---

## Arquivo 1 · `src/components/quiz/HologramRing.tsx` (P1-1)

### Problema
Dois `motion.svg` com `animate={{ rotate: ±360 }} repeat: Infinity`. Cada um aloca um motion value + rAF subscriber rodando 60fps **enquanto o loader estiver montado** (estágios identity + loader do quiz). Para uma animação puramente linear de rotação, CSS keyframes são gratuitos — o compositor do browser cuida sem JS.

### Mudança
- Remover `import { motion } from "framer-motion"`.
- Trocar `motion.svg` por `<svg>` com `className="hologram-spin-slow"` / `hologram-spin-fast"`.
- Adicionar em `src/styles.css` (perto dos outros keyframes de rotação):
  ```css
  @keyframes hologram-spin-cw  { to { transform: rotate(360deg); } }
  @keyframes hologram-spin-ccw { to { transform: rotate(-360deg); } }
  .hologram-spin-slow { animation: hologram-spin-cw 8s linear infinite; transform-origin: center; }
  .hologram-spin-fast { animation: hologram-spin-ccw 12s linear infinite; transform-origin: center; }
  @media (prefers-reduced-motion: reduce) {
    .hologram-spin-slow, .hologram-spin-fast { animation: none; }
  }
  ```
- No mobile, já coberto pelo bloco `@media (hover: none), (max-width: 767px)` que pode incluir `animation: none` se quisermos ser conservadores (decisão: **manter ativo no mobile** — é só `transform`, compositado em GPU, custo ~0).

### Impacto visual
- Zero. Mesmo timing (8s / 12s), mesmo easing (linear), mesmo sentido.

### Risco
- Nenhum. Rotação CSS é equivalente 1:1 a `animate={{ rotate }}` linear.
- **Bônus:** loader perde 2 subscriptions framer permanentes.

---

## Arquivo 2 · `src/components/identity/BustLoader.tsx` (P1-2)

### Problema
- 6 `motion.div` orbitais com `animate={{ opacity, scale }} repeat: Infinity` → 6 subscriptions Framer rodando o tempo todo durante o loader (3s padrão, mas usado também em /onboarding e /share por períodos maiores).
- `motion.circle` do progress ring usa `strokeDashoffset` controlado por state que **já atualiza a cada rAF** — o wrapper `motion.circle` aqui só agrega overhead (Framer não está interpolando — o valor vem do `progress` state). Pode virar `<circle>` puro.
- `motion.p` do contador `%` com `key={Math.round(progress)}` → cria/destrói nó Framer **100 vezes** em 3s. Pode ser `<p>` puro (o número troca, sem animação visível além disso).

### Mudança
1. **Orbitais (6):** trocar `motion.div` por `<div>` com `className="bust-orbital"` + delay inline via `style={{ animationDelay: `${i * 0.25}s` }}`. CSS:
   ```css
   @keyframes bust-orbital-pulse {
     0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
     50%      { opacity: 0.9; transform: translate(-50%, -50%) scale(1.3); }
   }
   .bust-orbital {
     animation: bust-orbital-pulse 1.5s ease-in-out infinite;
     will-change: transform, opacity;
   }
   @media (hover: none), (max-width: 767px) {
     .bust-orbital { animation: none; opacity: 0.6; will-change: auto; }
   }
   ```
   Ajustar o cálculo `top/left` para não conflitar com `translate(-50%, -50%)` — usar `marginLeft/marginTop` continua válido, ou mudar para `transform: translate(calc(-50% + Xpx), calc(-50% + Ypx))` direto. Decisão: manter `top/left` + `marginLeft/marginTop` como hoje, e ajustar keyframe pra `scale` apenas (sem `translate`). Mais simples:
   ```css
   @keyframes bust-orbital-pulse {
     0%, 100% { opacity: 0.3; transform: scale(0.8); }
     50%      { opacity: 0.9; transform: scale(1.3); }
   }
   ```
2. **Progress ring:** `motion.circle` → `<circle>`. `strokeDashoffset` continua reativo ao state. Remove um motion wrapper.
3. **Contador `%`:** `motion.p` com `key` → `<p>` puro. Remove 100 mount/unmount em 3s.
4. **Mantém:** `AnimatePresence` das mensagens (msgs + logs) — esses são essenciais para o feel cinemático e rodam só ~5x cada.

### Impacto visual
- Orbitais: idêntico (mesma curva, mesmo delay escalonado, mesma duração).
- Ring: idêntico (já era state-driven, framer não acrescentava nada).
- Contador: idêntico (a "animação" de scale 0.85→1 em 100ms era praticamente imperceptível em texto que muda 100x/3s).

### Risco
- Baixo. Visual 1:1 nos 3 elementos.

### Ganho
- 7 subscriptions Framer removidas (6 orbitais + 1 ring) + 100 mount/unmount de `motion.p` em 3s.

---

## Arquivo 3 · `src/routes/index.tsx` — `isMobileMotion` (P1-8)

### Problema (linhas 51-133)
```ts
let isMobileMotion = false;
...
function LandingAndQuiz() {
  isMobileMotion = useReducedMotion();
  ...
}
```
- **Variável de módulo** mutada dentro de um componente. Anti-pattern: se duas instâncias do componente coexistirem (não acontece hoje, mas frágil), uma sobrescreve a outra. Pior: componentes filhos (`MSection`, `MItem`, blocos `Sales`) leem `isMobileMotion` no top-level **antes** do `LandingAndQuiz` renderizar na primeira passagem do SSR → no SSR o valor é sempre `false`.
- Isso significa que **o SSR sempre renderiza variantes Framer**, mesmo em dispositivos reduced-motion, e só "corrige" no client após hidratação → flash + custo de hidratação inicial.

### Mudança
Substituir por **Context** + hook:

```tsx
// novo: src/hooks/use-reduced-motion-context.tsx
const ReducedMotionCtx = createContext(false);
export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return <ReducedMotionCtx.Provider value={reduced}>{children}</ReducedMotionCtx.Provider>;
}
export const useIsReducedMotion = () => useContext(ReducedMotionCtx);
```

Em `src/routes/index.tsx`:
- Remover `let isMobileMotion = false;`.
- `MSection` e `MItem` viram componentes que chamam `useIsReducedMotion()` (são hooks-safe, renderizam normalmente).
- Todos os `if (isMobileMotion)` espalhados (linhas 553, 580, 1090, 1119, 1388, 1402) viram `if (reducedMotion)` lendo do hook dentro do componente onde estão.
- Embrulhar a árvore com `<ReducedMotionProvider>` no `__root.tsx` (ou no topo de `LandingAndQuiz`).

### Impacto visual
- Desktop sem reduced-motion: idêntico.
- Desktop com reduced-motion: idêntico (já funcionava após hidratação, agora corrigido também).
- Mobile: idêntico.

### Risco
- **Médio.** É a maior cirurgia das 3, toca ~10 call sites no mesmo arquivo. Edição mecânica (find/replace `isMobileMotion` → `reducedMotion` dentro de cada componente, depois adicionar `const reducedMotion = useIsReducedMotion();` no topo de cada um). Verificar build TS após cada componente refatorado.

### Ganho
- Correção do anti-pattern de módulo mutável.
- SSR correto desde o primeiro paint.
- Reativo a mudanças do system setting sem reload.

---

## Ordem de execução

1. `src/components/quiz/HologramRing.tsx` + `src/styles.css` (keyframes) — menor risco, valida o padrão.
2. `src/components/identity/BustLoader.tsx` + `src/styles.css` (orbitais) — risco baixo.
3. `src/hooks/use-reduced-motion-context.tsx` (novo) + `src/routes/__root.tsx` (provider) + `src/routes/index.tsx` (refatoração mecânica) — maior cirurgia, fazer por último.
4. `npm run build` após cada arquivo.

## Rollback
- Itens 1-2: independentes, revert por arquivo via History.
- Item 3: maior — mas o `let isMobileMotion = false` pode ser restaurado num único hunk se algo der errado.

## Fora de escopo
- Todos os P2 → Fase E.
- Refatoração do `Sales` block 4 (4D product grid) → Fase E se necessário.
- Lazy-load de `MarbleBust` variants → Fase E.

## Tempo estimado
- Item 1: ~5 min.
- Item 2: ~10 min.
- Item 3: ~20 min (refatoração mecânica + verificação por componente).
- Total: ~35 min de edição + build.

## Ganho esperado
- **9 subscriptions Framer eliminadas permanentemente** (2 HologramRing + 6 BustLoader orbitais + 1 ring).
- **100 mount/unmount de motion.p eliminados** por execução do BustLoader.
- **Anti-pattern corrigido:** `isMobileMotion` agora reativo e SSR-safe.
- Zero mudança visual no desktop, zero feature removida.

---

# Fase C — Plano de Execução (concluída)

**Objetivo:** Limpar listeners caros, remover subscriptions Framer onde dá pra usar API nativa, e adicionar resets faltantes de `will-change` no mobile. 6 itens, 5 arquivos, sem mudança visual.

**Escopo:** P0-2 (GlobalAmbient cleanup) · P0-3 (BackgroundAmbient will-change) · P1-3 (MagneticCursor sem framer) · P1-4 (TopBar sem useScroll) · P1-5 (StickyCTA passive) · P1-6 (badges hero condicional).

---

## Arquivo 1 · `src/styles.css` (P0-2 + P0-3 + P2-1 preventivo)

### Mudança
Adicionar no bloco `@media (hover: none), (max-width: 767px)` (linha 1325) resets de `will-change` que faltam:

```css
@media (hover: none), (max-width: 767px) {
  /* P0-3: BackgroundAmbient host — pseudo-elementos já escondidos, mas o
     próprio .flowing-ambient continua com will-change: transform alocando
     GPU layer. Liberar. */
  .flowing-ambient,
  .flowing-ambient::before,
  .flowing-ambient::after { will-change: auto !important; }

  /* P2-1 preventivo: CircuitBrain glow/image em loop infinito.
     A 27px de tamanho o drop-shadow é invisível; pausa no mobile. */
  .brain-glow-pulse,
  .brain-image-pulse {
    animation: none !important;
    will-change: auto !important;
  }

  /* Geral: mesh ambient já zeroada, garantir background-position também. */
  .mindreset-ambient-mesh {
    background-position: 0 0 !important;
  }
}
```

### Impacto visual
- Desktop: **zero**.
- Mobile: nenhuma diferença visível — o `will-change` é hint pro browser, sem efeito de pixel. O glow do CircuitBrain a 27px já é imperceptível.

### Risco
- Nenhum. Só CSS dentro de media query mobile-only.

---

## Arquivo 2 · `src/components/interaction/MagneticCursor.tsx` (P1-3)

### Problema
Importa `useReducedMotion` de `framer-motion` (linha 21) só pra ler uma media query. Isso força framer-motion no chunk do `__root`, que carrega em **todas** as rotas.

### Mudança
Trocar pelo equivalente nativo:

```tsx
// REMOVER: import { useReducedMotion } from "framer-motion";

// Novo hook local no mesmo arquivo (ou inline no useEffect):
function useReducedMotionNative() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}
```

Manter API idêntica: `const reducedMotion = useReducedMotionNative();`.

### Impacto visual
- Zero. Comportamento idêntico.

### Risco
- Nenhum. Comportamento 1:1 com framer-motion.
- **Bônus:** se nenhum outro componente do `__root` importar framer, ele sai do chunk root e vira lazy. (Provavelmente não sai porque `PageTransition` usa, mas reduz dependência futura.)

---

## Arquivo 3 · `src/components/landing/TopBar.tsx` (P1-4)

### Problema
```tsx
const { scrollY } = useScroll();
useEffect(() => scrollY.onChange((latest) => setScrolled(latest > 20)), [scrollY]);
```
`useScroll` cria um motion value subscriber que dispara o callback em **cada evento de scroll do browser** (não passivo, sem throttle).

### Mudança
Substituir por scroll listener nativo passivo:

```tsx
// REMOVER: import { useScroll, motion, AnimatePresence } from "framer-motion";
// MANTER: import { motion, AnimatePresence } from "framer-motion";

useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 20);
  onScroll(); // estado inicial correto
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, []);
```

### Impacto visual
- Zero. Threshold idêntico (20px).
- TopBar continua ganhando blur + background quando rola.

### Risco
- Nenhum. Padrão web standard.

---

## Arquivo 4 · `src/routes/index.tsx` — StickyCTA (P1-5)

### Problema (linha 406)
```tsx
window.addEventListener("scroll", handleScroll);
```
Sem `{ passive: true }`. No Android, o browser tem que esperar o JS retornar antes de completar o frame de scroll → scroll jank.

### Mudança
```tsx
window.addEventListener("scroll", handleScroll, { passive: true });
```
Uma palavra adicionada. Cleanup já está correto.

### Impacto visual
- Zero.

### Risco
- Nenhum. `handleScroll` não chama `preventDefault()` em lugar nenhum, então passive é seguro.

---

## Arquivo 5 · `src/routes/index.tsx` — Hero badges (P1-6)

### Problema (linhas 456–495)
3 `motion.div` com `y: [0, -20, 0]` `repeat: Infinity`. Tem `hidden lg:flex`, mas `display:none` **não para** as subscriptions do framer-motion — o rAF loop continua rodando os keyframes mesmo invisíveis.

### Mudança
Render condicional via state `isLg` em vez de só esconder via CSS:

```tsx
// No componente Hero, antes do return:
const [isLg, setIsLg] = useState(false);
useEffect(() => {
  const mq = window.matchMedia("(min-width: 1024px)");
  setIsLg(mq.matches);
  const handler = (e: MediaQueryListEvent) => setIsLg(e.matches);
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}, []);

// Trocar:
{isLg && (
  <motion.div ... className="flex items-center gap-2 rounded-full ...">
    ...
  </motion.div>
)}
```

Remover `hidden lg:flex` dos 3 badges, virar `flex`. Idêntico no desktop (>=1024px), zero subscriptions no mobile.

### Impacto visual
- Desktop ≥1024px: idêntico.
- Mobile/tablet: idêntico (continuam não aparecendo).

### Risco
- SSR: `isLg` começa `false` → server renderiza sem badges → cliente desktop hidrata e badges aparecem com `initial` do framer-motion (fade-in). É o mesmo comportamento de hoje, só sem flash (hoje renderiza com `hidden` que vira `flex` no CSS, sem fade — agora vai entrar com fade-in suave). **Pequena melhoria visual no desktop**, na verdade.

---

## Ordem de execução

1. `src/styles.css` — adicionar 3 regras no bloco mobile (linha 1325+).
2. `src/components/interaction/MagneticCursor.tsx` — substituir `useReducedMotion`.
3. `src/components/landing/TopBar.tsx` — substituir `useScroll`.
4. `src/routes/index.tsx` (StickyCTA) — adicionar `{ passive: true }`.
5. `src/routes/index.tsx` (Hero) — gate via `useMediaQuery` para os 3 badges desktop.
6. `npm run build` → confirmar 0 erros.

## Rollback

Cada arquivo independente. Mudanças mínimas, fáceis de reverter individualmente via History.

## Fora de escopo

- HologramRing / BustLoader Framer refactor (P1-1, P1-2) → Fase D
- `isMobileMotion` refactor (P1-8) → Fase D
- Todos os P2 (exceto P2-1 que entra de carona no styles.css) → Fase E

## Tempo estimado

~15 min de edição + build + verificação.

## Ganho esperado

- **Scroll jank no mobile:** eliminado (passive listener + nativo no TopBar).
- **rAF idle no mobile:** 3 subscriptions framer a menos no Hero.
- **GPU layers no mobile:** 4 layers `will-change` liberados (BackgroundAmbient + CircuitBrain).
- **Bundle root:** uma dependência framer a menos no MagneticCursor (provavelmente não muda chunking, mas reduz acoplamento).
- Zero mudança visual no desktop.
- Zero feature removida.
