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
    const node = ref.current;
    if (!node) return;

    let rafId = 0;

    const apply = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const centerDist = rect.top + rect.height / 2 - window.innerHeight / 2;
        const x = centerDist * speed * direction;
        ref.current.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      rafId = requestAnimationFrame(apply);
    };

    const start = () => {
      if (rafId === 0) rafId = requestAnimationFrame(apply);
    };
    const stop = () => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    // Run continuously while in or near the viewport for smooth motion;
    // stop entirely when scrolled away to free up CPU.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);

    // Sync initial transform before the IO callback fires so there is no
    // first-paint jump.
    apply();

    const onVisibility = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [speed, direction]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
