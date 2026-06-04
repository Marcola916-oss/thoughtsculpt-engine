import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import { getDiagnosis, generateDiagnosis } from "../../lib/diagnosis.functions";
import { getMyProfile } from "../../lib/profile.functions";
import { ARCHETYPE_NAMES, type Archetype } from "../../lib/ai/archetypes";
import { useI18n } from "../../lib/i18n/LanguageProvider";
import { useMousePosition } from "../../hooks/use-mouse-position";

function BentoCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  useMousePosition(ref);

  return (
    <div ref={ref} className={`bento-card ${className}`}>
      {children}
    </div>
  );
}


export const Route = createFileRoute("/_authenticated/dashboard/diagnosis")({
  head: () => ({ meta: [{ title: "Diagnóstico — MindReset" }] }),
  component: DiagnosisPage,
});

function DiagnosisPage() {
  const { t, lang } = useI18n();
  const fetchDx = useServerFn(getDiagnosis);
  const genDx = useServerFn(generateDiagnosis);
  const fetchProfile = useServerFn(getMyProfile);
  const qc = useQueryClient();
  const [tab, setTab] = useState<string>("financial_analysis");
  const [copied, setCopied] = useState(false);

  const tabs = [
    { key: "financial_analysis", label: t.dashboard.diagnosis.tabs.financial },
    { key: "professional_analysis", label: t.dashboard.diagnosis.tabs.professional },
    { key: "romantic_analysis", label: t.dashboard.diagnosis.tabs.romantic },
    { key: "personal_analysis", label: t.dashboard.diagnosis.tabs.personal },
  ];

  const { data: diagnosis, isLoading } = useQuery({
    queryKey: ["diagnosis"],
    queryFn: () => fetchDx(),
  });

  const { data: profileData } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: () => genDx(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["diagnosis"] }),
  });

  if (isLoading) return <Skeleton />;

  if (!diagnosis) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-12 text-center">
        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 shadow-[0_0_40px_var(--accent-glow)]">
          <span className="text-6xl animate-pulse">🧠</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">{t.dashboard.diagnosis.empty.heading}</h1>
        <p className="mt-4 max-w-lg text-muted-foreground leading-relaxed">
          {t.dashboard.diagnosis.empty.description}
        </p>
        
        {mutation.error && (
          <div className="mt-6 rounded-lg bg-primary/20 px-4 py-3 text-sm font-semibold text-primary">
            {(mutation.error as Error).message}
          </div>
        )}
        
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="mt-8 group relative overflow-hidden rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_20px_var(--accent-glow)] disabled:scale-100 disabled:opacity-50"
        >
          {mutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              {t.dashboard.diagnosis.generating}
            </span>
          ) : (
            t.dashboard.diagnosis.unlockButton
          )}
        </button>
      </div>
    );
  }

  const content = diagnosis[tab as keyof typeof diagnosis];
  const archetypeName = ARCHETYPE_NAMES[diagnosis.archetype as Archetype]?.[lang] ?? diagnosis.archetype;

  const shareToken = profileData?.shareToken;
  const shareUrl = shareToken
    ? `${window.location.origin}/share/${shareToken}`
    : window.location.origin;

  const handleShare = () => {
    navigator.clipboard.writeText(t.dashboard.diagnosis.share.clipboardMessage(archetypeName, shareUrl));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(t.dashboard.diagnosis.share.whatsappMessage(archetypeName, shareUrl));
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxW = pageW - margin * 2;
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(204, 0, 0);
    doc.text("MindReset — Dossiê Comportamental", margin, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`${archetypeName} — ${new Date().toLocaleDateString()}`, margin, y);
    y += 12;

    const sections = [
      { key: "financial_analysis", label: t.dashboard.diagnosis.tabs.financial },
      { key: "professional_analysis", label: t.dashboard.diagnosis.tabs.professional },
      { key: "personal_analysis", label: t.dashboard.diagnosis.tabs.personal },
      { key: "romantic_analysis", label: t.dashboard.diagnosis.tabs.romantic },
    ];

    for (const section of sections) {
      const text = diagnosis[section.key as keyof typeof diagnosis];
      if (!text || typeof text !== "string") continue;

      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      doc.text(section.label, margin, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      const lines = doc.splitTextToSize(text, maxW);
      for (const line of lines) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 5;
      }
      y += 6;
    }

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "MindReset — Análise comportamental. Não constitui aconselhamento profissional.",
      margin,
      y
    );

    doc.save(`MindReset_Diagnostico_${archetypeName.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="mx-auto max-w-4xl pb-12 relative">
      <div className="absolute inset-0 mesh-gradient opacity-10 pointer-events-none" />
      
      <header className="mb-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-arch-primary/30 bg-arch-primary/10 px-4 py-1.5 shadow-[0_0_15px_var(--arch-glow)]">
              <span className="text-sm font-black uppercase tracking-widest text-arch-primary">{archetypeName}</span>
            </div>
            <h1 className="font-display text-4xl font-black md:text-5xl tracking-tighter text-gradient">{t.dashboard.diagnosis.result.heading}</h1>
            <p className="mt-2 text-sm text-muted-foreground font-medium">
              {t.dashboard.diagnosis.result.generatedOn} {new Date(diagnosis.generated_at).toLocaleDateString()}
            </p>
          </div>

          
          <div className="flex flex-wrap gap-2 print:hidden">
            <button 
              onClick={handleDownloadPdf}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
            >
              {t.dashboard.diagnosis.actions.downloadPdf}
            </button>
            <button 
              onClick={handleShareWhatsApp}
              className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              🟢 {t.dashboard.diagnosis.actions.whatsapp}
            </button>
            <button 
              onClick={handleShare}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 hover:shadow-[0_0_10px_var(--accent-glow)]"
            >
              {copied ? t.dashboard.diagnosis.actions.copied : t.dashboard.diagnosis.actions.copyLink}
            </button>
          </div>
        </div>
      </header>

      <div className="mb-8 flex flex-wrap gap-2 border-b border-border/50 relative z-10 overflow-x-auto scrollbar-none">

        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
              tab === tabItem.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tabItem.label}
            {tab === tabItem.key && (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.article
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="prose prose-invert max-w-none whitespace-pre-wrap glass-panel p-8 md:p-12 leading-relaxed shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <span className="text-[12rem]">🧠</span>
            </div>
            <h2 className="font-display text-3xl font-black text-arch-primary mb-8 tracking-tight">
              {tabs.find((tabItem) => tabItem.key === tab)?.label}
            </h2>
            <div className="relative z-10 text-lg md:text-xl font-medium text-foreground/90 selection:bg-arch-primary/30">
              {content}
            </div>
          </motion.article>
        </AnimatePresence>
      </div>


      <p className="mt-8 text-center text-xs text-muted-foreground print:text-left">
        {t.dashboard.diagnosis.disclaimer}
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <div className="h-32 rounded-2xl bg-card mb-8" />
      <div className="flex gap-4 border-b border-border mb-8 pb-4">
        <div className="h-4 w-20 bg-card rounded" />
        <div className="h-4 w-20 bg-card rounded" />
      </div>
      <div className="h-96 rounded-2xl bg-card" />
    </div>
  );
}