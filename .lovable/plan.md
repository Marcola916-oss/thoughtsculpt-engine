
# Fase C — Plano de Execução

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
