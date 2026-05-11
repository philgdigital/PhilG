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

export function Aphorism({ lines, id }: AphorismProps) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  // `postEntry` flips on after the per-char stagger has completed.
  // It gates the CONTINUOUS animation (char wave + line shimmer +
  // dot pulse) so those motions only kick in once the entry has
  // landed. Without this gate the entry transitions would fight
  // the keyframe animation for control of transform/opacity.
  const [postEntry, setPostEntry] = useState(false);

  // Compute total chars upfront so the post-entry timer is correct.
  const totalChars = lines.reduce(
    (sum, l) => sum + Array.from(l).length,
    0,
  );

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

  // Once revealed, schedule the continuous post-entry motion to
  // start AFTER the slowest character finishes its entrance.
  useEffect(() => {
    if (!revealed) return;
    const totalEntryMs =
      totalChars * STAGGER_MS + CHAR_DURATION_MS + 150;
    const t = window.setTimeout(() => setPostEntry(true), totalEntryMs);
    return () => window.clearTimeout(t);
  }, [revealed, totalChars]);

  // Cumulative char index across all lines so the stagger is one
  // continuous wave from the first letter of line 1 to the last
  // letter of line N. Pre-computed once per render (immutable array
  // lookups inside the render below) so we don't reassign a render-
  // scoped variable; that pattern trips React's render-immutability
  // lint rule.
  const lineStartIndices = lines.reduce<number[]>((acc, line, i) => {
    if (i === 0) {
      acc.push(0);
    } else {
      acc.push(acc[i - 1] + Array.from(lines[i - 1]).length);
    }
    return acc;
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className="relative z-10 py-24 md:py-32 lg:py-40 px-6 md:px-12 lg:px-24 overflow-hidden"
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

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Thin vertical accent line ABOVE the text. After the entry
            scaleY animation completes, a continuous slow shimmer
            cycles its inner gradient brightness so the line stays
            visually alive instead of going static. */}
        <span
          aria-hidden
          className={`block mx-auto h-16 md:h-20 w-px bg-gradient-to-b from-transparent via-[#0f62fe]/70 to-transparent mb-12 md:mb-16 origin-top transition-transform duration-[900ms] ease-[var(--ease-out)] ${
            postEntry ? "aphorism-line-shimmer" : ""
          }`}
          style={{
            transform: revealed ? "scaleY(1)" : "scaleY(0)",
          }}
        />

        {lines.map((line, lineIdx) => {
          // Split the line into WORDS (preserving whitespace as its
          // own token via the capture group). Each word becomes a
          // single inline-block group with whitespace:nowrap so the
          // per-character spans inside can never break MID-WORD.
          // Font size capped at lg:text-[6rem] so each line fits on
          // ONE line inside max-w-6xl.
          const tokens = line.split(/(\s+)/).filter((t) => t.length > 0);
          const lineStartIndex = lineStartIndices[lineIdx];
          let cursor = lineStartIndex;
          // Detect lines that should render with a "broken ship"
          // wobble at the WORD level (currently the line about decks
          // not shipping). Each word in such a line gets the
          // aphorism-word-broken class with a per-word delay so the
          // words drift out of phase like floating debris.
          const lineLower = line.toLowerCase();
          const isBrokenLine =
            lineLower.includes("don't ship") ||
            lineLower.includes("dont ship");
          // Tracks the word index inside this line so each broken-
          // word gets a different animation-delay.
          let wordIdxInLine = 0;
          return (
            <p
              key={lineIdx}
              className="font-serif italic font-light text-5xl md:text-7xl lg:text-[6rem] text-white/95 leading-[1.05] tracking-[-0.01em]"
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
                // Words that should render in shades of red instead
                // of the default white -> IBM blue wave. Two triggers:
                // (a) the line is the broken-ship line (every word in
                //     "Decks don't ship." gets red treatment so the
                //     broken ship reads as a "warning / red flag");
                // (b) the specific word is "opinion" anywhere on the
                //     page.
                const wordLower = token
                  .toLowerCase()
                  .replace(/[^a-z]/g, "");
                const isRedWord = isBrokenLine || wordLower === "opinion";
                // Per-word stagger for the broken-ship wobble so
                // adjacent words drift out of phase.
                const brokenDelay = wordIdxInLine * 1300;
                wordIdxInLine += 1;
                return (
                  <span
                    key={`w-${tokenIdx}`}
                    className={`inline-block whitespace-nowrap ${
                      isBrokenLine && postEntry
                        ? "aphorism-word-broken"
                        : ""
                    }`}
                    style={
                      isBrokenLine && postEntry
                        ? { animationDelay: `${brokenDelay}ms` }
                        : undefined
                    }
                  >
                    {wordChars.map((char, i) => {
                      const globalIdx = wordStart + i;
                      const delay = globalIdx * STAGGER_MS;
                      // Per-char animation-delay so the wave runs
                      // left-to-right across the line.
                      const waveDelay = globalIdx * 70;
                      // Pick the variant of the wave keyframe based
                      // on whether the word is a "red" word. Red
                      // words cycle through red shades; everything
                      // else cycles through white -> light IBM blue.
                      const waveClass = isRedWord
                        ? "aphorism-char-wave-red"
                        : "aphorism-char-wave";
                      return (
                        <span
                          key={i}
                          className={`inline-block transition-[opacity,transform] ease-[var(--ease-out)] ${
                            postEntry ? waveClass : ""
                          }`}
                          style={{
                            opacity: revealed ? 1 : 0,
                            transform: revealed
                              ? "translateY(0)"
                              : "translateY(22px)",
                            transitionDuration: `${CHAR_DURATION_MS}ms`,
                            transitionDelay: `${delay}ms`,
                            animationDelay: postEntry
                              ? `${waveDelay}ms`
                              : undefined,
                            // Static red base color while the wave
                            // hasn't started yet (pre-entry + during
                            // the entry stagger). Once postEntry is
                            // true the wave keyframe takes over and
                            // animates the color through red shades.
                            color:
                              isRedWord && !postEntry
                                ? "rgba(255, 110, 110, 0.95)"
                                : undefined,
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

        {/* Mirror hairline BELOW the text + IBM-blue accent dot.
            After entrance, the bottom dot continuously pulses (scale
            + glow intensity) and the hairline gets the same shimmer
            class as the top one, so the whole frame breathes. */}
        <div
          aria-hidden
          className="flex flex-col items-center mt-14 md:mt-20 transition-opacity duration-[900ms] ease-[var(--ease-out)]"
          style={{
            opacity: revealed ? 1 : 0,
            transitionDelay: `${Math.min(totalChars * STAGGER_MS + 200, 1400)}ms`,
          }}
        >
          <span
            className={`block h-16 md:h-20 w-px bg-gradient-to-b from-transparent via-[#0f62fe]/70 to-transparent ${
              postEntry ? "aphorism-line-shimmer" : ""
            }`}
          />
          <span
            className={`mt-4 w-1.5 h-1.5 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)] ${
              postEntry ? "aphorism-dot-pulse" : ""
            }`}
          />
        </div>
      </div>
    </section>
  );
}
