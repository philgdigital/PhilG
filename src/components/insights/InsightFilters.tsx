"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, type Category } from "@/lib/insights";
import { BrandSelect } from "@/components/ui/BrandSelect";

/**
 * Filter bar for /insights. Pure controlled component: receives the
 * current filter state from the parent (which is the URL-state owner)
 * and emits change callbacks. No internal state.
 *
 * UI: a search input + three dropdowns (category, year, month) in
 * a horizontal row at md+, stacked at mobile. The dropdowns are
 * fully-custom BrandSelect components so every picker on the site
 * shares one design language (no native <select> chrome anywhere).
 *
 * Years are derived from the corpus at the parent level and passed in;
 * months are static 01..12 with localized labels.
 */

const MONTHS: { value: string; label: string }[] = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function InsightFilters({
  q,
  category,
  year,
  month,
  years,
  totalCount,
  filteredCount,
  onChangeQ,
  onChangeCategory,
  onChangeYear,
  onChangeMonth,
  onClear,
}: {
  q: string;
  category: Category | "";
  year: string;
  month: string;
  years: string[];
  totalCount: number;
  filteredCount: number;
  onChangeQ: (v: string) => void;
  onChangeCategory: (v: Category | "") => void;
  onChangeYear: (v: string) => void;
  onChangeMonth: (v: string) => void;
  onClear: () => void;
}) {
  const hasFilter = !!(q || category || year || month);

  // The input is locally buffered so every keystroke renders
  // instantly — we don't want each character to go round-trip
  // through router.replace() before the input visibly updates
  // (that's why typing felt laggy / "need 5 letters before
  // anything happens"). The URL sync happens on a short debounce
  // so the filter only fires once the user pauses, not on every
  // keypress.
  const [searchInput, setSearchInput] = useState(q);

  // External URL change (e.g. Clear filters, browser back) →
  // pull the new value into the local input. This stays in sync
  // unless the user is actively typing — the equality guard
  // prevents the debounce effect below from cancelling itself.
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // Local input change → push to URL after a short pause. 150ms
  // is long enough to coalesce a fast typist's burst but short
  // enough that the filter feels responsive (perceived as
  // "instant" since 100–200ms is below the noticeable-lag
  // threshold).
  useEffect(() => {
    if (searchInput === q) return;
    const t = window.setTimeout(() => onChangeQ(searchInput), 150);
    return () => window.clearTimeout(t);
  }, [searchInput, q, onChangeQ]);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {/* Filter row — search input + dropdowns + clear button live on
          ONE line at md+. The search input takes the remaining flex
          space (md:flex-1) so it expands to fill whatever's left
          after the three pill selects. Stacks vertically on mobile. */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="relative md:flex-1">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search insights…"
            aria-label="Search insights"
            className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/8 focus:border-[#0f62fe]/50 rounded-full px-5 py-2.5 md:py-3 text-base md:text-base font-light text-white placeholder:text-zinc-500 outline-none transition-colors"
          />
        </div>
        <BrandSelect
          variant="pill"
          label="Category"
          value={category}
          options={[
            { value: "", label: "All categories" },
            ...CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
          onChange={(v) => onChangeCategory(v as Category | "")}
        />

        <BrandSelect
          variant="pill"
          label="Year"
          value={year}
          options={[
            { value: "", label: "All years" },
            ...years.map((y) => ({ value: y, label: y })),
          ]}
          onChange={onChangeYear}
        />

        <BrandSelect
          variant="pill"
          label="Month"
          value={month}
          /* Month only makes sense in the context of a year, so we
             grey it out (disabled) when no year is selected. The
             select stays visible so the visitor sees the filter
             dimension exists. */
          disabled={!year}
          options={[
            { value: "", label: "All months" },
            ...MONTHS.map((m) => ({ value: m.value, label: m.label })),
          ]}
          onChange={onChangeMonth}
        />

        {hasFilter && (
          <button
            type="button"
            onClick={onClear}
            data-cursor-no-hint="true"
            className="hover-target ml-auto font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-zinc-400 hover:text-white px-4 py-2 rounded-full hover:bg-white/[0.04] transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results summary */}
      <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-zinc-500 mt-1">
        {hasFilter
          ? `${filteredCount} of ${totalCount} ${totalCount === 1 ? "post" : "posts"}`
          : `${totalCount} ${totalCount === 1 ? "post" : "posts"}`}
      </div>
    </div>
  );
}

