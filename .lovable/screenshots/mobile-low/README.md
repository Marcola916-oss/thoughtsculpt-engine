# 📱 MindReset — Mobile Low-End (SA / PL / RO)

**Data:** 2026-07-08
**Device simulado:** iPhone SE / Android low-end — viewport **375×667**, DPR 2, touch, UA Android 9 Samsung
**Locales:** `ar-SA` (RTL), `pl-PL`, `ro-RO`
**Script:** `../capture-mobile-multilang.py` (rodar `python3 capture-mobile-multilang.py ar pl ro` a partir de `.lovable/screenshots/`)

Snapshot completo do funil MindReset em mobile low-end (~375px) em 3 idiomas alvo do produto: Árabe (Arábia Saudita, RTL), Polaco e Romeno.

## Estrutura

```
mobile-low/
├── ar/  → Árabe RTL (locale ar-SA)  — 65 prints
├── pl/  → Polaco    (locale pl-PL)  — 68 prints
└── ro/  → Romeno    (locale ro-RO)  — 68 prints
```

Cada pasta segue a **mesma nomenclatura** do snapshot desktop em `../README.md`:

| Prefixo | Tela |
|---|---|
| `01-landing-NN.png` | Landing scrollada (10-11 viewports em mobile) |
| `02-identidade.png` / `02b-identidade-preenchida.png` | Tela 0 — Identidade |
| `03-quiz-01…08.png` | Telas 1-8 — Quiz de arquétipo |
| `04-email.png` / `04b-email-preenchido.png` | Tela 9 — Captura de e-mail |
| `05-loader.png` / `05b-loader-mid.png` / `05c-loader-late.png` | Tela 10 — Loader neural (3 estados) |
| `06-reveal-NN.png` | Tela 11 — Revelação do arquétipo (scroll completo) |
| `07-sales-NN.png` | Tela 12 — VSL / SalesPage (12-20 viewports em mobile) |
| `07b-exit-intent.png` | Modal exit-intent |
| `08-checkout-NN.png` | Tela 13 — Checkout Produto (OfferMonolith) |
| `08b-stripe-attempt.png` | Tela 14 — Redirect Stripe (ou erro se STRIPE_SECRET_KEY ausente) |
| `09-obrigado-NN.png` | Tela 15 — Thank You (`/obrigado?order_id=demo-test-preview`) |
| `10-privacy-NN.png` / `11-terms-NN.png` | Páginas legais |
| `12-404.png` | Página 404 |

> **Tela 16 — E-mail automático** não é capturada (é enviada pelo backend via Resend/SendGrid; não tem UI in-app). O template vive em `src/lib/email/send-diagnosis.functions.ts`.

## Notas por idioma

### 🇸🇦 AR (ar-SA) — RTL
- Layout invertido: navegação, ícones direcionais (`ArrowRight`, `ChevronRight`) flipados via CSS `[dir="rtl"] transform: scaleX(-1)` (ver `src/styles.css` Onda 4)
- Fonte: Noto Naskh Arabic
- Arquétipos localizados: **المدخر القهري** (AO), **الباحث عن المكانة** (SS), **المتهرب** (EA), **المندفع اللذي** (HI)
- Verificar: alinhamento de números (preços), progresso do quiz (deve ir da direita para a esquerda), CTAs

### 🇵🇱 PL (pl-PL)
- Arquétypos: **Oszczędny** (AO), **Paw** (SS), **Uciekinier** (EA), **Iskra** (HI)
- Verificar: acentos (ą, ę, ł, ń, ó, ś, ź, ż) renderizando corretamente
- Método de pagamento nativo esperado no futuro: **BLIK** (não presente no Stripe atual)

### 🇷🇴 RO (ro-RO)
- Arquétipos: **Econom** (AO), **Cumpătat/Ostentator** (SS), **Detașat** (EA), **Impulsiv** (HI)
- Verificar: diacríticos (ă, â, î, ș, ț) renderizando corretamente
- Moeda: RON (leu) — verificar formatação nos checkouts

## Bugs conhecidos visíveis nos prints

1. **Moeda geo-incorreta:** todos os checkouts mostram **R$ / EUR** em vez de **SAR / PLN / RON** (fix agendado para Onda 8 — ver `melhorias_contexto/Revisão-Final-de-Conversão-01-COMPLEMENTADA.md`)
2. **"Arquétipo arquétipo:"** — bug de concatenação de título visível no `08-checkout-01.png` (todos idiomas)
3. **CTA cor inconsistente:** varia entre vermelho brand e outras cores dependendo do arquétipo capturado (script escolhe opção 3 de cada quiz → arquétipo pode variar)
4. **AR:** algumas seções da landing podem ter alinhamento LTR residual (badges, `flex` sem `flex-row-reverse`)

## Como recapturar

```bash
# A partir de .lovable/screenshots/
python3 capture-mobile-multilang.py           # todos: ar pl ro
python3 capture-mobile-multilang.py ar        # só árabe
python3 capture-mobile-multilang.py pl ro     # PL e RO
```

Requer dev server ativo em `http://localhost:8080`.

## Para IAs futuras

Antes de qualquer edição visual/copy que afete AR/PL/RO ou mobile: **consultar estes prints**. Após aplicar a mudança: **recapturar a pasta afetada** e substituir os PNGs. Não misturar snapshots de versões diferentes na mesma pasta.