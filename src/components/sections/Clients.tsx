"use client";

import { Reveal } from "@/components/ui/Reveal";

const CLIENTS = [
  "Walmart",
  "VMware",
  "Microsoft",
  "SAP",
  "WWF",
  "Cemex",
  "Pivotal",
  "Azul",
];

export function Clients() {
  return (
    <section
      id="clients"
      className="py-20 px-6 md:px-12 lg:px-24 relative z-10 border-t border-b border-white/5"
    >
      <Reveal>
        <div className="flex items-center gap-4 mb-10">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            Trusted By
          </h2>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-6 md:gap-x-16">
          {CLIENTS.map((name) => (
            <li
              key={name}
              className="font-mono text-sm md:text-xl font-medium tracking-[0.28em] uppercase text-white/30 hover:text-white/80 transition-colors duration-500 hover-target"
            >
              {name}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
