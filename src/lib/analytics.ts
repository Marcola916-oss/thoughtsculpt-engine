import { supabase } from "../integrations/supabase/client";

/**
 * Fase 1 — Canonical analytics layer.
 * Browser-only. Não roda em SSR (guarda `typeof window`).
 *
 * Sink priority:
 *   1. PostHog (se `VITE_POSTHOG_KEY` definido) — fire & forget
 *   2. Supabase `user_events` (apenas se logged-in)
 *   3. console.debug (dev fallback)
 *
 * Sem PII (email, nome) — só ids opacos + properties seguras.
 */

/** 16 eventos canônicos do funil — bate com PostHog dashboard da Fase 6. */
export const EVENTS = {
  LANDING_VIEW: "landing_view",
  QUIZ_START: "quiz_start",
  QUIZ_BACK: "quiz_back",
  QUIZ_QUESTION_ANSWERED: "quiz_question_answered",
  QUIZ_COMPLETED: "quiz_completed",
  EMAIL_SUBMITTED: "email_submitted",
  LOADER_VIEW: "loader_view",
  LOADER_COMPLETE: "loader_complete",
  REVEAL_VIEW: "reveal_view",
  REVEAL_CTA_CLICK: "reveal_cta_click",
  VSL_VIEW: "vsl_view",
  VSL_SCROLL_DEPTH: "vsl_scroll_depth",
  VSL_CTA_CLICK: "vsl_cta_click",
  VSL_BUMP_TOGGLED: "vsl_bump_toggled",
  CHECKOUT_VIEW: "checkout_view",
  BUMP_TOGGLED: "bump_toggled",
  CHECKOUT_CTA_CLICKED: "checkout_cta_clicked",
  STRIPE_SESSION_CREATED: "stripe_session_created",
  PURCHASE_COMPLETED: "purchase_completed",
  UPSELL_VIEW: "upsell_view",
  UPSELL_ACCEPTED: "upsell_accepted",
  EXIT_INTENT_SHOWN: "exit_intent_shown",
  EXIT_INTENT_RECOVERED: "exit_intent_recovered",
  EXIT_INTENT_CTA: "exit_intent_cta",
  EXIT_INTENT_DISMISS: "exit_intent_dismiss",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS] | string;

type PostHogLike = {
  init: (key: string, opts: Record<string, unknown>) => void;
  capture: (name: string, props?: Record<string, unknown>) => void;
};

let posthogPromise: Promise<PostHogLike | null> | null = null;

async function getPostHog(): Promise<PostHogLike | null> {
  if (typeof window === "undefined") return null;
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key) return null;
  if (posthogPromise) return posthogPromise;
  posthogPromise = (async () => {
    try {
      const pkg = "posthog-js";
      const mod = await import(/* @vite-ignore */ pkg);
      const ph = (mod.default ?? mod) as PostHogLike;
      ph.init(key, {
        api_host: (import.meta.env.VITE_POSTHOG_HOST as string) || "https://us.i.posthog.com",
        capture_pageview: false,
        persistence: "memory", // iframe-safe (Lovable preview sandbox)
      });
      return ph;
    } catch (e) {
      console.debug("[analytics] posthog not installed; skipping", e);
      return null;
    }
  })();
  return posthogPromise;
}

export async function trackEvent(
  eventName: EventName,
  properties: Record<string, unknown> = {},
): Promise<void> {
  if (typeof window === "undefined") return;

  // 1) PostHog
  try {
    const ph = await getPostHog();
    ph?.capture(eventName, properties);
  } catch {
    /* ignore */
  }

  // 2) Supabase (user_events) — only for authenticated sessions
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_events").insert({
        user_id: user.id,
        event_name: eventName,
        properties: properties as never,
      });
    }
  } catch (e) {
    console.debug("[analytics] supabase sink failed", e);
  }

  // 3) Dev fallback
  if (import.meta.env.DEV) {
    console.debug(`[event] ${eventName}`, properties);
  }
}

/** Fire-and-forget helper para event handlers (não bloqueia UI). */
export function track(eventName: EventName, properties: Record<string, unknown> = {}): void {
  void trackEvent(eventName, properties);
}