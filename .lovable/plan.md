text
1. Performance Audit & Cleanup
   - Remove heavy JavaScript-based animations (Framer Motion) from the background layers.
   - Replace dynamic math-based movement with pre-computed CSS keyframe animations.
   - Disable expensive real-time filters (backdrop-filter: blur) on mobile and replace with semi-transparent static overlays.

2. Background Re-engineering (The "Magic" Layer)
   - Refactor `BackgroundAmbient.tsx` to use optimized CSS transitions instead of complex filters.
   - Update `VolumetricFog.tsx` to use pre-rendered SVG masks or CSS radial gradients that don't require real-time CPU calculations.
   - Implement `will-change: transform, opacity` on all animated elements to force GPU acceleration.

3. Static Path Animation (The "Programming" Part)
   - Convert `FloatingSymbols.tsx` from random JS distribution to fixed CSS-animated orbits.
   - Use `translate3d(0,0,0)` to ensure layers are promoted to their own hardware-accelerated planes.

4. Global Style Optimization
   - Update `src/styles.css` to simplify the global fog and ambient animations.
   - Remove JS-driven mouse interaction from background elements to eliminate event listener overhead.
   - Ensure all animations use only `transform` and `opacity` (the only two properties that don't trigger layout or paint cycles).

Technical Details:
- Move from `framer-motion` to native CSS Keyframes for background elements.
- Use `radial-gradient` instead of `filter: blur()` where possible to save GPU cycles.
- Implement hardware acceleration triggers across all visual layers.
