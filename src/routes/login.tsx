import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useI18n } from "../lib/i18n/LanguageProvider";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — MindReset" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    window.location.href = "/dashboard";
  }

  async function forgot() {
    if (!email) { setErr("Enter your email first."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setErr(error ? error.message : "Check your inbox.");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link to="/" className="mb-8 text-center font-display text-xl font-bold">
        <span className="text-foreground">Mind</span><span className="text-primary">Reset</span>
      </Link>
      <h1 className="font-display text-3xl font-bold">{t.common.login}</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="email" required placeholder={t.common.emailPlaceholder}
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 outline-none focus:border-primary"
        />
        <input
          type="password" required placeholder="••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 outline-none focus:border-primary"
        />
        {err && <p className="text-sm text-primary">{err}</p>}
        <button disabled={busy} className="w-full rounded-full bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50">
          {busy ? t.common.loading : t.common.login}
        </button>
      </form>
      <button onClick={forgot} className="mt-4 text-center text-xs text-muted-foreground hover:text-foreground">
        Forgot password?
      </button>
    </div>
  );
}