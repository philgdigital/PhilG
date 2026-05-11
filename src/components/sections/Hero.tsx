"use client";

import { ArrowUpRight } from "@/components/icons/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";

export function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-44 md:pt-52 pb-20 relative z-10">
      <div className="max-w-[1400px] mx-auto w-full">
        <Reveal delay={100} direction="none">
          <div className="mb-10">
            <AvailabilityBadge />
          </div>
        </Reveal>

        <Reveal delay={200}>
          <h1 className="text-[11vw] md:text-[10vw] font-bold tracking-tighter leading-[0.85] uppercase text-white drop-shadow-2xl">
            Product Design
          </h1>
        </Reveal>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-12 w-full mt-2">
          <Reveal delay={300} className="hidden md:block">
            <div className="w-16 h-2 md:w-40 md:h-3 rounded-full bg-gradient-to-r from-[#0f62fe] to-[#10b981] shadow-[0_0_30px_rgba(15,98,254,0.5)]" />
          </Reveal>
          <Reveal delay={400}>
            <h1 className="text-[13vw] md:text-[10vw] font-bold tracking-tighter leading-[0.85] uppercase shine-text">
              Acceleration
            </h1>
          </Reveal>
        </div>

        <div className="flex justify-start md:justify-end w-full md:w-[95%] mt-4 md:mt-0">
          <Reveal delay={500}>
            <h1 className="text-[13vw] md:text-[10vw] font-bold tracking-tighter leading-[0.85] uppercase text-white flex items-center gap-4">
              <span className="text-zinc-400 italic font-light lowercase text-[7vw] md:text-[5vw] -mt-4 font-serif">
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
                Senior Product Design Leader & Builder · Prague, Czech Republic
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
