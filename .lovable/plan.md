
# Reestruturação visual do NeuralLoader

Página: `src/components/quiz/NeuralLoader.tsx` (entre captura de e-mail e reveal do arquétipo). **Função e fluxo permanecem idênticos** — só a estética muda.

## Objetivo estético

Premium, calmo, profissional — referência Linear / Vercel / Apple Vision Pro. Espera vira parte da experiência: silêncio, profundidade, precisão. Sem poluição visual, sem hologramas saturados.

## O que sai

- `HologramRing` (anel holográfico rotativo) — removido daqui (continua existindo no projeto, só não é usado nesta tela).
- `CircuitBrain` central + ambient glow vermelho de 400px — removidos.
- `CyberBoardBackground` local (motherboard cyber) — removido.
- Percentual gigante `5xl` no centro — removido como protagonista.

## O que fica e sobe de qualidade

- **Barra de progresso 0→100%** vira a protagonista: fina, longa, centralizada, com glow vermelho sutil viajando junto. Acima dela um percentual menor, tipográfico, tabular-nums (texto `text-foreground/90`, tracking apertado, `Syne`/display).
- **Terminal "MINDRESET COGNITIVE ANALYZER"** mantido, mas refinado: borda mais sutil, fundo `bg-card/30 backdrop-blur-md`, cabeçalho com dot vermelho pulsante + versão, logs com fade cruzado mais lento (1.2s) e tipografia mono mais leve.
- **Mensagem cíclica** acima da barra, tipografia maior e mais respirada, fade vertical suave.

## O que entra (camada de fundo exclusiva desta tela)

Componente novo: **`src/components/quiz/LoaderAmbient.tsx`** — render APENAS nesta tela, posicionado `absolute inset-0 -z-10` dentro do wrapper do loader. Mescla com a `Atmosphere` global (não substitui, sobrepõe-se com `mix-blend-screen` e baixíssima opacidade).

Três camadas, todas em SVG/CSS puro (zero canvas, zero libs novas):

1. **Neural grid pulsante** — linhas finas (`stroke-width: 0.5`) formando uma malha sutil; nós nos cruzamentos com pulse alternado a cada 2.5s; cor `--accent` a 8% opacidade. Sensação de "circuito vivo respirando".
2. **Data streams diagonais** — 3–4 linhas finas atravessando a tela em diagonal lenta (translate 18s linear infinite), gradiente do `--accent` → transparente. Como pacotes de dados viajando.
3. **Símbolos filosófico-técnicos flutuantes** — Φ Ψ ∞ ☯ λ `{ }` `</>` `01` — 6–8 símbolos, `font-mono`, tamanho 11–16px, opacidade 4–10%, drift muito lento (40–60s por ciclo), blur sutil. Fade in/out individual.

Todas as três camadas: `prefers-reduced-motion` → estáticas; `pointer-events: none`; `aria-hidden`.

## Composição final (de cima para baixo)

```text
┌─────────────────────────────────────────┐
│   [fundo: Atmosphere + LoaderAmbient]    │
│                                          │
│        mensagem cíclica (lg, fade)        │
│                                          │
│   ────────[ progress bar 0→100% ]────    │
│              42%   (tabular, sm)         │
│                                          │
│   ┌──────────────────────────────────┐   │
│   │ • MINDRESET COGNITIVE ANALYZER   │   │
│   │   [SYS] analyzing pattern…       │   │
│   │   0x18000 // 14:22:07            │   │
│   └──────────────────────────────────┘   │
│                                          │
└─────────────────────────────────────────┘
```

Vertical centralizado, `max-w-lg`, respiração generosa entre blocos (gap 8/10).

## Tokens e detalhes

- Cores via tokens existentes (`--accent`, `--foreground`, `--card`, `--border`) — zero hex novo.
- Barra: `h-[2px]`, trilho `bg-white/5`, preenchimento `bg-gradient-to-r from-accent/70 via-accent to-accent/70`, box-shadow `0 0 16px hsl(var(--accent)/0.5)`.
- Easing: tudo `ease-out`, durações 300–500ms (UI) / 2–60s (ambient).
- Mensagem cíclica: `text-lg md:text-xl font-medium tracking-tight`, fade-y 8px em 400ms.

## Acessibilidade e performance

- `role="status"` + `aria-live="polite"` no bloco da mensagem.
- `prefers-reduced-motion: reduce` → ambient estático, progress bar mantém a animação de largura (essencial à função).
- Sem novos pacotes; ambient ~2–3kB gzipped; nenhuma alteração no fluxo (`onComplete`, `durationMs`, `messages`, `analysisLogs` inalterados).

## Arquivos afetados

- **Novo:** `src/components/quiz/LoaderAmbient.tsx`
- **Reescrito (apresentação):** `src/components/quiz/NeuralLoader.tsx`
- **Sem mudança:** props, callers, i18n, fluxo do quiz, `Atmosphere` global no estágio `loader`.

## Validação

1. `npm run build` limpo.
2. Visual: viewport mobile (375px) e desktop (1440px) — nenhum overflow, terminal legível.
3. Contraste WCAG AA da mensagem e do terminal sobre o novo fundo.
4. `prefers-reduced-motion` honrado.
