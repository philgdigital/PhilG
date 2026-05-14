"use client";

import { Footer } from "@/components/Footer";
import { useFormContext } from "@/lib/form-context";

/**
 * Mounts the Footer with the FormProvider's `openForm` callback wired
 * in. Lives at the root layout so EVERY route renders the same Footer
 * (homepage, work case studies, insights archive, insight detail pages,
 * paginated listing — all of them).
 *
 * The Footer needs `onOpenForm` to wire its CTA to the global form
 * modal. Since the layout itself is a Server Component, we can't call
 * useFormContext() there directly — this tiny client wrapper bridges
 * the gap: it consumes the context (which is provided one level up by
 * FormProvider in layout.tsx) and forwards the callback to Footer.
 *
 * Previously the Footer was mounted inline on the homepage only,
 * meaning subpages had no footer. Moving it here means the footer
 * contact/identity row + LinkedIn + availability badge are always
 * visible, regardless of which page the visitor lands on first.
 */
export function FooterMount() {
  const { openForm } = useFormContext();
  return <Footer onOpenForm={openForm} />;
}
