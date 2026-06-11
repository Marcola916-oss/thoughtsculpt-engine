import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getMyProfile, updateProfileSettings, changePassword } from "../../lib/profile.functions";
import { createCustomerPortalSession } from "../../lib/checkout.functions";
import { ARCHETYPE_NAMES, type Archetype } from "../../lib/ai/archetypes";
import { useI18n } from "../../lib/i18n/LanguageProvider";
import { Logo } from "@/components/identity/Logo";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — MindReset" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const fetchProfile = useServerFn(getMyProfile);
  const updateSettings = useServerFn(updateProfileSettings);
  const getPortal = useServerFn(createCustomerPortalSession);
  const { t, lang, setLang } = useI18n();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
  });

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const changePasswordFn = useServerFn(changePassword);

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (newPassword.length < 8) {
      setPasswordError(t.settingsExtra.passwordMinLength);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t.settingsExtra.passwordMismatch);
      return;
    }
    setPasswordLoading(true);
    try {
      await changePasswordFn({ data: { newPassword } });
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPasswordError((e as Error).message || t.settingsExtra.passwordChangeError);
    } finally {
      setPasswordLoading(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (vars: { display_name?: string; lang?: "pl" | "ro" | "ar" | "pt" | "en"; theme?: "dark" | "light" }) =>
      updateSettings({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });

  // Initialize theme from profile or HTML element
  useEffect(() => {
    if (data?.profile?.theme) {
      setTheme(data.profile.theme as "dark" | "light");
    } else if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [data]);

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    updateMutation.mutate({ theme: newTheme });
  };

  const handleLangChange = (newLang: any) => {
    setLang(newLang);
    updateMutation.mutate({ lang: newLang });
  };

  const handlePortalRedirect = async () => {
    if (!data?.subscription?.stripe_customer_id) return;
    setPortalLoading(true);
    try {
      const res = await getPortal({
        data: {
          customer_id: data.subscription.stripe_customer_id,
          origin: window.location.origin,
        },
      });
      if (res.url) window.location.href = res.url;
    } catch (e) {
      console.error(e);
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-card" />;
  }

  const p = data?.profile;
  const sub = data?.subscription;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">{t.dashboard.settings.pageTitle}</h1>
          <p className="mt-2 text-muted-foreground">{t.dashboard.settings.pageSubtitle}</p>
        </div>
        <Logo size="sm" link={false} className="opacity-20 hidden sm:block" />
      </header>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-bold">{t.dashboard.settings.profile.title}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.dashboard.settings.profile.nameLabel}</label>
              <input
                type="text"
                defaultValue={p?.display_name || ""}
                placeholder={t.dashboard.settings.profile.namePlaceholder}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && val !== p?.display_name) {
                    updateMutation.mutate({ display_name: val });
                  }
                }}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.dashboard.settings.profile.archetypeLabel}</label>
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
                {p?.archetype ? ARCHETYPE_NAMES[p.archetype as Archetype][lang] : t.dashboard.settings.profile.archetypeUndefined}
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-bold">{t.dashboard.settings.preferences.title}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.dashboard.settings.preferences.languageLabel}</label>
              <select
                value={lang}
                onChange={(e) => handleLangChange(e.target.value as any)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="pt">{t.dashboard.settings.preferences.langPt}</option>
                <option value="en">English</option>
                <option value="pl">Polski</option>
                <option value="ro">Română</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.dashboard.settings.preferences.themeLabel}</label>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as "dark" | "light")}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="dark">{t.dashboard.settings.preferences.themeDark}</option>
                <option value="light">{t.dashboard.settings.preferences.themeLight}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-bold">{t.dashboard.settings.subscription.title}</h2>
          {sub ? (
            <div>
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.dashboard.settings.subscription.currentPlan}</label>
                  <p className="mt-1 text-lg font-bold">
                    {sub.plan === "p30d" ? t.dashboard.settings.subscription.plan30d : sub.plan === "p6m" ? t.dashboard.settings.subscription.plan6m : t.dashboard.settings.subscription.plan1y}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.dashboard.settings.subscription.status}</label>
                  <p className="mt-1 text-sm">
                    <span className={`inline-block rounded-full px-2 py-1 font-bold ${
                      sub.status === "active" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                    }`}>
                      {sub.status.toUpperCase()}
                    </span>
                  </p>
                </div>
                {sub.current_period_end && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.dashboard.settings.subscription.nextRenewal}</label>
                    <p className="mt-1 text-sm">{new Date(sub.current_period_end).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handlePortalRedirect}
                  disabled={portalLoading}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-primary"
                >
                  {portalLoading ? t.dashboard.settings.subscription.accessingPortal : t.dashboard.settings.subscription.manageStripe}
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  {t.dashboard.settings.subscription.cancel}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t.dashboard.settings.subscription.noneFound}</p>
          )}
        </section>

        {/* Security Section - Password Change */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-bold">{t.dashboard.settings.security.title}</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {t.dashboard.settings.security.desc}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.dashboard.settings.security.newLabel}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.dashboard.settings.security.newPlaceholder}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.dashboard.settings.security.confirmLabel}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.dashboard.settings.security.confirmPlaceholder}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          {passwordError && <p className="mt-3 text-sm text-primary">{passwordError}</p>}
          {passwordSuccess && <p className="mt-3 text-sm text-success">{t.dashboard.settings.security.success}</p>}
          <button
            onClick={handlePasswordChange}
            disabled={passwordLoading || !newPassword || !confirmPassword}
            className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          >
            {passwordLoading ? t.dashboard.settings.security.buttonLoading : t.dashboard.settings.security.buttonDefault}
          </button>
        </section>
      </div>

      {/* Cancel Retention Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="font-display text-xl font-bold">{t.dashboard.settings.cancelModal.heading(p?.display_name ?? "")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t.dashboard.settings.cancelModal.body}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {t.dashboard.settings.cancelModal.keepProgress}
              </button>
              <button
                onClick={handlePortalRedirect}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 font-semibold hover:border-primary"
              >
                {t.dashboard.settings.cancelModal.proceedCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
