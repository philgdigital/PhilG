"use client";

import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

type Testimonial = {
  quote: string;
  name: string;
  company: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "A visionary design leader. Phil's insights are invaluable.",
    name: "Kevin Olsen",
    company: "Mechanical Orchard",
  },
  {
    quote: "Phil's leadership and talent-building supercharged our team.",
    name: "Froso Ellina",
    company: "Google",
  },
  {
    quote: "An agile strategist whose foresight defines the future.",
    name: "David Kendall",
    company: "Walmart",
  },
  {
    quote: "Phil broke barriers, inspiring true innovation.",
    name: "Alejandro Cruz",
    company: "Novartis",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-32 px-6 md:px-12 lg:px-24 relative z-10 border-t border-white/5"
    >
      <Reveal>
        <div className="flex items-center gap-4 mb-16">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            What Leaders Say
          </h2>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <h3 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight text-white tracking-tight max-w-4xl mb-16">
          Trusted by people who&apos;ve shipped at the{" "}
          <span className="shine-text italic font-serif">highest level</span>.
        </h3>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 120} direction="up">
            <TiltCard scale={1.03} maxRotation={6} className="h-full">
              <figure className="glass relative h-full p-8 md:p-10 rounded-[1.5rem] border-white/5 hover:border-[#0f62fe]/30 hover:shadow-[0_20px_50px_rgba(15,98,254,0.12)] transition-all duration-500 group flex flex-col justify-between gap-8">
                <ElectricBorder />
                <span
                  aria-hidden
                  className="absolute -top-2 left-7 text-7xl font-serif font-black text-[#0f62fe]/40 leading-none select-none"
                >
                  &ldquo;
                </span>
                <blockquote className="text-zinc-200 text-lg md:text-xl font-light leading-relaxed relative z-10 mt-4">
                  {t.quote}
                </blockquote>
                <figcaption className="flex items-center gap-3 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.8)]" />
                  <div className="flex flex-col">
                    <span className="text-white font-medium text-sm tracking-wide">
                      {t.name}
                    </span>
                    <span className="font-mono text-zinc-500 text-[10px] font-medium tracking-[0.2em] uppercase">
                      {t.company}
                    </span>
                  </div>
                </figcaption>
              </figure>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
