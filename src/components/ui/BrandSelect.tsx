"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

/**
 * Branded select / dropdown. Replaces every native `<select>` on the
 * site so all picklists share one design language with the rest of the
 * UI (Carbon Black panel, IBM-blue accent dot, hairline top accent,
 * mono uppercase tracking on the pill variant, animate-modal entrance).
 *
 * Two visual variants:
 *   - "pill"  — small mono-cased pill chrome. Matches the filter bar
 *               on /insights (sits next to the search input).
 *   - "field" — larger rounded-xl field. Matches admin form inputs and
 *               the ProjectFormModal field stack.
 *
 * Behaviour:
 *   - Click trigger to open. Click outside (or pressing Escape) closes
 *     and restores focus to the trigger.
 *   - ArrowDown/ArrowUp navigates options when the panel is open. The
 *     active option highlights with IBM-blue wash; the selected option
 *     gets a small blue dot bullet on the left.
 *   - Enter / Space (when the active item is highlighted) selects.
 *   - Home/End jump to first/last.
 *   - When opened, the visually-active index is preset to the current
 *     selection so keyboard nav starts from the right place.
 *   - ARIA: role="listbox" on the panel, role="option" + aria-selected
 *     on each item, aria-haspopup/aria-expanded/aria-controls on the
 *     trigger button, hidden <select name> mirrors the value for
 *     native form submission compatibility.
 *
 * Why a hidden native select shadows it: lets the parent form pull the
 * value via FormData or uncontrolled refs without us refactoring every
 * form on the site. The custom dropdown is purely a UI layer.
 */

export type BrandSelectOption = {
  value: string;
  label: string;
};

type Props = {
  /** Current selected option's `value`. "" is a valid value (placeholder). */
  value: string;
  /** Emitted when the user picks an option. */
  onChange: (value: string) => void;
  /** Option list in display order. */
  options: BrandSelectOption[];
  /** Visual size + density. Defaults to "field". */
  variant?: "pill" | "field";
  /** Accessible name. Spoken by screen readers and used as the cursor-hint label. */
  label: string;
  /** Optional fallback text when `value` doesn't match any option. */
  placeholder?: string;
  /** When true the trigger is non-interactive and visually muted. */
  disabled?: boolean;
  /** Name for the shadow <input> so plain `<form>` submission picks the value up. */
  name?: string;
  /** Optional id forwarded to the trigger (lets external <label htmlFor> link to us). */
  id?: string;
  /** Extra utilities on the wrapper. */
  className?: string;
  /** Required indicator on the shadow input. Mirrors a native `required` select. */
  required?: boolean;
};

export function BrandSelect({
  value,
  onChange,
  options,
  variant = "field",
  label,
  placeholder = "Select…",
  disabled = false,
  name,
  id,
  className = "",
  required = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reactId = useId();
  const listId = `${reactId}-list`;
  const triggerId = id ?? `${reactId}-trigger`;

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );
  const displayLabel = selected?.label ?? placeholder;

  // Outside-click + Esc close. Mounted only while open so the listener
  // is gone when the menu is collapsed — no global handler running for
  // every tap on the page when no menus are open.
  useEffect(() => {
    if (!open) return;

    const onPointer = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Seed activeIdx to the current selection when the panel opens so
  // keyboard nav starts from the right place. Reset when it closes.
  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setActiveIdx(idx >= 0 ? idx : 0);
    } else {
      setActiveIdx(-1);
    }
  }, [open, options, value]);

  // Keep the active option in view as the visitor arrows through long
  // lists (e.g. the Month picker has 12, the Year picker can grow).
  useEffect(() => {
    if (!open || activeIdx < 0) return;
    const items = listRef.current?.querySelectorAll<HTMLLIElement>("[role='option']");
    items?.[activeIdx]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIdx]);

  const pick = (i: number) => {
    const opt = options[i];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!open) {
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "Enter" ||
        e.key === " "
      ) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIdx(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIdx(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeIdx >= 0) pick(activeIdx);
    }
  };

  const triggerCls =
    variant === "pill"
      ? // Filter-row pill. Mono-cased uppercase chip that matches the
        // existing /insights filter aesthetic (rounded-full, glass
        // hover, hairline border).
        `inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.06] disabled:bg-white/[0.02] disabled:text-zinc-600 disabled:cursor-not-allowed border border-white/8 hover:border-white/15 disabled:hover:border-white/8 rounded-full pl-4 pr-3 py-2.5 font-mono text-[11px] tracking-[0.22em] uppercase text-zinc-300 hover:text-white outline-none focus-visible:border-[#0f62fe]/50 transition-colors hover-target${open ? " border-[#0f62fe]/50 text-white" : ""}`
      : // Form-field variant. Rounded-xl, larger touch target, mixed
        // case body type. Matches the existing inputs in
        // InsightEditor + ProjectFormModal.
        `inline-flex w-full items-center justify-between gap-3 bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] disabled:bg-white/[0.02] disabled:text-zinc-600 disabled:cursor-not-allowed border border-white/10 hover:border-white/20 focus-visible:border-[#0f62fe]/60 rounded-xl px-4 py-3 text-left text-base text-white outline-none transition-colors hover-target${open ? " border-[#0f62fe]/60" : ""}`;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Hidden native input so plain <form> consumers (e.g. the
          ProjectFormModal's FormData submit) keep working — they pick
          up the value via name without caring that our UI is custom. */}
      {name && (
        <input type="hidden" name={name} value={value} required={required} />
      )}

      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        data-cursor-hint={`Pick ${label.toLowerCase()}`}
        className={triggerCls}
      >
        <span className={variant === "pill" ? "truncate" : "truncate flex-1"}>
          {displayLabel}
        </span>
        {/* Chevron. Rotates 180° when the panel is open. */}
        <svg
          aria-hidden
          viewBox="0 0 12 8"
          className={`shrink-0 transition-transform duration-300 ${
            variant === "pill" ? "w-3 h-2" : "w-3.5 h-2.5"
          } ${open ? "rotate-180 text-white" : "text-zinc-500"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 1.5 L6 6.5 L11 1.5" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 left-0 ${
            variant === "pill" ? "min-w-[14rem]" : "w-full min-w-[12rem]"
          } overflow-hidden rounded-2xl bg-[#0a0a0c] border border-white/10 shadow-[0_24px_80px_-20px_rgba(15,98,254,0.45)] animate-modal`}
        >
          {/* Top hairline accent — same flourish as the modal cards. */}
          <div
            aria-hidden
            className="h-px w-full bg-gradient-to-r from-transparent via-[#0f62fe] to-transparent"
          />
          {/* Eyebrow label inside the panel — same micro-typography
              as the rest of the site's modals. Anchors the menu and
              tells the visitor what they're picking. */}
          <div className="px-4 pt-3 pb-2 flex items-center gap-2">
            <span
              aria-hidden
              className="w-1 h-1 rounded-full bg-[#0f62fe] shadow-[0_0_6px_rgba(15,98,254,0.7)]"
            />
            <span className="font-mono text-[9px] md:text-[10px] tracking-[0.28em] uppercase text-zinc-500">
              {label}
            </span>
          </div>
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className="max-h-72 overflow-y-auto pb-2"
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isActive = i === activeIdx;
              return (
                <li
                  key={opt.value || `__empty_${i}`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <button
                    type="button"
                    onClick={() => pick(i)}
                    onMouseEnter={() => setActiveIdx(i)}
                    data-cursor-hint={`Select ${opt.label.toLowerCase()}`}
                    className={`hover-target group flex w-full items-center gap-3 text-left px-4 py-2.5 ${
                      variant === "pill"
                        ? "font-mono text-[11px] tracking-[0.22em] uppercase"
                        : "text-sm"
                    } transition-colors ${
                      isActive
                        ? "bg-[#0f62fe]/15 text-white"
                        : isSelected
                          ? "bg-white/[0.04] text-white"
                          : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    {/* Selection marker. Filled IBM-blue dot when
                        selected; subtle hollow circle otherwise so
                        each row has a consistent column gutter. */}
                    <span
                      aria-hidden
                      className={`shrink-0 w-1.5 h-1.5 rounded-full transition-all ${
                        isSelected
                          ? "bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.7)]"
                          : "bg-transparent border border-white/15 group-hover:border-white/40"
                      }`}
                    />
                    <span className="truncate">{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
