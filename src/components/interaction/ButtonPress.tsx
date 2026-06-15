/**
 * ButtonPress — Button wrapper that adds a tactile press halo.
 *
 * A red halo follows the cursor while the button is pressed, fading in
 * on hover at low opacity and ramping up on `:active`. Complements the
 * existing `PrimaryButton` (which handles lift + shimmer + tap scale) by
 * adding a position-aware feedback layer.
 *
 * The component is API-compatible with a native <button> and forwards
 * all standard props (onClick, type, disabled, form attributes, etc.).
 *
 * @example
 *   <ButtonPress onClick={...} className="...">Save</ButtonPress>
 *   <ButtonPress variant="ghost" disabled>Can't touch this</ButtonPress>
 */

import {
  forwardRef,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export interface ButtonPressProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Halo color. Default accent. */
  haloColor?: string;
  /** Halo radius in px. Default 90. */
  haloRadius?: number;
  /** Hide halo on hover (still active on press). */
  mutedHover?: boolean;
  children: ReactNode;
}

export const ButtonPress = forwardRef<HTMLButtonElement, ButtonPressProps>(
  (
    {
      haloColor = "var(--accent)",
      haloRadius = 90,
      mutedHover = false,
      className,
      children,
      onMouseMove,
      onMouseDown,
      disabled,
      ...rest
    },
    forwardedRef,
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const reducedMotion = useReducedMotion();

    const setRefs = (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef)
        (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    };

    const updateHaloPosition = (e: React.MouseEvent<HTMLButtonElement>) => {
      const node = buttonRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      node.style.setProperty("--halo-x", `${x}px`);
      node.style.setProperty("--halo-y", `${y}px`);
    };

    return (
      <button
        ref={setRefs}
        data-cursor="hover"
        disabled={disabled}
        onMouseMove={(e) => {
          if (!disabled) updateHaloPosition(e);
          onMouseMove?.(e);
        }}
        onMouseDown={(e) => {
          if (!disabled) updateHaloPosition(e);
          onMouseDown?.(e);
        }}
        className={cn(
          "button-press relative overflow-hidden",
          !disabled && !reducedMotion && "button-press-tap",
          className,
        )}
        {...rest}
      >
        {children}
        {!disabled && !reducedMotion && (
          <span
            aria-hidden
            className={cn(
              "button-press-halo pointer-events-none absolute inset-0",
              mutedHover && "button-press-halo-muted",
            )}
            style={
              {
                "--halo-color": haloColor,
                "--halo-radius": `${haloRadius}px`,
                borderRadius: "inherit",
              } as React.CSSProperties
            }
          />
        )}
      </button>
    );
  },
);
ButtonPress.displayName = "ButtonPress";
