import type { JSONSchema7 } from "json-schema";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

interface AICallOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  /** Tool-calling forced JSON output (preferred over response_format) */
  jsonSchema?: { name: string; description?: string; schema: JSONSchema7 };
}

function getKey() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured.");
  return key;
}

function mapGatewayError(status: number, body: string): Error {
  if (status === 429) return new Error("AI rate limit reached. Try again in a minute.");
  if (status === 402) return new Error("AI credits exhausted. Top up your Lovable workspace.");
  return new Error(`AI gateway error ${status}: ${body.slice(0, 200)}`);
}

export async function callAI(opts: AICallOptions): Promise<string> {
  const body: Record<string, unknown> = {
    model: opts.model ?? "google/gemini-2.0-flash-lite-preview-02-05",
    messages: opts.messages,
  };
  if (opts.temperature !== undefined) body.temperature = opts.temperature;

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw mapGatewayError(res.status, await res.text());
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

/** Returns parsed JSON via forced tool call. */
export async function callAIStructured<T>(opts: AICallOptions): Promise<T> {
  if (!opts.jsonSchema) throw new Error("callAIStructured requires jsonSchema");
  const body = {
    model: opts.model ?? "google/gemini-2.0-flash-lite-preview-02-05",
    messages: opts.messages,
    tools: [
      {
        type: "function",
        function: {
          name: opts.jsonSchema.name,
          description: opts.jsonSchema.description ?? "",
          parameters: opts.jsonSchema.schema,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: opts.jsonSchema.name } },
  };

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw mapGatewayError(res.status, await res.text());
  const json = await res.json();
  const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("AI returned no structured output");
  return JSON.parse(args) as T;
}