"use client";

import { useEffect, useRef, type ReactNode } from "react";

type MagneticTextProps = {
  /** The string to render. Each character is wrapped in a reactive span. */
  children: string;
  /** Outer element class names (sizing, color, etc.). */
  className?: string;
  /** Pixel radius of the cursor force field. */
  range?: number;
  /** Maximum displacement per character in pixels. */
  maxOffset?: number;
  /** Optional element to render before the text (e.g. an icon span). */
  prefix?: ReactNode;
  /** Optional element after the text. */
  suffix?: ReactNode;
};

/**
 * Hero-grade typographic effect: each character is pushed away from the
 * cursor when it enters a force field around it. Heroes that React to the
 * cursor look like Apple's marketing pages and Awwwards SOTY winners.
 *
 * Implementation:
 *   - Wrap each char in an `inline-block` span with a 300ms ease-out
 *     transform transition (snap-back is smooth when cursor leaves).
 *   - Cache each span's center on mount + scroll/resize so the rAF
 *     loop only does cheap distance math, never DOM reads.
 *   - On every frame, compute distance from cursor to each span's center,
 *     ease-in the displacement within `range`, and push along the angle
 *     from cursor to char.
 */
export function MagneticText({
  children,
  className = "",
  range = 200,
  maxOffset = 14,
  prefix,
  suffix,
}: MagneticTextProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const chars = Array.from(
      wrapper.querySelectorAll<HTMLElement>("[data-mt-char]"),
    );
    if (chars.length === 0) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    type CharRect = { el: HTMLElement; cx: number; cy: number };
    let positions: CharRect[] = [];
    let mouseX = -10000;
    let mouseY = -10000;
    let raf = 0;

    const refresh = () => {
      positions = chars.map((el) => {
        const r = el.getBoundingClientRect();
        return { el, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const tick = () => {
      const r = range;
      const m = maxOffset;
      for (const { el, cx, cy } of positions) {
        const dx = cx - mouseX;
        const dy = cy - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > r) {
          el.style.transform = "";
          continue;
        }
        const t = 1 - dist / r;
        const eased = t * t; // ease-in: only "wake up" when cursor is close
        // Push character AWAY from cursor.
        const angle = Math.atan2(dy, dx);
        const ox = Math.cos(angle) * eased * m;
        const oy = Math.sin(angle) * eased * m;
        el.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf === 0) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    refresh();
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      // Reset transforms so the unmount state matches first paint.
      chars.forEach((el) => {
        el.style.transform = "";
      });
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", refresh);
      window.removeEventListener("resize", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [range, maxOffset]);

  // Split into characters. Spaces become &nbsp; so width is preserved.
  const characters = Array.from(children);

  return (
    <span ref={wrapperRef} className={className}>
      {prefix}
      {characters.map((ch, i) => (
        <span
          key={`${i}-${ch}`}
          data-mt-char=""
          aria-hidden={ch === " "}
          className="inline-block transition-transform duration-300 ease-out will-change-transform"
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
      {suffix}
    </span>
  );
}
