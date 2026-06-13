# Ajuste Global de Responsividade e Centralização de Títulos

Ajustar globalmente a responsividade de todas as páginas e seções do MindReset, garantindo que os títulos permaneçam legíveis e sem cortes (clipping) nas bordas em qualquer dispositivo (incluindo telas móveis de 320px/375px), mantendo o estilo de design premium original, porém forçando o alinhamento centralizado de forma consistente em todo o fluxo da aplicação.

## User Review Required

> [!IMPORTANT]
> **1. Escopo de Centralização de Títulos:** 
> Centralizaremos **todos** os títulos principais (`h1`, `h2` e `h3` que representam cabeçalhos de página ou seção) para garantir consistência visual de ponta a ponta. Isso inclui cabeçalhos de páginas internas do painel (como Compass, Settings, Onboarding), o que mudará o visual atual que possui alguns títulos alinhados à esquerda nestas seções específicas.
> 
> **2. Margem de Segurança para Fontes Itálicas:**
> Como o design utiliza a fonte display `Syne` com estilo `italic`, o inclinação natural das letras faz com que o final das palavras sofra cortes (clipping) nas bordas da tela. Corrigiremos isso aplicando uma margem de segurança global e padding extra inline de compensação (`padding-right: 0.15em`).
> 
> **3. Tamanho de Fonte Fluido (Clamp):**
> Substituiremos valores absolutos em viewport width como `text-[12vw]` por tipografia fluida (`clamp(...)`) para evitar que palavras longas quebrem o layout em dispositivos móveis muito estreitos.

## Open Questions

> [!NOTE]
> Há alguma seção interna do painel (Dashboard/Configurações) onde você prefere que o título mantenha o alinhamento à esquerda por razões de grid de formulário, ou deseja a centralização absoluta em 100% dos títulos do produto?

## Proposed Changes

### Estilização Global e Layout Base

---

#### [MODIFY] [styles.css](file:///c:/Dev/thoughtsculpt-engine/src/styles.css)
- Atualizar a regra padrão para títulos (`h1, h2, h3, .font-display`) para incluir centralização global (`text-align: center`), distribuição equilibrada de linhas (`text-wrap: balance`), e margens/paddings inline de segurança para acomodar a inclinação da fonte itálica.
- Criar classes de utilidade para tamanhos de título baseados em `clamp()` para as telas de reveal (`[12vw]`), hero (`[7.5vw]`), etc., para que encolham de forma segura no mobile.

---

### Fluxo de Landing e Quiz (Página Inicial)

---

#### [MODIFY] [index.tsx](file:///c:/Dev/thoughtsculpt-engine/src/routes/index.tsx)
- Corrigir o container `<main>` na linha 231 alterando a classe `px-0` para `px-4` no mobile, garantindo que todo conteúdo tenha no mínimo 16px de recuo das bordas da tela.
- Ajustar os títulos do `Hero`, `Identity`, `QuestionScreen` e `Reveal` para aplicar as novas regras de tamanho fluido e garantir que estejam perfeitamente centralizados horizontalmente (`text-center mx-auto`).
- Garantir que as seções de vendas (`Pain Mirror`, `Science`, `Features`, `Guarantee`, `Final CTA`) alinhem seus cabeçalhos no centro do layout.

---

### Componentes de Seções da Landing Page

---

#### [MODIFY] [FAQ.tsx](file:///c:/Dev/thoughtsculpt-engine/src/components/landing/FAQ.tsx)
- Ajustar o `h2` para centralizar mesmo na visualização em colunas ou ajustar o layout do FAQ para alinhar visualmente o título em sincronia com os acordions.

---

### Fluxo de Boas-Vindas (Obrigado)

---

#### [MODIFY] [obrigado.tsx](file:///c:/Dev/thoughtsculpt-engine/src/routes/obrigado.tsx)
- Garantir que o título com efeito typewriter (`TypewriterText`) e o cabeçalho principal estejam centralizados e com margem segura nas laterais.

---

### Páginas do Painel e Autenticação (Dashboard, Onboarding)

---

#### [MODIFY] [onboarding.tsx](file:///c:/Dev/thoughtsculpt-engine/src/routes/_authenticated/onboarding.tsx)
- Ajustar os cabeçalhos de cada etapa de calibração (Step 1-7) para centralizar seu conteúdo e emoji de forma harmoniosa, adaptando-se a telas verticais e horizontais sem quebra.

#### [MODIFY] [dashboard.index.tsx](file:///c:/Dev/thoughtsculpt-engine/src/routes/_authenticated/dashboard.index.tsx)
- Centralizar o título principal do Hub e o banner de arquétipo, ajustando a responsividade geral do grid bento no mobile.

#### [MODIFY] [dashboard.diagnosis.tsx](file:///c:/Dev/thoughtsculpt-engine/src/routes/_authenticated/dashboard.diagnosis.tsx)
- Centralizar o título do dossiê comportamental e a tab ativa, com paddings de segurança.

#### [MODIFY] [dashboard.calendar.tsx](file:///c:/Dev/thoughtsculpt-engine/src/routes/_authenticated/dashboard.calendar.tsx)
- Centralizar títulos da matriz de ação e os textos informativos do sidebar do dia ativo.

#### [MODIFY] [dashboard.compass.tsx](file:///c:/Dev/thoughtsculpt-engine/src/routes/_authenticated/dashboard.compass.tsx)
- Ajustar a centralização dos cabeçalhos do fluxo de análise de pessoas e dos cards de histórico.

#### [MODIFY] [dashboard.settings.tsx](file:///c:/Dev/thoughtsculpt-engine/src/routes/_authenticated/dashboard.settings.tsx)
- Ajustar o alinhamento central dos títulos de seção (`Perfil`, `Preferências`, `Assinatura`, `Segurança`).

---

### Páginas Estáticas e Autenticação Livre

---

#### [MODIFY] [login.tsx](file:///c:/Dev/thoughtsculpt-engine/src/routes/login.tsx)
- Centralizar o título "Entrar" e alinhar o formulário abaixo de forma balanceada.

#### [MODIFY] [privacy.tsx](file:///c:/Dev/thoughtsculpt-engine/src/routes/privacy.tsx)
- Centralizar o título "Política de Privacidade".

#### [MODIFY] [terms.tsx](file:///c:/Dev/thoughtsculpt-engine/src/routes/terms.tsx)
- Centralizar o título "Termos de Serviço".

#### [MODIFY] [share.$token.tsx](file:///c:/Dev/thoughtsculpt-engine/src/routes/share.$token.tsx)
- Garantir que o nome e arquétipo compartilhado permaneçam centralizados com tamanhos fluidos.

## Verification Plan

### Automated Tests
- Executar `npm run build` para garantir integridade do build.
- Executar teste de fumaça via Playwright se configurado.

### Manual Verification
- Testar a renderização visual em resoluções simuladas (320px, 375px, 768px, 1440px) pelo DevTools do Chrome.
- Verificar especificamente os arquétipos revelados ("STATUS SEEKER", "ACUMULADOR OBSESSIVO") no mobile para validar que a compensação do itálico (`padding-right`) elimina o corte das letras e que o texto está totalmente centralizado.
