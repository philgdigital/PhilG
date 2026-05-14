"use client";

import { Award, Users, Globe, type IconComponent } from "@/components/icons/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";
import { CountUp } from "@/components/ui/CountUp";

type Metric = {
  icon: IconComponent;
  value: number;
  suffix: string;
  label: string;
  desc: string;
};

const METRICS: Metric[] = [
  {
    icon: Award,
    value: 17,
    suffix: "+",
    label: "Years of Experience",
    desc: "Embedded with Walmart, VMware, Pivotal Labs, Microsoft, SAP, Cemex, Vodafone, WWF, and the Royal Air Force. Shipped products, not slides.",
  },
  {
    icon: Users,
    value: 1050,
    suffix: "+",
    label: "Mentored",
    desc: "Designers I've coached who've led at hundreds of firms, including Meta, Booking.com, Uber, IBM, Accenture, SAP, Thoughtworks, Zalando, and Kuoni Tumlare.",
  },
  {
    icon: Globe,
    value: 180,
    suffix: "+",
    label: "Countries",
    desc: "Microsoft Teams (180+), SAP (180+), Kuoni Tumlare (100+), Cemex (50+), and the rest of the Fortune 500 roster.",
  },
];

export function ImpactMetrics() {
  return (
    <section id="impact" className="py-24 px-6 md:px-12 lg:px-24 relative z-10">
      <Reveal>
        <div className="flex items-center gap-4 mb-12">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            <span className="text-zinc-400">03 ·</span> Impact
          </h2>
        </div>
      </Reveal>

      {/*
        Equal-height cards: the grid uses `items-stretch` (default) so each
        cell stretches to the tallest row item. We propagate `h-full` through
        Reveal → TiltCard → inner card so the inner glass surface fills the
        full cell. Then `flex flex-col` + `mt-auto` on the description anchors
        copy to the bottom and pushes uneven copy lengths against the bottom
        edge. The cards stay the same height regardless of text length.
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <Reveal
              key={m.label}
              delay={i * 200}
              direction="up"
              className="h-full"
            >
              <TiltCard scale={1.05} maxRotation={6} className="h-full">
                <div className="glass p-12 md:p-14 lg:p-16 rounded-[2rem] h-full flex flex-col border-white/5 hover:border-[#0f62fe]/40 hover:shadow-[0_20px_50px_rgba(15,98,254,0.15)] group preserve-3d relative">
                  <ElectricBorder />
                  <Icon className="w-10 h-10 text-[#0f62fe] mb-8 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out translate-z-10 relative z-10" />
                  <h3 className="text-6xl md:text-7xl font-mono font-medium tabular-nums tracking-tight text-white mb-2 translate-z-20 relative z-10">
                    <CountUp to={m.value} suffix={m.suffix} duration={1600} />
                  </h3>
                  <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent my-6 translate-z-10 relative z-10" />
                  <h4 className="font-mono text-sm font-medium tracking-[0.2em] text-white uppercase mb-3 translate-z-10 relative z-10">
                    {m.label}
                  </h4>
                  <p className="text-zinc-400 font-light leading-relaxed text-lg relative z-10 mt-auto">
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
