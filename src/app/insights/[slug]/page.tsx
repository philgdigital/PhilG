import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode, HTMLAttributes, OlHTMLAttributes } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowUpRight } from "@/components/icons/Icons";
import {
  getAllInsights,
  getInsight,
  type Category,
} from "@/lib/insights";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/ui/Reveal";
import { ClosingCallCTA } from "@/components/ClosingCallCTA";
import { InsightsBackLink } from "@/components/insights/InsightsBackLink";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllInsights().map((i) => ({ slug: i.slug }));
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
          alt: `${insight.title} - ${insight.category} by Phil G.`,
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

/**
 * Category → badge classes. Six topic-based categories sharing the
 * IBM-blue / emerald / zinc / white palette. Adding a new category
 * means: add it to the CATEGORIES tuple in src/lib/insights/schema.ts
 * and add its row here.
 */
const CATEGORY_BADGE: Record<Category, string> = {
  Leadership: "text-[#4589ff] border-[#0f62fe]/30",
  "AI & Prototyping": "text-[#34d399] border-[#10b981]/30",
  "Process & Systems": "text-zinc-300 border-zinc-500/30",
  "Case Studies": "text-white border-white/30",
  Psychology: "text-[#4589ff]/80 border-[#0f62fe]/40",
  "Way of Working": "text-[#34d399]/80 border-[#10b981]/40",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * MDX component map. Each markdown element produced by the MDX
 * compiler is replaced by a styled element here so the rendered
 * prose visually matches the previous typed-block renderer exactly.
 *
 * Reveal wrappers were dropped from the per-block level because
 * MDX children pass through this map without a stable index, so the
 * old "staggered delay" can't be reconstructed. The hero image and
 * headline at the top of the page still have their Reveals, and
 * each body element still picks up Tailwind transitions on hover /
 * scroll where applicable. Net UX cost: tiny; the stagger was a
 * detail only the first few above-the-fold blocks experienced.
 *
 * Bullet-list items render the IBM-blue glowing dot as a sibling
 * span (matching the previous implementation), so the marker has
 * the same glow + position as before.
 */
const mdxComponents = {
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="text-zinc-200 font-light text-lg md:text-xl leading-[1.7]"
      {...props}
    />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-6 md:mt-10"
      {...props}
    />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-xl md:text-2xl font-bold text-white tracking-tight mt-4 md:mt-8"
      {...props}
    />
  ),
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul className="flex flex-col gap-4 md:gap-5 list-none" {...props} />
  ),
  ol: (props: OlHTMLAttributes<HTMLOListElement>) => (
    <ol className="flex flex-col gap-4 md:gap-5 list-decimal list-inside text-zinc-200 font-light text-lg md:text-xl leading-[1.65]" {...props} />
  ),
  li: ({ children, ...props }: HTMLAttributes<HTMLLIElement>) => (
    <li
      className="flex items-baseline gap-4 text-zinc-200 font-light text-lg md:text-xl leading-[1.65]"
      {...props}
    >
      <span
        aria-hidden
        className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.5)]"
      />
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children, ...props }: HTMLAttributes<HTMLQuoteElement>) => (
    <figure className="my-8 md:my-12 py-8 md:py-12 border-y border-white/10 relative">
      <span
        aria-hidden
        className="absolute -top-2 left-0 text-7xl md:text-8xl font-serif italic font-light leading-none text-[#4589ff]/25 select-none"
      >
        &ldquo;
      </span>
      <blockquote
        className="font-serif italic font-light text-2xl md:text-3xl lg:text-4xl tracking-tight leading-[1.25] text-white pl-12 md:pl-16"
        {...props}
      >
        {children}
      </blockquote>
    </figure>
  ),
  a: (props: HTMLAttributes<HTMLAnchorElement> & { href?: string }) => (
    <a
      className="text-[#4589ff] underline underline-offset-4 decoration-[#0f62fe]/40 hover:decoration-[#4589ff] transition-colors"
      {...props}
    />
  ),
  strong: (props: HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-white" {...props} />
  ),
  em: (props: HTMLAttributes<HTMLElement>) => (
    <em className="italic text-zinc-100" {...props} />
  ),
  code: (props: HTMLAttributes<HTMLElement>) => (
    <code
      className="font-mono text-[0.92em] text-[#34d399] bg-white/[0.04] border border-white/8 rounded px-1.5 py-0.5"
      {...props}
    />
  ),
};

/**
 * Article body wrapper. Sets the outer column spacing the old typed-
 * block renderer carried (flex column + gap-8/gap-10) so paragraph→
 * heading→paragraph rhythm matches the previous visual.
 */
function ArticleBody({ source }: { source: string }) {
  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <MDXRemote source={source} components={mdxComponents as Record<string, (props: HTMLAttributes<HTMLElement>) => ReactNode>} />
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

  const allInsights = getAllInsights();
  const idx = allInsights.findIndex((i) => i.slug === insight.slug);
  const next = allInsights[(idx + 1) % allInsights.length];
  const related = allInsights
    .filter((i) => i.slug !== insight.slug)
    .slice(0, 3);

  // Article JSON-LD. Maps an Insight to schema.org/Article so
  // search engines + LLM crawlers can pick up the headline,
  // summary, hero image, author (Phil G. as a Person), publication
  // date, and canonical URL. The 'articleSection' is the topic
  // category (Leadership / AI & Prototyping / Process & Systems /
  // Case Studies / Psychology / Way of Working) so structured-data
  // consumers can distinguish posts by subject at a glance.
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
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
    articleSection: insight.category,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Inline server-rendered so crawlers see it on first paint.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Navbar />
      {/* ATMOSPHERIC BASE — single off-screen light source.
          Carbon Black (#0a0a0c) field with TWO directional light
          sources whose CENTRES sit outside the viewport, so what
          the page shows is only the trailing fade of a much
          larger glow. Asymmetric on purpose — feels like indirect
          window light entering a dark room, not a symmetric
          spotlight.

          - IBM blue light source: anchored at (-5%, -25%), i.e.
            slightly above-left of the visible area. The viewport
            picks up only the lower-right hemisphere of this
            radial — brightest near the upper-left corner of the
            page, fading rightward and downward through 6 stops.
          - Emerald counterweight: anchored at (108%, 112%), past
            the bottom-right. Quieter (~half the alpha of the
            blue) so it reads as a supporting accent, not a
            second equal subject. Diagonal opposition with the
            blue creates a cinematic directional composition.

          Layered as a single multi-image background on a solid
          carbon-black canvas, so the global AnimatedGradient
          orbs underneath at z-[-2] are fully painted over — the
          insight page owns its own atmosphere. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[-1]"
        style={{
          backgroundColor: "#0a0a0c",
          backgroundImage: `
            radial-gradient(ellipse 95% 80% at -5% -25%, rgba(15, 98, 254, 0.45) 0%, rgba(15, 98, 254, 0.28) 18%, rgba(15, 98, 254, 0.16) 35%, rgba(15, 98, 254, 0.08) 55%, rgba(15, 98, 254, 0.03) 78%, transparent 100%),
            radial-gradient(ellipse 70% 60% at 108% 112%, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0.12) 30%, rgba(16, 185, 129, 0.05) 60%, rgba(16, 185, 129, 0.02) 82%, transparent 100%)
          `,
        }}
      />
      {/* FILM GRAIN — fractal noise overlay.
          200x200 SVG tile baked with feTurbulence (high
          frequency, 2 octaves, stitched) and clamped to a
          luminance-only matrix so the noise is monochrome.
          Tiled across the viewport at opacity 0.06 with
          mix-blend-mode: overlay so it adds depth in midtones
          without darkening shadows or blowing out highlights.
          This is the texture detail that separates "designed
          page" from "default Tailwind dark canvas". */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
          backgroundSize: "200px 200px",
          backgroundRepeat: "repeat",
          opacity: 0.06,
          mixBlendMode: "overlay",
        }}
      />
      <main className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 pb-32">

        {/* Top: back link. Referrer-aware — points to wherever the
            visitor came from (homepage Insights section vs the
            /insights archive root vs a specific paginated/filtered
            view) by reading sessionStorage set at click time. See
            src/lib/insights-back-ref.ts. */}
        <div className="flex items-center justify-between mb-16 max-w-5xl mx-auto">
          <InsightsBackLink />
          <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400">
            {`0${idx + 1} / 0${allInsights.length}`}
          </span>
        </div>

        {/* Header block */}
        <header className="max-w-5xl mx-auto mb-16 md:mb-20">
          <Reveal>
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <span
                className={`inline-flex items-center font-mono text-[10px] tracking-[0.22em] uppercase font-medium px-3 py-1 rounded-full border ${
                  CATEGORY_BADGE[insight.category]
                }`}
              >
                {insight.category}
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
          {insight.body && <ArticleBody source={insight.body} />}
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
                      CATEGORY_BADGE[r.category]
                    }`}
                  >
                    {r.category}
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
