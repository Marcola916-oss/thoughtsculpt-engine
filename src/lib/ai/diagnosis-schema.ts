/**
 * Phase C — Schema do diagnóstico estruturado retornado pela cadeia de IA.
 * Cliente-safe (sem segredos). Usado tanto pela server fn quanto pelo template PDF.
 */
import { z } from "zod";

export const ARCHETYPES = ["AO", "SS", "EA", "HI"] as const;
export type ArchetypeCode = (typeof ARCHETYPES)[number];

export const AreaSchema = z.object({
  diagnosis: z.string().min(40).max(800),
  rootBehavior: z.string().min(10).max(220),
  weekPlan: z.array(z.string().min(4).max(200)).length(7),
  exercise: z.object({
    title: z.string().min(3).max(80),
    steps: z.array(z.string().min(4).max(220)).min(3).max(5),
  }),
});
export type Area = z.infer<typeof AreaSchema>;

export const DiagnosisSchema = z.object({
  greeting: z.string().min(10).max(220),
  invisiblePattern: z.string().min(200).max(1400),
  areas: z.object({
    money: AreaSchema,
    career: AreaSchema,
    love: AreaSchema,
    personal: AreaSchema,
  }),
  protocol7d: z.array(
    z.object({
      day: z.number().int().min(1).max(7),
      action: z.string().min(4).max(220),
      cue: z.string().min(4).max(160),
    }),
  ).length(7),
  triggers: z.array(
    z.object({
      trigger: z.string().min(4).max(160),
      counter: z.string().min(4).max(220),
    }),
  ).length(5),
});
export type Diagnosis = z.infer<typeof DiagnosisSchema>;

/** JSON Schema (draft-7) usado no tool-call forçado da AI Gateway. */
export const DiagnosisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["greeting", "invisiblePattern", "areas", "protocol7d", "triggers"],
  properties: {
    greeting: { type: "string" },
    invisiblePattern: { type: "string" },
    areas: {
      type: "object",
      additionalProperties: false,
      required: ["money", "career", "love", "personal"],
      properties: {
        money: { $ref: "#/$defs/area" },
        career: { $ref: "#/$defs/area" },
        love: { $ref: "#/$defs/area" },
        personal: { $ref: "#/$defs/area" },
      },
    },
    protocol7d: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "action", "cue"],
        properties: {
          day: { type: "integer", minimum: 1, maximum: 7 },
          action: { type: "string" },
          cue: { type: "string" },
        },
      },
    },
    triggers: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["trigger", "counter"],
        properties: {
          trigger: { type: "string" },
          counter: { type: "string" },
        },
      },
    },
  },
  $defs: {
    area: {
      type: "object",
      additionalProperties: false,
      required: ["diagnosis", "rootBehavior", "weekPlan", "exercise"],
      properties: {
        diagnosis: { type: "string" },
        rootBehavior: { type: "string" },
        weekPlan: {
          type: "array",
          minItems: 7,
          maxItems: 7,
          items: { type: "string" },
        },
        exercise: {
          type: "object",
          additionalProperties: false,
          required: ["title", "steps"],
          properties: {
            title: { type: "string" },
            steps: {
              type: "array",
              minItems: 3,
              maxItems: 5,
              items: { type: "string" },
            },
          },
        },
      },
    },
  },
} as const;