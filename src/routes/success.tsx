import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { getCheckoutSessionStatus } from "../lib/checkout.success";
import { useI18n } from "../lib/i18n/LanguageProvider";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
});

function SuccessPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const search = useSearch({ from: "/success" });
  const sessionId = search.session_id;
  const getMagicLink = useServerFn(getCheckoutSessionStatus);
  const { t } = useI18n();

  useEffect(() => {
    if (!sessionId) {
      setError("Missing checkout session ID.");
      setLoading(false);
      return;
    }
    getMagicLink({ data: { session_id: sessionId } })
      .then((res) => {
        if (res?.magicLink) {
          // Redirect to the thank-you page instead of directly to the magic link
          window.location.href = `/obrigado?session_id=${sessionId}`;
        } else {
          setError("Failed to obtain access credentials.");
        }
      })
      .catch((e) => {
        console.error(e);
        setError(e?.message ?? "Unexpected error");
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-transparent text-white">
        <Loader2 className="h-12 w-12 animate-spin text-[#CC0000]" />
        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/70 animate-pulse">{t.common.success.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent p-4 text-white">
        <div className="rounded-xl border border-[#CC0000]/40 bg-[#CC0000]/10 p-6 text-center max-w-md">
          <h2 className="mb-3 font-display text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-tight text-[#CC0000]">{t.common.success.errorTitle}</h2>
          <p className="text-sm md:text-base leading-relaxed text-white/70">{error}</p>
        </div>
      </div>
    );
  }

  return null;
}
