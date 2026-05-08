"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollTransform } from "@/components/ui/ScrollTransform";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

export function About() {
  return (
    <section
      id="about"
      className="py-24 px-6 md:px-12 lg:px-24 relative z-10"
    >
      <Reveal>
        <div className="flex items-center gap-4 mb-16">
          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
          <h2 className="text-sm md:text-base font-bold tracking-widest uppercase text-neutral-300">
            The Architect
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
        <div className="lg:col-span-5 relative">
          <Reveal delay={100} direction="left">
            <TiltCard scale={1.02} maxRotation={6}>
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] border border-white/10 group bg-neutral-900/50">
                <ElectricBorder />
                <Image
                  src="/images/about.jpg"
                  alt="Phil G."
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  priority
                  className="object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-transparent to-transparent opacity-80" />
              </div>
            </TiltCard>
          </Reveal>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <Reveal delay={200}>
            <ScrollTransform direction={1} speed={0.1}>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-2 leading-tight">
                I don&apos;t just design screens. <br />I engineer{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 shine-text">
                  outcomes.
                </span>
              </h3>
            </ScrollTransform>
          </Reveal>

          <Reveal delay={300}>
            <p className="text-neutral-300 font-light text-xl md:text-2xl leading-relaxed">
              As a hybrid Product Lead, I sit at the rare intersection of deep
              human psychology, enterprise systems engineering, and
              cutting-edge artificial intelligence.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <p className="text-neutral-400 font-light text-lg md:text-xl leading-relaxed">
              For over a decade, I&apos;ve partnered with Fortune 500s and
              elite startups to untangle their most complex data challenges. My
              approach obliterates the friction of traditional &ldquo;design
              handoffs&rdquo; by generating interactive AI prototypes and
              production-ready React code, accelerating enterprise delivery
              cycles by up to 10x.
            </p>
          </Reveal>

          <Reveal delay={500}>
            <div className="flex flex-wrap gap-4 mt-6">
              <span className="glass px-6 py-3 rounded-full text-white text-xs font-bold tracking-widest uppercase border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                Product Strategy
              </span>
              <span className="glass px-6 py-3 rounded-full text-cyan-300 text-xs font-bold tracking-widest uppercase border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                AI Integration
              </span>
              <span className="glass px-6 py-3 rounded-full text-white text-xs font-bold tracking-widest uppercase border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                Frontend Architecture
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
