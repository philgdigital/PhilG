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
  maxRotation = 6,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Cache the bounding rect on mouseenter instead of reading it on
  // every mousemove. The card doesn't move while the cursor is inside
  // it (hover usually pauses scroll). Saves a getBoundingClientRect
  // call per mousemove, which fires 60-120 times/sec during hover and
  // each call can force a layout flush if anything is dirty.
  const rectRef = useRef<DOMRect | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) rectRef.current = ref.current.getBoundingClientRect();
    handleMouseMove(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    const rect = rectRef.current;
    if (!node || !rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateX = -y * maxRotation;
    const rotateY = x * maxRotation;
    node.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
  };

  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = RESET_TRANSFORM;
    rectRef.current = null;
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={`transition-transform duration-300 ease-[var(--ease-out)] will-change-transform ${className}`}
      style={{ transform: RESET_TRANSFORM }}
    >
      {children}
    </div>
  );
}
