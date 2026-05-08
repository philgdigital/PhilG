"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

const subscribeFinePointer = (callback: () => void) => {
  if (typeof window === "undefined") return () => undefined;
  const mq = window.matchMedia(FINE_POINTER_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
};

const getFinePointerSnapshot = () =>
  typeof window === "undefined"
    ? false
    : window.matchMedia(FINE_POINTER_QUERY).matches;

const getFinePointerServerSnapshot = () => false;

const MAGNETIC_RANGE = 90; // px from element edge to start pulling
const MAGNETIC_STRENGTH = 0.32; // 0-1, how much the element follows the cursor

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [hoverState, setHoverState] = useState<"idle" | "link" | "card">(
    "idle",
  );
  const [isClicked, setIsClicked] = useState(false);

  const isFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot,
  );

  useEffect(() => {
    if (!isFinePointer) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;
    let lastHover: "idle" | "link" | "card" = "idle";

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

    const render = () => {
      const { pullX, pullY } = applyMagnetism(mouseX, mouseY);
      const targetX = mouseX + pullX;
      const targetY = mouseY + pullY;
      ringX += (targetX - ringX) * 0.22;
      ringY += (targetY - ringY) * 0.22;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
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
    const onScrollOrResize = () => refreshTargets();

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      magneticTargets.forEach((t) => {
        t.style.transform = "";
      });
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
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

  return (
    <>
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-1 h-1 -ml-0.5 -mt-0.5 bg-white rounded-full pointer-events-none z-[100] mix-blend-difference transition-transform duration-100 ${
          isClicked ? "scale-50" : "scale-100"
        }`}
        aria-hidden
      />
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[99] rounded-full transition-[width,height,margin,border-color,background-color,transform] duration-300 ease-out ${ringSize} ${ringStyle} ${ringScale}`}
        aria-hidden
      />
    </>
  );
}

export default CustomCursor;
