import Link from "next/link";
import { ArrowUpRight } from "@/components/icons/Icons";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
        <span className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
          Error · 404
        </span>
      </div>
      <h1 className="text-[18vw] md:text-[14vw] font-bold tracking-tighter text-white leading-none mb-6 shine-text">
        404
      </h1>
      <p className="text-2xl md:text-3xl font-light text-zinc-300 text-center max-w-xl mb-12">
        That page could not be found. Even Phil&apos;s sitemap got lost on the
        way to it.
      </p>
      <Link
        href="/"
        data-magnetic="true"
        className="group flex items-center gap-3 hover-target font-mono text-xs font-medium tracking-[0.22em] uppercase text-white px-8 py-5 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all duration-500 ease-[var(--ease-out)] will-change-transform"
      >
        <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
        Return to home
      </Link>
    </main>
  );
}
