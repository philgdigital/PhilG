"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "@/components/icons/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";

export function Hero() {
  // Editorial-correction sequence on the first headline.
  //   'pristine'  : just "Product Design", no marks
  //   'striking'  : strikethrough line draws across "Design"
  //   'writing'   : "Builder" writes itself in above
  //   'settled'   : both states locked in
  //
  // Gated on InitialLoader's 'philg:loader-done' event + window flag.
  // The loader always fires this event when its phase transitions to
  // 'done' (on both homepage and subpages; on subpages it just
  // happens silently since the loader returned null). A long 10s
  // ceiling fallback covers the (extremely rare) case where the
  // event somehow never arrives. The earlier 700ms fallback was a
  // bug: on the homepage it fired BEFORE the loader was done, so
  // the entire sequence played invisibly behind the overlay.
  const [editPhase, setEditPhase] = useState<
    "pristine" | "striking" | "writing" | "settled"
  >("pristine");
  useEffect(() => {
    type WithFlag = Window & { __philgLoaderDone?: boolean };
    const timeouts: number[] = [];

    const startSequence = () => {
      timeouts.push(
        window.setTimeout(() => setEditPhase("striking"), 600),
        window.setTimeout(() => setEditPhase("writing"), 1500),
        window.setTimeout(() => setEditPhase("settled"), 2700),
      );
    };

    // If the loader already broadcast 'done' before this effect ran
    // (e.g. returning to the tab), start immediately.
    if ((window as WithFlag).__philgLoaderDone) {
      startSequence();
      return () => {
        timeouts.forEach((id) => window.clearTimeout(id));
      };
    }

    const handler = () => {
      startSequence();
    };
    window.addEventListener("philg:loader-done", handler, { once: true });

    // Hard safety net: if the event hasn't fired in 10s (well past
    // the loader's own 9s ceiling), force the sequence so the
    // visitor isn't stuck on the un-edited "Product Design".
    const safety = window.setTimeout(() => {
      if (!(window as WithFlag).__philgLoaderDone) {
        startSequence();
      }
    }, 10000);

    return () => {
      window.removeEventListener("philg:loader-done", handler);
      window.clearTimeout(safety);
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, []);
  const lineDrawn = editPhase !== "pristine";
  const builderWritten =
    editPhase === "writing" || editPhase === "settled";

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-44 md:pt-52 pb-20 relative z-10 overflow-hidden">
      {/* LIQUID BG LAYER (Hero-only).
          Two large radial gradients (IBM blue + emerald) are warped by
          an SVG feTurbulence + feDisplacementMap filter whose
          baseFrequency + displacement scale animate continuously. The
          turbulence noise pattern slowly drifts, dragging the
          gradient with it, so the color behind the hero text reads as
          a slow flowing liquid rather than discrete moving orbs.

          Sits at z-0 (above the section's own z-context floor) but
          below the content div (z-10). The whole layer is gated under
          .hero-liquid: visitors with prefers-reduced-motion see the
          static gradient with no displacement animation (and the
          turbulence is reduced to a single sample). */}
      <div
        aria-hidden
        className="hero-liquid pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          transform: "translateZ(0)",
          // Mask the liquid layer to fade out toward the bottom of
          // the Hero so the displaced gradient never reaches the
          // section boundary. Without this the warped blobs were
          // visible right where the section divider sits, reading
          // as a stray "weird shape" near the next section.
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 92%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 92%)",
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1200 900"
        >
          <defs>
            <filter
              id="hero-liquid-filter"
              x="-15%"
              y="-15%"
              width="130%"
              height="130%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.009 0.013"
                numOctaves="2"
                seed="7"
                result="noise"
              >
                <animate
                  attributeName="baseFrequency"
                  dur="24s"
                  values="0.009 0.013;0.014 0.018;0.011 0.015;0.009 0.013"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="70"
                xChannelSelector="R"
                yChannelSelector="G"
              >
                <animate
                  attributeName="scale"
                  dur="18s"
                  values="50;90;65;50"
                  repeatCount="indefinite"
                />
              </feDisplacementMap>
            </filter>

            <radialGradient
              id="hero-liquid-blue"
              cx="22%"
              cy="34%"
              r="55%"
            >
              <stop offset="0%" stopColor="rgba(15, 98, 254, 0.45)" />
              <stop offset="70%" stopColor="rgba(15, 98, 254, 0)" />
            </radialGradient>
            <radialGradient
              id="hero-liquid-emerald"
              cx="78%"
              cy="62%"
              r="50%"
            >
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.32)" />
              <stop offset="70%" stopColor="rgba(16, 185, 129, 0)" />
            </radialGradient>
            <radialGradient
              id="hero-liquid-blue-2"
              cx="58%"
              cy="86%"
              r="55%"
            >
              <stop offset="0%" stopColor="rgba(15, 98, 254, 0.22)" />
              <stop offset="70%" stopColor="rgba(15, 98, 254, 0)" />
            </radialGradient>
          </defs>

          <g filter="url(#hero-liquid-filter)">
            <rect width="1200" height="900" fill="url(#hero-liquid-blue)" />
            <rect
              width="1200"
              height="900"
              fill="url(#hero-liquid-emerald)"
            />
            <rect
              width="1200"
              height="900"
              fill="url(#hero-liquid-blue-2)"
            />
          </g>
        </svg>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto w-full">
        <Reveal delay={100} direction="none">
          {/* Bottom margin pushes the giant headline a touch lower
              on desktop (mb-10 → mb-16, +24px). The body container's
              top margin is reduced by the same amount below so the
              "I'm Phil G." line stays in roughly the same vertical
              position. Mobile spacing is unchanged. */}
          <div className="mb-10 md:mb-16">
            <AvailabilityBadge />
          </div>
        </Reveal>

        {/*
          Each headline line is wrapped in a `.headline-line` group so the
          hover state cascades to children. The hover effect lives in
          globals.css:
            - Fill goes transparent
            - text-stroke 2px white outlines the letters
            - IBM-blue drop-shadow appears, growing as the eye holds
            - tracking tightens slightly so the stroke doesn't widen the line
            - 700ms ease-out throughout
          The Acceleration line's shine-text gradient inverts to a stroked
          outline on hover so the three lines share one motion language.
        */}
        <Reveal delay={200}>
          {/* Editorial-correction SEQUENCE.
              Step 1 (pristine): "Product Design" appears as-is, no
              marks. The user reads the headline normally.
              Step 2 (striking, t+2.4s): an IBM-blue line draws
              left-to-right across "Design" via scaleX(0 -> 1).
              Step 3 (writing, t+3.0s): "Builder" writes itself in
              above the now-struck "Design" via a clip-path inset
              that opens left-to-right, simulating a pen stroke. */}
          <h1 className="headline-line group text-[11vw] md:text-[10vw] font-bold tracking-tighter leading-[0.85] uppercase text-white drop-shadow-2xl">
            Product{" "}
            <span className="relative inline-block">
              {/* Handwritten 'Builder' written above 'Design'.
                  Uses a one-shot CSS keyframe animation
                  (hero-builder-write) that fires the moment the
                  inline 'animation' property is set when
                  builderWritten flips true. opacity 0 + clip-path
                  inset(0 100% 0 0) is the resting (pre-animation)
                  state; the keyframe interpolates to opacity 1 +
                  fully open clip-path, simulating a pen writing
                  the word left to right.
                  z-50 + isolate so it sits ABOVE every other Hero
                  element (liquid bg, strikethrough line, headline
                  glow halos) and is never visually clipped by the
                  parent's transform stacking context. */}
              <span
                aria-hidden
                className="absolute right-1 z-50 isolate font-serif italic font-medium text-[#4589ff] pointer-events-none"
                style={{
                  top: "-0.5em",
                  fontSize: "0.42em",
                  letterSpacing: "0.005em",
                  textTransform: "none",
                  transform: "rotate(-5deg)",
                  textShadow: "0 0 18px rgba(15, 98, 254, 0.45)",
                  opacity: 0,
                  clipPath: "inset(0 100% 0 0)",
                  animation: builderWritten
                    ? "hero-builder-write 1000ms cubic-bezier(0.22, 1, 0.36, 1) forwards"
                    : "none",
                }}
              >
                Builder
              </span>
              {/* 'Design' word with an animated strikethrough line
                  via a one-shot CSS keyframe (hero-strike-draw).
                  scaleX(0) is the resting state; when lineDrawn
                  flips true the animation runs scaleX(0 -> 1) over
                  700ms with cubic-bezier easing, drawing the line
                  left to right like a pen stroke.

                  After the strike completes, the 'Design' text drops
                  to 30% opacity (it's the corrected/struck-out word,
                  so it visually recedes while 'Builder' is the new
                  authoritative read). The opacity transition's delay
                  (700ms) matches the strike animation duration, so
                  the dim starts the instant the line finishes
                  drawing, not before, not after. */}
              <span className="relative inline-block">
                <span
                  className="transition-opacity duration-500 ease-out"
                  style={{
                    opacity: lineDrawn ? 0.3 : 1,
                    transitionDelay: lineDrawn ? "700ms" : "0ms",
                  }}
                >
                  Design
                </span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-0 origin-left"
                  style={{
                    top: "46%",
                    width: "100%",
                    height: "0.09em",
                    // Mid-grey (zinc-400-ish) so the strike reads as
                    // an editor's pen mark over the white "Design"
                    // word rather than a bright highlight.
                    backgroundColor: "rgba(161, 161, 170, 0.85)",
                    transform: "scaleX(0)",
                    transformOrigin: "left center",
                    boxShadow:
                      "0 0 6px rgba(0, 0, 0, 0.45)",
                    animation: lineDrawn
                      ? "hero-strike-draw 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards"
                      : "none",
                  }}
                />
              </span>
            </span>
          </h1>
        </Reveal>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-12 w-full mt-2">
          <Reveal delay={300} className="hidden md:block">
            <div className="w-16 h-2 md:w-40 md:h-3 rounded-full bg-gradient-to-r from-[#0f62fe] to-[#10b981] shadow-[0_0_30px_rgba(15,98,254,0.5)]" />
          </Reveal>
          <Reveal delay={400}>
            <h1 className="headline-line headline-line-shine group text-[13vw] md:text-[10vw] font-bold tracking-tighter leading-[0.85] uppercase shine-text">
              Acceleration
            </h1>
          </Reveal>
        </div>

        <div className="flex justify-start md:justify-end w-full md:w-[95%] mt-4 md:mt-0">
          <Reveal delay={500}>
            <h1 className="headline-line group text-[13vw] md:text-[10vw] font-bold tracking-tighter leading-[0.85] uppercase text-white flex items-center gap-4">
              <span className="text-zinc-400 italic font-light lowercase text-[7vw] md:text-[5vw] -mt-4 font-serif transition-colors duration-700 ease-[var(--ease-out)] group-hover:text-[#4589ff]">
                with
              </span>
              AI.
            </h1>
          </Reveal>
        </div>

        {/*
          Body + CTA + meta sit INSIDE the 1400px wrapper so their left
          edge aligns with the headline's left edge. The body p stays
          constrained to max-w-5xl for reading width, but is left-anchored
          (no mx-auto) so it doesn't drift into the center of the page.
          Tighter top margin (mt-16 md:mt-20) brings the body closer to
          the giant headline for better hero spacing rhythm.
        */}
        <div className="mt-16 md:mt-14 flex flex-col gap-8 max-w-5xl">
          {/* Two-tier body (frog pattern: promise first, context underneath).
              Tier 1 is the headline-level promise the eye lands on; the
              <br /> gives 'I'm Phil G.' its own line. Tier 2 is the
              supporting context. Both share max-w-3xl so the two blocks
              read as one column with matching width. */}
          <Reveal delay={400}>
            <p className="text-2xl md:text-4xl font-light text-zinc-100 leading-snug max-w-3xl">
              <span className="font-serif italic text-white">
                I&apos;m Phil G.
              </span>
              <br />A UX/Product Design Leader
              <br />who{" "}
              <span className="text-white font-medium">
                designs and builds
              </span>
              .
            </p>
          </Reveal>

          <Reveal delay={460}>
            {/* Body context as three deterministic lines. Two hard
                <br /> breaks so the wrap never lands on the long
                hyphenated word 'production-grade' in the middle of
                a line:
                  L1: outcomes / years of experience
                  L2: discovery + design systems
                  L3: shipping speed claim
                Without the second break, the third clause wrapped
                back onto L2 and the 'production-grade' word got
                split with a soft-hyphen ('production-' on L2,
                'grade React...' on L3), which read as broken UI. */}
            <p className="text-base md:text-xl font-light text-zinc-400 leading-relaxed max-w-3xl">
              <span className="text-white font-medium">17+ years</span> turning
              Fortune 500 problems into shipped products.
              <br />
              Leading product discovery, crafting AI-ready design systems,
              <br />
              and shipping production-grade React prototypes 10× faster.
            </p>
          </Reveal>

          <Reveal delay={520}>
            {/* CTA + meta on a single row, anchored to the LEFT (justify-start
                via flex default). flex-wrap is a safety net for very narrow
                viewports; on desktop they always sit inline. */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href="#work"
                data-magnetic="true"
                className="group flex items-center gap-4 text-white font-mono font-medium tracking-[0.18em] uppercase text-sm hover-target bg-transparent px-8 py-5 rounded-full border border-white/20 hover:bg-white transition-all duration-500 ease-[var(--ease-out)] overflow-hidden will-change-transform whitespace-nowrap"
              >
                <ArrowUpRight className="w-5 h-5 text-white group-hover:text-black transition-all duration-500 group-hover:rotate-45" />
                <span className="group-hover:text-black transition-colors duration-500">
                  Explore the Work
                </span>
              </a>
              {/* Meta line. 'Prague' is paired with a small inline
                  Czech tricolor flag glyph (path-drawn, no emoji or
                  external asset) so the location reads as a clean
                  national signal without a generic 'CZ' country
                  code abbreviation. */}
              <p className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-zinc-400 whitespace-nowrap inline-flex items-center gap-2">
                <span>
                  UX/Product Design Leader · Prague
                </span>
                <svg
                  aria-label="Czechia"
                  role="img"
                  viewBox="0 0 30 20"
                  className="w-[1.4em] h-[0.95em] inline-block rounded-[1.5px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] shrink-0"
                >
                  {/* Top white stripe */}
                  <rect width="30" height="10" fill="#ffffff" />
                  {/* Bottom red stripe */}
                  <rect y="10" width="30" height="10" fill="#d7141a" />
                  {/* Blue chevron pointing right from the hoist */}
                  <polygon points="0,0 15,10 0,20" fill="#11457e" />
                </svg>
              </p>
            </div>
          </Reveal>

        </div>

        {/* TRUST ROW (replaces the standalone Trusted By section).
            Lives OUTSIDE the max-w-3xl body container so it has the
            full 1400px outer wrapper width to fit all ten brand
            wordmarks on a single line at lg viewports. On smaller
            viewports the row wraps naturally. Each wordmark uses
            brand-approximate colors + signature typography with a
            small geometric accent mark (none reproduce a trademarked
            logo file). All brand marks default to 75% opacity;
            hover lifts to 100% + 1.04x scale. */}
        <Reveal delay={600}>
          <div className="mt-10 md:mt-14 flex flex-col gap-5 md:gap-7">
            <p className="font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-zinc-400 whitespace-nowrap">
              Trusted by
            </p>
            {/* Desktop: flex-nowrap + justify-between spreads the
                ten brand entries edge-to-edge across the trust row's
                full width, so the first mark sits flush left, the
                last flush right, and the rest distribute evenly
                between them. gap-x-0 on lg lets justify-between own
                the inter-item spacing.
                Mobile / tablet: flex-wrap with a small gap-x so
                entries wrap cleanly when there isn't horizontal room. */}
            <ul className="flex flex-wrap lg:flex-nowrap lg:justify-between items-center gap-x-5 md:gap-x-7 lg:gap-x-0 gap-y-4 md:gap-y-5 w-full">
              {/* WALMART: clean 6-ray sparkle. Three rounded rects
                  rotated 0/60/120 deg around the center, each giving
                  two opposing rays. Reads as a clean asterisk-style
                  burst rather than the previous 4-point lozenge. */}
              <li className="group flex items-center gap-1.5 cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                <svg
                  viewBox="0 0 20 20"
                  aria-hidden
                  className="w-[18px] h-[18px] shrink-0 text-[#ffc220] group-hover:drop-shadow-[0_0_8px_rgba(255,194,32,0.6)] transition-all duration-500"
                >
                  {[0, 60, 120].map((deg) => (
                    <rect
                      key={deg}
                      x="9.1"
                      y="2"
                      width="1.8"
                      height="16"
                      rx="0.9"
                      fill="currentColor"
                      transform={`rotate(${deg} 10 10)`}
                    />
                  ))}
                </svg>
                <span className="font-sans font-bold tracking-tight text-base md:text-lg text-[#0a8fff] group-hover:text-[#2da5ff] transition-colors duration-500">
                  Walmart
                </span>
              </li>

              {/* VMWARE: italic two-tone wordmark. */}
              <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                <span className="font-sans italic font-extrabold tracking-tight text-base md:text-lg text-zinc-200">
                  vm
                  <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors duration-500">
                    ware
                  </span>
                </span>
              </li>

              {/* PIVOTAL LABS: text-only wordmark (bracket glyph
                  removed per user request). Two-tone lime-green
                  'Pivotal' + muted grey ' Labs'. */}
              <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                <span className="font-sans font-bold tracking-tight text-base md:text-lg text-[#82c63a] group-hover:text-[#a3df60] transition-colors duration-500">
                  Pivotal
                  <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors duration-500">
                    {" "}
                    Labs
                  </span>
                </span>
              </li>

              {/* SAP: cyan-blue black uppercase. */}
              <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                <span className="font-sans font-black uppercase tracking-[0.04em] text-base md:text-lg text-[#21a8ec] group-hover:text-[#4dbdf2] transition-colors duration-500">
                  SAP
                </span>
              </li>

              {/* MICROSOFT: 2x2 four-color square mark + light sans. */}
              <li className="group flex items-center gap-1.5 cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                <svg
                  viewBox="0 0 14 14"
                  aria-hidden
                  className="w-3.5 h-3.5 shrink-0"
                >
                  <rect x="0" y="0" width="6" height="6" fill="#f25022" />
                  <rect x="8" y="0" width="6" height="6" fill="#7fba00" />
                  <rect x="0" y="8" width="6" height="6" fill="#00a4ef" />
                  <rect x="8" y="8" width="6" height="6" fill="#ffb900" />
                </svg>
                <span className="font-sans font-light tracking-tight text-base md:text-lg text-zinc-200">
                  Microsoft
                </span>
              </li>

              {/* VODAFONE: text-only red wordmark. Earlier
                  attempts at a graphical mark (red dot, red circle
                  with an internal curl) were reading as imitations
                  of a trademarked logo; safest treatment for a
                  trusted-by row is a plain wordmark in the brand's
                  signature red. Matches how WWF / OpenSC is handled
                  in the same row. */}
              <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                <span className="font-sans font-extrabold tracking-tight text-base md:text-lg text-[#ff2c2c] group-hover:text-[#ff5757] transition-colors duration-500">
                  Vodafone
                </span>
              </li>

              {/* CEMEX: brighter mid-blue (the previous dark navy
                  failed contrast on the dark page bg). */}
              <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                <span className="font-sans font-black uppercase tracking-[0.05em] text-base md:text-lg text-[#2d8ce0] group-hover:text-[#5aa9eb] transition-colors duration-500">
                  CEMEX
                </span>
              </li>

              {/* NESPRESSO: refined serif italic in cream. */}
              <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                <span className="font-serif italic font-light tracking-tight text-base md:text-lg text-[#e6d8c0] group-hover:text-[#f4e9d6] transition-colors duration-500">
                  Nespresso
                </span>
              </li>

              {/* WWF / OpenSC: text-only wordmark (icon removed per
                  user request). Two-tone with WWF emphasized. */}
              <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                <span className="font-sans font-bold tracking-tight text-base md:text-lg text-zinc-200">
                  WWF
                  <span className="text-zinc-500"> / OpenSC</span>
                </span>
              </li>

              {/* KUONI TUMLARE: two-tone semibold sans. */}
              <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                <span className="font-sans font-semibold tracking-tight text-base md:text-lg text-zinc-200">
                  Kuoni
                  <span className="text-zinc-400"> Tumlare</span>
                </span>
              </li>

              {/* ROYAL AIR FORCE: concentric roundel SVG + tracked
                  mono uppercase. */}
              <li className="group flex items-center gap-1.5 cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden
                  className="w-4 h-4 shrink-0"
                >
                  <circle cx="8" cy="8" r="7.5" fill="#1f4eaa" />
                  <circle cx="8" cy="8" r="5" fill="#f4f4f5" />
                  <circle cx="8" cy="8" r="2.5" fill="#c81f3a" />
                </svg>
                <span className="font-mono font-medium uppercase tracking-[0.18em] text-[10px] md:text-[11px] text-zinc-200">
                  Royal Air Force
                </span>
              </li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
