---
name: mindreset-builder
description: >
  MindReset SaaS — referência completa. Product identity, quiz funnel, database schema,
  Stripe billing, OpenAI prompts, brand tokens, componentes, i18n, deployment e convenções.
  Use ao construir, modificar, debugar ou expandir qualquer parte do MindReset SaaS.
  Stack: React + TypeScript + Tailwind (Lovable), Supabase, Stripe, OpenAI API.
  NÃO usar para projetos não relacionados.
when_to_use: "Ao trabalhar no MindReset: quiz funnel, onboarding, dashboard, Supabase schema, Stripe billing, OpenAI integration, gamificação, retenção, design system, localização, deployment ou qualquer componente. NÃO para tarefas genéricas."
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash, Skill]
effort: medium
---

# MindReset — Referência Completa do SaaS

> SaaS de finanças comportamentais multi-locale. TanStack Start + Vite + Tailwind + Supabase + Lovable.

---

## PRODUCT IDENTITY

**MindReset** é um SaaS de finanças comportamentais. Diagnostica o arquétipo financeiro do usuário via quiz e entrega um protocolo de ação personalizado gerado por IA (calendário, diagnóstico, ferramenta de relacionamento, tracker de progresso). NÃO rastreia orçamentos nem conecta a contas bancárias. Trabalha psicologia primeiro, depois ação.

**4 Arquétipos:**
- AO (Accumulator Obsessive) — medo de escassez, poupança compulsiva
- SS (Status Seeker) — gasta por aprovação social, compra identidade
- EA (Escapist/Alienated) — evita tema dinheiro, usa gastos como fuga
- HI (Hedonist Impulsive) — vive o agora, decisões por impulso emocional

**4 Áreas do App:**
1. **Meu Diagnóstico** — análise psicológica 4 dimensões gerada por IA (financeira, profissional, romântica, pessoal)
2. **Matriz de Ação** — calendário diário personalizado gerado por IA (30d / 6m / 1y)
3. **Compass** — ferramenta para analisar arquétipos de outras pessoas e obter estratégias de relacionamento
4. **Progresso** — dashboard gamificado (pontos, streak, achievements, relatórios mensais)

**Mercados-alvo:** Poland (PLN) • Romania (RON) • Saudi Arabia (SAR) • Global (USD/EUR)

---

## TECH STACK

| Tool | Papel | Notas |
|------|-------|-------|
| Lovable.dev | React + TypeScript + Tailwind frontend | Usar componentes Shadcn/UI |
| Supabase | PostgreSQL + Auth + Storage + Edge Functions | RLS OBRIGATÓRIO em TODAS as tabelas |
| OpenAI API | gpt-4o para Diagnóstico • gpt-4o-mini para Calendário, Compass, Relatórios | Cache todos os resultados — nunca regenerar |
| Stripe | Assinaturas recorrentes + webhooks + Customer Portal | Smart Retries habilitado |
| ipapi.co | Geolocalização por IP para detecção de idioma + moeda | Tier gratuito: 30k/dia, sem chave |
| Vercel / Netlify | Hospedagem frontend | Auto-deploy do GitHub do Lovable |

**Variáveis de Ambiente (Settings → Secrets — NUNCA hardcode):**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # Edge Functions apenas
OPENAI_API_KEY                     # Edge Functions apenas
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY                  # Edge Functions apenas
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_STRIPE_30D_PLN / RON / SAR / USD / EUR
NEXT_PUBLIC_STRIPE_6M_PLN / RON / SAR / USD / EUR
NEXT_PUBLIC_STRIPE_1Y_PLN / RON / SAR / USD / EUR
```

---

## ESTRUTURA DE ARQUIVOS

```
src/
├── routes/
│   ├── __root.tsx          # Root layout, favicon, SEO meta, LD+JSON
│   ├── index.tsx           # Landing + Quiz + Sales (stage machine)
│   ├── obrigado.tsx        # Página de resultado / thank you
│   └── _authenticated/     # Rotas do dashboard (onboarding, dashboard, settings, etc.)
├── components/
│   ├── landing/            # ProofBar, ArchetypeShowcase, HowItWorks, FeaturesGrid, Testimonials, FAQ, FinalCTA
│   ├── quiz/               # QuizOption, NeuralLoader
│   ├── identity/           # MarbleBust, BustLoader, IdentitySymbol, BustMini, BustEmptyState
│   ├── atmosphere/         # VolumetricFog, FloatingSymbols, ScanLines, Atmosphere
│   ├── interaction/        # ArchetypeHover, MagneticCursor, Reveal, ButtonPress
│   └── dashboard/          # Sidebar, charts, etc.
├── lib/
│   ├── i18n/
│   │   ├── LanguageProvider.tsx  # Language context + <html lang> + dir="rtl" para AR
│   │   ├── translations.ts      # 5 locales (PT 215-274, EN 517-623, PL 851-970, RO 995-1066, AR 1090-1163)
│   │   └── types.ts             # Tipo Dict
│   ├── utils.ts            # cn() helper (clsx + tailwind-merge)
│   └── animations.ts       # 30+ variantes Framer Motion
├── hooks/
│   └── use-mouse-position.ts
├── styles.css              # Design tokens + Tailwind overrides + animações de fog
└── assets/
    └── favicon.svg         # MindReset "M" vermelho no preto
```

---

## BRAND TOKENS

Todos em `src/styles.css` `:root`:

```css
:root {
  /* Base */
  --background: oklch(0% 0 0);               /* #000000 canvas */
  --foreground: oklch(0.97 0.003 250);       /* #F5F5F7 */
  --card: oklch(0.13 0 0);                   /* #0D0D0D surface */
  --muted: oklch(0.18 0 0);                  /* #1A1A1A elevated */
  --muted-foreground: oklch(0.72 0.005 250); /* #929698 — AA on black */
  --border: oklch(0.24 0 0);                 /* #2A2A2A */

  /* Accent */
  --primary: oklch(0.52 0.24 27);            /* #CC0000 */
  --primary-dark: oklch(0.38 0.22 27);       /* #990000 */
  --accent-glow: oklch(0.52 0.24 27 / 0.35);

  /* Semânticas */
  --success: #22C55E;
  --warning: #F59E0B;

  /* Override por arquétipo */
  --arch-primary: var(--primary);
}
```

**Cores por Arquétipo (override `--arch-primary`):**
| Arquétipo | Cor | Valor |
|-----------|-----|-------|
| AO (Accumulator) | Azul | `oklch(0.64 0.12 210)` |
| SS (Status Seeker) | Dourado | `oklch(0.75 0.12 85)` |
| EA (Essentialist) | Roxo | `oklch(0.7 0.05 280)` |
| HI (Hedonist) | Laranja | `oklch(0.65 0.25 35)` |

### Tipografia
- Display/Hero: Inter ou Syne, 48-64px, weight 800
- Heading 1: Inter, 32-40px, weight 700
- Heading 2: Inter, 24-28px, weight 600
- Body: Inter, 16-18px, weight 400
- Caption: Inter, 12-14px, weight 400-500
- Carregar via: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap`

### Micro-interações (obrigatórias — separa premium do genérico)
- **Botão CTA:** hover=translateY(-2px)+glow, click=scale(0.97) 100ms
- **Checkbox de tarefa:** ao marcar → bounce verde + confete 0.5s
- **Barra de progresso:** `transition: width 0.8s ease-out`
- **Achievement unlock:** scale(0)→scale(1.1)→scale(1) + partículas douradas 1.5s
- **Streak counter:** animação roll-up (translateY(-100%)→0)
- **Dashboard cards:** hover → borda vira vermelho + translateY(-4px)
- **Quiz loader:** anel vermelho girando + textos fade a cada 0.7s
- **Reveal do diagnóstico:** nome do arquétipo typewriter (1 char/50ms)
- **Link ativo na sidebar:** bg vermelho translúcido + borda esquerda vermelho sólido (3px)

### Estados dos Componentes
| Componente | Default | Hover | Pressed | Disabled |
|------------|---------|-------|---------|----------|
| Primary Button | bg:#CC0000 | bg:#990000+glow | scale(0.97) | opacity:0.4 |
| Input | border:#2A2A2A | border:#555 | border:#CC0000 | opacity:0.5 |
| Card | bg:#0D0D0D | border:red+translateY(-4px) | scale(0.99) | opacity:0.6 |
| Quiz Option | border:#2A2A2A | border:red+red-bg | darker-red-bg | — |

### Regras Mobile-First
- Viewport: `width=device-width, initial-scale=1, maximum-scale=1`
- Touch targets: mínimo 44x44px
- Sidebar: recolhida por padrão no mobile, abre como drawer com overlay
- Grade de planos: 1 coluna mobile, 3 colunas desktop
- Opções do quiz: 100% largura no mobile
- Texto mínimo no body: 16px (previne auto-zoom do iOS nos inputs)
- Usar `safe-area-inset-bottom` para o indicador home do iPhone

---

## LANDING PAGE (9 seções)

Ordem em `src/routes/index.tsx` linhas 184-194:

1. **Hero** — headline + CTA + badges flutuantes dos arquétipos + fundo com glow vermelho
2. **ProofBar** — 4 métricas de confiança (diagnósticos, avaliação, sem banco, idiomas)
3. **ArchetypeShowcase** — 4 cards de arquétipo (AO/SS/EA/HI) com ícones + descrições
4. **HowItWorks** — processo em 3 passos com setas
5. **FeaturesGrid** — grade 2×2 (Diagnóstico, Compass, Calendário, Progresso)
6. **Testimonials** — 3 cards de review com avatares
7. **FAQ** — acordeão (6 itens, abertura única)
8. **FinalCTA** — headline + garantia + CTA

**Cortina:** Seções 2-8 envoltas em `<div className="relative z-10 bg-background/80 backdrop-blur-md">` para evitar sangramento do fog vermelho.

---

## QUIZ FUNNEL

### State Machine (`index.tsx`)
```
hero → identity → questions → email → loader → reveal → /obrigado
```

| Tela | Nome | Comportamento |
|------|------|---------------|
| 0 | Identity | Nome + gênero na mesma tela. Salvar no state. |
| 1-8 | Questions | Uma por tela. Usar placeholder [NOME]. Auto-avança na seleção. |
| 9 | Email Capture | Campo de email + checkbox GDPR (obrigatório). Salvar em quiz_leads ANTES de mostrar resultado. |
| 10 | Loader | 3 segundos. NeuralLoader com animação Brain → MarbleBust. Sem chamada real à API. |
| 11 | Reveal | Nome do arquétipo typewriter. 2-3 linhas de impacto. CTA vermelho. |
| 12 | Sales Page | Sales page longa completa (9 blocos). |
| 13 | Plans | Grade de 3 planos. Preço local por IP. "MAIS POPULAR" no 6M. |

**Validado:** 1 questão/tela = +30% conversão. Email antes dos resultados = +40% leads. Nome+gênero nas questões = +15-25% conclusão.

**Pontuação de Arquétipo:**
```typescript
// Cada uma das 8 questões: cada resposta = +2 para um arquétipo (AO/SS/EA/HI)
const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
// Desempate: usar resposta da Q8. Se ainda empatado: usar Q5.
```

---

## ARQUITETURA DO BANCO DE DADOS

**REGRA: RLS (Row Level Security) é OBRIGATÓRIO em todas as tabelas. Sem exceções.**

### quiz_leads — armazena todos os que completaram o quiz (incluindo não-compradores)
```sql
CREATE TABLE quiz_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('m','f','n')) NOT NULL,
  archetype TEXT CHECK (archetype IN ('AO','SS','EA','HI')),
  quiz_scores JSONB DEFAULT '{}',
  language TEXT DEFAULT 'en' NOT NULL,
  ip_country TEXT,
  ip_currency TEXT DEFAULT 'USD',
  quiz_completed_at TIMESTAMPTZ DEFAULT NOW(),
  converted BOOLEAN DEFAULT FALSE,
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT
);
ALTER TABLE quiz_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_only" ON quiz_leads USING (false);
```

### users — tabela principal de usuários
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  gender TEXT CHECK (gender IN ('m','f','n')),
  archetype TEXT CHECK (archetype IN ('AO','SS','EA','HI')),
  quiz_scores JSONB DEFAULT '{}',
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark','light')),
  plan_type TEXT CHECK (plan_type IN ('30d','6m','1y')),
  plan_started_at TIMESTAMPTZ,
  features_expires_at TIMESTAMPTZ,
  account_expires_at TIMESTAMPTZ,
  access_level TEXT DEFAULT 'active' CHECK (access_level IN ('active','grace','locked','revoked')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  subscription_status TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  total_extra_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_data" ON users FOR ALL USING (auth_user_id = auth.uid());
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_auth_id ON users(auth_user_id);
```

### diagnoses — diagnósticos gerados por IA
```sql
CREATE TABLE diagnoses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  archetype TEXT NOT NULL,
  financial_analysis TEXT,
  professional_analysis TEXT,
  romantic_analysis TEXT,
  personal_analysis TEXT,
  generation_prompt TEXT,
  model_used TEXT DEFAULT 'gpt-4o',
  tokens_used INTEGER,
  version INTEGER DEFAULT 1,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_diagnoses" ON diagnoses
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));
CREATE INDEX idx_diagnoses_user_id ON diagnoses(user_id);
```

### onboarding_answers — 7 perguntas de calibração
```sql
CREATE TABLE onboarding_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  wake_time TEXT, sleep_time TEXT,
  daily_minutes INTEGER, emotional_trigger TEXT,
  financial_goal TEXT, discipline_style TEXT,
  mobile_os TEXT CHECK (mobile_os IN ('ios','android','none')),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE onboarding_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_onboarding" ON onboarding_answers
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));
```

### calendar_tasks — tarefas diárias personalizadas
```sql
CREATE TABLE calendar_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  scheduled_date DATE,
  reflective_task TEXT, action_task TEXT,
  is_unlocked BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  is_milestone BOOLEAN DEFAULT FALSE,
  notes TEXT,
  UNIQUE(user_id, day_number)
);
ALTER TABLE calendar_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_tasks" ON calendar_tasks
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));
CREATE INDEX idx_tasks_user_day ON calendar_tasks(user_id, day_number);
CREATE INDEX idx_tasks_unlocked ON calendar_tasks(user_id, is_unlocked);
```

### compass_analyses — análises de arquétipo de relacionamento
```sql
CREATE TABLE compass_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_name TEXT NOT NULL,
  relationship_type TEXT CHECK (relationship_type IN ('professional','romantic','family','general')),
  context TEXT, observations TEXT,
  probable_archetype TEXT CHECK (probable_archetype IN ('AO','SS','EA','HI')),
  analysis_content JSONB,
  has_relationship_calendar BOOLEAN DEFAULT FALSE,
  rel_calendar_tasks JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE compass_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_compass" ON compass_analyses
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));
CREATE INDEX idx_compass_user ON compass_analyses(user_id);
```

### user_progress — estado de gamificação
```sql
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,
  tasks_completed INTEGER DEFAULT 0,
  compass_used INTEGER DEFAULT 0,
  calendar_exported BOOLEAN DEFAULT FALSE,
  extra_days_earned INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ
);
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_progress" ON user_progress
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));
```

### achievements — achievements desbloqueados
```sql
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_code TEXT NOT NULL,
  reward_type TEXT CHECK (reward_type IN ('extra_days','extra_compass','extra_report','discount_coupon','temp_premium','extended_limit')),
  reward_value TEXT,
  reward_expires_at TIMESTAMPTZ,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  is_claimed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, achievement_code)
);
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_achievements" ON achievements
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));
```

### daily_limits — anti-abuso para plano de 1 ano
```sql
CREATE TABLE daily_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  generations_count INTEGER DEFAULT 0,
  calendars_count INTEGER DEFAULT 0,
  pdfs_count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);
ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_limits" ON daily_limits
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));
```

### notifications — sistema de notificações in-app
```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL,
  icon TEXT, action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_notifications" ON notifications
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));
CREATE INDEX idx_notif_user_unread ON notifications(user_id, is_read);
```

### monthly_reports — relatórios mensais auto-gerados
```sql
CREATE TABLE monthly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month_number INTEGER NOT NULL,
  consistency_score INTEGER, summary TEXT, pattern_observed TEXT,
  next_focus TEXT, motivational_close TEXT, raw_data JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_number)
);
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_reports" ON monthly_reports
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));
```

### viral_shares — páginas públicas compartilháveis de arquétipo
```sql
CREATE TABLE viral_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  email TEXT NOT NULL, name TEXT NOT NULL, archetype TEXT NOT NULL,
  language TEXT DEFAULT 'en', views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE viral_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_by_token" ON viral_shares FOR SELECT USING (true);
CREATE POLICY "service_insert" ON viral_shares FOR INSERT WITH CHECK (true);
```

---

## REGRAS DE SEGURANÇA

1. **STRIPE_SECRET_KEY** e **SUPABASE_SERVICE_ROLE_KEY** vão APENAS em Edge Functions. Nunca no frontend.
2. Variáveis **NEXT_PUBLIC_*** são seguras para o frontend (apenas chaves públicas).
3. Sempre verificar assinatura de webhooks Stripe com `stripe.webhooks.constructEvent()` antes de processar.
4. Rate limit em Edge Functions: máximo 10 chamadas de IA por IP por minuto.
5. Sanitizar todos os inputs de texto livre antes de enviar ao OpenAI.
6. Sempre chamar `checkAndIncrementLimit()` antes de qualquer geração de IA.

```typescript
// Validação de assinatura do webhook Stripe (Edge Function)
import Stripe from 'https://esm.sh/stripe@14';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response('Webhook signature invalid', { status: 400 });
  }
  switch (event.type) {
    case 'customer.subscription.created': await handleSubscriptionCreated(event); break;
    case 'invoice.payment_succeeded':     await handlePaymentSucceeded(event); break;
    case 'invoice.payment_failed':        await handlePaymentFailed(event); break;
    case 'customer.subscription.deleted': await handleSubscriptionDeleted(event); break;
    case 'charge.refunded':               await handleRefund(event); break;
  }
  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

---

## CONFIGURAÇÃO DO STRIPE

### Tabela de Preços
| Moeda | 30 Dias | 6 Meses | 1 Ano |
|-------|---------|---------|-------|
| PLN | 79 zł | 199 zł | 319 zł |
| RON | 89 lei | 229 lei | 369 lei |
| SAR | 89 ر.س | 229 ر.س | 369 ر.س |
| USD | $22 | $55 | $89 |
| EUR | €20 | €50 | €82 |

Todos os planos = assinaturas recorrentes. Smart Retries: 7 dias. Habilitar Stripe Customer Portal.
Webhook URL: `https://[project].supabase.co/functions/v1/stripe-webhook`

### Eventos do Webhook
| Evento | Ação no Supabase |
|--------|-----------------|
| customer.subscription.created | Criar usuário, definir plan_type + datas de expiração, criar auth.user |
| invoice.payment_succeeded | Renovar datas, definir status='active', inserir notificação |
| invoice.payment_failed | Definir status='past_due', inserir notificação, NÃO bloquear ainda |
| customer.subscription.deleted | Manual → 'revoked'. Não-pagamento → 'locked' |
| charge.refunded | access_level='revoked' imediatamente, invalidar sessão |
| customer.subscription.updated | Atualizar plan_type, recalcular datas |

### Lógica de Datas de Acesso
| Plano | features_expires_at | account_expires_at |
|-------|--------------------|--------------------|
| 30d | compra + 30 dias | compra + 37 dias |
| 6m | compra + 180 dias | compra + 187 dias |
| 1y | compra + 365 dias | compra + 372 dias |

---

## AUTH & ROTEAMENTO

### Mapa de Rotas
| Rota | Auth | Descrição |
|------|------|-----------|
| / | Pública | Quiz completo (telas 0-13) + sales page embutida |
| /share/[token] | Pública | Página viral de compartilhamento de arquétipo |
| /login | Pública | Email + senha APENAS. Sem botões de signup. |
| /reset-password | Pública | Recuperação de senha |
| /dashboard | Privada | Hub: 3 cards + notificações |
| /dashboard/diagnosis | Privada | Diagnóstico IA em 4 abas + PDF + share |
| /dashboard/calendar | Privada | Matriz de ação com drip unlock |
| /dashboard/compass | Privada | Analisar arquétipos de outras pessoas |
| /dashboard/progress | Privada | Dashboard de gamificação |
| /dashboard/settings | Privada | Idioma, tema, plano, cancelamento |
| /onboarding | Privada | 7 perguntas de calibração (apenas no primeiro login) |

### Lógica do Route Guard
```
1. Verificar sessão Supabase → null = redirecionar /login
2. Verificar users.access_level:
   'active'  → acesso normal
   'grace'   → mostrar banner de aviso
   'locked'  → congelar interface + mostrar overlay de upgrade
   'revoked' → logout + redirecionar /login
3. onboarding_completed = false → redirecionar /onboarding
4. features_expires_at < NOW()+3dias → barra de aviso vermelha
   features_expires_at < NOW()      → pointer-events: none no conteúdo
```

---

## PROMPTS OPENAI

### Prompt 1: Diagnóstico Completo (gpt-4o — cache o resultado, nunca regenerar dentro de 30 dias)
```
SYSTEM: You are the psychological analysis engine of MindReset. Generate deep, empathetic, highly personalized analyses. NOT a generic chatbot. Rules: 1) No generic phrases. 2) Use user's name 3+ times per dimension. 3) Correct gender grammar. 4) Tone: empathetic, intelligent. 5) Respond ONLY in valid JSON.

USER: Generate complete diagnosis for:
- Name: {name} | Gender: {gender} | Archetype: {archetype_name} ({archetype_code})
- Quiz scores: {quiz_scores} | Language: {language}

Return JSON: { "financial_analysis": "4 paragraphs", "professional_analysis": "3 paragraphs", "romantic_analysis": "3 paragraphs (gender-adapted)", "personal_analysis": "3 paragraphs" }
```

### Prompt 2: Calendário de Ação (gpt-4o-mini — gerar uma vez, nunca regenerar)
```
SYSTEM: Behavioral calendar engine of MindReset. Create personalized daily plans based on behavioral psychology and stoicism. Respond ONLY as valid JSON array.

USER: Generate {plan_days}-day calendar for {name} | Archetype: {archetype_name} | Language: {language}
Minutes/day: {daily_minutes} | Wake: {wake_time} | Sleep: {sleep_time}
Trigger: {emotional_trigger} | Goal: {financial_goal} | Style: {discipline_style}

PHASES: Days 1-7=Recognition, 8-14=Interruption, 15-21=Substitution, 22-30=Consolidation
MILESTONES (is_milestone:true): Days 7,14,21,30,60,90,120,150,180

Return: [{"day":1,"reflective_task":"...","action_task":"...","is_milestone":false,"phase":"recognition"}]
```

### Prompt 3: Análise Compass (gpt-4o-mini)
```
SYSTEM: COMPASS — behavioral profile analysis based on interpersonal perception. ALWAYS note analysis is based on user's perception, not clinical diagnosis.

USER: Analyze archetype of: {target_name} | Relationship: {relationship_type}
Analyst: {user_name} ({user_archetype}) | Goal: {context} | Observations: {observations} | Language: {language}

Return JSON: { "probable_archetype": "AO|SS|EA|HI", "confidence_level": "high|medium|low", "perception_disclaimer": "...", "archetype_in_context": "2 paragraphs", "dynamic_analysis": "archetype combination tensions/synergies", "interaction_strategies": ["5 strategies"], "communication_script": "example phrase", "what_to_avoid": ["3 traps"] }
```

### Prompt 4: Relatório Mensal (gpt-4o-mini — 1x por mês, servir do DB depois)
```
SYSTEM: Evolutionary report engine of MindReset. Generate reports that make the user feel measurable growth.

USER: Month {month_number} report for {name} | {archetype_name} | {language}
Reflective: {reflective_completed}/{total} | Action: {action_completed}/{total}
Streak max: {longest_streak}d | Current: {current_streak}d | Points: {total_points}
Compass uses: {compass_count} | Milestones: {milestones_hit}

Return JSON: { "consistency_score": 0-100, "performance_badge": "Iniciante|Em Progresso|Consistente|Avançado|Mestre", "month_headline": "...", "month_summary": "3 paragraphs", "behavioral_insight": "...", "next_month_challenge": "...", "motivational_close": "..." }
```

---

## SISTEMA DE DRIP UNLOCK

| Plano | Mês 1 (Dias 1-30) | Após Mês 1 |
|-------|-------------------|------------|
| 30 dias | +5 dias desbloqueados a cada 24h | Plano encerra no Dia 30 |
| 6 meses | +5 dias desbloqueados a cada 24h | Dia 31: todos desbloqueados instantaneamente |
| 1 ano | +5 dias desbloqueados a cada 24h | Dia 31: todos desbloqueados instantaneamente |
| Upgrade | Drip recomeça para o Mês 1 | Mês 2+: todos desbloqueados |

---

## RETENÇÃO & UPSELL

**Fase 1 (Dias 27-30):** Banner dismissível: "Your protocol expires in {X} days. Upgrade to keep your progress."

**Fase 2 (após features_expires_at, até 7 dias — Stripe retrying):** Banner vermelho não-dismissível: "Payment failed. Update payment method." → botão do Stripe Customer Portal.

**Fase 3 (access_level='locked'):** pointer-events:none em TODO o conteúdo + overlay semi-transparente. ÚNICO clicável: botão "Reactivate My MindReset →" → abre grade de planos acima do atual.

**Oferta de Salvamento no Cancelamento (antes do Portal Stripe):**
- Opção 1 (destacada): "Pause for 30 days"
- Opção 2: "Change to smaller plan"
- Opção 3 (sutil): "Continue cancellation" → Stripe Portal

---

## GAMIFICAÇÃO

### Sistema de Pontos
| Ação | Pontos | Frequência |
|------|--------|------------|
| Completar tarefa reflexiva | +10 | 1x/dia |
| Completar tarefa de ação | +10 | 1x/dia |
| Ambas as tarefas no mesmo dia | +5 bônus | 1x/dia |
| Dia de milestone (7,14,21,30…) | +30 | por milestone |
| Usar Compass | +15 | por análise |
| Gerar diagnóstico | +20 | 1x/mês |
| Exportar calendário (primeira vez) | +25 | 1x total |
| Streak de 7 dias | +50 | por achievement |
| Streak de 30 dias | +200 | por achievement |

### Achievements (planos 30d e 6m)
| Código | Nome | Gatilho | Recompensa |
|--------|------|---------|------------|
| ACH_001 | Primeiro Passo | Dia 1 completo | +50 pts |
| ACH_002 | 7 Dias de Reset | 7 dias consecutivos | +1 Compass |
| ACH_003 | Exportador | Exportar calendário | +1 Relatório Mensal |
| ACH_004 | 15 Dias Imparável | 15 dias consecutivos | +1 Calendário de Relacionamento |
| ACH_005 | Meio Caminho | Dia 15 completo | +2 dias extras |
| ACH_006 | 30 Days Complete | Dia 30 completo | +5 dias extras + cupom 15% |
| ACH_007 | Explorador | Compass 3x | +2 análises Compass |
| ACH_008 | 100 Dias (6m) | 100 dias completos | +10 dias extras |

### Resgate de Pontos
| Pontos | Recompensa |
|--------|------------|
| 500 | Cupom de upgrade 10% (30 dias) |
| 800 | +2 dias extras |
| 1.200 | +5 dias extras |
| 1.500 | 1 semana de acesso ao próximo tier |
| 2.000 | +10 dias extras |

---

## LIMITES DOS PLANOS

| Feature | 30 Dias | 6 Meses | 1 Ano |
|---------|---------|---------|-------|
| Diagnóstico | 1x + 1 refazer/mês | 1x + 1 refazer/mês | Ilimitado* |
| Calendário | 1x (30d) | 1x (6m) | 1x (1y) |
| Análises Compass | 2 | 10 | Ilimitado* |
| Calendários de relacionamento | Não | 3 | Ilimitado* |
| PDF do Diagnóstico | Sim | Sim | Sim |
| PDF do Calendário | Não | Sim | Sim |
| Relatório mensal | Via achievement | Incluído | Incluído |

*Caps anti-abuso (invisíveis): 10 gerações de IA/dia, 15 calendários/mês, 15 PDFs/mês.

---

## LOCALIZAÇÃO / i18n

### 5 Locales
`src/lib/i18n/translations.ts` — PT (linhas 215-274), EN (517-623), PL (851-970), RO (995-1066), AR (1090-1163)

**Namespaces de chaves:** `landing.*` | `quiz.*` | `dashboard.*`

### Detecção de Idioma
```typescript
async function detectLanguage() {
  const saved = localStorage.getItem('mindreset_lang');
  if (saved) return saved;
  const navLang = navigator.language.toLowerCase();
  const langMap = { 'pl':'pl','ro':'ro','ar':'ar','ar-sa':'ar','pt':'pt','pt-br':'pt' };
  if (langMap[navLang]) return langMap[navLang];
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    const countryMap = { 'PL':'pl','RO':'ro','SA':'ar','AE':'ar','BR':'pt' };
    return countryMap[data.country_code] || 'en';
  } catch { return 'en'; }
}
```

### RTL (Árabe)
```typescript
// Em LanguageProvider.tsx:91-96
document.documentElement.setAttribute('dir', 'rtl');
document.documentElement.setAttribute('lang', 'ar');
```
Sempre usar `margin-inline-start/end` em vez de `margin-left/right`.

### Detecção de Moeda
```typescript
const currencyMap = {
  'PL': { currency:'PLN', symbol:'zł', locale:'pl-PL' },
  'RO': { currency:'RON', symbol:'lei', locale:'ro-RO' },
  'SA': { currency:'SAR', symbol:'ر.س', locale:'ar-SA', rtl:true },
  'DEFAULT': { currency:'USD', symbol:'$', locale:'en-US' }
};
```

---

## TRATAMENTO DE ERROS

| Erro | Ação do Sistema | Usuário Vê |
|------|----------------|------------|
| API timeout >30s | 1 auto-retry após 5s | Spinner + "Processing..." |
| 429 rate limit | Aguardar 60s e auto-retry | "Finalizing protocol..." |
| 500/503 fora do ar | Log + notificação interna | Toast + botão de retry |
| JSON inválido | Parse do texto bruto + retry | Mesmo toast |
| Resposta incompleta | Verificar campos obrigatórios → retry | "Refining diagnosis..." |

---

## PRIVACIDADE & LEGAL

- Banner de consentimento GDPR obrigatório para usuários da UE (Polônia, Romênia) antes de qualquer chamada ao ipapi.co
- Páginas `/privacy` e `/terms` obrigatórias, linkadas no footer
- Rodapé do Diagnóstico: "This diagnosis is a behavioral analysis. Not medical, psychological, or financial advice."
- Rodapé do Compass: "Based on your perception only. Not a clinical diagnosis."
- Política de reembolso de 7 dias nos Termos

---

## DEPLOYMENT

1. Editar no Antigravity (ou localmente)
2. Sincronizar com GitHub: `https://github.com/Marcola916-oss/thoughtsculpt-engine.git`
3. Lovable puxa do GitHub
4. Clicar em **Publish** no Lovable
5. Live em: `https://thoughtsculpt-engine.lovable.app`

---

## ACESSIBILIDADE

- `aria-label` em todos os elementos interativos
- `role="img"` + `aria-label` em símbolos decorativos
- `aria-hidden` em camadas decorativas (fog, scan lines, symbols)
- `prefers-reduced-motion` e `(hover: none)` em `src/styles.css:597-841`
- FAQ: `aria-expanded` + `aria-controls` por item
- Contraste WCAG AA: `--muted-foreground` em 5.85:1 sobre preto

---

## PROBLEMAS CONHECIDOS

- 2 erros TS pré-existentes: `onboarding.tsx:192` e `obrigado.tsx:329` — `"/dashboard/"` vs `"/dashboard"` (type mismatch, não bloqueia o build)
- Build passa: `npm run build` (~2.5s)
- `npx tsc --noEmit` mostra apenas esses 2 erros pré-existentes

---

## CONVENÇÕES

- **Path alias:** `@/*` → `./src/*` (via `vite-tsconfig-paths`)
- **cn() helper:** `clsx` + `tailwind-merge` para classes condicionais
- **Animações de reveal:** `<Reveal variant="fade-up">` e `<Reveal.Group stagger="fast">`
- **Atmosphere:** `<Atmosphere fog="dramatic" symbols="sparse" scan="subtle" pinned>` para o Hero
- **Ícone da marca:** `<IdentitySymbol>` para uso decorativo, `<MarbleBust>` para hero/loader
- **ButtonPress:** efeito de halo nos botões CTA
- Sem `localStorage` — apps Lovable rodam em iframes sandboxed; usar state em memória ou Supabase

---

## POWERSHELL 5.1 (WINDOWS)

- `New-Item` usa `-Path` (não `-LiteralPath`)
- `npm` é `.cmd` — usar `Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm.cmd"` ou operador `&`
- `Get-Content -Raw` para tamanho bruto, `Measure-Object -Line` para contagem de linhas
- `Select-String` com `-NotMatch` não aceita array — usar pipeline

---

## REFERÊNCIA SUPABASE

- **Project ref:** `yuphudqargdosdrxznzi`
- **URL pattern:** `https://<project-ref>.supabase.co`
- **Edge functions:** `supabase/functions/` (stripe-webhook, etc.)
- **MCP:** Read-only, escopo no projeto; features: database, docs, development

---

## ERROS COMUNS A EVITAR

1. Nunca regenerar conteúdo em cache — diagnóstico, calendário, relatórios são gerados UMA VEZ.
2. Nunca colocar chaves secretas no frontend — STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY são somente para Edge Functions.
3. Nunca pular RLS — toda tabela DEVE ter Row Level Security habilitado.
4. Nunca bloquear acesso durante o período de retry do Stripe — manter acesso por 7 dias enquanto Smart Retries rodam.
5. Nunca hardcodar price IDs — usar variáveis de ambiente para todos os 15 price IDs do Stripe.
6. Nunca usar localStorage — apps Lovable rodam em iframes sandboxed. Usar state em memória ou Supabase.
7. Nunca pular verificação de assinatura do webhook — sempre validar antes de processar.
8. Nunca mostrar códigos de erro brutos para usuários — mapear todos os erros para mensagens amigáveis.
9. Nunca quebrar RTL — usar `margin-inline-start/end`, nunca `margin-left/right`.
10. Nunca enviar inputs não sanitizados ao OpenAI — sempre limpar campos de texto livre antes.
