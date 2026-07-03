## Plano — Refinamento Premium do Exit-Intent Modal

Escopo: apenas `src/components/sales/v3/ExitIntentModal.tsx` (visual/UX). Sem tocar em i18n, sem tocar no call-site, sem mudar cor (segue `--arch-primary` dinâmico).

---

### 1. Fonte do título → Inter
- Trocar `font-display` (Syne) por `font-sans` (Inter) no `<h2>`.
- Ajustar peso para `font-semibold` (600) e `tracking-tight` — Inter em 800 fica pesado demais; 600 com tracking negativo dá o ar editorial/clínico que o resto do modal pede.
- Levemente reduzir tamanho máximo: `clamp(22px, 4.6vw, 30px)` para respirar melhor com Inter.

### 2. Logo sem círculo, maior
- Remover o `<span>` do anel (borda `inset-2 rounded-full`).
- Manter o halo (glow radial) — sem ele a logo fica flutuando no vazio; posso reduzir intensidade se preferir.
- Aumentar container: `h-[92px]→h-[120px]` mobile, `h-[108px]→h-[140px]` desktop.
- Aumentar imagem: `72/86px → 100/120px`.

### 3. CTA centralizado
- O botão já é `w-full`. "Centralizar" = centralizar o **conteúdo interno** (texto + seta), que hoje fica visualmente à esquerda por causa do `gap-2` + seta na direita.
- Solução: `justify-center` já está; envolver `<span>{cta}</span><ArrowRight/>` mantém centro do grupo. Confirmar que não há padding assimétrico. Se o desejo for CTA mais estreito (não `w-full`), aplicar `max-w-xs mx-auto` — vou por esta rota, fica mais premium e menos "form-like".

### 4. Melhorias gerais premium (conversão + acabamento)

**Hierarquia visual**
- Adicionar micro-divisor entre header strip e corpo: linha 1px com gradient horizontal que fade nas bordas — separa o "sistema" do "conteúdo humano".
- Aumentar respiro entre título e progress bars (agora `mt-5` → `mt-6`) para dar peso ao título.

**Sunk cost mais tangível**
- Nas progress bars, adicionar micro-label acima do bloco: `TEU DOSSIÊ` (mono, 9px, tracking largo) — enquadra visualmente os 2 medidores como uma unidade coesa "dossiê pessoal", não 2 barras soltas.
- Barra "Análise 100%": adicionar um mini-tick ✓ pulsante no final (indica conclusão real, não só cor).
- Barra "Protocolo 0%": adicionar shimmer sutil na track vazia (indica potencial não desbloqueado).

**Losses (perdas) — impacto**
- Trocar os `✗` por ícones `MinusCircle` (Lucide) menores em outline — mais clínico, menos "erro genérico".
- Adicionar hover row: `hover:bg-white/[0.03]` com `transition` — micro-tátil, aumenta engagement.

**CTA — força**
- Aumentar CTA: `py-4 → py-[18px]` e `text-sm → text-[15px]`.
- Adicionar micro-glow pulsante contínuo (2 shadows: outer soft + inner rim) — sinaliza ação primária sem virar "spam blink".
- Seta: `ArrowRight` → `w-4 h-4` com `translate-x` de 2px no hover do botão (já tem hover lift; empilha).
- Adicionar linha acima do CTA: 3 mini-badges inline horizontais `Acesso imediato · Garantia 7 dias · Sem recorrência` — o `guarantee` atual fica abaixo do CTA duplicando; melhor: mover microtext PARA CIMA como reassurance pré-decisão, e abaixo do CTA colocar apenas 1 linha curta tipo `Encriptação SSL · Pagamento seguro Stripe` (trust signal técnico).

**Footer / decline**
- Adicionar pequeno separador `·` visual + um secondary microtext: `Podes voltar mais tarde, mas o teu diagnóstico expira em 10 min.` — reforça scarcity no ponto de dismissal (última chance de fricção).

**Motion refinements**
- Stagger na entrada: header (0ms) → logo (80ms) → chip (160ms) → título (200ms) → body (260ms) → bars (320ms) → losses (400ms) → CTA (480ms). Usar `animation-delay` em keyframes ou wrapper com `style={{animationDelay}}`.
- Reduzir shimmer do CTA de 3.2s → 4.5s (menos frenético, mais luxo).

**Detalhes finais**
- Aumentar border-radius do card: `rounded-3xl → rounded-[28px]` (custom, feel mais tailored).
- Adicionar sutil ruído (noise texture) já existe — aumentar opacity de `0.05 → 0.07`.
- Corner brackets: reduzir tamanho `w-4 h-4 → w-3 h-3` e slower pulse (2.4s → 3.6s) — menos distração, mais elegante.

---

### Arquivos a editar
- `src/components/sales/v3/ExitIntentModal.tsx` — único arquivo alterado.

### O que NÃO muda
- Cor (segue arquétipo dinâmico)
- i18n / copy structure
- Call-site em `SalesPageV2.tsx`
- Comportamento (focus trap, esc, countdown, backdrop click)
- Estrutura de props

Confirma que posso executar?
