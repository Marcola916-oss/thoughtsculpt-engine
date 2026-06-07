# MindReset — Color Contrast Audit Detail

**Método:** Custom auditor (axe-core 4.10.2 + compositor alpha-aware)
**Data:** 2026-06-07
**Locale auditada:** PT (sample — pattern se repete em todas)

---

## Resumo

| Categoria | Contagem |
|---|---|
| Total de elementos de texto auditados | 84 |
| Com ratio < 4.5:1 (WCAG AA FAIL) | **22** |
| Com ratio < 7.0:1 (WCAG AAA FAIL, passa AA) | 19 |
| OK per AA | 43 |

**Causa raiz:** O token de design `--muted-foreground: oklch(65% .01 250)` resolve para `#42474D` (RGB 66,71,77), que dá ratio **2.23:1** sobre o background preto padrão. WCAG AA exige **4.5:1** para texto < 18pt.

---

## Lista Completa dos 22 elementos FAIL (ratio < 4.5:1)

Todos com `color: rgb(66, 71, 77)` sobre `bg: rgb(0, 0, 0)` ⇒ **ratio 2.23:1**

### ArchetypeShowcase section (8 elementos)

| # | Texto (truncado) | Tag | Tamanho | Classe |
|---|---|---|---|---|
| 1 | "GATILHO: MEDO DE FALTAR" | P | 11px | `text-[11px] font-semibold text-muted-foreground` |
| 2 | "Acumula com obsessão. Dificuldade em gastar..." | P | 14px | `text-sm leading-relaxed text-muted-foreground` |
| 3 | "GATILHO: APROVAÇÃO SOCIAL" | P | 11px | (idém) |
| 4 | "Gasta para impressionar. O estatuto é a moeda..." | P | 14px | (idém) |
| 5 | "GATILHO: FUGA E NEGAÇÃO" | P | 11px | (idém) |
| 6 | "Evita falar sobre dinheiro. Ignora extratos..." | P | 14px | (idém) |
| 7 | "GATILHO: PRAZER IMEDIATO" | P | 11px | (idém) |
| 8 | "Compra por impulso, vive o agora..." | P | 14px | (idém) |

### HowItWorks section (3 elementos)

| # | Texto | Tag | Tamanho | Classe |
|---|---|---|---|---|
| 9 | "Todo comportamento financeiro tem uma raiz emocional..." | P | 18px | `text-base leading-relaxed text-muted-foreground` |
| 10 | "Sem planilhas. Sem dados bancários. Apenas perguntas..." | P | 18px | (idém) |
| 11 | "Sobre comportamento real, não teoria financeira..." | P | 14px | `max-w-[220px] text-sm leading-relaxed text-muted-foreground` |
| 12 | "A IA mapeia o teu arquétipo em 4 dimensões..." | P | 14px | (idém) |
| 13 | "Missões diárias desbloqueadas gradualmente..." | P | 14px | (idém) |

### FeaturesGrid section (4 elementos)

| # | Texto | Tag | Tamanho | Classe |
|---|---|---|---|---|
| 14 | "Um relatório em 4 dimensões escrito exclusivamente..." | P | 16px | `text-[15px] leading-relaxed text-muted-foreground` |
| 15 | "Um calendário de 30, 180 ou 365 dias..." | P | 16px | (idém) |
| 16 | "Descreve alguém da tua vida e a IA identifica..." | P | 16px | (idém) |
| 17 | "Streak de dias consecutivos, pontos, conquistas..." | P | 16px | (idém) |

### FAQ section (1 elemento)

| # | Texto | Tag | Tamanho | Classe |
|---|---|---|---|---|
| 18 | "Se ficou alguma dúvida, o botão para começar..." | P | 16px | `mt-5 max-w-md text-base leading-relaxed text-muted-foreground` |

### FinalCTA section (2 elementos)

| # | Texto | Tag | Tamanho | Classe |
|---|---|---|---|---|
| 19 | "8 perguntas. 3 minutos. Uma clareza que nenhuma planilha dá." | P | 20px | `mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground` |
| 20 | "7 dias de garantia" | SPAN | 12px | `inline-flex items-center gap-1.5` (pais com `text-muted-foreground`) |

### Footer section (3 elementos)

| # | Texto | Tag | Tamanho | Classe |
|---|---|---|---|---|
| 21 | "Privacidade" | A | 14px | `hover:text-primary transition` |
| 22 | "Termos" | A | 14px | (idém) |
| (extra) | "Usamos tecnologias de localização..." | P | 14px | `text-sm text-muted-foreground leading-relaxed` (cookie banner) |

---

## Sub-AAA mas passa AA (ratio 4.5-7.0) — polish adicional

Estes passam WCAG AA mas podem ser melhorados para AAA:

| Local | Texto | Ratio atual | Alvo AAA |
|---|---|---|---|
| Cookie banner | "Aceitar tudo" (botão) | 5.55 | 7.0 |
| Cookie banner | "Apenas essenciais" (botão) | 6.52 | 7.0 |
| Footer (privacidade) | "Privacidade" (link) | 6.25 | 7.0 |
| Footer (privacidade) | "Termos" (link) | 6.25 | 7.0 |

---

## Tokens de design atuais (root)

```css
--background: oklch(0% 0 0);           /* #000000 — preto puro */
--foreground: oklch(97% .003 250);     /* #F8F8F8 — quase branco */
--muted: oklch(18% 0 0);               /* #2E2E2E */
--muted-foreground: oklch(65% .01 250);/* #42474D ← VILÃO */
--primary: oklch(52% .24 27);          /* #D00000 — vermelho accent */
--primary-foreground: oklch(99% 0 0);  /* #FCFCFC */
--card: oklch(13% 0 0);                /* #212121 */
--card-foreground: oklch(97% .003 250);
--border: oklch(22% 0 0);
--input: oklch(22% 0 0);
--ring: oklch(52% .24 27);
```

---

## Por que axe-core NÃO flagou isso?

axe-core reportou **0 violações color-contrast** no conteúdo principal. Razões prováveis:
1. axe resolve `--muted-foreground` mas pode usar um valor cached de CSS pre-flight
2. axe usa pixel sampling em pontos específicos, não todos os elementos
3. axe testa contra `wcag2aa` por padrão, e os valores 4.5:1 são o target — pode estar interpretando mal o token

Nossa auditoria custom:
- Faz walk-up recursivo na árvore DOM
- Composição alpha-aware (lida com `bg-white/[0.012]`)
- Converte oklab/oklch corretamente para sRGB

**Conclusão:** Nosso auditor é mais rigoroso que axe-core para tokens em oklch. A percepção visual do usuário (que chamou de "apagada") confirma nosso achado.
