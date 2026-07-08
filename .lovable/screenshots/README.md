# 📸 MindReset — Snapshot Visual do Produto

**Data:** 2026-07-08
**Ferramenta:** Playwright (Chromium headless, viewport 1440×1800, locale pt-PT)
**Scripts:** `/tmp/browser/mindreset/capture2.py` + `capture3.py` + `tail.py`

Este directório contém prints de **todas as telas que o cliente vê** no funil MindReset, capturados de uma sessão real ponta-a-ponta (Landing → Identidade → Quiz 8/8 → Email → Loader → Reveal → Sales/VSL → Checkout produto → Checkout Stripe → Obrigado), incluindo exit-intent modal e páginas legais.

> **Uso para IAs:** consulte este ficheiro antes de qualquer edição visual/copy. Cada `.png` mostra o estado real do produto em produção-like. Ao mudar UI/copy, tire novo print e substitua o ficheiro correspondente.

---

## Índice

### 1 · Landing Page (pré-quiz)
Página inteira scrollada em 5 blocos de viewport (altura total ~8090px).
- `01-landing-01.png` — Hero (headline + CTA principal)
- `01-landing-02.png` — ProofBar + ArchetypeShowcase (parte 1)
- `01-landing-03.png` — ArchetypeShowcase (parte 2) + HowItWorks
- `01-landing-04.png` — FeaturesGrid + Testimonials
- `01-landing-05.png` — FAQ + FinalCTA + Footer

### 2 · Identidade (Tela 0)
- `02-identidade.png` — Formulário vazio (nome + género)
- `02b-identidade-preenchida.png` — Preenchido (Ana Teste + Feminino selecionado, botão Continuar ativo)

### 3 · Quiz (Telas 1-8)
8 perguntas do quiz de arquétipo. Cada print mostra pergunta + 4 opções A/B/C/D.
- `03-quiz-01.png` → `03-quiz-08.png`

### 4 · Captura de E-mail (Tela 9)
- `04-email.png` — Bloqueio "Ana Teste, o teu diagnóstico está pronto" com input vazio
- `04b-email-preenchido.png` — E-mail + checkbox privacidade preenchidos, CTA "Ver o meu arquétipo agora" ativo

### 5 · Loader (Tela 10)
3 estados temporais do loader neural com MarbleBust central + textos rotativos.
- `05-loader.png` — t=1.5s (início)
- `05b-loader-mid.png` — t=~6s (meio)
- `05c-loader-late.png` — t=~10s (fim, transição para reveal)

### 6 · Revelação do Arquétipo (Tela 11)
Página inteira do reveal (arquétipo detectado: **Acumulador Obsessivo — AO** para esta sessão). Altura ~4035px.
- `06-reveal-01.png` — Header "Ana Teste, o teu arquétipo é: ACUMULADOR OBSESSIVO" + Anatomia do Padrão + scores das 4 áreas (topo)
- `06-reveal-02.png` — Scores completos (Dinheiro 91, Carreira 77, Amor, Pessoal 68) + secção "O mesmo padrão. 4 áreas."
- `06-reveal-03.png` — Diagnóstico expandido + CTA "Quero acessar meu protocolo"

### 7 · Página de Vendas — VSL / SalesPageV2 (Tela 12)
Página longa (~12795px). CTA final leva ao checkout stub.
- `07-sales-01.png` — Hero de vendas (H1 + tira de trust)
- `07-sales-02.png` — Pain Mirror (Bloco 2)
- `07-sales-03.png` — Ciência (Bloco 3)
- `07-sales-04.png` — Deliverables 4D — Grid Dinheiro/Carreira/Amor/Pessoal
- `07-sales-05.png` — Deliverables (continuação) + Bridge Bloco 7
- `07-sales-06.png` — Trust bar (4 ícones)
- `07-sales-07.png` — Testimonials + Final CTA
- `07-sales-08.png` — Guarantee + Footer da secção sales

### 7b · Exit-Intent Modal
- `07b-exit-intent.png` — Modal "Ana Teste, podes mesmo sair agora?" (disparado por mouseleave). Visível: MindReset logo, progress ANÁLISE 100% / PROTOCOLO 0%, CTA "MOSTRA-ME O PROTOCOLO", link "Sair e perder o meu diagnóstico"

### 8 · Checkout — Produto (OfferMonolith, Tela 13)
Painel violeta com detalhes da oferta + order bumps + preço + CTA "Desbloquear".
- `08-checkout-01.png` — Painel principal: "Ana Teste, escolhe o teu protocolo", inclusos, R$ 50 (–67% só hoje), 2 order bumps, CTA "DESBLOQUEAR PROTOCOLO POR R$ 49,90"
- `08-checkout-02.png` — Testimonials sob o checkout

### 8b · Checkout Stripe (Tela 14)
- `08b-stripe-attempt.png` — Página real do Stripe Checkout hospedada. Mostra: seletor moeda (€ 8,82 / R$ 49,90), linha "Diagnóstico MindReset — PDF completo", subtotal, formulário cartão (Cartão · MM/AA · CVC · Nome · País), CTA "Pagar", footer Stripe · Termos · Privacidade

### 9 · Thank You (Tela 15)
- `09-obrigado-01.png` — Título "O TEU DIAGNÓSTICO ESTÁ PRONTO" + subline "Documento confidencial, 14 páginas, lido em 12 minutos". (Botões de download PDF etc aparecem abaixo mediante `order_id` real; aqui carregado com order_id de teste sem dados backend.)

### 10-12 · Páginas legais + 404
- `10-privacy-01.png` / `10-privacy-02.png` — Página de Privacidade (2 viewports)
- `11-terms-01.png` / `11-terms-02.png` — Página de Termos (2 viewports)
- `12-404.png` — Página 404 (`/nao-existe-xyz`)

---

## Notas para IAs futuras

1. **Cookie banner** aparece em toda a landing/quiz até ser dispensado — ver `01-landing-*` e `03-quiz-*` no rodapé.
2. **Arquétipo capturado nesta sessão:** AO (Acumulador Obsessivo). As cores do reveal seguem `--arch-primary: #1E6B82` (azul petróleo). Se re-executar a captura, o arquétipo pode variar consoante as respostas do quiz (script clica sempre no botão índice 2 = opção A).
3. **Exit-intent** só dispara 1× por sessão em memória. Para recapturar limpe o contexto do browser.
4. **Stripe checkout** é redirecionamento real — depende de `STRIPE_SECRET_KEY` no backend. Se falhar, o print mostrará erro ou permanência no `08-checkout`.
5. **Obrigado** completo (com botões de download PDF + upsell + próximos passos) só renderiza com `order_id` válido no Supabase. O print atual mostra apenas o estado header.
6. **Idioma:** captura em `pt-PT`. Para outras línguas (EN/PL/RO/AR) mudar `locale` no context. AR ativa RTL — `01-landing` mudará radicalmente de layout.
7. **Viewport:** 1440×1800 (desktop wide). Para mobile snapshot use `375×812`.

## Como recapturar

```bash
python3 /tmp/browser/mindreset/capture2.py   # funil completo
python3 /tmp/browser/mindreset/capture3.py   # apenas reveal→sales→checkout
python3 /tmp/browser/mindreset/tail.py       # exit-intent + Stripe + obrigado
```

Os scripts assumem servidor em `http://localhost:8080` (Vite dev já rodando).

---

## 📱 Snapshot mobile low-end + multi-língua

Ver `mobile-low/README.md` — cobertura completa do funil em **375×667** nos idiomas **AR (RTL) / PL / RO**, separados por pasta. Script: `capture-mobile-multilang.py`.