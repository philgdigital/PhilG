"use client";

import { useEffect, useRef } from "react";
import Image, { type StaticImageData } from "next/image";

type ParallaxImageProps = {
  src: string | StaticImageData;
  alt: string;
  speed?: number;
  className?: string;
  priority?: boolean;
};

export function ParallaxImage({
  src,
  alt,
  speed = 0.15,
  className = "",
  priority = false,
}: ParallaxImageProps) {
  const imgWrapperRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;
    const updateParallax = () => {
      if (imgWrapperRef.current && wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const distFromCenter =
          rect.top + rect.height / 2 - window.innerHeight / 2;
        imgWrapperRef.current.style.transform = `translate3d(0, ${distFromCenter * speed}px, 0) scale(1.15)`;
      }
      rafId = requestAnimationFrame(updateParallax);
    };
    updateParallax();
    return () => cancelAnimationFrame(rafId);
  }, [speed]);

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
    >
      <div ref={imgWrapperRef} className="w-full h-full will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          priority={priority}
          className={`object-cover ${className}`}
        />
      </div>
    </div>
  );
}
