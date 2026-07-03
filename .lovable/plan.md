# Plano — Hero (B1) da Sales: premium + conversão (revisado, com contexto real)

Revi a página ao vivo (quiz completo, arquétipo SS). Layout confirmado: **sem escultura à direita**, hero centralizado full-width, símbolos monetários flutuando nas margens, cor arch-primary aplicada (roxo p/ SS). Este plano não presume nada removido — só melhora o que já existe.

## Diagnóstico do hero atual (o que vi na tela)

1. **CTA cai fora da 1ª dobra** em 1366×768 e em 1440×900. Espaçamento vertical excessivo entre subtítulo e botão.
2. **Eyebrow genérico** ("YOUR PROTOCOL") — não fala o nome do arquétipo, não personaliza.
3. **H1 padrão** para todos os arquétipos — perde o "isso é sobre mim" instantâneo.
4. **Sinais de confiança inexistentes** antes do CTA. O único é a frase "Personal analysis prepared right now for you".
5. **Sem urgência** — nada indica que a análise tem janela.
6. **Vazio visual gigante** entre H1↔subtítulo↔CTA — parece "espaçoso", não "premium".
7. **Símbolos monetários** não colidem hoje em 1440, mas em 768/375 eles cruzam o H1 (visto no scroll y=0 desktop e implícito por padding igual em mobile).

## Nova anatomia do hero (topo → base)

```text
┌─────────────────────────────────────────────────────────┐
│  ⏱ A tua análise fica reservada por 14:59  ·           │ ← NOVO: barra sticky
│    3 pessoas a ver o teu arquétipo agora                │   (topo da página)
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ● DIAGNÓSTICO · BUSCADOR DE STATUS · Nº 12.847        │ ← eyebrow enriquecido
│                                                         │
│    Lucas, compraste aprovação.                          │ ← H1 POR ARQUÉTIPO
│    E ninguém reparou.                                   │   (SS mostrado; 4 variantes)
│                                                         │
│  ┌─ divisor 2px arch-primary/25, 48px ─┐               │
│  │                                     │                │
│  Não foi falta de esforço. Foi o padrão                │ ← subtítulo (palavra
│  **Buscador de Status** a sabotar-te em silêncio…      │   arquétipo destacada)
│                                                         │
│        [ Ver o meu protocolo agora → ]                 │ ← CTA (halo respirando)
│                                                         │
│  ★★★★★ 4.9  ·  +12.847 análises  ·  🔒 100% privado  │ ← NOVO: trust bar
│  Análise pessoal preparada agora para ti.               │ ← microtexto atual (mantido)
│                                                         │
│  ────────────────────────────────────────────           │
│  12.8k       94%        48h        4.9★                │ ← proofs (mantido, refinado)
│  Análises  Reconhecem  Entrega   Rating                 │
└─────────────────────────────────────────────────────────┘
```

## Mudanças detalhadas

### 1. Barra de urgência sticky (novo)
- `src/components/sales/v3/UrgencyBar.tsx`, montada no `SalesPageV2` **antes** do `HeroScene`, `sticky top-0 z-50`.
- Conteúdo: `Clock` + countdown `MM:SS` (15 min) + separador + "N pessoas a ver o teu arquétipo agora" (N ∈ 3–7, jitter suave a cada 25–45 s).
- Persistência: `sessionStorage` (`mr_sales_timer_start`). Ao atingir 00:00, texto muda para "Última chance — reservado por mais alguns minutos" (nunca "expirou" — evita quebra de confiança). Timer nunca some.
- Fundo: `bg-black/70 backdrop-blur-xl` + borda inferior `border-arch-primary/30`. Herda `--arch-primary`.
- Mobile: 12 px, 1 linha compacta; desktop: 13–14 px centrado.
- `role="status"`, `aria-live="polite"` só no minuto final. `prefers-reduced-motion` → sem pulse.

### 2. H1 dinâmico por arquétipo
- Estender `t.sales.v2.b1` com `h1ByArch: { AO, SS, EA, HI }` nos **5 idiomas** (PT-PT, EN, PL, RO, AR).
- `SalesPageV2` seleciona pelo `archetype` prop (já disponível). Fallback: `h1` atual.
- Copy PT-PT proposta (mesmo tom já usado na landing):
  - **AO — Acumulador Obsessivo:** "[NOME], guardaste tudo — menos o que realmente importava."
  - **SS — Buscador de Status:** "[NOME], compraste aprovação. E ninguém reparou."
  - **EA — Escapista Alienado:** "[NOME], evitaste olhar. E o silêncio custou-te caro."
  - **HI — Hedonista Impulsivo:** "[NOME], viveste o agora. E o agora cobrou a fatura."
- Traduções culturalmente adaptadas para EN/PL/RO/AR (mesma nuance premium; sem tradução literal, sem juros/riba no AR).
- Visual: mantém Syne extra-bold, `clamp(2.75rem, 7.5vw, 5.5rem)`. Sem mudança de fonte.

### 3. Eyebrow enriquecido
- De `"O TEU PROTOCOLO"` → `"DIAGNÓSTICO · {NOME DO ARQUÉTIPO} · Nº {rank}"`.
- `rank`: número estável 10.000–14.000 derivado do `leadId`/nome (hash determinístico, sem estado, mesmo valor em cada render).
- Novo campo i18n: `t.sales.v2.b1.eyebrowByArch: { AO, SS, EA, HI }` (nome do arquétipo já traduzido).
- Visual: mantém o badge/pill atual; adiciona `●` pulsante à esquerda (classe `badge-pulse` já existente).

### 4. Subtítulo com hierarquia
- Mantém `promise` atual (i18n intacto).
- Envolve o nome do arquétipo dentro do texto em `<strong style="color: var(--arch-primary)">` via regex simples em runtime — sem duplicar copy nos 5 idiomas.
- `line-height: 1.55`, `max-w-2xl`, e adiciona divisor sutil (2px, `arch-primary/25`, largura 48px) entre H1 e subtítulo. Substitui o vazio por um "separador editorial" premium.

### 5. Trust bar sob o CTA (novo)
- `src/components/sales/v3/HeroTrustBar.tsx`, montada entre o botão CTA e o microtexto atual.
- Linha inline: `★★★★★ 4.9`  ·  `+12.847 análises` (usar `AnimatedCounter` existente) · `🔒 100% privado · sem banco` (ícone `Lock` do lucide).
- Estilo: `flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px] text-white/85 font-medium`. Estrelas em `var(--arch-primary)`.
- Microtexto atual ("Análise pessoal preparada agora para ti") vira 2ª linha em `text-xs text-white/60` — mantém sem remover.

### 6. Espaçamento e hierarquia
- Padding do `<section>`: `pt-14 pb-20 sm:pt-20 sm:pb-24` (vs. atual `pt-32 pb-32`).
- Gaps internos: `mt-5` eyebrow→H1; `mt-6` H1→divisor; `mt-6` divisor→subtítulo; `mt-8` subtítulo→CTA; `mt-4` CTA→trust bar; `mt-2` trust bar→microtexto; `mt-10` microtexto→proofs.
- Resultado: CTA visível na 1ª dobra em 1366×768 e 1440×900, mantendo generosidade em desktop 1920.

### 7. Detalhes premium
- **Halo respirando atrás do CTA:** camada `absolute inset-0 -z-10 blur-3xl` com `radial-gradient(var(--arch-glow) 0%, transparent 60%)` e animação `heroHaloBreath 4.5s ease-in-out infinite`. `prefers-reduced-motion` → estático.
- **Máscara nos símbolos flutuantes:** garante que nenhum símbolo cruze o H1 em nenhum viewport. Camada dos symbols recebe `mask-image: radial-gradient(ellipse 42vw 32vh at 50% 40%, transparent 0, transparent 55%, black 100%)` — abre "buraco" no centro. Mobile: ellipse ajustada (`72vw 24vh at 50% 30%`).
- **Grão sutil:** SVG `feTurbulence`, `opacity: 0.03`, `mix-blend-overlay`, `pointer-events-none`. Textura premium sem custo.
- **`data-cursor` magnético** já suportado — aplicar no CTA e no eyebrow.

## Arquivos afetados

**Novos:**
- `src/components/sales/v3/UrgencyBar.tsx`
- `src/components/sales/v3/HeroTrustBar.tsx`

**Editados:**
- `src/components/sales/v3/HeroScene.tsx` — nova estrutura, halo, mask, espaçamentos, slots eyebrow/H1/trust.
- `src/components/sales/SalesPageV2.tsx` — monta `UrgencyBar`; passa `archetype`, `h1ByArch`, `eyebrowByArch`, `rank` para o hero.
- `src/lib/i18n/types.ts` — estende `sales.v2.b1` com `h1ByArch` e `eyebrowByArch`.
- `src/lib/i18n/translations.ts` — 8 strings novas × 5 idiomas = 40 strings novas.
- `src/styles.css` — keyframes `heroHaloBreath` e `urgencyPulse`; utility `.hero-symbols-mask`.

**Não tocados:** VSL, atmosfera, cores de arquétipo, ExitIntentModal, blocos 2→9 da sales, ScrollSculpture (já foi removida), rota, quiz, reveal.

## Ordem de execução
1. i18n (types + 5 idiomas) — evita build vermelho.
2. `UrgencyBar` + montagem no `SalesPageV2`.
3. `HeroTrustBar`.
4. Refactor do `HeroScene` (eyebrow, H1 dinâmico, subtítulo com destaque, trust slot, halo, mask, espaçamento).
5. `styles.css` (keyframes + mask utility).
6. Verificação: `npm run build` limpo + Playwright em 1440×900 e 375×812 → confere CTA acima do fold, timer visível, trust bar sob CTA, zero colisão símbolo↔H1, cor arch-primary correta em todos os 4 arquétipos.

## Métricas-alvo (proxy conversão)
- CTA visível sem scroll em 1366×768.
- Densidade de trust antes do fold: 1 → 4 sinais.
- H1 fala do gatilho do arquétipo → reconhecimento < 2 s.
- Urgência sem linguagem scammy (usar "reservado", nunca "expira/perdes").

Aprovas para eu implementar exatamente isto, sem escopo extra?
