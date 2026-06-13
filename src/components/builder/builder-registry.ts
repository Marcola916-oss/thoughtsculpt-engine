/**
 * builder-registry.ts
 *
 * Registra os componentes React do MindReset no Builder.io.
 * Qualquer componente aqui listado aparecerá na barra lateral do
 * editor visual do Builder para ser arrastado para a tela.
 *
 * Para adicionar um novo componente:
 *   1. Importe-o aqui
 *   2. Chame Builder.registerComponent(Component, { name, inputs })
 */

import { Builder } from "@builder.io/react";
import { ProofBar } from "../landing/ProofBar";
import { Testimonials } from "../landing/Testimonials";
import { FAQ } from "../landing/FAQ";
import { FinalCTA } from "../landing/FinalCTA";
import { HowItWorks } from "../landing/HowItWorks";
import { FeaturesGrid } from "../landing/FeaturesGrid";
import { ArchetypeShowcase } from "../landing/ArchetypeShowcase";

// ──────────────────────────────────────────────────────────────────
// Barra de métricas de confiança (4 stats)
// ──────────────────────────────────────────────────────────────────
Builder.registerComponent(ProofBar, {
  name: "MindReset – Proof Bar",
  image:
    "https://tabler-icons.io/static/tabler-icons/icons-png/star.png",
});

// ──────────────────────────────────────────────────────────────────
// Grid de depoimentos (3 cards com ★★★★★)
// ──────────────────────────────────────────────────────────────────
Builder.registerComponent(Testimonials, {
  name: "MindReset – Testimonials",
  image:
    "https://tabler-icons.io/static/tabler-icons/icons-png/message-star.png",
});

// ──────────────────────────────────────────────────────────────────
// FAQ accordion (2 colunas, animado)
// ──────────────────────────────────────────────────────────────────
Builder.registerComponent(FAQ, {
  name: "MindReset – FAQ",
  image:
    "https://tabler-icons.io/static/tabler-icons/icons-png/help-circle.png",
});

// ──────────────────────────────────────────────────────────────────
// Call-to-action final com glow vermelho
// ──────────────────────────────────────────────────────────────────
Builder.registerComponent(FinalCTA, {
  name: "MindReset – Final CTA",
  image:
    "https://tabler-icons.io/static/tabler-icons/icons-png/rocket.png",
});

// ──────────────────────────────────────────────────────────────────
// Seção "Como funciona" (3 passos)
// ──────────────────────────────────────────────────────────────────
Builder.registerComponent(HowItWorks, {
  name: "MindReset – How It Works",
  image:
    "https://tabler-icons.io/static/tabler-icons/icons-png/list-numbers.png",
});

// ──────────────────────────────────────────────────────────────────
// Grid das 4 ferramentas do produto (Diagnóstico, Matriz, Compass, Progresso)
// ──────────────────────────────────────────────────────────────────
Builder.registerComponent(FeaturesGrid, {
  name: "MindReset – Features Grid",
  image:
    "https://tabler-icons.io/static/tabler-icons/icons-png/layout-grid.png",
});

// ──────────────────────────────────────────────────────────────────
// Showcase dos 4 arquétipos (AO / SS / EA / HI)
// ──────────────────────────────────────────────────────────────────
Builder.registerComponent(ArchetypeShowcase, {
  name: "MindReset – Archetype Showcase",
  image:
    "https://tabler-icons.io/static/tabler-icons/icons-png/brain.png",
});
