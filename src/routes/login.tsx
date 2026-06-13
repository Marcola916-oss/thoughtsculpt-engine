import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useI18n } from "../lib/i18n/LanguageProvider";
import { supabase } from "../integrations/supabase/client";
import { Logo } from "@/components/identity/Logo";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — MindReset" }] }),
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>): { reason?: string } => ({
    reason: typeof search.reason === "string" ? search.reason : undefined,
  }),
});

function LoginPage() {
  const { t } = useI18n();
  const search = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const revokedBanner = search.reason === "revoked";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    
    // Clear any potential stale profile data from react-query cache
    // by ensuring a clean redirect and reload. We use a short timeout
    // to ensure Supabase internal state is fully persisted before reload.
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 100);
  }

  async function forgot() {
    if (!email) {
      setErr(t.login.enterEmailFirst);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setErr(error ? error.message : t.login.checkInbox);
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-6 relative z-10">
      <Logo size="xl" className="justify-center mb-8" />
      {revokedBanner && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground"
        >
          <p className="font-semibold text-primary">{t.login.subscriptionEnded}</p>
          <p className="mt-1 text-muted-foreground">
            {t.login.subscriptionRenew}
          </p>
        </div>
      )}
      <h1 className="font-display font-bold">{t.common.login}</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          placeholder={t.common.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 outline-none focus:border-primary"
        />
        <input
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 outline-none focus:border-primary"
        />
        {err && <p className="text-sm text-primary">{err}</p>}
        <button
          disabled={busy}
          className="w-full rounded-full bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? t.common.loading : t.common.login}
        </button>
      </form>
      <button
        onClick={forgot}
        className="mt-6 text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors p-2"
      >
        {t.login.forgotPassword}
      </button>

      <div className="mt-8 flex justify-center">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition-all hover:bg-white/10 hover:text-primary active:scale-95">
          <span className="text-sm">←</span> {t.notFound.goHome}
        </Link>
      </div>
      </div>
    </div>
  );
}
