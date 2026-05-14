"use client";

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

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {/* Search input */}
      <div className="relative">
        <input
          type="search"
          value={q}
          onChange={(e) => onChangeQ(e.target.value)}
          placeholder="Search insights…"
          aria-label="Search insights"
          className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/8 focus:border-[#0f62fe]/50 rounded-full px-5 py-3 md:py-3.5 text-base md:text-lg font-light text-white placeholder:text-zinc-500 outline-none transition-colors"
        />
      </div>

      {/* Dropdown row */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
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

