"use client";

import { useEffect, useState } from "react";

/**
 * Initial-paint loader.
 *
 * Hides the page behind a Carbon-Black overlay for ~700-900ms while the
 * browser settles: web-fonts swap in (display: swap), the
 * AnimatedGradientBackground's blurred orbs raster to their GPU layer,
 * Reveal observers register, and the first scroll snap settles. Without
 * this, the first second of the page reads as 'system font then real
 * font' + 'flat then gradient' + 'instant then animated', three
 * visible flickers stacked on top of each other.
 *
 * Sequence:
 *   1. Server renders the overlay solid (no JS needed for SSR paint).
 *   2. On mount, wait until the page is interactive (next animation
 *      frame after `load` so first paint + first layout pass are
 *      committed) + a small floor of 500ms so the overlay reads as
 *      a deliberate moment, not a flash.
 *   3. Trigger a 600ms opacity transition to 0.
 *   4. After the transition, set `display:none` so the loader stops
 *      capturing any pointer/scroll events.
 *
 * Visual: Carbon-Black bg, centered "PHIL G." wordmark in IBM Plex Mono,
 * a single thin IBM-blue progress hairline that grows left to right. No
 * spinner, no logo animation. Quiet and editorial.
 *
 * z-[500] sits above the modal layer (z-[200]) and CustomCursor
 * (z-[298-300]) so absolutely nothing is interactable during the hold.
 */
export function InitialLoader() {
  const [phase, setPhase] = useState<"holding" | "fading" | "done">("holding");

  useEffect(() => {
    // Wait for the browser to finish initial layout + paint before
    // starting the fade. window.load fires after stylesheets, fonts,
    // and same-page images have resolved. requestAnimationFrame inside
    // the load handler ensures the first frame has been committed.
    let startTimer = 0;
    let fadeTimer = 0;
    const FLOOR_MS = 500; // minimum hold even if load fires instantly
    const FADE_MS = 600;

    const begin = () => {
      // After the load event + one rAF, set a floor so the loader is
      // always visible long enough to read as a moment.
      startTimer = window.setTimeout(() => {
        setPhase("fading");
        fadeTimer = window.setTimeout(() => setPhase("done"), FADE_MS);
      }, FLOOR_MS);
    };

    if (document.readyState === "complete") {
      // load already fired (cached navigation, fast connection). Still
      // schedule via rAF so we don't fight the same frame as React's
      // initial commit.
      requestAnimationFrame(begin);
    } else {
      const onLoad = () => requestAnimationFrame(begin);
      window.addEventListener("load", onLoad, { once: true });
      return () => {
        window.removeEventListener("load", onLoad);
        window.clearTimeout(startTimer);
        window.clearTimeout(fadeTimer);
      };
    }

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(fadeTimer);
    };
  }, []);

  // Lock body scroll while the loader is visible so any layout work
  // happening underneath doesn't cause a scroll-snap glitch.
  useEffect(() => {
    if (phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[500] flex items-center justify-center bg-[#0a0a0c] transition-opacity duration-[600ms] ease-[cubic-bezier(0.33,1,0.68,1)] ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Wordmark + hairline progress. Both fade out together with the
          overlay. The hairline is a sub-pixel-thick IBM-blue line that
          grows from 0 to full width across the hold, giving the eye a
          deliberate cadence to follow. */}
      <div className="flex flex-col items-center gap-6">
        <span className="font-mono text-[11px] md:text-xs font-medium tracking-[0.32em] uppercase text-zinc-400">
          PHIL G.
        </span>
        <span
          aria-hidden
          className="block h-px w-[140px] md:w-[180px] overflow-hidden bg-white/5"
        >
          <span
            className={`block h-px bg-gradient-to-r from-transparent via-[#0f62fe] to-transparent transition-transform duration-[900ms] ease-[cubic-bezier(0.33,1,0.68,1)] ${
              phase === "fading"
                ? "translate-x-0 scale-x-100"
                : "-translate-x-full scale-x-100"
            }`}
            style={{ transformOrigin: "left center" }}
          />
        </span>
      </div>
    </div>
  );
}

export default InitialLoader;
