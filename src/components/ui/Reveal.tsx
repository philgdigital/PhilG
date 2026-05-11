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

// Translate distance: 5 (20px) so the entry motion is genuinely
// visible. Earlier 2 (8px) was so small the animation felt absent.
const translateMap: Record<Direction, string> = {
  up: "translate-y-5",
  down: "-translate-y-5",
  left: "translate-x-5",
  right: "-translate-x-5",
  none: "translate-y-0 translate-x-0 scale-[0.97]",
};

/** Animation duration in ms. Matches the duration-[600ms] Tailwind class.
    600ms is long enough that the motion reads as a deliberate reveal
    (not a flash) but short enough to complete well within the time a
    visitor takes to scroll past the element. */
const REVEAL_DURATION_MS = 600;

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

    // Fire WHEN THE ELEMENT IS IN FOCUS, i.e., as it first enters
    // the viewport, not 80% ahead of time. The 80% lookahead was
    // doing the animation before the visitor's eye reached the
    // element, so by the time they saw it the motion was already
    // over. With rootMargin "0px 0px -8% 0px" the observer fires
    // when ~8% of the element is inside the viewport (i.e., just as
    // it crosses into focus). The 600ms entry then runs WHILE the
    // visitor is reading it scroll into the screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setAnimating(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
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
      className={`transition-[opacity,transform] duration-[600ms] ease-[var(--ease-out)] ${
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
