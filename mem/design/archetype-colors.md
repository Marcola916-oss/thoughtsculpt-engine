---
name: Cores oficiais dos arquétipos
description: Paleta hex oficial por arquétipo (AO/SS/EA/HI) definida no documento melhoria_visual-3.docx — usada em cérebro, halos, badges, gráficos e toda UI por arquétipo
type: design
---
Cores OFICIAIS por arquétipo (do documento `melhoria_visual-3.docx`, Mudança 1). Sempre consultar esta memória antes de inventar cor de arquétipo:

| Arquétipo | Nome | Hex | Cor |
|---|---|---|---|
| **AO** | Accumulator Obsessive | `#CC0000` | vermelho |
| **SS** | Status Seeker | `#FFD700` | dourado |
| **EA** | Escapist Alienated | `#4A90D9` | azul |
| **HI** | Hedonista Impulsivo | `#FF6B00` | laranja |

Aplicar essa paleta em: cérebro do Reveal (vídeo WebM + mix-blend-mode/glow de fundo), halos, badges de arquétipo, gráficos no dashboard, accent borders por arquétipo, qualquer elemento que varie por `data-arch`.

Observação: como o `#CC0000` (AO) coincide com o vermelho da marca, AO herda o accent global naturalmente. Os outros três precisam de override explícito por `data-arch`.