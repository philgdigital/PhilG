import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "@/components/icons/Icons";
import {
  insights,
  getInsight,
  type ArticleBlock,
  type InsightType,
} from "@/lib/insights";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/ui/Reveal";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return insights.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) return { title: "Insight not found" };
  return {
    title: `${insight.title} · Phil G.`,
    description: insight.excerpt,
    openGraph: {
      title: `${insight.title} · Phil G.`,
      description: insight.excerpt,
      images: [insight.image],
    },
  };
}

const TYPE_BADGE: Record<InsightType, string> = {
  Essay: "text-zinc-300 border-zinc-500/30",
  Article: "text-[#4589ff] border-[#0f62fe]/30",
  "Case Study": "text-[#34d399] border-[#10b981]/30",
  Talk: "text-white border-white/30",
  Podcast: "text-[#4589ff]/80 border-[#0f62fe]/40",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="flex flex-col gap-8 md:gap-10">
      {blocks.map((block, i) => {
        if (block.type === "p") {
          return (
            <Reveal key={i} delay={Math.min(i * 30, 300)}>
              <p className="text-zinc-200 font-light text-lg md:text-xl leading-[1.7]">
                {block.text}
              </p>
            </Reveal>
          );
        }
        if (block.type === "h") {
          return (
            <Reveal key={i} delay={Math.min(i * 30, 300)}>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-6 md:mt-10">
                {block.text}
              </h2>
            </Reveal>
          );
        }
        if (block.type === "list") {
          return (
            <Reveal key={i} delay={Math.min(i * 30, 300)}>
              <ul className="flex flex-col gap-4 md:gap-5 list-none">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-baseline gap-4 text-zinc-200 font-light text-lg md:text-xl leading-[1.65]"
                  >
                    <span
                      aria-hidden
                      className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.5)]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        }
        // quote
        return (
          <Reveal key={i} delay={Math.min(i * 30, 300)}>
            <figure className="my-8 md:my-12 py-8 md:py-12 border-y border-white/10 relative">
              <span
                aria-hidden
                className="absolute -top-2 left-0 text-7xl md:text-8xl font-serif italic font-light leading-none text-[#4589ff]/25 select-none"
              >
                &ldquo;
              </span>
              <blockquote className="font-serif italic font-light text-2xl md:text-3xl lg:text-4xl tracking-tight leading-[1.25] text-white pl-12 md:pl-16">
                {block.text}
              </blockquote>
              {block.attribution && (
                <figcaption className="mt-6 pl-12 md:pl-16 font-mono text-[11px] tracking-[0.22em] uppercase text-zinc-400">
                  {block.attribution}
                </figcaption>
              )}
            </figure>
          </Reveal>
        );
      })}
    </div>
  );
}

export default async function InsightPage({ params }: RouteProps) {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) notFound();

  const idx = insights.findIndex((i) => i.slug === insight.slug);
  const next = insights[(idx + 1) % insights.length];
  const related = insights
    .filter((i) => i.slug !== insight.slug)
    .slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 pb-32">
        {/* Top: back link */}
        <div className="flex items-center justify-between mb-16 max-w-5xl mx-auto">
          <Link
            href="/#insights"
            data-magnetic="true"
            className="group inline-flex items-center gap-2 hover-target font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowUpLeft className="w-4 h-4 -rotate-45 transition-transform duration-500 group-hover:-translate-x-1" />
            <span>All insights</span>
          </Link>
          <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400">
            {`0${idx + 1} / 0${insights.length}`}
          </span>
        </div>

        {/* Header block */}
        <header className="max-w-5xl mx-auto mb-16 md:mb-20">
          <Reveal>
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <span
                className={`inline-flex items-center font-mono text-[10px] tracking-[0.22em] uppercase font-medium px-3 py-1 rounded-full border ${
                  TYPE_BADGE[insight.type]
                }`}
              >
                {insight.type}
              </span>
              <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-500">
                {formatDate(insight.date)}
              </span>
              <span aria-hidden className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-500">
                {insight.readTime}
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-8">
              {insight.title}
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-2xl md:text-3xl font-light text-zinc-300 leading-snug max-w-3xl">
              {insight.excerpt}
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-12 pt-8 border-t border-white/8 flex items-center gap-4">
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f62fe]/30 to-[#10b981]/15 border border-white/15 backdrop-blur-md flex items-center justify-center font-mono text-xs text-white">
                PG
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-white font-medium text-sm">
                  Phil G.
                </span>
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-500">
                  Senior Product Design Leader & Builder
                </span>
              </div>
            </div>
          </Reveal>
        </header>

        {/* Hero image */}
        <Reveal delay={400}>
          <div className="relative w-full aspect-[16/8] md:aspect-[16/7] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/8 mb-20 md:mb-32 shadow-2xl max-w-6xl mx-auto">
            <Image
              src={insight.image}
              alt={insight.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 mix-blend-multiply opacity-50 bg-gradient-to-tr from-[#0f62fe]/30 via-transparent to-[#10b981]/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/60 via-transparent to-transparent" />
          </div>
        </Reveal>

        {/* Article body */}
        <article className="max-w-3xl mx-auto">
          {insight.body && <ArticleBody blocks={insight.body} />}
        </article>

        {/* Closing: next + related */}
        <section className="border-t border-white/8 pt-16 mt-24 md:mt-32 max-w-5xl mx-auto">
          <Reveal>
            <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400 mb-4 block">
              Read next
            </span>
          </Reveal>
          <Reveal delay={80}>
            <Link
              href={next.href}
              data-magnetic="true"
              className="group inline-flex items-baseline gap-4 hover-target mb-16 md:mb-20"
            >
              <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {next.title}
              </h3>
              <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 text-zinc-400 group-hover:text-white group-hover:rotate-45 transition-all duration-500 shrink-0" />
            </Link>
          </Reveal>

          <Reveal delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/8">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={r.href}
                  data-magnetic="true"
                  className="group flex flex-col gap-3 hover-target glass rounded-2xl p-6 border-white/5 hover:border-[#0f62fe]/30 transition-all duration-500"
                >
                  <span
                    className={`inline-flex w-fit items-center font-mono text-[10px] tracking-[0.22em] uppercase font-medium px-2.5 py-1 rounded-full border ${
                      TYPE_BADGE[r.type]
                    }`}
                  >
                    {r.type}
                  </span>
                  <h4 className="text-base md:text-lg font-medium text-white leading-snug tracking-tight">
                    {r.title}
                  </h4>
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-500 mt-auto pt-2">
                    {r.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-20 md:mt-24 pt-16 border-t border-white/8 flex flex-col md:flex-row md:items-end md:justify-between gap-12">
              <div>
                <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400 mb-3 block">
                  Want to talk?
                </span>
                <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight max-w-2xl">
                  Most projects start with a 30-min call.
                </h3>
              </div>
              <Link
                href="/#contact"
                data-magnetic="true"
                className="group shrink-0 inline-flex items-center gap-3 hover-target font-mono text-xs font-medium tracking-[0.22em] uppercase text-white px-8 py-5 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all duration-500"
              >
                <span>Initiate a project</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
    </>
  );
}
