"use client";

import { Reveal } from "@/components/ui/Reveal";

/**
 * Trusted By section: full-bleed double-marquee with monumental typography.
 *
 * Design intent:
 *   - The eyebrow + monumental headline carry the *meaning*.
 *   - The marquee carries the *evidence*: 12 wordmarks, set big and tracked.
 *   - Two rows scroll in opposite directions at slightly different speeds so
 *     the composition feels alive without ever syncing into a "tech demo" loop.
 *   - Edge fades dissolve the rows into the page; nothing is "stuck on top of"
 *     the layout.
 *   - Each wordmark passes from washed-out to full white on hover, so a
 *     visitor can pause and read any one of them.
 *
 * The IBM Plex Mono kicker keeps tonal consistency with the rest of the page.
 * The IBM-blue dot dividers tie this section to the global accent system.
 */

const CLIENTS = [
  "Walmart",
  "VMware",
  "Pivotal",
  "SAP",
  "Kuoni Tumlare",
  "Cemex",
  "Vodafone",
  "WWF / OpenSC",
  "Royal Air Force",
  "Azul",
  "Microsoft",
  "GoodNotes",
];

// Duplicate so the -50% translate marquee loops seamlessly.
const ROW = [...CLIENTS, ...CLIENTS];

type RowProps = {
  reverse?: boolean;
};

function MarqueeRow({ reverse = false }: RowProps) {
  return (
    <div
      className={`${
        reverse ? "animate-marquee-reverse" : "animate-marquee-slow"
      } items-center`}
    >
      {ROW.map((name, i) => (
        <span
          key={`${name}-${i}`}
          className="flex items-center gap-10 md:gap-16 lg:gap-20 pr-10 md:pr-16 lg:pr-20"
        >
          <span className="font-bold text-4xl md:text-6xl lg:text-7xl tracking-[-0.015em] uppercase text-white/55 hover:text-white transition-colors duration-500 whitespace-nowrap leading-none">
            {name}
          </span>
          {/* Refined dot divider: solid blue core inside a softer ring */}
          <span
            aria-hidden
            className="relative w-3.5 h-3.5 rounded-full bg-[#0f62fe]/20 shrink-0 flex items-center justify-center"
          >
            <span className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.7)]" />
          </span>
        </span>
      ))}
    </div>
  );
}

export function Clients() {
  return (
    <section
      id="clients"
      className="py-24 md:py-32 relative z-10 border-t border-b border-white/5 overflow-hidden"
    >
      {/* Ambient glow under the marquee. Anchors the section visually. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[1200px] h-[400px] bg-[#0f62fe]/[0.06] blur-[120px] rounded-full"
      />

      <div className="px-6 md:px-12 lg:px-24 relative z-10">
        <Reveal>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
            <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
              <span className="text-zinc-600">01 ·</span> Trusted By
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <p className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.05] max-w-5xl mb-16 md:mb-20 text-white">
            From Fortune 500 enterprises to category-leading scale-ups.{" "}
            <span className="shine-text italic font-serif font-light">
              17 years
            </span>{" "}
            <span className="text-zinc-500 font-light">
              building products with the world&apos;s most demanding teams.
            </span>
          </p>
        </Reveal>
      </div>

      {/* Full-bleed double marquee, framed top + bottom by hairline rules */}
      <Reveal delay={200}>
        <div className="relative w-full border-y border-white/5">
          {/* Edge fade masks: dissolve the rows into the page background */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 md:w-64 lg:w-80 z-10 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/95 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 md:w-64 lg:w-80 z-10 bg-gradient-to-l from-[#0a0a0c] via-[#0a0a0c]/95 to-transparent" />

          <div className="flex flex-col gap-6 md:gap-10 py-8 md:py-10">
            <MarqueeRow />
            <MarqueeRow reverse />
          </div>
        </div>
      </Reveal>

      <div className="px-6 md:px-12 lg:px-24 relative z-10">
        <Reveal delay={300}>
          <p className="mt-16 md:mt-20 max-w-2xl font-mono text-[11px] md:text-xs font-medium tracking-[0.22em] uppercase text-zinc-500">
            <span className="text-white">12 enterprise engagements</span> ·
            Walmart, VMware, Microsoft, SAP, Cemex, Vodafone, Royal Air Force,
            WWF. And counting.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
