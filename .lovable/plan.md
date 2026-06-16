# Reestruturação da Página Reveal — 4 Arquétipos, mesma coleção

## Diagnóstico (por que "não mudou nada")

Investiguei o estado atual. Existem **3 problemas estruturais sobrepostos** — por isso só trocar a arte do cérebro não muda a sensação da página:

### 1. As cores oficiais NÃO estão no CSS

`src/styles.css:273-299` ainda tem o mapeamento **antigo e errado**:

| Arquétipo | Cor atual (errada) | Cor oficial (que combinamos) |
|---|---|---|
| AO | `#2A8BA3` (azul claro) | `#0F4C5C` azul petróleo profundo |
| SS | `#9B4DC9` (lilás) | `#7C3AED` roxo imperial |
| EA | `#E8682B` **LARANJA** ❌ | `#64748B` cinza ardósia |
| HI | `#4CAF50` **VERDE** ❌ | `#F97316` laranja vibrante |

EA está laranja, HI está verde — totalmente trocados em relação à paleta oficial. Toda a página reveal (halos, badges, bordas, gradientes, ícone do arquétipo, scrollbar) lê `--arch-primary` desse bloco, então mesmo com a arte nova o resto da página continua mostrando as cores erradas.

### 2. A arte central é genérica para todos

`ArchetypeRevealPoster` foi criado e plugado, mas o **resto da seção reveal continua único** para os 4 arquétipos:
- Mesmo halo radial
- Mesmo ícone 🔒 estático no card de bloqueio
- Mesmo `bg-arch-glow` genérico
- Mesma atmosfera (fog vermelho global do projeto vaza por cima)
- Mesmo enquadramento sem "personalidade" por arquétipo

### 3. Não existe um "tema completo" por arquétipo

Não há tokens secundários (`--arch-glow-soft`, `--arch-edge`, `--arch-ink`, símbolo, mood), então não dá pra fazer a página inteira "respirar" a cor do arquétipo de forma coerente.

---

## Objetivo da reestruturação

Quando o usuário vir o reveal:
- **AO** → página inteira azul petróleo, atmosfera fria/contida, símbolo de cofre, sensação de fortaleza
- **SS** → página inteira roxo imperial com acentos dourados, atmosfera glamour, símbolo de coroa, sensação de palco
- **EA** → página inteira cinza ardósia, atmosfera enevoada e silenciosa, símbolo de dissolução, sensação de distância
- **HI** → página inteira laranja âmbar, atmosfera quente e em movimento, símbolo de chama, sensação de impulso

Mesma estrutura visual (busto centralizado, fundo escuro, layout), o que muda é **cor + símbolo + atmosfera**. Coleção, não 4 designs soltos.

---

## Plano de execução (5 etapas)

### Etapa 1 — Corrigir paleta oficial em `src/styles.css`

Reescrever o bloco `[data-arch="..."]` com a paleta combinada e adicionar tokens secundários para permitir personalização rica:

```text
[data-arch="AO"]  petrol blue   --arch-primary #0F4C5C  --arch-edge #1E6B82  --arch-ink #B8DCE6  --arch-glow rgba(15,76,92,.55)
[data-arch="SS"]  imperial      --arch-primary #7C3AED  --arch-edge #A78BFA  --arch-ink #E9D5FF  --arch-glow rgba(124,58,237,.55)  --arch-gold #C9A84C
[data-arch="EA"]  slate         --arch-primary #64748B  --arch-edge #94A3B8  --arch-ink #CBD5E1  --arch-glow rgba(100,116,139,.45)
[data-arch="HI"]  amber         --arch-primary #F97316  --arch-edge #FB923C  --arch-ink #FED7AA  --arch-glow rgba(249,115,22,.55)
```

Adicionar variáveis de "mood" usadas pelos componentes:
- `--arch-fog`   → cor da névoa atmosférica de fundo
- `--arch-vignette` → gradiente que cobre o fog vermelho global na reveal

### Etapa 2 — Criar `ArchetypeRevealStage` (componente novo)

Um wrapper de página completo para a reveal, em vez do código atual inline em `index.tsx`. Responsabilidades:

```text
<ArchetypeRevealStage archetype="AO|SS|EA|HI">
  ├─ Curtain: fundo preto + cortina radial --arch-fog que NEUTRALIZA o
  │          fog vermelho global do projeto (z-index acima do Atmosphere)
  ├─ Particles: SVG/Canvas leve de partículas na cor do arquétipo
  │             (AO: pó frio caindo / SS: brilhos dourados / EA: névoa
  │              difusa / HI: faíscas subindo)
  ├─ Vignette: gradiente cônico --arch-glow nas 4 bordas
  ├─ ArchetypeRevealPoster (já existe) — arte central
  ├─ Symbol Ring: anel decorativo com símbolo específico do arquétipo
  │               atrás do poster (escudo / coroa / fragmentos / chama)
  └─ Children (kicker, headline, tagline, cards) — herdam --arch-*
```

Cada arquétipo recebe sua própria camada de partículas e símbolo de fundo — não só a foto central muda.

### Etapa 3 — Símbolos vetoriais por arquétipo

4 mini-componentes SVG (12-20 linhas cada) renderizados como halo atrás do poster, em `--arch-edge` com opacidade ~25%:

- `AoShield` — escudo + anéis concêntricos
- `SsCrown` — coroa estilizada + raios
- `EaMist` — círculo fragmentado/dissolvendo
- `HiFlame` — chama abstrata + faíscas

Substituem o emoji 🔒 fixo do card de bloqueio também (cada arquétipo tem seu próprio símbolo lá).

### Etapa 4 — Personalizar copy/headline visualmente

Pequenos toques que reforçam personalidade sem mudar o texto traduzido:

- **AO**: headline com peso mais "carved", letter-spacing apertado, underline sólido
- **SS**: headline com gradient roxo→dourado, glow mais intenso
- **EA**: headline com fade-out nas bordas (text-shadow blur), pontuação suave
- **HI**: headline com underline animado pulsante na cor âmbar

Implementado via classe condicional no `<h1>` baseada em `arch`.

### Etapa 5 — Verificar e ajustar

- `npm run build` (zero erros novos)
- Atualizar `mem/design/archetype-colors.md` para refletir a paleta final aplicada
- Smoke visual: percorrer os 4 estados (`?arch=AO|SS|EA|HI` via dev tool ou trocar manualmente o `archCode`) e capturar screenshot de cada
- Confirmar contraste AA do texto branco sobre cada `--arch-primary`

---

## Arquivos tocados

| Arquivo | Mudança |
|---|---|
| `src/styles.css` (linhas 272-300) | Reescrever tokens dos 4 arquétipos + adicionar `--arch-edge`, `--arch-ink`, `--arch-fog`, `--arch-vignette`, `--arch-gold` (SS) |
| `src/components/identity/ArchetypeRevealStage.tsx` (NOVO) | Wrapper de cena completa: curtain, partículas, vignette, símbolo |
| `src/components/identity/symbols/AoShield.tsx`, `SsCrown.tsx`, `EaMist.tsx`, `HiFlame.tsx` (NOVOS) | 4 SVGs simbólicos |
| `src/routes/index.tsx` (seção reveal, ~linhas 817-905) | Envolver com `<ArchetypeRevealStage>`, remover halos genéricos hardcoded, substituir 🔒 pelo símbolo, aplicar classe de headline por arquétipo |
| `mem/design/archetype-colors.md` | Atualizar com paleta final + tokens secundários |

Nenhuma alteração em rotas, dados, server functions ou i18n. Trabalho 100% visual/CSS.

---

## O que NÃO está no plano (fora de escopo)

- Não vou tocar nos textos (`translations.ts`) — copy permanece
- Não vou regenerar as 4 imagens dos posters — as atuais (AO, SS, EA, HI) já estão no CDN e batem com a paleta nova
- Não vou mexer no dashboard / quiz / landing pré-quiz — só a página reveal
- Não vou trocar o componente `ArchetypeVideoBrain` (já foi removido na resposta anterior)

Aprova esse plano? Se sim, executo tudo numa única passada e te entrego com build verificado.