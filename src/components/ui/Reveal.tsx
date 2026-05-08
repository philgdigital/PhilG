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
  up: "translate-y-12",
  down: "-translate-y-12",
  left: "translate-x-12",
  right: "-translate-x-12",
  none: "translate-y-0 translate-x-0 scale-95",
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  threshold = 0.1,
  direction = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" },
    );
    observer.observe(node);
    return () => observer.unobserve(node);
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? "opacity-100 translate-y-0 translate-x-0 scale-100 blur-none"
          : `opacity-0 blur-[12px] ${translateMap[direction]}`
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  );
}
