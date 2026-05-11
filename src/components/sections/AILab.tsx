"use client";

import {
  Sparkles,
  Cpu,
  Workflow,
  Code2,
  type IconComponent,
} from "@/components/icons/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

/**
 * The AI Lab. Focused section showcasing the AI capability stack.
 *
 * Inspiration framing borrowed from builders-secrets ("The AI Lab for
 * Builders"). Translated to Phil's IBM Blue / Carbon Black / IBM Plex
 * stack with the same intent: name the AI work as a deliberate
 * capability area, not a buzzword. Four focused cards over a soft
 * gradient mesh distinguish this section from the broader Expertise
 * bento (which covers all four pillars).
 *
 * Sits as section 08, between Expertise and Footer, so it's the last
 * substantive moment before "Initiate Project". Builds momentum into
 * the contact CTA.
 */

type Capability = {
  icon: IconComponent;
  title: string;
  desc: string;
  badge: string;
};

const CAPABILITIES: Capability[] = [
  {
    icon: Sparkles,
    title: "Custom GPTs",
    desc: "Trained on enterprise context and brand voice. Compress weeks of discovery research into a focused interview in hours.",
    badge: "DISCOVERY",
  },
  {
    icon: Workflow,
    title: "AI Agents",
    desc: "Automate research-to-spec, journey mapping, design audits, and competitive teardowns. Squad gets back the hours it used to spend on synthesis.",
    badge: "RESEARCH",
  },
  {
    icon: Cpu,
    title: "Generative UI",
    desc: "From prompt to clickable React prototype. Real production-quality components grounded in design tokens. Not static mocks, not vibe-coded.",
    badge: "PROTOTYPING",
  },
  {
    icon: Code2,
    title: "AI-Ready Design Systems",
    desc: "Token architectures and component contracts that scale across squads, designers, and LLMs in parallel. Shipped at Kuoni Tumlare for 12 designers.",
    badge: "SYSTEMS",
  },
];

export function AILab() {
  return (
    <section
      id="ai-lab"
      className="relative z-10 py-32 md:py-40 px-6 md:px-12 lg:px-24 overflow-hidden"
    >
      {/* Distinctive gradient mesh: blue + emerald orbs.
          Marks this section as a different gear from the rest of the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 25% 30%, rgba(15, 98, 254, 0.18), transparent 70%), radial-gradient(ellipse 45% 35% at 80% 70%, rgba(16, 185, 129, 0.10), transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <Reveal>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
            <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
              <span className="text-zinc-400">07 ·</span> The AI Lab
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h3 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.05] text-white max-w-5xl mb-8">
            From prompt to{" "}
            <span className="shine-text italic font-serif font-light">
              production
            </span>
            .{" "}
            <span className="text-zinc-400">Not from prompt to demo.</span>
          </h3>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-zinc-400 font-light text-xl md:text-2xl max-w-3xl mb-16 md:mb-20 leading-relaxed">
            I don&apos;t talk about AI. I ship with it. Here&apos;s the actual
            stack I use to compress quarters into days for Fortune 500 teams.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          {CAPABILITIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal
                key={c.title}
                delay={300 + i * 100}
                className="h-full"
              >
                <TiltCard scale={1.03} maxRotation={5} className="h-full">
                  <div className="group glass h-full rounded-3xl p-8 md:p-12 border-white/5 hover:border-[#0f62fe]/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(15,98,254,0.18)] flex flex-col relative overflow-hidden">
                    <ElectricBorder />

                    <div className="flex items-start justify-between mb-10 relative z-10">
                      <div className="p-4 rounded-2xl bg-white/5 w-fit border border-white/10 group-hover:border-[#0f62fe]/50 group-hover:scale-110 transition-all duration-500 backdrop-blur-md">
                        <Icon className="w-7 h-7 text-[#4589ff] drop-shadow-[0_0_10px_rgba(15,98,254,0.4)]" />
                      </div>
                      <span className="font-mono text-[10px] font-medium tracking-[0.22em] uppercase text-zinc-400 group-hover:text-[#4589ff] transition-colors duration-500 mt-2">
                        {c.badge}
                      </span>
                    </div>

                    <h4 className="text-2xl md:text-3xl font-bold text-white mb-5 tracking-tight relative z-10">
                      {c.title}
                    </h4>
                    <p className="text-zinc-400 font-light text-base md:text-lg leading-relaxed group-hover:text-zinc-200 transition-colors mt-auto relative z-10">
                      {c.desc}
                    </p>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
