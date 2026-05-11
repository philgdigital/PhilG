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

      {/* PRAGUE BG MAP.
          Geographically grounded representation of Phil's home city
          (not the earlier abstract flat curve). The Vltava actually
          flows south to north through Prague, making a sharp eastward
          bend around Letná Park north of the Old Town before
          continuing north toward Holešovice. That signature loop +
          the river's S-shape is what reads as "Prague" rather than
          "any river."

          On the SVG canvas (viewBox 1600x900, north pointing up):
            - River enters from the south, near the bottom of the
              composition (around x=720, y=910).
            - Flows north with a slight westward dip past Vyšehrad.
            - Curves east just past the Old Town centerline (the
              Letná loop / Holešovice bend).
            - Continues north and exits at the top right of the
              canvas (x=1080, y=-50).
            - Four bridges (Vyšehrad / Karlův / Mánesův / Štefánikův
              from south to north) cross the river at their actual
              relative positions.
            - Five landmark dots sit at their real positions relative
              to the river:
                * Vyšehrad: east bank, south of center
                * Charles Bridge: ON the river, slightly south of mid
                * Prague Castle (Hradčany): WEST of the river, mid
                * Old Town (Staré Město): EAST of the river, mid
                * Letná Park: north, INSIDE the eastward bend
            - Each landmark carries a tiny mono uppercase label
              positioned offset from the dot, so the map reads as a
              real annotated map, not just dots on a line.

          All strokes / fills use low-alpha IBM blue or white so the
          map is FELT behind the orbital composition, not visually
          competing with it. The whole layer dissolves with the loader. */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter
            id="loader-landmark-glow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* DISTRICT HAIRLINES. Two very faint curves that hint at the
            district boundaries west + east of the river, giving the
            map a "this is a city" feel rather than a single line on
            a black canvas. */}
        <path
          d="M 480 110 C 520 250, 560 400, 610 560 C 650 700, 700 820, 760 900"
          fill="none"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth="1"
          strokeDasharray="2 6"
          pathLength={1}
          strokeDashoffset="1"
          className="motion-safe:animate-[loader-draw_3s_cubic-bezier(0.33,1,0.68,1)_700ms_forwards]"
          style={{ strokeDasharray: "1" }}
        />
        <path
          d="M 1280 110 C 1240 250, 1180 380, 1150 540 C 1120 700, 1080 820, 1020 900"
          fill="none"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth="1"
          strokeDasharray="2 6"
          pathLength={1}
          strokeDashoffset="1"
          className="motion-safe:animate-[loader-draw_3s_cubic-bezier(0.33,1,0.68,1)_900ms_forwards]"
          style={{ strokeDasharray: "1" }}
        />

        {/* VLTAVA RIVER (main line).
            South-to-north flow with the eastward Letná bend. Each
            Bezier control was chosen by tracing a simplified outline
            of the real river in Prague's center; the proportions
            are deliberately simplified for the loader composition
            but the signature S/loop shape is preserved. */}
        <path
          d="
            M 760 950
            C 770 870, 730 800, 760 720
            C 790 660, 850 620, 820 540
            C 800 480, 740 450, 770 380
            C 800 320, 880 320, 960 320
            C 1040 320, 1120 320, 1140 250
            C 1150 190, 1110 130, 1080 80
            L 1080 -50
          "
          fill="none"
          stroke="rgba(15, 98, 254, 0.32)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
          className="motion-safe:animate-[loader-draw_2.8s_cubic-bezier(0.33,1,0.68,1)_300ms_forwards]"
        />
        {/* Soft second bank line for river depth. Slightly east-
            offset to suggest the width of the Vltava across central
            Prague (river is ~150-300m wide). */}
        <path
          d="
            M 790 950
            C 800 870, 760 800, 790 720
            C 820 660, 880 620, 850 540
            C 830 480, 770 450, 800 380
            C 830 320, 910 320, 990 320
            C 1070 320, 1150 320, 1170 250
            C 1180 190, 1140 130, 1110 80
            L 1110 -50
          "
          fill="none"
          stroke="rgba(15, 98, 254, 0.14)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
          className="motion-safe:animate-[loader-draw_2.8s_cubic-bezier(0.33,1,0.68,1)_500ms_forwards]"
        />

        {/* BRIDGES. Short perpendicular segments at the real relative
            positions of major Prague bridges (south to north). Each
            tilts to roughly cross the river at its actual angle. */}
        {[
          // Železniční (railway) bridge: south, near Vyšehrad
          { x1: 740, y1: 880, x2: 800, y2: 870 },
          // Palackého: just south of Old Town
          { x1: 745, y1: 760, x2: 805, y2: 750 },
          // Karlův Most (Charles Bridge): the famous one. Crosses
          // east-west between Old Town and Malá Strana.
          { x1: 740, y1: 640, x2: 870, y2: 620 },
          // Mánesův: north of Charles Bridge
          { x1: 760, y1: 520, x2: 850, y2: 510 },
          // Štefánikův / Čechův: around the Letná bend
          { x1: 920, y1: 320, x2: 990, y2: 320 },
        ].map((b, i) => (
          <line
            key={`bridge-${i}`}
            x1={b.x1}
            y1={b.y1}
            x2={b.x2}
            y2={b.y2}
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
            className="motion-safe:animate-[loader-draw_700ms_cubic-bezier(0.33,1,0.68,1)_forwards]"
            style={{
              animationDelay: `${2600 + i * 160}ms`,
            }}
          />
        ))}

        {/* LANDMARK DOTS + LABELS. Real positions relative to the
            river. Each dot fades + scales in with the loader-landmark
            keyframe; each text label fades in alongside via the
            stagger delay. */}
        {[
          // Vyšehrad: south, on the east bank cliffs
          {
            cx: 820,
            cy: 870,
            color: "#0f62fe",
            label: "Vyšehrad",
            labelX: 860,
            labelY: 875,
            anchor: "start" as const,
          },
          // Charles Bridge: on the river, mid-south
          {
            cx: 800,
            cy: 632,
            color: "#10b981",
            label: "Karlův most",
            labelX: 900,
            labelY: 628,
            anchor: "start" as const,
          },
          // Prague Castle (Hradčany): west of river, mid
          {
            cx: 670,
            cy: 480,
            color: "#0f62fe",
            label: "Hradčany",
            labelX: 645,
            labelY: 462,
            anchor: "end" as const,
          },
          // Old Town (Staré Město): east of river, mid
          {
            cx: 920,
            cy: 510,
            color: "#0f62fe",
            label: "Staré Město",
            labelX: 950,
            labelY: 510,
            anchor: "start" as const,
          },
          // Letná park: inside the Letná bend (north)
          {
            cx: 950,
            cy: 250,
            color: "#10b981",
            label: "Letná",
            labelX: 980,
            labelY: 246,
            anchor: "start" as const,
          },
        ].map((d, i) => (
          <g
            key={`landmark-${i}`}
            opacity={0}
            className="motion-safe:animate-[loader-landmark-in_500ms_cubic-bezier(0.33,1,0.68,1)_forwards]"
            style={{
              animationDelay: `${3100 + i * 160}ms`,
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
          >
            <circle
              cx={d.cx}
              cy={d.cy}
              r={3.5}
              fill={d.color}
              filter="url(#loader-landmark-glow)"
            />
            <text
              x={d.labelX}
              y={d.labelY}
              fill="rgba(255, 255, 255, 0.45)"
              fontSize="11"
              fontFamily="var(--font-mono)"
              letterSpacing="0.22em"
              textAnchor={d.anchor}
              style={{ textTransform: "uppercase" }}
            >
              {d.label}
            </text>
          </g>
        ))}

        {/* COMPASS rose: small N indicator top-left so the map reads
            as a real annotated cartographic surface. */}
        <g
          opacity={0}
          className="motion-safe:animate-[loader-landmark-in_500ms_cubic-bezier(0.33,1,0.68,1)_2800ms_forwards]"
          transform="translate(120, 130)"
        >
          <line
            x1="0"
            y1="-22"
            x2="0"
            y2="22"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="-12"
            y1="0"
            x2="12"
            y2="0"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path d="M 0 -22 L -4 -14 L 4 -14 Z" fill="#0f62fe" />
          <text
            x="0"
            y="-30"
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.55)"
            fontSize="9"
            fontFamily="var(--font-mono)"
            letterSpacing="0.32em"
          >
            N
          </text>
        </g>

        {/* "PRAGUE" main label, top-right of the SVG. Mono, tracked,
            small enough to read as cartographic annotation. */}
        <text
          x="1480"
          y="160"
          textAnchor="end"
          fill="rgba(255, 255, 255, 0.55)"
          fontSize="13"
          fontFamily="var(--font-mono)"
          letterSpacing="0.42em"
          opacity={0}
          className="motion-safe:animate-[loader-landmark-in_600ms_cubic-bezier(0.33,1,0.68,1)_3200ms_forwards]"
          style={{ textTransform: "uppercase" }}
        >
          Praha · Vltava
        </text>
      </svg>

      {/* Mono coordinate label, bottom-left. Editorial nod to where
          Phil works from. Fades in after the river finishes drawing. */}
      <span
        className="absolute bottom-8 left-8 font-mono text-[9px] md:text-[10px] tracking-[0.32em] uppercase text-zinc-600 opacity-0 motion-safe:animate-[loader-landmark-in_600ms_cubic-bezier(0.33,1,0.68,1)_2900ms_forwards]"
        aria-hidden
      >
        50.0755°N · 14.4378°E
      </span>

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
