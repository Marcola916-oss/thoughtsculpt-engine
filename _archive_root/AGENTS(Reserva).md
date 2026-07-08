## 🎯 REGRAS COMPORTAMENTAIS — Como o Agente Deve Agir

### Tradução de comandos não-técnicos

| Você diz | O agente faz |
|---|---|
| "deixa mais profissional" | Abre Chrome DevTools → inspeciona a seção inteira → identifica TODOS os problemas de uma vez (contraste, espaçamento, hierarquia, micro-interações ausentes) → corrige tudo em uma resposta |
| "está feio" / "parece amador" | Mesmo processo acima |
| "arruma isso" / "conserta" | Lê os arquivos relevantes → identifica causa raiz → corrige |
| "não está funcionando" | Verifica console errors + network + Supabase logs → identifica causa → corrige |
| "adiciona X" | Implementa feature completa: frontend + Supabase (schema + RLS + index) + Edge Function se necessário + TypeScript types + i18n nos 5 idiomas |
| "melhora esse texto" | Reescreve com copy de conversão para fintech-behavioral — nunca genérico, nunca tradução literal |
| "deixa mais rápido" | Identifica bottlenecks: bundle size, lazy loading, cache → otimiza |
| "faz uma arte" | Aplica brand tokens do SKILL.md + micro-interações obrigatórias + animações premium. Entrega como se fosse feito por uma empresa de 1000 pessoas |

### Padrões de qualidade OBRIGATÓRIOS antes de entregar qualquer coisa

1. `npm run build` deve passar — zero novos erros
2. TypeScript: zero novos erros (os 2 pré-existentes em `onboarding.tsx:192` e `obrigado.tsx:329` são aceitos)
3. Responsivo: funciona em 375px (mobile) e 1440px (desktop)
4. Contraste WCAG AA verificado
5. Micro-interações aplicadas conforme seção "Micro-interações" do SKILL.md
6. RTL verificado para qualquer componente que afete o idioma árabe

### Regras inegociáveis

1. **Nunca entregar código incompleto** — proibido: TODO, "complete this", "add your logic here", placeholders
2. **Resolver tudo em uma resposta** — não um problema por vez, não "veja se funcionou e me avisa"
3. **Nunca pular RLS** — toda tabela Supabase obrigatoriamente com Row Level Security
4. **Nunca hardcodar secrets** — STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY só em Edge Functions via Secrets
5. **Nunca usar localStorage** — Lovable roda em iframe sandboxed; usar state em memória ou Supabase
6. **Sempre aplicar micro-interações** — botão CTA: hover translateY(-2px)+glow, click scale(0.97). Sem micro-interação = entrega rejeitada
7. **RTL para árabe** — usar margin-inline-start/end, nunca margin-left/right
8. **Cache de AI generations** — diagnóstico, calendário e relatórios são gerados UMA VEZ. Nunca regenerar sem motivo explícito
9. **Sempre usar Chrome DevTools antes de mexer em componente visual** — ver o estado real antes de mudar qualquer coisa
10. **Ao terminar qualquer tarefa** — rodar `npm run build` e confirmar saída limpa

### Identidade visual — o que "profissional" significa neste projeto

- Canvas: `#000000` puro. Não cinza escuro, não navy — preto absoluto
- Accent: `#CC0000` (vermelho). Usado com parcimônia — só em CTAs, bordas de hover, badges
- Texto principal: `#F5F5F7` — nunca branco puro, nunca cinza médio
- Fontes: Syne 800 para display/hero, Inter para todo o resto
- Superfícies: `#0D0D0D` cards, `#1A1A1A` elevated
- O MarbleBust é a identidade central da marca — presente em hero, loaders, empty states
- Atmosphere (VolumetricFog + FloatingSymbols + ScanLines) só no hero — nunca em sections de conteúdo
- Cada animação deve ter duração 200-500ms com easing `ease-out` — suave, não brusco

### Quando chamar cada agente

- `@mindreset-ui` → tudo visual: "deixa bonito", "parece amador", "arruma o layout", "faz uma arte"
- `@mindreset-dev` → features e integrações: "adiciona", "implementa", "conecta com Supabase/Stripe"
- `@mindreset-copy` → textos e traduções: "melhora o texto", "reescreve", "traduz para os 5 idiomas"
- `@mindreset-fix` → bugs e erros: "não funciona", "está dando erro", "está quebrando", "página branca"

### Contexto do produto para interpretar pedidos

- MindReset NÃO é app de orçamento — é psicologia comportamental financeira
- Funil: YouTube → Landing page (grátis) → Quiz → Reveal do arquétipo → Compra → Dashboard
- Conversão acontece na landing page e na página de reveal
- Cada elemento visual deve transmitir: "empresa de 1000 pessoas construiu isso"
- Usuário final não é técnico — ele vê resultados, não código