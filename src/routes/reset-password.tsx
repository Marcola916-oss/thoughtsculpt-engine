import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "../integrations/supabase/client";
import { useI18n } from "../lib/i18n/LanguageProvider";
import { Logo } from "@/components/identity/Logo";


export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — MindReset" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    setMsg(error ? error.message : t.resetPassword.success);
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-6 relative z-10">
        <Logo size="xl" className="justify-center mb-8" />

      <h1 className="font-display text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-[0.95] text-balance">{t.resetPassword.title}</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="password" required minLength={8} placeholder={t.resetPassword.placeholder}
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base font-medium outline-none focus:border-primary"
        />
        {msg && <p className="text-sm font-medium text-foreground/70">{msg}</p>}
        <button disabled={busy} className="w-full rounded-full bg-primary px-4 py-3 text-sm font-black italic uppercase tracking-tight text-primary-foreground disabled:opacity-50 transition hover:-translate-y-0.5">
          {busy ? t.resetPassword.updating : t.resetPassword.updateButton}
        </button>
      </form>
      </div>
    </div>

  );
}