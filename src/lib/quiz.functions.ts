import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "../integrations/supabase/types";
import { scoreAnswers } from "./quiz/scoring";
import { callAI } from "./ai/gateway.server";
import { ARCHETYPE_NAMES } from "./ai/archetypes";

function createPublicSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    const missing = [
      ...(!supabaseUrl ? ["SUPABASE_URL"] : []),
      ...(!publishableKey ? ["SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    throw new Error(`Missing Supabase environment variable(s): ${missing.join(", ")}.`);
  }

  return createClient<Database>(supabaseUrl, publishableKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function createShareToken() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

const SaveLeadInput = z.object({
  display_name: z.string().min(1).max(80),
  gender: z.enum(["m", "f", "n"]).optional(),
  email: z.string().email().max(255),
  lang: z.string().min(2).max(8),
  country: z.string().max(8).nullable().optional(),
  currency: z.string().min(3).max(8),
  answers: z.array(z.number().int().min(0).max(3).nullable()).length(8),
  user_agent: z.string().max(500).optional(),
});

export const saveQuizLead = createServerFn({ method: "POST" })
  .inputValidator((d) => SaveLeadInput.parse(d))
  .handler(async ({ data }) => {
    const supabase = createPublicSupabaseClient();
    const result = scoreAnswers(data.answers as Array<number | null>);
    const id = crypto.randomUUID();
    const share_token = createShareToken();

    // Generate a quick AI insight preview to hook the user
    // This makes the transition to the paywall much more effective
    let insightPreview = "";
    try {
      const archetypeName = ARCHETYPE_NAMES[result.winner as keyof typeof ARCHETYPE_NAMES]?.en || result.winner;
      insightPreview = await callAI({
        model: "google/gemini-flash-1.5",
        messages: [
          {
            role: "system",
            content: "You are the MindReset behavioral engine. Generate a single, short, extremely intriguing sentence (max 20 words) that describes a hidden truth about someone's financial behavior based on their archetype. Be provocative but accurate. Tone: Antigravity / Deep Psychology.",
          },
          {
            role: "user",
            content: `Archetype: ${archetypeName}. Target language: ${data.lang}. Context: This person just finished a behavioral quiz.`,
          },
        ],
      });
    } catch (aiError) {
      console.error("AI Insight Error:", aiError);
      // Fallback insight if AI fails
    }

    const { error } = await supabase
      .from("quiz_leads")
      .insert({
        id,
        share_token,
        display_name: data.display_name,
        email: data.email,
        lang: data.lang,
        country: data.country ?? null,
        currency: data.currency,
        answers: data.answers,
        scores: result.scores,
        winner: result.winner,
        secondary_archetype: result.secondary,
        user_agent: data.user_agent ?? null,
        insight_preview: insightPreview,
      });

    if (error) throw new Error(error.message);
    return {
      id,
      share_token,
      winner: result.winner,
      secondary: result.secondary,
      insight_preview: insightPreview,
    };
  });

export const getSharedQuiz = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string().min(8).max(64) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = createPublicSupabaseClient();
    const { data: row, error } = await supabase.rpc("get_shared_quiz", { _token: data.token });
    if (error) throw new Error(error.message);
    return Array.isArray(row) ? row[0] ?? null : row;
  });

export const trackShare = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    share_token: z.string().min(8).max(64),
    channel: z.enum(["whatsapp", "x", "facebook", "copy", "other"]),
  }).parse(d))
  .handler(async ({ data }) => {
    const supabase = createPublicSupabaseClient();
    const { error } = await supabase.from("viral_shares").insert({
      share_token: data.share_token,
      channel: data.channel,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });