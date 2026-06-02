import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../../integrations/supabase/client";

const navItems = [
  { to: "/dashboard",            label: "Home",         icon: "🏠", exact: true },
  { to: "/dashboard/diagnosis",  label: "Diagnosis",    icon: "🧠", exact: false },
  { to: "/dashboard/calendar",   label: "Action Matrix",icon: "📅", exact: false },
  { to: "/dashboard/compass",    label: "Compass",      icon: "🧭", exact: false },
  { to: "/dashboard/progress",   label: "Progress",     icon: "📈", exact: false },
  { to: "/dashboard/settings",   label: "Settings",     icon: "⚙️", exact: false },
] as const;

interface SidebarProps {
  streak?: number;
  unreadCount?: number;
}

function SidebarContent({ streak, unreadCount, onClose }: SidebarProps & { onClose?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="flex h-full flex-col p-5">
      {/* Logo */}
      <Link
        to="/dashboard"
        onClick={onClose}
        className="mb-8 font-display text-xl font-bold tracking-tight"
      >
        <span className="text-foreground">Mind</span>
        <span className="text-primary">Reset</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map((it) => {
          const active = it.exact
            ? pathname === it.to
            : pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={onClose}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "border-l-[3px] border-primary bg-primary/10 text-foreground pl-[calc(0.75rem-3px)]"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span className="text-base" aria-hidden>{it.icon}</span>
              <span className="flex-1">{it.label}</span>

              {/* Streak badge on Progress */}
              {it.to === "/dashboard/progress" && streak != null && streak > 0 && (
                <span className="flex items-center gap-0.5 rounded-full bg-warning/20 px-1.5 py-0.5 text-[10px] font-bold text-warning">
                  🔥{streak}
                </span>
              )}
            </Link>
          );
        })}

        {/* Notifications */}
        <button
          className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-secondary hover:text-foreground"
          onClick={onClose}
        >
          <span className="text-base" aria-hidden>🔔</span>
          <span className="flex-1 text-start">Notifications</span>
          {unreadCount != null && unreadCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="mt-6 flex items-center gap-2 text-left text-xs text-muted-foreground transition hover:text-foreground"
      >
        <span>↩</span> Log out
      </button>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [streak, setStreak] = useState<number | undefined>(undefined);
  const [unread, setUnread] = useState<number | undefined>(undefined);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Fetch streak + unread count (lightweight)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      // Streak
      supabase
        .from("user_progress")
        .select("streak_days")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => { if (data) setStreak(data.streak_days); });
      // Unread notifications
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false)
        .then(({ count }) => { if (count != null) setUnread(count); });
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-secondary md:flex">
        <SidebarContent streak={streak} unreadCount={unread} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-secondary transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          streak={streak}
          unreadCount={unread}
          onClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:text-foreground"
            aria-label="Open menu"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/dashboard" className="font-display text-base font-bold">
            <span className="text-foreground">Mind</span><span className="text-primary">Reset</span>
          </Link>
          <div className="w-9" />
        </header>

        <main className="flex-1 px-4 py-6 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}