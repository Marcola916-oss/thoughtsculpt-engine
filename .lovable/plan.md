# Plano — Trocar ícone do badge typewriter por cérebro

## 1. Objetivo

Substituir o ícone fixo `<ShieldCheck>` (Lucide) que aparece à esquerda do texto animado no badge do topo da landing por um **cérebro SVG inline**, mantendo tudo o resto (texto typewriter, ciclo de cores, transições, i18n, acessibilidade) **exatamente igual**.

## 2. Análise das referências

As 4 imagens enviadas mostram variações de cérebros estilizados:
- **Imagem 1 e 3:** vista superior — dois hemisférios simétricos com sulcos (giros cerebrais) bem marcados
- **Imagem 2 e 4:** detalhe/silhueta lateral com sulcos hollow (vazados)

Linguagem visual comum: **traços orgânicos curvos, sulcos vazados, simetria, alto contraste**. Combina perfeitamente com a tipografia Syne + paleta dos arquétipos.

**Escolha:** silhueta **lateral simplificada** (estilo imagem 4), porque:
- Funciona melhor em tamanho pequeno (badge ~18px)
- Mantém legibilidade do contorno mesmo monocromático
- Combina com o conceito "MindReset" (psicologia/cérebro)
- O sulco central diagonal dá identidade reconhecível sem ruído visual

## 3. Onde mexer

**Apenas 1 arquivo:** `src/routes/index.tsx`

Dentro do componente `TypingArchetypeBadge`:
- Remover o `import { ShieldCheck } from "lucide-react"` (se for usado só ali — verifico antes; se for usado em outro lugar, só removo o JSX do badge)
- Criar componente local `BrainIcon` (SVG inline puro, ~20 linhas)
- Substituir `<ShieldCheck className="..." />` por `<BrainIcon className="..." />`

**Zero mudanças em:**
- `src/hooks/use-typewriter.ts`
- Cores, glow, borda, transições do badge
- i18n / translations
- Acessibilidade (`aria-live`, `aria-label`)
- Qualquer outro arquivo do projeto

## 4. Especificação do `BrainIcon`

```tsx
function BrainIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Silhueta exterior do cérebro (lateral) */}
      <path d="M9 4.5c-2 0-3.5 1.3-3.7 3-1.4.4-2.3 1.6-2.3 3 0 .9.4 1.7 1 2.2-.6.5-1 1.3-1 2.2 0 1.4.9 2.6 2.3 3 .2 1.7 1.7 3 3.7 3 .8 0 1.6-.3 2.2-.8.6.5 1.4.8 2.2.8 2 0 3.5-1.3 3.7-3 1.4-.4 2.3-1.6 2.3-3 0-.9-.4-1.7-1-2.2.6-.5 1-1.3 1-2.2 0-1.4-.9-2.6-2.3-3-.2-1.7-1.7-3-3.7-3-.8 0-1.6.3-2.2.8C10.6 4.8 9.8 4.5 9 4.5Z" />
      {/* Sulco central (divisor dos hemisférios) */}
      <path d="M11.2 5v14" opacity="0.85" />
      {/* Sulcos internos — lado esquerdo */}
      <path d="M7 9c1 .3 1.8 1 2 2" opacity="0.75" />
      <path d="M6.5 14c1.2-.2 2.2-.9 2.5-2" opacity="0.75" />
      {/* Sulcos internos — lado direito */}
      <path d="M15 8c-.8.5-1.3 1.3-1.3 2.3" opacity="0.75" />
      <path d="M16 15c-1-.3-1.8-1.2-2-2.3" opacity="0.75" />
    </svg>
  );
}
```

**Por que esse desenho funciona:**
- `stroke="currentColor"` → herda a cor do badge automaticamente, então **muda junto com o ciclo de arquétipo** (azul → roxo → cinza → laranja) sem código extra
- Mesma classe que o ícone atual (`w-4 h-4` ou `size-4`) → encaixe perfeito, sem reflow de layout
- `aria-hidden="true"` → leitor de tela ignora (o texto cumpre o papel semântico)
- Opacidades graduais nos sulcos internos → profundidade visual sem poluir em tamanho pequeno

## 5. Verificação

1. Build: `npm run build` deve passar (exit 0)
2. Smoke visual com Playwright: 1 screenshot do badge confirmando:
   - ícone de cérebro aparece no lugar do escudo
   - cor do cérebro acompanha cor do texto (verifico nos 4 arquétipos via screenshots em intervalos)
   - layout intacto (mesma largura/altura do badge)

## 6. O que NÃO vou fazer

- Não toco no hook `useTypewriter`
- Não mexo nas cores `ARCH_BADGE_COLORS`
- Não altero a animação de digitação
- Não mexo em traduções
- Não removo `lucide-react` do `package.json` (outras partes do projeto usam)
- Não adiciono dependências novas
- Não mexo em outro badge da página
