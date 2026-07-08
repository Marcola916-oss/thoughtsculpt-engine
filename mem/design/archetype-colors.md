---
name: Cores oficiais dos arquétipos
description: Paleta completa (primária/secundária/destaque) e sensações por arquétipo, definida pelo usuário na msg #467. Vale para Reveal, cérebro, CTAs e toda UI por arquétipo
type: design
---
Paleta OFICIAL por arquétipo, definida pelo usuário (msg #467 — 2026-06-15). Substitui qualquer mapeamento anterior. Sempre conferir aqui antes de pintar UI por arquétipo. Propagar via tokens CSS `--archetype-primary`, `--archetype-secondary`, `--archetype-accent` setados dinamicamente quando o arquétipo é revelado, e seguir através do produto inteiro (CTAs específicos do arquétipo, reveal, etc).

### AO — Accumulator Obsessive → Azul Petróleo
- Principal: `#0F4C5C` (Azul Petróleo)
- Secundária: `#3B82F6` (Azul Claro)
- Destaque: `#7DD3FC`
- Sensação: banco privado, cofre, confiança, controle emocional

### SS — Status Seeker → Roxo Vibrante
- Principal: `#7C3AED` (Roxo Imperial)
- Secundária: `#C084FC` (Lilás Luxo)
- Destaque: `#F5D0FE`
- Sensação: luxo, exclusividade, poder, marca premium

### EA — Emotional Avoider → Cinza Ardósia
- Principal: `#64748B` (Cinza Ardósia)
- Secundária: `#94A3B8`
- Destaque: `#CBD5E1`
- Sensação: neblina, silêncio, observação, reconexão

### HI — Hedonist Impulsive → Âmbar/Laranja
- Principal: `#F97316` (Laranja Vibrante)
- Secundária: `#FBBF24` (Âmbar)
- Destaque: `#FED7AA`
- Sensação: movimento, diversão, impulso, vitalidade

Aplicação:
- Cérebro do Reveal (vídeo WebM + camada de fundo na cor principal + glow secundária)
- Halos, badges, ícones por arquétipo
- Gráficos, accent borders, hover states quando o usuário tem arquétipo definido
- Qualquer elemento que varie por `data-arch`

Observação: vermelho `#CC0000` é cor da MARCA (CTAs globais, hover global). NÃO é cor de arquétipo. Quando o usuário tem arquétipo definido, prevalece a paleta do arquétipo nos elementos de identidade pessoal; o accent vermelho continua nos CTAs neutros (Sair, Comprar etc.).