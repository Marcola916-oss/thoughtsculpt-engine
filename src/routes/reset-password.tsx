import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "../integrations/supabase/client";
import { useI18n } from "../lib/i18n/LanguageProvider";
import { Logo } from "@/components/identity/Logo";
import { GlobalAmbient } from "@/components/atmosphere";


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
      <GlobalAmbient />
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-6 relative z-10">
        <Logo size="xl" className="justify-center mb-8" />

      <h1 className="font-display text-3xl font-bold">{t.resetPassword.title}</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="password" required minLength={8} placeholder={t.resetPassword.placeholder}
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 outline-none focus:border-primary"
        />
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <button disabled={busy} className="w-full rounded-full bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50">
          {busy ? t.resetPassword.updating : t.resetPassword.updateButton}
        </button>
      </form>
      </div>
    </div>

  );
}