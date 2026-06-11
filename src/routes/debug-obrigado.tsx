import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Logo } from "@/components/identity/Logo";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, CalendarIcon, CompassIcon, ArrowRight, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { Atmosphere, BackgroundAmbient } from "@/components/atmosphere";

export default function ThankYouPage() {
  const { t } = useI18n();
  const firstName = t.obrigado.fallbackName;
  const email = "lflavio916@gmail.com";
  const defaultPassword = "MindReset2026!";

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
    <Atmosphere fog="dramatic" symbols="sparse" scan="subtle" pinned>
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <BackgroundAmbient variant="landing" />
        <div className="noise-overlay" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <Logo size="lg" className="justify-center mb-12" />

            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tighter leading-tight">
              {t.obrigado.welcomeHeading}
              <br />
              <span className="text-[#CC0000]">{firstName}</span>!
            </h1>
            <p className="mt-4 text-lg text-gray-400 leading-relaxed max-w-xl mx-auto">
              {t.obrigado.welcomeSub}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-10 rounded-[2rem] border border-white/10 bg-white/5 md:backdrop-blur-xl p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-6 w-6 text-[#CC0000]" />
              <h2 className="font-display text-xl font-bold">{t.obrigado.credentialsHeading}</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 block mb-1">
                  {t.obrigado.emailLabel}
                </label>
                <p className="text-lg font-bold text-white break-all">{email}</p>
              </div>

              <div className="rounded-xl border border-[#CC0000]/20 bg-[#CC0000]/5 p-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 block mb-1">
                  {t.obrigado.passwordLabel}
                </label>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xl font-mono font-bold text-[#CC0000] tracking-wider">
                    {defaultPassword}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4 mb-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.15 }}
              >
                <Link
                  to={step.href}
                  className={`group flex items-center gap-5 rounded-2xl border border-white/5 bg-gradient-to-r ${step.color} p-6 transition-all hover:border-[#CC0000]/30 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] hover:translate-y-[-2px]`}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-[#CC0000]/30 group-hover:bg-[#CC0000]/10 transition-all">
                    <step.icon className="h-7 w-7 text-gray-400 group-hover:text-[#CC0000] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-white group-hover:text-[#CC0000] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-[#CC0000] group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center text-xs text-gray-600">
            © {new Date().getFullYear()} MindReset Inc. {t.obrigado.copyright}
          </div>
        </div>
      </div>
    </Atmosphere>
  );
}
