import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { JSONSchema7 } from "json-schema";
import { requireSupabaseAuth } from "../integrations/supabase/auth-middleware";
import { callAIStructured } from "./ai/gateway.server";
import { ARCHETYPE_NAMES, type Archetype } from "./ai/archetypes";

type CompassResult = {
  probable_archetype: Archetype;
  confidence_level: "high" | "medium" | "low";
  perception_disclaimer: string;
  archetype_in_context: string;
  dynamic_analysis: string;
  interaction_strategies: string[];
  communication_script: string;
  what_to_avoid: string[];
};

const CompassSchema: { name: string; description: string; schema: JSONSchema7 } = {
  name: "save_compass_analysis",
  description: "Save the behavioral analysis of another person.",
  schema: {
    type: "object",
    properties: {
      probable_archetype: { type: "string", enum: ["AO", "SS", "EA", "HI"] },
      confidence_level: { type: "string", enum: ["high", "medium", "low"] },
      perception_disclaimer: { type: "string" },
      archetype_in_context: { type: "string", minLength: 100 },
      dynamic_analysis: { type: "string", minLength: 100 },
      interaction_strategies: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 7 },
      communication_script: { type: "string", minLength: 30 },
      what_to_avoid: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
    },
    required: [
      "probable_archetype",
      "confidence_level",
      "perception_disclaimer",
      "archetype_in_context",
      "dynamic_analysis",
      "interaction_strategies",
      "communication_script",
      "what_to_avoid",
    ],
    additionalProperties: false,
  },
};

const CompassInput = z.object({
  target_name: z.string().min(1).max(80),
  relationship_type: z.enum(["professional", "romantic", "family", "general"]),
  context: z.string().min(1).max(400),
  observations: z.string().min(10).max(1500),
});

export const listCompass = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("compass_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const analyzeCompass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => CompassInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, archetype, lang")
      .eq("user_id", userId)
      .maybeSingle();
    const userArch = (profile?.archetype as Archetype | undefined) ?? "AO";
    const userName = profile?.display_name ?? "the user";
    const lang = profile?.lang ?? "en";

    const result = await callAIStructured<CompassResult>({
      model: "google/gemini-2.5-flash",
      jsonSchema: CompassSchema,
      messages: [
        {
          role: "system",
          content:
            "You are the COMPASS of MindReset — a behavioral profile analyzer based on interpersonal perception. Always make explicit that the analysis is based on the user's perception, not a clinical diagnosis of the analyzed person.",
        },
        {
          role: "user",
          content: `Analyze the probable archetype of a person:
- Analyst: ${userName} (archetype: ${ARCHETYPE_NAMES[userArch].en})
- Person analyzed: ${data.target_name}
- Relationship: ${data.relationship_type}
- Goal: ${data.context}
- Observations: ${data.observations}
- Language: ${lang}

Factor in the dynamic between the analyst's archetype and the analyzed person's probable archetype.`,
        },
      ],
    });

    const { data: inserted, error } = await supabase
      .from("compass_analyses")
      .insert({
        user_id: userId,
        target_name: data.target_name,
        relationship_type: data.relationship_type,
        context: data.context,
        observations: data.observations,
        probable_archetype: result.probable_archetype,
        analysis_content: result as unknown as Record<string, unknown>,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });