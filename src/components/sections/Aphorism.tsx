"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Aphorism interstitial. Phil-authored one-liners used as editorial
 * breathing moments between sections.
 *
 * Premium / editorial entrance:
 *   - A thin vertical accent line above the text grows from a point
 *     when the section enters the viewport.
 *   - Each character of each line fades + lifts into place with a
 *     small stagger (22ms per char). The eye reads each line being
 *     "set" letter by letter, like a typewriter for the modern era.
 *   - A mirror hairline + IBM-blue accent dot closes the composition
 *     below the text, framing the moment as a deliberate editorial
 *     pause without using border edges.
 *   - After the entrance completes, the text sits perfectly still.
 *     No looped shimmer, no mouse-tracking glow, no animated pulse.
 *
 * The section is INTENTIONALLY tall (py-64+ on desktop). Combined with
 * a wide solid dark zone (18-82% solid, alpha 0.86) the aphorism reads
 * as a real cinematic pause between sections, not a small interlude.
 */

type AphorismProps = {
  /** One short phrase per line. Two lines reads cleanest. */
  lines: string[];
  /** Optional anchor id for the section. */
  id?: string;
};

const STAGGER_MS = 22;
const CHAR_DURATION_MS = 600;

export function Aphorism({ lines, id }: AphorismProps) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already in viewport on mount: reveal immediately.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px 200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Cumulative char index across all lines so the stagger is one
  // continuous wave from the first letter of line 1 to the last
  // letter of line N.
  let cumulativeCharIndex = 0;
  // Pre-compute the total character count so the closing-hairline
  // reveal can wait until after the last character lands.
  const totalChars = lines.reduce((sum, l) => sum + Array.from(l).length, 0);

  return (
    <section
      id={id}
      ref={ref}
      className="relative z-10 py-64 md:py-80 lg:py-96 px-6 md:px-12 lg:px-24 overflow-hidden"
      style={{
        // Tall section (py-64+) combined with WIDE solid darkness
        // (18-82% solid) means the dark band dominates as a real
        // editorial moment, not a soft tinge. The 0-18% and 82-100%
        // fade zones are still wide enough that the band's top +
        // bottom edges are invisible. Alpha bumped to 0.86 so the
        // band reads as a deliberate dark reading surface, not a
        // faint shadow.
        background:
          "linear-gradient(180deg, rgba(2,2,5,0) 0%, rgba(2,2,5,0.86) 18%, rgba(2,2,5,0.86) 82%, rgba(2,2,5,0) 100%)",
      }}
    >
      {/* Soft IBM-blue inner halo behind the text. Wide + low alpha
          so it gives depth to the dark band without introducing color.
          The aphorism floats above a subtle glow rather than flat
          black. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110vw] h-[55vh] rounded-full bg-[#0f62fe]/[0.05] blur-[140px]"
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Thin vertical accent line ABOVE the text. Grows from a
            point at the top into a full hairline. Quiet, considered. */}
        <span
          aria-hidden
          className="block mx-auto h-16 md:h-20 w-px bg-gradient-to-b from-transparent via-[#0f62fe]/70 to-transparent mb-12 md:mb-16 origin-top transition-transform duration-[900ms] ease-[var(--ease-out)]"
          style={{
            transform: revealed ? "scaleY(1)" : "scaleY(0)",
          }}
        />

        {lines.map((line, lineIdx) => {
          const chars = Array.from(line);
          const lineStartIndex = cumulativeCharIndex;
          cumulativeCharIndex += chars.length;
          return (
            <p
              key={lineIdx}
              className="font-serif italic font-light text-5xl md:text-7xl lg:text-[7.5rem] text-white/95 leading-[1.05] tracking-tight"
            >
              {chars.map((char, i) => {
                const globalIdx = lineStartIndex + i;
                const delay = globalIdx * STAGGER_MS;
                return (
                  <span
                    key={i}
                    className="inline-block transition-[opacity,transform] ease-[var(--ease-out)]"
                    style={{
                      opacity: revealed ? 1 : 0,
                      transform: revealed
                        ? "translateY(0)"
                        : "translateY(14px)",
                      transitionDuration: `${CHAR_DURATION_MS}ms`,
                      transitionDelay: `${delay}ms`,
                    }}
                  >
                    {char === " " ? " " : char}
                  </span>
                );
              })}
            </p>
          );
        })}

        {/* Mirror hairline BELOW the text + IBM-blue accent dot. Closes
            the editorial composition: a top hairline above, the words
            in the middle, a bottom hairline + signature dot below.
            Reveals after the last character lands. */}
        <div
          aria-hidden
          className="flex flex-col items-center mt-14 md:mt-20 transition-opacity duration-[900ms] ease-[var(--ease-out)]"
          style={{
            opacity: revealed ? 1 : 0,
            transitionDelay: `${Math.min(totalChars * STAGGER_MS + 200, 1400)}ms`,
          }}
        >
          <span className="block h-16 md:h-20 w-px bg-gradient-to-b from-transparent via-[#0f62fe]/70 to-transparent" />
          <span className="mt-4 w-1.5 h-1.5 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
        </div>
      </div>
    </section>
  );
}
