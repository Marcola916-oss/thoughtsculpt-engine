import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    // Only check auth on the client to avoid hydration mismatch/SSR redirect loops
    // since the session is stored in localStorage.
    if (typeof window !== "undefined") {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        // If we're on the client and have no user, redirect to login
        throw redirect({ to: "/login" });
      }
    }
  },
  component: () => <Outlet />,
});
