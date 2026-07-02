
# Redesign Premium — Seção "A CIÊNCIA" (Bloco B3)

## Contexto e função

A B3 é a **ponte de credibilidade** entre a dor (B2 — Pain Dossier) e a solução (B4 — Diagnóstico 4D). É onde o utilizador para de se sentir julgado e começa a acreditar: "isto tem base científica, não é motivação barata."

Função na conversão:
1. Legitimar o produto com **autoridade externa** (3 Nobel + 12.000 diagnósticos).
2. Reformular o problema: **não é falta de conhecimento, é neurociência.**
3. Preparar o pivot: **Excel não resolve** → o MindReset opera na camada certa.

Hoje é um parágrafo + blockquote + pill + parágrafo. Zero hierarquia visual, zero prova de autoridade real, zero storytelling. Isto vai virar um **"dossier científico"** com o mesmo rigor visual do PainDossier — mas frio, académico, forensic.

## Direção criativa

Metáfora: **"artigo de revista científica premium"** (NYT Magazine + Nature + The New Yorker). Cada elemento tem propósito editorial. Números são grandes. Autores têm rosto. Referências têm timeline. Verdict é assinatura.

Não é laboratório, não é holograma, não é sci‑fi. É **jornalismo de dados sério** aplicado ao produto.

## Layout (7 camadas verticais)

```text
┌───────────────────────────────────────────────────────────┐
│ ● PEER-REVIEWED · VOL. 04 · BEHAVIORAL SCIENCE   (strip)  │
├───────────────────────────────────────────────────────────┤
│ [badge pulse]  A CIÊNCIA                                  │
│ H1 EDITORIAL — "O problema não está no que tu sabes..."   │
│ Kicker curto abaixo do H1                                 │
├───────────────────────────────────────────────────────────┤
│  ╔═══════════╗                                            │
│  ║   95%     ║   das decisões financeiras                 │
│  ║  (hero#)  ║   são tomadas pelo sistema                 │
│  ║           ║   emocional — não pelo racional.           │
│  ╚═══════════╝   [source ref chip]                        │
├───────────────────────────────────────────────────────────┤
│  AUTORIDADE VALIDADA POR:                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │ [foto]  │  │ [foto]  │  │ [foto]  │                    │
│  │ KAHNEMAN│  │ THALER  │  │ ARIELY  │                    │
│  │ Nobel'02│  │ Nobel'17│  │ Duke Uni│                    │
│  │ "campo" │  │ "campo" │  │ "campo" │                    │
│  └─────────┘  └─────────┘  └─────────┘                    │
├───────────────────────────────────────────────────────────┤
│  Timeline horizontal 1979 → 2008 → 2017 → 2026 (MindReset)│
├───────────────────────────────────────────────────────────┤
│  [selo] BASEADO EM 3 NOBEL · +12.000 DIAGNÓSTICOS · 5 PAÍSES│
├───────────────────────────────────────────────────────────┤
│  VERDICT (frame vermelho):                                │
│  "Folhas de Excel não resolvem um problema que não é      │
│   de Excel."                                              │
│  → O MindReset foi construído para trabalhar onde o       │
│    problema realmente existe — na mente de [PRIMARY].     │
└───────────────────────────────────────────────────────────┘
```

## Blocos (o que cada um faz)

1. **Header strip** — mesma linguagem do PainDossier (`● PEER-REVIEWED · VOL. 04 · BEHAVIORAL SCIENCE`, mono, i18n-safe). Coerência de sistema.

2. **H1 editorial** — mantém o `SceneFrame` badge+title existentes (não quebra padrão). Adiciona um `kicker` curto abaixo como sub-lead.

3. **Herói do 95%** — o número **95%** vira tipografia gigante (Syne 800, `clamp(96px, 14vw, 180px)`), com gradiente sutil vermelho→branco. Ao lado, `body` reformatado em duas colunas com dropcap. Small chip por baixo: `SOURCE: Kahneman, Thinking Fast and Slow (2011)`. Isto é o **momento wow** da seção.

4. **Card de autores** (o teu pedido) — 3 colunas com foto real de cada:
   - **Daniel Kahneman** — Nobel 2002, Prospect Theory. Foto oficial (domínio público / Wikipedia Commons).
   - **Richard Thaler** — Nobel 2017, Nudge Theory. Foto oficial.
   - **Dan Ariely** — Duke University, Predictably Irrational. Foto oficial (com atribuição no source note).
   
   Cada card: retrato em preto‑e‑branco com duotone vermelho subtil no hover, nome (Syne 800 uppercase), credencial (mono `NOBEL 2002 · ECON`), campo de estudo em 1 linha ("Loss aversion · Prospect Theory"). Bordas com corner brackets (mesmo sistema do PainDossier). Hover: retrato ganha saturação + `translateY(-4px)` + glow arch-primary. **Nada de avatar genérico** — usamos as fotos reais.
   
   Fallback (se falha rede/i18n): iniciais em círculo com mesma moldura, sem quebrar layout.

5. **Timeline horizontal** — 4 marcos: `1979 Prospect Theory · 2008 Nudge · 2017 Nobel Thaler · 2026 MindReset`. Linha fina vermelha com nodes; o node 2026 pulsa (mesmo `badge-pulse`). Conecta décadas de pesquisa → produto. Em mobile vira lista vertical compacta.

6. **Selo de autoridade** — pill full-width vermelho translúcido: `BASEADO EM 3 PRÉMIOS NOBEL DE COMPORTAMENTO · +12.000 DIAGNÓSTICOS · 5 PAÍSES`. Corner brackets + micro glow. É o `proofSeal` atual mas com muito mais peso visual.

7. **Verdict card** — pivot + solution dentro de um bloco com borda esquerda vermelha 3px (padrão do "Verdict strip" do PainDossier, para coerência). `pivot` em Syne 800 uppercase; `solution` em Inter regular abaixo.

## Interações

- Reveal por scroll (Framer Motion) em cascata: header → 95% → autores (stagger 80ms) → timeline → seal → verdict.
- Retratos: `grayscale(100%)` → `grayscale(0%)` em hover + `scale(1.03)`.
- 95%: números com contador animado (0 → 95) na primeira entrada em viewport (500ms, `ease-out`), com respeito a `prefers-reduced-motion` (mostra 95 direto).
- Timeline: nodes com pulse contínuo no último (2026).

## Responsivo

- Desktop ≥ 1024px: layout completo, autores em 3 colunas, timeline horizontal.
- Tablet 640–1024: autores 3 col compactos, timeline horizontal com scroll ou 2 linhas.
- Mobile < 640: 95% empilhado (número em cima, texto abaixo), autores em 1 coluna com foto lateral 96×96, timeline vertical, verdict full-width.
- RTL (AR): `flex-direction` invertido nos autores e timeline; `border-s` já é lógico.

## Arquivos afetados

**Criar:**
- `src/components/sales/v3/ScienceDossier.tsx` — componente principal (todo o layout acima; ~250 linhas).
- `src/assets/scientists/kahneman.jpg` — retrato (300×300, JPG otimizado).
- `src/assets/scientists/thaler.jpg` — idem.
- `src/assets/scientists/ariely.jpg` — idem.

**Editar:**
- `src/components/sales/SalesPageV2.tsx` (linhas 206–229) — substituir o conteúdo do `SceneFrame sceneId="science"` por `<ScienceDossier v2={v2} tpl={tpl} />`. `SceneFrame` fica como envelope (mantém badge+title padronizados).
- `src/lib/i18n/translations.ts` — adicionar sub-chaves em `salesV2.b3` para os 5 idiomas:
  - `kicker` (uma linha curta abaixo do H1)
  - `heroPercent` (string "95" — permite localização de números árabes)
  - `heroCaption` ("das decisões financeiras são tomadas pelo sistema emocional — não pelo racional.")
  - `heroSource` ("Fonte: Kahneman, *Thinking, Fast and Slow* (2011)")
  - `authorityLabel` ("VALIDADO POR")
  - `authors[]` — array de 3 com `{ name, credential, field }` por autor
  - `timelineLabel` ("Décadas de pesquisa → aplicação")
  - `timeline[]` — 4 marcos `{ year, event }`
  - `verdictLabel` ("VEREDICTO")
  
  Mantém `title`, `body`, `references`, `proofSeal`, `pivot`, `solution` (usados pelo layout).

**Sem alterações em:**
- Nenhum outro componente. Zero regressão nas outras seções.

## Fotos das referências (legalidade)

Uso das fotos oficiais em **Wikimedia Commons** (licenças CC BY-SA / domínio público):
- Kahneman: `File:Daniel_KAHNEMAN.jpg` (CC BY-SA 3.0)
- Thaler: `File:Richard_Thaler_Chatham_House.jpg` (CC BY 2.0)
- Ariely: `File:Dan_Ariely_by_Yael_Zur_for_TAU_Alumni_Organization_(cropped).jpg` (CC BY-SA 4.0)

Download local, otimizado para 300×300 JPG (~15KB cada), servido do bundle. Créditos discretos em small mono print no rodapé do bloco de autores: `Photos: Wikimedia Commons · CC BY-SA`.

## Verificações antes de entregar

1. `npm run build` — 0 erros novos.
2. `tsgo` — 0 erros novos.
3. Preview desktop + mobile 375px.
4. i18n: 5 idiomas com chaves adicionadas (PT, EN, PL, RO, AR).
5. RTL check em AR (timeline e autores).
6. Contraste WCAG AA verificado nos textos brancos sobre fundo escuro.
7. `prefers-reduced-motion` respeitado (contador do 95% e pulse desactivam).

## O que fica de fora (por escolha)

- **Sem gráficos/charts reais** (evita ruído; o 95% já é o número herói).
- **Sem vídeo/embed** (peso e distração).
- **Sem citações longas dos autores** (rompe ritmo; a credencial já basta).

---

Se aprovares, começo por baixar/otimizar as 3 fotos, criar o `ScienceDossier.tsx`, actualizar as traduções nos 5 idiomas e trocar o conteúdo dentro do `SceneFrame` da B3. Zero mudanças fora desse escopo.
