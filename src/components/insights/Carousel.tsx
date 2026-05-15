"use client";

import { useRef, useState, useEffect, useCallback } from "react";

/**
 * Article-body carousel. Renders an array of image URLs as a
 * horizontally scrollable, snap-aligned strip with prev/next
 * controls, dot indicators, and a soft brand-wash glow that fades
 * on hover. Carbon Black panel + IBM-blue accent so it visually
 * belongs to the rest of the article chrome.
 *
 * Usage in MDX bodies (inserted by the admin BodyEditor toolbar):
 *
 *   <Carousel images={["/images/a.jpg", "/images/b.jpg"]} />
 *
 * The `images` prop accepts either plain URLs or `{ src, alt }`
 * objects so future captions / accessibility text can extend the
 * shape without breaking already-published bodies. Single-image
 * carousels degrade to a plain framed image (no controls / dots).
 */

type ImageItem = string | { src: string; alt?: string };

type Props = {
  images: ImageItem[];
};

function normalize(item: ImageItem): { src: string; alt: string } {
  if (typeof item === "string") return { src: item, alt: "" };
  return { src: item.src, alt: item.alt ?? "" };
}

export function Carousel({ images }: Props) {
  const items = (images ?? []).map(normalize).filter((it) => !!it.src);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // Sync the active dot with whichever slide is most-visible in the
  // scroll viewport — drives the dot indicator when the visitor
  // swipes/scrolls directly rather than using prev/next buttons.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || items.length <= 1) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const i = Number((visible.target as HTMLElement).dataset.idx ?? -1);
          if (i >= 0) setIndex(i);
        }
      },
      { root: el, threshold: [0.5, 0.75, 1] },
    );
    el.querySelectorAll<HTMLElement>("[data-idx]").forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [items.length]);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const slide = el.querySelector<HTMLElement>(`[data-idx="${i}"]`);
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }, []);

  if (items.length === 0) return null;

  // Single-image fast path: skip carousel chrome entirely.
  if (items.length === 1) {
    const only = items[0];
    return (
      <figure className="my-8 md:my-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={only.src}
          alt={only.alt}
          className="w-full rounded-2xl md:rounded-3xl border border-white/8 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6)] object-cover"
        />
      </figure>
    );
  }

  return (
    <figure className="my-8 md:my-12 relative group">
      {/* Brand-wash corner washes — fade on hover so the imagery
          gets to speak once the visitor's actively reading. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-[2rem] opacity-60 group-hover:opacity-30 transition-opacity duration-700 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 0% 0%, rgba(15,98,254,0.25) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(16,185,129,0.18) 0%, transparent 60%)",
        }}
      />

      <div
        ref={trackRef}
        role="region"
        aria-label="Image carousel"
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-5 scroll-smooth scrollbar-none rounded-2xl md:rounded-3xl"
      >
        {items.map((it, i) => (
          <div
            key={i}
            data-idx={i}
            className="snap-start shrink-0 w-full md:w-[80%] aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden border border-white/8 bg-[#0a0a0c] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.src}
              alt={it.alt}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Prev / Next buttons. Hidden on touch (no hover) so they don't
          steal screen space — swipe is the native gesture there. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-3">
        <button
          type="button"
          aria-label="Previous image"
          data-cursor-no-hint="true"
          onClick={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
          className="pointer-events-auto hover-target w-11 h-11 rounded-full bg-[#0a0a0c]/80 backdrop-blur-md border border-white/15 hover:border-[#0f62fe]/50 hover:bg-[#0f62fe]/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next image"
          data-cursor-no-hint="true"
          onClick={() => goTo(Math.min(items.length - 1, index + 1))}
          disabled={index === items.length - 1}
          className="pointer-events-auto hover-target w-11 h-11 rounded-full bg-[#0a0a0c]/80 backdrop-blur-md border border-white/15 hover:border-[#0f62fe]/50 hover:bg-[#0f62fe]/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="mt-4 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to image ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            data-cursor-no-hint="true"
            onClick={() => goTo(i)}
            className={`hover-target h-1.5 rounded-full transition-all duration-300 ${
              i === index
                ? "w-8 bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.6)]"
                : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </figure>
  );
}
