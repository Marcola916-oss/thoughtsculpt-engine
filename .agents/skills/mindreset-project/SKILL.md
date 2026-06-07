---
name: mindreset-project
description: MindReset SaaS project knowledge — brand tokens, components, i18n, deployment, quiz flow, and conventions. Use when working on the MindReset codebase.
when_to_use: "When working on the MindReset project files, components, styles, translations, or deployment. NOT for generic tasks unrelated to this codebase."
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash, Skill]
effort: medium
---

# MindReset Project — Complete Codebase Reference

> SaaS behavioral finance diagnostic. TanStack Start + Vite + Tailwind + Supabase + Lovable.

## Overview

MindReset is a multi-locale (PT/EN/PL/RO/AR) behavioral finance quiz that diagnoses spending archetypes. Users answer 8 questions, receive a personalized diagnosis with AI-generated insights, and can access a dashboard with tools (diagnosis, compass, calendar, progress).

## Brand Tokens

All in `src/styles.css` `:root`:

```css
--background: oklch(0% 0 0);           /* #000000 canvas */
--foreground: oklch(0.97 0.003 250);   /* #F5F5F7 */
--primary: oklch(0.52 0.24 27);        /* #CC0000 accent */
--muted: oklch(0.18 0 0);              /* #1A1A1A */
--muted-foreground: oklch(0.72 0.005 250); /* #929698 — AA on black */
--card: oklch(0.13 0 0);               /* #0D0D0D surface */
--border: oklch(0.24 0 0);             /* #2A2A2A */
--accent-glow: oklch(0.52 0.24 27 / 0.35);
--arch-primary: var(--primary);         /* overridden per archetype */
```

**Archetype colors:**
- AO (Accumulator): `oklch(0.64 0.12 210)` — blue
- SS (Status Seeker): `oklch(0.75 0.12 85)` — gold
- EA (Essentialist): `oklch(0.7 0.05 280)` — purple
- HI (Hedonist): `oklch(0.65 0.25 35)` — orange

## File Structure

```
src/
├── routes/
│   ├── __root.tsx          # Root layout, favicon, SEO meta, LD+JSON
│   ├── index.tsx           # Landing + Quiz + Sales (stage machine)
│   ├── obrigado.tsx        # Thank you / results page
│   └── _authenticated/     # Dashboard routes (onboarding, dashboard, settings, etc.)
├── components/
│   ├── landing/            # ProofBar, ArchetypeShowcase, HowItWorks, FeaturesGrid, Testimonials, FAQ, FinalCTA
│   ├── quiz/               # QuizOption, NeuralLoader
│   ├── identity/           # MarbleBust, BustLoader, IdentitySymbol, BustMini, BustEmptyState
│   ├── atmosphere/         # VolumetricFog, FloatingSymbols, ScanLines, Atmosphere
│   ├── interaction/        # ArchetypeHover, MagneticCursor, Reveal, ButtonPress
│   └── dashboard/          # Sidebar, charts, etc.
├── lib/
│   ├── i18n/
│   │   ├── LanguageProvider.tsx  # Language context + <html lang> + dir="rtl" for AR
│   │   ├── translations.ts      # All 5 locales (PT 215-274, EN 517-623, PL 851-970, RO 995-1066, AR 1090-1163)
│   │   └── types.ts             # Dict type
│   ├── utils.ts            # cn() helper (clsx + tailwind-merge)
│   └── animations.ts       # 30+ Framer Motion variants
├── hooks/
│   └── use-mouse-position.ts
├── styles.css              # Design tokens + Tailwind overrides + fog animations
└── assets/
    └── favicon.svg         # MindReset "M" red on black
```

## Landing Page (9 sections)

Order in `src/routes/index.tsx` lines 184-194:

1. **Hero** — headline + CTA + archetype floating badges + red glow background
2. **ProofBar** — 4 trust metrics (diagnostics, rating, no bank, languages)
3. **ArchetypeShowcase** — 4 archetype cards (AO/SS/EA/HI) with icons + descriptions
4. **HowItWorks** — 3-step process with arrows
5. **FeaturesGrid** — 2×2 grid (Diagnosis, Compass, Calendar, Progress)
6. **Testimonials** — 3 review cards with avatars
7. **FAQ** — accordion (6 items, single-open)
8. **FinalCTA** — headline + guarantee + CTA

**Curtain:** Sections 2-8 wrapped in `<div className="relative z-10 bg-background/80 backdrop-blur-md">` to prevent red fog bleeding.

## Quiz Flow

`stage` state machine in `index.tsx`:
```
hero → identity → questions → email → loader → reveal → /obrigado
```

- **identity:** name + gender input
- **questions:** 8 archetype questions via QuizOption cards
- **email:** email capture (optional)
- **loader:** NeuralLoader with Brain → MarbleBust animation
- **reveal:** archetype result + share link

## i18n

- **5 locales:** PT (lusófono), EN, PL, RO, AR (RTL)
- **Language codes:** `pt, en, pl, ro, ar` in select element
- **AR RTL:** `dir="rtl"` set dynamically via `LanguageProvider.tsx:91-96`
- **localStorage:** `mindreset_lang` for client persistence
- **Translation keys:** `landing.*` for landing page, `quiz.*` for quiz, `dashboard.*` for dashboard

## Deployment

1. User edits in Antigravity
2. Syncs to GitHub
3. Lovable pulls from GitHub
4. User clicks Publish in Lovable
5. Live at `https://thoughtsculpt-engine.lovable.app`

**GitHub repo:** `https://github.com/Marcola916-oss/thoughtsculpt-engine.git`

## Accessibility

- `aria-label` on interactive elements
- `role="img"` + `aria-label` on decorative symbols
- `aria-hidden` on decorative layers (fog, scan lines, symbols)
- `prefers-reduced-motion` and `(hover: none)` in `src/styles.css:597-841`
- FAQ: `aria-expanded` + `aria-controls` per item
- WCAG AA contrast: `--muted-foreground` at 5.85:1 on black

## Known Issues

- 2 pre-existing TS errors: `onboarding.tsx:192` and `obrigado.tsx:329` — `"/dashboard/"` vs `"/dashboard"` (type mismatch, not blocking build)
- Build passes: `npm run build` (~2.5s)
- `npx tsc --noEmit` shows only these 2 pre-existing errors

## Conventions

- **Path alias:** `@/*` → `./src/*` (via `vite-tsconfig-paths`)
- **cn() helper:** `clsx` + `tailwind-merge` for conditional classes
- **Reveal animations:** `<Reveal variant="fade-up">` and `<Reveal.Group stagger="fast">`
- **Atmosphere:** `<Atmosphere fog="dramatic" symbols="sparse" scan="subtle" pinned>` for Hero
- **Brand icon:** `<IdentitySymbol>` for decorative use, `<MarbleBust>` for hero/loader
- **ButtonPress:** halo effect on CTA buttons

## PowerShell 5.1 Quirks (Windows)

- `New-Item` uses `-Path` (not `-LiteralPath`)
- `npm` is `.cmd` — use `Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm.cmd"` or `&` operator
- `Get-Content -Raw` for raw size, `Measure-Object -Line` for line count
- `Select-String` with `-NotMatch` doesn't accept array — use pipeline

## Supabase

- **Project ref:** `yuphudqargdosdrxznzi`
- **URL pattern:** `https://<project-ref>.supabase.co`
- **Edge functions:** `supabase/functions/` (stripe-webhook, etc.)
- **MCP:** Read-only, scoped to project, features: database, docs, development
