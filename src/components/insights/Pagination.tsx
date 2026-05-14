"use client";

import Link from "next/link";
import { useMemo } from "react";

/**
 * Numbered pagination. Renders ‹ Prev / 1 / 2 / 3 / ... / N / Next ›
 * with the current page highlighted. Constructs hrefs in a way that
 * preserves the current filter query string so paginating doesn't
 * drop the filters the visitor has set.
 *
 * Two URL schemes are supported on the same component:
 *   - Path-based, used when no filters are active:
 *       /insights, /insights/page/2, /insights/page/3 ...
 *   - Query-based, used when ANY filter is active:
 *       /insights?category=Leadership&page=2 ...
 *
 * The caller decides which scheme by passing `usePathPagination`.
 *
 * Compact algorithm: always show first, last, current ± 1; collapse
 * the rest into ellipses. For tiny totals (≤7) just show every page.
 */

export function Pagination({
  page,
  totalPages,
  basePath,
  queryString,
  usePathPagination,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  /** Query string already prefixed with `?`, or empty. */
  queryString: string;
  usePathPagination: boolean;
}) {
  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);

  if (totalPages <= 1) return null;

  const hrefFor = (n: number): string => {
    if (usePathPagination) {
      // Path-based: /insights for page 1, /insights/page/N for N>1
      return n === 1 ? `${basePath}${queryString}` : `${basePath}/page/${n}${queryString}`;
    }
    // Query-based: /insights?...&page=N (drop &page=1 for clean canonical)
    const params = new URLSearchParams(queryString.startsWith("?") ? queryString.slice(1) : queryString);
    if (n === 1) params.delete("page");
    else params.set("page", String(n));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const prevHref = page > 1 ? hrefFor(page - 1) : null;
  const nextHref = page < totalPages ? hrefFor(page + 1) : null;

  return (
    <nav
      aria-label="Insights pagination"
      className="mt-16 md:mt-24 flex items-center justify-center gap-1 font-mono text-[11px] tracking-[0.22em] uppercase"
    >
      {prevHref ? (
        <Link
          href={prevHref}
          className="hover-target px-4 py-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          aria-label="Previous page"
        >
          ‹ Prev
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-full text-zinc-700 cursor-not-allowed" aria-hidden>
          ‹ Prev
        </span>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-2 text-zinc-600"
          >
            …
          </span>
        ) : p === page ? (
          <span
            key={p}
            aria-current="page"
            className="px-4 py-2 rounded-full bg-[#0f62fe]/15 text-white border border-[#0f62fe]/40"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            className="hover-target px-4 py-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            aria-label={`Page ${p}`}
          >
            {p}
          </Link>
        ),
      )}

      {nextHref ? (
        <Link
          href={nextHref}
          className="hover-target px-4 py-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          aria-label="Next page"
        >
          Next ›
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-full text-zinc-700 cursor-not-allowed" aria-hidden>
          Next ›
        </span>
      )}
    </nav>
  );
}

/**
 * Build the compact page list: first, last, current ± 1, with "…"
 * for collapsed gaps. Always at most ~7 entries.
 */
function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const result: (number | "…")[] = [1];
  if (current > 3) result.push("…");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) {
    if (p !== 1 && p !== total) result.push(p);
  }
  if (current < total - 2) result.push("…");
  result.push(total);
  return result;
}
