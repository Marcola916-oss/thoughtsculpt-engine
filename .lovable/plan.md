# Plano — Identificação: distribuição vertical no mobile

## Objetivo
Aproveitar toda a altura do viewport no mobile, distribuindo os 4 blocos (título, nome, sexos, botão) com respiro real. Desktop fica intocado.

## Layout alvo (mobile)
```
┌──── viewport ────┐
│ progress bar     │ ← topo (já existe)
│                  │
│  título grande   │ ← ~22% do espaço útil
│  subtítulo       │
│                  │
│  Nome (label+    │ ← meio
│   input)         │
│                  │
│  Sexo (label+    │ ← ~70%
│   3 botões)      │
│                  │
│  [ Continuar ]   │ ← rodapé
└──────────────────┘
```

## Mudanças

### 1. `src/components/quiz/QuizScreenWrapper.tsx`
- No container raiz, garantir altura útil no mobile: trocar `pt-3 pb-8` por `min-h-[calc(100dvh-2rem)] pt-3 pb-6` (desktop mantém `md:min-h-[70vh] md:py-6`).
- O wrapper interno (linha 64) já é `flex-1 flex flex-col justify-center` — vai centralizar o filho no espaço sobrando. Manter.

### 2. `src/routes/index.tsx` — `Identity` (linhas 855-931)
Reorganizar para que o componente filho aproveite o `flex-1` do wrapper como uma coluna distribuída:

- Trocar o root `<div className="w-full">` por `<div className="w-full flex flex-col gap-8 md:block">`.
  - No mobile: vira flex-col com gaps grandes.
  - No desktop (`md:block`): volta ao layout atual.
- **Título em 1 linha sem cortar** (mobile e desktop):
  - `whitespace-nowrap` em ambos breakpoints (remover o `md:whitespace-normal`).
  - Ajustar clamp para garantir caber em desktop em 1 linha: `text-[clamp(1.125rem,5.4vw,2.5rem)] md:text-[clamp(1.5rem,3.2vw,2.5rem)]`.
- **Espaços entre blocos no mobile** já vêm do `flex flex-col gap-8` do root. Remover o `space-y-12 md:space-y-8` do grupo dos campos (vira só `space-y-8` desktop ou herda gap).
- **Botão "Continuar"** ganha `mt-auto` no mobile para grudar no rodapé: `mt-auto md:mt-12`.

### 3. Validação visual
- Playwright em `375x800` → screenshot do estágio identity.
- Confirmar: título no topo, input ao meio, sexos abaixo, botão no rodapé com respiros reais.
- Desktop (`1280x1800`) → confirmar layout inalterado.

## Arquivos tocados
- `src/components/quiz/QuizScreenWrapper.tsx` (1 linha)
- `src/routes/index.tsx` (Identity, ~5 linhas)

## Risco
Baixo. Nenhuma mudança em Q1–Q8 ou outras telas. Wrapper change usa `min-h-[calc(100dvh-2rem)]` apenas no mobile — não afeta desktop por causa do `md:min-h-[70vh]` posterior.
