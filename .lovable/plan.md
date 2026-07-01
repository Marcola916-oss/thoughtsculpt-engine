## Auditoria executada

Naveguei pelo funil com Playwright (PT + EN), capturei 108 screenshots/textos, e li integralmente:
- `src/lib/i18n/translations.ts` (2.655 linhas, 5 idiomas)
- `src/routes/obrigado.tsx` (tem dicionário próprio — duplica o bloco `obrigado` do i18n)
- `src/routes/index.tsx` (1.910 linhas)
- `src/components/sales/SalesPageV2.tsx`, `CheckoutStub.tsx`

A análise revelou que a copy **não é o gargalo principal de conversão** (a estrutura está sólida pós-PR1–PR4), mas existem **erros graves de consistência, voz e factualidade** que vão minar a percepção de profissionalismo e, em pelo menos 3 casos, **quebrar a coerência do produto pós-pivot one-shot**. Sem corrigir, lançar em 30% é improvável — não por copy ruim, mas por copy *desalinhada consigo mesma*.

## Diagnóstico — 31 problemas reais encontrados

### 🔴 Bloqueadores (quebram coerência do produto)

1. **Nomes dos arquétipos divergem entre 3 lugares na MESMA língua (PT)**:
   - Landing `archetypes.items`: AO=`Acumulador Obsessivo`, EA=`Alienado Financeiro`
   - `archetypes` (reveal): AO=`ACUMULADOR\nOBSESSIVO`, EA=`EVASIVO ALIENADO`
   - Testimonials da landing: EA aparece como **`Fantasma Evasivo`**, AO como **`Guardadora Obsessiva`** (nomes inventados que não existem em nenhum outro lugar)
   - Typewriter no hero alterna 4 nomes; precisa ser a fonte única
2. **`obrigado` no i18n menciona login, senha `MindReset2026!`, dashboard e onboarding** — todo o produto foi pivotado para one-shot/PDF (sem auth, sem dashboard, sem onboarding, conforme `mem://index.md`). O bloco é dead code mas confunde futuras edições e, se acidentalmente renderizado, mata a credibilidade. Mesmo problema replicado em EN/PL/RO/AR.
3. **`b5.subtitle` promete "Protocolo de 90 dias"** mas `deliverables[1].description` diz **"30 micro-acções, semana a semana"**; `ob2.title` chama de **"Protocolo de Reset 30 dias"**. Três números contraditórios para a mesma peça.
4. **PR1 introduziu `secondary_archetype` em `quiz_leads`** e a copy de `b9.tagline` já usa `[SECONDARY]` — mas a maioria da copy ainda fala só de `[PRIMARY]`. Inconsistência: ou o secundário entra de verdade ou desaparece.

### 🟠 Quebras de voz / mistura PT-PT × PT-BR

5. Hero PT usa `tu/teu/tuas`. Em paralelo:
   - `sales.painBlock` (PT) usa **`você`** ("Você já tentou de tudo, certo?")
   - `reveal.areas.byArch` usa BR: **"boletos viram boletos"** (PT-PT é `fatura`)
   - `reveal.areasIntro`: **"Veja onde ele aparece"** (`Veja` é BR; PT-PT é `Vê`)
   - `obrigado.welcomeSub`: **"você connosco"** (mistura `você` BR + `connosco` PT-PT — frankenpt)
   - `dashboard.hub.greeting` retorna `Bom dia/tarde/noite` mas dashboard nem existe mais
6. **Hero kicker PT** é minúsculo (`Finanças comportamentais • 8 perguntas`) mas EN é uppercase (`BEHAVIORAL FINANCE • …`). Sem padrão.
7. **`loader.analysis[0]`** = **"Analizando"** (erro ortográfico — correto é `Analisando`); mesmo problema em PL/RO precisa verificar.
8. **`emailCapture.title`** força `.toUpperCase()` no nome do usuário — quebra acentuação em alguns navegadores e contradiz a decisão anterior de remover all-caps das perguntas do quiz.
9. **`b1.eyebrow` = "DIAGNÓSTICO REVELADO"** aparece **após** a tela de reveal, mas a tela 12 vende algo que ainda **não foi revelado** (ainda virá no PDF). Promessa quebrada.
10. **`b1.timer` = "Esta análise expira em alguns minutos"** — urgência vaga e implausível, contradiz a frase "sem pressão" do checkout. Ou faz countdown real ou tira.
11. **Hero PT headline tem `\n` literais** (`O TEU CÉREBRO TEM UM PADRÃO\nQUE ESTÁ A SABOTAR\nAS TUAS FINANÇAS.`); EN idem. Mas `landing.howItWorks.steps[0].title` no PT escreve `RESPONDE \n8  PERGUNTAS` (espaço duplo + `\n` no meio) — quebras hardcoded mal alinhadas.

### 🟡 Factualidade / claims sem prova

12. **`b3.proofSeal`**: "**14 estudos revisados por pares · 12.000 diagnósticos validados em 5 países**" — número de estudos é arbitrário; "validados" implica peer review do produto, o que não é verdade.
13. **`b6.counter`** e **`landing.proofBar.diagnostics`** dizem `+12.000`, mas `socialProof.counterText` (PT) e EN dizem **`+12.000`** vs **`+12,000`** (separador decimal trocado por idioma — OK), porém em outros locais aparece `+14.832` (no plano antigo). Padronizar para **um número único** e justificável.
14. **`b7.was = $200` / `b7.then = $47`** — ancoragem fixa em USD enquanto checkout cobra BRL/PLN/RON/SAR/EUR. Em BR ($200 vira R$ 1.000 mental), em SA ($200 vira SAR 750) — referência ilegível e descalibrada.
15. **`reveal.anchor`**: "73% dos {arch} relatam o mesmo padrão" — número inventado, sem fonte.
16. **`hero.trust`**: "+12.000 diagnósticos • Sem cartão para começar" repete o número também em `landing.proofBar`. Repetição na mesma tela.

### 🟢 Polimento (i18n × 5)

17. **AR**: `b1.h1` e `b9.title` precisam validação RTL com pontuação (`،` vs `,`).
18. **PL**: `loader.analysis` provavelmente também tem typo se foi traduzido literal do PT errado.
19. **RO**: confirmar que `[PRIMARY]` interpolado decai para feminino quando arquétipo for "Acumulator Obsesiv" / "Status Seeker" (concordância).
20. **EN testimonials** (landing) — "Adam K." é polonês mas aparece em EN sem bandeira; em PT mesma cosa. Falta `country` no schema landing (existe em `salesV2.b6`, mas não no `landing.testimonials.items`).
21. **`landing.faq.items[3].a`**: "Um PDF de 30+ páginas no teu email" — fixar número de páginas é frágil (compromisso operacional). Trocar por "PDF extenso" ou validar 30+.
22. **`hero.trustGuarantee = "30 dias garantia"`** — faltam pontuação e maiúscula (`30 dias de garantia`).
23. **`landing.finalCta.titleAfter = " QUAL É."`** — espaço inicial visível em alguns renders.
24. **`b8.items[0].a`** PT: **"O MindReset revela PORQUE como [PRIMARY] não consegues"** — gramática quebrada (`PORQUE como`).
25. **`reveal.finalSub`**: "os 30 dias guiados" — incoerente com `b5` que vende 90 dias.
26. **`sales.*` (bloco antigo)** convive com `salesV2.*` no i18n; renderiza em algum lugar? Auditar `grep` para garantir que é dead code, senão usuário vê PT-BR ("Você já tentou…") em paralelo com PT-PT do `salesV2`.
27. **`checkout.welcomeNotification`**: "Sua assinatura está ativa. Clique aqui para começar seu diagnóstico." — fala de **assinatura** num produto sem subscrição.
28. **`landing.testimonials.items[1].arch = "Guardadora Obsessiva"`** já listado em #1; aparecimento isolado de gênero feminino no nome do arquétipo é inconsistente (todos os outros são genéricos).
29. **`identity.title` PT** = "Antes de começar, quem és tu?" — perfeito PT-PT, mas o subtítulo `sub` continua usando `teu` (OK). Validar que `[NOME]` é capturado e propagado em **todas** as 8 perguntas (PR1 prometeu, validar implementação).
30. **`landing.archetypes.title` PT** = "QUAL É O TEU PADRÃO INVISÍVEL?" mas o sub diz "Descobre o teu em menos de 3 minutos" — repete "teu" 2× em 2 frases consecutivas. Cosmético.
31. **`q[5].options[1] = "Estatuto"`** (PT-PT correto) vs typewriter usando "STATUS SEEKER" em inglês — falta tradução literal "Procura de Estatuto".

---

## Plano de execução — 4 PRs, ordem fixa

Cada PR é independente, com gate manual entre eles. Tempo estimado total: ~3 sessões.

### PR A — Consistência ontológica (BLOQUEADOR · 1 sessão)
Resolve: itens **1, 2, 3, 4, 26, 27**.

1. **Define nomes canônicos** dos 4 arquétipos por idioma (uma struct única, importada por TODOS os lugares):
   - PT: `Acumulador Obsessivo` / `Status Seeker` (sem tradução, é marca) / `Evasivo Alienado` / `Hedonista Impulsivo`
   - EN/PL/RO/AR: equivalentes oficiais já em `archetypes.{AO,SS,EA,HI}.name`
2. Remove `dashboard.*`, `onboarding.*`, `obrigado.*` (i18n bloco), `checkout.welcomeNotification`, `resetPassword`, `sharePage` se confirmado dead code. Pelo menos marcar `@deprecated` e remover do `Dict` se nada renderiza.
3. Padroniza protocolo: **uma única duração** (sugiro **30 dias** porque é o já-prometido pela garantia + onboarding lore). Corrige `b5.subtitle`, `b5.deliverables[1]`, `reveal.finalSub`, `ob2`.
4. Decide secundário: **manter** e propagar `[SECONDARY]` para `b1.promise`, `b4.title`, `b8.items[0].a`, `reveal.kicker`. OU **remover** `[SECONDARY]` de `b9.tagline`. Recomendo manter — já está calculado e diferencia.
5. Remove bloco `sales.*` antigo (PT-BR) se não renderiza; senão, sincroniza com `salesV2.*`.
6. **Auditoria automatizada**: adicionar 1 teste node simples que faz `grep` por "Guardadora Obsessiva", "Fantasma Evasivo", "MindReset2026", "assinatura ativa" e falha o build se encontrar.

### PR B — Voz unificada PT-PT (1 sessão)
Resolve: itens **5, 6, 7, 8, 9, 10, 11, 24, 28, 29, 30**.

1. Sweep PT inteiro: substituir todo `você/sua/seu` por `tu/tua/teu` (exceto onde a marca exige, e.g. dashboards mortos serão removidos no PR A).
2. Corrigir BR-ismos: `boletos`→`faturas`, `Veja`→`Vê`, `Estamos felizes em ter você connosco`→`Que bom ter-te connosco`.
3. Corrigir `Analizando`→`Analisando` no loader (e equivalentes em PL/RO).
4. Eyebrow `b1.eyebrow`: trocar `DIAGNÓSTICO REVELADO` por `O TEU PROTOCOLO` (alinha com onde estamos no funil).
5. Decidir sobre timer: ou implementa countdown real OU substitui `b1.timer` por algo factual ("Análise pessoal preparada agora.").
6. Hero kicker — uniformizar case nos 5 idiomas (sugiro **uppercase + tracking**).
7. `emailCapture.title`: remover `.toUpperCase()` no name, usar CSS uppercase para preservar acentuação correta.
8. Reescrever `b8.items[0].a` (gramática quebrada).
9. Normalizar `\n` literais em `hero.headline` e `landing.howItWorks.steps[*].title` (preferir CSS `text-balance` + `<br/>` controlado pelo componente, sem `\n` hardcoded em copy).

### PR C — Factualidade & ancoragem (0.5 sessão)
Resolve: itens **12, 13, 14, 15, 16, 21, 22, 23**.

1. **`proofSeal`**: trocar "14 estudos revisados por pares · 12.000 diagnósticos validados" por algo verdadeiro: **"Baseado em 3 Prémios Nobel de comportamento + +12.000 diagnósticos gerados"**.
2. Padronizar contador único em **`+12.000`** (PT/PL/RO/AR) / **`+12,000`** (EN). Remover qualquer `14.832` órfão.
3. **`b7.was/then/price`**: tornar dinâmico por moeda — ou remover ancoragem ($200/$47) e deixar **só o preço local**, ou criar tabela `priceAnchor` por moeda no `pricing.server.ts` e ler dela.
4. **`reveal.anchor`**: substituir `73%` por algo verificável ou remover ("A maioria dos {arch} repete este padrão em pelo menos 3 das 4 áreas").
5. `hero.trust`: tirar `+12.000 diagnósticos` (já está no ProofBar logo abaixo); manter só `Sem cartão para começar` + selos.
6. `landing.faq.items[3].a`: trocar "30+ páginas" por **"PDF completo (≈30 páginas)"** ou comprometer com número exato após gerar 1 PDF real e medir.
7. Polimento ortográfico (`30 dias de garantia`, espaço inicial em `titleAfter`).

### PR D — i18n × 5 + QA final (0.5 sessão)
Resolve: itens **17, 18, 19, 20, 25, 31**.

1. RTL AR: revisar pontuação, validar `[NOME]` em script árabe (não pode ser maiúsculo).
2. PL/RO: revisar concordância de gênero com `[PRIMARY]` (especialmente RO onde adj. concordam).
3. EN/PT testimonials da landing: adicionar campo `country` (alinha com `salesV2.b6` schema).
4. Sweep final: rodar Playwright capturando todas as 9 telas × 5 idiomas (45 screenshots), abrir em grid e revisar visualmente.
5. Build + tsgo limpos.
6. **Gate manual final**: usuário aprova screenshots → publish.

---

## Diretrizes globais (aplicam aos 4 PRs)

- **Fonte única**: nenhum nome de arquétipo, número de prova ou duração de protocolo pode existir em mais de um lugar. Tudo via constante exportada.
- **Tom**: PT-PT consistente ("tu"), EN universal, PL/RO/AR validados com bandeira no autor para reforçar localidade.
- **Nada de números que não conseguimos defender** (estudos, percentagens, contagens) — ou prova real, ou copy emocional sem número.
- **Toda mudança em `salesV2.*` precisa atualizar `salesV2`, NÃO criar `salesV3`** — evitar dead code growth.
- **Cada PR**: `bun run build` + `tsgo` verdes + capturas Playwright antes de fechar.

---

## Decisões pendentes (preciso de OK antes do PR A)

1. **Duração do protocolo**: 30 dias (alinha com garantia) ou 90 dias (mais valor percebido)? → recomendo **30**.
2. **Arquétipo secundário**: mantém em toda copy ou só no PDF? → recomendo **mantém na sales+checkout, esconde da landing**.
3. **Ancoragem de preço** (`$200 → $47 → hoje X`): mantém com adaptação por moeda, ou remove e mostra só preço local? → recomendo **adaptar por moeda** (mais conversão).
4. **Bloco `obrigado`/`dashboard`/`onboarding` no i18n**: deletar agora ou só marcar `@deprecated`? → recomendo **deletar** (reduz `translations.ts` em ~600 linhas, build mais rápido).
5. **Posso começar pelo PR A** (consistência ontológica) assim que aprovares as 4 decisões? Ou queres revisar item-a-item da lista de 31 antes?

Responde "ok, segue" + decisões 1–4, ou aponta quais itens da lista de 31 retirar/adicionar.
