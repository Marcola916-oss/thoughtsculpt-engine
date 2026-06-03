import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../../integrations/supabase/client";
import { useI18n } from "../../lib/i18n/LanguageProvider";

interface SidebarProps {
  streak?: number;
  unreadCount?: number;
  onOpenNotifications: () => void;
}

function SidebarContent({ streak, unreadCount, onOpenNotifications, onClose }: SidebarProps & { onClose?: () => void }) {
  const { t, locale } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const navItems = [
    { to: "/dashboard",            label: t.common.nav.home,         icon: "🏠", exact: true },
    { to: "/dashboard/diagnosis",  label: t.common.nav.diagnosis,    icon: "🧠", exact: false },
    { to: "/dashboard/calendar",   label: t.common.nav.actionMatrix, icon: "📅", exact: false },
    { to: "/dashboard/compass",    label: t.common.nav.compass,      icon: "🧭", exact: false },
    { to: "/dashboard/progress",   label: t.common.nav.progress,     icon: "📈", exact: false },
    { to: "/dashboard/settings",   label: t.common.nav.settings,     icon: "⚙️", exact: false },
  ];

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
          onClick={() => {
            onOpenNotifications();
            if (onClose) onClose();
          }}
        >
          <span className="text-base" aria-hidden>🔔</span>
          <span className="flex-1 text-start">{t.common.nav.notifications}</span>
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
        <span>↩</span> {t.common.logout}
      </button>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { t, locale } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [streak, setStreak] = useState<number | undefined>(undefined);
  const [unread, setUnread] = useState<number | undefined>(undefined);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll when mobile menu or notification modal is open
  useEffect(() => {
    document.body.style.overflow = (mobileOpen || notifOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, notifOpen]);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setNotifications(data || []);
    }
    setLoadingNotifs(false);
  };

  // Fetch streak + unread count (lightweight)
  const refreshUnreadAndStreak = () => {
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
  };

  useEffect(() => {
    refreshUnreadAndStreak();
  }, []);

  const handleMarkAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  };

  const handleMarkSingleRead = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", user.id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnread((prev) => (prev && prev > 0 ? prev - 1 : 0));
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      await handleMarkSingleRead(notif.id);
    }
    setNotifOpen(false);
    if (notif.action_url) {
      navigate({ to: notif.action_url });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-secondary md:flex">
        <SidebarContent
          streak={streak}
          unreadCount={unread}
          onOpenNotifications={() => {
            setNotifOpen(true);
            fetchNotifications();
          }}
        />
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
          onOpenNotifications={() => {
            setNotifOpen(true);
            fetchNotifications();
          }}
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

      {/* Notifications Modal */}
      {notifOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setNotifOpen(false)}
        >
          <div 
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-[#0D0D0D] p-6 shadow-2xl animate-in scale-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  <span>🔔</span> {t.dashboard.sidebar.notifications.title}
                </h2>
                <p className="text-xs text-muted-foreground">{t.dashboard.sidebar.notifications.subtitle}</p>
              </div>
              <button 
                onClick={() => setNotifOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition text-muted-foreground hover:text-foreground font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Actions */}
            {notifications.some(n => !n.is_read) && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {t.dashboard.sidebar.notifications.markAllRead}
                </button>
              </div>
            )}

            {/* List */}
            <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {loadingNotifs ? (
                <div className="space-y-3 py-6">
                  <div className="h-12 w-full animate-pulse rounded-xl bg-card" />
                  <div className="h-12 w-full animate-pulse rounded-xl bg-card" />
                  <div className="h-12 w-full animate-pulse rounded-xl bg-card" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <span className="text-3xl mb-2">📭</span>
                  <p className="text-sm">{t.dashboard.sidebar.notifications.empty}</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const typeColors: Record<string, string> = {
                    achievement: "text-amber-500 bg-amber-500/10 border-amber-500/20",
                    streak: "text-orange-500 bg-orange-500/10 border-orange-500/20",
                    expiry: "text-red-500 bg-red-500/10 border-red-500/20",
                    system: "text-blue-500 bg-blue-500/10 border-blue-500/20",
                    tip: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
                  };
                  const colorClass = typeColors[n.type] || "text-primary bg-primary/10 border-primary/20";
                  
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`relative flex gap-3 rounded-xl border p-4 cursor-pointer transition-all hover:scale-[1.01] ${
                        n.is_read
                          ? "border-border bg-card/40 opacity-70 hover:opacity-100"
                          : "border-primary/30 bg-primary/5 hover:bg-primary/10 shadow-[0_0_10px_var(--accent-glow)]"
                      }`}
                    >
                      {/* Left Dot for unread */}
                      {!n.is_read && (
                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
                      )}
                      
                      {/* Icon */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg ${colorClass}`}>
                        {n.icon || "🔔"}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-semibold text-sm text-foreground truncate">{n.title}</h4>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                        <span className="mt-2 block text-[10px] text-muted-foreground/60">
                          {new Date(n.created_at).toLocaleDateString(locale, {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 border-t border-border pt-4 text-center">
              <button
                onClick={() => setNotifOpen(false)}
                className="w-full rounded-xl bg-secondary py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/80 transition"
              >
                {t.dashboard.sidebar.notifications.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}