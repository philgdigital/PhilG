"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

export function About() {
  return (
    <section id="about" className="py-24 px-6 md:px-12 lg:px-24 relative z-10">
      <Reveal>
        <div className="flex items-center gap-4 mb-16">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            <span className="text-zinc-400">01 ·</span> The Architect
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
        <div className="lg:col-span-5 relative">
          <Reveal delay={100} direction="left">
            <TiltCard scale={1.02} maxRotation={5}>
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] border border-white/10 group bg-zinc-900/50">
                <ElectricBorder />
                {/* Phil's portrait. Source file is 1145x1473 (aspect
                    ~0.777) vs the container's aspect-[4/5] (aspect
                    0.8); object-cover scales the image to match the
                    container's WIDTH, which leaves ~3.6% excess
                    height to crop.
                    `object-bottom` anchors the bottom edge so the
                    NN/g Master Certified badge in the bottom-right
                    of the photo is GUARANTEED to be fully visible
                    and readable. The 3.6% trim moves entirely to
                    the top (just a sliver of background above
                    Phil's head, no head crop).
                    priority + quality 90 because this is
                    above-the-fold on the homepage and the badge
                    needs to stay legible at small render sizes.
                    Next.js auto-serves WebP/AVIF at the rendered
                    display size (~40vw on lg, full width below). */}
                <Image
                  src="/images/imgphil.jpg"
                  alt="Phil G., NN/g Certified UX Master."
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  priority
                  quality={90}
                  className="object-cover object-bottom grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[1500ms] ease-[var(--ease-out)] transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-80" />
              </div>
            </TiltCard>
          </Reveal>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <Reveal delay={200}>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-2 leading-tight">
              I design{" "}
              <em className="font-serif italic font-light text-zinc-400">
                and
              </em>{" "}
              build the <span className="shine-text">product.</span>
            </h3>
          </Reveal>

          {/* Both About body paragraphs share the SAME typography
              scale so they read as one editorial voice: text-lg
              md:text-xl, font-light, leading-relaxed, text-zinc-300.
              Previously the credentials paragraph was on a larger
              step (text-xl/2xl) and the seventeen-years paragraph
              was a step smaller (text-lg/xl) with a dimmer zinc-400
              tone, which read as two unrelated blocks. Unifying
              both at the smaller-but-readable body step keeps the
              long prose comfortable AND lets the highlighted
              white spans inside each paragraph do the visual lifting
              instead of the paragraph-level font size. */}
          <Reveal delay={300}>
            <p className="text-zinc-300 font-light text-lg md:text-xl leading-relaxed">
              I&apos;m a{" "}
              <span className="text-white font-medium">
                Certified UX Master by Nielsen Norman Group (NN/g)
              </span>
              ,{" "}
              <span className="text-white font-medium">
                IDEO Creative Leadership
              </span>{" "}
              graduate, and{" "}
              <span className="text-white font-medium">
                IBM Enterprise Design Thinking
              </span>{" "}
              practitioner with{" "}
              <span className="text-white font-medium">17+ years</span> driving
              digital transformation for the Fortune 500: Walmart, VMware,
              Pivotal Labs, Microsoft, SAP, WWF, Royal Air Force, Cemex,
              Vodafone, Kuoni Tumlare, and beyond.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <p className="text-zinc-300 font-light text-lg md:text-xl leading-relaxed">
              I&apos;m a{" "}
              <span className="text-white font-medium">product builder</span> who leads
              with design. Three force-multipliers:{" "}
              <span className="text-white font-medium">product discovery</span> that turns
              user research into board-room business outcomes,{" "}
              <span className="text-white font-medium">AI-native prototyping</span> that
              compresses ideation-to-shipped-code from quarters to days, and{" "}
              <span className="text-white font-medium">design leadership</span> that builds
              high-performing teams. At Kuoni Tumlare I hired six designers and
              led a twelve-person team in Prague behind a
              single AI-ready design system. Along the way{" "}
              <span className="text-white font-medium">
                I&apos;ve mentored 1,050+ designers who&apos;ve led at hundreds
                of firms
              </span>
              , including Meta, Booking.com, Uber, IBM, Accenture, SAP,
              Thoughtworks, Zalando, and Kuoni Tumlare across 11 countries.
            </p>
          </Reveal>

          {/* Chips split across TWO rows by container:
                Row 1 (3 wider chips): plain flex gap-4, left-aligned.
                  - Design Leadership, Product Discovery,
                    AI-Native Prototyping
                Row 2 (4 shorter chips): justify-between distributes
                  the 4 chips across the SAME width as row 1.
              The outer wrapper uses `w-fit` so its width shrinks
              to the widest child (= row 1's natural width). Row 2's
              `justify-between` then distributes its 4 chips within
              that same shrunk width, ending flush at row 1's right
              edge instead of pushing AGILE to the section's far
              edge with a huge gap. */}
          <Reveal delay={500}>
            <div className="flex flex-col gap-4 mt-6 w-fit max-w-full">
              <div className="flex flex-wrap gap-4">
                <span className="glass px-6 py-3 rounded-full text-white font-mono text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase">
                  Design Leadership
                </span>
                <span className="glass px-6 py-3 rounded-full text-white font-mono text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase">
                  Product Discovery
                </span>
                <span className="glass px-6 py-3 rounded-full text-[#4589ff] font-mono text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase border-[#0f62fe]/20 shadow-[0_0_15px_rgba(15,98,254,0.15)]">
                  AI-Native Prototyping
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-y-4">
                <span className="glass px-6 py-3 rounded-full text-white font-mono text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase">
                  Design Systems
                </span>
                <span className="glass px-6 py-3 rounded-full text-white font-mono text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase">
                  UX Research
                </span>
                <span className="glass px-6 py-3 rounded-full text-white font-mono text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase">
                  Systems Thinking
                </span>
                <span className="glass px-6 py-3 rounded-full text-white font-mono text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase">
                  Agile
                </span>
              </div>
            </div>
          </Reveal>

          {/* Languages row. Three flags + proficiency level, sitting
              under the skill chips as a separate editorial signature.
              EN = US flag (English is Phil's main working language
              with US-based teams); PT = Brazilian flag (Phil's
              native); ES = Spanish flag (working professional).
              Each flag is a small inline path-drawn SVG (no
              emoji-font dependency, identical render across
              platforms). The 'Fluent' tag on English gets the
              emerald accent so the eye registers the working
              language for client engagements at a glance. */}
          <Reveal delay={560}>
            <div className="flex flex-col gap-3 mt-4">
              <span className="font-mono text-[10px] md:text-[11px] font-medium tracking-[0.32em] uppercase text-zinc-400">
                <span className="text-[#4589ff] mr-2">·</span>
                Languages
              </span>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs md:text-sm tracking-[0.08em] text-zinc-300">
                <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
                  {/* US flag glyph. 13 horizontal stripes (alternating
                      red + white) + a dark-blue canton in the upper
                      hoist with a 6-row x 5-col star field (30 stars,
                      not 50, but reads as 'US flag' at this small
                      size without trying to count). All path-drawn so
                      no emoji-font dependency. */}
                  <svg
                    aria-label="United States"
                    role="img"
                    viewBox="0 0 60 32"
                    className="w-[1.7em] h-[1em] inline-block rounded-[2px] shadow-[0_0_0_1px_rgba(255,255,255,0.1)] shrink-0"
                  >
                    <rect width="60" height="32" fill="#bf0a30" />
                    {[1, 3, 5, 7, 9, 11].map((row) => (
                      <rect
                        key={`stripe-${row}`}
                        y={row * (32 / 13)}
                        width="60"
                        height={32 / 13}
                        fill="#fff"
                      />
                    ))}
                    <rect width="24" height={(32 / 13) * 7} fill="#002868" />
                    {Array.from({ length: 5 }).flatMap((_, col) =>
                      Array.from({ length: 4 }).map((_, row) => (
                        <circle
                          key={`star-${col}-${row}`}
                          cx={3 + col * 4.5}
                          cy={2 + row * 4}
                          r={0.9}
                          fill="#fff"
                        />
                      )),
                    )}
                  </svg>
                  <span className="font-medium text-white">English</span>
                  <span className="text-emerald-400 text-[11px] tracking-[0.16em] uppercase">Fluent</span>
                </span>
                <span aria-hidden className="text-zinc-700">·</span>
                <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
                  <svg
                    aria-label="Brazil"
                    role="img"
                    viewBox="0 0 60 42"
                    className="w-[1.7em] h-[1em] inline-block rounded-[2px] shadow-[0_0_0_1px_rgba(255,255,255,0.1)] shrink-0"
                  >
                    <rect width="60" height="42" fill="#009C3B" />
                    <polygon points="30,4 56,21 30,38 4,21" fill="#FFDF00" />
                    <circle cx="30" cy="21" r="8" fill="#002776" />
                    <path d="M22,21 Q30,17 38,21" fill="none" stroke="#fff" strokeWidth="1.2" />
                  </svg>
                  <span className="font-medium text-white">Portuguese</span>
                  <span className="text-zinc-400 text-[11px] tracking-[0.16em] uppercase">Native</span>
                </span>
                <span aria-hidden className="text-zinc-700">·</span>
                <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
                  <svg
                    aria-label="Spain"
                    role="img"
                    viewBox="0 0 60 40"
                    className="w-[1.7em] h-[1em] inline-block rounded-[2px] shadow-[0_0_0_1px_rgba(255,255,255,0.1)] shrink-0"
                  >
                    <rect width="60" height="40" fill="#AA151B" />
                    <rect y="10" width="60" height="20" fill="#F1BF00" />
                  </svg>
                  <span className="font-medium text-white">Spanish</span>
                  <span className="text-zinc-400 text-[11px] tracking-[0.16em] uppercase">Professional</span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
