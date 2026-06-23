import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

const MAX_AGE_SECONDS = 60 * 5;

/**
 * Fase D4 — Webhook Stripe. Verifica assinatura HMAC, dedupe por event_id,
 * marca a `orders` consoante o evento. Sempre 200 em eventos válidos.
 */
export const Route = createFileRoute("/api/public/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) return new Response("misconfigured", { status: 500 });

        const sigHeader = request.headers.get("stripe-signature") ?? "";
        const raw = await request.text();

        if (!verifyStripeSignature(raw, sigHeader, secret)) {
          return new Response("invalid signature", { status: 401 });
        }

        type StripeEvent = {
          id: string;
          type: string;
          created: number;
          data: { object: Record<string, unknown> };
        };
        let event: StripeEvent;
        try {
          event = JSON.parse(raw) as StripeEvent;
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Idempotência
        const { error: dupErr } = await supabaseAdmin
          .from("stripe_events")
          .insert({ event_id: event.id, type: event.type });
        if (dupErr) {
          // PK conflict = já processado
          if (dupErr.code === "23505") return new Response("ok (dup)", { status: 200 });
          return new Response(`db: ${dupErr.message}`, { status: 500 });
        }

        try {
          await handleEvent(event, supabaseAdmin);
        } catch (e) {
          console.error("[stripe webhook]", event.type, (e as Error).message);
          // não devolver 500 — Stripe vai retentar; deixar 200 e logar
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});

type SbAdmin = Awaited<
  ReturnType<typeof import("@/integrations/supabase/client.server").then>
>["supabaseAdmin"];

async function handleEvent(
  event: { id: string; type: string; data: { object: Record<string, unknown> } },
  sb: SbAdmin,
) {
  const obj = event.data.object as Record<string, unknown>;
  const orderId =
    ((obj.metadata as Record<string, string> | undefined)?.order_id) ||
    (obj.client_reference_id as string | undefined);

  if (!orderId) {
    console.warn("[stripe webhook] event without order_id", event.type, event.id);
    return;
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const status = (obj.payment_status as string) === "paid" ? "paid" : "pending";
      await sb
        .from("orders")
        .update({
          status,
          stripe_payment_intent: (obj.payment_intent as string) ?? null,
          customer_email:
            ((obj.customer_details as Record<string, string> | undefined)?.email) ||
            (obj.customer_email as string | undefined) ||
            null,
          paid_at: status === "paid" ? new Date().toISOString() : null,
          raw_event: event as never,
        })
        .eq("id", orderId);
      break;
    }
    case "checkout.session.async_payment_failed": {
      await sb.from("orders").update({ status: "failed", raw_event: event as never }).eq("id", orderId);
      break;
    }
    case "checkout.session.expired": {
      await sb.from("orders").update({ status: "expired", raw_event: event as never }).eq("id", orderId);
      break;
    }
    case "charge.refunded": {
      await sb.from("orders").update({ status: "refunded", raw_event: event as never }).eq("id", orderId);
      break;
    }
    default:
      // ignorado
      break;
  }
}

function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i), p.slice(i + 1)];
    }),
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;

  // tolerância temporal
  const ts = Number(t);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > MAX_AGE_SECONDS) return false;

  const signed = `${t}.${payload}`;
  const expected = createHmac("sha256", secret).update(signed).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}