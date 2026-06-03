import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { getCheckoutSessionStatus } from "../lib/checkout.success";

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

  useEffect(() => {
    if (!sessionId) {
      setError("Missing checkout session ID.");
      setLoading(false);
      return;
    }
    // Call server fn to retrieve magic link and redirect
    getMagicLink({ data: { session_id: sessionId } })
      .then((res) => {
        if (res?.magicLink) {
          // Perform client‑side redirect to the magic link
          window.location.href = res.magicLink;
        } else {
          setError("Failed to obtain magic link.");
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <Loader2 className="h-12 w-12 animate-spin text-[#CC0000]" />
        <p className="mt-4 text-lg font-medium text-gray-300">Finalizando sua compra e preparando seu acesso…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
        <div className="rounded-xl border border-[#CC0000]/40 bg-[#CC0000]/10 p-6 text-center max-w-md">
          <h2 className="mb-2 text-2xl font-bold text-[#CC0000]">Erro na Finalização</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Should not reach here because we redirect on success.
  return null;
}

