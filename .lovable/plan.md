# Plano — Loader vivo + correção da "caixa"

Reestruturar **somente** o `LoaderAmbient` (camada decorativa atrás do `NeuralLoader`). Nenhuma lógica de progresso, percentagem, mensagens ou navegação é tocada.

## Problema 1 — Borda retangular visível ("caixa")

**Causa raiz:** o grid neural é um `<svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">` com máscara `radialGradient` cujo fade termina dentro do viewBox (não do viewport). Em telas wide, a máscara cria uma quina retangular dura. Os anéis SVG quadrados de tamanho fixo reforçam a sensação de "quadro flutuando".

**Correção:**
- Trocar o grid SVG por um `div` com `background-image: linear-gradient` (linhas verticais + horizontais via `repeating-linear-gradient`) preenchendo 100% do container, e aplicar **`mask-image: radial-gradient(ellipse at center, black 0%, black 35%, transparent 80%)`** no container raiz da `LoaderAmbient`. Isso garante fade suave em qualquer aspect-ratio, sem borda.
- Manter os "nodes" pulsantes via pequenos `<span>` posicionados em % (não dependentes de viewBox).
- Anéis: trocar `min(60vh, 560px)` por `min(80vmin, 720px)` e adicionar leve fade nas bordas via `mask-image` próprio — mas como ficam dentro do mask global, a borda some naturalmente.

## Problema 2 — Fundo estático

**Adicionar 3 camadas em movimento contínuo** (todas com `prefers-reduced-motion` respeitado, GPU-friendly via `transform`/`opacity`):

1. **Aurora drift** — 2-3 blobs radiais grandes (vermelho accent), `filter: blur(80px)`, animação `translate` + `scale` lentíssima (28–40s), em direções cruzadas. Cria sensação de "respiração" do fundo.
2. **Conic sweep** — um `conic-gradient` enorme rotacionando em 60s atrás de tudo, com `opacity: 0.08` e blur. Dá o efeito "scanner radar premium" sem ser óbvio.
3. **Streams densificados** — aumentar de 6 para 10 streams diagonais, variar ângulos (alguns -20°, outros +20°), velocidades 8–16s. Já existem, só intensificar.

Manter: núcleo pulsante central, anéis orbitando, símbolos drifting (já estão bem).

## Arquivos afetados

- `src/components/quiz/LoaderAmbient.tsx` — substituir grid SVG por div+mask CSS; adicionar camadas `loader-aurora-blob` (x3) e `loader-conic-sweep`; mais streams.
- `src/styles.css` (bloco loader-ambient ~linha 1570-1640) — adicionar keyframes `loader-aurora-drift-{a,b,c}`, `loader-conic-spin`; aplicar `mask-image` radial no `.loader-ambient` raiz; cobrir tudo no `prefers-reduced-motion`.

## Não-objetivos

- Não mexer em `NeuralLoader.tsx` (progress bar, terminal, mensagens permanecem).
- Não mexer em `Atmosphere`, `BackgroundAmbient`, ou outras páginas.
- Não trocar cores, fontes ou estrutura de copy.

## Validação

Após aplicar: rodar Playwright headless, navegar ao loader, capturar screenshot em **1440×900** e **375×800** para confirmar:
- Sem borda retangular visível em nenhum aspect-ratio.
- Camadas em movimento (comparar 2 screenshots com 1s de diferença).
