"use client";

import { ArrowUpRight } from "@/components/icons/Icons";
import { Reveal } from "@/components/ui/Reveal";

/**
 * FAQ section. "Common Questions".
 *
 * Conversion driver: kill enterprise objections before they delay or
 * block the contact CTA. Eight questions answered concisely in a
 * scannable card grid (no accordions; full answer always visible so the
 * eye scans them on first scroll).
 *
 * Cards are uniform height, mono "Q01..Q08" prefixes mirror the
 * editorial section-numbering pattern the site uses everywhere.
 */

type FAQ = {
  num: string;
  q: string;
  a: string;
};

const FAQS: FAQ[] = [
  {
    num: "Q01",
    q: "You design AND ship code. How does that actually work?",
    a: "Two outputs every sprint: Figma source of truth + production React/Tailwind committed to your repo. Same person, same week. No design handoff friction. Engineers don't rebuild what I deliver; they extend it.",
  },
  {
    num: "Q02",
    q: "Solo operator. What if my engineering org is 50 people?",
    a: "I embed inside larger teams. At Pivotal Labs I worked alongside three Fortune 500 engineering organisations; at Cemex I led design embedded with 22 squads across four regions. The constraint isn't team size, it's how design integrates with delivery.",
  },
  {
    num: "Q03",
    q: "What's the actual AI tooling you use?",
    a: "Custom GPTs trained on your brand and design tokens. AI agents for research synthesis. Generative UI for prompt-to-React. An AI-ready design system in code. The full stack is in section 09, The AI Lab.",
  },
  {
    num: "Q04",
    q: "Can you lead my existing design team?",
    a: "Yes. Most engagements have me leading or coaching the team you already have, not replacing it. At Kuoni Tumlare I hired six designers and led a twelve-person team across Europe, Asia, and India behind one AI-ready design system.",
  },
  {
    num: "Q05",
    q: "Discovery sprint, prototype sprint, or full engagement?",
    a: "Any of the three. A 2-week paid discovery sprint is the most common entry point. A 6-week prototype sprint follows. 6+ months of embedded design leadership is the deepest. Same operator across all three.",
  },
  {
    num: "Q06",
    q: "Where are you based? What timezones do you cover?",
    a: "Prague (CET / CEST). I've worked synchronously with teams across the US (east + west coast), Asia, Europe, and India. Cemex alone spanned Mexico, Egypt, Philippines, and Texas under one design org.",
  },
  {
    num: "Q07",
    q: "Enterprise procurement. NDAs, MSAs, vendor onboarding?",
    a: "All standard. Walmart, VMware, Microsoft, SAP, Cemex, Vodafone, Royal Air Force, and Kuoni Tumlare all signed off. NDA, MSA, SOW, and DPA where required. Vendor onboarding usually takes 1-2 weeks.",
  },
  {
    num: "Q08",
    q: "What does this cost?",
    a: "Project-based or daily rate, depending on the engagement model. I share concrete options after a 30-min intro once I understand your scope, timeline, and team setup. No proposal decks for free.",
  },
];

const INTRO_HREF =
  "mailto:hello@philg.cz?subject=Intro%20call%20with%20Phil%20G.&body=Hi%20Phil%2C%0A%0AI%27d%20like%20to%20book%20a%2030-min%20intro%20call.%20Here%27s%20what%20I%27m%20thinking%3A%0A%0A";

export function FAQ() {
  return (
    <section
      id="faq"
      className="relative z-10 py-32 md:py-40 px-6 md:px-12 lg:px-24 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
            <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
              <span className="text-zinc-400">10 ·</span> Common Questions
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] text-white tracking-tight max-w-5xl mb-16 md:mb-20">
            Questions enterprise leaders ask.{" "}
            <span className="shine-text italic font-serif font-light">
              Answers before the call
            </span>
            .
          </h3>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 md:gap-6 mb-16 md:mb-20">
          {FAQS.map((item, i) => (
            <Reveal key={item.num} delay={150 + i * 60}>
              <div className="group glass h-full rounded-2xl p-7 md:p-8 border-white/5 hover:border-[#0f62fe]/30 hover:shadow-[0_10px_30px_rgba(15,98,254,0.10)] transition-all duration-500 flex flex-col gap-4">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-[10px] md:text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
                    {item.num}
                  </span>
                  <h4 className="text-lg md:text-xl font-medium text-white leading-snug tracking-tight">
                    {item.q}
                  </h4>
                </div>
                <p className="text-zinc-400 font-light text-[15px] md:text-base leading-relaxed group-hover:text-zinc-200 transition-colors pl-12 md:pl-14">
                  {item.a}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={700}>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-10 border-t border-white/8">
            <p className="text-zinc-300 text-base md:text-lg font-light">
              Got a question that&apos;s not here?
            </p>
            <a
              href={INTRO_HREF}
              data-magnetic="true"
              className="group flex items-center gap-3 text-white font-mono font-medium tracking-[0.18em] uppercase text-xs hover-target px-6 py-4 rounded-full border border-white/20 hover:bg-white transition-all duration-500 ease-[var(--ease-out)] whitespace-nowrap"
            >
              <ArrowUpRight className="w-4 h-4 text-white group-hover:text-black transition-all duration-500 group-hover:rotate-45" />
              <span className="group-hover:text-black transition-colors duration-500">
                Book a 30-min intro
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
