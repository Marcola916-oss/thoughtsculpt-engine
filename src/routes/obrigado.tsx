import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  ArrowRight,
  Brain,
  Calendar as CalendarIcon,
  Compass as CompassIcon,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { getCheckoutSessionStatus } from "../lib/checkout.success";
import { useI18n } from "../lib/i18n/LanguageProvider";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { IdentitySymbol } from "@/components/identity/IdentitySymbol";
import { MarbleBust } from "@/components/identity/MarbleBust";
import { CircuitBrain, CelebrationBrain, Logo } from "@/components/identity";

export const Route = createFileRoute("/obrigado")({
  head: () => ({ meta: [{ title: "Bem-vindo ao MindReset!" }] }),
  component: ThankYouPage,
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
});

function TypewriterText({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span className={className}>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="ml-0.5"
      >
        _
      </motion.span>
    </span>
  );
}

function ThankYouPage() {
  const search = useSearch({ from: "/obrigado" });
  const sessionId = search.session_id;
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);

  const getSessionData = useServerFn(getCheckoutSessionStatus);

  const defaultPassword = "MindReset2026!";

  useEffect(() => {
    if (!sessionId) {
      setError(t.obrigado.errorHeading);
      setLoading(false);
      return;
    }
    getSessionData({ data: { session_id: sessionId } })
      .then((res) => {
        if (res?.email) setEmail(res.email);
        if (res?.displayName) setDisplayName(res.displayName);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setError(e?.message ?? t.obrigado.errorHeading);
        setLoading(false);
      });
  }, [sessionId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(defaultPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-transparent text-white">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <CircuitBrain variant="loader" size={120} withGlow animated />
        </div>
        <p className="mt-8 text-lg font-black uppercase tracking-[0.2em] text-primary animate-pulse">
          {t.obrigado.loadingTitle}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent p-4 text-white">
        <div className="rounded-2xl border border-[#CC0000]/40 bg-[#CC0000]/10 p-8 text-center max-w-md md:backdrop-blur-xl">
          <span className="text-4xl">⚠️</span>
          <h2 className="mt-4 mb-2 font-bold text-[#CC0000]">{t.obrigado.errorHeading}</h2>
          <p className="text-gray-400 leading-relaxed">{error}</p>
          <Link
            data-cursor="hover"
            to="/"
            className="mt-6 inline-block rounded-full bg-[#CC0000] px-6 py-3 font-bold text-white transition hover:scale-105"
          >
            {t.obrigado.errorGoHome}
          </Link>
        </div>
      </div>
    );
  }

  const firstName = displayName?.split(" ")[0] || t.obrigado.fallbackName;

  const steps = [
    {
      icon: Brain,
      title: t.obrigado.step1Title,
      desc: t.obrigado.step1Desc,
      href: "/dashboard/",
      color: "from-blue-500/20 to-blue-600/10",
    },
    {
      icon: CalendarIcon,
      title: t.obrigado.step2Title,
      desc: t.obrigado.step2Desc,
      href: "/_authenticated/onboarding/",
      color: "from-amber-500/20 to-amber-600/10",
    },
    {
      icon: CompassIcon,
      title: t.obrigado.step3Title,
      desc: t.obrigado.step3Desc,
      href: "/dashboard/diagnosis",
      color: "from-emerald-500/20 to-emerald-600/10",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      <div className="noise-overlay pointer-events-none z-0" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 py-12 md:py-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <Logo size="md" className="justify-center mb-4" />

            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.3 }}
              className="mb-8"
            >
              <CelebrationBrain size={180} className="mx-auto" />
            </motion.div>

            <h1 className="font-display font-black uppercase italic tracking-tighter leading-[1.1] py-2">
              {t.obrigado.welcomeHeading}
              <br />
              <TypewriterText text={firstName} className="text-[#CC0000]" />!
            </h1>
            <p className="mt-4 text-lg text-gray-400 leading-relaxed max-w-xl mx-auto">
              {t.obrigado.welcomeSub}
            </p>
          </motion.div>

          {/* Credentials Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-10 rounded-[2rem] border border-white/10 bg-white/5 md:backdrop-blur-xl p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-6 w-6 text-[#CC0000]" />
              <h2 className="font-display font-black uppercase italic py-1">{t.obrigado.credentialsHeading}</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 block mb-1">
                  {t.obrigado.emailLabel}
                </label>
                <p className="text-lg font-bold text-white break-all">
                  {email || t.obrigado.emailUnavailable}
                </p>
              </div>

              <div className="rounded-xl border border-[#CC0000]/20 bg-[#CC0000]/5 p-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 block mb-1">
                  {t.obrigado.passwordLabel}
                </label>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xl font-mono font-bold text-[#CC0000] tracking-wider">
                    {defaultPassword}
                  </p>
                  <ButtonPress
                    onClick={copyPassword}
                    className="shrink-0 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? t.obrigado.copySuccess : t.obrigado.copyDefault}
                  </ButtonPress>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {t.obrigado.passwordInstruction}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mb-10 flex items-center justify-center gap-3 rounded-full border border-[#CC0000]/20 bg-[#CC0000]/5 px-6 py-3 md:backdrop-blur-xl"
          >
            <Clock className="h-4 w-4 text-[#CC0000]" />
            <span className="text-sm font-bold text-gray-400">
              {t.obrigado.diagnosisTimerLabel}{" "}
              <span className="font-mono text-[#CC0000] text-lg">{formatTime(timeLeft)}</span>
            </span>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="font-display font-black uppercase italic text-center mb-8 tracking-tight py-2">
              {t.obrigado.whatsNextHeading}
            </h2>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + i * 0.15 }}
                >
                  <Link
                    to={step.href}
                    data-cursor="hover"
                    className={`group flex items-center gap-5 rounded-2xl border border-white/5 bg-gradient-to-r ${step.color} p-6 transition-all hover:border-[#CC0000]/30 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] hover:translate-y-[-2px]`}
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-[#CC0000]/30 group-hover:bg-[#CC0000]/10 transition-all">
                      <step.icon className="h-7 w-7 text-gray-400 group-hover:text-[#CC0000] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-white group-hover:text-[#CC0000] transition-colors text-left">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-[#CC0000] group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Direct CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="text-center mb-16"
          >
            <Link
              to="/dashboard/"
              data-cursor="hover"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-[#CC0000] px-8 md:px-12 py-5 text-xl font-black text-white transition-all hover:scale-105 shadow-[0_20px_60px_-15px_rgba(204,0,0,0.4)]"
            >
              <span className="relative z-10">{t.obrigado.accessCta}</span>
              <ArrowRight
                size={24}
                className="relative z-10 group-hover:translate-x-1 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#CC0000] to-[#990000] opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="mb-12"
          >
            <h3 className="font-display font-black uppercase italic text-center mb-6 py-1">
              {t.obrigado.faqHeading}
            </h3>
            <div className="space-y-3">
              {[
                {
                  q: t.obrigado.faq1Q,
                  a: t.obrigado.faq1A,
                },
                {
                  q: t.obrigado.faq2Q,
                  a: t.obrigado.faq2A,
                },
                {
                  q: t.obrigado.faq3Q,
                  a: t.obrigado.faq3A,
                },
              ].map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-white/5 bg-white/5 overflow-hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-bold text-sm text-white select-none hover:bg-white/5 transition">
                    {item.q}
                    <span className="text-[#CC0000] transition-transform group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-600">
            © {new Date().getFullYear()} MindReset Inc. {t.obrigado.copyright}
          </div>
        </div>
    </div>
  );
}
