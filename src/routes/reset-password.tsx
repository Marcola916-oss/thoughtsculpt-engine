import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — MindReset" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    setMsg(error ? error.message : "Password updated. You can log in now.");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="font-display text-3xl font-bold">Set a new password</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="password" required minLength={8} placeholder="New password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 outline-none focus:border-primary"
        />
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <button disabled={busy} className="w-full rounded-full bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50">
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}