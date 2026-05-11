"use client";

import { Code2, Cpu, Users, Workflow, type IconComponent } from "@/components/icons/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

type ExpertiseCard = {
  colSpan: string;
  icon: IconComponent;
  title: string;
  desc: string;
};

const CARDS: ExpertiseCard[] = [
  {
    colSpan: "md:col-span-2",
    icon: Users,
    title: "Design Leadership",
    desc: "Hiring, coaching, and leading high-performing design teams. At Kuoni Tumlare I hired six UX designers and led a twelve-person team in Prague. Mentored 1,000+ designers now leading at Meta, Booking, Uber, IBM, and Accenture across 11 countries.",
  },
  {
    colSpan: "md:col-span-1",
    icon: Workflow,
    title: "Product Discovery",
    desc: "User research, customer interviews, and design-thinking workshops that connect what customers need to what the business needs to ship. NN/G UX Master, IDEO, IBM Enterprise Design Thinking certified.",
  },
  {
    colSpan: "md:col-span-1",
    icon: Cpu,
    title: "AI-Native Prototyping",
    desc: "Gen AI, custom GPTs, and AI agents that compress idea-to-prototype from quarters to days. AI-ready design systems that scale across squads, shipped at Kuoni Tumlare for 12 designers working in parallel.",
  },
  {
    colSpan: "md:col-span-2",
    icon: Code2,
    title: "Production-Grade Code",
    desc: "Tokenized design systems and production-ready React/Tailwind code, eliminating the traditional 'design handoff' friction. Engineers actually want to use what I deliver. Proven at Walmart, VMware, Cemex, and SAP scale.",
  },
];

export function Expertise() {
  return (
    <section
      id="expertise"
      className="py-32 px-6 md:px-12 lg:px-24 relative z-10"
    >
      <Reveal>
        <div className="flex items-center gap-4 mb-16">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            <span className="text-zinc-400">05 ·</span> Full-Stack Capabilities
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-3 mb-10">
          <Reveal delay={100}>
            <h3 className="text-4xl md:text-5xl lg:text-7xl font-medium leading-tight text-white tracking-tight max-w-5xl">
              I design and build the{" "}
              <span className="shine-text italic font-serif">systems</span>{" "}
              that generate measurable business outcomes.
            </h3>
          </Reveal>
        </div>

        {CARDS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.title} delay={i * 150} className={s.colSpan}>
              <TiltCard scale={1.03} maxRotation={6} className="h-full">
                <div className="glass h-full p-10 md:p-14 rounded-[2.5rem] flex flex-col justify-between transition-all duration-500 group border-white/5 hover:border-[#0f62fe]/30 hover:shadow-[0_20px_50px_rgba(15,98,254,0.15)] relative overflow-hidden">
                  <ElectricBorder />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0f62fe]/0 to-[#0f62fe]/0 group-hover:from-[#0f62fe]/8 group-hover:to-[#0f62fe]/4 transition-all duration-700 pointer-events-none z-0" />

                  <div className="p-5 rounded-2xl bg-white/5 w-fit mb-12 border border-white/10 group-hover:border-[#0f62fe]/50 group-hover:scale-110 transition-all duration-500 ease-out relative z-10 backdrop-blur-md">
                    <Icon className="w-8 h-8 text-[#4589ff] drop-shadow-[0_0_10px_rgba(15,98,254,0.5)]" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight drop-shadow-lg">
                      {s.title}
                    </h4>
                    <p className="text-zinc-400 font-light text-xl leading-relaxed group-hover:text-zinc-200 transition-colors">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
