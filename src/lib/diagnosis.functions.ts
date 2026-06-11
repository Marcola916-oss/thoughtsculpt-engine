import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "../integrations/supabase/auth-middleware";
import { callAIStructured } from "./ai/gateway.server";
import type { JSONSchema7 } from "json-schema";
import { ARCHETYPE_NAMES, type Archetype } from "./ai/archetypes";
import { checkAndIncrementLimit } from "./limits.server";

type DiagnosisJSON = {
  financial_analysis: string;
  professional_analysis: string;
  romantic_analysis: string;
  personal_analysis: string;
};

const DiagnosisSchema: { name: string; description: string; schema: JSONSchema7 } = {
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
};

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
      .select("display_name, archetype, lang, plan_type")
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

    // Enforce daily generation limit on 1-year plans
    const planType = profile?.plan_type ?? "unknown";
    await checkAndIncrementLimit(supabase, userId, "generation", planType);

    const result = await callAIStructured<DiagnosisJSON>({
      model: "google/gemini-2.0-flash-exp",
      jsonSchema: DiagnosisSchema,
      messages: [
        {
          role: "system",
          content:
            `You are the MindReset Behavioral Engine, inspired by the Antigravity philosophy. Your goal is to provide a "Brutal Realism" analysis that is both confronting and liberating. Use a style that mixes deep psychological insight with elite coaching.

            GUIDELINES:
            1. No platitudes.
            2. Be specific about the cost of inaction.
            3. Reference the user's name (${name}) to create deep intimacy.
            4. Tone: Clinical, yet urgent. Like a high-performance mentor.
            5. Archetype Focus: Deep dive into the ${archetypeName} shadow and light sides.`,
        },
        {
          role: "user",
          content: `Generate a life-changing behavioral diagnosis for ${name}.
          Archetype: ${archetypeName} (${archetype})
          Core Patterns: ${JSON.stringify(lead?.scores ?? {})}
          Language: ${lang}

          Structure your response in 4 dimensions:
          - financial_analysis: 4 paragraphs. The "Hidden Leak". How ${name}'s subconscious relationship with money is sabotaging long-term wealth.
          - professional_analysis: 3 paragraphs. The "Invisible Ceiling". Workplace dynamics and salary negotiation patterns.
          - romantic_analysis: 3 paragraphs. The "Echo Chamber". How this financial archetype manifests in intimacy and partner selection.
          - personal_analysis: 3 paragraphs. The "Self-Sabotage Loop". Health, energy, and self-worth patterns.`,
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
        model_used: "google/gemini-2.0-flash-exp",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });