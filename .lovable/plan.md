## Problema (confirmado após releitura do código)

No **mobile** das telas **Identificação** e **Q1–Q8**, faltam respiros e hierarquia visual entre os 3 blocos da tela:

1. **Barra de progresso** (topo)
2. **Pergunta + subtítulo** (meio)
3. **Opções de resposta / inputs** (base)

Hoje, em `src/components/quiz/QuizScreenWrapper.tsx`:
- Espaço entre progresso e conteúdo: `mb-6` (24px) no mobile — apertado.
- Padding lateral: `px-4` (16px) — encosta nas bordas.
- Sem centralização vertical no mobile (`md:min-h-[70vh]` só atua ≥768px).

Em `src/routes/index.tsx`:
- **QuestionScreen** (Q1–Q8): título `mb-4` e subtítulo `mb-8` — o título "cola" no subtítulo e o conjunto fica solto das opções.
- **Identity**: subtítulo `mt-4`, bloco de campos `mt-10`, botão `mt-12` — funciona no desktop, mas no mobile a hierarquia some porque tudo entra na dobra ao mesmo tempo sem agrupamento claro.

## Plano de implementação

**Escopo:** apenas mobile. Desktop (≥768px) permanece igual. Não mexer em fontes, cores, uppercase, lógica do quiz, traduções ou tela de captura de e-mail.

### 1. `src/components/quiz/QuizScreenWrapper.tsx`
- Padding lateral: `px-4` → `px-5` (mobile), mantém desktop.
- Padding vertical: `pt-2 pb-6` → `pt-3 pb-8` no mobile.
- Espaço progresso → conteúdo: `mb-6 md:mb-12` → `mb-10 md:mb-12` (de 24px para 40px no mobile).

### 2. `src/routes/index.tsx` — `QuestionScreen` (Q1–Q8)
- Wrapper externo do bloco da pergunta: agrupar `<h2>` + `<p>` num `<div className="mb-10 md:mb-8 space-y-3">` para criar um bloco "pergunta" claramente separado do bloco "opções".
- Remover o `mb-4` do `<h2>` e o `mb-8` do `<p>` (substituídos pelo `space-y-3` do agrupador e pelo `mb-10` externo).
- Manter `grid gap-3.5` das opções inalterado.

### 3. `src/routes/index.tsx` — `Identity`
- Agrupar título + subtítulo num bloco com `space-y-3` e separar do bloco de campos com `mb-10 md:mb-0` (no desktop o `mt-10` atual já basta).
- Aumentar separação botão: `mt-12` → `mt-10 md:mt-12` (botão ganha respiro mas não fica grudado em mobile).
- Não mexer em estilos do input, labels ou botões.

### 4. Verificação
- `npm run build` deve passar.
- Visual: confirmar no preview mobile (375px) a separação clara entre os 3 blocos; desktop intocado.

### Não-objetivos
- Não alterar fontes, pesos, tamanhos, cores, uppercase.
- Não tocar em EmailCapture, NeuralLoader, Reveal, traduções.
- Não introduzir dividers ou ícones novos — só espaço e agrupamento.
