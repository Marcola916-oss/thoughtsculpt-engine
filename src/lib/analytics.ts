import { supabase } from "../integrations/supabase/client";

export async function trackEvent(eventName: string, properties: Record<string, any> = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // We only track for authenticated users in the DB table, 
    // but could expand this to anonymous tracking in the future
    if (user) {
      await supabase.from("user_events").insert({
        user_id: user.id,
        event_name: eventName,
        properties
      });
    } else {
      console.log(`[Event] ${eventName}`, properties);
    }
  } catch (error) {
    console.error("Tracking Error:", error);
  }
}

export const EVENTS = {
  QUIZ_STARTED: "quiz_started",
  QUIZ_COMPLETED: "quiz_completed",
  PAYWALL_VIEWED: "paywall_viewed",
  CHECKOUT_STARTED: "checkout_started",
  DIAGNOSIS_GENERATED: "diagnosis_generated",
  COMPASS_USED: "compass_used",
};