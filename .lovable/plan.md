# Intensificar a iluminação do cérebro na cena do Reveal

Aumentar a intensidade visual das camadas de luz ao redor do cérebro 3D na página de revelação do arquétipo, incluindo o feixe holográfico que sobe do pedestal. Os ajustes são puramente visuais (opacity, % de cor, blur, box-shadow) — nada de estrutura, JSX ou lógica é alterado.

## Arquivo afetado

- `src/routes/index.tsx` (linhas ~880–975, dentro do `stage="reveal"`)

## Mudanças por camada

### 1. Aura interna do cérebro (linhas 943–958)
- `color-mix` de `--arch-primary`: **36% → 55%** (centro) e **14% → 26%** (borda)
- `opacity`: **0.58 → 0.82**

### 2. Aura externa / halo amplo (linhas 959–974)
- `color-mix` de `--arch-primary`: **18% → 34%**
- `opacity`: **0.48 → 0.72**
- `blur`: **58px → 72px** (halo um pouco mais espalhado)

### 3. Feixe holográfico que sobe da base (linhas 894–907)
- `color-mix` de `--arch-primary` no gradiente: **42% → 62%** (base) e **16% → 30%** (meio)
- `opacity`: **0.76 → 0.95**
- Adicionar leve `filter: blur(2px) brightness(1.15)` para reforçar a luz sem perder o formato

### 4. Scanlines dentro do feixe (linhas 908–921)
- `opacity` do container: **0.40 → 0.6**
- `color-mix` das linhas: **28% → 45%** (deixa as scanlines mais visíveis dentro do feixe mais forte)

### 5. Disco de emissão na base do feixe (linhas 922–934)
- `color-mix` de `--arch-primary`: **48% → 68%**
- Adicionar `opacity: 0.95` explícito (hoje herda 1.0, mas com as outras camadas mais fortes fica equilibrado)

### 6. Conectores laterais (linhas ~880–890)
- `color-mix` no gradiente: **58% → 72%** (topo) e **24% → 38%** (meio)
- `boxShadow`: 10px → **16px** e 38% → **55%**
- `opacity`: **0.52 → 0.72**

## Garantias de segurança

- Todas as camadas já usam `mix-blend-mode: screen` — aumentar opacidade intensifica o brilho sem "lavar" o cérebro.
- Variáveis `--arch-primary` / `--arch-glow` são temadas por arquétipo (AO/SS/EA/HI), então cada cor segue sendo a do arquétipo certo.
- Nenhuma mudança em z-index, layout, animações, `prefers-reduced-motion` ou no canvas do cérebro.
- Build e tipagem não são afetados (apenas valores em `style={{}}`).

## Validação após aplicar

- `npm run build` para confirmar zero erros novos.
- Conferência visual nos 4 arquétipos (AO, SS, EA, HI) para garantir que a cor temática continua correta e o cérebro continua legível sobre o halo mais forte.
