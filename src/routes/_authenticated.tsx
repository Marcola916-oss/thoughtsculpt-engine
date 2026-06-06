import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    // Only check auth on the client to avoid hydration mismatch/SSR redirect loops
    // since the session is stored in localStorage.
    if (typeof window !== "undefined") {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw redirect({ to: "/login" });
      }
    }
  },
  component: () => <Outlet />,
});
