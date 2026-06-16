---
name: Cores oficiais dos arquétipos
description: Mapeamento oficial de cor para cada arquétipo (AO/SS/EA/HI) usado no cérebro, halos, badges e qualquer UI por arquétipo
type: design
---
Cores OFICIAIS por arquétipo (substituem qualquer mapeamento anterior — sempre confirmar aqui antes de inventar):

- **AO** (Ansioso/Avoidant) → **azul petróleo** (petrol blue)
- **SS** (Status Seeker) → **roxo vibrante** (vibrant purple)
- **EA** (Emocional/Avoidant) → **laranja queimado** (burnt orange)
- **HI** (Hiperativo/Impulsivo) → **verde esmeralda** (emerald green)

Filtros CSS atuais que produzem essas cores a partir de cinza (`ArchetypeSplineBrain.tsx`):
- AO: `sepia(1) saturate(6) hue-rotate(154deg) brightness(1.05)`
- SS: `sepia(1) saturate(6) hue-rotate(244deg) brightness(1.05)`
- EA: `sepia(1) saturate(8) hue-rotate(-14deg) brightness(1.05)`
- HI: `sepia(1) saturate(6) hue-rotate(87deg) brightness(1.05)`

Aplicar a mesma paleta em: cérebro (vídeo WebM + mix-blend-mode), halos, glows, badges de arquétipo, gráficos no dashboard, accent borders por arquétipo.

Vermelho `#CC0000` é cor da MARCA (CTAs, hover, brand), NÃO de arquétipo.