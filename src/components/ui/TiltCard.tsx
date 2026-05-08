"use client";

import { useRef, type ReactNode } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  scale?: number;
  maxRotation?: number;
};

const RESET_TRANSFORM =
  "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";

export function TiltCard({
  children,
  className = "",
  scale = 1.02,
  maxRotation = 10,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Direct DOM updates — no React state per mousemove (was 60-120 re-renders/sec).
  // Rect read per move is cheap (layout is already up-to-date during hover) and
  // stays correct if the page scrolls while the cursor is over the card.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateX = -y * maxRotation;
    const rotateY = x * maxRotation;
    node.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
  };

  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = RESET_TRANSFORM;
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseMove}
      className={`transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform ${className}`}
      style={{ transform: RESET_TRANSFORM }}
    >
      {children}
    </div>
  );
}
