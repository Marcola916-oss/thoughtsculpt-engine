# Project Memory

## Core
REGRA PERMANENTE: nunca alterar o projeto sem autorização explícita do usuário. Explicar o que será feito e perguntar "posso começar?" antes de editar/criar/apagar arquivos, rodar comandos, instalar deps ou migrations. Permitido sem autorização: leitura de arquivos/logs/console e perguntas.
PIVOT (jun/2026): produto one-shot $9.90 (BRL R$49,90 / SAR 37 / PLN 39 / RON 45) — diagnóstico PDF de arquétipo (dinheiro+amor+carreira+pessoal). Order bumps: $4.99 (Guia de Relações) + $7.99 (Protocolo 30d). Sem dashboard, sem auth, sem planos recorrentes.
Stack: TanStack Start + Supabase (só storage de leads/orders/PDFs, sem auth) + i18n 5 idiomas (PT/EN/PL/RO/AR, AR=RTL). Stripe Brasil multi-moeda. Nunca localStorage (iframe).
Identidade: preto #000, accent #CC0000, Syne 800 display + Inter body, Noto Naskh AR. MarbleBust é símbolo central.
IA: chain Groq (Llama 3.3 70B) → Gemini 2.0 Flash (especialmente AR) → Cerebras → OpenRouter. PDF via @react-pdf/renderer server-side (não jsPDF).
Cache PDFs pré-gerados por arquétipo×idioma; personalizar só com nome+scores. Salvar em Supabase Storage, enviar por email (Brevo).
Toda tabela Supabase com RLS + GRANTs. Secrets em server functions (process.env). Micro-interações obrigatórias (hover translateY+glow, click scale 0.97).

## Memories
- [Pendências pós-Fase F](mem://features/pending-phase-g.md) — Fase G + 4 bugs do audit + tarefa atual cérebro mobile
- [Cores oficiais dos arquétipos](mem://design/archetype-colors.md) — AO azul petróleo #0F4C5C (cofre), SS roxo imperial #7C3AED (luxo), EA cinza ardósia #64748B (neblina), HI laranja #F97316 (vitalidade). Inclui paleta tri (principal/secundária/destaque) + sensações
- [Roadmap MVP one-shot](mem://features/mvp-roadmap.md) — Fases A (limpeza ✅), B (funil de vendas+reveal premium), C (PDF+IA chain), D (Stripe Elements+webhook+email)
