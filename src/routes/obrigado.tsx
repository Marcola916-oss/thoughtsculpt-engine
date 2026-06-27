import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useI18n } from "../lib/i18n/LanguageProvider";
import { generateDiagnosisPdf } from "@/lib/pdf/generate.functions";
import { track, EVENTS } from "@/lib/analytics";
import { sendDiagnosisEmail } from "@/lib/email/send-diagnosis.functions";
import { verifyOrderStatus } from "@/lib/payments/verify.functions";
import { MarbleBust } from "@/components/identity";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { Atmosphere } from "@/components/atmosphere";
import { motion } from "framer-motion";
import { Check, Mail, FileText, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/obrigado")({
  head: () => ({ meta: [{ title: "Obrigado — MindReset" }] }),
  component: ThankYouPage,
  validateSearch: (
    search: Record<string, unknown>,
  ): { session_id?: string; lead?: string; order?: string; ob1?: number; ob2?: number } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
    lead: typeof search.lead === "string" ? search.lead : undefined,
    order: typeof search.order === "string" ? search.order : undefined,
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
  verifying: string;
  verifyingHint: string;
  paymentFailed: string;
  paymentPending: string;
  refresh: string;
  confirmedTitle: (name: string) => string;
  sentTo: (email: string) => string;
  whatYouBought: string;
  itemPdfTitle: string;
  itemPdfDesc: string;
  itemEmailTitle: string;
  itemEmailDesc: string;
  howToUse: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  supportTitle: string;
  supportEmail: string;
  upsellTitle: string;
  upsellDesc: string;
  upsellCta: string;
  upsellDecline: string;
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
    verifying: "A confirmar o teu pagamento…",
    verifyingHint: "Demora 2–5 segundos. Não feches esta página.",
    paymentFailed: "O pagamento não foi confirmado.",
    paymentPending: "O teu pagamento ainda está em processamento. Volta dentro de minutos.",
    refresh: "Atualizar",
    confirmedTitle: (n) => `Diagnóstico confirmado, ${n}!`,
    sentTo: (e) => `Enviámos uma cópia para ${e}`,
    whatYouBought: "O que recebeste",
    itemPdfTitle: "Diagnóstico Comportamental — PDF",
    itemPdfDesc: "14 páginas. 4 áreas da vida. Personalizado ao teu arquétipo.",
    itemEmailTitle: "Cópia oficial por email",
    itemEmailDesc: "Link válido 30 dias. Guarda-o como backup.",
    howToUse: "Como usar",
    step1: "Abre o PDF agora. Lê de uma vez (12 min).",
    step2: "Marca as 3 frases que mais te incomodam.",
    step3: "Volta ao documento 1 vez por semana, durante 30 dias.",
    step4: "Aplica 1 micro-acção por semana. Sem pressa.",
    supportTitle: "Dúvidas?",
    supportEmail: "suporte@mindreset.app",
    upsellTitle: "Protocolo de 30 Dias — Apenas +$14",
    upsellDesc: "Recebe um plano diário personalizado com tarefas reflexivas e de ação para os próximos 30 dias.",
    upsellCta: "Adicionar Protocolo +$14",
    upsellDecline: "Agora não, obrigado",
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
    verifying: "Confirming your payment…",
    verifyingHint: "Takes 2–5 seconds. Don't close this page.",
    paymentFailed: "Your payment wasn't confirmed.",
    paymentPending: "Your payment is still processing. Come back in a few minutes.",
    refresh: "Refresh",
    confirmedTitle: (n) => `Diagnosis confirmed, ${n}!`,
    sentTo: (e) => `We sent a copy to ${e}`,
    whatYouBought: "What you got",
    itemPdfTitle: "Behavioral Diagnosis — PDF",
    itemPdfDesc: "14 pages. 4 life areas. Personalized to your archetype.",
    itemEmailTitle: "Official copy by email",
    itemEmailDesc: "Link valid for 30 days. Keep it as a backup.",
    howToUse: "How to use it",
    step1: "Open the PDF now. Read it in one go (12 min).",
    step2: "Mark the 3 sentences that hit hardest.",
    step3: "Come back to the document once a week, for 30 days.",
    step4: "Apply 1 micro-action per week. No rush.",
    supportTitle: "Questions?",
    supportEmail: "support@mindreset.app",
    upsellTitle: "30-Day Protocol — Just +$14",
    upsellDesc: "Get a personalized daily plan with reflective and action tasks for the next 30 days.",
    upsellCta: "Add Protocol +$14",
    upsellDecline: "Not now, thanks",
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
    verifying: "Potwierdzam płatność…",
    verifyingHint: "Trwa 2–5 sekund. Nie zamykaj strony.",
    paymentFailed: "Płatność nie została potwierdzona.",
    paymentPending: "Twoja płatność jest jeszcze przetwarzana. Wróć za kilka minut.",
    refresh: "Odśwież",
    confirmedTitle: (n) => `Diagnoza potwierdzona, ${n}!`,
    sentTo: (e) => `Wysłaliśmy kopię na ${e}`,
    whatYouBought: "Co otrzymałeś",
    itemPdfTitle: "Diagnoza behawioralna — PDF",
    itemPdfDesc: "14 stron. 4 obszary życia. Spersonalizowane.",
    itemEmailTitle: "Oficjalna kopia mailem",
    itemEmailDesc: "Link ważny 30 dni. Zachowaj jako kopię.",
    howToUse: "Jak używać",
    step1: "Otwórz PDF teraz. Przeczytaj od razu (12 min).",
    step2: "Zaznacz 3 zdania, które uderzają najmocniej.",
    step3: "Wracaj do dokumentu raz w tygodniu, przez 30 dni.",
    step4: "Wprowadzaj 1 mikro-działanie tygodniowo. Bez pośpiechu.",
    supportTitle: "Pytania?",
    supportEmail: "support@mindreset.app",
    upsellTitle: "Protokół 30-dniowy — Tylko +$14",
    upsellDesc: "Otrzymaj spersonalizowany dzienny plan z zadaniami refleksyjnymi i akcji na kolejne 30 dni.",
    upsellCta: "Dodaj protokół +$14",
    upsellDecline: "Nie teraz, dziękuję",
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
    verifying: "Confirmăm plata ta…",
    verifyingHint: "Durează 2–5 secunde. Nu închide pagina.",
    paymentFailed: "Plata nu a fost confirmată.",
    paymentPending: "Plata ta este încă în procesare. Revino în câteva minute.",
    refresh: "Reîmprospătează",
    confirmedTitle: (n) => `Diagnostic confirmat, ${n}!`,
    sentTo: (e) => `Am trimis o copie la ${e}`,
    whatYouBought: "Ce ai primit",
    itemPdfTitle: "Diagnostic comportamental — PDF",
    itemPdfDesc: "14 pagini. 4 arii de viață. Personalizat.",
    itemEmailTitle: "Copie oficială pe email",
    itemEmailDesc: "Link valabil 30 de zile. Păstrează-l.",
    howToUse: "Cum să-l folosești",
    step1: "Deschide PDF-ul acum. Citește-l dintr-o dată (12 min).",
    step2: "Marchează 3 fraze care te ating cel mai tare.",
    step3: "Revino la document o dată pe săptămână, 30 de zile.",
    step4: "Aplică 1 micro-acțiune pe săptămână. Fără grabă.",
    supportTitle: "Întrebări?",
    supportEmail: "support@mindreset.app",
    upsellTitle: "Protocol de 30 de zile — Doar +$14",
    upsellDesc: "Primește un plan zilnic personalizat cu sarcini reflective și de acțiune pentru următoarele 30 de zile.",
    upsellCta: "Adaugă Protocol +$14",
    upsellDecline: "Nu acum, mulțumesc",
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
    verifying: "نؤكّد دفعتك…",
    verifyingHint: "يستغرق 2-5 ثوانٍ. لا تُغلق الصفحة.",
    paymentFailed: "لم يتم تأكيد دفعتك.",
    paymentPending: "دفعتك لا تزال قيد المعالجة. عُد بعد بضع دقائق.",
    refresh: "تحديث",
    confirmedTitle: (n) => `تم تأكيد التشخيص، ${n}!`,
    sentTo: (e) => `أرسلنا نسخة إلى ${e}`,
    whatYouBought: "ما حصلت عليه",
    itemPdfTitle: "التشخيص السلوكي — PDF",
    itemPdfDesc: "14 صفحة. 4 مجالات حياتية. مخصّص لك.",
    itemEmailTitle: "نسخة رسمية عبر البريد",
    itemEmailDesc: "الرابط صالح 30 يومًا. احتفظ به.",
    howToUse: "كيف تستخدمه",
    step1: "افتح ملف PDF الآن. اقرأه دفعة واحدة (12 دقيقة).",
    step2: "حدّد الجمل الثلاث الأكثر تأثيرًا فيك.",
    step3: "عُد إلى المستند مرّة كل أسبوع، لمدة 30 يومًا.",
    step4: "طبّق إجراءً صغيرًا واحدًا كل أسبوع. دون استعجال.",
    supportTitle: "أسئلة؟",
    supportEmail: "support@mindreset.app",
    upsellTitle: "بروتوكول 30 يومًا — فقط +$14",
    upsellDesc: "احصل على خطة يومية مخصصة مع مهام تأملية وإجرائية للأيام الثلاثين المقبلة.",
    upsellCta: "أضف البروتوكول +$14",
    upsellDecline: "ليس الآن، شكراً",
  },
};

function ThankYouPage() {
  const { lang } = useI18n();
  const { lead, order } = useSearch({ from: "/obrigado" });
  const copy = COPY[lang] ?? COPY.en;
  const generate = useServerFn(generateDiagnosisPdf);
  const sendEmail = useServerFn(sendDiagnosisEmail);
  const verify = useServerFn(verifyOrderStatus);

  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "verifying" }
    | { kind: "paymentFailed" }
    | { kind: "paymentPending" }
    | { kind: "generating" }
    | { kind: "ready"; url: string; fromCache: boolean; name: string; email: string | null }
    | { kind: "error"; message: string }
  >({ kind: order ? "verifying" : lead ? "generating" : "idle" });

  const ranOnce = useRef(false);

  const runPdf = async (leadId: string) => {
    setState({ kind: "generating" });
    try {
      const res = await generate({ data: { leadId } });
      setState({
        kind: "ready",
        url: res.url,
        fromCache: res.fromCache,
        name: res.name,
        email: res.email,
      });
      track(EVENTS.PURCHASE_COMPLETED, {
        archetype: res.archetype,
        from_cache: res.fromCache,
      });
      // Confetti vermelho sutil (dynamic import — não SSR-safe)
      import("canvas-confetti")
        .then(({ default: confetti }) => {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.35 },
            colors: ["#CC0000", "#990000", "#F5F5F7"],
            ticks: 180,
            scalar: 0.9,
          });
        })
        .catch(() => {});
      sendEmail({ data: { leadId, url: res.url } }).catch((err) => {
        console.error("[sendDiagnosisEmail]", err);
      });
    } catch (e) {
      setState({ kind: "error", message: (e as Error).message ?? "Unknown error" });
    }
  };

  const run = async () => {
    // Caminho legacy: ?lead=... (sem pagamento — só usado em dev/QA)
    if (lead && !order) {
      await runPdf(lead);
      return;
    }
    if (!order) return;

    // Fluxo D5: ?order=... — polling com backoff até webhook confirmar.
    setState({ kind: "verifying" });
    const delays = [1500, 2000, 3000, 4000, 5000, 6000, 6000]; // ~27s max
    for (let i = 0; i < delays.length; i++) {
      try {
        const res = await verify({ data: { orderId: order } });
        if (!res.found) {
          setState({ kind: "error", message: "Order not found" });
          return;
        }
        if (res.status === "paid") {
          await runPdf(res.leadId);
          return;
        }
        if (res.status === "failed" || res.status === "expired" || res.status === "refunded") {
          setState({ kind: "paymentFailed" });
          return;
        }
        // pending → aguarda
      } catch (e) {
        setState({ kind: "error", message: (e as Error).message ?? "verify failed" });
        return;
      }
      await new Promise((r) => setTimeout(r, delays[i]));
    }
    setState({ kind: "paymentPending" });
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
        <div className="w-full max-w-2xl text-center">
          {state.kind !== "ready" && (
            <h1 className="font-display text-3xl md:text-5xl font-black italic uppercase tracking-tight leading-tight">
              {copy.title}
            </h1>
          )}

          {state.kind === "verifying" && (
            <div className="mt-10 flex flex-col items-center gap-6">
              <MarbleBust size={140} variant="loader" intensity="subtle" />
              <p className="text-base md:text-lg text-foreground/80">{copy.verifying}</p>
              <p className="max-w-md text-sm text-foreground/55">{copy.verifyingHint}</p>
            </div>
          )}

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
            <ReadyView
              copy={copy}
              url={state.url}
              name={state.name}
              email={state.email}
              fromCache={state.fromCache}
            />
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

          {state.kind === "paymentFailed" && (
            <div className="mt-10 flex flex-col items-center gap-5">
              <p className="text-base text-foreground/80">{copy.paymentFailed}</p>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-[#CC0000] px-8 py-3 text-sm font-black italic uppercase tracking-[0.18em] text-white transition hover:scale-[1.03]"
              >
                {copy.retry}
              </Link>
            </div>
          )}

          {state.kind === "paymentPending" && (
            <div className="mt-10 flex flex-col items-center gap-5">
              <p className="text-base text-foreground/80">{copy.paymentPending}</p>
              <button
                onClick={run}
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-8 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:border-[#CC0000] hover:bg-[#CC0000]/10"
              >
                {copy.refresh}
              </button>
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

function ReadyView({
  copy,
  url,
  name,
  email,
  fromCache,
}: {
  copy: (typeof COPY)[string];
  url: string;
  name: string | null;
  email: string | null;
  fromCache: boolean;
}) {
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellDismissed, setUpsellDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowUpsell(true);
      track(EVENTS.UPSELL_VIEW);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const displayName = (name || "").trim() || "—";
  return (
    <div className="mt-2 flex flex-col items-center gap-10 text-left">
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.6, times: [0, 0.6, 1], ease: "easeOut" }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-400/60"
        aria-hidden
      >
        <Check className="h-10 w-10 text-emerald-400" strokeWidth={3} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center"
      >
        <h1 className="font-display text-3xl md:text-5xl font-black italic uppercase tracking-tight leading-tight">
          {copy.confirmedTitle(displayName)}
        </h1>
        {email && (
          <p className="mt-4 inline-flex items-center gap-2 text-sm md:text-base text-foreground/70">
            <Mail className="h-4 w-4 text-[#CC0000]" aria-hidden />
            {copy.sentTo(email)}
          </p>
        )}
        <p className="mt-4 max-w-xl mx-auto text-sm md:text-base text-foreground/65">
          {copy.readySub}
        </p>
      </motion.div>

      {/* Primary CTA */}
      <ButtonPress>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-[#CC0000] px-10 py-4 text-base font-black italic uppercase tracking-tight text-white shadow-[0_0_40px_-12px_rgba(204,0,0,0.6)] transition hover:scale-[1.03]"
        >
          {copy.download}
        </a>
      </ButtonPress>
      {fromCache && (
        <p className="-mt-6 text-[11px] uppercase tracking-[0.18em] text-foreground/50">
          {copy.fromCache}
        </p>
      )}

      {/* What you bought */}
      <div className="w-full">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-foreground/55">
          {copy.whatYouBought}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ProductCard icon={<FileText className="h-5 w-5" />} title={copy.itemPdfTitle} desc={copy.itemPdfDesc} />
          <ProductCard icon={<Mail className="h-5 w-5" />} title={copy.itemEmailTitle} desc={copy.itemEmailDesc} />
        </div>
      </div>

      {/* Upsell — appears 2s after purchase confirmation */}
      {showUpsell && !upsellDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-2xl border border-[#CC0000]/40 bg-[#CC0000]/5 p-6"
        >
          <h3 className="font-display text-lg font-bold text-white">{copy.upsellTitle}</h3>
          <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{copy.upsellDesc}</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <ButtonPress>
              <a
                href="#"
                onClick={() => track(EVENTS.UPSELL_ACCEPTED)}
                className="inline-flex items-center justify-center rounded-full bg-[#CC0000] px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.03]"
              >
                {copy.upsellCta}
              </a>
            </ButtonPress>
            <button
              onClick={() => setUpsellDismissed(true)}
              className="text-sm text-foreground/50 hover:text-foreground/70 transition"
            >
              {copy.upsellDecline}
            </button>
          </div>
        </motion.div>
      )}

      {/* How to use */}
      <div className="w-full">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-foreground/55">
          {copy.howToUse}
        </h2>
        <ol className="space-y-3">
          {[copy.step1, copy.step2, copy.step3, copy.step4].map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-4 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D]/70 p-4"
            >
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#CC0000]/15 text-sm font-black text-[#CC0000]">
                {i + 1}
              </span>
              <span className="text-sm md:text-base text-foreground/85 leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Support */}
      <div className="w-full rounded-lg border border-[#2A2A2A] bg-[#0D0D0D]/50 p-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/55">
          {copy.supportTitle}
        </p>
        <a
          href={`mailto:${copy.supportEmail}`}
          className="mt-2 inline-flex items-center gap-2 text-sm md:text-base text-foreground hover:text-[#CC0000] transition"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          {copy.supportEmail}
        </a>
      </div>

      <Link to="/" className="text-sm text-foreground/55 hover:text-white transition">
        {copy.back}
      </Link>
    </div>
  );
}

function ProductCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D]/70 p-4 text-left">
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#CC0000]/15 text-[#CC0000]">
        {icon}
      </span>
      <div>
        <p className="text-sm md:text-base font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs md:text-sm text-foreground/65 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
