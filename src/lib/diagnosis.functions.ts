import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "../integrations/supabase/auth-middleware";
import { callAIStructured } from "./ai/gateway.server";
import { ARCHETYPE_NAMES, type Archetype } from "./ai/archetypes";

type DiagnosisJSON = {
  financial_analysis: string;
  professional_analysis: string;
  romantic_analysis: string;
  personal_analysis: string;
};

const DiagnosisSchema = {
  name: "save_diagnosis",
  description: "Save the user's complete behavioral financial diagnosis.",
  schema: {
    type: "object",
    properties: {
      financial_analysis: { type: "string", minLength: 300 },
      professional_analysis: { type: "string", minLength: 200 },
      romantic_analysis: { type: "string", minLength: 200 },
      personal_analysis: { type: "string", minLength: 200 },
    },
    required: [
      "financial_analysis",
      "professional_analysis",
      "romantic_analysis",
      "personal_analysis",
    ],
    additionalProperties: false,
  },
} as const;

export const getDiagnosis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("diagnoses")
      .select("*")
      .eq("user_id", userId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  });

export const generateDiagnosis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Cache: if a diagnosis exists from the last 30 days, return it.
    const { data: existing } = await supabase
      .from("diagnoses")
      .select("*")
      .eq("user_id", userId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) {
      const ageDays = (Date.now() - new Date(existing.generated_at).getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays < 30) return existing;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, archetype, lang")
      .eq("user_id", userId)
      .maybeSingle();
    const { data: lead } = await supabase
      .from("quiz_leads")
      .select("scores, display_name, winner")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const archetype = (profile?.archetype ?? lead?.winner) as Archetype | undefined;
    if (!archetype) throw new Error("No archetype found. Complete the quiz first.");
    const name = profile?.display_name ?? lead?.display_name ?? "you";
    const lang = profile?.lang ?? "en";
    const archetypeName = ARCHETYPE_NAMES[archetype]?.en ?? archetype;

    const result = await callAIStructured<DiagnosisJSON>({
      model: "google/gemini-2.5-pro",
      jsonSchema: DiagnosisSchema,
      messages: [
        {
          role: "system",
          content:
            "You are the psychological analysis engine of MindReset, a behavioral financial diagnosis system. Generate deep, empathetic, highly personalized analyses. Never use generic phrases. Reference the user's name at least 3 times per dimension. Tone: empathetic, intelligent, not condescending.",
        },
        {
          role: "user",
          content: `Generate a complete diagnosis for:
- Name: ${name}
- Primary archetype: ${archetypeName} (code: ${archetype})
- Quiz scores: ${JSON.stringify(lead?.scores ?? {})}
- Response language: ${lang}

For each of the 4 dimensions return 3-4 substantive paragraphs:
- financial_analysis: P1 how the archetype manifests in ${name}'s daily money decisions. P2 hidden cost of this pattern. P3 what ${name} has probably already tried without success. P4 what changes when this pattern is reframed.
- professional_analysis: 3 paragraphs about ${name}'s workplace behavior, salary negotiations, authority relationships.
- romantic_analysis: 3 paragraphs about ${name}'s intimate relationship patterns.
- personal_analysis: 3 paragraphs about ${name}'s self-care, health decisions, friendships, self-esteem.`,
        },
      ],
    });

    const { data: inserted, error } = await supabase
      .from("diagnoses")
      .insert({
        user_id: userId,
        archetype,
        financial_analysis: result.financial_analysis,
        professional_analysis: result.professional_analysis,
        romantic_analysis: result.romantic_analysis,
        personal_analysis: result.personal_analysis,
        model_used: "google/gemini-2.5-pro",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });