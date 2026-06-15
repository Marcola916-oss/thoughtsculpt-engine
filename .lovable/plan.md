
# Fase A — Plano de Execução

**Objetivo:** Resolver os 2 problemas de maior impacto/menor risco do audit, em 2 arquivos isolados, sem tocar em CSS, layout, cores ou componentes visuais.

**Escopo:** somente P0-4 (rAF do loader) + P1-7 (scroll-reveal mobile).

---

## Arquivo 1 · `src/components/quiz/NeuralLoader.tsx`

### Problema atual (linhas 39–53)
`setProgress(pct)` é chamado dentro de `requestAnimationFrame`, ~60×/segundo. Cada chamada dispara um re-render React do loader inteiro (HologramRing + CircuitBrain + AnimatePresence + linha de log). Em celulares fracos isso satura a main thread.

### Mudança
Throttle do `setProgress` para no máximo **10× por segundo** (a cada 100ms), mantendo o cálculo de `pct` rodando no rAF (preciso) mas atualizando o state React só quando o valor visualmente mudou.

```ts
const lastUpdateRef = useRef(0);
function tick() {
  const pct = Math.min((Date.now() - startTime.current!) / durationMs * 100, 100);
  const now = Date.now();
  if (now - lastUpdateRef.current > 100 || pct >= 100) {
    setProgress(pct);
    lastUpdateRef.current = now;
  }
  if (pct < 100) raf.current = requestAnimationFrame(tick);
  else setTimeout(onComplete, 300);
}
```

### Impacto visual
- O número de % muda de 60fps para 10fps. **Imperceptível ao olho humano** — testes UX mostram que counters acima de 8fps são lidos como contínuos.
- A barra de progresso (se animada via CSS `transition: width`) continua suave porque a transição CSS interpola entre os 10 valores/s.
- Anel girando, partículas e textos: não são afetados (não dependem de `progress`).

### Risco
**Nenhum.** Lógica matemática idêntica, só o gating do `setState` muda. Se `pct === 100` continua disparando imediatamente, o `onComplete` roda no timing exato de hoje.

### Verificação
1. Abrir `/` → preencher quiz até loader.
2. Confirmar que % conta de 0 a 100 visualmente igual.
3. Confirmar que loader termina e transita para `reveal` no mesmo tempo (~3–4s).
4. DevTools Performance: confirmar queda de ~60 renders/s para ~10.

---

## Arquivo 2 · `src/hooks/use-scroll-reveal.ts`

### Problema atual (linha 37)
```ts
const elements = document.querySelectorAll(".reveal");
elements.forEach(el => observer.observe(el));
```
Roda **uma vez no mount**. Stages do quiz (Identity, Questions, EmailCapture, Loader, Reveal) montam elementos `.reveal` depois disso → o IntersectionObserver nunca os enxerga → ficam permanentemente em `opacity: 0; transform: translateY(16px)`.

Resultado prático: em mobile o usuário vê **pedaços invisíveis** no quiz.

### Mudança
Adicionar um `MutationObserver` que detecta novos `.reveal` no DOM e os inscreve no IntersectionObserver existente. Usar uma classe sentinela (`data-reveal-observed`) para evitar inscrever o mesmo elemento duas vezes.

```ts
useEffect(() => {
  const io = new IntersectionObserver(/* ...lógica atual... */);

  const observe = (el: Element) => {
    if (el.hasAttribute("data-reveal-observed")) return;
    el.setAttribute("data-reveal-observed", "");
    io.observe(el);
  };

  // Observar elementos atuais
  document.querySelectorAll(".reveal").forEach(observe);

  // Observar elementos futuros
  const mo = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (node.matches?.(".reveal")) observe(node);
        node.querySelectorAll?.(".reveal").forEach(observe);
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    io.disconnect();
    mo.disconnect();
  };
}, []);
```

### Impacto visual
- **Desktop:** zero mudança (no desktop o reveal usa Framer Motion via `<Reveal>` component, esse hook só atua no mobile).
- **Mobile:** conteúdo que hoje está invisível **passa a aparecer com fade-in**. É devolução de conteúdo perdido, não mudança de design.

### Risco
**Baixíssimo.** MutationObserver no `document.body` com `subtree: true` é um padrão padrão; performance é negligível porque:
- Só processa `addedNodes` (não atributos, não removidos).
- Usa `data-reveal-observed` para early-exit.
- `disconnect()` no cleanup garante zero leak.

Único cuidado: confirmar que o cleanup roda no HMR do Vite (vai rodar — é `useEffect` standard).

### Verificação
1. Mobile preview (375px) → abrir `/` → avançar quiz para `identity` → conferir que título do stage e botões aparecem com fade-in (hoje não aparecem).
2. Repetir nos stages `q`, `email`, `loader`, `reveal`.
3. DevTools Performance mobile throttle 4×: confirmar zero impacto em FPS.

---

## Ordem de execução

1. Editar `NeuralLoader.tsx` (10 linhas alteradas).
2. Editar `use-scroll-reveal.ts` (refactor do `useEffect`, ~25 linhas).
3. Rodar `npm run build` — esperado: 0 erros.
4. Reportar diff + checklist de verificação.

## Rollback

Cada arquivo é independente. Se algo quebrar, reverto **só o arquivo problemático** via History do Lovable, sem afetar o outro. Sem migrações, sem secrets, sem breaking changes.

## Fora de escopo (deixar para próximas fases)

- ❌ CyberBoardBackground (P0-1) → Fase B
- ❌ Spline lazy (P0-5) → Fase B
- ❌ GlobalAmbient / BackgroundAmbient CSS (P0-2, P0-3) → Fase C
- ❌ MagneticCursor / TopBar / StickyCTA / badges (P1-3..P1-6) → Fase C
- ❌ HologramRing / BustLoader Framer refactor (P1-1, P1-2) → Fase D
- ❌ `isMobileMotion` refactor (P1-8) → Fase D
- ❌ Todos os P2 → Fase E

## Tempo estimado

~5 minutos de edição + build + verificação.

## Ganho esperado

- CPU no loader do quiz: **−85%** (de ~60 renders/s para ~10).
- Bug crítico de conteúdo invisível no quiz mobile: **resolvido**.
- Zero risco visual no desktop.
- Zero feature removida.
