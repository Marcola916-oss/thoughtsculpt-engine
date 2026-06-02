import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "../integrations/supabase/client.server";
import { scoreAnswers } from "./quiz/scoring";

const SaveLeadInput = z.object({
  display_name: z.string().min(1).max(80),
  gender: z.enum(["m", "f", "n"]).optional(),
  email: z.string().email().max(255),
  lang: z.string().min(2).max(8),
  country: z.string().max(8).nullable().optional(),
  currency: z.string().min(3).max(8),
  answers: z.array(z.number().int().min(0).max(3).nullable()).length(8),
  user_agent: z.string().max(500).optional(),
});

export const saveQuizLead = createServerFn({ method: "POST" })
  .inputValidator((d) => SaveLeadInput.parse(d))
  .handler(async ({ data }) => {
    const result = scoreAnswers(data.answers as Array<number | null>);
    const { data: row, error } = await supabaseAdmin
      .from("quiz_leads")
      .insert({
        display_name: data.display_name,
        email: data.email,
        lang: data.lang,
        country: data.country ?? null,
        currency: data.currency,
        answers: data.answers,
        scores: result.scores,
        winner: result.winner,
        user_agent: data.user_agent ?? null,
      })
      .select("id, share_token, winner")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getSharedQuiz = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string().min(8).max(64) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin.rpc("get_shared_quiz", { _token: data.token });
    if (error) throw new Error(error.message);
    return Array.isArray(row) ? row[0] ?? null : row;
  });

export const trackShare = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    share_token: z.string().min(8).max(64),
    channel: z.enum(["whatsapp", "x", "facebook", "copy", "other"]),
  }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("viral_shares").insert({
      share_token: data.share_token,
      channel: data.channel,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });