"use client";

import { useRef, useState, type ReactNode } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  scale?: number;
  maxRotation?: number;
};

export function TiltCard({
  children,
  className = "",
  scale = 1.02,
  maxRotation = 10,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(
    "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    const rotateX = -y * maxRotation;
    const rotateY = x * maxRotation;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
    );
  };

  const handleMouseLeave = () => {
    setTransform(
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    );
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseMove}
      className={`transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform ${className}`}
      style={{ transform }}
    >
      {children}
    </div>
  );
}
