"use client";

import { Reveal } from "@/components/ui/Reveal";

// Order matches the user's brief; Vodafone slotted in after Cemex.
const CLIENTS = [
  "Walmart",
  "VMware",
  "Pivotal",
  "SAP",
  "Kuoni Tumlare",
  "Cemex",
  "Vodafone",
  "WWF / OpenSC",
  "Royal Air Force",
  "Azul",
  "Microsoft",
  "GoodNotes",
];

export function Clients() {
  return (
    <section
      id="clients"
      className="py-20 px-6 md:px-12 lg:px-24 relative z-10 border-t border-b border-white/5"
    >
      <Reveal>
        <div className="flex items-center gap-4 mb-12">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            Trusted By
          </h2>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-7 md:gap-x-14 lg:gap-x-16">
          {CLIENTS.map((name) => (
            <li
              key={name}
              className="font-mono text-base md:text-xl lg:text-2xl font-bold tracking-[0.18em] uppercase text-white/55 hover:text-white transition-colors duration-500 hover-target"
            >
              {name}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
