"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type LiquidTextProps = {
  children: ReactNode;
  className?: string;
  /** Idle (no cursor near) displacement scale, in px. */
  idle?: number;
  /** Maximum displacement scale when cursor is over the element. */
  peak?: number;
  /** Distance in px from the bounding box at which the cursor stops affecting the warp. */
  range?: number;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * Per-pixel liquid distortion of HTML content via SVG feTurbulence +
 * feDisplacementMap. Real GPU-accelerated warp, not per-character chunks.
 *
 * Idle: text breathes subtly (low displacement, slow noise drift).
 * Cursor near: scale ramps up smoothly. Closer = more pronounced.
 * Cursor far / touch / reduced-motion: filter is bypassed entirely.
 *
 * The HTML inside `children` is fully selectable, accessible, and SEO'd.
 * The filter only paints; it doesn't replace the DOM text.
 */
export function LiquidText({
  children,
  className = "",
  idle = 2,
  peak = 10,
  range = 380,
}: LiquidTextProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const filterId = useId().replace(/:/g, "");

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const disp = dispRef.current;
    const turb = turbRef.current;
    if (!wrapper || !disp || !turb) return;

    if (prefersReducedMotion() || !isFinePointer()) {
      wrapper.style.filter = "";
      return;
    }

    let raf = 0;
    let mouseX = -10000;
    let mouseY = -10000;
    let scale = idle;
    let target = idle;
    const t0 = performance.now();

    const apply = () => {
      const wrapperRect = wrapper.getBoundingClientRect();
      const dx = Math.max(
        wrapperRect.left - mouseX,
        0,
        mouseX - wrapperRect.right,
      );
      const dy = Math.max(
        wrapperRect.top - mouseY,
        0,
        mouseY - wrapperRect.bottom,
      );
      const distFromBox = Math.hypot(dx, dy);
      const proximity = Math.max(0, 1 - distFromBox / range);
      // Cubic falloff: cursor needs to be genuinely close before the
      // distortion ramps up. Avoids the "always melting" look.
      target = idle + (peak - idle) * proximity * proximity * proximity;

      // Slower lerp so the warp eases in/out instead of snapping.
      scale += (target - scale) * 0.06;
      disp.setAttribute("scale", scale.toFixed(2));

      // Slow noise drift gives the idle "breathing" feel. Very low base
      // frequency = single large smooth wave across the text instead of
      // multiple ripples. This is what gives liquid feel rather than the
      // "hand-sketched" texture that higher frequencies produce.
      const t = (performance.now() - t0) / 1000;
      const fx = 0.0035 + Math.sin(t * 0.4) * 0.001;
      const fy = 0.0055 + Math.cos(t * 0.3) * 0.0012;
      turb.setAttribute("baseFrequency", `${fx.toFixed(4)} ${fy.toFixed(4)}`);

      raf = requestAnimationFrame(apply);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const start = () => {
      if (raf === 0) raf = requestAnimationFrame(apply);
    };
    const stop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    wrapper.style.filter = `url(#${filterId})`;
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
      wrapper.style.filter = "";
    };
  }, [idle, peak, range, filterId]);

  return (
    <>
      <svg
        aria-hidden
        focusable={false}
        width="0"
        height="0"
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <defs>
          <filter
            id={filterId}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.0035 0.0055"
              numOctaves={1}
              seed={3}
              result="noise"
            />
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="noise"
              scale={idle}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div ref={wrapperRef} className={className}>
        {children}
      </div>
    </>
  );
}
