"use client";

import { Sparkles, Workflow } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollTransform } from "@/components/ui/ScrollTransform";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

export function Advantage() {
  return (
    <section
      id="advantage"
      className="py-24 px-6 md:px-12 lg:px-24 relative z-10 border-t border-white/5 bg-gradient-to-b from-zinc-950/80 to-transparent"
    >
      <Reveal>
        <div className="flex items-center gap-4 mb-16">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="text-sm md:text-base font-bold tracking-widest uppercase text-zinc-400">
            The Enterprise Advantage
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        <Reveal delay={100}>
          <ScrollTransform direction={1} speed={0.15}>
            <h3 className="text-4xl md:text-5xl lg:text-7xl font-medium leading-tight text-white tracking-tight">
              Companies don&apos;t hire me for static mocks. They hire me for{" "}
              <span className="shine-text italic font-serif">
                extreme velocity
              </span>
              .
            </h3>
          </ScrollTransform>
        </Reveal>

        <div className="flex flex-col gap-10">
          <TiltCard
            scale={1.05}
            maxRotation={5}
            className="glass p-8 rounded-3xl group relative"
          >
            <ElectricBorder />
            <Reveal delay={200}>
              <div className="flex gap-6 relative z-10">
                <div className="mt-1">
                  <Sparkles className="w-8 h-8 text-[#0f62fe]" />
                </div>
                <div>
                  <h4 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    AI-Powered Ideation to Code
                  </h4>
                  <p className="text-zinc-400 leading-relaxed text-lg font-light">
                    By orchestrating advanced LLMs and generative UI tools, I
                    rapidly compress the distance between an idea and a
                    functional prototype. I don&apos;t just draw screens; I
                    generate the React structure, proving concepts in days
                    instead of quarters.
                  </p>
                </div>
              </div>
            </Reveal>
          </TiltCard>

          <TiltCard
            scale={1.05}
            maxRotation={5}
            className="glass p-8 rounded-3xl border-[#0f62fe]/10 hover:border-[#0f62fe]/30 group relative"
          >
            <ElectricBorder />
            <Reveal delay={300}>
              <div className="flex gap-6 relative z-10">
                <div className="mt-1">
                  <Workflow className="w-8 h-8 text-[#4589ff]" />
                </div>
                <div>
                  <h4 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Enterprise UX Architecture
                  </h4>
                  <p className="text-zinc-400 leading-relaxed text-lg font-light">
                    I untangle massively complex data requirements for Fortune
                    500 SaaS and Fintech tools. The result is zero-friction
                    architecture, modular design systems, and frontend code
                    delivery that your engineers will actually love.
                  </p>
                </div>
              </div>
            </Reveal>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
