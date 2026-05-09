"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

export function About() {
  return (
    <section id="about" className="py-24 px-6 md:px-12 lg:px-24 relative z-10">
      <Reveal>
        <div className="flex items-center gap-4 mb-16">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            <span className="text-zinc-600">02 ·</span> The Architect
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
        <div className="lg:col-span-5 relative">
          <Reveal delay={100} direction="left">
            <TiltCard scale={1.02} maxRotation={5}>
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] border border-white/10 group bg-zinc-900/50">
                <ElectricBorder />
                <Image
                  src="/images/about.jpg"
                  alt="Phil G."
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  priority
                  className="object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[1500ms] ease-[var(--ease-out)] transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-80" />
              </div>
            </TiltCard>
          </Reveal>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <Reveal delay={200}>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-2 leading-tight">
              I design{" "}
              <em className="font-serif italic font-light text-zinc-400">
                and
              </em>{" "}
              build the <span className="shine-text">product.</span>
            </h3>
          </Reveal>

          <Reveal delay={300}>
            <p className="text-zinc-300 font-light text-xl md:text-2xl leading-relaxed">
              I&apos;m a{" "}
              <span className="text-white font-medium">
                Certified UX Master by Nielsen Norman Group (NN/g)
              </span>
              ,{" "}
              <span className="text-white font-medium">
                IDEO Creative Leadership
              </span>{" "}
              graduate, and{" "}
              <span className="text-white font-medium">
                IBM Enterprise Design Thinking
              </span>{" "}
              practitioner with{" "}
              <span className="text-white font-medium">17+ years</span> driving
              digital transformation for the Fortune 500: Walmart, VMware,
              Microsoft, SAP, WWF, Royal Air Force, Cemex, Vodafone, Kuoni
              Tumlare, and beyond.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <p className="text-zinc-400 font-light text-lg md:text-xl leading-relaxed">
              <span className="font-serif italic text-white text-2xl md:text-3xl mr-2">
                Seventeen years.
              </span>
              I&apos;m a{" "}
              <span className="text-white">product builder</span> who leads
              with design. Three force-multipliers:{" "}
              <span className="text-white">product discovery</span> that turns
              user research into board-room business outcomes,{" "}
              <span className="text-white">AI-native prototyping</span> that
              compresses ideation-to-shipped-code from quarters to days, and{" "}
              <span className="text-white">design leadership</span> that builds
              high-performing teams. At Kuoni Tumlare I hired six designers and
              led a twelve-person team across Europe, Asia, and India behind a
              single AI-ready design system. Along the way I&apos;ve mentored
              1,000+ designers now leading at Meta, Booking.com, Uber, IBM, and
              Accenture across 11 countries.
            </p>
          </Reveal>

          <Reveal delay={500}>
            <div className="flex flex-wrap gap-4 mt-6">
              <span className="glass px-6 py-3 rounded-full text-white font-mono text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase">
                Design Leadership
              </span>
              <span className="glass px-6 py-3 rounded-full text-white font-mono text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase">
                Product Discovery
              </span>
              <span className="glass px-6 py-3 rounded-full text-[#4589ff] font-mono text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase border-[#0f62fe]/20 shadow-[0_0_15px_rgba(15,98,254,0.15)]">
                AI-Native Prototyping
              </span>
              <span className="glass px-6 py-3 rounded-full text-white font-mono text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase">
                Design Systems
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
