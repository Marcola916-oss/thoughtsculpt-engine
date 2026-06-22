import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useI18n } from "../lib/i18n/LanguageProvider";

export const Route = createFileRoute("/obrigado")({
  head: () => ({ meta: [{ title: "Obrigado — MindReset" }] }),
  component: ThankYouPage,
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
});

function ThankYouPage() {
  const { t } = useI18n();
  const { session_id } = useSearch({ from: "/obrigado" });

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 text-white">
      <div className="max-w-lg text-center">
        <h1 className="font-display text-3xl md:text-5xl font-black italic uppercase tracking-tight leading-tight">
          {t.obrigado?.welcomeHeading ?? "Obrigado!"}
        </h1>
        <p className="mt-4 text-base md:text-lg text-foreground/70 leading-relaxed">
          {session_id
            ? "Seu diagnóstico está sendo preparado e será enviado para seu e-mail em instantes."
            : "Recebemos sua solicitação. Verifique seu e-mail."}
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[#CC0000] px-8 py-4 text-base font-black italic uppercase tracking-tight text-white transition hover:scale-105"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
