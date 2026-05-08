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

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
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
    let cursorX = mouseX;
    let cursorY = mouseY;
    let raf = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const render = () => {
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      }
      raf = requestAnimationFrame(render);
    };
    render();

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      setIsHovered(
        !!(
          target.closest(".hover-target") ||
          target.closest("a") ||
          target.closest("button")
        ),
      );
    };
    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isFinePointer]);

  if (!isFinePointer) return null;

  return (
    <>
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 bg-white rounded-full pointer-events-none z-[100] mix-blend-difference transition-transform duration-100 ${
          isClicked ? "scale-50" : "scale-100"
        }`}
        aria-hidden
      />
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[99] rounded-full border border-white/40 mix-blend-difference transition-all duration-300 ease-out ${
          isHovered
            ? "w-24 h-24 -ml-12 -mt-12 bg-white/10 backdrop-blur-sm scale-150"
            : "w-10 h-10 -ml-5 -mt-5 scale-100"
        } ${isClicked && isHovered ? "scale-125 bg-white/30" : ""}`}
        aria-hidden
      />
    </>
  );
}

export default CustomCursor;
