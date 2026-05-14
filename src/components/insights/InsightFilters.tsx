"use client";

import { CATEGORIES, type Category } from "@/lib/insights";

/**
 * Filter bar for /insights. Pure controlled component: receives the
 * current filter state from the parent (which is the URL-state owner)
 * and emits change callbacks. No internal state.
 *
 * UI: a search input + three dropdowns (category, year, month) in
 * a horizontal row at md+, stacked at mobile.
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
        <FilterSelect
          label="Category"
          value={category}
          options={[
            { value: "", label: "All categories" },
            ...CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
          onChange={(v) => onChangeCategory(v as Category | "")}
        />

        <FilterSelect
          label="Year"
          value={year}
          options={[
            { value: "", label: "All years" },
            ...years.map((y) => ({ value: y, label: y })),
          ]}
          onChange={onChangeYear}
        />

        <FilterSelect
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

function FilterSelect({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className="relative inline-flex items-center gap-2 group">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="appearance-none bg-white/[0.04] hover:bg-white/[0.06] disabled:bg-white/[0.02] disabled:text-zinc-600 disabled:cursor-not-allowed border border-white/8 hover:border-white/15 disabled:hover:border-white/8 rounded-full pl-4 pr-9 py-2.5 font-mono text-[11px] tracking-[0.22em] uppercase text-zinc-300 hover:text-white outline-none focus:border-[#0f62fe]/50 transition-colors hover-target"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0a0a0c]">
            {opt.label}
          </option>
        ))}
      </select>
      {/* Chevron */}
      <svg
        aria-hidden
        viewBox="0 0 12 8"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-2 text-zinc-500 group-hover:text-white pointer-events-none transition-colors"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 1.5 L6 6.5 L11 1.5" />
      </svg>
    </label>
  );
}
