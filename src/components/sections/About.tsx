"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollTransform } from "@/components/ui/ScrollTransform";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

export function About() {
  return (
    <section id="about" className="py-24 px-6 md:px-12 lg:px-24 relative z-10">
      <Reveal>
        <div className="flex items-center gap-4 mb-16">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="text-sm md:text-base font-bold tracking-widest uppercase text-zinc-400">
            The Architect
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
        <div className="lg:col-span-5 relative">
          <Reveal delay={100} direction="left">
            <TiltCard scale={1.02} maxRotation={6}>
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] border border-white/10 group bg-zinc-900/50">
                <ElectricBorder />
                <Image
                  src="/images/about.jpg"
                  alt="Phil G."
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  priority
                  className="object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-80" />
              </div>
            </TiltCard>
          </Reveal>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <Reveal delay={200}>
            <ScrollTransform direction={1} speed={0.1}>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-2 leading-tight">
                I don&apos;t just design screens. <br />I engineer{" "}
                <span className="shine-text">outcomes.</span>
              </h3>
            </ScrollTransform>
          </Reveal>

          <Reveal delay={300}>
            <p className="text-zinc-300 font-light text-xl md:text-2xl leading-relaxed">
              I&apos;m a{" "}
              <span className="text-white font-medium">Certified UX Master</span>{" "}
              and{" "}
              <span className="text-white font-medium">
                Certified Sales Funnel Builder
              </span>{" "}
              with 20+ years of experience turning ideas into impactful,
              market-leading products. From redefining customer experiences for
              Walmart to driving innovation for VMware, Microsoft, SAP, and WWF.
              I don&apos;t just design; I deliver measurable outcomes.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <p className="text-zinc-400 font-light text-lg md:text-xl leading-relaxed">
              I specialize in user-centered strategies that seamlessly blend{" "}
              <span className="text-white">UX, AI, Marketing, and Sales</span>.
              Whether launching blockchain-powered platforms for WWF/OpenSC or
              leading AI-integrated designs for Azul Intelligence Cloud, I
              thrive on turning complex challenges into opportunities for
              growth. Along the way I&apos;ve mentored 1,000+ designers, many
              now excelling at Meta, Booking.com, Uber, and Accenture.
            </p>
          </Reveal>

          <Reveal delay={500}>
            <div className="flex flex-wrap gap-4 mt-6">
              <span className="glass px-6 py-3 rounded-full text-white text-xs font-bold tracking-widest uppercase">
                UX Strategy
              </span>
              <span className="glass px-6 py-3 rounded-full text-[#4589ff] text-xs font-bold tracking-widest uppercase border-[#0f62fe]/20 shadow-[0_0_15px_rgba(15,98,254,0.15)]">
                AI-Native Design
              </span>
              <span className="glass px-6 py-3 rounded-full text-white text-xs font-bold tracking-widest uppercase">
                Sales Funnel Building
              </span>
              <span className="glass px-6 py-3 rounded-full text-white text-xs font-bold tracking-widest uppercase">
                Team Leadership
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
