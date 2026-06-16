---
name: Pendências pós-Fase F
description: Tarefas em fila após concluirmos a substituição do cérebro 3D no mobile por vídeo WebM
type: feature
---

## EM ANDAMENTO
- **Cérebro mobile via vídeo WebM transparente**: usuário vai enviar o .webm. Substituir ArchetypeRetroBrain (fallback pixel art vermelho) por `<video autoplay muted loop playsinline>` com poster, lazy via IntersectionObserver. Ajustar `use-device-tier.ts` (tier `medium` recebe vídeo, `low` SVG estático com halo). Manter Spline no desktop high-tier.

## FASE G (próxima após cérebro)
- Migrar dashboard (todas rotas `_authenticated/dashboard/*`) para CSS animations puras — remover framer-motion
- Migrar onboarding (`_authenticated/onboarding.tsx`) — remover framer-motion
- Migrar `obrigado.tsx` — remover framer-motion residual
- Migrar componentes de gamificação (achievements, streak counter, progress bars) — substituir motion variants por CSS keyframes

## 4 BUGS CRÍTICOS DO AUDIT (06/2026)
1. **Hydration mismatch** em `src/hooks/use-scroll-reveal.ts` — `el.setAttribute("data-reveal-observed", "")` injeta atributo antes da hidratação. Mover para useEffect pós-mount ou usar suppressHydrationWarning.
2. **Auth guard SSR leakage** em `src/routes/_authenticated.tsx` — só checa `typeof window !== "undefined"`. Conteúdo de /onboarding e /dashboard renderiza no SSR antes do redirect client-side. Fortalecer guard ou usar beforeLoad com session check server-side.
3. **SSR build error catch-all** em `src/routes/$.tsx` — `@builder.io/react` import CJS quebra logs. Corrigir import default vs named.
4. **Share route sem error state** em `src/routes/share.$token.tsx` — token inválido fica travado em loading. Adicionar UI de erro + retry.

## NICE-TO-HAVE (não bloqueia)
- `/obrigado` e `/success` mostram error boundary genérico se acessados sem Stripe session_id — adicionar redirect/fallback amigável
- Code-split vendor bundle (atual 241kb gzipped — React+Framer+Radix)
- Auto-fix CRLF nos 11066 erros prettier pré-existentes (rodar `prettier --write .`)
