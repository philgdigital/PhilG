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

      {/* PRAGUE MAP. PURE LINE DRAWING, NO TEXT.
          Dense annotated map of central Prague drawn entirely with
          paths, lines, and dots. Reads as a real cartographic
          surface without a single word, so the loader stays purely
          visual.

          What's drawn (viewBox 1600x900, north up, sequence top-to-
          bottom in render order, but stagger-animated from broad
          context layers up to specific landmark dots):

            1. DISTRICT HAIRLINES (faintest layer). Two dashed outer
               curves west + east of the river suggesting where the
               historic center ends.
            2. CONTOUR LINES. Concentric curves around Petřín hill +
               Hradčany ridge (west bank) and Letná plateau (inside
               the eastward bend). These read as elevation rings.
            3. STREET GRID. Five short hairlines crossing the Old
               Town area east of the river, hinting at the medieval
               street pattern.
            4. VLTAVA RIVER (the centerpiece). South-to-north with
               the signature Letná eastward loop. Drawn as two
               parallel banks ~30px apart for visible river width.
            5. ISLANDS. Three small ovals on the river at the real
               positions of Slovanský / Střelecký / Štvanice.
            6. BRIDGES. Six perpendicular line segments crossing the
               river at real bridge positions.
            7. VYŠEHRAD PROMONTORY. Small triangular cliff shape
               east of the river at the south.
            8. LANDMARK DOTS. Six glowing IBM-blue / emerald dots
               at: Vyšehrad, Charles Bridge (on river), Castle
               (west bank), Old Town Square (east bank), National
               Theatre (east bank, south), Letná Park (north).
               No labels, dot positions alone do the work.
            9. COMPASS CROSS. Top-left, four arms with an IBM-blue
               triangle pointing up (north). No "N" letter.

          All strokes use low-alpha IBM blue or white so the map is
          felt behind the orbital composition, not competing with it.
          Sequenced via stroke-dashoffset draw-in + the loader-
          landmark-in keyframe so the map "builds itself" over ~3.5s. */}
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

        {/* 1. DISTRICT HAIRLINES. Two outer dashed curves framing the
              historic center on each side of the river. */}
        <path
          d="M 380 80 C 420 240, 480 410, 540 580 C 600 740, 680 870, 740 950"
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
          strokeDasharray="3 7"
          pathLength={1}
          strokeDashoffset="1"
          className="motion-safe:animate-[loader-draw_3s_cubic-bezier(0.33,1,0.68,1)_500ms_forwards]"
          style={{ strokeDasharray: "1" }}
        />
        <path
          d="M 1380 80 C 1330 240, 1240 400, 1200 560 C 1160 720, 1100 850, 1040 950"
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
          strokeDasharray="3 7"
          pathLength={1}
          strokeDashoffset="1"
          className="motion-safe:animate-[loader-draw_3s_cubic-bezier(0.33,1,0.68,1)_700ms_forwards]"
          style={{ strokeDasharray: "1" }}
        />

        {/* 2. CONTOUR LINES. Concentric curves around Petřín hill
              (west of river, mid-south) and Letná plateau (north
              of the bend). Each set is three nested curves so the
              eye reads it as a hill in plan view. */}
        {/* Petřín / Hradčany ridge (west bank) */}
        <g>
          {[
            "M 540 700 C 560 600, 580 520, 620 440 C 660 360, 700 320, 740 280",
            "M 580 700 C 600 620, 620 540, 660 480 C 690 420, 720 380, 750 350",
            "M 620 680 C 640 620, 660 560, 690 510 C 715 470, 735 440, 760 410",
          ].map((d, i) => (
            <path
              key={`petrin-${i}`}
              d={d}
              fill="none"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth="1"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              className="motion-safe:animate-[loader-draw_2.4s_cubic-bezier(0.33,1,0.68,1)_forwards]"
              style={{ animationDelay: `${1100 + i * 150}ms` }}
            />
          ))}
        </g>
        {/* Letná plateau (inside the eastward bend, north) */}
        <g>
          {[
            "M 880 260 C 940 240, 1000 230, 1060 250 C 1090 260, 1100 270, 1100 280",
            "M 900 280 C 950 265, 1000 260, 1050 275 C 1075 280, 1085 285, 1085 290",
            "M 920 300 C 960 290, 1000 290, 1040 300",
          ].map((d, i) => (
            <path
              key={`letna-${i}`}
              d={d}
              fill="none"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth="1"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              className="motion-safe:animate-[loader-draw_2s_cubic-bezier(0.33,1,0.68,1)_forwards]"
              style={{ animationDelay: `${1400 + i * 150}ms` }}
            />
          ))}
        </g>

        {/* 3. OLD TOWN STREET GRID. Five short crossing hairlines
              east of the river suggesting the medieval street
              pattern. Drawn at slight angles so they don't read as
              a regular grid. */}
        {[
          { x1: 880, y1: 460, x2: 980, y2: 480 },
          { x1: 890, y1: 510, x2: 970, y2: 540 },
          { x1: 940, y1: 480, x2: 920, y2: 560 },
          { x1: 990, y1: 490, x2: 980, y2: 570 },
          { x1: 860, y1: 600, x2: 1000, y2: 590 },
        ].map((s, i) => (
          <line
            key={`street-${i}`}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
            className="motion-safe:animate-[loader-draw_900ms_cubic-bezier(0.33,1,0.68,1)_forwards]"
            style={{ animationDelay: `${2100 + i * 100}ms` }}
          />
        ))}

        {/* 4. VLTAVA RIVER. Centerpiece. Drawn as two parallel banks
              so the river has visible width. The west bank is the
              brighter line (the "definite" coast); the east bank is
              softer. Both follow the S-shape with the Letná
              eastward loop. */}
        {/* West bank (brighter) */}
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
          stroke="rgba(15, 98, 254, 0.45)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
          className="motion-safe:animate-[loader-draw_2.8s_cubic-bezier(0.33,1,0.68,1)_300ms_forwards]"
        />
        {/* East bank (softer) */}
        <path
          d="
            M 800 950
            C 810 870, 770 800, 800 720
            C 830 660, 890 620, 860 540
            C 840 480, 780 450, 810 380
            C 840 320, 920 320, 1000 320
            C 1080 320, 1160 320, 1180 250
            C 1190 190, 1150 130, 1120 80
            L 1120 -50
          "
          fill="none"
          stroke="rgba(15, 98, 254, 0.22)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
          className="motion-safe:animate-[loader-draw_2.8s_cubic-bezier(0.33,1,0.68,1)_500ms_forwards]"
        />

        {/* 5. ISLANDS. Three small ovals at real positions on the
              Vltava: Slovanský (Žofín), Střelecký, Štvanice. */}
        {[
          // Slovanský / Žofín: just south of the Charles Bridge area
          { cx: 776, cy: 680, rx: 8, ry: 18 },
          // Střelecký: between Charles Bridge and Mánesův
          { cx: 790, cy: 600, rx: 7, ry: 14 },
          // Štvanice: inside the eastward bend, north
          { cx: 1080, cy: 280, rx: 22, ry: 9 },
        ].map((isl, i) => (
          <ellipse
            key={`island-${i}`}
            cx={isl.cx}
            cy={isl.cy}
            rx={isl.rx}
            ry={isl.ry}
            fill="none"
            stroke="rgba(15, 98, 254, 0.35)"
            strokeWidth="1"
            opacity={0}
            className="motion-safe:animate-[loader-landmark-in_500ms_cubic-bezier(0.33,1,0.68,1)_forwards]"
            style={{
              animationDelay: `${2700 + i * 120}ms`,
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
          />
        ))}

        {/* 6. BRIDGES. Six perpendicular segments at real positions
              along the river, south to north. Each line is sized
              to roughly span the local river width. */}
        {[
          // Vyšehrad / Železniční (railway): south
          { x1: 740, y1: 870, x2: 810, y2: 855 },
          // Palackého
          { x1: 745, y1: 780, x2: 815, y2: 765 },
          // Jiráskův
          { x1: 750, y1: 700, x2: 815, y2: 685 },
          // Most Legií
          { x1: 755, y1: 620, x2: 825, y2: 605 },
          // Karlův Most (Charles Bridge): the famous one. Longer
          //   segment so it visually dominates.
          { x1: 720, y1: 540, x2: 870, y2: 520 },
          // Mánesův
          { x1: 760, y1: 450, x2: 830, y2: 440 },
          // Štefánikův / Čechův (around the eastward bend)
          { x1: 920, y1: 320, x2: 1000, y2: 320 },
          // Hlávkův (north, end of the bend)
          { x1: 1100, y1: 220, x2: 1180, y2: 235 },
        ].map((b, i) => (
          <line
            key={`bridge-${i}`}
            x1={b.x1}
            y1={b.y1}
            x2={b.x2}
            y2={b.y2}
            stroke={
              i === 4
                ? "rgba(255, 255, 255, 0.32)"
                : "rgba(255, 255, 255, 0.18)"
            }
            strokeWidth={i === 4 ? 1.4 : 1}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
            className="motion-safe:animate-[loader-draw_700ms_cubic-bezier(0.33,1,0.68,1)_forwards]"
            style={{
              animationDelay: `${2400 + i * 110}ms`,
            }}
          />
        ))}

        {/* 7. VYŠEHRAD PROMONTORY. Small triangular cliff shape
              jutting into the river from the east bank, south. */}
        <path
          d="M 820 880 L 855 860 L 855 900 Z"
          fill="rgba(15, 98, 254, 0.18)"
          stroke="rgba(15, 98, 254, 0.5)"
          strokeWidth="1"
          opacity={0}
          className="motion-safe:animate-[loader-landmark-in_500ms_cubic-bezier(0.33,1,0.68,1)_3100ms_forwards]"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />

        {/* 8. LANDMARK DOTS. Six glowing IBM-blue / emerald dots
              at the real positions of major Prague landmarks. NO
              text labels; the dot positions on the river / banks
              do the cartographic work. */}
        {[
          // Vyšehrad (east bank, south)
          { cx: 838, cy: 880, color: "#0f62fe" },
          // Charles Bridge (ON the river, middle of the famous bridge line)
          { cx: 795, cy: 530, color: "#10b981" },
          // Prague Castle (west bank, mid)
          { cx: 680, cy: 440, color: "#0f62fe" },
          // Old Town Square (east bank, mid)
          { cx: 940, cy: 510, color: "#0f62fe" },
          // National Theatre (east bank, south of Charles Bridge)
          { cx: 850, cy: 640, color: "#0f62fe" },
          // Letná (inside the bend, north)
          { cx: 990, cy: 270, color: "#10b981" },
        ].map((d, i) => (
          <circle
            key={`landmark-${i}`}
            cx={d.cx}
            cy={d.cy}
            r={3.5}
            fill={d.color}
            opacity={0}
            filter="url(#loader-landmark-glow)"
            className="motion-safe:animate-[loader-landmark-in_500ms_cubic-bezier(0.33,1,0.68,1)_forwards]"
            style={{
              animationDelay: `${3200 + i * 120}ms`,
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
          />
        ))}

        {/* 9. COMPASS CROSS. Top-left. Four arms; the north arm is
              a small IBM-blue triangle. NO 'N' letter. */}
        <g
          opacity={0}
          className="motion-safe:animate-[loader-landmark-in_500ms_cubic-bezier(0.33,1,0.68,1)_2800ms_forwards]"
          transform="translate(130, 140)"
        >
          <line
            x1="0"
            y1="-26"
            x2="0"
            y2="26"
            stroke="rgba(255, 255, 255, 0.32)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="-18"
            y1="0"
            x2="18"
            y2="0"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="0" cy="0" r="2" fill="rgba(255, 255, 255, 0.5)" />
          <path
            d="M 0 -26 L -5 -16 L 5 -16 Z"
            fill="#0f62fe"
            stroke="rgba(15, 98, 254, 0.7)"
            strokeWidth="0.5"
          />
        </g>
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
