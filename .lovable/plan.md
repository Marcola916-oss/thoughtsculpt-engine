
# Fase C — Geração de PDF + Cadeia de IA

## Visão (do moodboard)
PDF de 24 páginas tratado como **revista editorial / zine de luxo** — não relatório. Cada arquétipo é um "número" com capa, busto central, tipografia massiva distorcida ao fundo, grid técnica fina e washes de cor da paleta oficial do arquétipo (msg #467). Vermelho `#CC0000` é a tinta editorial transversal; a cor do arquétipo entra como duotone/wash nas capas e cabeçalhos de áreas.

**Linguagem visual herdada das refs:**
- Tipo gigante (Syne 800, 180-260pt) atrás do MarbleBust, recortada pelo objeto.
- Grid 12 col com linhas hairline `#2A2A2A` visíveis em algumas páginas (ref 1).
- Numeração de página estilo zine: `01 / 24` + tag de capítulo vertical na lateral.
- Duotone vermelho×preto×creme `#F5F0E6` (ref 2). MarbleBust sempre em duotone, nunca colorido.
- Citações inline com sublinhado vermelho ou caixa com border-left 3px.
- Selos circulares: "EP. 01", "PL.04", "DIAGNÓSTICO". 
- Wash radial da cor do arquétipo cobrindo 30-40% da capa.

## Arquitetura de geração

```text
checkout pago (Fase D, stub agora)
   │
   ▼
generatePdf server fn  (src/lib/pdf/generate.functions.ts)
   │
   ├─ cache lookup  →  pdf_generations table  (lead+arch+lang+seed → url)
   │   hit → retorna url
   │   miss ↓
   │
   ├─ AI chain  (src/lib/ai/chain.server.ts)
   │     1. Groq Llama 3.3 70B  (rápido, default)
   │     2. Gemini 2.0 Flash    (fallback; PRIMÁRIO para AR)
   │     3. Cerebras Llama       (fallback 2)
   │     4. OpenRouter free     (último recurso)
   │   structured output → 4 áreas × {diagnóstico, padrão, plano 7d}
   │
   ├─ render PDF  (@react-pdf/renderer, src/lib/pdf/template/*)
   │     Document ← capa + intro + 4 dossiês de área + protocolo + outro
   │
   ├─ upload  →  Supabase Storage bucket "diagnoses" (privado)
   │     getSignedUrl 30d
   │
   ├─ persist  →  pdf_generations row (lead_id, arch, lang, storage_path, url, expires_at)
   │
   └─ envia email Brevo (template multi-idioma, link + anexo se ≤5MB)
```

## Estrutura do PDF (24 páginas A4 retrato)

```text
01  CAPA               wash arquétipo + MarbleBust duotone + Syne 800 nome
02  COLOFÃO            quem é o leitor, data, idioma, edição "Nº 0001"
03  ÍNDICE             4 áreas + selos
04  INTRO ARQUÉTIPO    1 página editorial, 2 colunas, drop-cap vermelha
05  PADRÃO INVISÍVEL   citação gigante + diagrama de loop comportamental
06  ÁREA 1 — DINHEIRO    capa de área (busto + tipo distorcida + score)
07     dossiê + plano 7d
08     exercício prático
09  ÁREA 2 — CARREIRA    capa
10     dossiê + plano
11     exercício
12  ÁREA 3 — AMOR        capa
13     dossiê
14     exercício
15  ÁREA 4 — PESSOAL     capa
16     dossiê
17     exercício
18  MAPA DE RELAÇÕES   matriz 4×4 arquétipos (compatibilidades)
19  PROTOCOLO 7 DIAS   tabela diária
20  GATILHOS           lista de armadilhas + contramedida
21  RITUAL DE FECHAMENTO   página meditativa, muito espaço negativo
22  REFERÊNCIAS        livros, papers (legitimidade)
23  PRÓXIMOS PASSOS    CTA cross-sell OB2
24  CONTRA-CAPA        IdentitySymbol + assinatura
```

## Cadeia de IA — contrato

Saída estruturada única (1 chamada):
```ts
type Diagnosis = {
  archetype: 'AO'|'SS'|'EA'|'HI';
  greeting: string;                 // 1 frase usando {name}
  invisiblePattern: string;         // 80-120 palavras
  areas: {
    money:    AreaPayload;
    career:   AreaPayload;
    love:     AreaPayload;
    personal: AreaPayload;
  };
  protocol7d: { day: number; action: string; cue: string }[]; // 7 itens
  triggers: { trigger: string; counter: string }[];           // 5 itens
};
type AreaPayload = {
  score: number;            // 0-100 (do area-scores.ts; AI só recebe)
  diagnosis: string;        // 60-90 palavras
  rootBehavior: string;     // 1 frase
  weekPlan: string[];       // 7 ações concretas
  exercise: { title: string; steps: string[] }; // 3-5 passos
};
```
Chain (`callAIChain`) tenta na ordem até receber JSON válido pelo schema (Zod parse). Logs por etapa em `pdf_generations.attempts jsonb`.

## Cache

- Tabela `pdf_generations` (lead_id, archetype, lang, content_hash, storage_path, signed_url, expires_at, attempts, cost_cents).
- `content_hash = sha256(name + archetype + lang + scoresJson)` — se hit nas últimas 24h, retorna URL existente.
- Pré-warm opcional (Fase C.5): gerar 4 arq × 5 lang = 20 PDFs-base sem nome para fallback offline.

## Bucket Storage

- `diagnoses` (privado), policy: só `service_role` lê/escreve; URL assinada por 30d entregue ao usuário.
- Migração inclui criação do bucket + policy.

## Email (Brevo)

- Server fn `sendDiagnosisEmail` usa `BREVO_API_KEY`.
- Template inline multi-idioma (5 chaves), assunto: "Seu diagnóstico chegou, {name}".
- Anexa PDF se ≤5MB; senão só link.

## Arquivos

**Novos**
- `src/lib/pdf/template/Document.tsx` — orquestrador @react-pdf/renderer
- `src/lib/pdf/template/pages/{Cover,Toc,Intro,AreaCover,AreaDossier,AreaExercise,Map,Protocol,Triggers,Ritual,References,NextSteps,Backcover}.tsx`
- `src/lib/pdf/template/atoms/{EditorialType,Duotone,GridOverlay,Stamp,Quote,PageNumber,WashBackdrop}.tsx`
- `src/lib/pdf/template/tokens.ts` — cores, fontes registradas (Syne+Inter+Noto Naskh AR), spacing
- `src/lib/pdf/template/marble.server.ts` — converte MarbleBust SVG → PNG duotone por arquétipo (sharp não roda no Worker; usar `@resvg/resvg-wasm` que é WASM-edge-safe)
- `src/lib/pdf/generate.functions.ts` — server fn pública (Fase D protege com auth do order)
- `src/lib/pdf/generate.server.ts` — helpers (cache lookup, upload, sign)
- `src/lib/ai/chain.server.ts` — `callAIChain<T>(messages, schema)`
- `src/lib/ai/prompts.ts` — system + user prompts por idioma
- `src/lib/email/brevo.server.ts` — `sendDiagnosisEmail`
- `src/lib/email/templates.ts` — copy 5 idiomas
- `supabase/migrations/<ts>_phase_c_pdf.sql` — `pdf_generations`, `quiz_leads` (mínimo), bucket, policies, GRANTs

**Editados**
- `src/routes/obrigado.tsx` — chama `generatePdf` via `useServerFn` + estado loading/success/erro com MarbleBust loader
- `src/components/funnel/CheckoutStub.tsx` — passa lead+answers para `/obrigado` via search params
- `.lovable/plan.md`, `mem/features/mvp-roadmap.md`

## Secrets necessários
- `LOVABLE_API_KEY` (já existe, AI Gateway)
- `BREVO_API_KEY` (novo — pedir ao usuário antes da etapa C7)
- Supabase URL/keys (já existem)

## Sub-fases executáveis

| # | Escopo | Verificação |
|---|---|---|
| **C1** | Migração: `quiz_leads`, `pdf_generations`, bucket `diagnoses`, policies, GRANTs | linter Supabase clean |
| **C2** | `tokens.ts` + atoms (`EditorialType`, `Duotone`, `GridOverlay`, `Stamp`, `Quote`, `WashBackdrop`) + Storybook visual em rota dev `/dev/pdf` (preview HTML do PDF) | render no /dev/pdf |
| **C3** | Páginas estáticas: Cover, Toc, Intro, Backcover — com dados mock | preview OK |
| **C4** | Páginas dinâmicas: AreaCover, AreaDossier, AreaExercise, Map, Protocol, Triggers, Ritual, References, NextSteps | preview 4 arquétipos |
| **C5** | `marble.server.ts` (SVG→PNG duotone via resvg-wasm) + integração nas capas | imagens nítidas no PDF |
| **C6** | `chain.server.ts` + `prompts.ts` + structured output Zod | test edge fn retorna JSON válido |
| **C7** | `generate.functions.ts` (cache + render + upload + signed URL) | gera PDF real salvo no Storage |
| **C8** | Brevo + template + envio | email recebido em 5 idiomas |
| **C9** | Integração final: `/obrigado` chama tudo, loader MarbleBust, fallback de erro com retry, AR RTL audit no PDF | E2E: checkout stub → /obrigado → PDF + email |

## Decisões técnicas

- **@react-pdf/renderer** (não jsPDF): suporta flexbox, fontes custom, imagens, RTL via `direction: rtl`.
- **Fonts no PDF:** registrar Syne 800, Inter 400/600, Noto Naskh Arabic 400/700 via `Font.register` lendo de `src/assets/fonts/*.ttf` (subir como assets se ainda não existirem).
- **RTL:** quando `lang==='ar'`, todo `<Page>` recebe `style={{ direction: 'rtl' }}` e tipografia troca para Noto Naskh.
- **Worker-safety:** `@react-pdf/renderer` funciona em Workers (já testado em produção). `@resvg/resvg-wasm` para rasterizar SVG sem `sharp`.
- **Sem PII em logs:** `pdf_generations.attempts` guarda só model+latência+tokens, nunca o conteúdo do prompt.

## Critérios de aceite Fase C
- [ ] `bun run build` limpo
- [ ] `/dev/pdf?arch=AO&lang=pt` preview renderiza 24 páginas com dados mock
- [ ] PDF real gerado para AO/SS/EA/HI nos 5 idiomas (20 arquivos teste no Storage)
- [ ] AR renderiza RTL correto, sem caixas pretas (fonte correta)
- [ ] Cache hit no segundo request idêntico (<200ms)
- [ ] Email Brevo entregue com PDF
- [ ] Fluxo E2E pelo `/obrigado` sem erros

## Fora do escopo (Fase D)
- Stripe real, webhook de pagamento, multi-moeda IP detection
- Auth no `generatePdf` (hoje será aberto; Fase D liga ao `order_id` verificado pelo webhook)
- Pré-warm batch dos 20 PDFs-base
