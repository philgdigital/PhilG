"use client";

import { Reveal } from "@/components/ui/Reveal";

/**
 * Anti-Pattern section. "Things I don't do. So we can move."
 *
 * Inspired by end.game's "No project managers managing project managers"
 * line and their broader negative-positioning move. In B2B leader hire,
 * what the buyer won't get is the strongest signal of what they will.
 * Removes the biggest fear (agency overhead) preemptively.
 *
 * Single-screen, pure typography. No cards, no images. Seven "No ..."
 * lines stacked vertically, each prefixed with a fading blue dot. A
 * one-line aphoristic close below the list ties the negative space
 * back to action.
 */

const ANTI_PATTERNS = [
  "No 90-day onboarding.",
  'No 12-person agency team.',
  'No "discovery decks".',
  "No design handoff friction.",
  "No buzzword roadmaps.",
  "No invoicing for slide decks.",
  "No PM managing the PM managing the PM.",
];

export function AntiPattern() {
  return (
    <section
      id="anti-pattern"
      className="relative z-10 py-32 md:py-40 px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-[1400px] mx-auto">
        <Reveal>
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
            <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
              <span className="text-zinc-400">10 ·</span> Anti-Pattern
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h3 className="headline-scroll text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] text-white tracking-tight max-w-4xl mx-auto text-center mb-16 md:mb-20">
            Things I don&apos;t do.{" "}
            <span className="shine-text italic font-serif font-light">
              So we can move
            </span>
            .
          </h3>
        </Reveal>

        {/* The list COLUMN centers in the section so the block reads
            as a deliberate centred statement instead of a flush-left
            inventory. Individual items keep `flex items-center` so
            dot + uppercase line still read left-to-right inside the
            centred column. */}
        <ul className="flex flex-col gap-5 md:gap-6 max-w-3xl mx-auto">
          {ANTI_PATTERNS.map((line, i) => (
            <Reveal key={line} delay={200 + i * 70}>
              <li className="flex items-center gap-5 md:gap-6 group">
                <span
                  aria-hidden
                  className="shrink-0 w-2 h-2 rounded-full bg-[#0f62fe]/40 group-hover:bg-[#0f62fe] group-hover:shadow-[0_0_10px_rgba(15,98,254,0.7)] transition-all duration-500"
                />
                <span className="font-mono text-base md:text-xl font-medium tracking-[0.04em] uppercase text-zinc-200 group-hover:text-white transition-colors duration-500">
                  {line}
                </span>
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={200 + ANTI_PATTERNS.length * 70 + 100}>
          <p className="mt-16 md:mt-20 pt-10 border-t border-white/8 font-serif italic font-light text-2xl md:text-3xl lg:text-4xl text-white/90 leading-snug max-w-2xl mx-auto text-center">
            Lean. Embedded. Shipping.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
