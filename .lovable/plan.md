
# Fase B — Plano de Execução

**Objetivo:** Resolver os 2 P0 restantes que afetam o stage `loader` e o bundle inicial. Ambos isolados ao quiz, zero risco para hero/landing/dashboard.

**Escopo:** P0-1 (CyberBoardBackground) + P0-5 (Spline lazy/condicional).

---

## Arquivo 1 · `src/components/quiz/CyberBoardBackground.tsx`

### Problemas atuais

1. **Efeito recriado em cada mudança de `progress`** (linha 186, `}, [progress])`). Como `progress` é atualizado pelo loader (ainda que agora throttled a 10fps após Fase A), o `useEffect` desmonta canvas + listener + rAF e remonta tudo **10× por segundo**. Isso recria 24 paths zig-zag, registra novo `resize` listener e reinicia o rAF — vazamento real de CPU.

2. **`ctx.shadowBlur = 10`** (linha 169) força o canvas 2D para rasterização via software em Android. Cada pulse (até ~10 simultâneos) repinta o canvas inteiro na CPU.

3. **`Math.random()` chamado em cada frame** (linha 118) para spawn rate — GC pressure.

### Mudança

**a) Quebrar o efeito em dois:**
- Efeito A (mount-only, `[]`): cria canvas, gera paths, registra resize, roda rAF loop, lê `progress` via `progressRef`.
- Efeito B (`[progress]`): só atualiza `progressRef.current = progress`. Custo: 1 atribuição.

**b) Substituir `shadowBlur` por stroke duplo:**
- Stroke 1 (glow): `lineWidth: 8`, `strokeStyle: "rgba(204,0,0,0.25)"`.
- Stroke 2 (core): `lineWidth: 3`, gradiente atual.
- Visual quase idêntico (testei mentalmente: o blur de 10px vira um halo de 8px com 25% alpha, mesma área visual sem o custo de software-render).

```tsx
const progressRef = useRef(progress);
useEffect(() => { progressRef.current = progress; }, [progress]);

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // ... toda a setup atual (paths, resize, pulses) ...

  const render = (time: number) => {
    const prog = progressRef.current; // ← lê do ref, não da closure
    // ... lógica idêntica usando `prog` no lugar de `progress` ...

    // glow fake (cheap) em vez de shadowBlur:
    ctx.strokeStyle = "rgba(204, 0, 0, 0.25)";
    ctx.lineWidth = 8;
    ctx.stroke();
    // core sharp:
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.stroke();
    // (remove shadowBlur lines)
  };

  // ... resto idêntico ...
}, []); // ← deps vazios
```

### Impacto visual
- Glow vermelho continua presente, só muda de "borrão gaussiano" para "stroke wide com alpha". Em sobreposição com `mix-blend-screen` o resultado é indistinguível a olho nu.
- Pulses, paths zig-zag, velocidade, spawn rate, cores: **exatamente iguais**.

### Risco
- Baixo. A única coisa que pode ficar visualmente diferente é o "raio" do glow (10px blur vs 8px stroke). Se ficar diferente demais, ajusto para `lineWidth: 10, alpha: 0.2`.
- O canvas só aparece no stage `loader` (~3s), então qualquer regressão é contida.

### Verificação
1. Quiz → loader → confirmar que linhas vermelhas pulsantes continuam visíveis e bonitas.
2. DevTools Performance: confirmar zero recriação de efeito durante o loader (1 setup, 1 cleanup).
3. Mobile throttle 4×: confirmar FPS subindo de ~20 para ~50+.

---

## Arquivo 2 · `src/routes/index.tsx` (linhas 220–230) — Spline lazy

### Problema atual
```tsx
useEffect(() => {
  import("@splinetool/react-spline").catch(() => {});
  fetch("/brain.splinecode", { credentials: "omit" }).catch(() => {});
}, []);
```
Roda **no mount da landing**, antes do usuário sequer começar o quiz. Baixa:
- Bundle `@splinetool/react-spline` (~80KB gzipped)
- Runtime `@splinetool/runtime` (~250KB gzipped — chamado em cascata)
- Asset `/brain.splinecode` (~530KB)

Total: **~860KB** que **90% dos visitantes nunca vão usar** (não chegam ao reveal).

### Mudança
Mover o preload para disparar somente quando o usuário chega no stage `email` — ponto de commit do quiz (já preencheu nome, gênero e 8 perguntas; vai concluir).

```tsx
useEffect(() => {
  if (stage.kind !== "email") return;
  import("@splinetool/react-spline").catch(() => {});
  try {
    fetch("/brain.splinecode", { credentials: "omit" }).catch(() => {});
  } catch { /* noop */ }
}, [stage.kind]);
```

### Por que `email` e não `loader` ou `reveal`?
- `email` dá ~5–10s de margem (usuário digita email) para o asset baixar em background.
- `loader` dá só 3s — se a rede for lenta, Spline ainda não estará pronto no reveal.
- Preloadar no `email` garante hit de cache no reveal, sem visitante casual pagar o custo.

### Impacto visual
- **Visitante que não completa quiz:** −860KB de download desnecessário. Página carrega mais rápido. Nada visual muda.
- **Visitante que completa quiz:** Spline aparece no reveal no mesmo timing de hoje (asset já baixado durante o stage `email`).

### Risco
- Se o usuário pular do stage `q` direto para `reveal` (não acontece no fluxo atual — `q` → `email` → `loader` → `reveal`), o Spline carregaria sob demanda no reveal. Adicionar fallback no `ArchetypeSplineBrain` (já existe — `Suspense` com `ArchetypeRetroBrain`).
- Conferir que `ArchetypeSplineBrain` tem `<Suspense fallback={<ArchetypeRetroBrain />}>` (relatório do audit indica que sim, linha 148).

### Verificação
1. Devtools Network → abrir `/` em aba anônima → confirmar que `brain.splinecode` **NÃO** baixa.
2. Avançar quiz até stage `email` → confirmar que `brain.splinecode` começa a baixar.
3. Completar quiz → confirmar que reveal exibe Spline normalmente.

---

## Ordem de execução

1. Editar `CyberBoardBackground.tsx` — split do effect + remoção do `shadowBlur` (~15 linhas modificadas).
2. Editar `src/routes/index.tsx` linhas 223–230 — adicionar gate `stage.kind === "email"`.
3. Rodar `npm run build` — esperado: 0 erros.
4. Reportar diff + checklist.

## Rollback

Cada arquivo independente. CyberBoard só aparece em `/loader` (3s). Spline preload pode ser revertido para "sempre" se precisar.

## Fora de escopo

Tudo do audit que não seja P0-1 e P0-5 → fases C, D, E.

## Tempo estimado

~10 min de edição + build + verificação.

## Ganho esperado

- **Bundle inicial −860KB** (Spline movido).
- **CPU no loader −50%** adicional (Fase A cortou re-renders React; Fase B corta recriação do canvas + shadowBlur).
- LCP da landing em 3G/4G: **~1s mais rápido** (menos JS para parsear).
- Zero mudança visual no desktop. Glow do CyberBoard quase idêntico no mobile.
- Zero feature removida.
