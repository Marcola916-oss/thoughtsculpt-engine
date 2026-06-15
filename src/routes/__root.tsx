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


function NotFoundComponent() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t.notFound.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
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
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t.errorPage.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
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
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MindReset — Discover your financial archetype" },
      { name: "description", content: "Behavioral diagnosis that reveals why you earn, spend and lose money the way you do." },
      { name: "author", content: "MindReset" },
      { name: "theme-color", content: "#000000" },
      { property: "og:title", content: "MindReset — Discover your financial archetype" },
      { property: "og:description", content: "Behavioral diagnosis that reveals why you earn, spend and lose money the way you do." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mindreset.app/" },
      { name: "robots", content: "index, follow" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MindReset — Discover your financial archetype" },
      { name: "twitter:description", content: "Behavioral diagnosis that reveals why you earn, spend and lose money the way you do." },
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
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap",
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
      {
        rel: "prefetch",
        href: "/brain.splinecode",
        as: "fetch",
        crossOrigin: "anonymous",
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
  return (
    <html lang="en" className="dark">
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
        <RevealProvider>
          <GlobalAmbient />
          <MagneticCursor />
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <PageTransition key={useRouter().state.location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </div>
          <CookieBanner />
        </RevealProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
