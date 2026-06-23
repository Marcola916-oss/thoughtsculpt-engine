import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useI18n } from "../lib/i18n/LanguageProvider";
import { generateDiagnosisPdf } from "@/lib/pdf/generate.functions";
import { sendDiagnosisEmail } from "@/lib/email/send-diagnosis.functions";
import { MarbleBust } from "@/components/identity";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { Atmosphere } from "@/components/atmosphere";

export const Route = createFileRoute("/obrigado")({
  head: () => ({ meta: [{ title: "Obrigado — MindReset" }] }),
  component: ThankYouPage,
  validateSearch: (
    search: Record<string, unknown>,
  ): { session_id?: string; lead?: string; ob1?: number; ob2?: number } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
    lead: typeof search.lead === "string" ? search.lead : undefined,
    ob1: typeof search.ob1 === "number" ? search.ob1 : undefined,
    ob2: typeof search.ob2 === "number" ? search.ob2 : undefined,
  }),
});

const COPY: Record<string, {
  title: string;
  generating: string;
  generatingHint: string;
  ready: string;
  readySub: string;
  download: string;
  error: string;
  retry: string;
  back: string;
  fromCache: string;
}> = {
  pt: {
    title: "O teu diagnóstico está pronto",
    generating: "A gerar o teu diagnóstico…",
    generatingHint: "Cruzando 4 áreas da vida com o teu padrão comportamental. Demora 20–40 segundos.",
    ready: "Pronto.",
    readySub: "Documento confidencial, 14 páginas, lido em 12 minutos. Lê-o uma vez por semana durante 30 dias.",
    download: "Abrir o diagnóstico",
    error: "Algo correu mal. Toca em tentar novamente.",
    retry: "Tentar novamente",
    back: "Voltar ao início",
    fromCache: "Recuperado do teu histórico.",
  },
  en: {
    title: "Your diagnosis is ready",
    generating: "Generating your diagnosis…",
    generatingHint: "Crossing 4 life areas with your behavioral pattern. Takes 20–40 seconds.",
    ready: "Ready.",
    readySub: "Confidential document, 14 pages, 12-minute read. Read it once a week for 30 days.",
    download: "Open the diagnosis",
    error: "Something went wrong. Tap to retry.",
    retry: "Try again",
    back: "Back to start",
    fromCache: "Recovered from your history.",
  },
  pl: {
    title: "Twoja diagnoza jest gotowa",
    generating: "Generuję twoją diagnozę…",
    generatingHint: "Łączę 4 obszary życia z twoim wzorcem zachowania. Trwa 20–40 sekund.",
    ready: "Gotowe.",
    readySub: "Dokument poufny, 14 stron, czas czytania 12 min. Czytaj raz w tygodniu przez 30 dni.",
    download: "Otwórz diagnozę",
    error: "Coś poszło nie tak. Spróbuj ponownie.",
    retry: "Spróbuj ponownie",
    back: "Powrót",
    fromCache: "Odzyskane z twojej historii.",
  },
  ro: {
    title: "Diagnosticul tău este gata",
    generating: "Se generează diagnosticul tău…",
    generatingHint: "Încrucișez 4 arii de viață cu tiparul tău comportamental. Durează 20–40 secunde.",
    ready: "Gata.",
    readySub: "Document confidențial, 14 pagini, lectură de 12 min. Citește-l o dată pe săptămână timp de 30 de zile.",
    download: "Deschide diagnosticul",
    error: "Ceva a mers prost. Apasă pentru reîncercare.",
    retry: "Încearcă din nou",
    back: "Înapoi",
    fromCache: "Recuperat din istoricul tău.",
  },
  ar: {
    title: "تشخيصك جاهز",
    generating: "نُنشئ تشخيصك الآن…",
    generatingHint: "نمزج أربع مجالات في حياتك مع نمطك السلوكي. يستغرق 20–40 ثانية.",
    ready: "جاهز.",
    readySub: "وثيقة سرّية من 14 صفحة، قراءة 12 دقيقة. اقرأها مرّة في الأسبوع لمدّة ثلاثين يومًا.",
    download: "افتح التشخيص",
    error: "حدث خطأ. اضغط للمحاولة من جديد.",
    retry: "أعد المحاولة",
    back: "العودة",
    fromCache: "مُستردّ من سجلّك.",
  },
};

function ThankYouPage() {
  const { lang } = useI18n();
  const { lead } = useSearch({ from: "/obrigado" });
  const copy = COPY[lang] ?? COPY.en;
  const generate = useServerFn(generateDiagnosisPdf);
  const sendEmail = useServerFn(sendDiagnosisEmail);

  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "generating" }
    | { kind: "ready"; url: string; fromCache: boolean }
    | { kind: "error"; message: string }
  >({ kind: lead ? "generating" : "idle" });

  const ranOnce = useRef(false);

  const run = async () => {
    if (!lead) return;
    setState({ kind: "generating" });
    try {
      const res = await generate({ data: { leadId: lead } });
      setState({ kind: "ready", url: res.url, fromCache: res.fromCache });
      // Fire-and-forget: deliver PDF link to the user's inbox.
      sendEmail({ data: { leadId: lead, url: res.url } }).catch((err) => {
        console.error("[sendDiagnosisEmail]", err);
      });
    } catch (e) {
      setState({ kind: "error", message: (e as Error).message ?? "Unknown error" });
    }
  };

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Atmosphere fog="subtle" symbols="sparse" scan="off">
      <section className="flex min-h-screen items-center justify-center bg-transparent px-4 py-20 text-white">
        <div className="w-full max-w-xl text-center">
          <h1 className="font-display text-3xl md:text-5xl font-black italic uppercase tracking-tight leading-tight">
            {copy.title}
          </h1>

          {state.kind === "generating" && (
            <div className="mt-10 flex flex-col items-center gap-6">
              <MarbleBust size={140} variant="loader" intensity="dramatic" />
              <p className="text-base md:text-lg text-foreground/80">
                {copy.generating}
              </p>
              <p className="max-w-md text-sm text-foreground/55">{copy.generatingHint}</p>
            </div>
          )}

          {state.kind === "ready" && (
            <div className="mt-10 flex flex-col items-center gap-6">
              <p className="text-base md:text-lg text-foreground/85">{copy.readySub}</p>
              <ButtonPress>
                <a
                  href={state.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-[#CC0000] px-10 py-4 text-base font-black italic uppercase tracking-tight text-white transition hover:scale-[1.03]"
                >
                  {copy.download}
                </a>
              </ButtonPress>
              {state.fromCache && (
                <p className="text-xs uppercase tracking-[0.18em] text-foreground/50">
                  {copy.fromCache}
                </p>
              )}
              <Link to="/" className="mt-2 text-sm text-foreground/55 hover:text-white transition">
                {copy.back}
              </Link>
            </div>
          )}

          {state.kind === "error" && (
            <div className="mt-10 flex flex-col items-center gap-5">
              <p className="text-base text-foreground/80">{copy.error}</p>
              <button
                onClick={run}
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-8 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:border-[#CC0000] hover:bg-[#CC0000]/10"
              >
                {copy.retry}
              </button>
              <pre className="max-w-md whitespace-pre-wrap text-xs text-foreground/40">
                {state.message}
              </pre>
            </div>
          )}

          {state.kind === "idle" && (
            <p className="mt-6 text-foreground/70">{copy.readySub}</p>
          )}
        </div>
      </section>
    </Atmosphere>
  );
}
