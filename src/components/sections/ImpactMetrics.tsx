"use client";

import { TrendingUp, Users, Zap, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

type Metric = {
  icon: LucideIcon;
  val: string;
  label: string;
  desc: string;
};

const METRICS: Metric[] = [
  {
    icon: TrendingUp,
    val: "$4.2B+",
    label: "Capital Flow",
    desc: "Transacting flawlessly through interfaces I architected for leading Fintechs.",
  },
  {
    icon: Users,
    val: "25M+",
    label: "Global Users",
    desc: "Interacting daily with frictionless design systems deployed worldwide.",
  },
  {
    icon: Zap,
    val: "10x",
    label: "Delivery Velocity",
    desc: "Faster time-to-market achieved by integrating AI into the UX lifecycle.",
  },
];

export function ImpactMetrics() {
  return (
    <section id="impact" className="py-24 px-6 md:px-12 lg:px-24 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <Reveal key={m.label} delay={i * 200} direction="up">
              <TiltCard scale={1.05} maxRotation={15}>
                <div className="glass p-12 rounded-[2rem] h-full border-white/5 hover:border-indigo-500/40 hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] group preserve-3d relative">
                  <ElectricBorder />
                  <Icon className="w-10 h-10 text-indigo-400 mb-8 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out translate-z-10 relative z-10" />
                  <h3 className="text-6xl md:text-7xl font-black tracking-tighter text-white mb-2 translate-z-20 relative z-10">
                    {m.val}
                  </h3>
                  <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent my-6 translate-z-10 relative z-10" />
                  <h4 className="text-xl font-bold tracking-wide text-white uppercase mb-3 translate-z-10 relative z-10">
                    {m.label}
                  </h4>
                  <p className="text-neutral-400 font-light leading-relaxed text-lg relative z-10">
                    {m.desc}
                  </p>
                </div>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
