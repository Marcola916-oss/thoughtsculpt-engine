## Página Reveal — Reestruturação completa

Vou refazer a página de revelação do arquétipo do zero: layout limpo, arte animada central (sprite sheet de 120 frames), e paleta dinâmica por arquétipo (AO/SS/EA/HI) que segue o usuário até o produto pago.

---

### 1. Os frames (já entregues)

- 120 WebP em `melhorias_contexto/Webp/0617_000.webp` → `0617_119.webp`
- 1280×720, RGB, fundo preto puro, ~34KB cada (~4MB total)
- Loop alvo: 4s @ 30fps

### 2. Estratégia da sprite sheet

Como o frame original é 1280×720, montar uma sprite única com 120 frames nessa resolução daria ~15000px — estoura limite de textura do iOS Safari. Solução: **2 sprites servidas via `<picture>` por media query**.

| Versão | Frame | Grid | Sprite final | Peso estimado |
|---|---|---|---|---|
| Desktop | 640×360 | 12 col × 10 lin | 7680×3600 | ~600KB WebP |
| Mobile | 320×180 | 12 col × 10 lin | 3840×1800 | ~180KB WebP |

Gerado uma vez via `pillow` no sandbox, subido como asset CDN (`.asset.json`). Não fica no repo.

### 3. Como a animação roda

Componente novo: `src/components/identity/ArchetypeBrainSprite.tsx`

- `<div>` com `background-image: url(sprite)`, tamanho fixo do frame
- `animation: brain-loop 4s steps(120) infinite` movendo `background-position` por toda a sprite
- `mix-blend-mode: screen` → fundo preto vira transparente, glow do cérebro herda a cor da paleta do arquétipo por trás
- `<picture>` swap entre sprite mobile/desktop via `prefers-reduced-motion` → mostra frame estático (frame 60, o "ápice")
- Preload do asset no `<head>` da rota pra não piscar

### 4. Paleta por arquétipo (token CSS dinâmico)

Adiciono em `src/styles.css` um set de variáveis `--arch-*` (primary/secondary/accent/glow/atmosphere) que muda via `data-archetype="ao|ss|ea|hi"` no `<main>` da Reveal. Toda a página (botões, bordas, glow do cérebro, fog) lê esses tokens — então trocar de arquétipo é trocar 1 atributo.

| Arquétipo | Primary | Secondary | Accent / Glow |
|---|---|---|---|
| AO (Ansioso/Ostentador) | azul petróleo | dourado pálido | âmbar |
| SS (Sabotador/Status) | roxo imperial | grafite | magenta |
| EA (Evitador/Avarento) | cinza ardósia | bege | verde-musgo |
| HI (Hiperativo/Impulsivo) | laranja | preto | amarelo elétrico |

Esses mesmos tokens já são lidos pelo dashboard depois da compra — a cor segue o usuário pro produto.

### 5. Layout novo da Reveal (limpo)

Substituo `ArchetypeRevealStage` por `ArchetypeRevealV2`. Estrutura única, sem sobreposição:

```text
┌─────────────────────────────────────────┐
│  [atmosfera sutil — fog na cor do arch] │
│                                         │
│        cérebro animado (sprite)         │
│                                         │
│        "Seu arquétipo é"  (eyebrow)     │
│         NOME DO ARQUÉTIPO   (H1)        │
│         subtítulo de 1 linha            │
│                                         │
│         [CTA primário grande]           │
│         [link secundário]               │
└─────────────────────────────────────────┘
```

- 1 hero, 1 título, 1 CTA. Nada mais "above the fold".
- Detalhes do arquétipo (descrição longa, traços, próximos passos) aparecem **depois do scroll**, em seção separada — não competem com a revelação.
- Mata: `ArchetypeRevealHero`, `ArchetypeRevealArt`, `ArchetypeRevealPoster`, `ArchetypeRetroBrain`, `ArchetypeSplineBrain`, `ArchetypeVideoBrain`, `CircuitBrain`, `CelebrationBrain` (todos os experimentos anteriores que estão poluindo).

### 6. Performance & compatibilidade

- Sprite WebP com alpha não necessário (blend mode resolve)
- 1 único request HTTP, cache eterno via CDN Lovable
- `will-change: background-position` + `transform: translateZ(0)` pra forçar GPU
- `prefers-reduced-motion: reduce` → frame estático, sem animação
- `(hover: none) and (max-width: 768px)` em devices muito antigos → frame estático
- iOS Safari testado: limite de textura respeitado em ambas as sprites
- LCP: o título é o LCP, não a sprite (sprite faz lazy decode)

### 7. Ordem de execução (quando você autorizar)

1. Gerar as 2 sprites com pillow no sandbox
2. Subir as 2 como asset CDN
3. Criar `ArchetypeBrainSprite.tsx`
4. Adicionar tokens `--arch-*` em `styles.css` (com 4 data-attributes)
5. Criar `ArchetypeRevealV2.tsx` (layout novo)
6. Trocar no `src/routes/index.tsx` o stage `reveal` pra usar V2
7. Deletar os componentes antigos da Reveal
8. Build + smoke visual nos 4 arquétipos (mobile + desktop)

### 8. O que NÃO vou fazer agora

- Não toco em quiz, landing, dashboard, Supabase, Stripe — escopo só Reveal
- Não vou mudar copy/textos dos arquétipos (uso os atuais)
- Não vou adicionar nenhuma feature nova (compra, share, etc.)

---

**Posso começar pela etapa 1 (gerar as sprites) e te mostrar uma prévia antes de seguir pro restante?**