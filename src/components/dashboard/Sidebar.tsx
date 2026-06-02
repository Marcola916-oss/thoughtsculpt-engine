import { Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "../../integrations/supabase/client";

const items = [
  { to: "/dashboard", label: "Home", icon: "🏠" },
  { to: "/dashboard/diagnosis", label: "Diagnosis", icon: "🧠" },
  { to: "/dashboard/calendar", label: "Action Matrix", icon: "📅" },
  { to: "/dashboard/compass", label: "Compass", icon: "🧭" },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-card/40 p-4 md:flex">
        <Link to="/dashboard" className="mb-8 font-display text-xl font-bold">
          <span className="text-foreground">Mind</span><span className="text-primary">Reset</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map((it) => {
            const active = pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "border-l-2 border-primary bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span aria-hidden>{it.icon}</span>
                {it.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="mt-4 text-left text-xs text-muted-foreground hover:text-foreground"
        >
          Log out
        </button>
      </aside>
      <main className="flex-1 px-4 py-6 md:px-10 md:py-10">{children}</main>
    </div>
  );
}