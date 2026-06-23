import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DiagnosisSchema, DiagnosisJsonSchema, ARCHETYPES } from "@/lib/ai/diagnosis-schema";
import type { ArchetypeCode } from "@/lib/ai/diagnosis-schema";

const LANGS = ["pt", "en", "pl", "ro", "ar"] as const;

const Input = z.object({
  leadId: z.string().uuid(),
});

/**
 * Phase C — server fn: gera (ou recupera do cache) o PDF do diagnóstico.
 * Aberta nesta fase; Fase D liga ao order_id verificado pelo webhook Stripe.
 * Retorna { url, fromCache, model } — o componente faz redirect/download.
 */
export const generateDiagnosisPdf = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    // Dynamic import: keeps admin client + react-pdf out of the client bundle graph.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { callAIChain } = await import("@/lib/ai/chain.server");
    const { buildDiagnosisPrompt } = await import("@/lib/ai/diagnosis-prompts");
    const { computeAreaScores } = await import("@/lib/funnel/area-scores");
    const { DiagnosisDocument } = await import("./Document");
    const { pdf } = await import("@react-pdf/renderer");
    const { createElement } = await import("react");
    const { createHash } = await import("crypto");

    /* 1) lead */
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from("quiz_leads")
      .select("id, display_name, email, lang, answers, winner, scores")
      .eq("id", data.leadId)
      .maybeSingle();
    if (leadErr) throw new Error(`lead fetch: ${leadErr.message}`);
    if (!lead) throw new Error("Lead not found");
    if (!lead.winner || !ARCHETYPES.includes(lead.winner as ArchetypeCode)) {
      throw new Error("Lead has no resolved archetype");
    }
    const archetype = lead.winner as ArchetypeCode;
    const lang = (LANGS.includes(lead.lang as (typeof LANGS)[number]) ? lead.lang : "en") as
      | "pt" | "en" | "pl" | "ro" | "ar";
    const name = (lead.display_name || "").trim() || "Visitante";
    const answers = lead.answers as Array<number | null>;
    const { areas: areaScores } = computeAreaScores(answers);
    const archetypeScores = (lead.scores as Record<ArchetypeCode, number>) ?? { AO: 0, SS: 0, EA: 0, HI: 0 };

    /* 2) cache lookup */
    const hashInput = JSON.stringify({ name, archetype, lang, areaScores, v: 1 });
    const content_hash = createHash("sha256").update(hashInput).digest("hex");

    const { data: hit } = await supabaseAdmin
      .from("pdf_generations")
      .select("id, signed_url, expires_at, status, storage_path")
      .eq("content_hash", content_hash)
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (hit?.signed_url && hit.expires_at && new Date(hit.expires_at) > new Date()) {
      return { url: hit.signed_url, fromCache: true as const, model: null as string | null };
    }

    /* 3) row reservation */
    const { data: row, error: insErr } = await supabaseAdmin
      .from("pdf_generations")
      .insert({
        lead_id: lead.id,
        archetype,
        lang,
        content_hash,
        status: "generating",
      })
      .select("id")
      .single();
    if (insErr) throw new Error(`reserve row: ${insErr.message}`);
    const rowId = row.id;

    try {
      /* 4) AI chain */
      const prompt = buildDiagnosisPrompt({
        name,
        archetype,
        lang,
        areaScores,
        archetypeScores,
      });

      const chain = await callAIChain({
        models: [
          "google/gemini-3-flash-preview",
          "google/gemini-2.5-flash",
          "google/gemini-2.5-flash-lite",
          "google/gemini-2.5-pro",
        ],
        system: prompt.system,
        user: prompt.user,
        schema: {
          name: "deliver_diagnosis",
          description: "Deliver the full structured behavioral diagnosis.",
          schema: DiagnosisJsonSchema as never,
        },
        validate: (j) => DiagnosisSchema.parse(j),
        temperature: 0.75,
      });

      /* 5) PDF render */
      const element = createElement(DiagnosisDocument, {
        name,
        archetype,
        lang,
        areaScores,
        diagnosis: chain.data,
      });
      const pdfInstance = pdf(element as never);
      const blob = await pdfInstance.toBlob();
      const buf = new Uint8Array(await blob.arrayBuffer());

      /* 6) upload */
      const path = `${archetype}/${lang}/${rowId}.pdf`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("diagnoses")
        .upload(path, buf, { contentType: "application/pdf", upsert: true });
      if (upErr) throw new Error(`upload: ${upErr.message}`);

      /* 7) sign URL (30d) */
      const SIGN_SECONDS = 60 * 60 * 24 * 30;
      const { data: signed, error: signErr } = await supabaseAdmin.storage
        .from("diagnoses")
        .createSignedUrl(path, SIGN_SECONDS);
      if (signErr || !signed) throw new Error(`sign: ${signErr?.message ?? "no url"}`);

      const expires_at = new Date(Date.now() + SIGN_SECONDS * 1000).toISOString();

      /* 8) persist */
      await supabaseAdmin
        .from("pdf_generations")
        .update({
          status: "ready",
          storage_path: path,
          signed_url: signed.signedUrl,
          expires_at,
          attempts: chain.attempts as never,
        })
        .eq("id", rowId);

      return { url: signed.signedUrl, fromCache: false as const, model: chain.model };
    } catch (e) {
      const msg = (e as Error).message ?? String(e);
      const attempts = (e as Error & { attempts?: unknown }).attempts ?? [];
      await supabaseAdmin
        .from("pdf_generations")
        .update({ status: "failed", error: msg.slice(0, 480), attempts: attempts as never })
        .eq("id", rowId);
      throw new Error(msg);
    }
  });