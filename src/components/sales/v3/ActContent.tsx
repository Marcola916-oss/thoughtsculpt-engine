import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { useAwakening } from "./awakening-context";
import { fadeInUp } from "@/lib/animations";

interface Props {
  actId: string;
  children: ReactNode;
  sceneId?: string;
}

/**
 * ActContent — per-act content wrapper for The Awakening Protocol.
 *
 * Shows/hides content based on the current act from the AwakeningScroll context.
 * Each act's content fades in with the fadeInUp animation when active.
 * Analytics (VSL_SCENE_VIEW) are handled by SceneFrame per-scene.
 */
export function ActContent({ actId, children }: Props) {
  const { currentAct, reduced } = useAwakening();
  const isActive = currentAct === actId;

  return (
    <section data-act={actId} className="relative w-full">
      {/* Visually hidden heading for screen readers */}
      <h2 className="sr-only">{`Act ${actId}`}</h2>

      {reduced ? (
        // Reduced motion: show all acts at once, no animation.
        <div className="relative z-10">{children}</div>
      ) : (
        <motion.div
          className="relative z-10"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            // Use visibility instead of display:none to preserve layout.
            visibility: isActive ? "visible" : "hidden",
          }}
        >
          {children}
        </motion.div>
      )}
    </section>
  );
}

export default ActContent;
