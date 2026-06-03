# Stripe Webhook — Supabase Edge Function

## Overview

This is the production Stripe Webhook handler for MindReset, implemented as a **Supabase Edge Function** running on Deno. It replaces the previous TanStack Router API route.

**Endpoint (after deploy):**
```
https://<project-ref>.supabase.co/functions/v1/stripe-webhook
```

---

## Required Secrets

Set these in **Supabase Dashboard → Project Settings → Edge Functions → Secrets**:

| Secret Name | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (starts with `sk_live_` or `sk_test_`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret from Stripe Dashboard (starts with `whsec_`) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — bypasses RLS for admin writes |

> ⚠️ **NEVER** commit these values to source control.

---

## Handled Stripe Events

| Event | Action |
|---|---|
| `checkout.session.completed` | Create/find user, upsert subscription, sync profile, send welcome notification |
| `invoice.payment_succeeded` | Update subscription period, sync profile → `active`, send confirmation notification |
| `invoice.payment_failed` | Mark subscription `past_due`, sync profile → `grace`, send payment failure notification |
| `charge.refunded` | Set profile `access_level → revoked`, send revocation notification |
| `customer.subscription.updated` | Sync subscription status & period to DB |
| `customer.subscription.deleted` | Set profile `access_level → locked`, send cancellation notification |

---

## Deploying

### Prerequisites
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed: `npm i -g supabase`
- Logged in: `supabase login`
- Linked to your project: `supabase link --project-ref <your-project-ref>`

### Deploy Command
```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

> `--no-verify-jwt` is required because Stripe calls the endpoint directly (no Supabase auth JWT).

---

## Registering the Webhook in Stripe

1. Go to **Stripe Dashboard → Developers → Webhooks → Add endpoint**.
2. URL: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `charge.refunded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** and add it as `STRIPE_WEBHOOK_SECRET` in Supabase secrets.

---

## Local Testing (with Stripe CLI)

```bash
# Terminal 1 — start Supabase local
supabase start
supabase functions serve stripe-webhook --env-file .env.local

# Terminal 2 — forward Stripe events to local function
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Terminal 3 — trigger a test event
stripe trigger checkout.session.completed
```
