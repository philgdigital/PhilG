"use client";

import { ArrowUpRight } from "@/components/icons/Icons";
import { useFormContext } from "@/lib/form-context";

/**
 * Primary CTA button used on subpages (/work/[slug], /insights/[slug])
 * to open the same ProjectFormModal as the homepage footer.
 *
 * Carries the home page's signature primary-CTA styling: border-2 IBM
 * blue, bg-blue/10 ghost fill, hover fills to solid IBM blue with a
 * soft blue glow, ArrowUpRight icon that rotates 45deg on hover. One
 * component owns the styling so subpage CTAs stay consistent with the
 * home page's "Book a 30-min intro" button.
 *
 * Default label is "Discuss your project" (work case-study pages).
 * Pass `label` to override (e.g. "Initiate a project" on insights).
 */
type Props = {
  label?: string;
};

export function DiscussProjectButton({
  label = "Discuss your project",
}: Props) {
  const { openForm } = useFormContext();
  return (
    <button
      type="button"
      onClick={openForm}
      data-magnetic="true"
      className="group inline-flex items-center gap-3 hover-target font-mono text-xs font-medium tracking-[0.22em] uppercase text-white px-8 py-5 rounded-full border-2 border-[#0f62fe] bg-[#0f62fe]/10 hover:bg-[#0f62fe] hover:shadow-[0_0_30px_rgba(15,98,254,0.5)] transition-all duration-500 ease-[var(--ease-out)] will-change-transform"
    >
      <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
      <span>{label}</span>
    </button>
  );
}
