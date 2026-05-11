"use client";

import { Sparkles, Workflow } from "@/components/icons/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

export function Advantage() {
  return (
    <section
      id="advantage"
      className="py-24 px-6 md:px-12 lg:px-24 relative z-10 bg-gradient-to-b from-zinc-950/80 to-transparent"
    >
      <Reveal>
        <div className="flex items-center gap-4 mb-16">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            <span className="text-zinc-400">02 ·</span> The Enterprise Advantage
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        <Reveal delay={100}>
          <h3 className="text-4xl md:text-5xl lg:text-7xl font-medium leading-tight text-white tracking-tight">
            Companies don&apos;t hire me to design mocks. They hire me to ship
            the actual product, at{" "}
            <span className="shine-text italic font-serif">
              extreme velocity
            </span>
            .
          </h3>
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
                    Product Discovery → AI-Native Prototype
                  </h4>
                  <p className="text-zinc-400 leading-relaxed text-lg font-light">
                    I lead end-to-end discovery: customer interviews, journey
                    mapping, jobs-to-be-done. Then I orchestrate LLMs,
                    generative UI, and custom GPTs to compress idea-to-code
                    from quarters to days. You ship a real React prototype
                    grounded in real research, not a static deck.
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
                    Design Leadership at Scale
                  </h4>
                  <p className="text-zinc-400 leading-relaxed text-lg font-light">
                    I hire, coach, and lead design teams that ship, not just
                    design. Across continents and time zones. At Kuoni Tumlare
                    I hired six UX designers and led a twelve-person team
                    in Prague behind one AI-ready design
                    system. Mentored 1,000+ designers now leading at Meta,
                    Booking, Uber, IBM, Accenture.
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
