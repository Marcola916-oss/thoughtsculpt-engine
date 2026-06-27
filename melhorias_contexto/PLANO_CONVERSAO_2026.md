# Plano de Conversão MindReset — 2026

> **Objetivo:** Atingir ≥30% de taxa de conversão (quiz → pagamento)
> **Referência:** MINDRESET_GUIA_MESTRE_CONVERSAO.md (6 produtos validados)
> **Criado:** 2026-06-27
> **Status:** PLANEJADO — aguardando implementação

---

## Resumo Executivo

7 PRs organizados por impacto de conversão. O maior ganho está no **PR1 (Reveal)** — ponto emocional máximo do funil.

| PR | Mudança | Impacto Est. | Arquivos |
|----|---------|-------------|----------|
| **PR1** | Reveal cascade 3 linhas + CTA arch-specific | +8-12% conversão | `routes/index.tsx`, `translations.ts` |
| **PR2** | Share card viral + /share route | +10-15% tráfego orgânico | NEW `share/[token]`, `routes/index.tsx`, `analytics.ts` |
| **PR3** | Email gate blur (Zeigarnik) | +5-8% email capture | `routes/index.tsx` |
| **PR4** | Loader 4 steps + [NOME] | +3-5% reveal completion | `NeuralLoader.tsx`, `translations.ts` |
| **PR5** | Upsell pós-compra | +15-25% receita/usuário | `obrigado.tsx`, `translations.ts` |
| **PR6** | Analytics gaps (5 eventos nunca disparados) | medição completa | `index.tsx`, `SalesPageV2.tsx`, `CheckoutStub.tsx` |
| **PR7** | Bug fixes copy/UX | polish | `translations.ts`, `QuizOption.tsx`, `pricing-stub.ts` |

**Impacto total estimado:** Conversão de ~25% para 40-50%, receita +15-25%, tráfego orgânico +10-15%

---

## PR1: Reveal Emotional Cascade + Arch-Specific CTAs

### Problema
O reveal atual mostra apenas o nome do arquétipo + 2-3 linhas genéricas + CTA "Ver Planos". Não há momento emocional, não há urgência, não há compartilhamento.

### Solução
Implementar **cascata emocional de 3 linhas** por arquétipo (referência: 16Personalities):

1. **Crescimento** — "O teu cérebro foi programado para [padrão positivo do arquétipo]"
2. **Custo Oculto** — "Mas esse mesmo padrão está a custar-te [consequência negativa]"
3. **Expansão** — "Quando dominas isso, podes [transformação]"

### Copy por Arquétipo

**AO (Accumulator Obsessive):**
- Crescimento: "O teu cérebro foi programado para proteger o que tens com eficiência extraordinária."
- Custo Oculto: "Mas esse mesmo padrão está a impedir-te de crescer — estás a trocar segurança por liberdade."
- Expansão: "Quando dominas isso, podes construir riqueza sem medo, sem culpa, sem limite."

**SS (Status Seeker):**
- Crescimento: "O teu cérebro foi programado para te tornar visível, magnetizar atenção e criar impacto."
- Custo Oculto: "Mas esse mesmo padrão está a drenar o teu bolso — estás a comprar aprovação que já tens dentro."
- Expansão: "Quando dominas isso, podes ser admirado pelo que és, não pelo que compras."

**EA (Escapist/Alienated):**
- Crescimento: "O teu cérebro foi programado para te proteger da ansiedade evitando o desconforto."
- Custo Oculto: "Mas esse mesmo padrão está a criar uma bomba-relógio — o dinheiro que não vês não desaparece, acumula-se."
- Expansio: "Quando dominas isso, podes confrontar qualquer tema financeiro com calma e clareza."

**HI (Hedonist Impulsive):**
- Crescimento: "O teu cérebro foi programado para viver intensamente, aproveitar oportunidades e sentir tudo."
- Custo Oculto: "Mas esse mesmo padrão está a sabotar o teu futuro — o prazer de hoje é a dor de amanhã."
- Expansão: "Quando dominas isso, podes享受 a vida sem destruir o teu futuro financeiro."

### CTA Específico por Arquétipo

| Arquétipo | CTA Button | Cor |
|-----------|-----------|-----|
| AO | "Quero Proteger o Meu Futuro" | #1e3a5f (azul) |
| SS | "Quero Dominar o Meu Estilo" | #b8860b (dourado) |
| EA | "Quero Enfrentar Sem Medo" | #6b21a8 (roxo) |
| HI | "Quero Viver sem Culpa" | #ea580c (laranja) |

### Componente: RevealCascade

```tsx
// Adicionar em routes/index.tsx, seção reveal (stages 10-11)
function RevealCascade({ archetype, name }: { archetype: Archetype; name: string }) {
  const cascade = useCascade(archetype); // hook custom
  return (
    <Reveal.Group stagger="fast">
      <Reveal variant="fade-up">
        <p className="text-foreground/70 text-lg">{cascade.crescimento}</p>
      </Reveal>
      <Reveal variant="fade-up">
        <p className="text-destructive text-lg font-medium">{cascade.custo_oculto}</p>
      </Reveal>
      <Reveal variant="fade-up">
        <p className="text-foreground text-xl font-bold">{cascade.expansao}</p>
      </Reveal>
    </Reveal.Group>
  );
}
```

### CTA Component: ArchSpecificCTA

```tsx
function ArchSpecificCTA({ archetype, onClick }: { archetype: Archetype; onClick: () => void }) {
  const cta = useArchCTA(archetype); // hook custom
  return (
    <button
      onClick={onClick}
      className="..."
      style={{ backgroundColor: cta.color }}
    >
      {cta.label}
    </button>
  );
}
```

### Hooks: useCascade + useArchCTA

```typescript
// Adicionar em src/hooks/use-archetype-cascade.ts
export function useCascade(archetype: Archetype) {
  const { t } = useLanguage();
  return {
    crescimento: t(`reveal.cascade.${archetype}.crescimento`),
    custo_oculto: t(`reveal.cascade.${archetype}.custo_oculto`),
    expansao: t(`reveal.cascade.${archetype}.expansao`),
  };
}

export function useArchCTA(archetype: Archetype) {
  const { t } = useLanguage();
  const ctaMap = {
    AO: { label: t('reveal.cta.AO'), color: '#1e3a5f' },
    SS: { label: t('reveal.cta.SS'), color: '#b8860b' },
    EA: { label: t('reveal.cta.EA'), color: '#6b21a8' },
    HI: { label: t('reveal.cta.HI'), color: '#ea580c' },
  };
  return ctaMap[archetype];
}
```

### Chaves de Tradução (5 idiomas)

Adicionar em `src/lib/i18n/translations.ts`:

```typescript
// PT
reveal: {
  cascade: {
    AO: {
      crescimento: "O teu cérebro foi programado para proteger o que tens com eficiência extraordinária.",
      custo_oculto: "Mas esse mesmo padrão está a impedir-te de crescer — estás a trocar segurança por liberdade.",
      expansao: "Quando dominas isso, podes construir riqueza sem medo, sem culpa, sem limite.",
    },
    SS: {
      crescimento: "O teu cérebro foi programado para te tornar visível, magnetizar atenção e criar impacto.",
      custo_oculto: "Mas esse mesmo padrão está a drenar o teu bolso — estás a comprar aprovação que já tens dentro.",
      expansao: "Quando dominas isso, podes ser admirado pelo que és, não pelo que compras.",
    },
    EA: {
      crescimento: "O teu cérebro foi programado para te proteger da ansiedade evitando o desconforto.",
      custo_oculto: "Mas esse mesmo padrão está a criar uma bomba-relógio — o dinheiro que não vês não desaparece, acumula-se.",
      expansao: "Quando dominas isso, podes confrontar qualquer tema financeiro com calma e clareza.",
    },
    HI: {
      crescimento: "O teu cérebro foi programado para viver intensamente, aproveitar oportunidades e sentir tudo.",
      custo_oculto: "Mas esse mesmo padrão está a sabotar o teu futuro — o prazer de hoje é a dor de amanhã.",
      expansao: "Quando dominas isso, podes viver a vida sem destruir o teu futuro financeiro.",
    },
  },
  cta: {
    AO: "Quero Proteger o Meu Futuro",
    SS: "Quero Dominar o Meu Estilo",
    EA: "Quero Enfrentar Sem Medo",
    HI: "Quero Viver sem Culpa",
  },
},
```

### Acceptance Criteria

- [ ] Reveal mostra 3 linhas com cascata emocional
- [ ] CTA muda cor e texto por arquétipo
- [ ] Transição suave entre as 3 linhas (stagger)
- [ ] RTL funciona para árabe
- [ ] `trackRevealInteraction('share_clicked')` funciona
- [ ] `npm run build` passa

---

## PR2: Share Card + Viral Mechanics

### Problema
- **NÃO EXISTE** rota `/share/[token]`
- **NÃO EXISTE** botão de compartilhar no reveal
- `trackShare()` nunca é chamado do frontend
- Não há geração de share card para redes sociais
- MindReset não tem mecânica de crescimento orgânico

### Solução

#### 2A. Share Button no Reveal

Adicionar botão "Compartilhar Resultado" após o CTA:

```tsx
// Em routes/index.tsx, seção reveal
<button
  onClick={handleShare}
  className="border border-border rounded-lg px-4 py-2 text-sm"
>
  <Share2 className="w-4 h-4 mr-2" />
  {t('reveal.share')}
</button>
```

#### 2B. Share Card Generation (Canvas API)

Criar `src/components/share/ShareCard.tsx`:

```tsx
// Gera imagem 1080x1920 para redes sociais
// Arquétipo + nome do usuário + frases motivacionais
// Salva como blob → download
```

#### 2C. Share Page `/share/[token]`

Criar `src/routes/share/[token].tsx`:

- Busca dados do `viral_shares` por token
- Mostra arquétipo, nome, frase motivacional
- CTA: "Faz o teu quiz agora" → redireciona para `/`
- Incrementa `views_count`

#### 2D. Analytics

```typescript
// Adicionar em analytics.ts
trackShare: (method: 'card' | 'link') => {
  posthog.capture('share_clicked', { method });
},
trackShareView: (token: string, archetype: string) => {
  posthog.capture('share_viewed', { token, archetype });
},
```

### Acceptance Criteria

- [ ] Botão "Compartilhar" aparece no reveal
- [ ] Share card é gerada via Canvas API (1080x1920)
- [ ] Share card faz download automaticamente
- [ ] `/share/[token]` renderiza dados do viral_shares
- [ ] Views são incrementadas
- [ ] Analytics: `share_clicked` e `share_viewed` são disparados

---

## PR3: Email Gate Blur (Zeigarnik Effect)

### Problema
O email gate atual mostra o email + checkbox GDPR sem nenhuma prévia do resultado. O efeito Zeigarnik (desejo de completar tarefa incompleta) não é explorado.

### Solução

Adicionar **preview borrado do arquétipo** antes do campo de email:

```tsx
// Em routes/index.tsx, seção email gate (stage 8)
<div className="relative">
  {/* Preview borrado */}
  <div className="blur-sm opacity-50 pointer-events-none">
    <h2 className="text-2xl font-bold text-foreground">
      {quizAnswers.name}, o teu arquétipo é...
    </h2>
    <div className="h-8 bg-muted rounded animate-pulse" />
  </div>

  {/* Overlay */}
  <div className="absolute inset-0 flex items-center justify-center">
    <p className="text-foreground/70 text-sm">
      {t('email_gate.blur_hint')}
    </p>
  </div>
</div>
```

### Chaves de Tradução

```typescript
email_gate: {
  blur_hint: "Insere o teu email para desbloquear o teu resultado completo",
  // ... resto das chaves existentes
},
```

### Acceptance Criteria

- [ ] Preview borrado do arquétipo aparece antes do email
- [ ] Texto "Insere o teu email para desbloquear" visível
- [ ] Após email, preview é revelado com animação
- [ ] `trackEmailGate('blur_shown')` funciona

---

## PR4: Loader 4 Steps + [NOME]

### Problema
Loader atual tem 3 textos. O guia de conversão recomenda 4 passos com progressão emocional + `[NOME]` no último para aumentar antecipação.

### Solução

#### 4A. 4 Textos por Arquétipo

| Step | Emoção | Exemplo AO |
|------|--------|-----------|
| 1 | Reconhecimento | "A analisar o teu perfil financeiro, {name}..." |
| 2 | Profundidade | "A identificar os padrões ocultos no teu comportamento..." |
| 3 | Personalização | "A gerar o teu protocolo personalizado..." |
| 4 | Antecipação | "Quase pronto, {name}... o teu resultado está pronto!" |

#### 4B. Mudanças em NeuralLoader.tsx

```typescript
// Em NeuralLoader.tsx
const STEPS = [
  { text: t('loader.step1'), duration: 700 },
  { text: t('loader.step2'), duration: 700 },
  { text: t('loader.step3'), duration: 700 },
  { text: t('loader.step4'), duration: 600 }, // 2700ms total
];
```

#### 4C. Chaves de Tradução

```typescript
loader: {
  step1: "A analisar o teu perfil financeiro, [NOME]...",
  step2: "A identificar os padrões ocultos no teu comportamento...",
  step3: "A gerar o teu protocolo personalizado...",
  step4: "Quase pronto, [NOME]... o teu resultado está pronto!",
  // ... resto
},
```

### Acceptance Criteria

- [ ] Loader tem 4 textos (não 3)
- [ ] [NOME] é substituído no último step
- [ ] Progressão emocional: reconhecimento → profundidade → personalização → antecipação
- [ ] Timer total ~2.7s (não 3s)

---

## PR5: Post-Purchase Upsell on Obrigado

### Problema
A página obrigado atual mostra confetti + PDF + email delivery + verify. **Não há upsell.** O guia de conversão recomenda "Protocolo de 30 Dias +$14" para +15-25% receita/usuário.

### Solução

Adicionar **UpsellCard** após o confetti (2s delay):

```tsx
// Em obrigado.tsx, após confetti
const [showUpsell, setShowUpsell] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setShowUpsell(true), 2000);
  return () => clearTimeout(timer);
}, []);

// ...
{showUpsell && (
  <UpsellCard
    archetype={archetype}
    name={name}
    onAccept={handleUpsellAccept}
    onDecline={handleUpsellDecline}
  />
)}
```

### UpsellCard Component

```tsx
function UpsellCard({ archetype, name, onAccept, onDecline }) {
  return (
    <Reveal variant="fade-up">
      <div className="border border-accent rounded-xl p-6 bg-card">
        <h3>{t('upsell.title')}</h3>
        <p className="text-foreground/70">{t('upsell.description')}</p>
        <div className="flex gap-4 mt-4">
          <button onClick={onAccept} className="bg-primary text-white px-6 py-3 rounded-lg">
            {t('upsell.cta')}
          </button>
          <button onClick={onDecline} className="text-muted-foreground text-sm">
            {t('upsell.decline')}
          </button>
        </div>
      </div>
    </Reveal>
  );
}
```

### Chaves de Tradução

```typescript
upsell: {
  title: "Protocolo de 30 Dias — Apenas +$14",
  description: "Recebe um plano diário personalizado com tarefas reflexivas e de ação para os próximos 30 dias.",
  cta: "Adicionar Protocolo +$14",
  decline: "Agora não, obrigado",
},
```

### Acceptance Criteria

- [ ] Upsell aparece 2s após confetti
- [ ] Preço correto por moeda ($14 USD, €12 EUR, etc.)
- [ ] Aceitar → redireciona para checkout com upsell
- [ ] Recusar → mantém na página atual
- [ ] `trackUpsell('viewed')` e `trackUpsell('accepted')` funcionam

---

## PR6: Analytics Gap Fixes

### Problema
5 eventos definidos em `analytics.ts` mas **NUNCA disparados**:

| Evento | Onde deveria ser disparado | Status |
|--------|--------------------------|--------|
| `purchase_completed` | `obrigado.tsx` (verifyPayment) | ❌ Nunca chamado |
| `upsell_view` | `obrigado.tsx` (showUpsell) | ❌ Nunca chamado |
| `upsell_accepted` | `obrigado.tsx` (handleUpsellAccept) | ❌ Nunca chamado |
| `exit_intent_recovered` | `ExitIntentModal.tsx` (recover) | ❌ Nunca chamado |
| `vsl_scroll_depth` | `HeroScene.tsx` (scroll) | ❌ Nunca chamado |

### Soluções

#### 6A. purchase_completed

```typescript
// Em obrigado.tsx, após verifyPayment sucesso
analytics.track('purchase_completed', {
  amount: payment.amount,
  currency: payment.currency,
  plan: payment.plan,
  archetype,
});
```

#### 6B. upsell_view + upsell_accepted

```typescript
// Em obrigado.tsx
analytics.track('upsell_view', { archetype, price: upsellPrice });
analytics.track('upsell_accepted', { archetype, price: upsellPrice });
```

#### 6C. exit_intent_recovered

```typescript
// Em ExitIntentModal.tsx
analytics.track('exit_intent_recovered', { archetype });
```

#### 6D. vsl_scroll_depth

```typescript
// Em HeroScene.tsx
const [maxScroll, setMaxScroll] = useState(0);
useEffect(() => {
  const handleScroll = () => {
    const depth = Math.round((window.scrollY / document.body.scrollHeight) * 100);
    if (depth > maxScroll) setMaxScroll(depth);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [maxScroll]);

// Ao sair da página
useEffect(() => {
  return () => {
    analytics.track('vsl_scroll_depth', { max_depth: maxScroll });
  };
}, [maxScroll]);
```

### Acceptance Criteria

- [ ] Todos os 5 eventos são disparados no momento correto
- [ ] Dados corretos em cada evento
- [ ] PostHog recebe os eventos
- [ ] Supabase recebe os eventos (via edge function)

---

## PR7: Copy/UX Bug Fixes

### 7A. PL/RO "14 questions" → "8 questions"

```typescript
// Em translations.ts, PL
hero: {
  kicker: "Responde a 8 perguntas rápidas e descobre o teu padrão oculto",
  // ...
},

// RO
hero: {
  kicker: "Răspunde la 8 întrebări rapide și descoperă modelul tău ascuns",
  // ...
},
```

### 7B. b7.price hardcoded "$47"

```typescript
// Em translations.ts, PT
b7: {
  price: t('checkout.b7_local_price'), // Dinâmico por moeda
  // ...
},
```

### 7C. QuizOption hover colors

```typescript
// Em QuizOption.tsx
// ATUAL: hover:bg-white/5
// MUDAR para: hover:bg-[#CC0000]/10 hover:border-[#CC0000]
```

### 7D. Gender concordance

```typescript
// Em routes/index.tsx
// ATUAL: q.q.replace("[NOME]", props.name)
// ADICIONAR: concordância de gênero em frases como "tu és" / "tu és"
```

### Acceptance Criteria

- [ ] PL/RO diz "8 perguntas" (não "14")
- [ ] b7.price é dinâmico por moeda
- [ ] QuizOption hover usa vermelho (#CC0000)
- [ ] Gender concordance funciona em PT

---

## Grafo de Dependências

```
PR7 (bug fixes) ───→ PR1 (reveal cascade) ───→ PR2 (share card)
                                                    ↓
PR4 (loader) ───→ PR3 (email gate)          PR5 (upsell)
                                                    ↓
                                          PR6 (analytics)
```

**Ordem recomendada:** PR7 → PR4 → PR3 → PR1 → PR2 → PR5 → PR6

**Justificativa:** PR7 corrige bugs básicos que afetam todas as outras mudanças. PR4 e PR3 são independentes. PR1 depende de PR7 (copy correta). PR2 depende de PR1 (share button no reveal). PR5 é independente. PR6 é o último (medição).

---

## Checklist de Verificação

### Antes de cada PR:
- [ ] `npm run build` passa
- [ ] `npx tsc --noEmit` sem erros novos
- [ ] `npx eslint src` sem erros novos

### Após cada PR:
- [ ] Smoke test Playwright: quiz → reveal → checkout → obrigado
- [ ] RTL funciona (árabe)
- [ ] Contraste WCAG AA verificado
- [ ] Analytics events são disparados
- [ ] Mobile (375px) funciona
- [ ] Desktop (1440px) funciona

### Após todos os PRs:
- [ ] Conversão ≥30% (medir via PostHog)
- [ ] Receita por usuário +15-25%
- [ ] Tráfego orgânico +10-15% (compartilhamentos)
- [ ] Todos os 26 analytics events funcionando
- [ ] Zero erros de build

---

## Referências

- **MINDRESET_GUIA_MESTRE_CONVERSAO.md** — guia completo com 6 produtos validados
- **SKILL.md** — brand tokens, micro-interações, acessibilidade
- **AGENTS.md** — regras comportamentais e convenções
