import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  leadId: z.string().uuid(),
  url: z.string().url(),
});

type Lang = "pt" | "en" | "pl" | "ro" | "ar";
const LANGS: readonly Lang[] = ["pt", "en", "pl", "ro", "ar"] as const;

const COPY: Record<Lang, { subject: (n: string) => string; intro: string; cta: string; footer: string; note: string }> = {
  pt: {
    subject: (n) => `${n}, o teu diagnóstico MindReset chegou`,
    intro: "O teu diagnóstico comportamental está pronto. Carrega no botão abaixo para abrir o PDF (link válido por 30 dias).",
    cta: "Abrir o meu diagnóstico",
    note: "Guarda este e-mail — é a tua cópia oficial.",
    footer: "MindReset — Psicologia comportamental financeira.",
  },
  en: {
    subject: (n) => `${n}, your MindReset diagnosis is ready`,
    intro: "Your behavioral diagnosis is ready. Tap the button below to open the PDF (link valid for 30 days).",
    cta: "Open my diagnosis",
    note: "Keep this email — it's your official copy.",
    footer: "MindReset — Behavioral financial psychology.",
  },
  pl: {
    subject: (n) => `${n}, Twoja diagnoza MindReset jest gotowa`,
    intro: "Twoja diagnoza behawioralna jest gotowa. Kliknij przycisk poniżej, aby otworzyć PDF (link ważny 30 dni).",
    cta: "Otwórz moją diagnozę",
    note: "Zachowaj tę wiadomość — to Twoja oficjalna kopia.",
    footer: "MindReset — Behawioralna psychologia finansowa.",
  },
  ro: {
    subject: (n) => `${n}, diagnoza ta MindReset este gata`,
    intro: "Diagnoza ta comportamentală este gata. Apasă butonul de mai jos pentru a deschide PDF-ul (link valabil 30 de zile).",
    cta: "Deschide diagnoza mea",
    note: "Păstrează acest e-mail — este copia ta oficială.",
    footer: "MindReset — Psihologie financiară comportamentală.",
  },
  ar: {
    subject: (n) => `${n}، تشخيصك من MindReset جاهز`,
    intro: "تشخيصك السلوكي جاهز. اضغط الزر أدناه لفتح ملف PDF (الرابط صالح لمدة 30 يومًا).",
    cta: "افتح تشخيصي",
    note: "احتفظ بهذا البريد — إنه نسختك الرسمية.",
    footer: "MindReset — علم النفس السلوكي المالي.",
  },
};

// P0.7 — Greeting por locale. Antes: "Olá" para PT e para todos os outros
// exceto AR. Agora: cada idioma tem seu cumprimento correto.
const GREETING: Record<Lang, string> = {
  pt: "Olá",
  en: "Hello",
  pl: "Cześć",
  ro: "Salut",
  ar: "السلام عليكم",
};

function renderHtml(opts: { name: string; url: string; lang: Lang }) {
  const c = COPY[opts.lang];
  const dir = opts.lang === "ar" ? "rtl" : "ltr";
  const greeting = GREETING[opts.lang] ?? GREETING.en;
  const hi = opts.name ? `${greeting} ${opts.name},` : "";
  return `<!doctype html>
<html dir="${dir}" lang="${opts.lang}">
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;color:#F5F5F7">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0D0D0D;border:1px solid #2A2A2A;border-radius:16px;padding:40px 32px">
        <tr><td>
          <div style="font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:-0.02em;font-size:28px;color:#F5F5F7;margin-bottom:24px">MindReset</div>
          <p style="margin:0 0 12px;color:#F5F5F7;font-size:16px">${hi}</p>
          <p style="margin:0 0 28px;color:#C9CACC;font-size:15px;line-height:1.55">${c.intro}</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:999px;background:#CC0000">
            <a href="${opts.url}" target="_blank" style="display:inline-block;padding:14px 28px;color:#fff;text-decoration:none;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:-0.01em;font-size:15px">${c.cta}</a>
          </td></tr></table>
          <p style="margin:32px 0 0;color:#929698;font-size:13px;line-height:1.5">${c.note}</p>
          <hr style="border:none;border-top:1px solid #2A2A2A;margin:28px 0"/>
          <p style="margin:0;color:#6b6e70;font-size:12px">${c.footer}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export const sendDiagnosisEmail = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY missing");

    const senderEmail = process.env.BREVO_SENDER_EMAIL || "diagnostico@mindreset.app";
    const senderName = process.env.BREVO_SENDER_NAME || "MindReset";

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lead, error } = await supabaseAdmin
      .from("quiz_leads")
      .select("id, display_name, email, lang")
      .eq("id", data.leadId)
      .maybeSingle();
    if (error) throw new Error(`lead fetch: ${error.message}`);
    if (!lead?.email) throw new Error("Lead has no email");

    const lang = (LANGS.includes(lead.lang as Lang) ? lead.lang : "en") as Lang;
    const name = (lead.display_name || "").trim() || (lang === "pt" ? "Visitante" : "Friend");
    const html = renderHtml({ name, url: data.url, lang });

    const res = await fetch("https://connector-gateway.lovable.dev/brevo/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: lead.email, name }],
        subject: COPY[lang].subject(name),
        htmlContent: html,
        tags: ["diagnosis", lang],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Brevo ${res.status}: ${body.slice(0, 300)}`);
    }
    const json = (await res.json()) as { messageId?: string };
    return { ok: true as const, messageId: json.messageId ?? null };
  });