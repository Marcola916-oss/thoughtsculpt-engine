
# Redesign B4 — Diagnóstico 4D (Dossier Clínico Personalizado)

## Contexto e função na página

B4 é a **peça mais pessoal da página de vendas**. Vem logo depois de "A CIÊNCIA" (autoridade externa: Kahneman, Thaler, 95%) e serve como **prova interna**: pega no percentual macro e traduz para *"os teus números"* nas 4 áreas (Dinheiro, Carreira, Amor, Pessoal). É a ponte entre "isto é científico" e "isto é sobre mim" — o momento em que o utilizador vê o próprio arquétipo com scores reais.

O layout atual é fraco: título gigante + subtítulo + grid 2×2 de posters com badge de score no canto. Não parece diagnóstico, parece galeria. Não gera a sensação de "abriram uma ficha clínica sobre mim".

## Direção visual — "Case File 4D"

Continuar a linguagem de **dossier clínico** que já ancorámos em `PainDossier` e `ScienceDossier`, mas escalando para o **momento mais premium da página** (é o clímax do diagnóstico antes da oferta). Cada área é uma **página de expediente clínico** com identidade forte, não um card genérico.

**Metáfora:** o utilizador está a folhear a sua própria ficha, marcada como *CONFIDENTIAL · SUBJECT: [NOME] · CASE 04/04*.

## Estrutura da nova seção (ScienceDossier-style)

```text
┌─────────────────────────────────────────────────────────┐
│ ● ARQUIVO PESSOAL · SUJEITO: LUCÃO · 04/04 · CONFIDENCIAL│  ← header strip
├─────────────────────────────────────────────────────────┤
│                                                         │
│  DIAGNÓSTICO 4D (título já existente)                   │
│  subtítulo                                              │
│                                                         │
│  ┌──── HERO METRIC ─────────────────────────────────┐   │
│  │  ÍNDICE COMPOSTO         [radial ring animated] │   │
│  │  ██ 74 /100              (média das 4 áreas)    │   │
│  │  "Padrão [PRIMARY] activo em 4/4 áreas críticas"│   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────── 4 DOSSIER CARDS (2×2) ──────┐                 │
│  │ FICHA 01/04         ⚙ MONEY       │                 │
│  │ ─────────────────────────────      │                 │
│  │ DINHEIRO                            │                 │
│  │ [poster image w/ vignette]          │                 │
│  │                                     │                 │
│  │ ┌ SCORE ─────────────────────┐     │                 │
│  │ │ 82 / 100                   │     │                 │
│  │ │ ████████████░░  severity   │     │  ← barra scar   │
│  │ └────────────────────────────┘     │                 │
│  │                                     │                 │
│  │ ▎ Diagnóstico                       │                 │
│  │ "Como AO toma decisões..."          │                 │
│  │                                     │                 │
│  │ • Gatilho: medo de faltar           │  ← 3 metadados │
│  │ • Frequência: diária                │                 │
│  │ • Impacto: alto                     │                 │
│  └────────────────────────────────────┘                 │
│                                                         │
│  ┌── SEAL / VERDICT ──────────────────────┐            │
│  │ 🔴 barra lateral cor do arquétipo      │            │
│  │ "O mesmo padrão. 4 áreas. 1 decisão."  │  ← pivot   │
│  │ CTA opcional em texto de continuação   │            │
│  └────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

## Novo componente

`src/components/sales/v3/DiagnosisDossier.tsx` — recebe `archetype`, `displayName`, `primary`, `areaScores`, `features[]`, header/pivot i18n. Substitui o grid inline no B4 do `SalesPageV2.tsx`.

### Peças-chave

1. **Header strip** (idêntico à `PainDossier` / `ScienceDossier`): fita fina com `● ARQUIVO PESSOAL · SUJEITO: {NOME} · 04/04 · CONFIDENCIAL` em tabular-nums + monospace.

2. **Hero metric composto** (novo):
   - Ring radial SVG animado (`stroke-dashoffset` triggered por `IntersectionObserver`), pinta na cor do arquétipo, mostra a **média dos 4 scores**.
   - Ao lado: número grande serif (`font-display`, ~96px, tabular-nums), rótulo *"ÍNDICE COMPOSTO · Padrão [PRIMARY] activo em 4/4 áreas"*.
   - Ancora o utilizador: um só número que resume tudo antes de detalhar.

3. **4 Dossier Cards** — refactor completo do `AreaPoster` para virarem "fichas":
   - Chip flutuante `FICHA 0X/04` no top-right (padrão já validado em `PainDossier`).
   - Ícone da área (Coins/Briefcase/Heart/User da lucide) no top-left.
   - Título da área em Syne 800 uppercase, standalone (não amontoado sobre a imagem).
   - Poster ocupa 60% da altura, com máscara de fade-to-black no bottom (masking, não gradient sobreposto).
   - **Bloco SCORE dentro do card**: número tabular grande + barra "scar" com fill animado (`width` transition 1.2s ease-out ao entrar em viewport), rótulo `SEVERITY` calibrado por faixa (0-40 baixo, 41-70 moderado, 71-100 crítico) na cor do arquétipo.
   - Descrição diagnóstica (`feat.description` já traduzida, `tpl()` aplicado).
   - **3 metadados clínicos** derivados por área+arquétipo (mapa determinístico em `src/lib/sales/area-meta.ts`): `Gatilho · Frequência · Impacto`. Curto, monospace, cor `white/60`. Adiciona textura clínica sem inventar copy — todos os valores já implícitos no arquétipo.
   - Hover: `-translate-y-1`, borda ganha glow da cor do arquétipo, chip da ficha acende, imagem sobe 1.04.

4. **Verdict Seal** — card final com barra lateral vermelha (mesma linguagem do `ScienceDossier`), pega o `v2.b7.eyebrow` ou frase-pivot *"O mesmo padrão. 4 áreas. 1 decisão."* Só texto — CTA continua no B7 abaixo (não duplicar).

### Detalhes de craft

- **Grain texture** suave (`radial-gradient` 8% opacity) por baixo do wrapper — dá "papel de arquivo".
- **Brackets clínicos** `⌐ ¬ ⌐ ¬` nos 4 cantos da hero metric (padrão do ScienceDossier).
- **Divider line** com tick marks entre header strip e conteúdo (tabular-nums 001–100, 5% opacity).
- **Border radius** consistente com resto da página: `rounded-3xl` cards, `rounded-full` chips, `rounded-2xl` seal.
- **RTL**: usar `ms-*` / `me-*` e `start-*` / `end-*` (o resto do produto já respeita).
- **Reduced motion**: rings pintam estático no valor final, barras de score idem, sem shimmer.

## Ficheiros afectados

1. **`src/components/sales/v3/DiagnosisDossier.tsx`** — NOVO componente principal (~250 linhas).
2. **`src/components/sales/v3/AreaPoster.tsx`** — refactor: passa a ser sub-componente consumido pelo `DiagnosisDossier` (chip ficha, score bar, metadata). Preserva assinatura mas ganha props `index`, `severityLabels`, `meta`.
3. **`src/lib/sales/area-meta.ts`** — NOVO: mapa determinístico `{ archetype, area } → { trigger, frequency, impact }` traduzido nos 5 idiomas via chaves i18n.
4. **`src/lib/i18n/translations.ts`** — adicionar `salesV2.b4.dossier`:
   - `caseLabel` ("ARQUIVO PESSOAL"), `subjectLabel` ("SUJEITO"), `confidential` ("CONFIDENCIAL")
   - `indexLabel` ("ÍNDICE COMPOSTO"), `indexCaption` ("Padrão [PRIMARY] activo em 4/4 áreas críticas")
   - `severityLabel`, `severity.low/moderate/critical`
   - `metaLabels.trigger/frequency/impact`
   - `metaValues.*` (16 combinações arquétipo×área × 3 metadados, mas reutilizando tokens curtos: "medo de faltar", "diário", "alto", etc.)
   - `verdictPivot` ("O mesmo padrão. 4 áreas. 1 decisão.")
   - Nos 5 idiomas (PT/EN/PL/RO/AR). Estrutura mínima — reutiliza o máximo de vocabulário já existente no produto.
5. **`src/components/sales/SalesPageV2.tsx`** — substituir o bloco B4 actual (linhas 226-243) por `<DiagnosisDossier ... />` dentro do mesmo `SceneFrame`. Sem outras mudanças na página.

## Verificação

- Build limpo (`bun run build`), zero novos TS/lint.
- Ring e barras de score animam correctamente ao entrar em viewport (IntersectionObserver, threshold 0.35).
- Score `82/100` visível em todos os breakpoints (mobile 375px sem clipping, RTL AR sem sobreposição).
- Screenshot Playwright do bloco B4 em desktop + mobile, comparação lado-a-lado com estado actual.
- Contraste AA verificado nas cores dos metadados (`white/60` sobre `black/40`).

## Não incluído (fora de escopo)

- CTA dentro do dossier (mantém-se no B7 abaixo, sem duplicar).
- Alteração dos posters (imagens actuais são fortes, ganham novo enquadramento sem reprocessing).
- Nada fora do B4.
