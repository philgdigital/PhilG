import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/ui/Reveal";
import { ClosingCallCTA } from "@/components/ClosingCallCTA";
import { InsightsListing } from "@/components/insights/InsightsListing";
import { getAllInsights } from "@/lib/insights";
import { getAllInsightsLive } from "@/lib/insights/loader-server";

// ISR — admin's revalidatePath('/insights/page/N') hits on save.
export const revalidate = 60;
export const dynamicParams = true;

/**
 * /insights/page/[n] — paginated views of the unfiltered listing.
 * Page 1 lives at /insights so this route only handles n ≥ 2.
 *
 * generateStaticParams enumerates every page in the corpus at build
 * time so each pagination URL is a real, static, indexable page.
 * Filtered views use ?page=N on the base /insights route instead —
 * see InsightsListing for the dual-scheme pagination logic.
 */

const PAGE_SIZE = 12;

type RouteProps = {
  params: Promise<{ n: string }>;
};

export function generateStaticParams() {
  const all = getAllInsights();
  const totalPages = Math.ceil(all.length / PAGE_SIZE);
  // Skip page 1 — it's served by /insights/page.tsx
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    n: String(i + 2),
  }));
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { n } = await params;
  const page = parseInt(n, 10);
  const url = `/insights/page/${page}`;
  return {
    title: `Insights · Page ${page} · Phil G.`,
    description:
      "Essays, articles, case studies, and notes on design leadership, AI prototyping, process, and the way I work.",
    alternates: { canonical: url },
    /* Pages 2+ aren't the canonical entry; we still let them be
       indexed but they shouldn't outrank /insights for the brand
       query — the canonical above + the metadata title carry that. */
  };
}

export default async function InsightsPaginatedPage({ params }: RouteProps) {
  const { n } = await params;
  const page = parseInt(n, 10);
  if (!Number.isFinite(page) || page < 2) notFound();

  const all = await getAllInsightsLive();
  const totalPages = Math.ceil(all.length / PAGE_SIZE);
  if (page > totalPages) notFound();

  return (
    <>
      <Navbar />
      <main className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 pb-32 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <header className="mb-16 md:mb-20">
            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
                <span className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
                  Insights · Page {page}
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
          </header>

          {/* Suspense boundary required because InsightsListing calls
              useSearchParams() — Next.js bails out of static
              prerendering for any client-rendered subtree that reads
              search params without one. The fallback renders nothing
              loud since paginated pages are SEO-only and visitors
              landing here see the hydrated state instantly. */}
          <Reveal delay={160}>
            <Suspense fallback={null}>
              <InsightsListing allInsights={all} pathPage={page} />
            </Suspense>
          </Reveal>

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
