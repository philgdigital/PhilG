import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { HTMLAttributes, OlHTMLAttributes } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import { ArrowUpRight } from "@/components/icons/Icons";
import { getAllInsights, type Category } from "@/lib/insights";
import { getAllInsightsLive, getInsightLive } from "@/lib/insights/loader-server";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/ui/Reveal";
import { ClosingCallCTA } from "@/components/ClosingCallCTA";
import { InsightsBackLink } from "@/components/insights/InsightsBackLink";
import { ArticleMedia } from "@/components/insights/players/ArticleMedia";
import { VideoPlayer } from "@/components/insights/players/VideoPlayer";
import { PdfDownloadModal } from "@/components/insights/PdfDownloadModal";
import { Carousel } from "@/components/insights/Carousel";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

/**
 * generateStaticParams uses the SYNC seed (data.json) since
 * Next.js calls this synchronously at build time. Any admin-
 * created posts that exist only in Blob will be served on-demand
 * with `dynamicParams = true` (the default), getting their first
 * render at request time and caching for `revalidate` seconds
 * thereafter.
 */
export function generateStaticParams() {
  return getAllInsights().map((i) => ({ slug: i.slug }));
}

/**
 * No HTML cache — re-render on every request. The admin-edited
 * Insight is the source of truth and lives in Vercel Blob; we
 * already fetch it with `cache: 'no-store'` in the loader, so the
 * data path is always-fresh. ISR (revalidate=60) used to layer a
 * CDN cache on top of that, which meant Vercel served stale HTML
 * for up to a minute after each save even though revalidatePath
 * was called — observed live with `x-vercel-cache: STALE` +
 * monotonically increasing `age` for 2 minutes after a save.
 *
 * revalidate=0 = "always stale" = every request re-renders from
 * the lambda. Cost is negligible at portfolio traffic; the win
 * is that admin saves become visible on the next refresh.
 *
 * generateStaticParams below stays — Next still uses it for the
 * sitemap and to enumerate which slugs exist at build time. The
 * prerendered HTML is immediately expired on first request.
 */
export const revalidate = 0;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const insight = await getInsightLive(slug);
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
  "AI Exploration": "text-[#22d3ee] border-[#06b6d4]/35",
  "Digital Business": "text-[#fbbf24] border-[#f59e0b]/35",
  Research: "text-[#a78bfa] border-[#8b5cf6]/35",
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
const mdxComponents: MDXComponents = {
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
    // Editorial pull-quote — IDENTICAL to the home PullQuote
    // section (src/components/sections/PullQuote.tsx).
    //
    // CRITICAL: MDX wraps blockquote content in <p>, which our
    // `p` map styles with body-text classes (text-lg/text-xl).
    // Without overriding those on this specific <p>, the inner
    // element's font-size beats the outer blockquote's font-size
    // and the quote renders at body size. That's the "still
    // small" bug.
    //
    // Fix: Tailwind descendant variants on the figure target the
    // inner <p> and stamp it with the quote typography directly,
    // overriding the body-text classes by descendant specificity.
    // Each `[&_p]:` rule generates `.figure p { ... }` which wins
    // over the standalone class on the <p>.
    // Layout: icon is taken OUT of normal flow via absolute
    // positioning. The figure reserves vertical space for the
    // visible glyph with `pt-*` and the blockquote starts flush
    // against the bottom of that padding zone — so the gap between
    // icon and text is a single fixed value per breakpoint that
    // can't be pushed apart by browser-default `<p>` or
    // `<blockquote>` margins or by line-height air below the glyph.
    // The serif `"` glyph visually fills ~50-60% of its font-size,
    // so pt-* values are calibrated to match that visible height.
    <figure
      className="relative my-10 md:my-16 pt-16 md:pt-20 lg:pt-24 [&_p]:font-serif [&_p]:italic [&_p]:font-light [&_p]:text-xl [&_p]:md:text-2xl [&_p]:lg:text-3xl [&_p]:tracking-tight [&_p]:leading-[1.3] [&_p]:text-white [&_p]:max-w-4xl [&_p]:m-0"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 font-serif italic font-light text-9xl md:text-[10rem] lg:text-[12rem] leading-none text-[#4589ff]/10 select-none"
      >
        &ldquo;
      </span>
      <blockquote
        className="font-serif italic font-light text-xl md:text-2xl lg:text-3xl tracking-tight leading-[1.3] text-white max-w-4xl m-0"
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
  // Standard markdown image (`![alt](url)`). Plain <img> on purpose:
  // body images can land on /public OR on a Vercel Blob URL and we
  // don't want to force next.config remote-pattern entries every
  // time the admin uploads a new host. Editorial frame styling
  // (rounded, hairline border, brand-glow shadow) matches the
  // Carousel single-image fast-path so a `![]()` and a
  // <Carousel images={["…"]} /> with one entry render identically.
  // eslint-disable-next-line @next/next/no-img-element
  img: (props: HTMLAttributes<HTMLImageElement> & { src?: string; alt?: string }) => (
    <figure className="my-8 md:my-12">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...props}
        alt={props.alt ?? ""}
        className="w-full rounded-2xl md:rounded-3xl border border-white/8 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6)] object-cover"
      />
      {props.alt && (
        <figcaption className="mt-3 font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-zinc-500 text-center">
          {props.alt}
        </figcaption>
      )}
    </figure>
  ),
  // Inline YouTube embed — same nice player chrome we use for the
  // optional frontmatter video. Body usage: <YouTube url="…" />.
  // Title prop is optional (defaults to "Embedded video") so authors
  // can drop the tag in with a single URL and move on.
  YouTube: ({ url, title = "Embedded video" }: { url: string; title?: string }) => (
    <div className="my-8 md:my-12">
      <VideoPlayer url={url} title={title} />
    </div>
  ),
  // Carousel of body images — see Carousel.tsx for the markup.
  // MDX usage: <Carousel images={["/url1","/url2","/url3"]} />.
  Carousel,
};

/**
 * Article body wrapper. Sets the outer column spacing the old typed-
 * block renderer carried (flex column + gap-8/gap-10) so paragraph→
 * heading→paragraph rhythm matches the previous visual.
 */
function ArticleBody({ source }: { source: string }) {
  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <MDXRemote source={source} components={mdxComponents} />
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
  const allInsights = await getAllInsightsLive();
  const insight = allInsights.find((i) => i.slug === slug);
  if (!insight) notFound();
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
        <div className="flex items-center justify-between mb-16 max-w-[1400px] mx-auto">
          <InsightsBackLink />
          <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400">
            {`0${idx + 1} / 0${allInsights.length}`}
          </span>
        </div>

        {/* Header block */}
        <header className="max-w-[1400px] mx-auto mb-16 md:mb-20">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
              <div className="flex flex-wrap items-center gap-4">
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
                <span
                  aria-hidden
                  className="w-1 h-1 rounded-full bg-zinc-700"
                />
                <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400">
                  {insight.readTime}
                </span>
              </div>
              {/* Download-as-PDF affordance. Clicking the pill opens
                  a modal that lets the visitor pick between the
                  digital and print-ready PDF variants. Both files
                  are pre-built at the prebuild step (see
                  scripts/build-insights-pdfs.tsx) and live at
                  /pdf/{slug}-{digital|print}.pdf. */}
              <PdfDownloadModal
                slug={insight.slug}
                title={insight.title}
              />
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
            {/* Excerpt spans the full column width (no max-w) so it
                aligns with the headline above, rather than wrapping
                short and creating a ragged left-edge column. */}
            <p className="text-2xl md:text-3xl font-light text-zinc-300 leading-snug">
              {insight.excerpt}
            </p>
          </Reveal>

          {/* Author byline intentionally omitted: every insight on this
              site is by Phil G., so a per-piece byline is redundant. The
              date + read-time row above carries the editorial metadata. */}
        </header>

        {/* Hero slot. When the insight has a video, the video player
            REPLACES the cover image entirely — readers expect the
            top-of-article media to be what they came to watch, and
            having both stacked reads as redundant. The cover image
            stays in use for: card thumbnails (InsightCard) and OG
            share previews (generateMetadata). When there's no video,
            we render the cover image as before. Bottom margin tracks
            whether AUDIO follows below (since audio still mounts via
            ArticleMedia and adds its own breathing space).
            generateStaticParams below stays intact. */}
        <Reveal delay={400}>
          {insight.video ? (
            <div
              className={`max-w-[1400px] mx-auto ${
                insight.audio ? "mb-8 md:mb-12" : "mb-10 md:mb-14"
              }`}
              style={{ viewTransitionName: `insight-card-${insight.slug}` }}
            >
              <VideoPlayer url={insight.video} title={insight.title} />
            </div>
          ) : (
            <div
              className={`relative w-full aspect-[16/8] md:aspect-[16/7] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/8 ${
                insight.audio ? "mb-8 md:mb-12" : "mb-10 md:mb-14"
              } shadow-2xl max-w-[1400px] mx-auto`}
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
          )}
        </Reveal>

        {/* COMPANION AUDIO — optional. The audio narration mounts
            inline + as a sticky pill that fades in on scroll. The
            video (when present) lives in the hero slot above, NOT
            here — ArticleMedia would render it again if we passed
            it. We only pass `audio` so this block stays a pure
            audio surface; ArticleMedia is effectively the audio
            companion now. */}
        {insight.audio && (
          <Reveal delay={500}>
            <ArticleMedia
              title={insight.title}
              audio={insight.audio}
            />
          </Reveal>
        )}

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
        <article className="relative max-w-3xl mx-auto pt-6 md:pt-10 pb-14 md:pb-20">
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

        {/* Closing: next + related. The "Continue reading" eyebrow
            below carries its own trailing hairline rule, so this
            section no longer needs its own top-edge divider — the
            hairline IS the section break.
            Tight top spacing here (pt-6 md:pt-10, no mt) so the
            handoff from the last article paragraph to the next-up
            recommendation reads as a continuous editorial beat,
            not a large gap between unrelated blocks. */}
        <section className="relative pt-6 md:pt-10 max-w-[1400px] mx-auto">
          {/* "Continue reading" section header. Hairline trails off
              to the right so the eyebrow reads as a magazine-style
              chapter divider rather than a plain label. */}
          <Reveal>
            <div className="flex items-center gap-4 mb-8 md:mb-10">
              <span className="font-mono text-[10px] md:text-[11px] tracking-[0.32em] uppercase text-zinc-500">
                Continue reading
              </span>
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-r from-white/15 via-white/5 to-transparent"
              />
            </div>
          </Reveal>

          {/* Editorial recommendation card. Big horizontal composition:
              hero image (44%) + content column (56%). The image picks
              up the same brand-wash treatment as the in-article hero
              + the home Insights cards so the rhythm is consistent
              across the site. The content column carries an eyebrow
              with the category badge, a strong headline that turns
              IBM-blue on hover, a 2-line excerpt preview, and a
              footer meta row separated by a hairline. The whole card
              is one Link with a glass border that lights up to
              IBM-blue + a soft blue glow on hover — same magnetic
              hover language as the home cards.
              At md+ the layout is asymmetric (image left, content
              right); at mobile it stacks. */}
          <Reveal delay={80}>
            <Link
              href={next.href}
              data-magnetic="true"
              className="group block hover-target rounded-2xl md:rounded-3xl overflow-hidden border border-white/8 hover:border-[#0f62fe]/40 hover:shadow-[0_20px_60px_-12px_rgba(15,98,254,0.25)] transition-all duration-700 mb-6 md:mb-10 bg-gradient-to-br from-white/[0.02] to-transparent"
            >
              <div className="grid grid-cols-1 md:grid-cols-[44%_56%] items-stretch">
                {/* IMAGE */}
                <div className="relative aspect-[5/3] md:aspect-auto md:min-h-[320px] overflow-hidden">
                  <Image
                    src={next.image}
                    alt={next.title}
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-[1500ms] ease-[var(--ease-out)]"
                  />
                  {/* Brand wash — same recipe as the in-article hero
                      so the recommendation reads as part of the same
                      editorial fabric. */}
                  <div
                    aria-hidden
                    className="absolute inset-0 mix-blend-multiply opacity-60 group-hover:opacity-30 bg-gradient-to-tr from-[#0f62fe]/30 via-transparent to-[#10b981]/15 transition-opacity duration-700"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/70 via-transparent to-transparent"
                  />
                  {/* Editorial corner index — "02 / 05" style — sits
                      bottom-left of the image. Communicates position
                      in the corpus without needing copy. */}
                  <span className="absolute bottom-4 left-4 z-10 font-mono text-[10px] tracking-[0.22em] uppercase text-white/70 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                    {`0${((idx + 1) % allInsights.length) + 1} / 0${allInsights.length}`}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="relative flex flex-col justify-between gap-8 p-8 md:p-10 lg:p-12">
                  {/* Top eyebrow row: "READ NEXT · [category badge]" */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-500">
                      Read next
                    </span>
                    <span aria-hidden className="w-1 h-1 rounded-full bg-zinc-600" />
                    <span
                      className={`inline-flex items-center font-mono text-[10px] tracking-[0.22em] uppercase font-medium px-3 py-1 rounded-full border ${
                        CATEGORY_BADGE[next.category]
                      }`}
                    >
                      {next.category}
                    </span>
                  </div>

                  {/* Middle: title + excerpt */}
                  <div className="flex flex-col gap-5">
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.05] group-hover:text-[#4589ff] transition-colors duration-500">
                      <span className="inline-flex items-baseline gap-3 flex-wrap">
                        <span>{next.title}</span>
                        <ArrowUpRight className="w-7 h-7 md:w-9 md:h-9 text-[#4589ff] shrink-0 transition-transform duration-500 group-hover:rotate-45" />
                      </span>
                    </h3>
                    <p className="text-base md:text-lg font-light text-zinc-400 leading-relaxed line-clamp-2 group-hover:text-zinc-200 transition-colors max-w-xl">
                      {next.excerpt}
                    </p>
                  </div>

                  {/* Bottom meta + "Continue" affordance, separated by
                      a hairline rule that matches the article-internal
                      rhythm. */}
                  <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/8">
                    <div className="flex items-center gap-3 font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-zinc-400">
                      <span>{formatDate(next.date)}</span>
                      <span aria-hidden className="w-1 h-1 rounded-full bg-zinc-600" />
                      <span>{next.readTime}</span>
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#4589ff] group-hover:text-white transition-colors">
                      Continue →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>

          <Reveal delay={200}>
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 md:pt-8">
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
                above continues the divider rhythm with the related
                cards above without reading as a "marked" edge.
                Spacing mirrors the gap between the "Continue reading"
                card and the related row above (mt-6 md:mt-10 pt-6
                md:pt-8) so the section's vertical rhythm is uniform. */}
            <div className="mt-6 md:mt-10 pt-6 md:pt-8 relative">
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
