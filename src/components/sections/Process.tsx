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
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

/**
 * Process section. "How I Work".
 *
 * Conversion-focused: enterprise buyers want to know the engagement
 * model BEFORE they click Initiate. Four steps over a clear timeline
 * removes the "what am I signing up for" objection.
 *
 * 4 step cards in a 1/2/4 responsive grid. Each card: step number,
 * duration, icon, title, description. Cards are equal-height with
 * mt-auto on the description so the timing label aligns at the bottom.
 *
 * A low-commitment secondary CTA at the end ("Book a 30-min intro")
 * gives the visitor a friction-free alternative to the high-commitment
 * "Initiate Project" footer button.
 */

type Step = {
  num: string;
  duration: string;
  title: string;
  desc: string;
  icon: IconComponent;
};

const STEPS: Step[] = [
  {
    num: "01",
    duration: "Week 1",
    title: "Discover",
    desc: "User research, customer interviews, jobs-to-be-done, journey mapping. You leave the week with a discovery readout your leadership team can act on.",
    icon: Workflow,
  },
  {
    num: "02",
    duration: "Week 2",
    title: "Prototype",
    desc: "AI-native rapid prototyping. Custom GPTs, generative UI, and real React components grounded in your design tokens. Not a deck. A clickable product.",
    icon: Cpu,
  },
  {
    num: "03",
    duration: "Weeks 3+",
    title: "Iterate",
    desc: "Embedded with your team. Weekly sprints, working sessions, design reviews. Roadmap decisions backed by real user data, not guesswork.",
    icon: Sparkles,
  },
  {
    num: "04",
    duration: "Continuous",
    title: "Ship",
    desc: "Production-ready React + Tailwind in your repo. AI-ready design system. Engineers use what I deliver because it was built to be used, not handed off.",
    icon: Code2,
  },
];

const INTRO_HREF =
  "mailto:hello@philg.cz?subject=Intro%20call%20with%20Phil%20G.&body=Hi%20Phil%2C%0A%0AI%27d%20like%20to%20book%20a%2030-min%20intro%20call.%20Here%27s%20what%20I%27m%20thinking%3A%0A%0A";

export function Process() {
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
              <span className="text-zinc-600">09 ·</span> How I Work
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] text-white tracking-tight max-w-5xl mb-8">
            Three weeks from kickoff to your{" "}
            <span className="shine-text italic font-serif font-light">
              first shipped prototype
            </span>
            .
          </h3>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-zinc-400 font-light text-xl md:text-2xl max-w-3xl mb-16 md:mb-20 leading-relaxed">
            No 90-day onboarding. No 12-person agency team. One senior
            operator embedded with your squad, shipping real product on a
            timeline you can defend to your CEO.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch mb-16 md:mb-20">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.num} delay={300 + i * 100} className="h-full">
                <TiltCard scale={1.03} maxRotation={4} className="h-full">
                  <div className="group glass h-full rounded-3xl p-8 md:p-10 border-white/5 hover:border-[#0f62fe]/40 transition-all duration-500 hover:shadow-[0_18px_50px_rgba(15,98,254,0.15)] flex flex-col relative overflow-hidden">
                    <ElectricBorder />

                    <div className="flex items-center justify-between mb-8 relative z-10">
                      <span className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-500">
                        Step <span className="text-white">{step.num}</span>
                      </span>
                      <span className="font-mono text-[10px] font-medium tracking-[0.22em] uppercase text-[#4589ff]">
                        {step.duration}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 w-fit mb-8 border border-white/10 group-hover:border-[#0f62fe]/50 group-hover:scale-110 transition-all duration-500 backdrop-blur-md relative z-10">
                      <Icon className="w-7 h-7 text-[#4589ff] drop-shadow-[0_0_10px_rgba(15,98,254,0.4)]" />
                    </div>

                    <h4 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight relative z-10">
                      {step.title}
                    </h4>
                    <p className="text-zinc-400 font-light text-base leading-relaxed group-hover:text-zinc-200 transition-colors mt-auto relative z-10">
                      {step.desc}
                    </p>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={700}>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-10 border-t border-white/8">
            <p className="text-zinc-300 text-base md:text-lg font-light">
              Want to talk through whether this fits your team?
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
