/**
 * Fase 4 — Substituição de placeholders Bible V2 ([NOME], [PRIMARY], [SECONDARY])
 * em runtime. Usado pelo SalesPageV2 / ExitIntentModal.
 */
export type TplVars = {
  name: string;
  primary: string;
  secondary: string;
};

export function fillTpl(tpl: string, vars: TplVars): string {
  return tpl
    .replace(/\[NOME\]/g, vars.name)
    .replace(/\[NAME\]/g, vars.name)
    .replace(/\[PRIMARY\]/g, vars.primary)
    .replace(/\[SECONDARY\]/g, vars.secondary);
}