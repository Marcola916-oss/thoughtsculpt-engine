/**
 * Phase C — Cadeia de modelos com tool-call estruturado.
 * Tenta na ordem; primeiro que devolve JSON válido pelo schema vence.
 * Registra cada tentativa (sem PII) em `attempts`.
 */
import type { JSONSchema7 } from "json-schema";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type Attempt = {
  model: string;
  ok: boolean;
  latency_ms: number;
  status?: number;
  error?: string;
};

export interface ChainOptions<T> {
  models: string[];
  system: string;
  user: string;
  schema: { name: string; description?: string; schema: JSONSchema7 };
  validate: (json: unknown) => T; // zod parser
  temperature?: number;
}

export interface ChainResult<T> {
  data: T;
  model: string;
  attempts: Attempt[];
}

export async function callAIChain<T>(opts: ChainOptions<T>): Promise<ChainResult<T>> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured.");

  const attempts: Attempt[] = [];

  for (const model of opts.models) {
    const started = Date.now();
    try {
      const body = {
        model,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        temperature: opts.temperature ?? 0.7,
        tools: [
          {
            type: "function",
            function: {
              name: opts.schema.name,
              description: opts.schema.description ?? "",
              parameters: opts.schema.schema,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: opts.schema.name } },
      };

      const res = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const latency = Date.now() - started;

      if (!res.ok) {
        const text = await res.text();
        attempts.push({ model, ok: false, latency_ms: latency, status: res.status, error: text.slice(0, 240) });
        // Hard-stop on quota errors so we don't waste the next model.
        if (res.status === 402) throw new Error("AI credits exhausted (402).");
        if (res.status === 429) continue; // try next
        continue;
      }

      const json = await res.json();
      const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) {
        attempts.push({ model, ok: false, latency_ms: latency, error: "no tool_call returned" });
        continue;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(args);
      } catch (e) {
        attempts.push({ model, ok: false, latency_ms: latency, error: `JSON.parse failed: ${(e as Error).message}` });
        continue;
      }

      let validated: T;
      try {
        validated = opts.validate(parsed);
      } catch (e) {
        attempts.push({ model, ok: false, latency_ms: latency, error: `schema invalid: ${(e as Error).message.slice(0, 180)}` });
        continue;
      }

      attempts.push({ model, ok: true, latency_ms: latency });
      return { data: validated, model, attempts };
    } catch (e) {
      attempts.push({ model, ok: false, latency_ms: Date.now() - started, error: (e as Error).message.slice(0, 240) });
    }
  }

  const err = new Error(`AI chain exhausted (${opts.models.length} models)`);
  (err as Error & { attempts: Attempt[] }).attempts = attempts;
  throw err;
}