# Plano — Upgrade Premium: "O QUE VAIS RECEBER"

## Contexto & função na página
É o **Bloco 5** da página de vendas (`SalesPageV2`), posicionado logo após o Diagnóstico 4D e antes dos depoimentos. Sua função é **transformar promessa em objeto tangível** — o leitor precisa *ver* o que compra antes de ler prova social e chegar ao CTA final. Hoje: 6 cards uniformes com o mesmo ícone `CheckCircle2`, mesma tipografia, mesmo peso. Legível, mas **plano** — não vende, apenas lista.

Objetivo do redesign: **hierarquia visual + tangibilidade + sensação de "kit premium"** sem quebrar a linguagem editorial do resto da página (SceneFrame, tokens `--arch-primary`, tipografia Syne display, superfícies pretas com blur).

## Direção criativa
Transformar a "lista de features" num **dossier de entrega** — cada peça vira um artefato numerado com identidade própria, e o Diagnóstico 4D (o herói do produto) ganha destaque físico maior que os demais.

### Movimentos-chave
1. **Bento assimétrico 6→(1 hero + 5)** — o card do "Diagnóstico 4D" ocupa 2 colunas × 2 linhas no desktop, com um mini-preview visual (mock de radar das 4 áreas em SVG animado) dentro dele. Os outros 5 ficam menores ao redor, mantendo respiração.
2. **Numeração editorial 01–06** em Syne 900 outline, canto superior esquerdo de cada card (linguagem que já existe no SceneFrame via `index`).
3. **Ícone específico por peça** (Lucide) em vez de check genérico:
   - Diagnóstico → `Radar`
   - Protocolo 30 dias → `CalendarCheck`
   - Matriz de Decisão → `Filter`
   - Compass diário → `Compass`
   - Relatório final → `LineChart`
   - 5 idiomas → `Globe2`
4. **Metadata chip** por card (canto oposto ao número): microtag que codifica valor concreto — `PERSONALIZADO`, `30 DIAS`, `60 SEGUNDOS`, `DIÁRIO`, `DIA 30`, `5 IDIOMAS`. Fonte mono/uppercase, tracking largo, cor `--arch-primary`.
5. **Spotlight cursor-follow** no hover (radial-gradient seguindo o mouse dentro do card, muito sutil, usando `--arch-primary` a ~8%) — sensação premium sem custo de layout. Desativado em `prefers-reduced-motion` e mobile.
6. **Borda animada gradient conic** apenas no card herói — 1 rotação lenta (~12s), muito baixa opacidade, cria ideia de "peça ao vivo".
7. **Rodapé "Valor total do kit"** — antes do `note` de garantia, uma faixa estreita com 3 selos em linha (`Acesso vitalício` · `Sem subscrição` · `Garantia 30 dias`) tipografados como *seal marks* em vez de texto corrido. Cada selo com ícone (`Infinity`, `Ban`, `ShieldCheck`).

### Layout final (desktop, grid 12-col)
```text
┌──────────────────────────┬──────────────┐
│  01  DIAGNÓSTICO 4D      │  02  PROTOCOLO 30D │
│  [radar preview]         │  [icon]            │
│  (col-span-6, row-span-2)│  (col-span-6)      │
│                          ├──────────────┐
│                          │  03  MATRIZ  │
│                          │  (col-span-6)│
├──────────┬───────┬───────┴──────────────┤
│ 04 COMPASS│ 05 RELATÓRIO │ 06 5 IDIOMAS │
│ (col-4)   │ (col-4)      │ (col-4)      │
└───────────┴──────────────┴──────────────┘
```
Mobile: stack single-column, herói mantém preview mas com altura reduzida, chips e numeração preservados.

## Implementação

### Arquivos
- **Novo:** `src/components/sales/v3/DeliverablesDossier.tsx` — componente isolado (herói + grid + rodapé de selos), recebe `deliverables`, `note`, `archetype` (para adaptar preview radar) e `tpl` já resolvida.
- **Novo:** `src/components/sales/v3/DeliverableRadarMini.tsx` — SVG puro do radar 4-áreas usado no card herói. Recebe `areaScores`. Anima os pontos entrando com `Reveal`.
- **Edit:** `src/components/sales/SalesPageV2.tsx` — substituir o `<ul>` atual do bloco `b5` pelo `<DeliverablesDossier ... />`, mantendo `SceneFrame`, título/subtítulo, `badges.deliver` e `note` intactos. Passar `areaScores` já disponível no escopo.
- **Edit:** `src/styles.css` — adicionar `.deliver-spotlight` (mask/radial via CSS vars `--x`/`--y` setadas por JS) e `@keyframes deliver-hero-ring`. Todos protegidos por `@media (prefers-reduced-motion: no-preference)` e `@media (hover: hover)`.

### Copy & i18n
**Zero mudanças em `translations.ts`** — reutiliza os 6 `deliverables` já traduzidos nos 5 idiomas. A metadata chip (`PERSONALIZADO`, `30 DIAS`, `60 SEGUNDOS`, `DIÁRIO`, `DIA 30`, `5 IDIOMAS`) é derivada por índice dentro do componente, com um mapa por idioma inline (curto, ~15 chars por chave × 5 langs = trivial). Nome dos selos do rodapé é extraído do `note` existente (split por `·`) — sem novas chaves.

### Tokens & tema
- Cores: apenas `--arch-primary` e superfícies existentes (`bg-black/40`, `border-white/10`). Nenhum hex hardcoded.
- Tipografia: `font-display` (Syne) para número e título, corpo em Inter.
- Sombras: reutilizar padrão do bloco B7 (`0 50px 120px -40px color-mix(...)`).
- Motion: `Reveal` para stagger de entrada; keyframes CSS puros para o ring do herói (sem framer-motion novo).

### Acessibilidade
- Numeração `01`–`06` marcada `aria-hidden` (decorativa); título continua sendo o handle semântico.
- Chips com `aria-label` completo ("valor: 30 dias").
- Spotlight e ring desativados via `prefers-reduced-motion`.
- Radar preview com `role="img"` + `aria-label` descritivo em cada idioma.
- Contraste texto sobre superfície: mantido `text-white/90` para corpo, `text-white/60` para captions — AA garantido.

### Verificação
1. `npm run build` — zero novos erros.
2. Playwright screenshot da seção em `375px` (mobile) e `1280px` (desktop) para confirmar layout.
3. Toggle DevTools de `prefers-reduced-motion` para confirmar fallback estático.

### Fora do escopo
- Alterar copy dos deliverables.
- Mexer em outros blocos (`b4`, `b6`, `b7`).
- Adicionar novas dependências (tudo com Lucide já instalado + SVG inline).

## Resultado esperado
Um "kit premium visual" que responde instintivamente à pergunta *"o que eu recebo?"* em 2 segundos: **um herói tangível** (radar com o teu arquétipo), **cinco peças satelitais numeradas** com valor concreto por chip, e **um rodapé de garantia com peso de selo institucional** — mantendo a linguagem editorial do resto da página e sem inflar o bundle nem quebrar i18n.
