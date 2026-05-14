"use client";

import { usePathname } from "next/navigation";
import { ArrowUpRight } from "@/components/icons/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { LinkedinIcon } from "@/components/icons/BrandIcons";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";

const YEAR = new Date().getFullYear();

type FooterProps = {
  onOpenForm: () => void;
};

export function Footer({ onOpenForm }: FooterProps) {
  // The "12 ·" prefix is the homepage section-order number. It
  // belongs on `/` only — on subpages (work, insights, etc.) the
  // footer is global chrome, not section #12 of a numbered flow.
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  return (
    <footer
      id="contact"
      role="contentinfo"
      aria-label="Site footer"
      className="pt-32 pb-12 flex flex-col items-center justify-between min-h-screen relative overflow-hidden z-10"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#0f62fe]/8 blur-[150px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 px-6 mt-12 relative">
        <Reveal delay={50}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
            <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
              {isHomepage && (
                <span className="text-zinc-400">12 · </span>
              )}
              Initiate
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100} className="text-center mb-8">
          <p className="text-2xl md:text-3xl text-[#4589ff] font-medium tracking-wide drop-shadow-md">
            Looking for Enterprise Acceleration?
          </p>
        </Reveal>

        <Reveal delay={200}>
          <button
            type="button"
            onClick={onOpenForm}
            className="text-center group block hover-target p-4"
          >
            <h2 className="text-[14vw] lg:text-[13vw] font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 transition-all duration-700 group-hover:scale-[1.02] group-hover:from-white group-hover:to-white inline-block drop-shadow-2xl">
              Initiate
              <br />
              Project
            </h2>
          </button>
        </Reveal>

        <Reveal delay={400}>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-16 text-zinc-300">
            {/* Book a 30-min intro: opens the same ProjectFormModal as
                the big Initiate Project button above. Lower-commitment
                CTA for visitors not ready to fill the full form. */}
            <button
              type="button"
              onClick={onOpenForm}
              data-magnetic="true"
              className="group hover-target flex items-center gap-3 px-8 py-5 rounded-full border-2 border-[#0f62fe] bg-[#0f62fe]/10 text-white hover:bg-[#0f62fe] hover:shadow-[0_0_30px_rgba(15,98,254,0.5)] transition-all duration-500 ease-[var(--ease-out)] will-change-transform"
            >
              <ArrowUpRight className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" />
              <span className="font-mono text-xs uppercase tracking-[0.22em] font-medium">
                Book a 30-min intro
              </span>
            </button>

            {/* LinkedIn (only social link kept; email button removed
                per user request - email visible in the meta line below).
                Opens in a new tab so the visitor doesn't lose their
                place on the site. rel="noopener noreferrer" is the
                standard external-link safety pairing. */}
            <a
              href="https://www.linkedin.com/in/felipeaela/"
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic="true"
              className="text-white group hover-target flex items-center gap-3 glass px-8 py-5 rounded-full hover:bg-white transition-all duration-500 hover:scale-105 shadow-lg will-change-transform"
            >
              <LinkedinIcon className="w-5 h-5 text-white group-hover:text-black transition-colors duration-500" />
              <span className="font-mono text-xs uppercase tracking-[0.22em] font-medium group-hover:text-black transition-colors duration-500">
                LinkedIn
              </span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={500}>
          <div className="mt-12 flex flex-col items-center gap-2 text-center">
            <p className="font-mono text-[11px] md:text-xs font-medium tracking-[0.28em] uppercase text-white">
              Designing Digital Products since 2009
            </p>
            <p className="font-mono text-[10px] md:text-[11px] font-medium tracking-[0.28em] uppercase text-zinc-400">
              Based in Prague, Czechia · hello@philg.cz
            </p>
          </div>
        </Reveal>
      </div>

      <div className="w-full mt-auto pt-24 pb-12 overflow-hidden pointer-events-none mix-blend-overlay relative flex opacity-50">
        <div className="animate-marquee flex whitespace-nowrap shrink-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="text-6xl md:text-[8vw] font-black tracking-tighter uppercase text-white/40 mx-8 shine-text"
            >
              ARCHITECTING ENTERPRISE VELOCITY ·{" "}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom rail: ONE row, three columns. © PHIL G. on the
          extreme left, build credits ('Zero to live in 3 days …
          Figma never opened') anchored to the dead center of the
          page, AVAILABLE FOR NEW CLIENTS on the extreme right.
          - The credits paragraph sits in an absolutely-centered
            child so its position is anchored to the row's center
            regardless of how wide the left/right columns are. The
            two side columns flex naturally and never push the
            credits off-axis.
          - max-w-2xl on the credits caps its width so very wide
            viewports don't let it expand into the side elements.
          - On mobile the row stacks vertically (flex-col) since
            three editorial elements on one line can't fit; desktop
            (md+) goes back to the single horizontal row. */}
      <div className="relative w-full px-6 md:px-12 lg:px-24 mt-12 md:mt-16 z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0 text-zinc-400 font-mono text-[10px] md:text-xs font-medium tracking-[0.22em] uppercase">
        <span className="md:flex-1 md:text-left text-center">
          © {YEAR} PHIL G.
        </span>
        {/* Build credits on TWO lines:
              Line 1: timeline + vibe-code + git
              Line 2: deploy target + the Figma strikethrough
            Hard <br /> forces the split regardless of viewport
            so the cadence reads as two distinct beats. */}
        <p className="md:absolute md:left-1/2 md:-translate-x-1/2 font-mono text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-zinc-400 text-center leading-relaxed max-w-2xl pointer-events-none">
          <span className="text-white">Zero to live in 3 days</span> ·
          Vibe-coded in Claude Code · Git-versioned
          <br />
          Shipped on Vercel ·{" "}
          <span
            style={{
              textDecoration: "line-through",
              textDecorationThickness: "0.06em",
              textDecorationColor: "rgba(168, 168, 175, 0.9)",
            }}
          >
            Figma
          </span>{" "}
          never opened
        </p>
        <div className="md:flex-1 flex md:justify-end justify-center">
          <AvailabilityBadge variant="compact" onClick={onOpenForm} />
        </div>
      </div>
    </footer>
  );
}
