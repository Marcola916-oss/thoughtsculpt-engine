# Fase 6 — Curtain + Text Foreground Upgrade (2026-06-07)

## Resumo
Resolve o problema do "fonte se perde no meio da pagina" identificado nos Prints 1 e 2.

## Root cause
`<Atmosphere fog="dramatic" pinned>` envolve o Hero, mas o `VolumetricFog` interno é `position: fixed, z-index: 1, inset-0` — cobre a viewport INTEIRA com red glow. Resultado: secoes pos-Hero ficam com bg vermelho escuro, e qualquer cor (exceto branco puro) fica low-contrast.

## Fixes aplicados (11 edits em 8 arquivos)

### 1. `src/routes/index.tsx:184-194` — Curtain wrapper
Envolvidas as 6 secoes pos-Hero em `<div className="relative z-10 bg-background/80 backdrop-blur-md">`. Resultado: Hero preserva drama (z-1 fog visivel), secoes seguintes ficam em paineis limpos (z-10) com red haze sutil.

### 2. `src/components/landing/ArchetypeShowcase.tsx` (3 edits)
- L42: `text-muted-foreground` -> `text-foreground/70` (sub)
- L81: `text-muted-foreground/80` -> `text-foreground/60` (trigger label)
- L85: `text-muted-foreground` -> `text-foreground/70` (desc)

### 3. `src/components/landing/HowItWorks.tsx` (2 edits)
- L28: `text-muted-foreground` -> `text-foreground/70` (sub)
- L48: `text-muted-foreground` -> `text-foreground/70` (step desc)

### 4. `src/components/landing/ProofBar.tsx` (1 edit)
- L41: `text-muted-foreground/70` -> `text-foreground/60` (label)

### 5. `src/components/landing/FeaturesGrid.tsx` (1 edit)
- L53: `text-muted-foreground` -> `text-foreground/70` (desc)

### 6. `src/components/landing/FAQ.tsx` (2 edits)
- L32: `text-muted-foreground` -> `text-foreground/70` (sub)
- L75: `text-muted-foreground` -> `text-foreground/70` (answer)

### 7. `src/components/landing/FinalCTA.tsx` (2 edits)
- L35: `text-muted-foreground` -> `text-foreground/70` (sub)
- L53: `text-muted-foreground/70` -> `text-foreground/60` (guarantee)

### 8. `src/components/landing/Testimonials.tsx` (0 edits)
Ja usava `text-foreground/85`. OK.

## Nao tocados (intencionalmente)
- Tags vermelhas `text-arch-primary` (decorativas, pequenas, OK em red ambient)
- Avatar gradients do Testimonials (independentes)
- Hero local glows (linhas 424-425 de index.tsx — so afetam o Hero)
- Tokens (`--accent-glow`, `--primary`) — globais, arriscado mudar

## Verificacoes

| Check | Resultado |
|---|---|
| `npm run build` | OK em 2.43s |
| `npx tsc --noEmit` | 0 novos erros (2 pre-existentes em onboarding/obrigado, ja no AGENTS.md) |
| Total de edits | 11 (1 estrutural + 10 de cor) |
| Locales afetados | 5 (PT/EN/PL/RO/AR) — apenas classNames, i18n intacto |

## Diff stat
```
 src/components/landing/ArchetypeShowcase.tsx |  4 +-
 src/components/landing/FAQ.tsx                |  4 +-
 src/components/landing/FeaturesGrid.tsx       |  2 +-
 src/components/landing/FinalCTA.tsx           |  4 +-
 src/components/landing/HowItWorks.tsx         |  4 +-
 src/components/landing/ProofBar.tsx           |  2 +-
 src/routes/index.tsx                          | 12 ++--
 7 files changed, 18 insertions(+), 14 deletions(-)
```

## Acao do usuario (3 passos)
1. **Antigravity:** Pull do local (8 arquivos)
2. **Commit:** `fix: curtain pos-Hero + text-foreground upgrade (red-fog contrast)`
3. **Push + Publish** no Lovable
4. **Eu** re-rodo smoke test Playwright + audit WCAG nos 5 locales
