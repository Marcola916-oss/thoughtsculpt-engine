import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import faviconSvg from "../assets/favicon.svg?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LanguageProvider, useI18n } from "../lib/i18n/LanguageProvider";
import { CookieBanner } from "../components/LanguageSwitcher";
import { PageTransition } from "../components/PageTransition";
import { AnimatePresence } from "framer-motion";
import { GlobalAmbient } from "@/components/atmosphere";
import { MagneticCursor } from "@/components/interaction/MagneticCursor";
import { RevealProvider } from "@/components/interaction/Reveal";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { SiteFooter } from "@/components/layout/SiteFooter";

// P0.2 — Meta tags localizadas por idioma.
// LanguageProvider já sincroniza document.lang/dir no cliente (L106-107).
// Estas meta tags são consumidas pelo head() do TanStack para o SSR inicial;
// no cliente, o LanguageProvider sobrepõe via document.title e og tags.
type MetaLang = "pt" | "en" | "pl" | "ro" | "ar";
const META_BY_LANG: Record<MetaLang, { title: string; description: string; ogTitle: string; ogDescription: string }> = {
  pt: {
    title: "MindReset — Descubra o teu Arquétipo Financeiro",
    description: "Diagnóstico comportamental que revela por que ganhas, gastas e perdes dinheiro como gastas. Resultado em 2 minutos.",
    ogTitle: "Qual é o teu Arquétipo Financeiro?",
    ogDescription: "80% das decisões financeiras são emocionais. Descobre o teu padrão em 8 perguntas.",
  },
  en: {
    title: "MindReset — Discover Your Financial Archetype",
    description: "Behavioral diagnosis that reveals why you earn, spend and lose money the way you do. Results in 2 minutes.",
    ogTitle: "What Is Your Financial Archetype?",
    ogDescription: "80% of financial decisions are emotional. Discover your pattern in 8 questions.",
  },
  pl: {
    title: "MindReset — Odkryj swój Archetyp Finansowy",
    description: "Diagnoza behawioralna, która ujawnia, dlaczego zarabiasz, wydajesz i tracisz pieniądze w ten sposób. Wyniki w 2 minuty.",
    ogTitle: "Jaki jest Twój Archetyp Finansowy?",
    ogDescription: "80% decyzji finansowych jest emocjonalnych. Odkryj swój wzorzec w 8 pytaniach.",
  },
  ro: {
    title: "MindReset — Descoperă-ți Arhetipul Financiar",
    description: "Diagnostic comportamental care dezvăluie de ce câștigi, cheltuiești și pierzi bani așa cum o faci. Rezultate în 2 minute.",
    ogTitle: "Care este Arhetipul tău Financiar?",
    ogDescription: "80% din deciziile financiare sunt emoționale. Descoperă-ți tiparul în 8 întrebări.",
  },
  ar: {
    title: "MindReset — اكتشف نمطك المالي",
    description: "تشخيص سلوكي يكشف لماذا تكسب وتنفق وتخسر المال بهذه الطريقة. النتائج في دقيقتين.",
    ogTitle: "ما هو نمطك المالي؟",
    ogDescription: "80٪ من القرارات المالية عاطفية. اكتشف نمطك في 8 أسئلة.",
  },
};

/** HtmlRoot — componente que lê lang/dir do LanguageProvider e
 *  sincroniza o atributo <html> em runtime (client-side hydration). */
function HtmlLangSync() {
  const { lang, dir } = useI18n();
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    // Atualizar og:locale e title dinamicamente
    const meta = META_BY_LANG[lang as MetaLang] ?? META_BY_LANG.en;
    document.title = meta.title;
    // og:title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", meta.ogTitle);
    // og:description
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", meta.ogDescription);
    // meta description
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", meta.description);
    // twitter:title
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", meta.ogTitle);
    // twitter:description
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", meta.ogDescription);
  }, [lang, dir]);
  return null;
}


function NotFoundComponent() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-[clamp(4rem,15vw,7rem)] font-black italic uppercase leading-[0.9] tracking-[-0.05em] text-foreground">404</h1>
        <h2 className="mt-4 font-display text-lg md:text-xl font-black italic uppercase tracking-tight text-foreground">{t.notFound.title}</h2>
        <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
          {t.notFound.desc}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.notFound.goHome}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t } = useI18n();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-lg md:text-xl font-black italic uppercase tracking-tight text-foreground">
          {t.errorPage.title}
        </h1>
        <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
          {t.errorPage.desc}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.errorPage.tryAgain}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t.errorPage.goHome}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    // SSR: meta tags em EN (fallback neutro). O HtmlLangSync() substitui
    // no cliente assim que o LanguageProvider detecta o locale correto.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: META_BY_LANG.en.title },
      { name: "description", content: META_BY_LANG.en.description },
      { name: "author", content: "MindReset" },
      { name: "theme-color", content: "#000000" },
      { property: "og:title", content: META_BY_LANG.en.ogTitle },
      { property: "og:description", content: META_BY_LANG.en.ogDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mindreset.app/" },
      { name: "robots", content: "index, follow" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: META_BY_LANG.en.ogTitle },
      { name: "twitter:description", content: META_BY_LANG.en.ogDescription },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2da42380-f8c4-428d-9b43-97b6d3d262c0/id-preview-9b1fda34--3f9b1dc4-2b9d-4a05-870f-ba9e5ecd20e8.lovable.app-1780370589695.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2da42380-f8c4-428d-9b43-97b6d3d262c0/id-preview-9b1fda34--3f9b1dc4-2b9d-4a05-870f-ba9e5ecd20e8.lovable.app-1780370589695.png" },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Syne:wght@600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: faviconSvg,
      },
      {
        rel: "canonical",
        href: "https://mindreset.app/",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "MindReset",
          url: "https://mindreset.app/",
          description: "Behavioral diagnosis that reveals why you earn, spend and lose money the way you do. AI-powered analysis across 4 life dimensions.",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "AggregateOffer",
            lowPrice: "0",
            highPrice: "29.99",
            priceCurrency: "USD",
            offerCount: 3,
          },
          author: {
            "@type": "Organization",
            name: "MindReset",
            url: "https://mindreset.app/",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // lang="en" é o fallback SSR. O HtmlLangSync() (dentro de RootComponent)
  // substitui para o locale real assim que o LanguageProvider hidrata.
  return (
    <html lang="en" dir="ltr" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="m-0 p-0 bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useScrollReveal();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {/* P0.1 + P0.2: sincroniza <html lang/dir> e meta tags no cliente */}
        <HtmlLangSync />
        <RevealProvider>
          <GlobalAmbient />
          <MagneticCursor />
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <PageTransition key={useRouter().state.location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
            <SiteFooter />
          </div>
          <CookieBanner />
        </RevealProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
