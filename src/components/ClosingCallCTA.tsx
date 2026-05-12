"use client";

import { ArrowUpRight } from "@/components/icons/Icons";
import { useFormContext } from "@/lib/form-context";

/**
 * Closing-call CTA card. Dark glass rounded panel with an IBM-blue
 * border, title + subtitle on the left, primary "Book a 30-min
 * intro" button on the right. Used wherever the page needs a
 * contained conversion surface that opens the global
 * ProjectFormModal directly (no anchor jump).
 *
 * Default copy matches the home Process section (08 How I Work):
 *   title    : "Want to talk through whether this fits your team?"
 *   subtitle : "Let's walk through your context on a 30-min call."
 *   button   : "Book a 30-min intro"
 *
 * Consumers override any of those props for surface-specific
 * wording. The component does NOT include a Reveal wrapper; let
 * the caller control entry timing.
 */
type Props = {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
};

export function ClosingCallCTA({
  title = "Want to talk through whether this fits your team?",
  subtitle = "Let's walk through your context on a 30-min call.",
  buttonLabel = "Book a 30-min intro",
}: Props) {
  const { openForm } = useFormContext();
  return (
    <div className="glass rounded-3xl p-8 md:p-10 border border-[#0f62fe]/25 hover:border-[#0f62fe]/40 shadow-[0_20px_60px_rgba(15,98,254,0.12)] flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10 transition-all duration-500">
      <div className="flex-1">
        <h4 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug mb-2">
          {title}
        </h4>
        <p className="text-zinc-400 font-light text-base md:text-lg">
          {subtitle}
        </p>
      </div>
      <button
        type="button"
        onClick={openForm}
        data-magnetic="true"
        className="shrink-0 group flex items-center gap-3 text-white font-mono font-medium tracking-[0.18em] uppercase text-xs hover-target px-8 py-5 rounded-full border-2 border-[#0f62fe] bg-[#0f62fe]/10 hover:bg-[#0f62fe] hover:shadow-[0_0_30px_rgba(15,98,254,0.5)] transition-all duration-500 ease-[var(--ease-out)] whitespace-nowrap"
      >
        <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
        <span>{buttonLabel}</span>
      </button>
    </div>
  );
}
