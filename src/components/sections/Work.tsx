"use client";

import { ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/projects";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

export function Work() {
  return (
    <section
      id="work"
      className="py-32 px-6 md:px-12 lg:px-24 relative z-10"
    >
      <Reveal>
        <div className="flex items-center gap-4 mb-16">
          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
          <h2 className="text-sm md:text-base font-bold tracking-widest uppercase text-neutral-300">
            High-Profile Deployments
          </h2>
        </div>
      </Reveal>

      <div className="flex flex-col gap-12 md:gap-24">
        {projects.map((p, index) => (
          <Reveal key={p.id} delay={100}>
            <TiltCard scale={1.01} maxRotation={3} className="w-full">
              <div className="group relative w-full rounded-[2rem] md:rounded-[3rem] bg-black/50 border border-white/5 hover-target overflow-hidden h-[70vh] md:h-[85vh] flex items-end p-6 md:p-16 transition-all duration-700 hover:border-white/20 preserve-3d shadow-2xl">
                <ElectricBorder />

                <ParallaxImage
                  src={p.img}
                  alt={p.title}
                  speed={0.12}
                  priority={index === 0}
                  className="opacity-50 group-hover:opacity-90 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
                />

                <div
                  className={`absolute inset-0 bg-gradient-to-t ${p.color} via-black/40 to-transparent opacity-90 mix-blend-multiply transition-opacity duration-700 z-0`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-100 group-hover:opacity-70 transition-opacity duration-700 z-0" />

                <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-8 translate-z-20">
                  <div className="flex flex-col max-w-3xl">
                    <div className="flex flex-wrap gap-3 mb-6 overflow-hidden">
                      <span className="glass px-5 py-2.5 rounded-full text-white text-xs font-bold tracking-widest uppercase transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100 ease-[cubic-bezier(0.16,1,0.3,1)]">
                        {p.category}
                      </span>
                      <span className="glass px-5 py-2.5 rounded-full text-white text-xs font-bold tracking-widest uppercase transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)]">
                        {p.role}
                      </span>
                    </div>

                    <h3 className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter text-white mb-6 transform group-hover:-translate-y-2 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      {p.title}
                    </h3>

                    <p className="text-neutral-300 font-light text-xl md:text-2xl leading-relaxed max-w-2xl transform opacity-0 translate-y-8 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-200 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      {p.desc}
                    </p>
                  </div>

                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full glass flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all duration-700 delay-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white text-black">
                    <ArrowUpRight className="w-10 h-10" />
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
