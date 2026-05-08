"use client";

import Image, { type StaticImageData } from "next/image";

type ParallaxImageProps = {
  src: string | StaticImageData;
  alt: string;
  /** @deprecated kept for compatibility, no longer used */
  speed?: number;
  className?: string;
  priority?: boolean;
};

/**
 * Image rendered with a small static scale-up so the card has gentle
 * dimensionality, but no per-frame parallax. The previous version ran a
 * rAF loop reading getBoundingClientRect every frame, which was the
 * single biggest scroll-time cost on the homepage. Removing it gives
 * scroll back to the browser.
 */
export function ParallaxImage({
  src,
  alt,
  className = "",
  priority = false,
}: ParallaxImageProps) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div className="w-full h-full" style={{ transform: "scale(1.06)" }}>
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
