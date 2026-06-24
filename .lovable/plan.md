
# Plano Unificado — Página de Vendas Premium (SalesPageV2 v3 + The Awakening)

## 1. Diagnóstico

**Estado atual (`src/components/sales/SalesPageV2.tsx`, 527 LOC):**
- 9 blocos (B1→OB2) tecnicamente OK mas visualmente genéricos: `bg-card/60`, bullets `lucide:X`, `Star` amarelo, cards uniformes.
- Quebra de identidade entre Reveal (paleta arquetípica, MarbleBust, BrainOrbit) e Sales (vermelho marca raso).
- Curtain `bg-background/85 backdrop-blur-md` aplana tudo num plano só.
- Bumps em `<input type="checkbox">` cru.
- i18n `salesV2.*` em 5 idiomas **já completo** — não será reescrito.
- Checkout hosted Stripe (decisão Fase 5) **mantido**; `onContinue({ bumps })` continua o gateway.

**Cores oficiais por arquétipo** (`mem://design/archetype-colors`):
- AO `#0F4C5C` / `#3B82F6` / `#7DD3FC` (cofre)
- SS `#7C3AED` / `#C084FC` / `#F5D0FE` (luxo)
- EA `#64748B` / `#94A3B8` / `#CBD5E1` (neblina)
- HI `#F97316` / `#FBBF24` / `#FED7AA` (vitalidade)
- Vermelho `#CC0000` = marca, reservado APENAS ao CTA de compra.

---

## 2. Direção criativa

**Conceito unificador:** *"O Diagnóstico já começou."* A página de vendas é a **segunda metade do Reveal**. O usuário entra no mundo do arquétipo dele e só sai dele no momento exato da compra — quando o vermelho da marca surge como sinal de fim de jornada.

**Metáfora visual de scroll:** *"O busto de mármore racha, se quebra, e renasce na cor do teu arquétipo."* Implementada via escultura sticky (Seção G abaixo).

**Princípios:**
- Cinematic, layered, editorial — cada bloco é uma "cena" com profundidade própria.
- Tipografia: Syne 800 display (clamp 48–96px), numeração romana gigante (I, II, III) atrás dos títulos, drop-caps em B2/B3.
- Arte real (4 pôsteres gerados), não ícones.
- MarbleBust + BrainOrbit retornam no hero da Sales, na paleta do arquétipo.
- Sem checkbox HTML cru. Sem emoji. Sem SVG infantil. Sem Lucide-X como bullet.

**Paleta dinâmica** (CSS vars aplicadas via `data-arch={archetype}` no root da Sales):
```css
[data-arch="AO"] { --arch-primary:#0F4C5C; --arch-secondary:#3B82F6; --arch-accent:#7DD3FC; }
[data-arch="SS"] { --arch-primary:#7C3AED; --arch-secondary:#C084FC; --arch-accent:#F5D0FE; }
[data-arch="EA"] { --arch-primary:#64748B; --arch-secondary:#94A3B8; --arch-accent:#CBD5E1; }
[data-arch="HI"] { --arch-primary:#F97316; --arch-secondary:#FBBF24; --arch-accent:#FED7AA; }
```

---

## 3. Estrutura da página (layout split desktop + sculpture sticky)

```text
DESKTOP (≥1024px)
┌──────────────────────────────┬───────────────────────┐
│ COPY (60%)                   │ SCULPTURE STICKY (40%)│
│                              │  position: sticky;    │
│ HERO (B1)                    │  top:0; h:100vh       │
│  eyebrow / H1 / promessa     │                       │
│  CTA arquétipo / proof strip │  [layers 0–6]         │
│                              │                       │
│ I — Espelho da Dor (B2)      │  busto evolui         │
│ II — Descoberta Cientif (B3) │  conforme scroll      │
│ III — Diagnóstico 4D (B4)    │                       │
│ Âncora de Valor (B5)         │                       │
│ IV — Quem Já Descobriu (B6)  │                       │
│ ★ OFERTA MONOLITO (B7+OB1+OB2)│                      │
│ V — Perguntas (B8)           │                       │
│ FINAL (B9)                   │  pulso vermelho       │
└──────────────────────────────┴───────────────────────┘
+ StickyOfferBar (preço + CTA) aparece após hero
+ ExitIntentModal arch-aware

TABLET (768–1023): sculpture 35% atrás do conteúdo, opacity 50%.
MOBILE  (<768)   : sculpture fixed atrás, opacity 25%, mix-blend screen.
                   tier low → desliga partículas, mantém cracks estáticos.
```

**OB1/OB2 deixam de ser seções soltas** e viram linhas dentro do OfferMonolith (B7), com total dinâmico e CTA único — alinhado ao "checkout fica na própria página".

---

## 4. Escultura "The Awakening" (Seção G — assinatura visual)

Single sticky component sincronizado com `scrollYProgress` da página inteira.

| Scroll % | Cena copy        | Escultura                                           |
|----------|------------------|-----------------------------------------------------|
| 0–10     | Hero (B1)        | Busto intacto, fumaça respirando, olhos fechados    |
| 10–25    | I — Dor (B2)     | Primeira fissura na testa (stroke-dashoffset)       |
| 25–40    | II — Ciência (B3)| Rachaduras ramificam, luz arch-primary vaza         |
| 40–58    | III — 4D (B4)    | 4 estilhaços flutuam para 4 cantos, pulsando        |
| 58–70    | Âncora (B5)      | Núcleo interno (sigilo arquetípico) revelado, gira  |
| 70–82    | IV — Prova (B6)  | Ondas radiais + ~120 partículas orbitando (canvas)  |
| 82–95    | Oferta (B7)      | Estilhaços voltam, busto reassembla na cor arch     |
| 95–100   | Final (B9)       | Pulso vermelho `#CC0000` sincronizado ao CTA        |

**Stack:** Framer Motion (`useScroll` + `useTransform` + `useSpring`) + SVG nativo + Canvas2D para partículas. **Zero deps novas.**

**Layers (sticky, sobrepostas):**
0. Background radial `arch-primary → preto` que rotaciona com scroll.
1. MarbleBust base (componente existente), opacity inversa a `shardOffset`.
2. 7 SVG cracks reais (stroke-dasharray controlado por `crackProgress`), glow via `<feGaussianBlur>`.
3. 4 shards (cabeça/peito/ombro/base) — translate por `shardOffset` para 4 quadrantes.
4. Inner core — sigilo geométrico procedural na cor arch-primary (único por arquétipo).
5. 120 partículas Canvas2D (tier low: 30; reduced-motion: 0).
6. Final pulse overlay vermelho com box-shadow animado.

**Sigilos procedurais por arquétipo** (`src/lib/sales/sigils.ts`, geradores SVG):
- AO: 12 linhas radiais + hexágono + círculo de fechamento (tranca de cofre).
- SS: 8 pontas + dodecágono (coroa).
- EA: anéis concêntricos opacidade decrescente + linha horizontal (neblina).
- HI: 6 pétalas Bezier ascendentes + octógono (chama).

**Performance/A11y:**
- `will-change: transform` só nos 4 shards.
- `useDeviceTier`: `low` → 4 cracks em vez de 7, partículas off.
- `prefers-reduced-motion` → busto intacto + paleta, zero animação.
- `aria-hidden` + `pointer-events:none` em todo o container.

---

## 5. Entregáveis técnicos

### A. Arte real (4 imagens geradas)
- `src/assets/poster-money.jpg`
- `src/assets/poster-career.jpg`
- `src/assets/poster-love.jpg`
- `src/assets/poster-personal.jpg`

1024×1280, estética unificada: mármore quebrado + neblina + objeto-símbolo (cofre / coroa / nó / espelho). **Sem texto na imagem.** `imagegen` quality `standard`, 4 em paralelo.

### B. Componentes novos (`src/components/sales/v3/`)
1. `HeroScene.tsx` — split hero, copy esquerda, MarbleBust+BrainOrbit direita.
2. `SceneFrame.tsx` — wrapper de cena (numeral romano, drop-cap, vinheta).
3. `PainScar.tsx` — bullet "cicatriz" (linha lateral 2px, sem ícone).
4. `AreaPoster.tsx` — pôster 4D (imagem + score sobreposto + título).
5. `OfferMonolith.tsx` — card B7 com bump1/bump2 inline, total dinâmico, CTA vermelho.
6. `BumpRow.tsx` — toggle premium custom (sem checkbox nativo).
7. `SceneBackground.tsx` — gradiente radial + ruído sutil.
8. `StickyOfferBar.tsx` — substitui sticky atual.
9. `ExitIntentModal.tsx` — arch-aware.
10. **`ScrollSculpture.tsx`** ⭐ — escultura sticky (Seção 4).

### C. Helpers
- `src/lib/sales/sigils.ts` — geradores SVG procedurais por arquétipo (~80 LOC).
- `src/lib/sales/template.ts` — mantém-se intocado (placeholders já existem).

### D. Rewrite
- `src/components/sales/SalesPageV2.tsx` — mesma export default, mesma assinatura de props. Novo corpo: layout split, `data-arch` no root, sem curtain, ScrollSculpture sticky.

### E. CSS (`src/styles.css`)
- Selectors `[data-arch="AO|SS|EA|HI"]` no `@layer base` com os tokens.
- Keyframes: `roman-float` (numeral flutuante), `marble-fade` (entrada do pôster), `bump-glow` (toggle ativo), `core-spin` (sigilo).
- Overrides `prefers-reduced-motion`: zera as 4 keyframes.

### F. i18n
**Zero mudança.** Todas as `salesV2.*` keys já existem em PT/EN/PL/RO/AR.

### G. Analytics
- Mantidos: `VSL_VIEW`, `VSL_BUMP_TOGGLED`, `VSL_CTA_CLICK`, `EXIT_INTENT_SHOWN/DISMISS/CTA`.
- Novo: `VSL_SCENE_VIEW` (IntersectionObserver por SceneFrame, fire-once por cena).

---

## 6. Diretrizes inegociáveis (cross-cutting)

1. **Cor arquetípica reina** em tudo. Vermelho `#CC0000` aparece SÓ no CTA do OfferMonolith (B7), no pulso final (B9) e no StickyOfferBar.
2. **Zero `lucide:X`, `lucide:Star`, `lucide:Check` como decoração**. Lucide só em ícones funcionais (chevron do FAQ, arrow do CTA).
3. **Zero `<input type="checkbox">`** visível ao usuário. Bumps usam `BumpRow` custom (botão com estado).
4. **Zero `bg-card/60` genérico**. Cards usam gradiente + border arch-primary/30 + sombra arch-primary/10.
5. **Mobile-first em cada componente novo**: layout 1-col, sculpture vira atmosfera.
6. **RTL (`ar`) testado**: usar `ms-*` / `me-*`, evitar `ml-*` / `mr-*`.
7. **Acessibilidade**: `aria-label` em CTAs, `aria-expanded` no FAQ, `aria-hidden` na escultura, foco visível em todos os interativos.
8. **`prefers-reduced-motion`**: nenhuma keyframe roda, mas a estética permanece premium (estática, não pobre).
9. **`useDeviceTier === "low"`**: simplifica escultura (4 cracks, 0 partículas), mas mantém sigilo e cores.
10. **Build verde obrigatório**: `tsgo --noEmit` + `npm run build` antes de cada checkpoint.

---

## 7. Fases e ordem de execução

### Fase 1 — Fundação visual (paralelo onde possível)
**1.1** Gerar 4 pôsteres com `imagegen` (4 chamadas em paralelo) → `src/assets/poster-*.jpg`.
**1.2** Adicionar selectors `[data-arch]` + keyframes em `src/styles.css`.
**1.3** Criar `src/lib/sales/sigils.ts` (geradores SVG procedurais).

✅ **Checkpoint 1:** `tsgo` verde. Imagens existem. CSS sem erro.

### Fase 2 — Componentes v3 (presentational)
**2.1** `SceneBackground.tsx` (base de todos).
**2.2** `SceneFrame.tsx` (wrapper editorial).
**2.3** `PainScar.tsx`, `AreaPoster.tsx`, `BumpRow.tsx` (primitivos).
**2.4** `HeroScene.tsx`, `OfferMonolith.tsx` (compostos).
**2.5** `StickyOfferBar.tsx`, `ExitIntentModal.tsx` (chrome).

✅ **Checkpoint 2:** `tsgo` verde. Cada componente importa sozinho.

### Fase 3 — Escultura "The Awakening" ⭐
**3.1** `ScrollSculpture.tsx`: layers 0–4 (background, busto, cracks, shards, core/sigilo).
**3.2** Layer 5 (particles Canvas2D) com `useDeviceTier`.
**3.3** Layer 6 (final pulse) + integração com `prefers-reduced-motion`.

✅ **Checkpoint 3:** `tsgo` verde. Sculpture renderiza isolada com prop `archetype="HI"` de teste.

### Fase 4 — Rewrite SalesPageV2
**4.1** Substituir corpo de `SalesPageV2.tsx`: aplicar `data-arch`, montar layout split desktop, empilhar mobile, consumir todos os v3.
**4.2** Embed da sculpture na coluna sticky (desktop) / fixed atrás (mobile).
**4.3** Refazer Sticky e ExitIntent com os componentes v3.
**4.4** Adicionar `VSL_SCENE_VIEW` analytics.

✅ **Checkpoint 4:** `tsgo` + `npm run build` verdes. Rota `/` → quiz → reveal → sales renderiza sem warnings.

### Fase 5 — Verify & polish
**5.1** Smoke Playwright: forçar `archetype="HI"`, screenshot em 4 alturas de scroll (hero, 50%, 80%, final). Validar progressão da escultura.
**5.2** Repetir para `AO`, `SS`, `EA` (paletas distintas).
**5.3** Testar RTL com `?lang=ar`.
**5.4** Testar `prefers-reduced-motion` (DevTools rendering).
**5.5** Lighthouse mobile: Perf ≥ 85, A11y ≥ 95.
**5.6** Cleanup: remover imports não usados, garantir lazy-load dos 4 pôsteres.

✅ **Checkpoint 5 / GATE:** todos os 11 critérios abaixo OK → entrega.

---

## 8. Critérios de aceitação (Gate)

1. Renderiza com `data-arch="HI"` → laranja `#F97316` em toda a UI, exceto CTA principal `#CC0000`.
2. Reveal → Sales tem **continuidade visual**: mesmo MarbleBust, mesma paleta arquetípica.
3. Zero `lucide:X`, zero `lucide:Star`, zero `<input type=checkbox>`, zero `bg-card/60` genérico.
4. 4 pôsteres reais carregam (lazy) no bloco 4D.
5. Bumps inline no OfferMonolith, total dinâmico, CTA único vermelho.
6. Mobile 375px: hero empilha, pôsteres 1-col, monolito full-width, sculpture vira atmosfera.
7. `tsgo --noEmit` ✅, `npm run build` ✅.
8. RTL (`?lang=ar`) sem layout quebrado.
9. **Escultura sticky executa as 8 fases em sincronia com o copy** ao rolar (desktop).
10. **`prefers-reduced-motion`**: escultura estática, paleta arquetípica preservada, página continua linda.
11. **Mobile tier `low`**: partículas off, cracks simplificados (4 paths), cores arquetípicas mantidas.
12. Lighthouse mobile: Perf ≥ 85, A11y ≥ 95.

---

## 9. Estimativa & escopo

- **1 PR único.**
- **+11 arquivos** (9 v3 + sculpture + sigils helper) + **4 assets** gerados.
- **~1400 LOC novas, ~500 LOC removidas.**
- **+0 dependências.**
- **+~8 KB gzipped** ao chunk da sales (canvas + paths + sigilos).

---

## 10. Fora de escopo

- Não tocar em: Reveal, quiz, landing, checkout backend, PDF, email, dashboard.
- Não trocar Stripe hosted por embedded (decisão Fase 5 mantida).
- Não mexer em copy/i18n (`salesV2.*` está pronto em 5 idiomas).
- Não adicionar deps novas (framer-motion, lucide-react, react-countup já bastam).
