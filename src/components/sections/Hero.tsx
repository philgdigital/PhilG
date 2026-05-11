"use client";

import { ArrowUpRight } from "@/components/icons/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";

export function Hero() {
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
        style={{ transform: "translateZ(0)" }}
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
          <div className="mb-10">
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
          <h1 className="headline-line group text-[11vw] md:text-[10vw] font-bold tracking-tighter leading-[0.85] uppercase text-white drop-shadow-2xl">
            Product Design
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
        <div className="mt-16 md:mt-20 flex flex-col gap-8 max-w-5xl">
          {/* Two-tier body (frog pattern: promise first, context underneath).
              Tier 1 is the headline-level promise the eye lands on; the
              <br /> gives 'I'm Phil G.' its own line. Tier 2 is the
              supporting context. Both share max-w-3xl so the two blocks
              read as one column with matching width. */}
          <Reveal delay={700}>
            <p className="text-2xl md:text-4xl font-light text-zinc-100 leading-snug max-w-3xl">
              <span className="font-serif italic text-white">
                I&apos;m Phil G.
              </span>
              <br />A Senior Product Design Leader
              <br />who{" "}
              <span className="text-white font-medium">
                designs and builds
              </span>
              .
            </p>
          </Reveal>

          <Reveal delay={780}>
            {/* Body context as a single flowing paragraph (the earlier
                forced <br /> after "shipped products." was removed at
                the user's request). Word-wrap handles where the eye
                lands at each viewport. */}
            <p className="text-base md:text-xl font-light text-zinc-400 leading-relaxed max-w-3xl">
              <span className="text-white font-medium">17+ years</span> turning
              Fortune 500 problems into shipped products. Leading product
              discovery, crafting AI-ready design systems, and shipping
              production-grade React prototypes 10× faster.
            </p>
          </Reveal>

          <Reveal delay={800}>
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
              <p className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-zinc-400 whitespace-nowrap">
                Senior Product Design Leader & Builder · Prague, CZ
              </p>
            </div>
          </Reveal>

          {/* TRUST ROW (replaces the standalone Trusted By section).
              A single short editorial intro line above a row of brand
              wordmarks. Each wordmark uses the brand's approximate
              color + signature typographic style, with a tiny accent
              SVG mark for the ones that have a recognisable graphic
              element. The marks are simplified generic shapes, not
              copies of trademarked logos. Hover lifts each to full
              opacity + adds a soft brand-tinted drop-shadow. */}
          <Reveal delay={900}>
            <div className="mt-10 md:mt-14 flex flex-col gap-5 md:gap-7">
              {/* Single-line meta. Shorter than before so it never
                  wraps on lg viewports; reads like a wordmark caption. */}
              <p className="font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-zinc-500 whitespace-nowrap">
                Built for Fortune 500 ·{" "}
                <span className="text-zinc-300">17 years</span> · No recycled
                decks
              </p>
              <ul className="flex flex-wrap items-center gap-x-7 md:gap-x-10 gap-y-4 md:gap-y-5">
                {/* WALMART : blue wordmark + 6-point yellow spark. */}
                <li className="group flex items-center gap-2 cursor-default opacity-70 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden
                    className="w-4 h-4 md:w-[18px] md:h-[18px] shrink-0 text-[#ffc220] group-hover:drop-shadow-[0_0_8px_rgba(255,194,32,0.6)] transition-all duration-500"
                  >
                    {[0, 30, 60, 90, 120, 150].map((deg) => (
                      <rect
                        key={deg}
                        x="9.25"
                        y="2"
                        width="1.5"
                        height="6.5"
                        rx="0.75"
                        fill="currentColor"
                        transform={`rotate(${deg} 10 10)`}
                      />
                    ))}
                  </svg>
                  <span className="font-sans font-bold tracking-tight text-xl md:text-2xl text-[#0071ce] group-hover:text-[#0a8fff] transition-colors duration-500">
                    Walmart
                  </span>
                </li>

                {/* VMWARE : italic bold mark, dark wordmark. */}
                <li className="group cursor-default opacity-70 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                  <span className="font-sans italic font-extrabold tracking-tight text-xl md:text-2xl text-zinc-200">
                    vm
                    <span className="text-[#717074] group-hover:text-zinc-300 transition-colors duration-500">
                      ware
                    </span>
                  </span>
                </li>

                {/* SAP : blue blocky wordmark. */}
                <li className="group cursor-default opacity-70 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                  <span className="font-sans font-black uppercase tracking-[0.04em] text-xl md:text-2xl text-[#008fd3] group-hover:text-[#21a8ec] transition-colors duration-500">
                    SAP
                  </span>
                </li>

                {/* MICROSOFT : 4-square mark + light wordmark. */}
                <li className="group flex items-center gap-2 cursor-default opacity-70 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                  <svg
                    viewBox="0 0 14 14"
                    aria-hidden
                    className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0"
                  >
                    <rect x="0" y="0" width="6" height="6" fill="#f25022" />
                    <rect x="8" y="0" width="6" height="6" fill="#7fba00" />
                    <rect x="0" y="8" width="6" height="6" fill="#00a4ef" />
                    <rect x="8" y="8" width="6" height="6" fill="#ffb900" />
                  </svg>
                  <span className="font-sans font-light tracking-tight text-lg md:text-xl text-zinc-200">
                    Microsoft
                  </span>
                </li>

                {/* VODAFONE : red bold wordmark + speech-quote dot. */}
                <li className="group flex items-baseline gap-1 cursor-default opacity-70 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                  <span
                    aria-hidden
                    className="shrink-0 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#e60000] group-hover:shadow-[0_0_10px_rgba(230,0,0,0.6)] transition-all duration-500"
                  />
                  <span className="font-sans font-extrabold tracking-tight text-xl md:text-2xl text-[#e60000] group-hover:text-[#ff2c2c] transition-colors duration-500">
                    Vodafone
                  </span>
                </li>

                {/* CEMEX : dark blue uppercase wordmark. */}
                <li className="group cursor-default opacity-70 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                  <span className="font-sans font-black uppercase tracking-[0.05em] text-xl md:text-2xl text-[#0a4a8a] group-hover:text-[#1f6ec0] transition-colors duration-500">
                    CEMEX
                  </span>
                </li>

                {/* NESPRESSO : refined serif italic in cream tone. */}
                <li className="group cursor-default opacity-70 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                  <span className="font-serif italic font-light tracking-tight text-xl md:text-2xl text-[#d8c9b0] group-hover:text-[#f4e9d6] transition-colors duration-500">
                    Nespresso
                  </span>
                </li>

                {/* KUONI TUMLARE : clean sans wordmark in cool grey. */}
                <li className="group cursor-default opacity-70 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                  <span className="font-sans font-semibold tracking-tight text-xl md:text-2xl text-zinc-200">
                    Kuoni
                    <span className="text-zinc-400"> Tumlare</span>
                  </span>
                </li>

                {/* ROYAL AIR FORCE : concentric-circles roundel mark
                    (red / white / blue) + tracked mono uppercase. */}
                <li className="group flex items-center gap-2 cursor-default opacity-70 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden
                    className="w-4 h-4 md:w-[18px] md:h-[18px] shrink-0"
                  >
                    <circle cx="8" cy="8" r="7.5" fill="#1f4eaa" />
                    <circle cx="8" cy="8" r="5" fill="#f4f4f5" />
                    <circle cx="8" cy="8" r="2.5" fill="#c81f3a" />
                  </svg>
                  <span className="font-mono font-medium uppercase tracking-[0.18em] text-[11px] md:text-xs text-zinc-200">
                    Royal Air Force
                  </span>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
