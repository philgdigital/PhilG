"use client";

import { Reveal } from "@/components/ui/Reveal";

/**
 * Aphorism interstitial. Phil-authored one-liners used as editorial
 * breathing moments between sections.
 *
 * Pattern borrowed from end.game's punchy aphorisms ("Code is truth,
 * documentation is opinion.") but the words are Phil's. NOT a client
 * testimonial. There's a separate PullQuote component for that.
 *
 * Layout: full-bleed, generous vertical padding, centered, large
 * serif italic display weight. No quote glyph, no attribution. The
 * words alone carry the moment.
 *
 * The hairline rules top + bottom and a faint blue dot below the lines
 * mark this as a structural pause, not just a paragraph.
 */

type AphorismProps = {
  /** One short phrase per line. Two lines reads cleanest. */
  lines: string[];
  /** Optional anchor id for the section. */
  id?: string;
};

export function Aphorism({ lines, id }: AphorismProps) {
  return (
    <section
      id={id}
      className="relative z-10 py-24 md:py-32 px-6 md:px-12 lg:px-24"
      style={{
        // Soft vertical gradient. No border-y rules, no hard edges -
        // the darker band feathers into the page from both top and
        // bottom so the visitor reads the editorial pause as a
        // breathing moment, not a boxed section.
        background:
          "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.42) 18%, rgba(0,0,0,0.42) 82%, rgba(0,0,0,0) 100%)",
      }}
    >
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {lines.map((line, i) => (
          <Reveal key={i} delay={i * 120}>
            <p className="font-serif italic font-light text-5xl md:text-7xl lg:text-8xl text-white/85 leading-[1.1] tracking-tight">
              {line}
            </p>
          </Reveal>
        ))}

        <Reveal delay={lines.length * 120 + 100}>
          <span
            aria-hidden
            className="block mx-auto mt-10 md:mt-14 w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_12px_rgba(15,98,254,0.7)]"
          />
        </Reveal>
      </div>
    </section>
  );
}
