# AGENTS — MindReset Engine Notes

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
- TypeScript: `npx tsc --noEmit` (2 erros pré-existentes em `onboarding.tsx:192` e `obrigado.tsx:329` — type "/dashboard/" vs "/dashboard" — não relacionados). **0 erros nos novos componentes**.
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

## Camada Visual + Identidade (Fases 1-4)

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
- TypeScript: `npx tsc --noEmit` (6 erros pré-existentes em `src/components/dashboard/Sidebar.tsx:428` e `src/routes/_authenticated/dashboard.index.tsx:{82,94,152,154,206}` — não relacionados)
- Lint: `npx eslint src` (11082 erros totais, 11066 são CRLF pré-existentes do projeto Windows, 16 são `@typescript-eslint/no-explicit-any` pré-existentes, 9 warnings `react-refresh/only-export-components` ou `react-hooks/exhaustive-deps` pré-existentes; **0 novos**)
- Prettier por módulo: `npx prettier --write "src/components/<dir>/**/*.{ts,tsx}"` (NÃO rodar no projeto inteiro)

### Constraints de design

- **Acessibilidade:** `aria-label` descritivo, `role="img"` em símbolos, `aria-hidden` em camadas decorativas, `prefers-reduced-motion` e `(hover: none)` cobertos em `src/styles.css`
- **Bundle target:** ~4-6 kB gzipped por símbolo de marca. Atual: `MarbleBust` chunk 4.51 kB gzipped (✓), `Atmosphere` orchestrator 0.9 kB gzipped (✓)
- **Path alias:** `@/*` → `./src/*` (configurado em `tsconfig.json` via `vite-tsconfig-paths`)
- **Idioma:** respostas em Português, mas o `<html lang>` é controlado dinamicamente por `src/lib/i18n/LanguageProvider.tsx:91-96` baseado no locale do usuário
- **Cores canônicas:** vermelho accent `#CC0000` (oklch 0.52 0.24 27), canvas `#000000`, foreground `#F5F5F7`; tokens em `src/styles.css`: `--accent`, `--accent-glow`, `--accent-glow-strong`, `--accent-deeper`, `--accent-surface`
- **Fontes:** Inter (UI) + Syne (display) + Noto Naskh Arabic

### PowerShell 5.1 quirks (ambiente Windows)

- `New-Item` aceita `-Path` (não `-LiteralPath`); para paths com espaços, sempre usar aspas duplas
- `Get-Content -Raw` para medir tamanho raw; `Measure-Object -Line` para contar linhas (mas tsc retorna metadata — filtrar antes)
- `Select-String` com `-NotMatch` não aceita array; usar pipeline separado
- `npm` (não `bun` — não está instalado no Windows deste projeto)

### Recomendações Fase 6+ (pendentes)

1. **Otimizar vendor bundle:** `index-*.js` está em 781.81 kB / 241.70 kB gzipped (React + Framer Motion + Radix UI). Considerar code-splitting mais agressivo ou tree-shaking de Radix sub-pacotes
2. **Tree-shake MarbleBust:** variants `full`/`loader`/`mini`/`empty` são todos importados juntos. Lazy-load variants não usados por página
3. **Auto-fix CRLF:** 11066 erros `prettier/prettier` (CRLF) pré-existentes. Rodar `npx prettier --write .` em momento de baixa atividade (vai reformatar ~11k linhas)
4. **Resolver TS pré-existentes:** 6 erros em `dashboard/Sidebar` (locale, boolean|null, Dict.lang, Dict.cta) — tarefa dedicada de cleanup
5. **Automatizar Lighthouse em CI:** GitHub Actions rodando `npx lighthouse` em PRs (requer Chrome headless configurado)
6. **Dev server cleanup:** se ficar em background, lembrar de matar com `Stop-Process -Id <PID>` (ex: PID 29780 durante V5)

### Arquivos críticos de leitura (para novos agentes)

- `src/styles.css:597-841` — overrides de `prefers-reduced-motion` e `(hover: none)` para todas as Fases 1-3
- `src/lib/animations.ts` — 30+ variants consumidas por `Reveal` e outras animações
- `src/hooks/use-mouse-position.ts` — consumed por `ArchetypeHover` e `BentoCard`
- `src/lib/i18n/LanguageProvider.tsx:91-96` — set dinâmico de `<html lang>` e `dir`
- `src/lib/utils.ts` — `cn` helper (clsx + tailwind-merge) usado em todos os componentes novos
</content>
</invoke>