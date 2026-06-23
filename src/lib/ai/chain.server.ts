/**
 * Phase C — Cadeia de modelos com tool-call estruturado.
 * Tenta na ordem; primeiro que devolve JSON válido pelo schema vence.
 * Registra cada tentativa (sem PII) em `attempts`.
 */
import type { JSONSchema7 } from "json-schema";

/**
 * Multi-provider AI chain. All providers below are OpenAI-compatible
 * (chat/completions + tool-calling), so we unify on one request shape.
 *
 *   1) Groq      — free tier, ~30 req/min, fast llama 3.3 70B
 *   2) OpenAI    — paid, gpt-4o-mini fallback
 *   3) Lovable   — Gemini via Lovable AI Gateway (last resort, when LOVABLE_API_KEY present)
 */

type ProviderId = "groq" | "openai" | "lovable";

interface ProviderConfig {
  id: ProviderId;
  url: string;
  key: string | undefined;
}

function providers(): Record<ProviderId, ProviderConfig> {
  return {
    groq: {
      id: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: process.env.GROQ_API_KEY,
    },
    openai: {
      id: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      key: process.env.OPENAI_API_KEY,
    },
    lovable: {
      id: "lovable",
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      key: process.env.LOVABLE_API_KEY,
    },
  };
}

export type Attempt = {
  provider: ProviderId;
  model: string;
  ok: boolean;
  latency_ms: number;
  status?: number;
  error?: string;
};

export type ChainModel = { provider: ProviderId; model: string };

export interface ChainOptions<T> {
  models: ChainModel[];
  system: string;
  user: string;
  schema: { name: string; description?: string; schema: JSONSchema7 };
  validate: (json: unknown) => T; // zod parser
  temperature?: number;
}

export interface ChainResult<T> {
  data: T;
  provider: ProviderId;
  model: string;
  attempts: Attempt[];
}

export async function callAIChain<T>(opts: ChainOptions<T>): Promise<ChainResult<T>> {
  const cfgs = providers();
  const attempts: Attempt[] = [];

  for (const { provider, model } of opts.models) {
    const cfg = cfgs[provider];
    if (!cfg.key) {
      attempts.push({ provider, model, ok: false, latency_ms: 0, error: `${provider.toUpperCase()}_API_KEY not configured` });
      continue;
    }
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

      const res = await fetch(cfg.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const latency = Date.now() - started;

      if (!res.ok) {
        const text = await res.text();
        attempts.push({ provider, model, ok: false, latency_ms: latency, status: res.status, error: text.slice(0, 240) });
        continue;
      }

      const json = await res.json();
      const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) {
        attempts.push({ provider, model, ok: false, latency_ms: latency, error: "no tool_call returned" });
        continue;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(args);
      } catch (e) {
        attempts.push({ provider, model, ok: false, latency_ms: latency, error: `JSON.parse failed: ${(e as Error).message}` });
        continue;
      }

      let validated: T;
      try {
        validated = opts.validate(parsed);
      } catch (e) {
        attempts.push({ provider, model, ok: false, latency_ms: latency, error: `schema invalid: ${(e as Error).message.slice(0, 180)}` });
        continue;
      }

      attempts.push({ provider, model, ok: true, latency_ms: latency });
      return { data: validated, provider, model, attempts };
    } catch (e) {
      attempts.push({ provider, model, ok: false, latency_ms: Date.now() - started, error: (e as Error).message.slice(0, 240) });
    }
  }

  const err = new Error(`AI chain exhausted (${opts.models.length} models)`);
  (err as Error & { attempts: Attempt[] }).attempts = attempts;
  throw err;
}