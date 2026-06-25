# Plano — Badge typewriter cíclico com cor por arquétipo

## 1. O que vou fazer (resumo)

Transformar o badge fixo do topo da landing (atualmente mostra apenas `"O Guardador"`/AO em `src/routes/index.tsx:622-625`) em um **badge animado com typewriter contínuo real**, ciclando entre os 4 arquétipos em loop infinito, com **toda a cor do badge** (texto, borda, fundo, ícone, glow) trocando junto com o arquétipo que está sendo digitado.

## 2. Localização exata

- Arquivo: `src/routes/index.tsx`, linhas 617–626 (bloco `Floating Archetype Badges` → `<MFade>` com `<span>` interno).
- O badge fica dentro do Hero, visível no topo da landing logo abaixo do `<TopBar>`.

## 3. Comportamento da animação (movimento real)

Ciclo infinito entre os 4 arquétipos (ordem fixa AO → SS → EA → HI → repete):

1. **Digita** o nome letra a letra (~70 ms/char)
2. **Pausa** ~1.6 s com nome completo visível
3. **Apaga** letra a letra (~40 ms/char)
4. **Pausa** ~250 ms vazio
5. Avança para o próximo arquétipo

Implementação: hook `useTypewriter(words, opts)` em `src/hooks/use-typewriter.ts` com `setTimeout` recursivo + cleanup no `useEffect`. Retorna `{ text, index }`. Movimento real = estado React mudando a cada tick (não CSS background, não keyframes — garantia de que vai mexer de verdade).

Acessibilidade: `aria-live="polite"` + `aria-atomic="true"` no `<span>` que muda; cursor `|` blink via `::after` com `animation: caret-blink 1s steps(2) infinite` (já existe `mr-blink` em `styles.css:368`, reuso).

## 4. Cor sincronizada com o arquétipo (a parte nova)

Cada arquétipo tem paleta própria já definida em `src/styles.css:284-323`:

| Arquétipo | `--arch-primary` | Tema |
|---|---|---|
| AO | `#1E6B82` (azul-teal) | atual fallback vermelho do Hero |
| SS | `#7C3AED` (violeta) | pavão |
| EA | `#64748B` (cinza-aço) | fantasma |
| HI | `#F97316` (laranja) | foguinho |

A transição não pode quebrar o resto do Hero (que herda `--arch-primary` vermelho globalmente). Solução: **escopar a troca de cor apenas ao badge** via `style` inline com CSS vars locais, sem tocar no `:root` nem no `<html data-arch>`.

```tsx
const ARCH_COLORS = {
  AO: { primary: "#1E6B82", glow: "rgba(42,139,163,0.65)" },
  SS: { primary: "#7C3AED", glow: "rgba(167,139,250,0.6)" },
  EA: { primary: "#64748B", glow: "rgba(148,163,184,0.7)" },
  HI: { primary: "#F97316", glow: "rgba(249,115,22,0.55)" },
} as const;
```

O badge recebe `style={{ "--badge-c": color.primary, "--badge-glow": color.glow }}` e usa essas vars locais em `borderColor`, `backgroundColor` (com opacidade), `color` e `boxShadow`. Transição suave: `transition: color 400ms ease, border-color 400ms ease, background-color 400ms ease, box-shadow 400ms ease`.

Resultado visual: enquanto o nome do arquétipo é digitado, o badge inteiro morfa para a cor daquele arquétipo. Quando começa a apagar e digitar o próximo, a cor transita suavemente para a próxima paleta.

## 5. i18n (5 idiomas)

Sem chaves novas — vou reusar `t.archetypes.AO.name`, `t.archetypes.SS.name`, `t.archetypes.EA.name`, `t.archetypes.HI.name` que já existem em `src/lib/i18n/translations.ts` para PT/EN/PL/RO/AR. Quando o usuário troca de idioma, o array `words` recalcula via `useMemo([t.locale])` e o typewriter reinicia do começo do arquétipo atual sem flicker.

RTL (árabe): o `dir="rtl"` já é aplicado globalmente pelo `LanguageProvider`. O cursor `|` fica do lado correto automaticamente porque é `::after` no fluxo do texto. Padding/gap usam unidades lógicas — o `gap-2` do Tailwind já funciona em RTL.

## 6. Arquivos afetados

| Arquivo | Mudança |
|---|---|
| `src/hooks/use-typewriter.ts` | **novo** — hook genérico de typewriter cíclico |
| `src/routes/index.tsx` (617–626) | substitui o `<span>` estático pelo componente `<ArchetypeBadge />` inline ou novo |
| (opcional) `src/components/landing/ArchetypeBadge.tsx` | **novo** se quiser isolar para legibilidade |

Sem mudanças em CSS global, sem chaves de tradução novas, sem deps novas.

## 7. Acessibilidade e respeito a `prefers-reduced-motion`

Se `matchMedia("(prefers-reduced-motion: reduce)").matches`, o hook desativa o ciclo e mostra apenas o primeiro arquétipo (AO) estático — mesma cor padrão. Já é padrão do projeto (ver `styles.css:597-841`).

## 8. Verificação

- `npm run build` → exit 0
- Validação visual no preview com Playwright: 3 screenshots em intervalos de 800 ms confirmando que (a) texto muda, (b) cor do badge muda junto, (c) loop volta para AO.

## 9. Ordem de execução

1. Criar `src/hooks/use-typewriter.ts`
2. Editar `src/routes/index.tsx` linhas 617–626: trocar `<span>` estático por badge dinâmico com `useTypewriter` + `ARCH_COLORS`
3. Rodar build
4. Smoke visual via Playwright (3 screenshots espaçados)

## 10. O que NÃO vou fazer

- Não mexo em outros badges da página (Os 4 Arquétipos, Depoimentos, FAQ, A CIÊNCIA POR TRÁS).
- Não mexo nos badges flutuantes laterais (SS/EA/HI absolutos em `lg`).
- Não toco em `:root` nem em `--arch-primary` global — a troca de cor é 100% escopada ao badge.
- Não adiciono dependências.
