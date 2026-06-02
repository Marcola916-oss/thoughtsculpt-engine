import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "../../components/dashboard/Sidebar";
import { getMyProfile } from "../../lib/profile.functions";

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

  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}