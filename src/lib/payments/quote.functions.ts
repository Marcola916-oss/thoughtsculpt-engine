import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  lang: z.string().min(2).max(5),
  bumps: z.array(z.enum(["bump1", "bump2"])).max(2).default([]),
});

/**
 * Quote autoritativo do checkout — mesma função usada na criação da
 * Stripe Checkout Session. UI mostra o que o Stripe vai cobrar.
 */
export const getCheckoutQuote = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const { buildQuote } = await import("@/lib/funnel/pricing.server");
    const q = buildQuote(data.lang, data.bumps);
    return {
      currency: q.currency,
      totalCents: q.totalCents,
      prices: q.prices,
    };
  });