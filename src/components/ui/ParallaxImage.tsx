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
    const wrapper = wrapperRef.current;
    const inner = imgWrapperRef.current;
    if (!wrapper || !inner) return;

    let rafId = 0;

    const apply = () => {
      if (wrapperRef.current && imgWrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const distFromCenter =
          rect.top + rect.height / 2 - window.innerHeight / 2;
        imgWrapperRef.current.style.transform = `translate3d(0, ${distFromCenter * speed}px, 0) scale(1.15)`;
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(wrapper);

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
