import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { supabase } from "../../integrations/supabase/client";
import { useI18n } from "../../lib/i18n/LanguageProvider";
import { StreakCounter } from "../gamification/StreakCounter";
import { drawerSlide, modalScale } from "../../lib/animations";
import { CircuitBrain } from "../identity/CircuitBrain";
import { Logo } from "@/components/identity/Logo";

interface SidebarProps {
  streak?: number;
  unreadCount?: number;
  onOpenNotifications: () => void;
  profile?: { display_name: string | null; archetype: string | null } | null;
}

function SidebarContent({ streak, unreadCount, onOpenNotifications, profile, onClose, hasDiagnosis }: SidebarProps & { onClose?: () => void; hasDiagnosis?: boolean }) {
  const { t, lang } = useI18n();
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
    <div className="flex h-full flex-col p-5 relative overflow-hidden">
      {/* Visual hierarchy lines */}
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-border/50 to-transparent" />
      <div className="absolute top-1/4 -right-1 h-32 w-2 bg-arch-primary/20 blur-md rounded-full" />
      
      {/* Logo Section */}
      <div className="mb-10 pl-2">
        <Logo size="md" className="relative z-10" />
        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] mt-3">{t.commonExtra.protocolVersion}</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 relative z-10">
        {navItems.map((it) => {
          const active = it.exact
            ? pathname === it.to
            : pathname.startsWith(it.to);
          return (
            <motion.div
              key={it.to}
              whileTap={!active ? { scale: 0.98 } : {}}
            >
              <Link
                to={it.to}
                onClick={onClose}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  active
                    ? "text-foreground shadow-[0_0_20px_var(--arch-glow)] border border-arch-primary/30 bg-arch-primary/5"
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-white/5 hover:translate-x-1"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 h-6 w-1 rounded-full bg-arch-primary shadow-[0_0_10px_var(--arch-glow)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <span className="text-base" aria-hidden>{it.icon}</span>
                <span className="flex-1">{it.label}</span>

                {/* NOVO badge on Diagnosis if no diagnosis yet */}
                {it.to === "/dashboard/diagnosis" && hasDiagnosis === false && (
                  <motion.span
                    className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/30"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {t.dashboard.hub.badges.new}
                  </motion.span>
                )}

                {/* Streak badge on Progress using compact StreakCounter */}
                {it.to === "/dashboard/progress" && streak != null && (
                  <StreakCounter streak={streak} compact />
                )}
              </Link>
            </motion.div>
          );
        })}

        {/* Notifications */}
        <button
          className="group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all duration-150 hover:bg-secondary/50 hover:text-foreground hover:translate-x-1"
          onClick={() => {
            onOpenNotifications();
            if (onClose) onClose();
          }}
        >
          <span className="text-base" aria-hidden>🔔</span>
          <span className="flex-1 text-start">{t.common.nav.notifications}</span>
          {unreadCount != null && unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground shadow-[0_0_10px_var(--accent-glow)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </nav>

      {/* User profile / archetype badge at bottom */}
      {profile && (
        <div className="mt-auto pt-8 border-t border-white/5 flex items-center gap-4 relative z-10 px-2">
          <div className="h-12 w-12 rounded-xl bg-arch-primary/10 flex items-center justify-center font-black text-arch-primary border border-arch-primary/30 shadow-[0_0_20px_var(--arch-glow)] select-none italic text-sm">
            {profile.archetype || "MR"}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-black text-foreground truncate uppercase tracking-widest">{profile.display_name || t.common.login}</p>
            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mt-1 truncate italic">
              {profile.archetype ? (t.archetypes as any)?.[profile.archetype]?.name || profile.archetype : "MindReset"}
            </p>
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={logout}
        className="mt-6 flex items-center gap-2 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 transition hover:text-arch-primary relative z-10 px-2 group"
      >
        <span className="transition-transform group-hover:-translate-x-1">↩</span> {t.common.logout}
      </button>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { t, lang } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [streak, setStreak] = useState<number | undefined>(undefined);
  const [unread, setUnread] = useState<number | undefined>(undefined);
  const [profile, setProfile] = useState<{ display_name: string | null; archetype: string | null } | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [hasDiagnosis, setHasDiagnosis] = useState<boolean | undefined>(undefined);
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

  // Fetch streak + unread count + profile
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
      // Profile details
      supabase
        .from("profiles")
        .select("display_name, archetype")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => { if (data) setProfile(data); });
      // Check if diagnosis exists
      supabase
        .from("diagnoses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .then(({ count }) => { setHasDiagnosis(count != null && count > 0); });
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
    <div className="flex min-h-screen bg-transparent relative z-10" data-arch={profile?.archetype || undefined}>
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/40 bg-card/30 backdrop-blur-3xl md:flex z-50">
        <SidebarContent
          streak={streak}
          unreadCount={unread}
          profile={profile}
          hasDiagnosis={hasDiagnosis}
          onOpenNotifications={() => {
            setNotifOpen(true);
            fetchNotifications();
          }}
        />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            variants={drawerSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card md:hidden"
          >
            <SidebarContent
              streak={streak}
              unreadCount={unread}
              profile={profile}
              hasDiagnosis={hasDiagnosis}
              onOpenNotifications={() => {
                setNotifOpen(true);
                fetchNotifications();
              }}
              onClose={() => setMobileOpen(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-black/80 px-6 py-5 backdrop-blur-2xl md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-muted-foreground transition hover:text-foreground active:scale-90"
            aria-label={t.commonExtra.openMenu}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="absolute left-1/2 -translate-x-1/2">
            <Logo size="md" />
          </div>
          
          <div className="w-12" />
        </header>

        <main className="flex-1 px-4 py-6 md:px-10 md:py-10">{children}</main>
      </div>

      {/* Notifications Modal */}
      <AnimatePresence>
        {notifOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotifOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              variants={modalScale}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden glass-panel p-6 shadow-2xl z-10"
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
                            {new Date(n.created_at).toLocaleDateString(lang === "pt" ? "pt-BR" : lang === "pl" ? "pl-PL" : lang === "ro" ? "ro-RO" : "en-US", {
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}