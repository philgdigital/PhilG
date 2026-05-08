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
    const update = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const centerDist =
          rect.top + rect.height / 2 - window.innerHeight / 2;
        const x = centerDist * speed * direction;
        ref.current.style.transform = `translate3d(${x}px, 0, 0)`;
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
