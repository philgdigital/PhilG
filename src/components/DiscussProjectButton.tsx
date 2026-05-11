"use client";

import { ArrowUpRight } from "@/components/icons/Icons";
import { useFormContext } from "@/lib/form-context";

/**
 * 'Discuss your project' CTA used on /work/[slug] case-study pages.
 *
 * Opens the same ProjectFormModal as the homepage's footer 'Initiate
 * Project' button via the global FormProvider. Lives as a separate
 * client component so the work [slug] page itself can stay a server
 * component and still trigger the modal.
 */
export function DiscussProjectButton() {
  const { openForm } = useFormContext();
  return (
    <button
      type="button"
      onClick={openForm}
      data-magnetic="true"
      className="group inline-flex items-center gap-3 hover-target font-mono text-xs font-medium tracking-[0.22em] uppercase text-white px-8 py-5 rounded-full border-2 border-[#0f62fe] bg-[#0f62fe]/10 hover:bg-[#0f62fe] hover:shadow-[0_0_30px_rgba(15,98,254,0.5)] transition-all duration-500 ease-[var(--ease-out)] will-change-transform"
    >
      <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
      <span>Discuss your project</span>
    </button>
  );
}
