"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { useFormContext } from "@/lib/form-context";

/**
 * Mounts the Footer with the FormProvider's `openForm` callback wired
 * in. Lives at the root layout so EVERY public route renders the same
 * Footer (homepage, work case studies, insights archive, insight
 * detail pages, paginated listing — all of them).
 *
 * Exception: admin routes. The /admin tree is a utility console — its
 * own layout (src/app/admin/layout.tsx) is intentionally chrome-free
 * (no Navbar, no Footer) and the marketing footer would just dilute
 * focus on the editing surface. We bail by pathname rather than
 * pushing this conditional up into the root layout because the root
 * layout is a Server Component and can't read pathname without an
 * extra client wrapper anyway — this IS that client wrapper.
 */
export function FooterMount() {
  const pathname = usePathname();
  const { openForm } = useFormContext();
  if (pathname?.startsWith("/admin")) return null;
  return <Footer onOpenForm={openForm} />;
}
