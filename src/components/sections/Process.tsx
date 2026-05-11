"use client";

import {
  Workflow,
  Cpu,
  Sparkles,
  Code2,
  ArrowUpRight,
  type IconComponent,
} from "@/components/icons/Icons";
import { Reveal } from "@/components/ui/Reveal";

type ProcessProps = {
  /**
   * Opens the ProjectFormModal (same one the Footer's monumental
   * 'Initiate Project' button uses). Wires the Process section's
   * secondary CTA into the site's single conversion surface.
   */
  onOpenForm: () => void;
};

/**
 * Process section. "How I Work" rendered as a vertical step-by-step
 * storyline (not a grid of cards).
 *
 * Each of the four steps becomes a chapter in a narrative scroll. A
 * central vertical thread runs top to bottom; an icon medallion sits
 * on the thread at each step. Content (number + title + description)
 * alternates left/right of the thread to give the storyline visual
 * rhythm and prevent monotony.
 *
 * Durations intentionally omitted: engagement length varies per
 * project. The sequence is fixed; the cadence depends on the team.
 *
 * Visual interaction:
 *   - Each step reveals on scroll (existing Reveal component).
 *   - Hovering the icon medallion lights up the step (scale, glow,
 *     thread color shifts toward emerald in the icon's neighborhood).
 *   - Active step icon has an outer pulse ring.
 */

type Step = {
  num: string;
  title: string;
  desc: string;
  icon: IconComponent;
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "Discover",
    desc: "User research, customer interviews, jobs-to-be-done, journey mapping. You leave with a discovery readout your leadership team can act on.",
    icon: Workflow,
  },
  {
    num: "02",
    title: "Prototype",
    desc: "AI-native rapid prototyping. Custom GPTs, generative UI, and real React components grounded in your design tokens. Not a deck. A clickable product.",
    icon: Cpu,
  },
  {
    num: "03",
    title: "Iterate",
    desc: "Embedded with your team. Weekly sprints, working sessions, design reviews. Roadmap decisions backed by real user data, not guesswork.",
    icon: Sparkles,
  },
  {
    num: "04",
    title: "Ship",
    desc: "Production-ready React + Tailwind in your repo. AI-ready design system. Engineers use what I deliver because it was built to be used, not handed off.",
    icon: Code2,
  },
];

type StepRowProps = {
  step: Step;
  alignLeft: boolean;
  isLast: boolean;
};

function StepRow({ step, alignLeft, isLast }: StepRowProps) {
  const Icon = step.icon;
  return (
    <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-12 lg:gap-20 items-center pb-20 md:pb-28 last:pb-0">
      {/* LEFT cell: content (only when alignLeft = true on md+) */}
      <div
        className={`order-2 md:order-1 ${
          alignLeft ? "" : "md:invisible md:pointer-events-none"
        } ${alignLeft ? "md:text-right" : ""}`}
      >
        {alignLeft && <StepContent step={step} alignRight />}
      </div>

      {/* CENTER cell: icon medallion sits on the thread */}
      <div className="order-1 md:order-2 flex md:block justify-start md:justify-center relative">
        <Reveal direction="none">
          <div className="group relative">
            {/* Outer pulse ring on hover */}
            <div className="absolute inset-0 rounded-full bg-[#0f62fe]/0 group-hover:bg-[#0f62fe]/20 blur-2xl scale-150 group-hover:scale-[2] transition-all duration-700" />
            {/* Medallion */}
            <div className="relative bg-[#0a0a0c] border-2 border-[#0f62fe]/40 rounded-full p-5 md:p-6 group-hover:border-[#0f62fe] group-hover:scale-110 transition-all duration-500 z-10">
              <Icon className="w-7 h-7 md:w-9 md:h-9 text-[#4589ff] drop-shadow-[0_0_15px_rgba(15,98,254,0.6)] group-hover:text-white transition-colors duration-500" />
            </div>
          </div>
        </Reveal>
      </div>

      {/* RIGHT cell: content (only when alignLeft = false on md+) */}
      <div
        className={`order-3 ${
          !alignLeft ? "" : "md:invisible md:pointer-events-none"
        }`}
      >
        {!alignLeft && <StepContent step={step} alignRight={false} />}
      </div>

      {/* MOBILE content: stacked below the icon. Renders only on mobile
          since md+ uses the alternating columns above. */}
      <div className="order-3 md:hidden col-span-1 -mt-4">
        <StepContent step={step} alignRight={false} />
      </div>

      {/* Hide order-3 mobile when both desktop cells are visible.
          Actual mobile rendering uses this single block. The md:hidden
          ensures clean fall-through on mobile. */}
      <span aria-hidden className="sr-only">
        {isLast ? "End of process" : ""}
      </span>
    </div>
  );
}

function StepContent({
  step,
  alignRight,
}: {
  step: Step;
  alignRight: boolean;
}) {
  return (
    <Reveal delay={120}>
      <div className={alignRight ? "md:ml-auto md:max-w-md" : "md:max-w-md"}>
        <div
          className={`flex items-baseline gap-4 mb-3 ${
            alignRight ? "md:justify-end" : ""
          }`}
        >
          <span className="font-serif italic font-light text-5xl md:text-6xl text-[#4589ff] leading-none tracking-tight">
            {step.num}
          </span>
          <span className="font-mono text-[10px] font-medium tracking-[0.22em] uppercase text-zinc-400">
            Step
          </span>
        </div>
        <h4 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight leading-[1.1]">
          {step.title}
        </h4>
        <p className="text-zinc-300 font-light text-base md:text-lg leading-relaxed">
          {step.desc}
        </p>
      </div>
    </Reveal>
  );
}

export function Process({ onOpenForm }: ProcessProps) {
  return (
    <section
      id="process"
      className="relative z-10 py-32 md:py-40 px-6 md:px-12 lg:px-24 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
            <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
              <span className="text-zinc-400">08 ·</span> How I Work
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] text-white tracking-tight max-w-5xl mb-8">
            From kickoff to shipped product.
            <br />
            <span className="shine-text italic font-serif font-light">
              In four steps
            </span>
            .
          </h3>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-zinc-400 font-light text-xl md:text-2xl max-w-3xl mb-20 md:mb-28 leading-relaxed">
            No 90-day onboarding. No 12-person agency team. Just me. One
            senior product builder, embedded with your squad, designing
            and shipping the actual product.
          </p>
        </Reveal>

        {/*
          Storyline container. A vertical gradient thread runs through
          the icon medallions. Content alternates left/right of the
          thread to give the narrative scroll visual rhythm.
        */}
        <div className="relative">
          {/* Central vertical thread (desktop). Sits behind the icon
              medallions which use a solid bg to hide the line where
              it would otherwise cut through them. */}
          <div
            aria-hidden
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-8 bottom-32 w-px bg-gradient-to-b from-[#0f62fe]/50 via-[#10b981]/30 to-[#0f62fe]/50 pointer-events-none"
          />
          {/* Mobile thread (left rail) */}
          <div
            aria-hidden
            className="md:hidden absolute left-[34px] top-8 bottom-32 w-px bg-gradient-to-b from-[#0f62fe]/40 via-[#10b981]/30 to-[#0f62fe]/40 pointer-events-none"
          />

          <div className="relative z-10">
            {STEPS.map((step, i) => (
              <StepRow
                key={step.num}
                step={step}
                alignLeft={i % 2 === 0}
                isLast={i === STEPS.length - 1}
              />
            ))}
          </div>
        </div>

        {/*
          Lifted closing-CTA card. Visually prominent next step that
          opens the same ProjectFormModal as the footer's 'Initiate
          Project' button. One conversion surface across the site.
        */}
        <Reveal delay={300}>
          <div className="mt-12 md:mt-16 glass rounded-3xl p-8 md:p-10 border border-[#0f62fe]/25 hover:border-[#0f62fe]/40 shadow-[0_20px_60px_rgba(15,98,254,0.12)] flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10 transition-all duration-500">
            <div className="flex-1">
              <h4 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug mb-2">
                Want to talk through whether this fits your team?
              </h4>
              <p className="text-zinc-400 font-light text-base md:text-lg">
                Let&apos;s walk through your context on a 30-min call.
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
