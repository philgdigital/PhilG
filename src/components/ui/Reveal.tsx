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

// Translate distance is now 2 (8px) instead of 4 (16px). Smaller motion
// means the entry animation completes visually in less perceived time
// even at the same duration, so content is readable sooner during fast
// scrolls.
const translateMap: Record<Direction, string> = {
  up: "translate-y-2",
  down: "-translate-y-2",
  left: "translate-x-2",
  right: "-translate-x-2",
  none: "translate-y-0 translate-x-0 scale-[0.99]",
};

/** Animation duration in ms. Matches the duration-[350ms] Tailwind class.
    Was 450ms; tightened to 350ms so reveals complete sooner during scroll. */
const REVEAL_DURATION_MS = 350;

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

    // Fire VERY EARLY: rootMargin extends the viewport TWO full
    // viewport-heights below the visible bottom (200% in vmin units)
    // so reveals start before they're anywhere near the fold. Combined
    // with threshold 0 (fire on any pixel cross), the visitor never
    // sees a still-hidden element come into view even on aggressive
    // wheel scrolls. By the time they reach an element it has had
    // 1-2 viewports' worth of scroll time to complete its 350ms entry.
    // The "0px 0px 200% 0px" syntax is valid CSS rootMargin shorthand
    // (% is relative to the root's height, here the window).
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setAnimating(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0, rootMargin: "0px 0px 200% 0px" },
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
      className={`transition-[opacity,transform] duration-[350ms] ease-[var(--ease-out)] ${
        isVisible
          ? "opacity-100 translate-y-0 translate-x-0 scale-100"
          : `opacity-0 ${translateMap[direction]}`
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        willChange: animating ? "opacity, transform" : "auto",
      }}
    >
      {children}
    </div>
  );
}
