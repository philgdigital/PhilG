"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ArrowUpRight } from "@/components/icons/Icons";
import { TiltCard } from "@/components/ui/TiltCard";
import { ElectricBorder } from "@/components/ui/ElectricBorder";
import { type Insight, type Category } from "@/lib/insights";
import { setInsightsBackRef } from "@/lib/insights-back-ref";

/**
 * Shared InsightCard. The compact card variant from the home Insights
 * section, lifted into a reusable component so the /insights listing
 * page can render the same visual without duplicating markup.
 *
 * The featured "hero" card on the home page stays in
 * components/sections/Insights.tsx because its 2-col internal layout
 * is unique to that section. The regular card here matches that
 * section's `RegularCard` 1:1 in style and behaviour (view
 * transitions, magnetic hover, IBM-blue glow shadow on hover).
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

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => unknown;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InsightCard({ insight }: { insight: Insight }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Wrap navigation in document.startViewTransition() when supported.
   * The card image + title share viewTransitionName values with the
   * /insights/[slug] page's hero, so the browser cross-fades them.
   * Cmd/Ctrl/Shift/Alt-click escape hatches stay on the native href.
   *
   * Before navigating, store the current listing URL (path + filters
   * + page) in sessionStorage. The detail page reads this on mount
   * to render a back-link that lands the visitor on the exact page
   * they came from — including their current filter state and
   * pagination position. Without this they'd lose their place after
   * reading an article.
   */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const qs = searchParams.toString();
      const ref = qs ? `${pathname}?${qs}` : pathname;
      setInsightsBackRef(ref);

      const doc = document as ViewTransitionDocument;
      if (typeof doc.startViewTransition !== "function") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      doc.startViewTransition(() => router.push(insight.href));
    },
    [router, insight.href, pathname, searchParams],
  );

  return (
    <TiltCard scale={1.03} maxRotation={4} className="h-full">
      <a
        href={insight.href}
        onClick={handleClick}
        data-magnetic="true"
        className="group glass relative overflow-hidden rounded-2xl border-white/5 hover:border-[#0f62fe]/40 hover:shadow-[0_12px_40px_rgba(15,98,254,0.14)] transition-all duration-500 flex flex-col h-full hover-target"
      >
        <ElectricBorder />

        <div
          className="relative aspect-[16/9] overflow-hidden bg-white/[0.04] animate-pulse"
          style={{ viewTransitionName: `insight-card-${insight.slug}` }}
        >
          <Image
            src={insight.image}
            alt={insight.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700 ease-[var(--ease-out)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-multiply opacity-60 group-hover:opacity-30 transition-opacity duration-700 bg-gradient-to-tr from-[#0f62fe]/15 via-transparent to-[#10b981]/8"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/80 via-transparent to-transparent"
          />
          {/* Category badge over the image, top-left. Strong Carbon
              Black fill (was `bg-black/40` — too transparent over
              light cover images, the category text washed out).
              Matches the same bg/blur used by the homepage
              CategoryBadge in Insights.tsx so every card-style badge
              reads identically. */}
          <div className="absolute top-4 left-4 z-10">
            <span
              className={`inline-flex items-center font-mono text-[10px] tracking-[0.22em] uppercase font-medium px-3 py-1 rounded-full border bg-[#0a0a0c]/85 backdrop-blur-sm ${
                CATEGORY_BADGE[insight.category]
              }`}
            >
              {insight.category}
            </span>
          </div>
        </div>

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

          <p className="text-zinc-400 font-light text-sm leading-relaxed group-hover:text-zinc-200 transition-colors line-clamp-3">
            {insight.excerpt}
          </p>

          <div className="mt-auto pt-4 border-t border-white/8">
            <div className="flex items-center gap-3 font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-zinc-400">
              <span>{formatDate(insight.date)}</span>
              <span aria-hidden className="w-1 h-1 rounded-full bg-zinc-600" />
              <span>{insight.readTime}</span>
            </div>
          </div>
        </div>
      </a>
    </TiltCard>
  );
}
