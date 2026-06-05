# AGENTS — MindReset Engine Notes

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