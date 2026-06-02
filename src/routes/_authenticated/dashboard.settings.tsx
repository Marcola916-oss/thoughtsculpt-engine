import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, FormEvent, useEffect } from "react";
import { getMyProfile } from "../../lib/profile.functions";
import { createCustomerPortalSession } from "../../lib/checkout.functions";
import { ARCHETYPE_NAMES, type Archetype } from "../../lib/ai/archetypes";
import { useI18n } from "../../lib/i18n/LanguageProvider";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — MindReset" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const fetchProfile = useServerFn(getMyProfile);
  const getPortal = useServerFn(createCustomerPortalSession);
  const { lang, setLang } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
  });

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Initialize theme from HTML element
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
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
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold">Configurações</h1>
        <p className="mt-2 text-muted-foreground">Gerencie seu perfil, preferências e assinatura.</p>
      </header>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-bold">Perfil</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome</label>
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm">{p?.display_name || "—"}</div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Arquétipo</label>
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
                {p?.archetype ? ARCHETYPE_NAMES[p.archetype as Archetype].pt : "Não definido"}
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-bold">Preferências</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Idioma</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="pt">Português (BR)</option>
                <option value="en">English</option>
                <option value="pl">Polski</option>
                <option value="ro">Română</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tema Visual</label>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as "dark" | "light")}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="dark">Escuro (Dark Mode)</option>
                <option value="light">Claro (Light Mode)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-bold">Assinatura e Cobrança</h2>
          {sub ? (
            <div>
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plano Atual</label>
                  <p className="mt-1 text-lg font-bold">
                    {sub.plan === "p30d" ? "30 Dias" : sub.plan === "p6m" ? "6 Meses" : "1 Ano"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
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
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Próxima Renovação</label>
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
                  {portalLoading ? "Acessando..." : "Gerenciar no Stripe"}
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  Cancelar assinatura
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma assinatura ativa encontrada.</p>
          )}
        </section>
      </div>

      {/* Cancel Retention Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="font-display text-xl font-bold">Espera! Antes de cancelar, {p?.display_name}...</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Você começou seu protocolo e interromper agora significa perder seu progresso diário e o acesso à sua matriz de ação personalizada.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Voltar e manter progresso
              </button>
              <button
                onClick={handlePortalRedirect}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 font-semibold hover:border-primary"
              >
                Continuar para o cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
