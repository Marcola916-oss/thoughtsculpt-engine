/**
 * $.tsx — Rota catch-all do TanStack Router para o Builder.io
 *
 * Qualquer URL que não corresponda a uma rota do nosso app
 * (ex: /campanha-01, /promo-natal, /sobre) chega aqui.
 * Este arquivo tenta buscar essa página no painel do Builder.io.
 * Se você criou uma página com esse caminho no Builder → ela aparece.
 * Se não criou → mostra 404 estilizado.
 */

import { createFileRoute, useLocation } from "@tanstack/react-router";
import { BuilderPage } from "@/components/builder/BuilderPage";

export const Route = createFileRoute("/$")({
  component: BuilderCatchAll,
});

function BuilderCatchAll() {
  const location = useLocation();

  return <BuilderPage urlPath={location.pathname} />;
}
