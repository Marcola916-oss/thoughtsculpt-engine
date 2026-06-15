
# Fase D — Plano de Execução

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
