/**
 * BuilderPage.tsx
 *
 * Componente "motor" do Builder.io.
 * Faz fetch do conteúdo visual criado no painel do Builder para
 * um determinado caminho de URL e renderiza na tela.
 *
 * Se o conteúdo não for encontrado no Builder, mostra 404.
 */

import { BuilderComponent, useIsPreviewing, builder } from "@builder.io/react";
import { useEffect, useState } from "react";

// Importa o registro ANTES de qualquer render
import "@/components/builder/builder-registry";

// Inicializa o Builder com a chave da env (definida no Vite como VITE_BUILDER_API_KEY)
builder.init(import.meta.env.VITE_BUILDER_API_KEY as string);

interface BuilderPageProps {
  /** Caminho da URL a ser buscado no Builder (ex: "/promocao") */
  urlPath: string;
}

export function BuilderPage({ urlPath }: BuilderPageProps) {
  const isPreviewing = useIsPreviewing();
  const [content, setContent] = useState<object | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    builder
      .get("page", {
        userAttributes: { urlPath },
        prerender: false,
      })
      .promise()
      .then((data) => {
        if (data) {
          setContent(data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [urlPath]);

  // Loader enquanto busca o conteúdo do Builder
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#2A2A2A] border-t-[#CC0000]" />
          <p className="text-sm text-white/40">Carregando página…</p>
        </div>
      </div>
    );
  }

  // Página não existe nem no Builder nem nas nossas rotas
  if (notFound && !isPreviewing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6 text-center">
        <span className="text-6xl font-black text-[#CC0000]">404</span>
        <h1 className="font-display text-2xl font-black text-white">
          Página não encontrada
        </h1>
        <p className="max-w-sm text-white/50">
          Essa URL não existe em nosso site. Verifique o endereço ou volte à
          página inicial.
        </p>
        <a
          href="/"
          className="rounded-lg bg-[#CC0000] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#990000]"
        >
          Voltar ao início
        </a>
      </div>
    );
  }

  // Renderiza o conteúdo criado no Builder ou a preview ao vivo
  return (
    <BuilderComponent
      model="page"
      content={content ?? undefined}
    />
  );
}
