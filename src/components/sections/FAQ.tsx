"use client";

import { ArrowUpRight } from "@/components/icons/Icons";
import { Reveal } from "@/components/ui/Reveal";

type FAQProps = {
  /**
   * Callback that opens the same ProjectFormModal the footer uses.
   * Wires the FAQ's secondary CTA into the site's single conversion
   * surface so visitors converge on one form regardless of where they
   * decide to engage.
   */
  onOpenForm: () => void;
};

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
    a: "Yes. Most engagements have me leading or coaching the team you already have, not replacing it. At Kuoni Tumlare I hired six designers and led a twelve-person team in Prague behind one AI-ready design system.",
  },
  {
    num: "Q05",
    q: "Discovery sprint, prototype sprint, or full engagement?",
    a: "Any of the three. A 3-week paid discovery sprint is the typical entry. A 6-week prototype sprint follows. Up to 12 months of embedded design leadership is the deepest. Same operator across all three.",
  },
  {
    num: "Q06",
    q: "Where are you based? What timezones do you cover?",
    a: "Prague (CET / CEST). I've worked synchronously with teams across the US (east + west coast), Asia, Europe, and India. Cemex alone spanned Mexico, Egypt, Philippines, and Texas under one design org.",
  },
  {
    num: "Q07",
    q: "Enterprise procurement. NDAs, MSAs, vendor onboarding?",
    a: "All standard. Walmart, VMware, Pivotal Labs, Microsoft, SAP, Cemex, Vodafone, Royal Air Force, and Kuoni Tumlare all signed off. NDA, MSA, SOW, and DPA where required. Vendor onboarding usually takes 1-2 weeks.",
  },
  {
    num: "Q08",
    q: "What does this cost?",
    a: "Project-based or daily rate, depending on the engagement model. I share concrete options after a 30-min intro once I understand your scope, timeline, and team setup. No proposal decks for free.",
  },
];

export function FAQ({ onOpenForm }: FAQProps) {
  return (
    <section
      id="faq"
      className="relative z-10 py-32 md:py-40 px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
            <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
              <span className="text-zinc-400">09 ·</span> Common Questions
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

        {/*
          Lifted closing-CTA card. Prominent enough to read as a clear
          next step, not a footnote. Glass surface + IBM-blue accent
          border + soft accent shadow pull the eye. Clicking the button
          opens the SAME ProjectFormModal as the footer's monumental
          'Initiate Project' button, so all conversion surfaces funnel
          to one form.
        */}
        <Reveal delay={700}>
          <div className="mt-4 glass rounded-3xl p-8 md:p-10 border border-[#0f62fe]/25 hover:border-[#0f62fe]/40 shadow-[0_20px_60px_rgba(15,98,254,0.12)] flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10 transition-all duration-500">
            <div className="flex-1">
              <h4 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug mb-2">
                Got a question that&apos;s not here?
              </h4>
              <p className="text-zinc-400 font-light text-base md:text-lg">
                Let&apos;s talk it through on a 30-min call.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenForm}
              data-magnetic="true"
              className="shrink-0 group flex items-center gap-3 text-white font-mono font-medium tracking-[0.18em] uppercase text-xs hover-target px-8 py-5 rounded-full border-2 border-[#0f62fe] bg-[#0f62fe]/10 hover:bg-[#0f62fe] hover:shadow-[0_0_30px_rgba(15,98,254,0.5)] transition-all duration-500 ease-[var(--ease-out)] whitespace-nowrap"
            >
              <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
              <span>Book a 30-min intro</span>
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
