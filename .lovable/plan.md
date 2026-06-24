# Plano — Padronização Tipográfica do Quiz (v4)

## Regra-mãe (mesmo contrato da Landing)
**Syne 800 = só H1/H2/H3. Punchline = Syne 700. Quote/título-card-apertado = Syne 600. Body/UI = Inter 400/500/600. Zero `font-black` (900). Zero `italic` fora do Hero/FinalCTA H1.**

| Nível | Uso | Classe canônica |
|---|---|---|
| D2 | H2 das telas (Identity/Question/Email) | `font-display font-extrabold uppercase` |
| D4a | Punchline / pergunta curta | `font-display font-bold` |
| B1 | Body/intro | `font-sans` (sem peso) |
| B2 | Subtítulo destacado | `font-sans font-medium` |
| B3 | Label/eyebrow/botão CTA | `font-sans font-semibold uppercase tracking-[0.2em]` |

---

## 1. Auditoria — débitos atuais

### `src/routes/index.tsx` — telas Identity (782–859), QuestionScreen (863–895), EmailCapture (899–956)

**Identity (`Identity` fn):**
- L795–797: H2 com `style={{ fontSize, lineHeight, letterSpacing, fontWeight: 700 }}` inline + `italic` + `font-display`. **Proibido** (inline style, italic fora de Hero).
- L807, L820: labels `text-xs font-black uppercase tracking-[0.2em]` → `font-semibold` (B3, sem 900).
- L815: input `font-bold tracking-tight` → remover `font-bold` (input = body, Inter 400/500).
- L829: gender buttons `text-[13px] sm:text-base font-black uppercase tracking-tight italic` → `font-semibold uppercase` (sem italic, sem 900).
- L846: CTA "Continuar" `text-xl font-black italic tracking-tighter` → `font-semibold uppercase tracking-[0.18em]` (B3 CTA, sem 900, sem italic).

**QuestionScreen:**
- L875: H2 `font-display italic uppercase` + classe `.quiz-question-title` (peso 600 via CSS). Remover `italic` e elevar `.quiz-question-title` para `font-weight: 800` (D2) via CSS.

**EmailCapture:**
- L914: H2 idem QuestionScreen — remover `italic`.
- L936: input `font-medium` → remover (input = Inter 400 default).
- CTA usa `PrimaryButton` → corrigido no item shared abaixo.

### `src/components/quiz/QuizScreenWrapper.tsx`
- L47: progressTitle `text-[11px] font-black uppercase tracking-[0.3em]` → `font-semibold` (B3).
- L51: contador `%` `text-xs font-black` → `font-semibold tabular-nums` (UI).

### `src/components/quiz/QuizOption.tsx`
- L45: badge letra `text-xs font-bold` → `font-semibold` (B3 UI, neutro). OK manter `font-bold` se quisermos destaque, mas padrão v4 = 600.
- L58: texto opção selecionada `font-medium` → manter (B2 = lead/destaque). ✅ ok.

### `src/components/ui/PrimaryButton.tsx` (compartilhado — afeta EmailCapture e o resto do app)
- L59: `font-black uppercase tracking-widest` → `font-semibold uppercase tracking-[0.18em]`.
- L61: `italic` → remover.

### `src/styles.css`
- L1986–1992 `.quiz-question-title`: `font-weight: 600` → `font-weight: 800`. Mantém `font-size/line-height/letter-spacing` (regra do design existente). Adicionar `text-transform: uppercase` redundante (já vem do Tailwind, mas defensivo). Isto eleva H2 do Quiz ao patamar D2 sem mexer em cada call site.

---

## 2. Fases de execução (ordem)

### F0 — CSS foundation
Atualizar `.quiz-question-title` em `src/styles.css` (peso 800).

### F1 — Shared components (impactam várias telas)
- `PrimaryButton.tsx`: remover `font-black` + `italic`.
- `QuizScreenWrapper.tsx`: rebaixar 2× `font-black` → `font-semibold`.
- `QuizOption.tsx`: `font-bold` da letra → `font-semibold` (manter `font-medium` da opção selecionada).

### F2 — Tela Identity (`index.tsx` 782–859)
- H2: remover `style={{}}` inline + `italic`; usar classe canônica D2 (`font-display font-extrabold uppercase text-[clamp(1.5rem,4vw,2rem)] tracking-tight`).
- 2× labels: `font-black` → `font-semibold`.
- Input nome: remover `font-bold tracking-tight`.
- 3× gender buttons: `font-black ... italic` → `font-semibold uppercase` (sem italic).
- CTA Continuar: `font-black italic tracking-tighter` → `font-semibold uppercase tracking-[0.18em]`.

### F3 — QuestionScreen + EmailCapture (`index.tsx` 863–956)
- Ambos H2 (`.quiz-question-title`): remover utility `italic`. Peso vem do CSS atualizado em F0.
- EmailCapture input email: remover `font-medium`.

### F4 — Validação
```bash
bun run build
rg "font-black" src/routes/index.tsx src/components/quiz/ src/components/ui/PrimaryButton.tsx   # esperado: 0
rg "italic" src/routes/index.tsx | rg -v "Hero|Sales|reveal"   # esperado: 0 nas funções Identity/QuestionScreen/EmailCapture
```
- Playwright (opcional): screenshot das 3 telas (Identity → Question → Email) em desktop + mobile para conferir hierarquia.

---

## 3. Critérios de aceite
- ✅ Build limpo.
- ✅ Zero `font-black` e zero `italic` nas funções `Identity`, `QuestionScreen`, `EmailCapture` e em `PrimaryButton`/`QuizScreenWrapper`/`QuizOption`.
- ✅ H2 do Quiz visivelmente Syne 800 (consistente com landing).
- ✅ Botões e labels em Inter 600 (não 900 borrado).
- ✅ Sem `style={{ fontFamily/fontWeight }}` inline.

## 4. Escopo NÃO incluído (próximas iterações)
- Loader/Reveal/Sales/Plans (já cobertos no plano da landing v4 ou ainda pendentes).
- Telas pós-pagamento (`/obrigado`).
- Componentes do `NeuralLoader` (ainda sem auditoria de tipografia).
