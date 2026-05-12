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
import { ClosingCallCTA } from "@/components/ClosingCallCTA";

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
  const url = `/insights/${insight.slug}`;
  return {
    title: `${insight.title} · Phil G.`,
    description: insight.excerpt,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title: `${insight.title} · Phil G.`,
      description: insight.excerpt,
      url,
      publishedTime: insight.date,
      authors: ["Phil G."],
      images: [
        {
          url: insight.image,
          alt: `${insight.title} - ${insight.type} by Phil G.`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${insight.title} · Phil G.`,
      description: insight.excerpt,
      images: [{ url: insight.image, alt: insight.title }],
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export default async function InsightPage({ params }: RouteProps) {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) notFound();

  const idx = insights.findIndex((i) => i.slug === insight.slug);
  const next = insights[(idx + 1) % insights.length];
  const related = insights
    .filter((i) => i.slug !== insight.slug)
    .slice(0, 3);

  // Article JSON-LD. Maps an Insight to schema.org/Article (or
  // Blog/Article subtype as appropriate) so search engines + LLM
  // crawlers can pick up the headline, summary, hero image, author
  // (Phil G. as a Person), publication date, and canonical URL.
  // The 'articleSection' is the insight type (Essay / Article /
  // Case Study / Talk / Podcast) so structured-data consumers can
  // distinguish format at a glance.
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": insight.type === "Podcast" ? "PodcastEpisode" : "Article",
    headline: insight.title,
    description: insight.excerpt,
    image: [`${siteUrl}${insight.image}`],
    datePublished: insight.date,
    dateModified: insight.date,
    author: {
      "@type": "Person",
      name: "Phil G.",
      url: siteUrl,
      jobTitle: "UX/Product Design Leader",
    },
    publisher: {
      "@type": "Person",
      name: "Phil G.",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/insights/${insight.slug}`,
    },
    articleSection: insight.type,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Inline server-rendered so crawlers see it on first paint.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Navbar />
      {/*
        TWO-LAYER bg softening so the page's bg orbs feel ambient, never
        "marked" with hard edges:

        1. Full-bleed RADIAL VIGNETTE fixed to the viewport: transparent
           at center, darkening to ~55% / ~78% at the edges. Sits at
           z-[-1] (above the AnimatedGradientBackground orbs at z-[-2],
           below the main content). This dims the orb extremes uniformly
           so the orbs' outer edges don't read as visible color stops.

        2. Centered ARTICLE-COLUMN HALO: a softer, narrower dark column
           directly behind the reading width. Larger blur (140px) and
           lower alpha (0.6) than the previous /80 version so it feathers
           more gently into the surrounding bg and doesn't introduce its
           own edge.
      */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[-1]"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at center, transparent 0%, rgba(10,10,12,0.55) 65%, rgba(10,10,12,0.82) 100%)",
        }}
      />
      <main className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 pb-32">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 inset-y-0 w-[min(88vw,1100px)] -z-10 bg-[#06060a]/80 blur-[140px]"
        />

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
              <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400">
                {formatDate(insight.date)}
              </span>
              <span aria-hidden className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400">
                {insight.readTime}
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-8"
              style={{ viewTransitionName: `insight-title-${insight.slug}` }}
            >
              {insight.title}
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-2xl md:text-3xl font-light text-zinc-300 leading-snug max-w-3xl">
              {insight.excerpt}
            </p>
          </Reveal>

          {/* Author byline intentionally omitted: every insight on this
              site is by Phil G., so a per-piece byline is redundant. The
              date + read-time row above carries the editorial metadata. */}
        </header>

        {/* Hero image */}
        <Reveal delay={400}>
          <div
            className="relative w-full aspect-[16/8] md:aspect-[16/7] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/8 mb-20 md:mb-32 shadow-2xl max-w-6xl mx-auto"
            style={{ viewTransitionName: `insight-card-${insight.slug}` }}
          >
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

        {/* Article body. Sits inside its OWN strong dark backdrop so
            the white prose reads with maximum contrast on top of the
            page's ambient orbs. Earlier the only dark layer was the
            page-wide halo at z-[-1], which left the white text
            sitting against the orb gradients in places; the dedicated
            backdrop below (rgba(2,2,5,0.88) + 80px blur) plants a
            solid reading panel directly behind the prose. The
            -inset-x bleeds the backdrop slightly past the column so
            the dark band is wider than the text and there's no visible
            edge against the body. Top/bottom fades soften the handoff
            to the hero image above and the 'Read next' section below. */}
        <article className="relative max-w-3xl mx-auto py-14 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-8 md:-inset-x-16 lg:-inset-x-24 inset-y-0 -z-10 rounded-[2rem]"
            style={{
              background:
                "linear-gradient(180deg, rgba(2,2,5,0) 0%, rgba(2,2,5,0.88) 8%, rgba(2,2,5,0.92) 50%, rgba(2,2,5,0.88) 92%, rgba(2,2,5,0) 100%)",
              filter: "blur(40px)",
            }}
          />
          {insight.body && <ArticleBody blocks={insight.body} />}
        </article>

        {/* Closing: next + related. Section divider is a gradient-fade
            hairline (transparent -> white/12 -> transparent) so the top
            edge isn't a hard horizontal line cutting across the page. */}
        <section className="relative pt-16 mt-24 md:mt-32 max-w-5xl mx-auto">
          <span
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
          />
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
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
              <span
                aria-hidden
                className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
              />
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
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400 mt-auto pt-2">
                    {r.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal delay={400}>
            {/* Closing CTA. Uses the shared ClosingCallCTA card so the
                conversion surface here is identical to the Process
                section on the homepage. The gradient-fade hairline
                above continues the divider rhythm with the 'Read next'
                section without reading as a "marked" edge. */}
            <div className="mt-20 md:mt-24 pt-16 relative">
              <span
                aria-hidden
                className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
              />
              <ClosingCallCTA />
            </div>
          </Reveal>
        </section>
      </main>
    </>
  );
}
