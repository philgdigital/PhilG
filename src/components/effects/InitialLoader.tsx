"use client";

import { useEffect, useState } from "react";

/**
 * Initial-paint loader. Editorial / mechanical-watch composition.
 *
 * Two concentric circles orbit a central PHIL G. wordmark:
 *   - Outer ring (280px): single IBM-blue dot orbits clockwise at 5s,
 *     four IBM-blue tick marks at 12 / 3 / 6 / 9 o'clock anchor the
 *     composition like a blueprint registration target.
 *   - Inner ring (176px): single emerald dot orbits counter-clockwise
 *     at 3.5s so the two orbits never sync into one coupled motion.
 *   - Center: tracked mono "INITIATING" label, monumental "PHIL G."
 *     wordmark with the shine-text gradient sweep, "2026 SESSION" footer.
 *   - Bottom of screen: mono "SENIOR PRODUCT DESIGN LEADER" label.
 *
 * The composition reads as a precision instrument: deliberate, crafted,
 * measured. Matches the rest of the site's "10x faster, shipped quality"
 * positioning rather than a generic progress bar.
 *
 * Sequence:
 *   1. Server renders the overlay solid (no JS needed for first paint).
 *   2. On mount, wait for window.load + a 700ms floor so the loader
 *      reads as a deliberate moment, not a flash.
 *   3. Trigger a 700ms opacity transition to 0.
 *   4. Set display:none so nothing intercepts pointer/scroll.
 *
 * z-[500] sits above modal (z-[200]) and CustomCursor (z-[298-300]).
 *
 * Fixed composition size (280px) so the tick-mark geometry is
 * predictable; fits any device >= 320px wide. Body scroll is locked
 * during the hold so any layout shift behind the overlay can't cause
 * a scroll glitch when the loader fades.
 */
export function InitialLoader() {
  const [phase, setPhase] = useState<"holding" | "fading" | "done">("holding");

  useEffect(() => {
    let startTimer = 0;
    let fadeTimer = 0;
    const FLOOR_MS = 700;
    const FADE_MS = 700;

    const begin = () => {
      startTimer = window.setTimeout(() => {
        setPhase("fading");
        fadeTimer = window.setTimeout(() => setPhase("done"), FADE_MS);
      }, FLOOR_MS);
    };

    if (document.readyState === "complete") {
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

  useEffect(() => {
    if (phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "done") return null;

  // Fixed geometry. RING_SIZE is the outer ring diameter; INNER_INSET
  // is how far the inner ring is pulled in from the outer rim.
  const RING_SIZE = 280;
  const INNER_INSET = 52;
  // Tick marks sit on the outer rim; offset them outward from center
  // by half the ring size minus a small inset so the tick crosses the
  // border line.
  const TICK_RADIUS = RING_SIZE / 2 - 1;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[500] flex items-center justify-center bg-[#0a0a0c] transition-opacity duration-[700ms] ease-[cubic-bezier(0.33,1,0.68,1)] ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Ambient halo under the composition. Soft IBM-blue glow gives
          depth without a hard light source. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-[#0f62fe]/10 blur-[140px]"
      />

      <div
        className="relative"
        style={{ width: RING_SIZE, height: RING_SIZE }}
      >
        {/* OUTER RING. 1px hairline circle. */}
        <div className="absolute inset-0 rounded-full border border-white/[0.08]" />

        {/* OUTER TICK MARKS at 12 / 3 / 6 / 9 o'clock. Each tick is a
            small horizontal hairline rotated to its cardinal position
            and pushed outward to the rim via translateY. */}
        {[0, 90, 180, 270].map((deg) => (
          <span
            key={`tick-${deg}`}
            aria-hidden
            className="absolute top-1/2 left-1/2 w-[14px] h-px bg-[#0f62fe]/70 shadow-[0_0_6px_rgba(15,98,254,0.55)]"
            style={{
              transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-${TICK_RADIUS}px)`,
            }}
          />
        ))}

        {/* OUTER ORBIT: rotating wrapper containing a single IBM-blue
            dot positioned at 12 o'clock. As the wrapper rotates around
            the composition's center, the dot traces the outer rim. */}
        <div
          aria-hidden
          className="absolute inset-0 motion-safe:animate-[loader-orbit-cw_5s_linear_infinite]"
        >
          <span className="absolute top-0 left-1/2 -ml-[7px] -mt-[7px] w-[14px] h-[14px] rounded-full bg-[#0f62fe] shadow-[0_0_18px_rgba(15,98,254,0.95),0_0_36px_rgba(15,98,254,0.5)]" />
        </div>

        {/* INNER RING. Tighter circle inside the outer. */}
        <div
          className="absolute rounded-full border border-white/[0.06]"
          style={{
            inset: INNER_INSET,
          }}
        />

        {/* INNER ORBIT: emerald dot rotating counter-clockwise at a
            faster cadence so the two rings don't read as coupled. */}
        <div
          aria-hidden
          className="absolute motion-safe:animate-[loader-orbit-ccw_3.5s_linear_infinite]"
          style={{ inset: INNER_INSET }}
        >
          <span className="absolute bottom-0 left-1/2 -ml-[5px] -mb-[5px] w-[10px] h-[10px] rounded-full bg-[#10b981] shadow-[0_0_14px_rgba(16,185,129,0.9),0_0_28px_rgba(16,185,129,0.4)]" />
        </div>

        {/* CENTER: editorial typography stack. Same hierarchy used in
            every page eyebrow (dot + tracked mono uppercase label). */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5">
          <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-500">
            Initiating
          </span>
          <span className="shine-text font-mono text-2xl md:text-3xl font-bold tracking-[0.18em] uppercase">
            PHIL G.
          </span>
          <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-600">
            2026 Session
          </span>
        </div>
      </div>

      {/* Bottom-edge mono label. Positioned absolutely at the page
          bottom so the central composition stays uncluttered. */}
      <span className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-600">
        Senior Product Design Leader
      </span>
    </div>
  );
}

export default InitialLoader;
