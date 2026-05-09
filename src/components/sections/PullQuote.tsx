"use client";

import { Reveal } from "@/components/ui/Reveal";

/**
 * Editorial pull-quote interstitial.
 *
 * Sits between Advantage and ImpactMetrics as a single-quote breathing
 * moment. Treats one client voice as a transition rather than a card in
 * a grid. EPAM / McKinsey / Accenture-Song use this same move to mark
 * narrative beats: setup -> client validation -> evidence.
 *
 * Source: Jon Vieira, Product Design Lead at Meta Reality Labs.
 * Chosen because the quote ("a designer who doesn't worry about design,
 * his main concern is making work that brings results") directly validates
 * the Product Builder thesis without saying it. Attribution carries the
 * Meta name, which matters here.
 */
export function PullQuote() {
  return (
    <section
      id="pull-quote"
      className="relative z-10 border-y border-white/5 py-32 md:py-48 px-6 md:px-12 lg:px-24 overflow-hidden"
    >
      {/* Soft ambient glow centered behind the quote, anchors the moment */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[#0f62fe]/[0.05] blur-[140px] rounded-full"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <Reveal>
          {/* Open-quote glyph in serif italic, washed out so it reads as
              decoration rather than text. Hangs above the quote like a
              pull-quote in a printed magazine. */}
          <span
            aria-hidden
            className="block font-serif italic font-light text-8xl md:text-9xl leading-none text-[#4589ff]/25 mb-2 md:mb-4 select-none"
          >
            &ldquo;
          </span>
        </Reveal>

        <Reveal delay={120}>
          <blockquote className="font-serif italic font-light text-3xl md:text-5xl lg:text-6xl tracking-tight leading-[1.15] text-white max-w-5xl">
            A designer who doesn&apos;t worry about design. His main concern is
            making work that brings results.
          </blockquote>
        </Reveal>

        <Reveal delay={240}>
          <figcaption className="mt-12 md:mt-16 flex items-center gap-4">
            <span
              aria-hidden
              className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]"
            />
            <p className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
              <span className="text-white">Jon Vieira</span> · Product Design
              Lead at Meta Reality Labs
            </p>
          </figcaption>
        </Reveal>
      </div>
    </section>
  );
}
