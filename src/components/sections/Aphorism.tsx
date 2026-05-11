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
 *
 * The section is INTENTIONALLY tall (py-64+ on desktop). Combined with
 * a wide solid dark zone (18-82% solid, alpha 0.86) the aphorism reads
 * as a real cinematic pause between sections, not a small interlude.
 *
 * SPACES BUG: inline-block spans containing a single regular space
 * collapse to zero width because the browser treats their content as
 * inline-level whitespace that follows the parent's whitespace rules.
 * The character renderer below MUST emit a non-breaking space (U+00A0)
 * for space characters so each word break has a guaranteed width.
 * Without this the per-character reveal renders "Shipped is truth"
 * as "Shippedistruth".
 */

type AphorismProps = {
  /** One short phrase per line. Two lines reads cleanest. */
  lines: string[];
  /** Optional anchor id for the section. */
  id?: string;
};

// Visible, dramatic per-character entrance with a chunky lift +
// generous fade. STAGGER_MS 16 spreads the wave so the eye reads
// each character settle one after the other (vs 12 which was nearly
// simultaneous). CHAR_DURATION 520 gives each char a long enough
// fade-up that the entrance feels deliberate. Full reveal of the
// longest aphorism (38 chars) lands in ~1.13s + 80% viewport
// rootMargin = ~1.4s of total visible window. The visitor reaches
// the section just as the last letter settles.
const STAGGER_MS = 16;
const CHAR_DURATION_MS = 520;
// Non-breaking space. Use this for any " " character inside an
// inline-block span; a regular space collapses to zero width in that
// layout context.
const NBSP = " ";

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

    // Fire when the section is IN FOCUS (just crosses into the
    // viewport), so the per-character entrance happens while the
    // visitor is watching it scroll in, not before. Matches Reveal's
    // rootMargin for a consistent reveal rhythm site-wide.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Cumulative char index across all lines so the stagger is one
  // continuous wave from the first letter of line 1 to the last
  // letter of line N.
  let cumulativeCharIndex = 0;
  const totalChars = lines.reduce((sum, l) => sum + Array.from(l).length, 0);

  return (
    <section
      id={id}
      ref={ref}
      className="relative z-10 py-40 md:py-52 lg:py-64 px-6 md:px-12 lg:px-24 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(2,2,5,0) 0%, rgba(2,2,5,0.86) 18%, rgba(2,2,5,0.86) 82%, rgba(2,2,5,0) 100%)",
      }}
    >
      {/* Soft IBM-blue inner halo behind the text. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110vw] h-[55vh] rounded-full bg-[#0f62fe]/[0.05] blur-[140px]"
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Thin vertical accent line ABOVE the text. */}
        <span
          aria-hidden
          className="block mx-auto h-16 md:h-20 w-px bg-gradient-to-b from-transparent via-[#0f62fe]/70 to-transparent mb-12 md:mb-16 origin-top transition-transform duration-[900ms] ease-[var(--ease-out)]"
          style={{
            transform: revealed ? "scaleY(1)" : "scaleY(0)",
          }}
        />

        {lines.map((line, lineIdx) => {
          // Split the line into WORDS (preserving whitespace as its
          // own token via the capture group). Each word becomes a
          // single inline-block group with whitespace:nowrap so the
          // per-character spans inside can never break MID-WORD.
          // Before this fix the browser was free to wrap "optics."
          // between "optic" and "s." since every char was its own
          // inline-block. Now words are atomic; only whitespace
          // tokens are wrap points.
          const tokens = line.split(/(\s+)/).filter((t) => t.length > 0);
          const lineStartIndex = cumulativeCharIndex;
          cumulativeCharIndex += Array.from(line).length;
          let cursor = lineStartIndex;
          return (
            <p
              key={lineIdx}
              className="font-serif italic font-light text-5xl md:text-7xl lg:text-[7.5rem] text-white/95 leading-[1.05] tracking-tight"
            >
              {tokens.map((token, tokenIdx) => {
                // Whitespace token: render as a non-breaking space
                // glyph (so it always has width) BUT keep it as a
                // normal inline span (not inline-block), which is the
                // only wrap point in the line.
                if (/^\s+$/.test(token)) {
                  const span = (
                    <span key={`ws-${tokenIdx}`}> </span>
                  );
                  cursor += token.length;
                  return span;
                }
                // Word token: inline-block wrapper with whitespace-
                // nowrap so the chars inside stay glued together.
                const wordChars = Array.from(token);
                const wordStart = cursor;
                cursor += wordChars.length;
                return (
                  <span
                    key={`w-${tokenIdx}`}
                    className="inline-block whitespace-nowrap"
                  >
                    {wordChars.map((char, i) => {
                      const globalIdx = wordStart + i;
                      const delay = globalIdx * STAGGER_MS;
                      return (
                        <span
                          key={i}
                          className="inline-block transition-[opacity,transform] ease-[var(--ease-out)]"
                          style={{
                            opacity: revealed ? 1 : 0,
                            transform: revealed
                              ? "translateY(0)"
                              : "translateY(22px)",
                            transitionDuration: `${CHAR_DURATION_MS}ms`,
                            transitionDelay: `${delay}ms`,
                          }}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </span>
                );
              })}
            </p>
          );
        })}

        {/* Mirror hairline BELOW the text + IBM-blue accent dot. */}
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
