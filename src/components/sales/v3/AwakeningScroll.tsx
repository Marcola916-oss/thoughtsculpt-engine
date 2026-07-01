import { type ReactNode, type RefObject } from "react";
import { AwakeningProvider } from "./awakening-context";
import { ParticleMorph } from "./ParticleMorph";
import { SceneElements } from "./SceneElements";
import { LivingDiagnosis } from "./LivingDiagnosis";
import { ScrollProgressDots } from "./ScrollProgressDots";
import type { Archetype } from "@/lib/quiz/scoring";

interface Props {
  rootRef: RefObject<HTMLElement | null>;
  archetype: Archetype;
  children: ReactNode;
}

/**
 * AwakeningScroll — orchestrator for The Awakening Protocol.
 *
 * Composes all layers of the cinematic scroll experience:
 *   Layer 0: ParticleMorph (Canvas2D particle system)
 *   Layer 1: LivingDiagnosis (neural mesh)
 *   Layer 2: SceneElements (SVG cracks, shards, sigil, reassembly)
 *   Layer 3: Children (editorial text content, passed from SalesPageV2)
 *   Layer 4: ScrollProgressDots (UI control)
 *
 * All layers share scroll state via AwakeningProvider context.
 * The root element has data-awakening-root for scroll targeting.
 */
export function AwakeningScroll({ rootRef, archetype, children }: Props) {
  return (
    <AwakeningProvider rootRef={rootRef}>
      {/* Background layers — fixed to viewport */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <ParticleMorph />
        <LivingDiagnosis scrollTargetRef={rootRef} intensity={0.7} />
        <SceneElements archetype={archetype} />
      </div>

      {/* Content layers — scrollable */}
      {children}

      {/* UI controls — fixed */}
      <ScrollProgressDots />
    </AwakeningProvider>
  );
}

export default AwakeningScroll;
