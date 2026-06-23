import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ orderId: z.string().uuid() });

/**
 * Fase D5 — devolve o estado da order para o /obrigado decidir.
 * Usa RPC SECURITY DEFINER `get_order_status` (não expõe restantes campos).
 */
export const verifyOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("get_order_status", {
      _id: data.orderId,
    });
    if (error) throw new Error(`rpc: ${error.message}`);
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) return { found: false as const };
    return {
      found: true as const,
      status: row.status as "pending" | "paid" | "failed" | "expired" | "refunded",
      leadId: row.lead_id as string,
    };
  });