"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Aphorism interstitial. Phil-authored one-liners used as editorial
 * breathing moments between sections.
 *
 * Visual interactivity:
 *   - Continuous shimmer: a slow IBM-blue highlight sweeps across the
 *     letters every ~7s, giving the text a sense of being lit from
 *     within.
 *   - Mouse-tracking glow: while the visitor's cursor is inside the
 *     section, a radial gradient (blue -> emerald -> transparent)
 *     follows the cursor, painting a halo behind the text.
 *   - Per-line entry: each line reveals with a staggered Reveal on
 *     scroll into view.
 *   - Pulse dot: the accent dot below the text animates a soft pulse.
 *
 * Pattern borrowed from end.game's punchy aphorisms but rendered with
 * Phil's voice and the site's IBM Blue + Emerald palette.
 */

type AphorismProps = {
  /** One short phrase per line. Two lines reads cleanest. */
  lines: string[];
  /** Optional anchor id for the section. */
  id?: string;
};

export function Aphorism({ lines, id }: AphorismProps) {
  const sectionRef = useRef<HTMLElement>(null);
  // Mouse position relative to the section (used to drive the radial
  // glow behind the text). Defaults far off-screen so the glow is
  // invisible until the cursor enters.
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let raf = 0;
    let pendingX = 0;
    let pendingY = 0;
    let hasPending = false;

    const flush = () => {
      raf = 0;
      if (!hasPending) return;
      hasPending = false;
      setMousePos({ x: pendingX, y: pendingY });
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      pendingX = e.clientX - rect.left;
      pendingY = e.clientY - rect.top;
      hasPending = true;
      if (raf === 0) raf = requestAnimationFrame(flush);
    };
    const onEnter = () => setHovering(true);
    const onLeave = () => {
      setHovering(false);
      setMousePos({ x: -1000, y: -1000 });
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      if (raf !== 0) cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.42) 18%, rgba(0,0,0,0.42) 82%, rgba(0,0,0,0) 100%)",
      }}
    >
      {/* Mouse-following gradient glow. Sits behind the text. Blue at
          the cursor, fading to emerald at edge, then fully transparent.
          Opacity goes from 0 to 1 on enter, smoothly. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: hovering ? 1 : 0,
          background: `radial-gradient(520px circle at ${mousePos.x}px ${mousePos.y}px, rgba(15,98,254,0.28), rgba(16,185,129,0.12) 35%, transparent 65%)`,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {lines.map((line, i) => (
          <Reveal key={i} delay={i * 180}>
            <p className="aphorism-shimmer font-serif italic font-light text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight">
              {line}
            </p>
          </Reveal>
        ))}

        <Reveal delay={lines.length * 180 + 100}>
          <span
            aria-hidden
            className="block mx-auto mt-10 md:mt-14 w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_14px_rgba(15,98,254,0.85)] animate-pulse"
          />
        </Reveal>
      </div>
    </section>
  );
}
