"use client";

import { Code2, Cpu, Smartphone, Globe, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollTransform } from "@/components/ui/ScrollTransform";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

type ExpertiseCard = {
  colSpan: string;
  icon: LucideIcon;
  title: string;
  desc: string;
};

const CARDS: ExpertiseCard[] = [
  {
    colSpan: "md:col-span-2",
    icon: Code2,
    title: "Production-Grade Outputs",
    desc: "Bridging the gap definitively. I deliver tokenized design systems and production-ready React/Tailwind front-ends, obliterating the traditional 'design handoff' friction.",
  },
  {
    colSpan: "md:col-span-1",
    icon: Cpu,
    title: "AI Workflows",
    desc: "Prompt engineering, generative UI generation, and LLM orchestration to 10x delivery speed.",
  },
  {
    colSpan: "md:col-span-1",
    icon: Smartphone,
    title: "UX Architecture",
    desc: "Untangling complex enterprise data into zero-friction, highly scalable interfaces.",
  },
  {
    colSpan: "md:col-span-2",
    icon: Globe,
    title: "Product Vision & Strategy",
    desc: "Aligning deep user psychology with aggressive targets to define product roadmaps that don't just launch, but dominate their respective markets.",
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
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          <h2 className="text-sm md:text-base font-bold tracking-widest uppercase text-neutral-300">
            Full-Stack Capabilities
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-3 mb-10">
          <Reveal delay={100}>
            <ScrollTransform direction={-1} speed={0.1}>
              <h3 className="text-4xl md:text-5xl lg:text-7xl font-medium leading-tight text-white tracking-tight max-w-5xl">
                Not just designing screens. I architect{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 italic font-serif">
                  systems
                </span>{" "}
                that generate measurable business outcomes.
              </h3>
            </ScrollTransform>
          </Reveal>
        </div>

        {CARDS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.title} delay={i * 150} className={s.colSpan}>
              <TiltCard scale={1.03} maxRotation={8} className="h-full">
                <div className="glass h-full p-10 md:p-14 rounded-[2.5rem] flex flex-col justify-between transition-all duration-500 group border-white/5 hover:border-cyan-400/30 hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
                  <ElectricBorder />
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-indigo-500/0 group-hover:from-cyan-500/5 group-hover:to-indigo-500/10 transition-all duration-700 pointer-events-none z-0" />

                  <div className="p-5 rounded-2xl bg-white/5 w-fit mb-12 border border-white/10 group-hover:border-cyan-400/50 group-hover:scale-110 transition-all duration-500 ease-out relative z-10 backdrop-blur-md">
                    <Icon className="w-8 h-8 text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.5)]" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight drop-shadow-lg">
                      {s.title}
                    </h4>
                    <p className="text-neutral-400 font-light text-xl leading-relaxed group-hover:text-neutral-200 transition-colors">
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
