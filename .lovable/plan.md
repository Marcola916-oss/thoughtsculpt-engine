## Plano — Fase 2

Construir o produto pós-checkout: login, onboarding, dashboard com sidebar e as 3 features de IA. Vou usar o **Lovable AI Gateway** (já tens `LOVABLE_API_KEY`) em vez de OpenAI direto — mesma qualidade (gemini-2.5-pro para diagnóstico, gemini-2.5-flash para calendário/compass), sem precisares gerir chave nem cobrança extra.

### Bloco A — Fundação (auth + dashboard shell)

1. **Migration**: tabelas `onboarding_answers`, `diagnoses`, `calendar_tasks`, `compass_analyses`, `user_progress` — todas com RLS por `auth.uid()`.
2. **Rotas auth**: `/login` (email+password, sem signup público), `/reset-password`.
3. **Layout `_authenticated`** com `beforeLoad` → redirect `/login` se sem sessão. Guarda também `access_level` (consulta `subscriptions.status`).
4. **`/onboarding`** (7 perguntas) — intercepta primeiro login antes do dashboard.
5. **`/dashboard`** hub: saudação dinâmica, 3 cards (Diagnóstico / Matriz / Compass), sidebar fixa com badges.

### Bloco B — Diagnóstico (core)

6. **Server fn `generateDiagnosis`** — chama AI Gateway com prompt das 4 dimensões (financeira/profissional/romântica/pessoal), grava em `diagnoses`. Cache permanente: se existir versão <30 dias, serve da DB.
7. **`/dashboard/diagnosis`** — 4 tabs, estado vazio com loader animado durante geração, botão "Gerar PDF" (jsPDF).

### Bloco C — Matriz de Ação (calendário)

8. **Server fn `generateCalendar`** — input: arquétipo + respostas onboarding + plan_type. Output: array de 30/180/365 dias com `reflective_task` + `action_task` + fase. Gerado **uma vez**, gravado em `calendar_tasks`.
9. **`/dashboard/calendar`** — vista mensal, drip unlock (+5 dias/24h no Mês 1), painel lateral para tarefa do dia, checkboxes que dão pontos.

### Bloco D — Compass

10. **Server fn `analyzeCompass`** — input: nome alvo + tipo relação + observações. Output JSON estruturado (arquétipo provável, estratégias, script comunicação).
11. **`/dashboard/compass`** — formulário + histórico de análises da DB.

### Decisões técnicas

- **AI Gateway model**: `google/gemini-2.5-pro` para diagnóstico (qualidade), `google/gemini-2.5-flash` para calendário/compass (volume).
- **Rate limit**: middleware em server fns valida `daily_limits` (tabela existe nas specs mas não precisa de criar agora — adicionar quando 1y plan for relevante).
- **Cache obrigatório** em diagnoses e calendar_tasks — nunca regerar sem pedido explícito.
- **Sem `users` table custom** — uso `auth.users.id` + `profiles` que já existes; ligo `subscriptions.user_id` aos joins.

### Execução

Vou começar pelo **Bloco A + B** num primeiro turno (migration + auth + dashboard shell + diagnóstico funcional). Depois Bloco C, depois Bloco D. Cada bloco entregue testável isoladamente.

Confirma e arranco pelo Bloco A.
