# AGENTS — MindReset Engine Notes

## 🎯 REGRAS COMPORTAMENTAIS — Como o Agente Deve Agir

### Tradução de comandos não-técnicos

| Você diz | O agente faz |
|---|---|
| "deixa mais profissional" | Abre Chrome DevTools → inspeciona a seção inteira → identifica TODOS os problemas de uma vez (contraste, espaçamento, hierarquia, micro-interações ausentes) → corrige tudo em uma resposta |
| "está feio" / "parece amador" | Mesmo processo acima |
| "arruma isso" / "conserta" | Lê os arquivos relevantes → identifica causa raiz → corrige |
| "não está funcionando" | Verifica console errors + network + Supabase logs → identifica causa → corrige |
| "adiciona X" | Implementa feature completa: frontend + Supabase (schema + RLS + index) + Edge Function se necessário + TypeScript types + i18n nos 5 idiomas |
| "melhora esse texto" | Reescreve com copy de conversão para fintech-behavioral — nunca genérico, nunca tradução literal |
| "deixa mais rápido" | Identifica bottlenecks: bundle size, lazy loading, cache → otimiza |
| "faz uma arte" | Aplica brand tokens do SKILL.md + micro-interações obrigatórias + animações premium. Entrega como se fosse feito por uma empresa de 1000 pessoas |

### Padrões de qualidade OBRIGATÓRIOS antes de entregar qualquer coisa

1. `npm run build` deve passar — zero novos erros
2. TypeScript: zero novos erros (verificação 2026-06-09: 0 erros pré-existentes ativos)
3. Responsivo: funciona em 375px (mobile) e 1440px (desktop)
4. Contraste WCAG AA verificado
5. Micro-interações aplicadas conforme seção abaixo
6. RTL verificado para qualquer componente que afete o idioma árabe

### Regras inegociáveis

1. **Nunca entregar código incompleto** — proibido: TODO, "complete this", "add your logic here", placeholders
2. **Resolver tudo em uma resposta** — não um problema por vez, não "veja se funcionou e me avisa"
3. **Nunca pular RLS** — toda tabela Supabase obrigatoriamente com Row Level Security
4. **Nunca hardcodar secrets** — STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY só em Edge Functions via Secrets
5. **Nunca usar localStorage** — Lovable roda em iframe sandboxed; usar state em memória ou Supabase
6. **Sempre aplicar micro-interações** — botão CTA: hover translateY(-2px)+glow, click scale(0.97). Sem micro-interação = entrega rejeitada
7. **RTL para árabe** — usar margin-inline-start/end, nunca margin-left/right
8. **Cache de AI generations** — diagnóstico, calendário e relatórios são gerados UMA VEZ. Nunca regenerar sem motivo explícito
9. **Sempre usar Chrome DevTools antes de mexer em componente visual** — ver o estado real antes de mudar qualquer coisa
10. **Ao terminar qualquer tarefa** — rodar `npm run build` e confirmar saída limpa

### Identidade visual — o que "profissional" significa neste projeto

- **Canvas:** `#000000` puro (oklch 0% 0 0). Não cinza escuro, não navy — preto absoluto
- **Accent:** `#CC0000` (oklch 0.52 0.24 27). Usado com parcimônia — só em CTAs, bordas de hover, badges
- **Texto principal:** `#F5F5F7` (oklch 0.97 0.003 250) — nunca branco puro, nunca cinza médio
- **Cards / superfícies:** `#0D0D0D` (oklch 0.13 0 0) cards, `#1A1A1A` (oklch 0.18 0 0) elevated
- **Border:** `#2A2A2A` (oklch 0.24 0 0)
- **Muted foreground:** `#929698` (oklch 0.72 0.005 250) — AA sobre preto
- **Tokens CSS em `src/styles.css`:** `--accent`, `--accent-glow`, `--accent-glow-strong`, `--accent-deeper`, `--accent-surface`
- **Fontes:** Syne 800 para display/hero, Inter para todo o resto, Noto Naskh Arabic para AR
- **O MarbleBust é a identidade central da marca** — presente em hero, loaders, empty states
- **Atmosphere (VolumetricFog + FloatingSymbols + ScanLines) só no hero** — nunca em sections de conteúdo
- **Cada animação deve ter duração 200-500ms com easing `ease-out`** — suave, não brusco

> ⚠️ **CORES OFICIAIS DOS ARQUÉTIPOS — NÃO ALTERAR**
> Definidas em `src/styles.css` nos seletores `[data-arch]`. São as ÚNICAS cores corretas.
> Qualquer IA que mexer em UI de arquétipo DEVE usar exatamente estes valores:

| Arquétipo | Nome | Cor primária | Gradient |`--arch-primary` |
|-----------|------|-------------|----------|------------------|
| **AO** | Acumulador Obsessivo | Azul Petróleo | `#1E6B82 → #0F4C5C` | `#1E6B82` |
| **SS** | Status Seeker | Roxo Imperial | `#7C3AED → #4C1D95` | `#7C3AED` |
| **EA** | Evasivo/Alienado | Cinza Ardósia | `#64748B → #334155` | `#64748B` |
| **HI** | Hedonista Impulsivo | Laranja Âmbar | `#F97316 → #C2410C` | `#F97316` |

> ❌ ERROS COMUNS a evitar: AO ≠ âmbar, AO ≠ verde, HI ≠ vermelho (#CC0000 é brand, não HI), SS ≠ dourado, EA ≠ roxo.
> O vermelho `#CC0000` é EXCLUSIVO do brand global — nunca atribuir a um arquétipo específico.

### Micro-interações obrigatórias

| Componente | Default | Hover | Pressed | Disabled |
|---|---|---|---|---|
| Primary Button | bg:#CC0000 | bg:#990000+glow | scale(0.97) | opacity:0.4 |
| Input | border:#2A2A2A | border:#555 | border:#CC0000 | opacity:0.5 |
| Card | bg:#0D0D0D | border:red+translateY(-4px) | scale(0.99) | opacity:0.6 |
| Quiz Option | border:#2A2A2A | border:red+red-bg | darker-red-bg | — |

Lista completa:
- **Botão CTA:** hover=translateY(-2px)+glow, click=scale(0.97) 100ms
- **Barra de progresso:** `transition: width 0.8s ease-out`
- **Quiz loader:** anel vermelho girando + textos fade a cada 0.7s
- **Reveal do diagnóstico:** nome do arquétipo typewriter (1 char/50ms)

### Quando chamar cada agente

- `@mindreset-ui` → tudo visual: "deixa bonito", "parece amador", "arruma o layout", "faz uma arte"
- `@mindreset-dev` → features e integrações: "adiciona", "implementa", "conecta com Supabase/Stripe"
- `@mindreset-copy` → textos e traduções: "melhora o texto", "reescreve", "traduz para os 5 idiomas"
- `@mindreset-fix` → bugs e erros: "não funciona", "está dando erro", "está quebrando", "página branca"

### Contexto do produto para interpretar pedidos

- MindReset NÃO é app de orçamento — é psicologia comportamental financeira
- Estrutura estrita do produto (Linear): Landing page → Identidade → Quiz → Captura de E-mail → Loader → Reveal do arquétipo → VSL → Checkout Produto → Checkout Stripe → Thank You
- O produto **não possui sistema de login nem dashboard**. Tudo ocorre no funil.
- Conversão acontece na landing page e na página de reveal
- Cada elemento visual deve transmitir: "empresa de 1000 pessoas construiu isso"
- Usuário final não é técnico — ele vê resultados, não código

---

## MCPs e Agentes Atualizados

### MCPs instalados (8 — conforme `opencode.json`)

| MCP | Tipo | Uso |
|---|---|---|
| memory | local | Memória persistente cross-session |
| github | local | Integração com GitHub (issues, PRs, code search) |
| sequential-thinking | local | Pensamento sequencial / chain-of-thought |
| Perplexity | local | Busca web |
| playwright | local | Automação de browser (screenshots, smoke tests) |
| chrome-devtools | local | Debug de browser |
| context7 | local | Docs de bibliotecas |
| supabase | local | Database, edge functions, auth (read-only via MCP) |

### Skill do projeto

- `.agents/skills/mindreset-project/SKILL.md` — Conhecimento completo do projeto: brand tokens, file structure, quiz flow, i18n, deployment, accessibility, known issues, PowerShell quirks, Supabase config.

### Agentes customizados

Ver seção **🎯 REGRAS COMPORTAMENTAIS → Quando chamar cada agente** acima para o mapeamento atual de agentes (`@mindreset-ui`, `@mindreset-dev`, `@mindreset-copy`, `@mindreset-fix`).

### Custom tools (3)

| Tool | Uso |
|---|---|
| `contrast-audit` | Verifica WCAG AA de cores do projeto |
| `i18n-sync` | Verifica chaves de tradução faltantes entre 5 idiomas |
| `build-check` | Build + TypeCheck + Lint em uma chamada |

*Localização atual: `.opencode/tools.bak/`*

### Instructions

`opencode.json` referencia automaticamente `AGENTS.md` e `.agents/skills/mindreset-project/SKILL.md` como contexto para todas as sessões.

---

## Camada Visual + Identidade (Fases 1–4)

As Fases 1-4 entregaram a camada visual premium do SaaS: identidade de marca, atmosfera, interação e integração nos touchpoints-chave (global, home, quiz, /obrigado).

### Componentes novos (todos em `src/components/<dir>/`)

- **identity/**: `MarbleBust`, `BustLoader`, `IdentitySymbol`, `BustMini`, `BustEmptyState`
- **atmosphere/**: `VolumetricFog`, `FloatingSymbols`, `ScanLines`, `Atmosphere` (orchestrator 1-linha)
- **interaction/**: `ArchetypeHover`, `MagneticCursor`, `Reveal`, `ButtonPress`

### Touchpoints integrados (4A-4D)

- **4A — Global:** `src/routes/__root.tsx` (ScanLines + MagneticCursor antes do AnimatePresence)
- **4B — Home / hero:** `src/routes/index.tsx` (Hero+Features wrappados com `<Atmosphere fog="dramatic" symbols="sparse" scan="subtle" pinned>`; data-cursor no CTA Start e no Login link)
- **4C — Quiz:** `src/routes/index.tsx` (5 Atmosphere wraps por estágio: identity/q/email/loader/reveal); `src/components/quiz/NeuralLoader.tsx` (Brain icon → MarbleBust no centro); `src/components/quiz/QuizOption.tsx` (data-cursor)
- **4D — /obrigado:** `src/routes/obrigado.tsx` (4 imports: Atmosphere, ButtonPress, IdentitySymbol, MarbleBust; return wrappado com Atmosphere; Copy button → ButtonPress; 🧠 loading → MarbleBust; IdentitySymbol aditivo na brand area com opacity-60; data-cursor em 4 Links)

### Verificações

- Build: `npm run build` (~2.5s, exit 0)
- TypeScript: `npx tsc --noEmit` (0 erros pré-existentes — verificação 2026-06-09)
- Lint: `npx eslint src` (11082 erros totais, 11066 são CRLF pré-existentes do projeto Windows, 16 são `@typescript-eslint/no-explicit-any` pré-existentes, 9 warnings `react-refresh/only-export-components` ou `react-hooks/exhaustive-deps` pré-existentes; **0 novos**)
- Prettier por módulo: `npx prettier --write "src/components/<dir>/**/*.{ts,tsx}"` (NÃO rodar no projeto inteiro)

### Constraints de design

- **Acessibilidade:** `aria-label` descritivo, `role="img"` em símbolos, `aria-hidden` em camadas decorativas, `prefers-reduced-motion` e `(hover: none)` cobertos em `src/styles.css`
- **Bundle target:** ~4-6 kB gzipped por símbolo de marca. Atual: `MarbleBust` chunk 4.51 kB gzipped (✓), `Atmosphere` orchestrator 0.9 kB gzipped (✓)
- **Path alias:** `@/*` → `./src/*` (configurado em `tsconfig.json` via `vite-tsconfig-paths`)
- **Idioma:** respostas em Português, mas o `<html lang>` é controlado dinamicamente por `src/lib/i18n/LanguageProvider.tsx:91-96` baseado no locale do usuário
- **Identidade visual:** ver seção "Identidade visual" nas Regras Comportamentais acima (consolidada: tokens oklch, fontes, superfícies)

### PowerShell 5.1 quirks (ambiente Windows)

- `New-Item` aceita `-Path` (não `-LiteralPath`); para paths com espaços, sempre usar aspas duplas
- `Get-Content -Raw` para medir tamanho raw; `Measure-Object -Line` para contar linhas (mas tsc retorna metadata — filtrar antes)
- `Select-String` com `-NotMatch` não aceita array; usar pipeline separado
- `npm` (não `bun` — não está instalado no Windows deste projeto)

### Recomendações Fase 6+ (pendentes — atualizado Fase 7)

1. **Otimizar vendor bundle:** `index-*.js` está em 781.81 kB / 241.70 kB gzipped (React + Framer Motion + Radix UI). Considerar code-splitting mais agressivo ou tree-shaking de Radix sub-pacotes
2. **Tree-shake MarbleBust:** variants `full`/`loader`/`mini`/`empty` são todos importados juntos. Lazy-load variants não usados por página
3. **Auto-fix CRLF:** 11066 erros `prettier/prettier` (CRLF) pré-existentes. Rodar `npx prettier --write .` em momento de baixa atividade (vai reformatar ~11k linhas)
4. **Resolver TS pré-existentes:** anteriores já resolvidos (verificação 2026-06-09). Monitorar novos erros de typescript.
5. **Automatizar Lighthouse em CI:** GitHub Actions rodando `npx lighthouse` em PRs (requer Chrome headless configurado)
6. ~~**Dev server cleanup:**~~ ✅ resolvido (documentado)

### Arquivos críticos de leitura (para novos agentes)

- `src/styles.css:597-841` — overrides de `prefers-reduced-motion` e `(hover: none)` para todas as Fases 1-3
- `src/lib/animations.ts` — 30+ variants consumidas por `Reveal` e outras animações
- `src/hooks/use-mouse-position.ts` — consumed por `ArchetypeHover` e `BentoCard`
- `src/lib/i18n/LanguageProvider.tsx:91-96` — set dinâmico de `<html lang>` e `dir`
- `src/lib/utils.ts` — `cn` helper (clsx + tailwind-merge) usado em todos os componentes novos

---

## Landing Page Premium Upgrade (Fase 5)

A Fase 5 entregou o upgrade completo da landing page, baseado no mockup `melhorias e contexto/MindReset_LandingPage_Mockup.html`. A landing pré-quiz passou de 2 para 9 seções, em 5 idiomas completos (PT, EN, PL, RO, AR).

### Componentes novos (todos em `src/components/landing/`)

| Componente | Inspiração | Função |
|---|---|---|
| `ProofBar` | ③ Tira 4 stats | Métricas de confiança: diagnósticos, rating, sem banco, idiomas |
| `ArchetypeShowcase` | ④ Grid 4 colunas | Cards AO/SS/EA/HI com ícones Lucide + hover bottom-bar vermelha |
| `HowItWorks` | ⑤ 3 passos | Steps com setas conectoras (versão landing, não-VSL) |
| `FeaturesGrid` | ⑥ 2x2 grid | 4 ferramentas (Diagnóstico, Matriz, Compass, Progresso) — REPLACES old `<Features>` bento EN |
| `Testimonials` | ⑦ 3 cards | 5★ + avatar gradiente + arquétipo |
| `FAQ` | ⑧ 2-col sticky | Accordion animado com `useState` (1 item aberto por vez) |
| `FinalCTA` | ⑨ Glow + headline | `<span>` accent + CTA primário + guarantee microtext |

### Touchpoints integrados (5A-5B)

- **5A — `src/routes/index.tsx`:** `stage="hero"` agora wrappa 9 seções: Hero → ProofBar → ArchetypeShowcase → HowItWorks → FeaturesGrid → Testimonials → FAQ → FinalCTA. Hero isolado em Atmosphere; resto herda background base. CTAs internos (`FAQ`, `FinalCTA`) chamam `setStage({ kind: "identity" })` para iniciar o quiz.
- **5B — i18n 5 idiomas:** `src/lib/i18n/types.ts` (Dict) e `src/lib/i18n/translations.ts` (PT/EN/PL/RO/AR) com chave `landing.*` completa. **~7.000 caracteres** de copy localizados (especialmente crítico AR/PL/RO com nuances culturais: "Oszczędny" não "Skąpy" no PL, "Econom" não "Zgârcit" no RO, "المدخر القهري" não "البخيل" no AR).
- **5C — Sales cleanup:** Removidos do `Sales` (em `index.tsx`): Block 5 (How It Works), Block 6 (Social Proof/Testimonials), Block 7 (FAQ). Mantidos: Block 1 (H1+VSL), Block 2 (Pain Mirror), Block 3 (Science), Block 4 (4D Product Grid com copy de vendas), Block 8 (Final CTA + Guarantee). Rota chunk `index-*.js` foi de 100.65 kB → 93.70 kB (deduplicação).

### Verificações (Fase 5)

- Build: `npm run build` (~2.5s, exit 0). Landing adiciona ~20 kB (7 componentes) ao bundle principal.
- TypeScript: `npx tsc --noEmit` (0 erros pré-existentes — verificação 2026-06-09; anteriormente `onboarding.tsx:192` e `obrigado.tsx:329`). **0 erros nos novos componentes**.
- Lint: `npx eslint src/components/landing/` (clean — 0 erros). `npx eslint src/routes/index.tsx` (1 erro pré-existente `as any` em Sales:936).
- Prettier: `npx prettier --write "src/components/landing/**/*.{ts,tsx}" "src/routes/index.tsx"` (4 files reformatted: FAQ, FinalCTA, Testimonials, index.tsx).

### Constraints de design aplicadas

- **Reutilização:** `Reveal` (componente de scroll-reveal) e `Reveal.Group` (stagger) usados em TODAS as 7 seções. `ButtonPress` (halo vermelho跟随 cursor) usado em `<FAQ cta>` e `<FinalCTA cta>`. `Atmosphere` mantido no Hero.
- **Acessibilidade:** `aria-label` em ProofBar; `aria-labelledby` em todas as sections; `aria-expanded` + `aria-controls` no FAQ accordion; `aria-hidden` em badges/dividers decorativos; `role="img"` + `aria-label` em estrelas dos testimonials.
- **Responsive:** grid 1-col em mobile (`grid-cols-1`), 2-col em tablet (`sm:grid-cols-2`), 4-col em desktop (`lg:grid-cols-4`). FAQ vira 1-col em mobile (sticky desativado). Connectors `→` no HowItWorks escondem em mobile.
- **Path alias:** `@/components/landing` re-exporta todos os 7 via barrel `index.ts`.

### Notas de copy (importante)

- **PT-PT (lusófono):** base do mockup. Usa "tu/tens/teu" (PT-PT, não PT-BR). Validação cultural: usa "estatuto" em vez de "status" para SS (mais natural em PT-PT).
- **EN:** tom premium fintech-behavioral, mas universal. "Discover" highlighted em vermelho no FinalCTA.
- **PL:** "Oszczędny" (não "Skąpy"/miser), "Paw" (peacock), "Iskra" (spark) — evita conotações negativas.
- **RO:** "Econom" (não "Zgârcit"/avaricious), "Cumpătat" — tom premium sem julgamento.
- **AR:** RTL-aware. "المدخر القهري" (Saver compulsive, não "البخيل"/miser). "اكتشاف" highlighted em vermelho. Cultural: zero referências a juros/riba.

### Recomendações Fase 6+ (pendentes)

1. **Code-split ArchetypeShowcase:** `landing-ArchetypeShowcase-*.js` será criado se os 4 ícones Lucide forem pesados. Atualmente inline, monitorar.
2. **A/B test do headline hero:** PT atual ("O dinheiro não te falta...") é forte. Testar variante sem "te falta" para ver conversão.
3. **Adicionar vídeo real no VSL Block 1 do Sales:** placeholder atual. Integrar com provider (Mux/Cloudflare Stream).
4. **FAQ schema.org:** adicionar `FAQPage` JSON-LD para SEO rich snippets. Especialmente importante em PL/RO/AR onde rich results têm menos concorrência.
5. **Trust badges no hero:** considerar adicionar selos SSL/Stripe/Cancel anytime em badge flutuante (similar ao existente no TopBar).

---

## Curtain + Text Upgrade (Fase 6)

A Fase 6 resolveu o problema de contraste causado pelo `VolumetricFog` (position: fixed, z-index: 1) que cobria todo o viewport com glow vermelho, tornando texto em sections pós-Hero ilegível.

### Mudanças aplicadas

- **`src/routes/index.tsx:184-194`:** Wrapper curtain `<div className="relative z-10 bg-background/80 backdrop-blur-md">` adicionado nas seções pós-Hero (ProofBar → FinalCTA). Cria painéis escuros sobre o fog vermelho.
- **10 upgrades de cor de texto** em 7 componentes: `text-muted-foreground` → `text-foreground/70` (corpo) ou `text-foreground/60` (labels). `text-arch-primary` (vermelho) mantido apenas para badges decorativos.

### Componentes modificados

| Componente | Mudanças |
|---|---|
| `ArchetypeShowcase` | 3 text-muted-foreground → text-foreground/70 |
| `HowItWorks` | 2 text-muted-foreground → text-foreground/70 |
| `ProofBar` | 1 text-muted-foreground → text-foreground/70 |
| `FeaturesGrid` | 1 text-muted-foreground → text-foreground/70 |
| `FAQ` | 2 text-muted-foreground → text-foreground/60 |
| `FinalCTA` | 2 text-muted-foreground → text-foreground/60 |
| `Testimonials` | 0 (já usava text-foreground/85) |

### Root cause

`VolumetricFog` com `position: fixed, inset-0, z-index: 1` cobre todo o viewport com `--accent-glow-strong` (50% opacity). Fixes de cor de texto sozinhos não bastam — o FUNDO era vermelho, não preto. A curtain cria background escuro com blur por trás do conteúdo.

### Verificação

- Build: 2.43s, 0 erros novos
- Diff: 20 insertions, 18 deletions
- Docs: `tmp/smoke/FASE6-APPLIED.md`

---

## MCPs + Skills + Custom Agents (Fase 7)

A Fase 7 instalou todo o ecossistema OpenCode gratuito para o projeto.

### MCPs instalados (8 — atualizados conforme `opencode.json`)

| MCP | Tipo | Uso |
|---|---|---|
| memory | local | Memória persistente cross-session |
| github | local | Integração com GitHub (issues, PRs, code search) |
| sequential-thinking | local | Pensamento sequencial / chain-of-thought |
| Perplexity | local | Busca web |
| playwright | local | Automação de browser (screenshots, smoke tests) |
| chrome-devtools | local | Debug de browser |
| context7 | local | Docs de bibliotecas |
| supabase | local | Database, edge functions, auth (read-only via MCP) |

### Skill do projeto

- `.agents/skills/mindreset-project/SKILL.md` — Conhecimento completo do projeto: brand tokens, file structure, quiz flow, i18n, deployment, accessibility, known issues, PowerShell quirks, Supabase config.

### Agentes customizados

Ver seção **🎯 REGRAS COMPORTAMENTAIS → Quando chamar cada agente** acima para o mapeamento atual de agentes (`@mindreset-ui`, `@mindreset-dev`, `@mindreset-copy`, `@mindreset-fix`).

### Custom tools (3)

| Tool | Uso |
|---|---|
| `contrast-audit` | Verifica WCAG AA de cores do projeto |
| `i18n-sync` | Verifica chaves de tradução faltantes entre 5 idiomas |
| `build-check` | Build + TypeCheck + Lint em uma chamada |

*Localização atual: `.opencode/tools.bak/`*

### Instructions

`opencode.json` referencia automaticamente `AGENTS.md` e `.agents/skills/mindreset-project/SKILL.md` como contexto para todas as sessões.
