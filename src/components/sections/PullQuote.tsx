"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Editorial pull-quote interstitial.
 *
 * Sits between Advantage and ImpactMetrics as a single-quote breathing
 * moment. Treats one client voice as a transition rather than a card in
 * a grid. EPAM / McKinsey / Accenture-Song use this same move to mark
 * narrative beats: setup -> client validation -> evidence.
 *
 * Quotes rotate on every page load. Curated list below: 6 punchy lines
 * pulled from the Testimonials wall, each ≤ ~135 chars so it reads
 * cleanly at display weight. Picks favoring product-builder framing,
 * recognizable companies, and varied source seniority.
 *
 * Hydration-safe: SSR + first paint render QUOTES[0] (deterministic).
 * useEffect runs client-side post-mount and swaps to a random pick.
 * Because the section is below the fold and animates in via Reveal,
 * the swap completes before the user actually sees it.
 */

type QuoteSource = {
  quote: string;
  name: string;
  role: string;
};

const QUOTES: QuoteSource[] = [
  {
    quote:
      "A designer who doesn't worry about design. His main concern is making work that brings results.",
    name: "Jon Vieira",
    role: "Product Design Lead at Meta Reality Labs",
  },
  {
    quote: "If you want your product to succeed, you want Phil on your team.",
    name: "Sean Berg",
    role: "Senior UX Designer at Workday",
  },
  {
    quote:
      "Phil stands out as an extraordinarily skilled and professional UI/UX design leader.",
    name: "Pavel Petroshenko",
    role: "VP of Product Management at Azul",
  },
  {
    quote:
      "Phil is in a league of his own. A true embodiment of agile principles, focused on the outcomes that matter.",
    name: "David Kendall",
    role: "Product Leader · 0→1 Innovation · AI/ML",
  },
  {
    quote:
      "What sets Phil apart is his strong business acumen. When he designs a product, he considers every possible impact on the business.",
    name: "Martin J. Stojka",
    role: "CEO at Jimmy Technologies",
  },
  {
    quote:
      "Phil is certainly the best designer I'd ever worked with. Creative, fast and assertive.",
    name: "Bruno Fisbhen",
    role: "Founder & CEO at ColaboraApp",
  },
];

export function PullQuote() {
  // Initial render uses QUOTES[0] so SSR and client first-paint match
  // (avoiding hydration mismatch). After mount we pick a random quote.
  // The set-state-in-effect lint rule (react-hooks/set-state-in-effect)
  // flags this pattern as a perf concern, but the cost here is a single
  // setState on mount of a one-time component, not a render cascade,
  // and the SSR-safe deferred-randomization is the entire point.
  const [quote, setQuote] = useState<QuoteSource>(QUOTES[0]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  return (
    <section
      id="pull-quote"
      className="relative z-10 py-32 md:py-48 px-6 md:px-12 lg:px-24 overflow-hidden"
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
            {quote.quote}
          </blockquote>
        </Reveal>

        <Reveal delay={240}>
          <figcaption className="mt-12 md:mt-16 flex items-center gap-4">
            <span
              aria-hidden
              className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]"
            />
            <p className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
              <span className="text-white">{quote.name}</span> · {quote.role}
            </p>
          </figcaption>
        </Reveal>
      </div>
    </section>
  );
}
