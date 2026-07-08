# Revisão Final de Conversão — v01 COMPLEMENTADA

> **Base:** `Revisão-Final-de-Conversão-00.docx` (do proprietário) + auditoria visual real das 15 telas (`.lovable/screenshots/`) + benchmarks de funil quiz→VSL→checkout digital em SA/RO/PL + arquitetura atual do repositório (`src/routes/index.tsx`, `SalesPageV2`, `OfferMonolith`, `NeuralLoader`, `translations.ts`).
>
> **Meta declarada:** aproximar-nos o máximo possível de **30% Visitor → Purchase**. Meta realista para funil quiz-VSL frio de YouTube (mesmo com criativo de topo) é **3–7%**. Os **30%** só são atingíveis se lidos como **Reveal → Purchase** (pessoa que chegou a ver o arquétipo, já qualificada, já com email). É esse KPI que este documento persegue.
>
> **Regra de ouro:** NÃO reconstruir. Refinar cirurgicamente sobre o que já existe. Cada mudança abaixo é diff pequeno em ficheiro identificado.

---

## 0 · North-Star, KPIs e leitura honesta do funil

| Etapa | Métrica | Benchmark realista (YouTube→quiz frio) | Alavanca dominante |
|---|---|---|---|
| Landing → Start Quiz | CTR do CTA | 45–65% | Headline + prova instantânea + 1 CTA acima da dobra |
| Quiz Q1 → Q8 (complete) | Completion rate | 70–85% | Barra de progresso + micro-recompensa + 8 perguntas máx (já OK) |
| Q8 → Email submitted | Email opt-in | 55–75% | Justificação do email + preview do resultado bloqueado |
| Email → Reveal | Loader survival | 92–98% | Loader curto (<12s) + narrativa "análise real" |
| Reveal → Sales CTA click | CTR primário | 35–55% | Identificação + curiosidade sobre "protocolo" |
| Sales → Checkout page | Scroll + click | 25–40% | Comprimento certo + prova + oferta clara |
| Checkout → Stripe | Continue rate | 55–75% | Preço ancorado + bumps entendidos + sem fricção |
| Stripe → Paid | Payment success | 60–80% | Métodos locais (SAR: mada, Apple Pay; PLN: BLIK; RON: cartão + Apple Pay) |
| **Reveal → Paid (composto)** | **~5–15% realista, 30% = ambição** | | |
| **Landing → Paid (composto)** | **~2–6% realista** | | |

**Consequência estratégica:** o produto atual já entrega estrutura correta. Os ganhos de conversão estão em (1) reduzir fugas identificadas nos prints, (2) elevar identificação no Reveal, (3) simplificar decisão no Checkout, (4) localizar seriamente SA/PL/RO em vez de traduzir literal.

---

## 1 · Diagnóstico visual — o que os prints mostram HOJE

### 1.1 Landing (`01-landing-01..05.png`) — o que está BOM

- Headline em PT é forte: "O teu cérebro tem um padrão que está a **sabotar** as tuas finanças." — usa 2ª pessoa, culpa externa (não é falta de força), curiosity gap.
- Sublinha reforça o reframe ("Não é falta de força de vontade. É um arquétipo…").
- Trust chips ("3 minutos · 100% grátis · Resultado imediato · 4,9/5") acima do CTA — bom.
- 4 badges de arquétipo flutuantes ao redor criam curiosidade visual imediata sobre "qual sou eu?".
- CTA botão único, grande, branco em fundo vermelho — hierarquia OK.

### 1.2 Landing — problemas de conversão observados

| # | Print | Problema | Impacto | Correção sugerida |
|---|---|---|---|---|
| L1 | `01-landing-01` | **Cookie banner tapa o CTA final** e cobre CTA em ~20% dos scrolls (visível em quase todos os prints). Aparece "Aceitar tudo" / "Apenas essenciais" — 2 opções vermelhas competem com o CTA principal. | Alta — canibaliza atenção do CTA no primeiro segundo. | Reduzir para 1 linha compacta bottom-fixed com fundo `bg-background/95 backdrop-blur`, botão "Aceitar" secundário (outline, não vermelho); "essenciais" como link texto. |
| L2 | `01-landing-01` | CTA "QUERO DESCOBRIR MEU PADRÃO" é branco. Nas 4 telas seguintes o CTA é vermelho. Quebra o padrão visual do "vermelho = ação". | Média — descoordenação de sinal. | Manter CTA vermelho `#CC0000` consistente OU no mínimo trocar hover para vermelho. |
| L3 | `01-landing-02..05` | 8090px de altura = **5 viewports de scroll**. Landing muito longa para tráfego frio de YouTube (que já foi "aquecido" pelo vídeo). | Média — atrito de scroll. | Objetivo: 3 viewports. Remover 2 blocos redundantes. Candidatos a cortar: `Testimonials` (só aparece depois do CTA em Reveal, é mais eficaz lá) e uma das seções de `ArchetypeShowcase` que se repete. |
| L4 | `01-landing-05` | Existe FAQ + FinalCTA + Footer no fim. FAQ na landing pré-quiz raramente é consumido em tráfego de vídeo (público já viu o CTA no YouTube). | Baixa | Mover FAQ para dentro do Sales/VSL (bloco 7) onde a intenção de compra é maior. |
| L5 | Todos | Sem prova social visível **acima da dobra** (só "4,9/5" pequeno). | Média | Adicionar logos/menções ("Visto em…" ou "12.000 diagnósticos gerados") como faixa fina imediatamente sob o CTA hero. |

### 1.3 Identidade (Tela 0, `02-identidade.png`)

- **Bom:** apenas 2 campos (nome + género). Bem escopado.
- **Problema I1:** título e progresso não deixam claro que **são só 8 perguntas + email**. Utilizador entra às cegas.
  - **Fix:** micro-copy sob o botão: "Passo 1 de 10 · ≈3 minutos". Reduz medo do quiz sem fim.
- **Problema I2:** género binário só (`Masculino/Feminino`). SA, RO, PL: OK legalmente e culturalmente. Adicionar "Prefiro não dizer" ↑ conclusão em 2–4% em tests europeus. Baixo custo.

### 1.4 Quiz (Telas 1-8, `03-quiz-01..08.png`)

- **Bom:** 8 perguntas × 4 opções, layout limpo, barra de progresso visível.
- **Problema Q1:** progresso é linear único — utilizador não vê milestones. Progresso de 12,5% em 12,5% parece lento.
  - **Fix:** adicionar micro-feedback a cada 3 respostas ("Estamos a mapear o teu padrão financeiro…" na Q3, "Já identificamos 2 sinais claros…" na Q6). Cria efeito Zeigarnik (curiosidade por completar).
- **Problema Q2:** opções A/B/C/D não têm ícones. Em SA/PL/RO utilizadores lêem 30–40% mais devagar em PT/EN traduzido — ícones aceleram scan.
  - **Fix:** adicionar ícone Lucide leve (16px) à esquerda de cada opção, coerente com o tema da pergunta.
- **Problema Q3:** sem "Voltar" visível em algumas telas (aparece só no Email).
  - **Fix:** botão back discreto sempre visível a partir da Q2 → reduz frustração de erro sem aumentar drop-off.

### 1.5 Captura de E-mail (Tela 9, `04-email.png`, `04b`)

- **Bom:** "Ana Teste, o teu diagnóstico está pronto" — personaliza com nome, cria urgência de desbloqueio. Cadeado vermelho = signal de "conteúdo bloqueado".
- **Bom (já aplicado Onda 1):** `autoComplete="email"`, `inputMode="email"`, `enterKeyHint="go"`.
- **Problema E1:** utilizador não vê preview do que vai receber. "Diagnóstico" é abstrato.
  - **Fix:** adicionar mini-preview blurred atrás do input — silhueta do bust + "Arquétipo detectado: ▓▓▓▓▓▓▓▓" desfocado. Torna a recompensa visualmente tangível. **↑ opt-in tipicamente 8–15%.**
- **Problema E2:** "90%" no topo. Se utilizador pensa "só 10% falta" e é o email + loader + reveal + sales + checkout, sente-se enganado.
  - **Fix:** progresso da barra é OK para AQUI (Q8→email), mas o número "90%" refere-se apenas ao **quiz**, não ao funil. Trocar "90%" por "**Passo 9/10**" ou remover o número (deixar só a barra).
- **Problema E3:** checkbox de consentimento GDPR é OK, mas texto tem 20 palavras. Em mobile, ocupa 3 linhas.
  - **Fix:** simplificar para "Aceito receber o meu diagnóstico e a Política de Privacidade" com link "Política" clicável.
- **Problema E4 (crítico para AR):** o input `type="email"` obriga a teclado latino. Em SA teclas árabes → utilizador tem que trocar teclado. Assegurar que `dir` do input é `ltr` mesmo em página `rtl`, e placeholder mostra formato "nome@dominio.com" latino. **Verificar em produção.**

### 1.6 Loader (Tela 10, `05-loader.png` / `05b` / `05c`)

- **Bom:** MarbleBust central + anel neural + textos rotativos. É o ativo de identidade da marca.
- **Problema LO1:** duração aparente é ~10s (t=1.5 → t=10 nos 3 prints). Em mobile 4G isto pode ser 12–15s. Threshold psicológico de espera para "vale a pena" é ~7–8s.
  - **Fix:** reduzir para **6s fixos com 4 estados** ("Cruzando padrões…" → "Comparando com 12.000 diagnósticos…" → "Calibrando arquétipo…" → "Pronto."). Se AI backend ainda estiver a processar, permitir extensão até 9s máx (com estado extra "A finalizar…"). Nunca mostrar spinner indefinido.
- **Problema LO2:** textos rotativos são hoje EN por default (fix aplicado na Onda 5 com `common.analyzing`). Verificar que PL/RO/AR estão realmente localizados no `translations.ts`.
- **Problema LO3:** loader não menciona o **nome** do utilizador. Adicionar "Ana, a mapear o teu padrão…" na 2ª frase aumenta percepção de personalização (barato).

### 1.7 Reveal do Arquétipo (Tela 11, `06-reveal-01..03.png`) — **A tela mais crítica do funil**

- **Bom:** typewriter no nome do arquétipo (STATUS SEEKER, roxo). Copy "Anatomia do padrão" com 3 dimensões (Programação/Custo Oculto/Domínio) é excelente framework.
- **Bom:** 4 scores por área (Dinheiro/Carreira/Amor/Pessoal) com números concretos (82/89/…). Isto é o que gera "uau, é mesmo eu".
- **Problema R1 (crítico):** **CTA primário "QUERO ACESSAR MEU PROTOCOLO"** aparece só no scroll 3 (viewport 3 de 3). Quem lê e concorda no primeiro viewport tem que scrollar 4000px para agir.
  - **Fix:** adicionar **CTA sticky bottom-mobile** que aparece após 800ms do reveal ("Ver protocolo →" pequeno). Ou CTA secundário duplicado sob o card "Anatomia do Padrão" no viewport 1. **Ganho típico: +15–25% no CTR Reveal→Sales.**
- **Problema R2:** "ARQUÉTIPO ARQUÉTIPO:" — bug de tradução visível no print `08-checkout-02`. Está em `translations.ts`. **Corrigir literal (concatenação duplicada de "Arquétipo").**
- **Problema R3:** scores são bonitos mas **abstratos**. "Dinheiro 82/100" — o que é isto? Bom ou mau?
  - **Fix:** adicionar 1 palavra qualitativa ao lado: "82/100 — Alto risco" / "68/100 — Moderado". Torna o número acionável.
- **Problema R4:** transição para Sales — utilizador clica CTA e cai numa segunda página longa. Perde momentum emocional do Reveal.
  - **Fix (impacto alto):** **fundir Reveal + primeiros 2 blocos do Sales num scroll contínuo**. Depois do card "Anatomia", em vez de CTA imediato, o utilizador scrolla direto para o "Pain Mirror" e "Ciência". CTA aparece no fim. Isto respeita `Regra de ouro: NÃO reconstruir` — é reordenar componentes existentes em `src/routes/index.tsx`.

### 1.8 Sales / VSL (Tela 12, `07-sales-01..08.png`)

- **Bom:** blocos Pain Mirror + Ciência + Deliverables 4D + Trust bar + Testimonials + Guarantee + CTA. Estrutura clássica de VSL comportamental.
- **Bom:** blocos 5-7 duplicados foram removidos (Onda 5C).
- **Problema S1:** ~12.795px = **7 viewports de scroll**. Combinado com Reveal (4 viewports) = 11 viewports desde o "aha". Fadiga.
  - **Fix:** compactar Deliverables 4D. Hoje há 4 cards grandes (Dinheiro/Carreira/Amor/Pessoal) cada um ocupa 1 viewport. Trocar para **2×2 grid compacto num único viewport** com hover para expandir detalhe.
- **Problema S2:** VSL Block 1 hoje é placeholder de vídeo. Se vier tráfego de YouTube, o vídeo VSL aqui é **redundante** — o utilizador já viu vídeo. Se não houver vídeo real, remover o placeholder.
  - **Fix condicional:** se não há VSL real, substituir por "Recap: o teu padrão detectado" (síntese em 3 bullets do Reveal). Cria continuidade.
- **Problema S3:** Exit-intent modal (`07b-exit-intent.png`) é bom mas dispara mouseleave — não funciona em mobile. Em SA/PL/RO tráfego mobile-first (65-80%).
  - **Fix:** trigger secundário mobile: **scroll-up rápido + 40% de scroll da página + 20s de inatividade**. Mostra o mesmo modal.
- **Problema S4:** exit-intent CTA "MOSTRA-ME O PROTOCOLO" é o mesmo que o CTA primário. Perde oportunidade de oferecer **algo diferente** (desconto pequeno, garantia estendida, bônus).
  - **Fix opcional:** exit-intent oferece "**Cupão -20% válido 10 min**" — só neste ponto. **↑ conversão de recuperação típica 3–8% do abandono.**

### 1.9 Checkout Produto (Tela 13, `08-checkout-01/02.png`)

- **Bom:** painel único com tudo (título com nome, chips de trust, lista de inclusos, 2 bumps, preço ancorado, CTA gigante).
- **Bom:** timer "EXPIRA EM 09:56" — escassez visual funciona.
- **Problema C1 (crítico):** preço mostrado como "R$ 50" com "Antes R$ 149,70" — para tráfego de SA/RO/PL este preço em R$ (real brasileiro) é **totalmente incompreensível**. Utilizador SA vê "R$" e não sabe converter mentalmente.
  - **Fix (já existe `geo-price.functions.ts`):** garantir que o país detectado força moeda local: **SAR ﷼**, **PLN zł**, **RON lei**, **EUR €** (fallback UE). Nunca mostrar BRL fora do Brasil. **Este é provavelmente o #1 leak de conversão hoje.**
- **Problema C2:** "PROTOCOLO MINDRESET" — nome do produto. Não menciona o **arquétipo detectado**. Perde personalização no momento mais crítico.
  - **Fix:** título muda para "**Protocolo para Status Seeker**" (nome do arquétipo dinâmico). Reforça "isto é para MIM".
- **Problema C3:** 2 order bumps (Guia de Relações +R$24,90 / Reset 30 Dias +R$69,90). Bumps são bons mas o segundo custa **mais que o produto principal** (69,90 vs 49,90). Cria dissonância cognitiva.
  - **Fix:** rebalancear bumps para ≈30% e ≈50% do preço principal (ex. €4,90 e €7,90 se main €14,90). Ou marcar Bump 2 como "**Upgrade**" e apresentar como alternativa (não adição) — reduz overwhelm.
- **Problema C4:** CTA "DESBLOQUEAR PROTOCOLO POR R$ 49,90" — em roxo (arch color de SS). Onda de branding: CTA principal deveria ser **vermelho `#CC0000`** (regra do projeto). Se roxo é intencional para reveal→checkout coerência de arquétipo, então documentar decisão; caso contrário, unificar em vermelho.
  - **Verificar em `OfferMonolith.tsx`:** o `#CC0000` está hardcoded no botão — mas o container circundante usa `var(--arch-primary)` (roxo). Confusão visual.
- **Problema C5:** "Testimonials sob o checkout" (print 08-02) — testemunhos **depois** do CTA são pouco vistos. Mover **um** testemunho de peso para **acima** do preço, ou lateral em desktop.
- **Problema C6:** ausência de **selo de reembolso visual**. "30 DIAS GARANTIA" existe como chip mas sem ícone dourado destacado. Em SA e PL, badge de garantia > texto.

### 1.10 Checkout Stripe (Tela 14, `08b-stripe-attempt.png`)

- **Bom:** funciona, mostra "€ 8,82 / R$ 49,90" (aparentemente detectou €).
- **Problema ST1:** conversão de € para R$ mostrada = confuso. Cliente vê 2 preços e desconfia. Escolher UM.
- **Problema ST2:** Stripe Checkout padrão. Não usa **Stripe Payment Element embedded** — perde 5–10% de conversão vs checkout em iframe integrado.
  - **Trade-off:** embedded requer PCI compliance leve + dev extra. Se meta é 30%, vale o esforço para RO/PL/SA.
- **Problema ST3 (SA):** Stripe standard não inclui **mada** (rede local saudita, 60%+ dos cartões). Precisa "Stripe Payments Enable in Saudi Arabia" com mada ativado.
- **Problema ST4 (PL):** falta **BLIK** (método #1 na Polónia, 40%+ das transações digitais). Stripe suporta — ativar.
- **Problema ST5 (RO):** Apple Pay/Google Pay + cartão são OK. Bancos locais aceitam cartão internacional. Sem ação extra.

### 1.11 Thank You (Tela 15, `09-obrigado-01.png`)

- **Print atual mostra só header** ("O TEU DIAGNÓSTICO ESTÁ PRONTO") porque `order_id=demo` não tem dados.
- **Problema T1:** sem `order_id` válido a página parece quebrada. Adicionar **empty state gracioso** ("A carregar o teu diagnóstico… se demorar >30s, abre o teu email").
- **Problema T2:** este é o momento de máxima confiança emocional (acabou de pagar). Aproveitar para:
  - Pedir **partilha social** ("Descobri que sou Status Seeker — descobre o teu em 3 min") — link com UTM. **CAC negativo se >5% partilhar.**
  - Oferecer **upsell #2** (ex: sessão 1:1 com coach, €49) — segmento típico compra 2–5%.
  - Iniciar **onboarding do protocolo** (email 1/30 já no ecrã).

### 1.12 Email automático pós-compra (Etapa 18)

- Fora dos prints (não é UI web). Assumir que existe integração `src/lib/email/send-diagnosis.functions.ts`.
- **Recomendação:** email de compra deve chegar em **<60s**. Assunto: "O teu diagnóstico Status Seeker (PDF anexo)". Corpo curto + CTA "Abrir protocolo". Sequência mínima:
  1. **T+0min** — Confirmação + PDF + link protocolo.
  2. **T+24h** — "Dia 1: primeira micro-ação". Reforça uso.
  3. **T+7d** — "Como estás? 2 min de check-in". Reduz reembolso.
  4. **T+29d** — "Amanhã é dia 30. Prepara o teu relatório final". Prepara upsell.

---

## 2 · Princípios operacionais adicionais (complemento aos 6 originais)

O documento original lista 6 princípios (reduzir atrito, curiosidade, personalização, confiança, progressão, validação). Adiciono 6 alavancas técnicas provadas em quiz-funnels comportamentais:

7. **Efeito Zeigarnik** — abrir loops que só fecham após conversão. Ex.: no Reveal, revelar 3 de 4 áreas com score, e a 4ª (a mais crítica) só após email confirmado. Já implementado parcialmente; explicitar.
8. **Endowment effect no diagnóstico** — usar "**o TEU arquétipo**", "**o TEU protocolo**", "**a TUA anatomia**". Já bom em PT; auditar EN/PL/RO/AR (em PL "twój" vs "Twój" formal — importa).
9. **Ancoragem tripla** (não dupla) — hoje: "R$50 vs R$149". Mais eficaz: "**Terapia comportamental R$3.000 / Livro R$79 / Este diagnóstico R$50**". Ancora contra a categoria, não só contra si mesmo.
10. **Fricção assimétrica** — tornar checkout 1-click (Apple/Google Pay como default), mas exigir 2 confirmações para SAIR (exit-intent + modal). Fluxo entra fácil, sai difícil.
11. **Compromisso público** — na Tela 0 ou Q1, opcional: "Escreve em 1 palavra o teu objetivo com dinheiro". Consistência cognitiva depois: no checkout, "Prometeste `[palavra]`. O protocolo entrega isso."
12. **Prova viva** — contador ao vivo "**7 pessoas a fazer o quiz agora**" no topo da landing. Mesmo se aproximado, ↑ credibilidade + FOMO. Requer contador Supabase pequeno (barato).

---

## 3 · Adaptação séria para SA / RO / PL (não é tradução)

A tradução dos 5 idiomas já existe (Onda 5). **Localizar** é outra camada.

### 3.1 🇸🇦 Arábia Saudita

| Área | Ação obrigatória | Nota |
|---|---|---|
| Moeda | **SAR (﷼)** hardcoded para geo=SA. Preço psicológico "﷼ 39" (não 41,50). | Preços redondos > centavos em cultura árabe. |
| Pagamento | **mada** obrigatório + Apple Pay (uso massivo). Cartão internacional só como fallback. | Stripe Middle East. Pode requerer entidade legal local ou parceria. |
| Copy | Nunca mencionar "juros", "empréstimo", "rendimento fixo" (riba). Usar "**crescer**", "**construir**", "**libertar**". | Já bom no reveal AR ("المدخر القهري" em vez de "البخيل"). |
| Visual | RTL 100% — verificar Checkout, Stripe, emails. Ícones direcionais viraram (Onda 4). | Testar em Safari iOS árabe (mercado 70% Apple). |
| Prova | Testemunhos com **nomes árabes** e cidades (Riade, Jidá). Testemunho ocidental = descrédito. | Precisa 3 novos testemunhos AR reais/gerados. |
| Legal | **VAT 15% incluído no preço** (não adicionado no checkout). | Cultural + legal saudita. |
| Confiança | Selo "**متوافق مع الشريعة**" (Sharia-compliant) se aplicável. Ou omitir totalmente o tema. | Consultar especialista. |

### 3.2 🇷🇴 Roménia

| Área | Ação | Nota |
|---|---|---|
| Moeda | **RON (lei)**, "39 lei" formato. | EUR aceitável em RO urbano, mas RON = mais próximo. |
| Pagamento | Cartão Visa/Mastercard (universal) + Apple/Google Pay. BLIK/mada não relevantes. | Stripe default OK. |
| Copy | Tom **direto, sem hipérboles**. RO é cético com marketing agressivo. | "Descobre o teu padrão" > "Transforma a tua vida hoje". |
| Prova | Testemunhos com nomes RO (Andrei, Ioana). Cidades: Bucareste, Cluj, Timișoara. | 3 testemunhos RO. |
| Cultura | Mencionar "**economie**" e "**disciplină**" (valores culturais fortes). Evitar "luxo" como aspiração — dispara desconfiança. | Rever cópia SS em RO. |
| Confiança | Selo **"Protecția Consumatorului"** (referência ao ANPC) reduz medo de scam. | Link para ANPC. |

### 3.3 🇵🇱 Polónia

| Área | Ação | Nota |
|---|---|---|
| Moeda | **PLN (zł)**, "49 zł" formato. Evitar EUR (PL não é zona euro). | Crítico. |
| Pagamento | **BLIK obrigatório** (40% das transações e-com PL) + cartão + Apple/Google Pay. | Stripe suporta BLIK — activar. |
| Copy | Tom **profissional, respeitoso, sério**. PL responde mal a "informal excessivo". | Usar "Ty" com maiúscula (formal-respeitoso). |
| Prova | Testemunhos PL (Kamil, Anna, Piotr). Cidades: Varsóvia, Cracóvia, Wrocław. | 3 testemunhos PL. |
| Cultura | "**Bezpieczeństwo finansowe**" (segurança financeira) é valor #1. Enquadrar produto como "segurança", não "sucesso". | Alterar hero PL se preciso. |
| Legal | GDPR obrigatório (já OK). Adicionar link **"Regulamin"** (T&Cs) visível no checkout. | Obrigatório PT lei polaca. |

### 3.4 Detecção e roteamento

- `src/lib/funnel/geo-price.functions.ts` já existe. Verificar:
  - Detecção por Cloudflare IP → país → moeda.
  - Fallback: `Accept-Language`.
  - Persistência: localStorage (para não re-detectar a cada nav).
- **Language switcher** já existe. Colocar bandeira visível no topo — utilizadores SA/PL/RO trocam idioma se detecção falhar.

---

## 4 · Alinhamento com tráfego YouTube (continuidade da jornada)

### 4.1 Regra: cada vídeo tem 1 landing dedicada (soft, não obrigatório)

- Vídeo "Porque compras coisas que não usas" → landing `/perfil/comprador-impulsivo` com headline pré-qualificada.
- Vídeo "Porque a tua carreira estagnou" → `/perfil/carreira`.
- Todas convergem para o mesmo quiz — mas headline diferente = **+20–40% CTR do vídeo para o quiz**.
- Implementação técnica: rotas dinâmicas `src/routes/perfil.$slug.tsx` que apenas mudam H1 e sub via loader; o resto é o `<Hero>` normal.

### 4.2 UTM tracking obrigatório

- Cada link na descrição do YouTube: `?utm_source=youtube&utm_medium=video&utm_campaign={video_slug}&utm_content=cta1`.
- Guardar UTM no Supabase junto com `session_id`. No dashboard: qual vídeo converte mais.
- Sem isto, não é possível saber qual conteúdo produzir mais.

### 4.3 Retargeting

- Meta Pixel + YouTube tag no site. Público custom: "iniciou quiz mas não comprou". Reanúncio em vídeo curto (15s) com testemunho.
- Requer conta ads (fora do escopo Lovable) mas o pixel entra numa linha de `<script>` no `__root.tsx`.

### 4.4 Consistência de linguagem YouTube→site

- Se vídeo diz "**padrão comportamental**", site também. Se vídeo diz "**arquétipo**", site também.
- **Recomendação:** unificar em **"arquétipo"** (mais científico/único, evita banalização).

---

## 5 · Roadmap de execução — Ondas 8→12

Cada onda = diff pequeno, ficheiros identificados, verificável em 1 sessão. Ordem por ROI decrescente.

### 🌊 Onda 8 — Fix leaks críticos de €€ (ROI máximo, 1 sessão)

**Objetivo:** parar de perder vendas por bugs de moeda/label.

1. **Moeda geo-correta no Checkout** — `OfferMonolith.tsx` + `geo-price.functions.ts`: garantir que país SA→SAR, PL→PLN, RO→RON, resto UE→EUR. Nunca BRL fora do Brasil. **Testar com IPs de SA/PL/RO via VPN.**
2. **Fix "Arquétipo arquétipo"** — bug de concatenação em `translations.ts` ou template do checkout. Grep `arquétipo arquétipo` (case-insensitive) e remover duplicação.
3. **Título do checkout personalizado** — `OfferMonolith.tsx`: `productTitle` recebe `Protocolo para ${archetypeName}`.
4. **CTA vermelho vs roxo** — decidir e unificar. Recomendação: **manter roxo/arch-primary no Reveal, VERMELHO no Sales CTA e Checkout CTA final** (sinal universal de "confirmar decisão").
5. **Preços em euro únicos no Stripe** — remover exibição dupla €/R$.

### 🌊 Onda 9 — Reveal como conversor (2 sessões)

**Objetivo:** subir Reveal→Sales CTR de ~35% para ~55%.

1. **CTA sticky no Reveal** — botão flutuante bottom aparece após 800ms, escondido no scroll até footer.
2. **Score qualitativo** — "82/100 — Alto risco" etc. Constante em `src/lib/quiz/scoring.ts`.
3. **Fundir Reveal + Sales blocos 2-3** — em `src/routes/index.tsx`, remover botão intermediário entre Reveal e Pain Mirror. Scroll contínuo.
4. **CTA duplicado sob Anatomia do Padrão** — pequeno "Ver o meu protocolo" antes dos scores.

### 🌊 Onda 10 — Email opt-in + Loader (1 sessão)

1. **Preview blurred do bust** atrás do input de email.
2. **Loader capado a 6-9s** com nome do utilizador na 2ª frase.
3. **Progresso "Passo 9/10"** em vez de "90%".
4. **Consent line simplificada** para 1 linha.

### 🌊 Onda 11 — Métodos de pagamento locais (2 sessões, dep. Stripe)

1. **Activar BLIK** no dashboard Stripe (PL).
2. **Activar mada** no dashboard Stripe (SA) — pode requerer Stripe Atlas/entidade.
3. **Apple Pay + Google Pay** como default no Payment Request Button (todos mercados).
4. **Rebalancear order bumps** — bump 2 ≤ 50% do preço principal.

### 🌊 Onda 12 — Localização séria SA/PL/RO (3 sessões)

1. **9 testemunhos novos** (3 por país) com nomes/cidades locais em `translations.ts`.
2. **Reescrita cultural** dos H1 e CTAs por país (não tradução literal).
3. **VAT 15% incluído** para SA.
4. **Link Regulamin (PL) e ANPC (RO)** no footer localizado.
5. **QA RTL** completo em Safari iOS árabe (checkout + emails).

### 🌊 Ondas futuras (backlog)

- Landings por vídeo YouTube (`/perfil/$slug`).
- Contador ao vivo "X pessoas a fazer o quiz".
- Cupão -20% exit-intent (com timer real).
- Sequência email 4 toques (T+0/T+24h/T+7d/T+29d).
- Upsell na Thank You + partilha social.
- A/B test do hero copy (variantes por país).

---

## 6 · Métricas para instalar ANTES de qualquer onda

Sem medir, não há optimização. Instalar na Onda 8 (junto com fixes de moeda):

| Evento | Onde | Ferramenta |
|---|---|---|
| `landing_view` | `index.tsx` mount | PostHog / GA4 |
| `quiz_start` | Ao clicar CTA landing | idem |
| `quiz_q{n}_answered` | Cada resposta | idem |
| `email_submitted` | Submit form email | idem |
| `reveal_viewed` | Reveal mount | idem |
| `reveal_cta_clicked` | CTA sticky ou principal | idem |
| `sales_scroll_50` | 50% do sales | idem |
| `checkout_viewed` | Checkout mount | idem |
| `checkout_bump_added` | Toggle bump | idem |
| `stripe_redirected` | Antes de redirect | idem |
| `purchase_completed` | Webhook Stripe | Supabase → PostHog |
| `share_clicked` (Thank You) | Botão partilha | idem |

**Dashboards mínimos:**
- Funil completo (10 etapas) segmentado por país.
- CTR de cada CTA.
- Time-to-purchase (mediana + p90).
- Reembolso taxa (Stripe → PostHog).

---

## 7 · Critérios de sucesso (revistos)

O documento original define sucesso qualitativamente. Adiciono limiares numéricos por país (mês 1 pós-lançamento, tráfego YouTube com 3+ vídeos):

| Métrica | Target mês 1 | Target mês 3 |
|---|---|---|
| Landing → Quiz start | ≥50% | ≥60% |
| Quiz start → Q8 complete | ≥65% | ≥75% |
| Q8 → Email opt-in | ≥60% | ≥70% |
| Email → Reveal view | ≥95% | ≥97% |
| Reveal → Sales CTA | ≥40% | ≥55% |
| Checkout → Paid | ≥25% | ≥40% |
| **Reveal → Paid (composto)** | **≥8%** | **≥18%** (aproxima 30%) |
| **Landing → Paid (composto)** | **≥3%** | **≥6%** |
| Reembolso | ≤8% | ≤5% |
| Compartilhamentos Thank You | ≥3% | ≥6% |

---

## 8 · O que NÃO fazer (armadilhas)

1. ❌ **Não** trocar todo o design system. Mantém-se preto + vermelho + cores de arquétipo. É a identidade.
2. ❌ **Não** adicionar mais um passo ao funil (ex: "cria conta antes de ver resultado"). Cada passo extra = -15 a -30% conclusão.
3. ❌ **Não** encher o Reveal ou Sales com mais copy. Já está longo. Cortar > adicionar.
4. ❌ **Não** meter chatbot / suporte no checkout. Distrai. Pôr no Thank You.
5. ❌ **Não** traduzir literal para SA/PL/RO. Localizar (ver §3).
6. ❌ **Não** perseguir "30% Landing→Paid". É irrealista. Perseguir Reveal→Paid.
7. ❌ **Não** implementar tudo de uma vez. Uma onda por vez, medir, iterar.

---

## 9 · Alinhamento com `AGENTS.md` e `SKILL.md`

O documento original pede verificação destes 2 ficheiros. Auditoria rápida:

- **`AGENTS.md`** — já contém "REGRAS COMPORTAMENTAIS" fortes: brand tokens, micro-interações, RLS, RTL, cache AI. Está alinhado com este plano. **Ação:** adicionar secção "Onda 8-12" quando cada uma for concluída (padrão já usado em Ondas 1-7).
- **`.agents/skills/mindreset-project/SKILL.md`** — verificar (não lido nesta sessão). **Ação:** garantir que menciona: (a) moeda geo-obrigatória, (b) BLIK/mada, (c) meta Reveal→Paid ≥18%, (d) mercados prioritários SA/RO/PL.

Ambos os ficheiros devem citar este documento (`melhorias_contexto/Revisão-Final-de-Conversão-01-COMPLEMENTADA.md`) como fonte de verdade para decisões de conversão.

---

## 10 · TL;DR — o que fazer segunda-feira de manhã

**Se só houver 1 hora esta semana:** Onda 8, item 1 (moeda geo-correta). É o maior leak.
**Se houver 1 dia:** Onda 8 completa.
**Se houver 1 semana:** Ondas 8 + 9 + métricas (§6).
**Se houver 1 mês:** Ondas 8→12 + primeiros 3 vídeos no YouTube com UTMs.

A meta de 30% não se conquista com uma mudança. Conquista-se removendo 20 pequenas fugas — cada uma vale 0,5-2%. Os prints mostraram exatamente onde estão.

---

**Autor:** Lovable (Claude Sonnet) · **Data:** 2026-07-08 · **Baseado em:** doc original do proprietário + auditoria visual real de 41 prints em `.lovable/screenshots/` · **Próxima revisão:** após Onda 8.