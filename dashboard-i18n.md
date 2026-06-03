# Dashboard i18n — Mover ~188 strings PT para traduções

## Goal
Eliminar todas as strings hardcoded em PT nos arquivos do dashboard, onboarding, sidebar e layout, movendo-as para o sistema i18n (5 idiomas).

## Arquivos afetados (por ordem de complexidade)
1. `dashboard.progress.tsx` (~37 strings) — conquistas, badges, relatório mensal, streak, legendas
2. `dashboard.calendar.tsx` (~30 strings) — empty state, export, grid labels, checkboxes, diário
3. `dashboard.compass.tsx` (~30 strings) — formulários, loading, resultados, sidebar análises
4. `onboarding.tsx` (~30 strings) — 7 etapas, loaders, opções, botões
5. `dashboard.settings.tsx` (~23 strings) — perfil, tema, assinatura, modal cancelamento
6. `dashboard.diagnosis.tsx` (~14 strings) — tabs, share, disclaimer, download
7. `dashboard.index.tsx` (~11 strings) — greetings, cards, hub heading
8. `dashboard.tsx` (~6 strings) — banners de expiração, lock overlay
9. `Sidebar.tsx` (~5 strings) — notificações modal
10. `checkout.success.ts` (~2 strings) — notificação de boas-vindas

## Tasks
- [ ] 1. Adicionar chaves `dashboard.*` ao Dict type + PT + EN (arquivo principal de traduções) → Verify: tsc --noEmit
- [ ] 2. Adicionar chaves `onboarding.*` ao Dict type + PT + EN → Verify: tsc --noEmit
- [ ] 3. Adicionar chaves `compass.*`, `settings.*`, `calendar.*`, `progress.*`, `diagnosis.*` ao Dict type + PT + EN → Verify: tsc --noEmit
- [ ] 4. Traduzir PL, RO, AR (spread EN + overrides) → Verify: tsc --noEmit
- [ ] 5. Atualizar `dashboard.progress.tsx` → Verify: tsc --noEmit
- [ ] 6. Atualizar `dashboard.calendar.tsx` → Verify: tsc --noEmit
- [ ] 7. Atualizar `dashboard.compass.tsx` → Verify: tsc --noEmit
- [ ] 8. Atualizar `onboarding.tsx` → Verify: tsc --noEmit
- [ ] 9. Atualizar `dashboard.settings.tsx` → Verify: tsc --noEmit
- [ ] 10. Atualizar `dashboard.diagnosis.tsx` → Verify: tsc --noEmit
- [ ] 11. Atualizar `dashboard.index.tsx` → Verify: tsc --noEmit
- [ ] 12. Atualizar `dashboard.tsx` (layout) + `Sidebar.tsx` + `checkout.success.ts` → Verify: tsc --noEmit
- [ ] 13. Verificação final: tsc --noEmit + vite build → Verify: 0 errors

## Done When
- [ ] Zero strings PT hardcoded em qualquer componente React
- [ ] Todas as chaves traduzidas em PT, EN, PL, RO, AR
- [ ] `tsc --noEmit` passa sem erros
- [ ] `vite build` passa

## Notes
- Priorizar Dict type expansion primeiro (tasks 1-4) para que tsc valide tudo
- Depois ir arquivo por arquivo (tasks 5-12)
- PL/RO/AR usam spread EN como fallback — só traduzir strings críticas de UX
