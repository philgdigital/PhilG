"use client";

/**
 * Single source of truth for the "Available for new clients" pill.
 * Used in the hero (top of page) and the footer (bottom of page).
 * Edit this component once; both placements update.
 */
type AvailabilityBadgeProps = {
  className?: string;
  /** Compact variant for footer (smaller padding, no glow). Default: hero size. */
  variant?: "default" | "compact";
  /** Optional click handler. Used in the footer to open the contact form. */
  onClick?: () => void;
};

const COPY = "Available for new clients";

export function AvailabilityBadge({
  className = "",
  variant = "default",
  onClick,
}: AvailabilityBadgeProps) {
  const isCompact = variant === "compact";

  const wrapperBase =
    "inline-flex items-center gap-3 rounded-full border bg-white/5 backdrop-blur-xl";
  const wrapperSize = isCompact
    ? "px-5 py-3 border-white/5 hover:bg-white/10 hover:border-[#0f62fe]/50 transition-all duration-300"
    : "px-5 py-3 border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.18)]";

  const dot = (
    <span
      className={`w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.9)] animate-pulse`}
    />
  );

  const label = (
    <span
      className={`font-mono ${
        isCompact
          ? "text-[10px] md:text-xs"
          : "text-xs"
      } font-medium tracking-[0.18em] uppercase text-white`}
    >
      {COPY}
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${wrapperBase} ${wrapperSize} hover-target ${className}`}
      >
        {dot}
        {label}
      </button>
    );
  }

  return (
    <div className={`${wrapperBase} ${wrapperSize} ${className}`}>
      {dot}
      {label}
    </div>
  );
}
