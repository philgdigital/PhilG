"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  direction?: Direction;
};

const translateMap: Record<Direction, string> = {
  up: "translate-y-6",
  down: "-translate-y-6",
  left: "translate-x-6",
  right: "-translate-x-6",
  none: "translate-y-0 translate-x-0 scale-[0.98]",
};

/** Animation duration in ms. Matches the duration-[800ms] Tailwind class. */
const REVEAL_DURATION_MS = 800;

export function Reveal({
  children,
  className = "",
  delay = 0,
  threshold = 0.1,
  direction = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  // Tracks whether the entry animation is still running. We keep
  // will-change on during the animation, then drop it back to "auto"
  // afterward. Otherwise every revealed element stays promoted to its
  // own GPU layer forever, eating GPU memory with hundreds of mounted
  // Reveals across the page.
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // If the element is already in the viewport on mount, reveal it
    // immediately. Avoids waiting for IntersectionObserver's async
    // callback for above-the-fold content.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      setAnimating(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setAnimating(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" },
    );
    observer.observe(node);
    return () => observer.unobserve(node);
  }, [threshold]);

  // Drop will-change once the entry animation finishes. Frees the GPU
  // layer so memory isn't pinned for already-static content.
  useEffect(() => {
    if (!animating) return;
    const t = window.setTimeout(
      () => setAnimating(false),
      REVEAL_DURATION_MS + delay + 50,
    );
    return () => window.clearTimeout(t);
  }, [animating, delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[800ms] ease-[var(--ease-out)] ${
        isVisible
          ? "opacity-100 translate-y-0 translate-x-0 scale-100 blur-none"
          : `opacity-0 blur-[6px] ${translateMap[direction]}`
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        willChange: animating ? "opacity, transform, filter" : "auto",
      }}
    >
      {children}
    </div>
  );
}
