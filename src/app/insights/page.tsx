import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/ui/Reveal";
import { ClosingCallCTA } from "@/components/ClosingCallCTA";
import { InsightsListing } from "@/components/insights/InsightsListing";
import { getAllInsightsLive } from "@/lib/insights/loader-server";

// No HTML cache — re-render on every request. See the same
// comment in src/app/insights/[slug]/page.tsx for the full
// rationale. Vercel's CDN was serving stale HTML for 1-2 minutes
// after every admin save even with revalidatePath called, so we
// drop ISR entirely and let the lambda render fresh each time.
// The Blob read is already `cache: 'no-store'` and runs ~50ms.
export const revalidate = 0;

/**
 * /insights — the listing route. Page 1 of all insights, with
 * search + category + year/month filters and numbered pagination
 * driven by the InsightsListing client component.
 *
 * Page 2 onward lives at /insights/page/[n]/page.tsx, which uses
 * the same client component with a different starting offset.
 *
 * The Server Component here fetches the full corpus once (small JSON
 * import, no fs at request time) and hands it to the client component
 * as a prop. From there the client owns filter + pagination state via
 * URL search params, so every filtered view is shareable.
 */

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  title: "Insights · Phil G.",
  description:
    "Essays, articles, case studies, and notes on design leadership, AI prototyping, process, and the way I work.",
  alternates: { canonical: "/insights" },
  openGraph: {
    type: "website",
    title: "Insights · Phil G.",
    description:
      "Essays, articles, case studies, and notes on design leadership, AI prototyping, process, and the way I work.",
    url: "/insights",
  },
  twitter: {
    card: "summary_large_image",
    title: "Insights · Phil G.",
    description:
      "Essays, articles, case studies, and notes on design leadership, AI prototyping, process, and the way I work.",
  },
};

/**
 * Fallback shown while the client-side listing hydrates. Matches the
 * eventual layout's vertical rhythm so there's no layout jump when
 * the real content arrives. Renders the search box / filter pills as
 * skeleton placeholders.
 */
function InsightsFallback() {
  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <div className="flex flex-col gap-4 md:gap-5">
        <div className="h-12 md:h-14 rounded-full bg-white/[0.04] border border-white/8" />
        <div className="flex flex-wrap gap-3 md:gap-4">
          <div className="h-10 w-44 rounded-full bg-white/[0.04] border border-white/8" />
          <div className="h-10 w-36 rounded-full bg-white/[0.04] border border-white/8" />
          <div className="h-10 w-36 rounded-full bg-white/[0.04] border border-white/8" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 items-stretch">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[5/4] rounded-2xl bg-white/[0.03] border border-white/5"
          />
        ))}
      </div>
    </div>
  );
}

export default async function InsightsIndexPage() {
  const all = await getAllInsightsLive();

  /**
   * Blog JSON-LD. Helps crawlers + LLM agents recognize this page as
   * an editorial index and pick up the publication metadata + every
   * post URL in one structured payload.
   */
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Phil G. Insights",
    url: `${siteUrl}/insights`,
    author: {
      "@type": "Person",
      name: "Phil G.",
      url: siteUrl,
      jobTitle: "UX/Product Design Leader",
    },
    blogPost: all.map((i) => ({
      "@type": "BlogPosting",
      headline: i.title,
      url: `${siteUrl}${i.href}`,
      datePublished: i.date,
      articleSection: i.category,
      description: i.excerpt,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <Navbar />
      <main className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 pb-32 min-h-screen">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <header className="mb-16 md:mb-20">
            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
                <span className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
                  Insights
                </span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-6 max-w-4xl">
                Notes from the bench.{" "}
                <span className="shine-text italic font-serif">
                  The book is still being written.
                </span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-xl md:text-2xl font-light text-zinc-300 leading-snug max-w-3xl">
                Essays, articles, and case studies on design leadership, AI
                prototyping, process &amp; systems, psychology, and the way I
                actually work.
              </p>
            </Reveal>
          </header>

          {/* Filters + cards + pagination. Wrapped in Suspense because
              InsightsListing calls useSearchParams() to read filter
              state from the URL, which forces a client-side render
              boundary on this otherwise static page. */}
          <Reveal delay={240}>
            <Suspense fallback={<InsightsFallback />}>
              <InsightsListing allInsights={all} pathPage={1} />
            </Suspense>
          </Reveal>

          {/* Closing CTA, mirrors the rhythm of the detail pages */}
          <div className="mt-24 md:mt-32 pt-16 relative">
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
            />
            <ClosingCallCTA />
          </div>
        </div>
      </main>
    </>
  );
}
