"use client";

import { useEffect, useRef, useState } from "react";
import { projects } from "@/lib/projects";
import { insights } from "@/lib/insights";

/**
 * Initial-paint loader. Editorial / mechanical-watch composition that
 * doubles as a brand reel.
 *
 * GEOMETRY
 *   - Outer 280px hairline ring + four IBM-blue tick marks at the
 *     cardinal positions (registration target / blueprint feel).
 *   - Inner 176px concentric hairline ring.
 *   - IBM-blue dot orbits the outer rim clockwise at 5s.
 *   - Emerald dot orbits the inner rim counter-clockwise at 3.5s
 *     (5 / 3.5 ratio keeps the two orbits visually independent).
 *
 * BRAND REEL
 *   - Step counter at top: "01 / 04" -> "02 / 04" -> ... advances
 *     with the cycling service.
 *   - Center wordmark "PHIL G." with the shine-text gradient sweep.
 *   - Cycling service label below: DISCOVERY -> AI-PROTOTYPING ->
 *     PRODUCT DESIGN -> SHIPPING. Each phrase holds 900ms then the
 *     next fades in over it via key-based remount.
 *   - The cycle loops if resources are still loading; it always
 *     completes at least one full pass before the loader fades.
 *
 * READINESS GATES
 *   Before fading out, the loader waits for:
 *     1. document.readyState === "complete" (HTML + stylesheets +
 *        in-page images loaded)
 *     2. document.fonts.ready (IBM Plex Sans + Mono actually painted)
 *     3. Decode of all project + insight images so they're warm in
 *        the browser's image cache when the visitor scrolls to them
 *     4. Two animation frames (first paint committed + frame stable)
 *     5. requestIdleCallback (CPU truly idle, not still hydrating)
 *     6. At least one full word cycle completed (3.6s minimum so the
 *        brand reel is always seen end-to-end)
 *   Ceiling: 9s. If gates haven't resolved by then, fade anyway.
 *
 * Body scroll is locked while the loader is visible so any layout
 * shift behind it can't cause a glitch when the loader leaves.
 * z-[500] sits above modal (z-[200]) and CustomCursor (z-[298-300]).
 */

/** Service phases cycled in the brand reel. */
const PHASES = [
  "Discovery",
  "AI-Prototyping",
  "Product Design",
  "Shipping",
] as const;

/** ms each phase is visible before advancing to the next. */
const PHASE_DURATION_MS = 900;

/** Hard ceiling on the full hold (gates + cycle). After this, fade. */
const CEILING_MS = 9000;

/** Hard ceiling on the image-decode step alone. */
const IMAGE_TIMEOUT_MS = 4000;

/** Duration of the fade-out CSS transition. */
const FADE_MS = 700;

/**
 * Build the deduplicated list of image URLs the visitor will encounter
 * as they scroll. Pre-decoding these during the loader puts them in
 * the browser's image cache so the first scroll past Work + Insights
 * doesn't trigger image decode jank.
 */
function getCriticalImages(): string[] {
  const set = new Set<string>();
  projects.forEach((p) => set.add(p.img));
  insights.forEach((i) => set.add(i.image));
  return Array.from(set);
}

/**
 * Decode a single image. Resolves on success or failure (we never
 * want a 404 to block the loader). decode() is preferred because it
 * fully rasterizes the image off-thread; onload fires before decode
 * is necessarily complete.
 */
function decodeImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    const settle = () => resolve();
    img.onload = () => {
      if (typeof img.decode === "function") {
        img.decode().then(settle, settle);
      } else {
        settle();
      }
    };
    img.onerror = settle;
    img.src = src;
  });
}

/** Wait two animation frames (commit + stable). */
function nextTwoFrames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => resolve()),
    );
  });
}

/** Wait for the browser's idle window (best-effort). */
function whenIdle(timeout = 800): Promise<void> {
  return new Promise((resolve) => {
    const ric = (
      window as unknown as {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number },
        ) => number;
      }
    ).requestIdleCallback;
    if (typeof ric === "function") {
      ric(() => resolve(), { timeout });
    } else {
      window.setTimeout(resolve, Math.min(timeout, 200));
    }
  });
}

export function InitialLoader() {
  const [phase, setPhase] = useState<"holding" | "fading" | "done">(
    "holding",
  );
  const [phaseIdx, setPhaseIdx] = useState(0);
  /** Resources fully loaded? Set true by the readiness check. */
  const readyRef = useRef(false);
  /** Has the brand reel completed at least one full pass? */
  const cycledOnceRef = useRef(false);

  // RESOURCE READINESS PIPELINE
  // Runs once on mount. Walks through every gate, then sets readyRef.
  // The phase-cycling effect below decides when to actually start the
  // fade based on readyRef + cycledOnceRef.
  useEffect(() => {
    let cancelled = false;
    let ceilingTimer = 0;

    const tryFade = () => {
      if (cancelled) return;
      if (!readyRef.current) return;
      if (!cycledOnceRef.current) return;
      setPhase("fading");
      window.setTimeout(() => {
        if (!cancelled) setPhase("done");
      }, FADE_MS);
    };

    // Hard ceiling: never block the page longer than CEILING_MS.
    // Sets ready + cycled true so the next tryFade() fires.
    ceilingTimer = window.setTimeout(() => {
      readyRef.current = true;
      cycledOnceRef.current = true;
      tryFade();
    }, CEILING_MS);

    (async () => {
      // 1. window.load (HTML + stylesheets + in-page images)
      if (document.readyState !== "complete") {
        await new Promise<void>((resolve) => {
          window.addEventListener("load", () => resolve(), { once: true });
        });
      }
      if (cancelled) return;

      // 2. Web fonts ready (IBM Plex Sans + Mono painted)
      try {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
      } catch {
        // Some browsers (very old Safari) don't expose fonts.ready.
        // Don't block on missing API.
      }
      if (cancelled) return;

      // 3. Decode all project + insight images. Time-boxed so a slow
      //    image can't hold the whole page hostage.
      const images = getCriticalImages();
      await Promise.race([
        Promise.all(images.map(decodeImage)),
        new Promise<void>((r) => window.setTimeout(r, IMAGE_TIMEOUT_MS)),
      ]);
      if (cancelled) return;

      // 4. Two animation frames so first paint is committed +
      //    the orb GPU layers have rasterized.
      await nextTwoFrames();
      if (cancelled) return;

      // 5. CPU idle window (best-effort)
      await whenIdle(800);
      if (cancelled) return;

      readyRef.current = true;
      window.clearTimeout(ceilingTimer);
      tryFade();
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(ceilingTimer);
    };
  }, []);

  // BRAND-REEL PHASE CYCLE
  // Advances through PHASES every PHASE_DURATION_MS. Loops back to 0
  // until the resources are ready, then completes the current word
  // and triggers the fade.
  useEffect(() => {
    if (phase !== "holding") return;
    const t = window.setTimeout(() => {
      const nextIdx = (phaseIdx + 1) % PHASES.length;
      if (nextIdx === 0) cycledOnceRef.current = true;
      // If we've finished a full cycle AND resources are ready, fade
      // instead of advancing further.
      if (cycledOnceRef.current && readyRef.current) {
        setPhase("fading");
        window.setTimeout(() => setPhase("done"), FADE_MS);
        return;
      }
      setPhaseIdx(nextIdx);
    }, PHASE_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [phaseIdx, phase]);

  // Lock body scroll while visible.
  useEffect(() => {
    if (phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "done") return null;

  const RING_SIZE = 280;
  const INNER_INSET = 52;
  const TICK_RADIUS = RING_SIZE / 2 - 1;

  // Step counter: 01 / 04, 02 / 04, etc. Mono uppercase.
  const stepLabel = `0${phaseIdx + 1} / 0${PHASES.length}`;
  const currentPhase = PHASES[phaseIdx];

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[500] flex items-center justify-center bg-[#0a0a0c] transition-opacity duration-[700ms] ease-[cubic-bezier(0.33,1,0.68,1)] ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Ambient halo under the composition. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-[#0f62fe]/10 blur-[140px]"
      />

      <div
        className="relative"
        style={{ width: RING_SIZE, height: RING_SIZE }}
      >
        {/* OUTER RING */}
        <div className="absolute inset-0 rounded-full border border-white/[0.08]" />

        {/* TICK MARKS */}
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

        {/* OUTER ORBIT */}
        <div
          aria-hidden
          className="absolute inset-0 motion-safe:animate-[loader-orbit-cw_5s_linear_infinite]"
        >
          <span className="absolute top-0 left-1/2 -ml-[7px] -mt-[7px] w-[14px] h-[14px] rounded-full bg-[#0f62fe] shadow-[0_0_18px_rgba(15,98,254,0.95),0_0_36px_rgba(15,98,254,0.5)]" />
        </div>

        {/* INNER RING */}
        <div
          className="absolute rounded-full border border-white/[0.06]"
          style={{ inset: INNER_INSET }}
        />

        {/* INNER ORBIT */}
        <div
          aria-hidden
          className="absolute motion-safe:animate-[loader-orbit-ccw_3.5s_linear_infinite]"
          style={{ inset: INNER_INSET }}
        >
          <span className="absolute bottom-0 left-1/2 -ml-[5px] -mb-[5px] w-[10px] h-[10px] rounded-full bg-[#10b981] shadow-[0_0_14px_rgba(16,185,129,0.9),0_0_28px_rgba(16,185,129,0.4)]" />
        </div>

        {/* CENTER STACK */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          {/* Step counter advances with the phase. tabular-nums keeps
              the digit widths fixed so the layout doesn't jitter. */}
          <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-500 tabular-nums">
            {stepLabel}
          </span>
          {/* PHIL G. wordmark with the shine sweep. Always on. */}
          <span className="shine-text font-mono text-2xl md:text-3xl font-bold tracking-[0.18em] uppercase">
            PHIL G.
          </span>
          {/* Cycling service phrase. Re-keyed on each phase so React
              unmounts the previous span; the new one enters via the
              loader-phase-in keyframe (fade + lift). Fixed height
              container prevents the surrounding layout from jittering
              as words of different widths cycle through. */}
          <div className="relative h-5 w-[200px] overflow-hidden">
            <span
              key={phaseIdx}
              className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tracking-[0.32em] uppercase text-[#4589ff] motion-safe:animate-[loader-phase-in_500ms_cubic-bezier(0.33,1,0.68,1)_both]"
            >
              {currentPhase}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom-edge mono label. Brand signature. */}
      <span className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-600">
        Senior Product Design Leader
      </span>
    </div>
  );
}

export default InitialLoader;
