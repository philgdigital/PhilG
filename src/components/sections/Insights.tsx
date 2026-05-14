"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ArrowUpRight } from "@/components/icons/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";
import {
  getAllInsights,
  getLatestInsights,
  type Insight,
  type Category,
} from "@/lib/insights";
import { setInsightsBackRef, HOME_REF } from "@/lib/insights-back-ref";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => unknown;
};

/**
 * Hook + handler: intercept the click on an Insights card, wrap the
 * Next.js navigation in document.startViewTransition() when the
 * browser supports it, and fall back to native navigation otherwise.
 * The card image + title carry matching viewTransitionName values
 * with the /insights/[slug] page's hero image + h1, so the browser
 * morphs them across the page change.
 */
function useInsightTransitionClick() {
  const router = useRouter();
  return useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // Record where the visitor came from so the insight detail
      // page's back-link points back to the homepage. The HOME_REF
      // sentinel translates to "/#insights" on the read side.
      setInsightsBackRef(HOME_REF);

      const doc = document as ViewTransitionDocument;
      if (typeof doc.startViewTransition !== "function") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      doc.startViewTransition(() => {
        router.push(href);
      });
    },
    [router],
  );
}

/**
 * Insights section. Featured-Hero + 4-card grid (IDEO Journal pattern).
 *
 * One featured piece sits at the top with a 2-column internal layout
 * (image left, content right at lg). Below, the four most recent pieces
 * sit in a 1/2/4 responsive grid as compact cards. Both card styles
 * share: glass surface, category badge (color-coded by Category), date,
 * title with ArrowUpRight, excerpt, byline + read-time row.
 *
 * Posts are loaded from the MDX corpus in /content/insights via the
 * build-time JSON cache (see src/lib/insights/). Reads the 5 most-
 * recent posts; if any are flagged `featured: true` in frontmatter the
 * first match becomes the hero, otherwise the most-recent post fills
 * the hero slot.
 *
 * Visually distinct from Work (sticky scrollytelling) and Testimonials
 * (avatar bento) so the page reads three different rhythms in a row.
 */

/**
 * Category → badge classes. Mirrors the map in
 * src/app/insights/[slug]/page.tsx — kept in sync by hand. Adding a
 * new category means updating BOTH places.
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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] tracking-[0.22em] uppercase font-medium px-3 py-1 rounded-full border ${CATEGORY_BADGE[category]}`}
    >
      {category}
    </span>
  );
}

function MetaRow({ insight }: { insight: Insight }) {
  // text-zinc-400 (was -500) for AA contrast at small mono sizes.
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-zinc-400">
      <span>{formatDate(insight.date)}</span>
      <span aria-hidden className="w-1 h-1 rounded-full bg-zinc-600" />
      <span>{insight.readTime}</span>
    </div>
  );
}

function FeaturedCard({ insight }: { insight: Insight }) {
  const handleClick = useInsightTransitionClick();
  return (
    <TiltCard scale={1.02} maxRotation={3} className="h-full">
      <a
        href={insight.href}
        onClick={(e) => handleClick(e, insight.href)}
        data-magnetic="true"
        className="group glass relative overflow-hidden rounded-3xl border-white/5 hover:border-[#0f62fe]/40 hover:shadow-[0_20px_50px_rgba(15,98,254,0.18)] transition-all duration-500 grid grid-cols-1 lg:grid-cols-[58%_42%] hover-target"
      >
        <ElectricBorder />

        {/* IMAGE. 16:9 on mobile, full-height on lg. */}
        <div
          className="relative aspect-[16/9] lg:aspect-auto overflow-hidden"
          style={{ viewTransitionName: `insight-card-${insight.slug}` }}
        >
          <Image
            src={insight.image}
            alt={insight.title}
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-[1500ms] ease-[var(--ease-out)]"
          />
          {/* Editorial wash gradient: blue → emerald, soft */}
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-multiply opacity-70 group-hover:opacity-40 transition-opacity duration-700 bg-gradient-to-tr from-[#0f62fe]/20 via-transparent to-[#10b981]/10"
          />
          {/* Bottom-fade so any overlay text would still read */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-50"
          />
        </div>

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col gap-6 p-8 md:p-10 lg:p-12">
          <div className="flex items-center justify-between gap-4">
            <CategoryBadge category={insight.category} />
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-400">
              Featured
            </span>
          </div>

          <h4
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.05]"
            style={{ viewTransitionName: `insight-title-${insight.slug}` }}
          >
            <span className="inline-flex items-baseline gap-3 flex-wrap">
              <span>{insight.title}</span>
              <ArrowUpRight className="w-6 h-6 md:w-7 md:h-7 text-[#4589ff] shrink-0 transition-transform duration-500 group-hover:rotate-45" />
            </span>
          </h4>

          <p className="text-zinc-400 font-light text-base md:text-lg leading-relaxed group-hover:text-zinc-200 transition-colors">
            {insight.excerpt}
          </p>

          <div className="mt-auto pt-4 border-t border-white/8">
            <MetaRow insight={insight} />
          </div>
        </div>
      </a>
    </TiltCard>
  );
}

function RegularCard({ insight }: { insight: Insight }) {
  const handleClick = useInsightTransitionClick();
  return (
    <TiltCard scale={1.03} maxRotation={4} className="h-full">
      <a
        href={insight.href}
        onClick={(e) => handleClick(e, insight.href)}
        data-magnetic="true"
        className="group glass relative overflow-hidden rounded-2xl border-white/5 hover:border-[#0f62fe]/40 hover:shadow-[0_12px_40px_rgba(15,98,254,0.14)] transition-all duration-500 flex flex-col h-full hover-target"
      >
        <ElectricBorder />

        {/* IMAGE. 16:9 thumbnail. */}
        <div
          className="relative aspect-[16/9] overflow-hidden"
          style={{ viewTransitionName: `insight-card-${insight.slug}` }}
        >
          <Image
            src={insight.image}
            alt={insight.title}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 768px) 45vw, 100vw"
            className="object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-[1200ms] ease-[var(--ease-out)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-multiply opacity-60 group-hover:opacity-30 transition-opacity duration-700 bg-gradient-to-tr from-[#0f62fe]/15 via-transparent to-[#10b981]/8"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/80 via-transparent to-transparent"
          />
          {/* Type badge over image, top-left */}
          <div className="absolute top-4 left-4 z-10">
            <CategoryBadge category={insight.category} />
          </div>
        </div>

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col gap-4 p-6 md:p-7 flex-1">
          <h4
            className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug"
            style={{ viewTransitionName: `insight-title-${insight.slug}` }}
          >
            <span className="inline-flex items-baseline gap-2 flex-wrap">
              <span>{insight.title}</span>
              <ArrowUpRight className="w-4 h-4 text-[#4589ff] shrink-0 transition-transform duration-500 group-hover:rotate-45" />
            </span>
          </h4>

          <p className="text-zinc-400 font-light text-sm leading-relaxed group-hover:text-zinc-200 transition-colors">
            {insight.excerpt}
          </p>

          <div className="mt-auto pt-4 border-t border-white/8">
            <MetaRow insight={insight} />
          </div>
        </div>
      </a>
    </TiltCard>
  );
}

export function Insights() {
  // 5 most-recent posts. First slot = hero (featured if marked,
  // otherwise the most-recent), next 4 = regular cards.
  const latest = getLatestInsights(5);
  const featured = latest.find((i) => i.featured) ?? latest[0];
  const regulars = latest.filter((i) => i.slug !== featured.slug).slice(0, 4);

  // Total post count is used by the CTA copy to communicate how
  // many more pieces live in the archive beyond the 5 latest on
  // this section (e.g. "5 latest · 17 more in the archive").
  const totalCount = getAllInsights().length;
  const remainder = Math.max(0, totalCount - latest.length);

  return (
    <section
      id="insights"
      className="relative z-10 py-32 md:py-40 px-6 md:px-12 lg:px-24"
    >
      <Reveal>
        <div className="flex items-center gap-4 mb-10">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            <span className="text-zinc-400">11 ·</span> Insights
          </h2>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <h3 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight text-white tracking-tight max-w-4xl mb-16 md:mb-20">
          Notes from the bench.{" "}
          <span className="shine-text italic font-serif">
            The book is still being written.
          </span>
        </h3>
      </Reveal>

      <Reveal delay={200}>
        <div className="mb-10 md:mb-14">
          <FeaturedCard insight={featured} />
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7 items-stretch">
        {regulars.map((insight, i) => (
          <Reveal
            key={insight.slug}
            delay={300 + i * 100}
            className="h-full"
          >
            <RegularCard insight={insight} />
          </Reveal>
        ))}
      </div>

      {/* CTA inviting visitors to the full /insights archive.
          Three-row editorial composition:
            1. Eyebrow with a live "5 of N" count so visitors see
               how much more is in the archive beyond what the
               section showed.
            2. Primary pill button with IBM-blue accent border +
               glow on hover. Sized larger than a utility link so
               it reads as the natural conversion surface for the
               section.
            3. Subline restating the value: search + filters +
               every piece. */}
      <Reveal delay={700}>
        <div className="mt-16 md:mt-24 flex flex-col items-center gap-4">
          {remainder > 0 && (
            <span className="font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-zinc-500">
              {latest.length} of {totalCount} shown · {remainder} more in the archive
            </span>
          )}
          <Link
            href="/insights"
            data-magnetic="true"
            data-cursor-no-hint="true"
            className="group hover-target inline-flex items-center gap-3 md:gap-4 px-7 md:px-9 py-4 md:py-5 rounded-full border-2 border-[#0f62fe]/40 bg-[#0f62fe]/[0.06] hover:bg-[#0f62fe]/[0.15] hover:border-[#0f62fe]/80 hover:shadow-[0_10px_40px_rgba(15,98,254,0.25)] transition-all duration-500 text-base md:text-lg font-medium text-white"
          >
            <span>Browse the full archive</span>
            <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-[#4589ff] transition-transform duration-500 group-hover:rotate-45 group-hover:text-white" />
          </Link>
          <span className="font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-zinc-500 text-center max-w-md">
            Search, filter by category, browse every piece I&apos;ve written.
          </span>
        </div>
      </Reveal>
    </section>
  );
}
