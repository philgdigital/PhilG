"use client";

import { Reveal } from "@/components/ui/Reveal";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  /** Featured quotes get serif italic display weight + col-span-2 on lg. */
  featured?: boolean;
};

/**
 * Curated Client Voice wall. Editorial bento, not a uniform masonry.
 *
 * Two featured quotes (serif italic, larger, col-span-2 on lg) anchor the
 * grid, chosen for highest brand signal: Pavel Petroshenko (Azul VP) +
 * Jon Vieira (Meta Reality Labs). Five regular cards fill the rest with
 * sans body type. Each card carries an open-quote glyph in serif italic,
 * an initials avatar, and mono attribution. Hover lifts + electric-borders.
 *
 * Reduced from 22 to 7 to give each voice room to breathe. Full archive
 * was great for "wall of social proof", but readability suffered. This
 * arrangement reads as curated journalism instead of a stack.
 */
const TESTIMONIALS: Testimonial[] = [
  {
    featured: true,
    quote:
      "Phil stands out as an extraordinarily skilled and professional UI/UX design leader. His expertise is particularly evident in complex, challenging projects.",
    name: "Pavel Petroshenko",
    role: "VP of Product Management at Azul",
  },
  {
    quote:
      "Phil is in a league of his own. A true embodiment of agile principles who knows how to attract a team's attention to the outcomes that matter.",
    name: "David Kendall",
    role: "Product Leader · 0→1 Innovation · AI/ML",
  },
  {
    quote:
      "Phil was instrumental in helping us develop our design practice. He set a high bar for what quality and effective product design looks like.",
    name: "Isabelle Berner",
    role: "AI Product Leader · Ex-Pivotal Labs",
  },
  {
    quote:
      "Extremely user-focused. Thoughtful about each detail and able to explain his design decisions. A supportive co-worker who takes time to connect.",
    name: "Shani Abada, PhD",
    role: "Executive Director, Conversational AI at JP Morgan Chase",
  },
  {
    quote:
      "A capable and thoughtful design leader. Phil delivered our first user research-led improvements and led our first multi-disciplinary discovery efforts.",
    name: "Kevin Olsen",
    role: "GM EMEA at Mechanical Orchard",
  },
  {
    featured: true,
    quote:
      "A designer who doesn't worry about design. His main concern is making work that brings results. He's one of those guys you need when you want to make things really happen.",
    name: "Jon Vieira",
    role: "Product Design Lead at Meta Reality Labs",
  },
  {
    quote:
      "If you want your product to succeed, you want Phil on your team. With conversion and results in mind, he can take any failing product and bring it back to life.",
    name: "Sean Berg",
    role: "Senior UX Designer at Workday",
  },
  {
    quote:
      "What sets Phil apart is his strong business acumen. When he designs a product, he considers every possible impact on the business.",
    name: "Martin J. Stojka",
    role: "CEO at Jimmy Technologies",
  },
  {
    quote:
      "I highly recommend Phil to any company looking for a passionate UX Designer with global experience, robust processes, and a drive for innovation.",
    name: "Demian Borba",
    role: "Founder & CEO at Pactto",
  },
];

/**
 * Initials extractor: 'Pavel Petroshenko' -> 'PP', 'Shani Abada, PhD' -> 'SA'.
 * Two letters max so the avatar circle reads cleanly at small sizes.
 */
function initialsOf(name: string): string {
  const cleaned = name.replace(/,.*$/, "").trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-32 px-6 md:px-12 lg:px-24 relative z-10 border-t border-white/5"
    >
      <Reveal>
        <div className="flex items-center gap-4 mb-12">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            <span className="text-zinc-400">06 ·</span> Client Voice
          </h2>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <h3 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight text-white tracking-tight max-w-4xl mb-20">
          Trusted by people who&apos;ve shipped at the{" "}
          <span className="shine-text italic font-serif">highest level</span>.
        </h3>
      </Reveal>

      {/*
        Editorial bento grid with hierarchy.
        - Two featured quotes (col-span-2 on lg) get serif italic display
          weight; chosen for highest brand signal (Azul VP, Meta Reality Labs).
        - Five regular cards in sans body type fill the remaining cells.
        - Each card carries an oversized open-quote glyph at top-left, an
          initials avatar circle at bottom-left, and mono attribution.
        - Hover: lift + IBM-blue border + soft shadow.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 items-stretch">
        {TESTIMONIALS.map((t, i) => {
          const isFeatured = !!t.featured;
          return (
            <Reveal
              key={t.name}
              delay={i * 60}
              className={isFeatured ? "lg:col-span-2" : ""}
            >
              <figure
                className={`group relative h-full glass rounded-2xl border-white/5 hover:border-[#0f62fe]/35 hover:shadow-[0_12px_40px_rgba(15,98,254,0.14)] transition-all duration-500 will-change-transform overflow-hidden flex flex-col ${
                  isFeatured ? "p-8 md:p-12" : "p-7 md:p-8"
                }`}
              >
                {/* Open-quote glyph as decorative wash, top-left.
                    Serif italic, IBM-blue tinted, big enough to read as
                    pull-quote treatment without dominating the card. */}
                <span
                  aria-hidden
                  className={`select-none font-serif italic font-light leading-none text-[#4589ff]/20 group-hover:text-[#4589ff]/35 transition-colors duration-500 ${
                    isFeatured
                      ? "text-7xl md:text-8xl mb-2"
                      : "text-5xl md:text-6xl mb-1"
                  }`}
                >
                  &ldquo;
                </span>

                <blockquote
                  className={`${
                    isFeatured
                      ? "font-serif italic font-light text-2xl md:text-3xl lg:text-4xl leading-[1.3] text-white"
                      : "text-zinc-200 font-light text-[15px] md:text-base leading-relaxed"
                  } mb-8`}
                >
                  {t.quote}
                </blockquote>

                <figcaption className="mt-auto flex items-center gap-4 pt-5 border-t border-white/8">
                  {/* Initials avatar circle. Subtle blue gradient bg so it
                      reads as a tasteful identity marker, not a stock photo. */}
                  <span
                    aria-hidden
                    className="shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-mono text-[11px] md:text-xs font-medium tracking-[0.08em] text-white border border-white/15 bg-gradient-to-br from-[#0f62fe]/30 to-[#10b981]/15 backdrop-blur-md group-hover:border-[#0f62fe]/50 group-hover:scale-105 transition-all duration-500"
                  >
                    {initialsOf(t.name)}
                  </span>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span
                      className={`text-white font-medium tracking-wide truncate ${
                        isFeatured ? "text-base md:text-lg" : "text-sm"
                      }`}
                    >
                      {t.name}
                    </span>
                    <span className="font-mono text-[10px] font-medium tracking-[0.16em] uppercase text-zinc-400 leading-snug">
                      {t.role}
                    </span>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
