"use client";

import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollTransform } from "@/components/ui/ScrollTransform";
import { MagneticText } from "@/components/ui/MagneticText";

export function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-32 pb-12 relative z-10">
      <div className="max-w-[1400px]">
        <Reveal delay={100} direction="none">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-8 shadow-[0_0_30px_rgba(15,98,254,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#0f62fe] animate-pulse" />
            <span className="font-mono text-xs font-medium tracking-[0.18em] uppercase text-white">
              Available for 2026 Enterprise Engagements
            </span>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <ScrollTransform direction={-1} speed={0.4}>
            <h1 className="text-[13vw] md:text-[10vw] font-bold tracking-tighter leading-[0.85] uppercase text-white drop-shadow-2xl">
              <MagneticText range={220} maxOffset={18}>
                Design
              </MagneticText>
            </h1>
          </ScrollTransform>
        </Reveal>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-12 w-full mt-2">
          <Reveal delay={300} className="hidden md:block">
            <div className="w-16 h-2 md:w-40 md:h-3 rounded-full bg-gradient-to-r from-[#0f62fe] to-[#10b981] shadow-[0_0_30px_rgba(15,98,254,0.5)]" />
          </Reveal>
          <Reveal delay={400}>
            <ScrollTransform direction={1} speed={0.3}>
              <h1 className="text-[13vw] md:text-[10vw] font-bold tracking-tighter leading-[0.85] uppercase shine-text">
                <MagneticText range={220} maxOffset={18}>
                  Acceleration
                </MagneticText>
              </h1>
            </ScrollTransform>
          </Reveal>
        </div>

        <div className="flex justify-start md:justify-end w-full md:w-[95%] mt-4 md:mt-0">
          <Reveal delay={500}>
            <ScrollTransform direction={-1} speed={0.2}>
              <h1 className="text-[13vw] md:text-[10vw] font-bold tracking-tighter leading-[0.85] uppercase text-white flex items-center gap-4">
                <span className="text-zinc-400 italic font-light lowercase text-[7vw] md:text-[5vw] -mt-4 font-serif">
                  with
                </span>
                <MagneticText range={220} maxOffset={18}>
                  AI.
                </MagneticText>
              </h1>
            </ScrollTransform>
          </Reveal>
        </div>
      </div>

      <div className="mt-24 md:mt-32 max-w-3xl flex flex-col gap-10">
        <Reveal delay={700}>
          <p className="text-2xl md:text-4xl font-light text-zinc-300 leading-snug">
            I&apos;m Phil G., a Lead UX/Product Designer with 20+ years turning
            complex enterprise problems into market-leading products. I blend
            deep user psychology with{" "}
            <span className="text-white font-medium">AI-native prototyping</span>{" "}
            to ship 10× faster.
          </p>
        </Reveal>

        <Reveal delay={800}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <a
              href="#work"
              data-magnetic="true"
              className="group w-fit flex items-center gap-4 text-white font-mono font-medium tracking-[0.18em] uppercase text-sm hover-target bg-transparent px-8 py-5 rounded-full border border-white/20 hover:bg-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden will-change-transform"
            >
              <ArrowUpRight className="w-5 h-5 text-white group-hover:text-black transition-all duration-500 group-hover:rotate-45" />
              <span className="group-hover:text-black transition-colors duration-500">
                Explore the Work
              </span>
            </a>
            <p className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-zinc-400">
              Lead UX/Product Designer · Prague Metropolitan Area
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
