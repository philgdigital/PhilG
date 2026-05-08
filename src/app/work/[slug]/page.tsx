import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { projects, getProject } from "@/lib/projects";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/ui/Reveal";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Case study not found" };
  return {
    title: `${project.title} · Case Study`,
    description: project.desc,
    openGraph: {
      title: `${project.title} · Phil G.`,
      description: project.desc,
      images: [project.img],
    },
  };
}

export default async function CaseStudy({ params }: RouteProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length];

  return (
    <>
      <Navbar />
      <main className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 pb-32">
        {/* Top: index marker + back link */}
        <div className="flex items-center justify-between mb-16">
          <Link
            href="/#work"
            data-magnetic="true"
            className="group inline-flex items-center gap-2 hover-target font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400 hover:text-white transition-colors will-change-transform"
          >
            <ArrowUpLeft className="w-4 h-4 -rotate-45 transition-transform duration-500 group-hover:-translate-x-1" />
            <span>All work</span>
          </Link>
          <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400">
            {`0${idx + 1} / 0${projects.length}`}
          </span>
        </div>

        {/* Hero block */}
        <Reveal>
          <div className="flex items-center gap-4 mb-10">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: project.accent,
                boxShadow: `0 0 10px ${project.accent}`,
              }}
            />
            <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
              {project.category}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-[0.9] text-white mb-12 max-w-[15ch]">
            {project.title}
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-2xl md:text-3xl font-light text-zinc-200 leading-snug max-w-3xl mb-20">
            {project.overview}
          </p>
        </Reveal>

        {/* Project meta dl: Client, Year, Role, Duration */}
        <Reveal delay={300}>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 mb-24 border-t border-white/8 pt-12">
            {[
              { label: "Client", value: project.client },
              { label: "Year", value: project.year },
              { label: "Role", value: project.role },
              { label: "Duration", value: project.duration },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-2">
                <dt className="font-mono text-[10px] font-medium tracking-[0.22em] uppercase text-zinc-400">
                  {item.label}
                </dt>
                <dd className="text-white font-light text-base md:text-lg">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Hero visual */}
        <Reveal delay={400}>
          <div className="relative w-full aspect-[16/10] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/8 mb-32 shadow-2xl">
            <Image
              src={project.img}
              alt={project.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0 mix-blend-multiply opacity-50"
              style={{
                backgroundImage: `linear-gradient(to top, ${project.accent}99, transparent 60%)`,
              }}
            />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </Reveal>

        {/* Scope chips */}
        <section className="grid md:grid-cols-12 gap-12 mb-24">
          <Reveal className="md:col-span-4">
            <h3 className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
              Scope
            </h3>
          </Reveal>
          <div className="md:col-span-8 flex flex-wrap gap-3">
            {project.scope.map((s, i) => (
              <Reveal key={s} delay={i * 80}>
                <span className="glass px-5 py-2.5 rounded-full font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-white">
                  {s}
                </span>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="grid md:grid-cols-12 gap-12 mb-24 border-t border-white/8 pt-16">
          <Reveal className="md:col-span-4">
            <h3 className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
              Team
            </h3>
          </Reveal>
          <Reveal delay={100} className="md:col-span-8">
            <p className="text-zinc-200 font-light text-xl md:text-2xl leading-relaxed max-w-2xl">
              {project.team}
            </p>
          </Reveal>
        </section>

        {/* Challenge */}
        <section className="grid md:grid-cols-12 gap-12 mb-24 border-t border-white/8 pt-16">
          <Reveal className="md:col-span-4">
            <h3 className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
              Challenge
            </h3>
          </Reveal>
          <Reveal delay={100} className="md:col-span-8">
            <div className="text-zinc-200 font-light text-xl md:text-2xl leading-relaxed max-w-2xl space-y-6 whitespace-pre-line">
              {project.challenge}
            </div>
          </Reveal>
        </section>

        {/* Approach */}
        <section className="grid md:grid-cols-12 gap-12 mb-24 border-t border-white/8 pt-16">
          <Reveal className="md:col-span-4">
            <h3 className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
              Approach
            </h3>
          </Reveal>
          <Reveal delay={100} className="md:col-span-8">
            <div className="text-zinc-200 font-light text-xl md:text-2xl leading-relaxed max-w-2xl space-y-6 whitespace-pre-line">
              {project.approach}
            </div>
          </Reveal>
        </section>

        {/* Outcome + metrics */}
        <section className="grid md:grid-cols-12 gap-12 mb-24 border-t border-white/8 pt-16">
          <Reveal className="md:col-span-4">
            <h3 className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
              Outcome
            </h3>
          </Reveal>
          <div className="md:col-span-8">
            <Reveal>
              <p className="text-zinc-200 font-light text-xl md:text-2xl leading-relaxed max-w-2xl mb-12">
                {project.outcome}
              </p>
            </Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {project.metrics.map((m, i) => (
                <Reveal key={m.label} delay={i * 100}>
                  <div className="flex flex-col gap-3 border-l-2 pl-6 py-2" style={{ borderColor: project.accent }}>
                    <span className="text-3xl md:text-4xl font-mono font-medium tabular-nums text-white tracking-tight">
                      {m.value}
                    </span>
                    <span className="font-mono text-[10px] font-medium tracking-[0.22em] uppercase text-zinc-400">
                      {m.label}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Next project + back to work */}
        <section className="border-t border-white/8 pt-16 mt-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12">
            <div>
              <Reveal>
                <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400 mb-3 block">
                  Next project
                </span>
              </Reveal>
              <Reveal delay={80}>
                <Link
                  href={`/work/${next.slug}`}
                  data-magnetic="true"
                  className="group inline-flex items-baseline gap-4 hover-target will-change-transform"
                >
                  <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white group-hover:text-white transition-colors">
                    {next.title}
                  </h2>
                  <ArrowUpRight className="w-8 h-8 md:w-10 md:h-10 text-zinc-400 group-hover:text-white transition-all duration-500 group-hover:rotate-12" />
                </Link>
              </Reveal>
            </div>
            <Reveal delay={200}>
              <Link
                href="/#contact"
                data-magnetic="true"
                className="group inline-flex items-center gap-3 hover-target font-mono text-xs font-medium tracking-[0.22em] uppercase text-white px-8 py-5 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
              >
                <span>Discuss your project</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
