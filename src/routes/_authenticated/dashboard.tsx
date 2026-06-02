import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "../../integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MindReset" }] }),
  component: DashboardHub,
});

function DashboardHub() {
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold">Welcome back</h1>
        <button onClick={logout} className="text-xs text-muted-foreground hover:text-foreground">Log out</button>
      </div>
      <p className="mt-2 text-muted-foreground">Hub coming in Phase 1B. Diagnóstico, Matriz de Ação, Compass, Progresso.</p>
      <Link to="/" className="mt-6 inline-block text-sm text-primary">← Back to home</Link>
    </div>
  );
}