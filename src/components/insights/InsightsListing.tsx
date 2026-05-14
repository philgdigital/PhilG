"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CATEGORIES, type Insight, type Category } from "@/lib/insights";
import { InsightCard } from "./InsightCard";
import { InsightFilters } from "./InsightFilters";
import { Pagination } from "./Pagination";

const PAGE_SIZE = 12;

/**
 * Client-side listing for /insights and /insights/page/[n].
 *
 * Pattern: server-rendered shell + client-driven filter state.
 *
 * - The server page passes ALL insights as a prop. That's safe because
 *   the JSON cache is small (~5-50 KB even with thousands of posts in
 *   the future, and we ship search-relevant fields only).
 * - This component owns the filter UI state, syncing it bidirectionally
 *   with the URL via useSearchParams + router.replace().
 * - When no filter is active, pagination uses PATH segments
 *   (/insights/page/2) so each page has its own static-generated route
 *   and crawls cleanly.
 * - When ANY filter is active, pagination switches to QUERY param
 *   (?page=2) so filter + page combinations stay shareable but
 *   don't explode into a combinatorial pre-generated set.
 *
 * The component receives `page` from the parent (the path segment),
 * but a `?page=N` query param overrides it whenever filters are
 * active — that's how a single component handles both schemes.
 *
 * Search is plain substring match across title + excerpt + body
 * (lowercased on both sides). With ~5 posts this is sub-millisecond.
 * At 1,000+ posts we'd swap in MiniSearch (`minisearch` is already
 * installed) — the substitution is contained to the `filtered`
 * useMemo below and would not change the surrounding UI.
 */

export function InsightsListing({
  allInsights,
  pathPage,
  basePath = "/insights",
}: {
  allInsights: Insight[];
  /** Page number coming from the path (/insights/page/[n] → n). 1 for /insights. */
  pathPage: number;
  basePath?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const category = (CATEGORIES as readonly string[]).includes(categoryParam)
    ? (categoryParam as Category)
    : "";
  const year = searchParams.get("year") ?? "";
  const month = searchParams.get("month") ?? "";
  const queryPageRaw = searchParams.get("page");

  const hasFilter = !!(q || category || year || month);

  // Page resolution: query param wins when present (filtered view),
  // path segment wins otherwise (clean unfiltered URL).
  const page = useMemo(() => {
    if (hasFilter && queryPageRaw) {
      const n = parseInt(queryPageRaw, 10);
      return Number.isFinite(n) && n > 0 ? n : 1;
    }
    return pathPage;
  }, [hasFilter, queryPageRaw, pathPage]);

  // Available years for the year dropdown, newest first.
  const years = useMemo(() => {
    const set = new Set<string>();
    allInsights.forEach((i) => set.add(i.date.slice(0, 4)));
    return Array.from(set).sort().reverse();
  }, [allInsights]);

  // Apply filters in order: category, year, month, q. Sub-millisecond
  // for <2k items. If this becomes a hot spot we'd memoize per filter
  // or swap to MiniSearch for the text path.
  const filtered = useMemo(() => {
    let list = allInsights;
    if (category) list = list.filter((i) => i.category === category);
    if (year) list = list.filter((i) => i.date.startsWith(year));
    if (year && month) {
      list = list.filter((i) => i.date.startsWith(`${year}-${month}`));
    }
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(needle) ||
          i.excerpt.toLowerCase().includes(needle) ||
          i.body.toLowerCase().includes(needle),
      );
    }
    return list;
  }, [allInsights, category, year, month, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  /**
   * Update a single filter key in the URL and reset to page 1.
   * Uses router.replace (no history push) so the back button doesn't
   * stack a history entry per keystroke. When all filters become
   * empty AND we're on /insights/page/N, we navigate back to /insights
   * (or /insights/page/N if user manually wants that) — actually, we
   * always reset to the BASE path with no `/page/N` segment when
   * filters change, because the page count of filtered results may
   * not match the path segment anyway.
   */
  const setFilter = useCallback(
    (key: "q" | "category" | "year" | "month", value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      // Resetting month if year clears
      if (key === "year" && !value) params.delete("month");
      // Always reset to page 1 when a filter changes
      params.delete("page");

      const qs = params.toString();
      const url = qs ? `${basePath}?${qs}` : basePath;
      router.replace(url, { scroll: false });
    },
    [searchParams, router, basePath],
  );

  const clearFilters = useCallback(() => {
    router.replace(basePath, { scroll: false });
  }, [router, basePath]);

  // Reflect search to URL after the user pauses typing (light debounce
  // implemented via a timeout that's reset on every change). The
  // controlled <input> uses the URL value via q, so we need a local
  // value buffer to avoid lag — but for simplicity at small scale we
  // skip the buffer and just update on each keystroke. With 5 posts
  // this is instant. If perceptible lag appears at 1k+ posts, add a
  // useRef-based debounce around setFilter("q", v).

  // Query-string used for pagination href construction. When we have
  // filters, pagination URLs include the filter state. Strip `page`
  // since the Pagination component sets it itself.
  const queryStringForPagination = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [searchParams]);

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <InsightFilters
        q={q}
        category={category}
        year={year}
        month={month}
        years={years}
        totalCount={allInsights.length}
        filteredCount={filtered.length}
        onChangeQ={(v) => setFilter("q", v)}
        onChangeCategory={(v) => setFilter("category", v)}
        onChangeYear={(v) => setFilter("year", v)}
        onChangeMonth={(v) => setFilter("month", v)}
        onClear={clearFilters}
      />

      {visible.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg md:text-xl font-light max-w-xl mx-auto">
            No insights match those filters yet. Try clearing the search or
            picking a different category.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            data-cursor-no-hint="true"
            className="hover-target mt-6 font-mono text-[11px] tracking-[0.22em] uppercase text-[#4589ff] hover:text-white px-5 py-2.5 rounded-full border border-[#0f62fe]/30 hover:border-[#0f62fe]/60 hover:bg-[#0f62fe]/10 transition-all"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 items-stretch">
          {visible.map((insight) => (
            <InsightCard key={insight.slug} insight={insight} />
          ))}
        </div>
      )}

      <Pagination
        page={safePage}
        totalPages={totalPages}
        basePath={basePath}
        queryString={queryStringForPagination}
        usePathPagination={!hasFilter}
      />
    </div>
  );
}
