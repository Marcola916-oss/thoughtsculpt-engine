## Objetivo

Dois ajustes na página Reveal, **sem mexer em mais nada**:

1. **Descer o símbolo de marca d'água** para ficar entre o texto e o botão (não mais "garrado" na base do cérebro).
2. **Redesenhar os 4 símbolos** (AO, SS, EA, HI) com formas mais legíveis e fiéis ao conceito de cada arquétipo.

---

## Arquivos envolvidos (só 2)

- `src/components/identity/ArchetypeRevealStage.tsx` → muda **só** a classe de posição do símbolo de fundo.
- `src/components/identity/symbols/index.tsx` → reescreve **só** os 4 paths SVG (mesmas assinaturas, mesmos exports, mesmo viewBox `0 0 200 200`, mesmo `stroke="currentColor"`).

Nada mais é tocado. Cor, opacidade (0.07), tamanho (`min(90vw, 800px)`), atmosfera, hero animado, layout do reveal — tudo continua igual.

---

## 1) Reposicionamento do símbolo

No `ArchetypeRevealStage.tsx`, linha 44, a única alteração é:

```text
top-[62%]  →  top-[92%]
```

Como o símbolo usa `-translate-y-1/2`, o centro do SVG cai a 92% da altura da seção — bem abaixo da base do cérebro, ocupando o espaço entre o texto descritivo e o botão "Continuar", exatamente como na imagem de referência.

O `ArchetypeRevealHero` (símbolo central animado dentro do orbe) **não muda** — continua centralizado na arte principal.

## 2) Redesign dos símbolos (mesmo estilo line-art, traço fino, monocromático)

Cada símbolo mantém: `viewBox="0 0 200 200"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth` base 0.8 (mesmo peso visual atual, para não estourar contraste em opacity 0.07).

- **AO — Escudo heráldico (Avarento Oculto)**
  Escudo com ombros retos no topo, lados verticais e ponta inferior definida (formato heráldico clássico, não arredondado). Dentro: um cadeado pequeno centralizado — reforça "guardar / trancar". Removo os 3 anéis concêntricos (poluíam).

- **SS — Coroa solar (Soberano do Status)**
  Mantém a estrutura atual (que o usuário aprovou): 12 raios solares ao redor + coroa de 3 pontas + base + gema central. Apenas refino: pontas da coroa mais simétricas e raios com comprimento uniforme.

- **EA — Lótus geométrica (Evasor Ansioso)**
  Baseada na referência que você enviou: 6 pétalas geométricas sobrepostas formando uma flor de lótus / mandala simétrica, com um círculo central pequeno. Representa reconexão / observação / centro — bate com o conceito de neblina/dissolução de forma muito mais reconhecível que os pontilhados atuais.

- **HI — Chama real (Hedonista Impulsivo)**
  Silhueta de chama de verdade: ponta superior afiada e assimétrica, ondulações nas laterais (não mais a gota geométrica). Chama interna menor para dar profundidade + 5 faíscas subindo ao redor.

---

## Como evito quebrar coisas

- Assinaturas exportadas (`AoShield`, `SsCrown`, `EaMist`, `HiFlame`, `ArchetypeSymbol`) ficam idênticas — qualquer outro consumidor (ex.: `ArchetypeRevealHero`) continua funcionando sem ajuste.
- `viewBox`, `stroke`, `fill` e props (`...rest`) inalterados — herdam className/color de quem chama.
- Nenhum token CSS, nenhum import novo, nenhuma rota tocada.
- Verifico build após a alteração para confirmar 0 erros.

---

## Fora do escopo (não vou mexer)

- Hero animado (`ArchetypeRevealHero`) — fica como está.
- Cores, fog, atmosfera, partículas — ficam como estão.
- Layout do reveal, copy, botões — ficam como estão.
- i18n, dashboard, quiz — não tocados.
