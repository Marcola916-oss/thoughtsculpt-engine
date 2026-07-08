## Plano — Onda 0: Auditoria de Conversão

Escolheste **auditoria primeiro**, com os 3 mercados (AR / RO / PL) em paralelo. Este plano é só a Onda 0: entregar o **diagnóstico priorizado**. Nenhum código muda ainda. Depois de aprovado, cada tela vira o seu próprio plano de execução (Ondas 1-N).

### Entrega desta onda

Um relatório em markdown (posted no chat, não commitado) com:

**Por tela (1-15):**
- Ficheiro(s) + intervalo de linhas que possuem a tela
- Forma atual em 1-2 linhas
- **Top 3 riscos de conversão concretos** (não genéricos — referência a linha, copy fraca, gap de trust, problema mobile, gap de i18n)
- **1 hipótese de fix de maior alavancagem**

**Flags transversais:**
- Gaps de i18n nas 5 línguas (foco AR/RO/PL) em `translations.ts`
- Bugs de RTL (margin-left/right hardcoded, chevrons, ícones ltr-only)
- Sinais de confiança presentes/ausentes em Reveal + Sales + Checkout (badge Stripe, garantia, prova social, ancoragem de preço)
- Problemas mobile (tap targets <44px, CTA fora da fold, viewport traps)

**Priorização final:**
Tabela ordenada por impacto estimado × esforço, agrupando as fixes em **ondas de execução** (Onda 1 = Landing + Reveal + Sales, Onda 2 = Quiz + Email + Loader, Onda 3 = Checkout + Obrigado + E-mail, Onda 4 = Adaptação AR/RO/PL, Onda 5 = Skill.md + AGENTS.md).

### Como vou produzir

Já lancei um sub-agente read-only a varrer:
- `src/routes/index.tsx` (landing + stages do quiz)
- `src/routes/obrigado.tsx`
- `src/components/landing/*`
- `src/components/quiz/*`
- `src/components/sales/SalesPageV2.tsx` + blocos
- `src/lib/payments/checkout.functions.ts`
- `src/lib/i18n/translations.ts` (spot-check de chaves)

Quando o sub-agente terminar, consolido o output, adiciono a priorização e devolvo o relatório neste chat como resposta ao "implementar plano".

### Depois desta onda

Cada onda seguinte volta como um **novo `plan--create` focado numa tela ou num tema**, com diff mínimo, sem tocar em nada fora do escopo dessa onda. Zero reconstrução — só refino cirúrgico.

### Fora do escopo da Onda 0

- Qualquer mudança em código, copy, tokens ou Supabase
- Novos componentes ou dependências
- Screenshots via Playwright (deixo para as ondas de execução onde o antes/depois importa)

### Critério de sucesso

Sais desta onda com um mapa claro do que dá o maior salto de conversão nas 3 telas críticas (Landing, Reveal, Sales) e sabes exatamente em que ordem atacar as outras 12 sem gastar esforço em polimento cosmético que não move a agulha.