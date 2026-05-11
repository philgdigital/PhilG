"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Aphorism interstitial. Phil-authored one-liners used as editorial
 * breathing moments between sections.
 *
 * Premium / editorial entrance:
 *   - A thin vertical accent line above the text grows from a point
 *     when the section enters the viewport.
 *   - Each character of each line then fades + lifts into place with
 *     a small stagger (22ms per char). The eye reads each line being
 *     "set" letter by letter, like a typewriter for the modern era.
 *   - After the entrance completes, the text sits perfectly still.
 *     No looped shimmer, no mouse-tracking glow, no animated pulse.
 *     The words carry the weight themselves.
 *
 * This intentionally drops the previous shimmer + mouse-glow attempt,
 * which read as gimmicky. Editorial gravity comes from confident
 * stillness, not constant motion.
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

  return (
    <section
      id={id}
      ref={ref}
      className="relative z-10 py-36 md:py-48 px-6 md:px-12 lg:px-24 overflow-hidden"
      style={{
        // Deeper darkness (0.78 vs 0.42) so the aphorism feels like a
        // contained reading moment, with VERY wide fade zones (0→34% in,
        // 66→100% out) so the dark band melts into the surrounding page
        // with no visible top/bottom edge. The previous 18%/82% fade was
        // still readable as a hard transition; widening to 34%/66% means
        // a third of the section is gradient on each side.
        background:
          "linear-gradient(180deg, rgba(2,2,5,0) 0%, rgba(2,2,5,0.78) 34%, rgba(2,2,5,0.78) 66%, rgba(2,2,5,0) 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Thin vertical accent line above the text. Grows from a
            point at the top into a full hairline. Quiet, considered. */}
        <span
          aria-hidden
          className="block mx-auto h-12 md:h-16 w-px bg-gradient-to-b from-transparent via-[#0f62fe]/70 to-transparent mb-10 md:mb-14 origin-top transition-transform duration-[900ms] ease-[var(--ease-out)]"
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
              className="font-serif italic font-light text-5xl md:text-7xl lg:text-8xl text-white/90 leading-[1.1] tracking-tight"
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
                    {char === " " ? " " : char}
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>
    </section>
  );
}
