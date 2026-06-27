import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSharedQuiz } from "@/lib/quiz.functions";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { MarbleBust } from "@/components/identity";
import { ButtonPress } from "@/components/interaction/ButtonPress";
import { Atmosphere } from "@/components/atmosphere";
import { motion } from "framer-motion";
import { ArrowRight, Eye } from "lucide-react";

export const Route = createFileRoute("/share/$token")({
  head: () => ({ meta: [{ title: "MindReset — Archetype Reveal" }] }),
  component: SharePage,
});

function SharePage() {
  const { token } = Route.useParams();
  const { t } = useI18n();
  const getQuiz = useServerFn(getSharedQuiz);
  const [data, setData] = useState<{
    display_name: string | null;
    winner: string | null;
    lang: string | null;
    insight_preview?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getQuiz({ data: { token } })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Share fetch error:", err);
        setError("Link expired or invalid.");
        setLoading(false);
      });
  }, [token, getQuiz]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <MarbleBust variant="loader" />
      </div>
    );
  }

  if (error || !data?.winner) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">
          {error || "Link not found"}
        </h1>
        <p className="mt-4 text-foreground/60">
          This link may have expired or is invalid.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-white font-bold"
        >
          Take the Quiz
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const archName = data.winner as "AO" | "SS" | "EA" | "HI";
  const displayName = data.display_name || "Someone";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Atmosphere fog="dramatic" symbols="sparse" scan="subtle" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] mx-auto mb-8">
            <MarbleBust variant="full" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-foreground/50 mb-4">
            {displayName}'s archetype is
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-black uppercase italic text-arch-primary">
            {t.archetypes[archName].name}
          </h1>
          <p className="mt-6 max-w-lg text-lg text-foreground/70 leading-relaxed">
            {t.archetypes[archName].tagline}
          </p>
        </motion.div>

        {data.insight_preview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 max-w-md rounded-2xl border border-arch-primary/30 bg-arch-primary/5 p-6"
          >
            <p className="text-sm text-foreground/60 italic">"{data.insight_preview}"</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <ButtonPress>
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-white font-extrabold text-lg transition-all hover:scale-[1.03] active:scale-95"
            >
              Discover Your Archetype
              <ArrowRight className="h-5 w-5" />
            </Link>
          </ButtonPress>
          <div className="flex items-center gap-2 text-xs text-foreground/40">
            <Eye className="h-3 w-3" />
            <span>{t.share.views(1)}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
