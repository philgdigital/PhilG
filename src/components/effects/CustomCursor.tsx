"use client";

import { useEffect, useRef, useState } from "react";
import { useFinePointer } from "@/lib/hooks/use-fine-pointer";

const MAGNETIC_RANGE = 90; // px from element edge to start pulling
const MAGNETIC_STRENGTH = 0.32; // 0-1, how much the element follows the cursor

/**
 * Magnetic targets (data-magnetic="true") are tracked by this component.
 * Within MAGNETIC_RANGE px of an element's edge the element translates
 * up to MAGNETIC_STRENGTH * delta toward the cursor, with quadratic
 * ease-in. The cursor ring also gets pulled subtly toward the nearest
 * target.
 *
 * Targets opt in by setting `data-magnetic="true"`. CursorTrail and
 * CustomCursor share fine-pointer detection via useFinePointer.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  // Pulse wrapper follows the cursor position; nested rings inside
  // animate via CSS keyframes to produce the 'electrified pulse'
  // signal when hovering over a clickable target.
  const pulseRef = useRef<HTMLDivElement>(null);
  const [hoverState, setHoverState] = useState<"idle" | "link" | "card">(
    "idle",
  );
  const [isClicked, setIsClicked] = useState(false);

  const isFinePointer = useFinePointer();

  useEffect(() => {
    if (!isFinePointer) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;
    let lastHover: "idle" | "link" | "card" = "idle";

    // Track whether the visitor is actively scrolling. We skip magnetic
    // getBoundingClientRect() reads during scroll because each rect call
    // can force a layout flush; with 20+ magnetic targets on screen, that
    // burns the scroll's frame budget. Resumes 150ms after the last
    // scroll event so the magnetic-pull feel is restored as soon as
    // they stop. Performance win: scrolling stays at 60fps even with the
    // cursor effect active.
    let isScrolling = false;
    let scrollIdleTimer = 0;
    const onScrollSignal = () => {
      isScrolling = true;
      window.clearTimeout(scrollIdleTimer);
      scrollIdleTimer = window.setTimeout(() => {
        isScrolling = false;
      }, 150);
    };
    window.addEventListener("scroll", onScrollSignal, { passive: true });

    // Track whether the mouse has moved recently. When the cursor is
    // settled (mouse not moving + ring already at mouse position), the
    // render loop skips the magnetism DOM reads entirely. rAF keeps
    // ticking so the loop is alive for the next mouse move, but the
    // expensive work is gated behind 'something to update'.
    let mouseIsMoving = false;
    let mouseIdleTimer = 0;
    const markMouseMoving = () => {
      mouseIsMoving = true;
      window.clearTimeout(mouseIdleTimer);
      mouseIdleTimer = window.setTimeout(() => {
        mouseIsMoving = false;
      }, 300);
    };

    // Magnetic targets are tracked each frame so we don't query the DOM in
    // mousemove (which fires 60-120Hz). They're refreshed on scroll/resize.
    let magneticTargets: HTMLElement[] = [];
    const refreshTargets = () => {
      magneticTargets = Array.from(
        document.querySelectorAll<HTMLElement>('[data-magnetic="true"]'),
      );
      // Reset transforms on any target that's no longer near the cursor.
      magneticTargets.forEach((t) => {
        t.style.transform = "";
      });
    };
    refreshTargets();

    const applyMagnetism = (cx: number, cy: number) => {
      let nearest: HTMLElement | null = null;
      let nearestDx = 0;
      let nearestDy = 0;
      let nearestStrength = 0;

      for (const target of magneticTargets) {
        const r = target.getBoundingClientRect();
        const tx = r.left + r.width / 2;
        const ty = r.top + r.height / 2;
        const dx = cx - tx;
        const dy = cy - ty;
        // Distance from cursor to nearest edge of the element rect.
        const ex = Math.max(0, Math.abs(dx) - r.width / 2);
        const ey = Math.max(0, Math.abs(dy) - r.height / 2);
        const edgeDist = Math.hypot(ex, ey);

        if (edgeDist > MAGNETIC_RANGE) {
          target.style.transform = "";
          continue;
        }

        const t = 1 - edgeDist / MAGNETIC_RANGE; // 0 at edge of range, 1 at element
        const strength = t * t * MAGNETIC_STRENGTH; // ease-in
        target.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;

        if (strength > nearestStrength) {
          nearestStrength = strength;
          nearestDx = dx;
          nearestDy = dy;
          nearest = target;
        }
      }
      // Cursor ring also gets pulled, more subtly.
      if (nearest) {
        return { pullX: -nearestDx * 0.18, pullY: -nearestDy * 0.18 };
      }
      return { pullX: 0, pullY: 0 };
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      markMouseMoving();
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      let next: "idle" | "link" | "card" = "idle";
      if (target.closest(".hover-target") || target.closest("a") || target.closest("button")) {
        next = "link";
      }
      if (target.closest("[data-card]")) {
        next = "card";
      }
      if (next !== lastHover) {
        lastHover = next;
        setHoverState(next);
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);

    // Lerp factor controls how snappy the cursor ring catches up to the
    // mouse position. Was 0.22 (visibly trails the mouse by ~50ms);
    // bumped to 0.65 so the ring follows essentially in real time
    // (~30ms catch-up) while keeping just enough smoothing to read as
    // natural and avoid sub-pixel jitter.
    const RING_LERP = 0.65;

    const render = () => {
      // Three render modes:
      //   1. Settled (cursor static + ring caught up): skip ALL work,
      //      keep rAF alive cheaply for the next mouse move.
      //   2. Scrolling: skip magnetism DOM reads, lerp ring toward raw
      //      mouse position with pure compositor writes.
      //   3. Active (mouse moving, hover state changing): full magnetism
      //      pass with DOM reads of magnetic targets.
      const ringDelta =
        Math.abs(mouseX - ringX) + Math.abs(mouseY - ringY);
      const settled = !mouseIsMoving && !isScrolling && ringDelta < 0.5;

      if (settled) {
        raf = requestAnimationFrame(render);
        return;
      }

      let targetX: number;
      let targetY: number;
      if (isScrolling) {
        targetX = mouseX;
        targetY = mouseY;
      } else {
        const { pullX, pullY } = applyMagnetism(mouseX, mouseY);
        targetX = mouseX + pullX;
        targetY = mouseY + pullY;
      }
      ringX += (targetX - ringX) * RING_LERP;
      ringY += (targetY - ringY) * RING_LERP;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      // Pulse wrapper mirrors the ring's position so the pulse rings
      // animate centered on the cursor. The wrapper just translates;
      // the inner rings scale via CSS animation.
      if (pulseRef.current) {
        pulseRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      raf = requestAnimationFrame(render);
    };

    const start = () => {
      if (raf === 0) raf = requestAnimationFrame(render);
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

    // Only refresh the magnetic-target list on real DOM changes (resize,
    // route transitions). The previous version re-queried + reset every
    // element's transform on every scroll event. At 60+ scroll events
    // per second this added hundreds of ms of TBT during scroll.
    const onResize = () => refreshTargets();

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      window.clearTimeout(scrollIdleTimer);
      window.clearTimeout(mouseIdleTimer);
      magneticTargets.forEach((t) => {
        t.style.transform = "";
      });
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScrollSignal);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isFinePointer]);

  if (!isFinePointer) return null;

  // Refined cursor: small ring + small dot. No giant blob expansion.
  const ringSize = hoverState === "card" ? "w-12 h-12 -ml-6 -mt-6" : "w-7 h-7 -ml-3.5 -mt-3.5";
  const ringStyle =
    hoverState === "link"
      ? "border-[1.5px] border-[#0f62fe] bg-[#0f62fe]/10"
      : hoverState === "card"
        ? "border-[1.5px] border-[#10b981] bg-[#10b981]/8"
        : "border-[1.5px] border-white/40";
  const ringScale = isClicked ? "scale-90" : "scale-100";

  // Pulse rings: visible only when hovering a clickable target.
  // Two concentric rings with staggered animation delays create the
  // 'electrified pulse' feel. Color matches the hover state (blue for
  // links, emerald for cards).
  const showPulse = hoverState !== "idle";
  const pulseColor =
    hoverState === "card" ? "#10b981" : "#0f62fe";
  const pulseSize = hoverState === "card" ? 48 : 28;

  // z-index sits ABOVE the modal layer (z-[200]) so the cursor stays
  // visible when the contact form modal opens. Without this, the modal
  // backdrop covers the cursor and the visitor sees the system cursor
  // re-appear or no cursor at all.
  return (
    <>
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-1 h-1 -ml-0.5 -mt-0.5 bg-white rounded-full pointer-events-none z-[300] mix-blend-difference transition-transform duration-100 ${
          isClicked ? "scale-50" : "scale-100"
        }`}
        aria-hidden
      />
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[299] rounded-full transition-[width,height,margin,border-color,background-color,transform] duration-300 ease-out ${ringSize} ${ringStyle} ${ringScale}`}
        aria-hidden
      />
      {/* Pulse wrapper. Mirrors the ring position in JS. Renders two
          nested rings that scale outward + fade via CSS animation, plus
          a small 'Click for More' hint pill positioned below-right of
          the cursor as a clickability signal. */}
      <div
        ref={pulseRef}
        className={`fixed top-0 left-0 pointer-events-none z-[298] transition-opacity duration-300 ${
          showPulse ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        <span
          className={`absolute rounded-full ${
            showPulse ? "animate-cursor-pulse" : ""
          }`}
          style={{
            width: `${pulseSize}px`,
            height: `${pulseSize}px`,
            marginLeft: `-${pulseSize / 2}px`,
            marginTop: `-${pulseSize / 2}px`,
            border: `1.5px solid ${pulseColor}`,
            boxShadow: `0 0 16px ${pulseColor}66, inset 0 0 8px ${pulseColor}33`,
          }}
        />
        <span
          className={`absolute rounded-full ${
            showPulse ? "animate-cursor-pulse-delay" : ""
          }`}
          style={{
            width: `${pulseSize}px`,
            height: `${pulseSize}px`,
            marginLeft: `-${pulseSize / 2}px`,
            marginTop: `-${pulseSize / 2}px`,
            border: `1px solid ${pulseColor}`,
          }}
        />
        {/* 'Click for More' hint pill. Offset below-right of the cursor
            so it doesn't cover what the visitor is hovering. Slight
            scale-in on appearance for a tasteful entrance. */}
        <span
          className={`absolute font-mono text-[9px] tracking-[0.22em] uppercase whitespace-nowrap text-white px-3 py-1.5 rounded-full backdrop-blur-md bg-black/70 border transition-all duration-300 ease-[var(--ease-out)] ${
            showPulse
              ? "opacity-100 translate-x-0 translate-y-0 scale-100"
              : "opacity-0 translate-x-1 translate-y-1 scale-95"
          }`}
          style={{
            top: `${pulseSize / 2 + 10}px`,
            left: `${pulseSize / 2 + 10}px`,
            borderColor: `${pulseColor}80`,
            boxShadow: `0 4px 16px ${pulseColor}33, 0 0 0 1px ${pulseColor}20`,
          }}
        >
          Click for More
        </span>
      </div>
    </>
  );
}

export default CustomCursor;
