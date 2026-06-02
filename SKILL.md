---
name: mindreset-builder
description: Use when building, modifying, debugging, or expanding any part of the MindReset SaaS. Covers quiz funnel, onboarding, dashboard, Supabase schema, Stripe billing, OpenAI integration, gamification, retention mechanics, design system, and localization. Full stack: React + TypeScript + Tailwind (Lovable), Supabase, Stripe, OpenAI API. Do NOT use for unrelated projects.
---
# MindReset Protocol — SaaS Builder Skill

## PRODUCT IDENTITY

**MindReset** is a behavioral finance SaaS. It diagnoses the user's financial archetype through a quiz, then delivers a personalized AI-generated action protocol (calendar, diagnosis, relationship tool, progress tracker). It does NOT track budgets or connect to bank accounts. It works on psychology first, then action.

**4 Archetypes:**
- AO (Accumulator Obsessive) — fear of scarcity, compulsive saving
- SS (Status Seeker) — spends for social approval, buys identity
- EA (Escapist/Alienated) — avoids money topic, uses spending as escape
- HI (Hedonist Impulsive) — lives for now, emotional impulse decisions

**4 App Areas:**
1. Meu Diagnóstico — AI-generated 4-dimension psychological analysis (financial, professional, romantic, personal)
2. Matriz de Ação — AI-generated personalized daily calendar (30d / 6m / 1y)
3. Compass — tool to analyze other people's archetypes and get relationship strategies
4. Progresso — gamified progress dashboard (points, streak, achievements, monthly reports)

**Target Markets:** Poland (PLN) • Romania (RON) • Saudi Arabia (SAR) • Global (USD/EUR)

---

## TECH STACK

| Tool | Role | Notes |
|------|------|-------|
| Lovable.dev | React + TypeScript + Tailwind frontend | Use Shadcn/UI components |
| Supabase | PostgreSQL + Auth + Storage + Edge Functions | RLS MUST be enabled on ALL tables |
| OpenAI API | gpt-4o for Diagnosis • gpt-4o-mini for Calendar, Compass, Reports | Cache all results — never regenerate |
| Stripe | Recurring subscriptions + webhooks + Customer Portal | Smart Retries enabled |
| ipapi.co | IP geolocation for language + currency auto-detection | Free tier: 30k/day, no key needed |
| Vercel / Netlify | Frontend hosting | Auto-deploy from Lovable GitHub |

**Environment Variables (Settings → Secrets — NEVER hardcode):**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # Edge Functions only
OPENAI_API_KEY                     # Edge Functions only
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY                  # Edge Functions only
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_STRIPE_30D_PLN / RON / SAR / USD / EUR
NEXT_PUBLIC_STRIPE_6M_PLN / RON / SAR / USD / EUR
NEXT_PUBLIC_STRIPE_1Y_PLN / RON / SAR / USD / EUR
```

---

## DATABASE ARCHITECTURE

**RULE: RLS (Row Level Security) is MANDATORY on every single table. No exceptions.**

### quiz_leads — stores all quiz completers (including non-buyers)
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

### users — main user table
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

### diagnoses — AI-generated diagnoses
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

### onboarding_answers — 7 calibration questions
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

### calendar_tasks — personalized daily tasks
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

### compass_analyses — relationship archetype analyses
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

### user_progress — gamification state
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

### achievements — unlocked achievement records
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

### daily_limits — anti-abuse for 1-year plan
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

### notifications — in-app notification system
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

### monthly_reports — auto-generated monthly reports
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

### viral_shares — public shareable archetype pages
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

## SECURITY RULES

1. **STRIPE_SECRET_KEY** and **SUPABASE_SERVICE_ROLE_KEY** go in Edge Functions ONLY. Never in frontend.
2. **NEXT_PUBLIC_*** variables are safe for frontend (public keys only).
3. Always verify Stripe webhook signatures with `stripe.webhooks.constructEvent()` before processing.
4. Rate limit Edge Functions: max 10 AI calls per IP per minute.
5. Sanitize all free-text user inputs before sending to OpenAI.
6. Always call `checkAndIncrementLimit()` before any AI generation.

```typescript
// Stripe webhook signature validation (Edge Function)
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

## QUIZ FUNNEL (14 SCREENS)

**Validated:** 1 question/screen = +30% conversion. Email before results = +40% leads. Name+gender in questions = +15-25% completion.

| Screen | Name | Key Behavior |
|--------|------|-------------|
| 0 | Identity | Name + gender on same screen. Save to state. |
| 1-8 | Questions | One per screen. Use [NOME] placeholder. Auto-advance on selection. |
| 9 | Email Capture | Email field + GDPR checkbox (required). Save to quiz_leads BEFORE showing result. |
| 10 | Loader | 3 seconds. Red spinning ring. No real API call. |
| 11 | Reveal | Archetype name typewriter effect. 2-3 impact lines. Red CTA. |
| 12 | Sales Page | Full long-form sales page (9 blocks). |
| 13 | Plans | 3-plan grid. Local pricing by IP. "MOST POPULAR" on 6M. |

**Archetype Scoring:** Each of 8 questions, each answer = +2 to one archetype (AO/SS/EA/HI).
```typescript
const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
// Tiebreaker: use Q8 answer. If still tied: use Q5.
```

---

## STRIPE CONFIGURATION

### Pricing Table
| Currency | 30 Days | 6 Months | 1 Year |
|----------|---------|----------|--------|
| PLN | 79 zł | 199 zł | 319 zł |
| RON | 89 lei | 229 lei | 369 lei |
| SAR | 89 ر.س | 229 ر.س | 369 ر.س |
| USD | $22 | $55 | $89 |
| EUR | €20 | €50 | €82 |

All plans = recurring subscriptions. Smart Retries: 7 days. Enable Stripe Customer Portal.
Webhook URL: `https://[project].supabase.co/functions/v1/stripe-webhook`

### Webhook Events
| Event | Supabase Action |
|-------|----------------|
| customer.subscription.created | Create user, set plan_type + expiry dates, create auth.user |
| invoice.payment_succeeded | Renew dates, set status='active', insert notification |
| invoice.payment_failed | Set status='past_due', insert notification, DO NOT block yet |
| customer.subscription.deleted | Manual → 'revoked'. Non-payment → 'locked' |
| charge.refunded | access_level='revoked' immediately, invalidate session |
| customer.subscription.updated | Update plan_type, recalculate dates |

### Access Date Logic
| Plan | features_expires_at | account_expires_at |
|------|--------------------|--------------------|
| 30d | purchase + 30 days | purchase + 37 days |
| 6m | purchase + 180 days | purchase + 187 days |
| 1y | purchase + 365 days | purchase + 372 days |

---

## AUTH & ROUTING

### Route Map
| Route | Auth | Description |
|-------|------|-------------|
| / | Public | Full quiz (screens 0-13) + embedded sales page |
| /share/[token] | Public | Viral archetype share page |
| /login | Public | Email + password ONLY. No signup buttons. |
| /reset-password | Public | Password recovery |
| /dashboard | Private | Hub: 3 cards + notifications |
| /dashboard/diagnosis | Private | 4-tab AI diagnosis + PDF + share |
| /dashboard/calendar | Private | Action matrix with drip unlock |
| /dashboard/compass | Private | Analyze other people's archetypes |
| /dashboard/progress | Private | Gamification dashboard |
| /dashboard/settings | Private | Language, theme, plan, cancellation |
| /onboarding | Private | 7 calibration questions (first login only) |

### Route Guard Logic
```
1. Check Supabase session → null = redirect /login
2. Check users.access_level:
   'active'  → normal access
   'grace'   → show warning banner
   'locked'  → freeze interface + show upgrade overlay
   'revoked' → logout + redirect /login
3. onboarding_completed = false → redirect /onboarding
4. features_expires_at < NOW()+3days → red warning bar
   features_expires_at < NOW()      → pointer-events: none on content
```

---

## OPENAI PROMPTS

### Prompt 1: Full Diagnosis (gpt-4o — cache result, never regenerate within 30 days)
```
SYSTEM: You are the psychological analysis engine of MindReset. Generate deep, empathetic, highly personalized analyses. NOT a generic chatbot. Rules: 1) No generic phrases. 2) Use user's name 3+ times per dimension. 3) Correct gender grammar. 4) Tone: empathetic, intelligent. 5) Respond ONLY in valid JSON.

USER: Generate complete diagnosis for:
- Name: {name} | Gender: {gender} | Archetype: {archetype_name} ({archetype_code})
- Quiz scores: {quiz_scores} | Language: {language}

Return JSON: { "financial_analysis": "4 paragraphs", "professional_analysis": "3 paragraphs", "romantic_analysis": "3 paragraphs (gender-adapted)", "personal_analysis": "3 paragraphs" }
```

### Prompt 2: Action Calendar (gpt-4o-mini — generate once, never regenerate)
```
SYSTEM: Behavioral calendar engine of MindReset. Create personalized daily plans based on behavioral psychology and stoicism. Respond ONLY as valid JSON array.

USER: Generate {plan_days}-day calendar for {name} | Archetype: {archetype_name} | Language: {language}
Minutes/day: {daily_minutes} | Wake: {wake_time} | Sleep: {sleep_time}
Trigger: {emotional_trigger} | Goal: {financial_goal} | Style: {discipline_style}

PHASES: Days 1-7=Recognition, 8-14=Interruption, 15-21=Substitution, 22-30=Consolidation
MILESTONES (is_milestone:true): Days 7,14,21,30,60,90,120,150,180

Return: [{"day":1,"reflective_task":"...","action_task":"...","is_milestone":false,"phase":"recognition"}]
```

### Prompt 3: Compass Analysis (gpt-4o-mini)
```
SYSTEM: COMPASS — behavioral profile analysis based on interpersonal perception. ALWAYS note analysis is based on user's perception, not clinical diagnosis.

USER: Analyze archetype of: {target_name} | Relationship: {relationship_type}
Analyst: {user_name} ({user_archetype}) | Goal: {context} | Observations: {observations} | Language: {language}

Return JSON: { "probable_archetype": "AO|SS|EA|HI", "confidence_level": "high|medium|low", "perception_disclaimer": "...", "archetype_in_context": "2 paragraphs", "dynamic_analysis": "archetype combination tensions/synergies", "interaction_strategies": ["5 strategies"], "communication_script": "example phrase", "what_to_avoid": ["3 traps"] }
```

### Prompt 4: Monthly Report (gpt-4o-mini — 1x per month, serve from DB after)
```
SYSTEM: Evolutionary report engine of MindReset. Generate reports that make the user feel measurable growth.

USER: Month {month_number} report for {name} | {archetype_name} | {language}
Reflective: {reflective_completed}/{total} | Action: {action_completed}/{total}
Streak max: {longest_streak}d | Current: {current_streak}d | Points: {total_points}
Compass uses: {compass_count} | Milestones: {milestones_hit}

Return JSON: { "consistency_score": 0-100, "performance_badge": "Iniciante|Em Progresso|Consistente|Avançado|Mestre", "month_headline": "...", "month_summary": "3 paragraphs", "behavioral_insight": "...", "next_month_challenge": "...", "motivational_close": "..." }
```

---

## DRIP UNLOCK SYSTEM

| Plan | Month 1 (Days 1-30) | After Month 1 |
|------|---------------------|---------------|
| 30 days | +5 days unlocked every 24h | Plan ends at Day 30 |
| 6 months | +5 days unlocked every 24h | Day 31: all unlocked instantly |
| 1 year | +5 days unlocked every 24h | Day 31: all unlocked instantly |
| Upgrade | Drip restarts for Month 1 | Month 2+: all unlocked |

---

## RETENTION & UPSELL

**Phase 1 (Days 27-30):** Dismissible banner: "Your protocol expires in {X} days. Upgrade to keep your progress."

**Phase 2 (after features_expires_at, up to 7 days — Stripe retrying):** Non-dismissible red banner: "Payment failed. Update payment method." → Stripe Customer Portal button.

**Phase 3 (access_level='locked'):** pointer-events:none on ALL content + semi-transparent overlay. ONLY clickable: "Reactivate My MindReset →" button → opens plan grid with plans above current.

**Cancellation Save Offer (before Stripe Portal):**
- Option 1 (highlighted): "Pause for 30 days"
- Option 2: "Change to smaller plan"
- Option 3 (subtle): "Continue cancellation" → Stripe Portal

---

## GAMIFICATION

### Points System
| Action | Points | Frequency |
|--------|--------|-----------|
| Complete reflective task | +10 | 1x/day |
| Complete action task | +10 | 1x/day |
| Both tasks same day | +5 bonus | 1x/day |
| Milestone day (7,14,21,30…) | +30 | per milestone |
| Use Compass | +15 | per analysis |
| Generate diagnosis | +20 | 1x/month |
| Export calendar (first time) | +25 | 1x total |
| 7-day streak | +50 | per achievement |
| 30-day streak | +200 | per achievement |

### Achievements (30d and 6m plans)
| Code | Name | Trigger | Reward |
|------|------|---------|--------|
| ACH_001 | Primeiro Passo | Day 1 complete | +50 pts |
| ACH_002 | 7 Dias de Reset | 7 consecutive days | +1 Compass |
| ACH_003 | Exportador | Export calendar | +1 Monthly Report |
| ACH_004 | 15 Dias Imparável | 15 consecutive days | +1 Relationship Calendar |
| ACH_005 | Meio Caminho | Day 15 complete | +2 extra days |
| ACH_006 | 30 Days Complete | Day 30 complete | +5 extra days + 15% coupon |
| ACH_007 | Explorador | Compass 3x | +2 Compass analyses |
| ACH_008 | 100 Dias (6m) | 100 days complete | +10 extra days |

### Points Redemption
| Points | Reward |
|--------|--------|
| 500 | 10% upgrade coupon (30 days) |
| 800 | +2 extra days |
| 1,200 | +5 extra days |
| 1,500 | 1 week next-tier access |
| 2,000 | +10 extra days |

---

## PLAN LIMITS

| Feature | 30 Days | 6 Months | 1 Year |
|---------|---------|----------|--------|
| Diagnosis | 1x + 1 redo/month | 1x + 1 redo/month | Unlimited* |
| Calendar | 1x (30d) | 1x (6m) | 1x (1y) |
| Compass analyses | 2 | 10 | Unlimited* |
| Relationship calendars | No | 3 | Unlimited* |
| Diagnosis PDF | Yes | Yes | Yes |
| Calendar PDF | No | Yes | Yes |
| Monthly report | Via achievement | Included | Included |

*Anti-abuse caps (invisible): 10 AI generations/day, 15 calendars/month, 15 PDFs/month.

---

## DESIGN SYSTEM

### Colors
```css
:root {
  --bg-canvas:      #000000;
  --bg-surface:     #0D0D0D;
  --bg-elevated:    #1A1A1A;
  --border-default: #2A2A2A;
  --text-primary:   #F5F5F7;
  --text-secondary: #8E8E93;
  --accent:         #CC0000;
  --accent-dark:    #990000;
  --accent-glow:    rgba(204,0,0,0.25);
  --success:        #22C55E;
  --warning:        #F59E0B;
}
```

### Typography
- Display/Hero: Inter or Syne, 48-64px, weight 800
- Heading 1: Inter, 32-40px, weight 700
- Heading 2: Inter, 24-28px, weight 600
- Body: Inter, 16-18px, weight 400
- Caption: Inter, 12-14px, weight 400-500
- Load via: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap`

### Micro-interactions (mandatory — separates premium from generic)
- **CTA button:** hover=translateY(-2px)+glow, click=scale(0.97) 100ms
- **Task checkbox:** on check → green bounce + 0.5s confetti
- **Progress bar:** transition: width 0.8s ease-out
- **Achievement unlock:** scale(0)→scale(1.1)→scale(1) + golden particles 1.5s
- **Streak counter:** roll-up animation (translateY(-100%)→0)
- **Dashboard cards:** hover → border turns red + translateY(-4px)
- **Quiz loader:** red spinning ring + texts fade every 0.7s
- **Diagnosis reveal:** archetype name typewriter (1 char/50ms)
- **Active sidebar link:** red translucent bg + solid red left border (3px)

### Component States
| Component | Default | Hover | Pressed | Disabled |
|-----------|---------|-------|---------|----------|
| Primary Button | bg:#CC0000 | bg:#990000+glow | scale(0.97) | opacity:0.4 |
| Input | border:#2A2A2A | border:#555 | border:#CC0000 | opacity:0.5 |
| Card | bg:#0D0D0D | border:red+translateY(-4px) | scale(0.99) | opacity:0.6 |
| Quiz Option | border:#2A2A2A | border:red+red-bg | darker-red-bg | — |

### Mobile-First Rules
- Viewport: `width=device-width, initial-scale=1, maximum-scale=1`
- Touch targets: minimum 44x44px
- Sidebar: collapsed by default on mobile, opens as drawer with overlay
- Plan grid: 1 column mobile, 3 columns desktop
- Quiz options: 100% width on mobile
- Body text minimum: 16px (prevents iOS auto-zoom on inputs)
- Use safe-area-inset-bottom for iPhone home indicator

---

## LOCALIZATION

### Language Detection
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

### RTL (Arabic)
```typescript
document.documentElement.setAttribute('dir', 'rtl');
document.documentElement.setAttribute('lang', 'ar');
```
Always use `margin-inline-start/end` instead of `margin-left/right`.

### Currency Detection
```typescript
const currencyMap = {
  'PL': { currency:'PLN', symbol:'zł', locale:'pl-PL' },
  'RO': { currency:'RON', symbol:'lei', locale:'ro-RO' },
  'SA': { currency:'SAR', symbol:'ر.س', locale:'ar-SA', rtl:true },
  'DEFAULT': { currency:'USD', symbol:'$', locale:'en-US' }
};
```

---

## ERROR HANDLING

| Error | System Action | User Sees |
|-------|--------------|-----------|
| API timeout >30s | 1 auto-retry after 5s | Spinner + "Processing..." |
| 429 rate limit | Wait 60s then auto-retry | "Finalizing protocol..." |
| 500/503 down | Log + internal notification | Toast + retry button |
| Invalid JSON | Parse raw text + retry | Same toast |
| Incomplete response | Check required fields → retry | "Refining diagnosis..." |

---

## PRIVACY & LEGAL

- GDPR consent banner required for EU users (Poland, Romania) before any ipapi.co call
- `/privacy` and `/terms` pages required, linked in footer
- Diagnosis footer: "This diagnosis is a behavioral analysis. Not medical, psychological, or financial advice."
- Compass footer: "Based on your perception only. Not a clinical diagnosis."
- 7-day refund policy in Terms

---

## COMMON MISTAKES TO AVOID

1. Never regenerate cached content — diagnosis, calendar, reports are generated ONCE.
2. Never put secret keys in frontend — STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY are Edge Functions only.
3. Never skip RLS — every table MUST have Row Level Security enabled.
4. Never block access during Stripe retry period — keep access for 7 days while Smart Retries run.
5. Never hardcode price IDs — use environment variables for all 15 Stripe price IDs.
6. Never use localStorage — Lovable apps run in sandboxed iframes. Use in-memory state or Supabase.
7. Never skip webhook signature verification — always validate before processing.
8. Never show raw error codes to users — map all errors to friendly messages.
9. Never break RTL — use margin-inline-start/end, never margin-left/right.
10. Never send unsanitized inputs to OpenAI — always clean free-text fields first.
