"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/projects";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

export function Work() {
  return (
    <section id="work" className="px-6 md:px-12 lg:px-24 relative z-10 py-32">
      <Reveal>
        <div className="flex items-center gap-4 mb-16">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            High-Profile Deployments
          </h2>
        </div>
      </Reveal>

      {/* Each project is a 2-column scrollytelling chapter:
          left image stays sticky while right content scrolls past it. */}
      <div className="flex flex-col gap-32 md:gap-48">
        {projects.map((p, index) => {
          const indexLabel = `0${index + 1} / 0${projects.length}`;
          return (
            <article
              key={p.id}
              className="grid md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 md:min-h-[140vh]"
            >
              {/* LEFT: image card pins to viewport center while content scrolls */}
              <div className="md:sticky md:top-0 md:h-screen md:flex md:items-center md:order-1">
                <Reveal direction="left" className="w-full">
                  <TiltCard scale={1.02} maxRotation={4} className="w-full">
                    <Link
                      href={`/work/${p.slug}`}
                      data-card="true"
                      data-magnetic="true"
                      className="group relative block w-full rounded-[2rem] md:rounded-[2.5rem] bg-black/50 border border-white/5 hover-target overflow-hidden aspect-[4/5] md:aspect-[5/6] transition-all duration-700 hover:border-white/15 shadow-2xl will-change-transform"
                    >
                      <ElectricBorder />
                      <ParallaxImage
                        src={p.img}
                        alt={p.title}
                        speed={0.1}
                        priority={index === 0}
                        className="opacity-60 group-hover:opacity-100 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
                      />
                      <div
                        className="absolute inset-0 opacity-80 mix-blend-multiply transition-opacity duration-700 z-0"
                        style={{
                          backgroundImage: `linear-gradient(to top, ${p.accent}D9, rgba(0,0,0,0.45) 55%, transparent)`,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent opacity-90 group-hover:opacity-50 transition-opacity duration-700 z-0" />

                      {/* Index marker top-left */}
                      <div className="absolute top-6 left-6 z-10 font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-white/60">
                        {indexLabel}
                      </div>
                      {/* Year top-right */}
                      <div className="absolute top-6 right-6 z-10 font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-white/60">
                        {p.year}
                      </div>

                      {/* Title overlaid bottom-left, monumental display */}
                      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10 flex items-end justify-between gap-4">
                        <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-2xl break-words">
                          {p.title}
                        </h3>
                        <span className="shrink-0 hidden md:inline-flex w-12 h-12 rounded-full bg-white/10 backdrop-blur-md items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-0 -translate-x-3">
                          <ArrowUpRight className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" />
                        </span>
                      </div>
                    </Link>
                  </TiltCard>
                </Reveal>
              </div>

              {/* RIGHT: content scrolls past the sticky image */}
              <div className="md:order-2 flex flex-col justify-center gap-8 md:py-[18vh]">
                <Reveal>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: p.accent,
                        boxShadow: `0 0 10px ${p.accent}`,
                      }}
                    />
                    <span className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
                      {p.category}
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={120}>
                  <p className="text-zinc-200 font-light text-2xl md:text-3xl leading-snug max-w-xl">
                    {p.desc}
                  </p>
                </Reveal>

                <Reveal delay={240}>
                  <dl className="grid grid-cols-2 gap-x-8 gap-y-6 max-w-md mt-2">
                    <div className="flex flex-col gap-1.5">
                      <dt className="font-mono text-[10px] font-medium tracking-[0.22em] uppercase text-zinc-400">
                        Role
                      </dt>
                      <dd className="text-white text-sm md:text-base">
                        {p.role}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <dt className="font-mono text-[10px] font-medium tracking-[0.22em] uppercase text-zinc-400">
                        Year
                      </dt>
                      <dd className="text-white text-sm md:text-base font-mono tabular-nums">
                        {p.year}
                      </dd>
                    </div>
                  </dl>
                </Reveal>

                <Reveal delay={360}>
                  <Link
                    href={`/work/${p.slug}`}
                    data-magnetic="true"
                    className="group w-fit mt-4 flex items-center gap-3 hover-target font-mono text-xs font-medium tracking-[0.22em] uppercase text-white px-6 py-4 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
                  >
                    <span>Read case study</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
                  </Link>
                </Reveal>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
