"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ScrollTransformProps = {
  children: ReactNode;
  direction?: 1 | -1;
  speed?: number;
  className?: string;
};

export function ScrollTransform({
  children,
  direction = 1,
  speed = 0.5,
  className = "",
}: ScrollTransformProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;
    let lastX = Number.NaN;
    const node = ref.current;
    if (!node) return;

    const update = () => {
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;

      // Off-screen skip: when the element is more than one viewport
      // away above OR below, the transform is invisible anyway —
      // bail before the layout read so we don't burn CPU on a
      // section the visitor isn't looking at. Previous version
      // read the rect + wrote the transform every frame regardless
      // of viewport position, which on long pages with many of
      // these wrappers was a measurable scroll-time cost.
      if (rect.bottom < -vh * 0.5 || rect.top > vh * 1.5) {
        rafId = requestAnimationFrame(update);
        return;
      }

      const centerDist = rect.top + rect.height / 2 - vh / 2;
      const x = centerDist * speed * direction;
      // Skip the DOM write when the value hasn't materially changed
      // (visitor sitting still). 0.5px is below sub-pixel rendering
      // threshold on standard 1x displays.
      if (Math.abs(x - lastX) > 0.5) {
        lastX = x;
        node.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      rafId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(rafId);
  }, [speed, direction]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
