import { createFileRoute, Outlet, redirect, Link, Navigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "../../components/dashboard/Sidebar";
import { getMyProfile } from "../../lib/profile.functions";
import { supabase } from "../../integrations/supabase/client";
import { useI18n } from "../../lib/i18n/LanguageProvider";
import { useEffect, useState } from "react";
import { BackgroundAmbient } from "@/components/atmosphere";


export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MindReset" }] }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { t } = useI18n();
  const fetchProfile = useServerFn(getMyProfile);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    retry: 1, // Allow one retry for transient network issues
    enabled: isClient, // Only fetch on client
  });

  const profile = data?.profile;
  const onboardingCompleted = profile?.onboarding_completed;

  useEffect(() => {
    if (isClient && !isLoading && profile && onboardingCompleted === false) {
      console.log("Onboarding not completed, redirecting...");
      window.location.href = "/onboarding";
    }
  }, [isClient, isLoading, profile, onboardingCompleted]);

  useEffect(() => {
    if (!isLoading && profile?.access_level === "revoked") {
      supabase.auth.signOut().then(() => {
        window.location.href = "/login?reason=revoked";
      });
    }
  }, [isLoading, profile?.access_level]);

  useEffect(() => {
    if (profile?.archetype) {
      document.body.setAttribute("data-arch", profile.archetype);
    }
    return () => {
      document.body.removeAttribute("data-arch");
    };
  }, [profile?.archetype]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-center">
        <div className="relative mb-8">
          <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/20 blur-xl" />
          <div className="relative h-16 w-16 text-6xl" aria-hidden>⚠️</div>
        </div>
        <div className="max-w-md space-y-6">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
            Connection Interrupted
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We couldn't synchronize your neural profile. This usually happens due to a temporary connection issue.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => refetch()}
              className="w-full rounded-full bg-primary py-4 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-[0_0_20px_rgba(204,0,0,0.45)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Re-establish Connection
            </button>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              Sign out and try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pre-hydration or loading state
  if (!isClient || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Initializing Protocol...</p>
        </div>
      </div>
    );
  }

  const accessLevel = profile?.access_level ?? "active";
  const expiresAt = profile?.features_expires_at;

  const isExpired = expiresAt ? new Date(expiresAt).getTime() < Date.now() : false;
  const isLocked = accessLevel === "locked" || isExpired;
  const isGrace = accessLevel === "grace";

  const isCloseToExpiry = expiresAt && !isExpired
    ? (new Date(expiresAt).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000
    : false;

  const showBanner = isGrace || isCloseToExpiry;
  let bannerText = "";
  if (isGrace) {
    bannerText = t.dashboard.layout.banner.grace;
  } else if (isCloseToExpiry && expiresAt) {
    const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    bannerText = t.dashboard.layout.banner.expiring(daysLeft);
  }

  return (
    <DashboardShell>
      <BackgroundAmbient variant="dashboard" className="z-[-1]" />
      <div className="relative min-h-[calc(100vh-80px)] w-full z-10">
        {showBanner && !isLocked && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm font-semibold text-primary shadow-sm flex items-center justify-between gap-4">
            <span>{bannerText}</span>
            <Link 
              to="/dashboard/settings" 
              className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary-dark transition"
            >
              {isGrace ? t.dashboard.layout.banner.updateButton : "Upsell"}
            </Link>
          </div>
        )}

        <div className={isLocked ? "pointer-events-none opacity-30 select-none blur-[1px]" : ""}>
          <Outlet />
        </div>

        {isLocked && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm p-4 text-center">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <span className="text-5xl" aria-hidden>🔒</span>
              <h2 className="mt-4 font-display text-2xl font-extrabold">{t.dashboard.layout.locked.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {t.dashboard.layout.locked.description}
              </p>
              <Link
                to="/dashboard/settings"
                className="mt-6 inline-block rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground shadow-[0_0_20px_rgba(204,0,0,0.45)] transition-all hover:scale-105 hover:shadow-lg pointer-events-auto"
              >
                {t.dashboard.layout.locked.reactivateButton}
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}