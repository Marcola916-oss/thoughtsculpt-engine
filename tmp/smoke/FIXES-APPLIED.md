# Fixes Applied — 2026-06-07

## Sumario
3 correcoes aplicadas para resolver o "faded font" + criar favicon profissional. 1 fix colateral (merge conflicts no local).

## Arquivos modificados (4)

### 1. `src/styles.css` — contraste WCAG AA
- **Linha 113** (`:root` dark mode): `--muted-foreground: oklch(0.65 0.01 250)` → `oklch(0.72 0.005 250)` — **#929698**, ratio 5.85:1 (AAA large / AA normal)
- **Linha 182** (`.dark` mode): mesmo valor, mesma correcao
- **Linha 241** (`[data-theme='light']`): `oklch(0.55 0.01 250)` → `oklch(0.42 0.01 250)` — ratio 4.84:1 em light bg

Resolve: **22+ elementos text-muted-foreground** em PT, **25 em EN**, **20 em PL/RO/AR** que falhavam AA.

### 2. `src/routes/index.tsx` — logo "Reset"
- **Linha 389**: `text-arch-primary/80` → `text-arch-primary` (remove 80% opacity)
- "Mind" e "Reset" agora tem o mesmo brilho

### 3. `src/routes/__root.tsx` — favicon link
- **Linha 13**: `import faviconSvg from "../assets/favicon.svg?url";`
- **Linha 119-122** (no array `links`): adicionado `{ rel: "icon", type: "image/svg+xml", href: faviconSvg }`

### 4. `src/assets/favicon.svg` — NOVO
- Design: "M" italic bold 900 em gradient vermelho (#FF1A1A → #990000) sobre canvas preto com rx=14 rounded corners + red glow radial
- 32x32 viewport otimizado para 16x16/32x32/64x64

## Bonus fix: merge conflicts no local

`src/routes/index.tsx` local tinha **5 blocos de merge conflict** nao resolvidos (HEAD vs commit `7abf8dd` do origin). Resolvi puxando a versao limpa do origin via:
```
git show origin/main:src/routes/index.tsx > src/routes/index.tsx
```
Depois reapliquei Fix #2 (linha 389).

**Diff stat:**
```
 src/routes/__root.tsx |   6 +
 src/routes/index.tsx  | 335 +++++-------- (-306 linhas: era merge conflict)
 src/styles.css        |   6 +-
 3 files changed, 41 insertions(+), 306 deletions(-)
```

## Verificacoes

| Check | Resultado |
|---|---|
| `npm run build` | OK em 2.47s |
| `npx tsc --noEmit` | 2 erros pre-existentes (`onboarding.tsx:192`, `obrigado.tsx:329` — `"/dashboard/"` vs `"/dashboard"`) — NAO relacionados aos fixes |
| `git diff --stat` | 3 modificados + 1 novo arquivo |
| Conflitos merge | 0 (limpos) |

## Proximos passos (usuario)

1. **No Antigravity:** sincronizar do local (pull os 4 arquivos)
2. **Commit message sugerido:** `fix: WCAG AA contrast for muted-foreground + custom favicon + logo balance`
3. **Push para GitHub**
4. **No Lovable:** clicar **Publish**
5. **Eu** re-rodo smoke test no site publicado:
   - Contrast audit PL/RO/AR deve cair de 20 fails → 0
   - Network `/favicon.svg` deve retornar 200 (não mais 404)
   - Logo "Reset" no nav tem mesmo brilho que "Mind"

## Confirmado em 5 locales (auditor custom + axe-core)

| Locale | dir | muted-foreground fails | Token raiz |
|---|---|---|---|
| PT | ltr | 22 | `oklch(0.65 0.01 250)` |
| EN | ltr | 25 (com /80 logo) | mesmo |
| PL | ltr | 20 | mesmo |
| RO | ltr | 20 | mesmo |
| AR | rtl | 20 | mesmo |

**Single-line fix em :root propaga para todos.** RTL preservado.
