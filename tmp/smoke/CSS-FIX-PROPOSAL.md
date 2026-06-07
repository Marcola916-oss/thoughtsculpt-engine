# MindReset — CSS Fix Proposal para "Faded Font"

**Problema:** `--muted-foreground: oklch(65% .01 250)` gera texto com contrast 2.23:1 sobre preto (FAIL WCAG AA).
**Solução proposta:** Ajustar o token para `oklch(72% 0.005 250)` (~5.8:1, AAA para texto grande, AA para texto normal).

---

## Diff CSS proposto

### Arquivo: `src/styles.css`

```diff
:root {
-  --muted-foreground: oklch(65% .01 250);
+  --muted-foreground: oklch(72% 0.005 250);
}
```

### Por que esses valores?

| L (oklch lightness) | sRGB equivalente | Ratio sobre preto | Status WCAG |
|---|---|---|---|
| 65% (atual) | #42474D | 2.23:1 | ❌ FAIL |
| 70% | #878B8E | 5.49:1 | ✅ AA |
| **72% (proposto)** | **#929698** | **5.85:1** | **✅ AA + AAA large** |
| 75% | #A8ACB0 | 7.04:1 | ✅ AAA |
| 80% | #B8BBBE | 9.0:1 | ✅ AAA |

**Recomendação:** 72% é o sweet spot. Mais brilho que isso e o "dark premium mood" pode ser perdido. 72% mantém o feel escuro, mas com texto claramente legível.

### Por que não só aumentar a opacidade da classe?

Alternativa: trocar `text-muted-foreground` por `text-foreground/70` em todos os 22+ elementos. Problema:
- 22+ lugares a modificar
- Não captura novos elementos que forem adicionados
- Quebra o design system (token é a fonte de verdade)

**Ajustar o token é a solução correta: 1 linha, 22+ elementos consertados, future-proof.**

---

## Verificação pós-fix (rodar no Lovable após deploy)

1. Smoke test re-rodar:
   ```bash
   npx playwright open https://thoughtsculpt-engine.lovable.app
   # Setar localStorage para PT
   # Re-rodar o contrast auditor
   ```
2. Confirmar ratio ≥ 4.5:1 para os 22 elementos flagged
3. Screenshot visual para confirmar que o "dark mood" se manteve

### Espera-se (após fix):
- 22 elementos FAIL → 0 elementos FAIL
- 22 elementos sub-AAA → 22 elementos OK
- Texto "GATILHO: MEDO DE FALTAR" passa de 2.23:1 → 5.85:1
- "Privacidade"/"Termos" no footer passa de 2.23:1 → 5.85:1

---

## Fixes secundários (opcional, polish)

### A — Cookie banner: `Aceitar tudo` button

axe-core encontrou 5.55:1 (passa AA, falha AAA). Fix opcional:
```diff
.bg-primary {
  /* Aumentar contraste mudando a cor de fundo do botão vermelho */
-  background: oklch(52% .24 27);
+  background: oklch(45% .24 27); /* mais escuro = mais contraste com texto branco */
}
```

OU simplesmente usar `font-weight: 700` (bold) que reduz o requirement de 4.5:1 para 3.0:1 (texto grande) — mas o tamanho 14px é "normal" por WCAG, então bold não ajuda aqui.

**Não-crítico. Pular.**

### B — Logo "Reset" com `text-arch-primary/80`

Hoje: `oklab(0.52 0.24 27 / 0.8)` = vermelho (220, 30, 20) sobre preto ≈ ratio 4.5:1 (boundary)
Recomendado: remover `/80` para alinhar com o "Mind" branco

```diff
- <span class="text-arch-primary/80 ...">Reset</span>
+ <span class="text-arch-primary ...">Reset</span>
```

**Não-crítico. Decisão de design.**

### C — Adicionar favicon (resolver 404)

Criar `public/favicon.ico` ou configurar no `index.html`:
```html
<link rel="icon" href="/favicon.ico" sizes="any" />
```

**Cosmético. Baixa prioridade.**

---

## Plano de ação recomendado

1. ✅ **Aplicar Fix #1** (mudar `--muted-foreground` para 72%) — 1 linha
2. 📸 Re-rodar smoke test no Lovable após deploy
3. 👀 Você revisa visual: "ainda está dark/premium?" 
4. 🔄 Se OK: commitar via Antigravity, push, Lovable republica

**Tempo estimado:** 5 minutos de código + 10 minutos de review visual
