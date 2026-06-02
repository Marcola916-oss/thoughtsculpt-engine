import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "../../components/dashboard/Sidebar";
import { getMyProfile } from "../../lib/profile.functions";
import { supabase } from "../../integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MindReset" }] }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const fetchProfile = useServerFn(getMyProfile);
  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
  });

  // Onboarding gate: if profile loaded and not completed, force onboarding.
  if (!isLoading && data?.profile && !data.profile.onboarding_completed) {
    throw redirect({ to: "/onboarding" });
  }

  // Revoked gate: if profile is revoked, log out and send to login
  if (!isLoading && data?.profile?.access_level === "revoked") {
    supabase.auth.signOut().then(() => {
      window.location.href = "/login?reason=revoked";
    });
    return null;
  }

  const profile = data?.profile;
  const accessLevel = profile?.access_level ?? "active";
  const expiresAt = profile?.features_expires_at;

  const isExpired = expiresAt ? new Date(expiresAt).getTime() < Date.now() : false;
  const isLocked = accessLevel === "locked" || isExpired;
  const isGrace = accessLevel === "grace";

  // Check if features expire in less than 3 days (but still in the future)
  const isCloseToExpiry = expiresAt && !isExpired
    ? (new Date(expiresAt).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000
    : false;

  const showBanner = isGrace || isCloseToExpiry;
  let bannerText = "";
  if (isGrace) {
    bannerText = "⚠️ Não conseguimos processar seu pagamento. Atualize seu método de pagamento para continuar seu protocolo sem interrupções.";
  } else if (isCloseToExpiry && expiresAt) {
    const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    bannerText = `⏳ Seu protocolo expira em ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}. Faça upgrade para não perder seu progresso.`;
  }

  return (
    <DashboardShell>
      <div className="relative min-h-[calc(100vh-80px)] w-full">
        {/* Warning Banner */}
        {showBanner && !isLocked && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm font-semibold text-primary shadow-sm flex items-center justify-between gap-4">
            <span>{bannerText}</span>
            <Link 
              to="/dashboard/settings" 
              className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary-dark transition"
            >
              {isGrace ? "Atualizar" : "Upsell"}
            </Link>
          </div>
        )}

        {/* Content Wrapper */}
        <div className={isLocked ? "pointer-events-none opacity-30 select-none blur-[1px]" : ""}>
          <Outlet />
        </div>

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm p-4 text-center">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <span className="text-5xl" aria-hidden>🔒</span>
              <h2 className="mt-4 font-display text-2xl font-extrabold">Acesso Pausado</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Seu protocolo está pausado ou sua assinatura expirou. Reative sua conta para continuar sua evolução e não perder seu streak de dias.
              </p>
              <Link
                to="/dashboard/settings"
                className="mt-6 inline-block rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground shadow-[0_0_20px_var(--accent-glow)] transition-all hover:scale-105 hover:shadow-lg pointer-events-auto"
              >
                Reativar Meu MindReset →
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}