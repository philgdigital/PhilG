import type { Metadata } from "next";

/**
 * Admin section layout. Sets a noindex/nofollow on metadata so any
 * production page that somehow leaks (despite the proxy 404 gate)
 * still can't be indexed.
 *
 * Visual chrome is intentionally minimal — black background, no
 * Navbar, no Footer. The admin is a utility, not a marketing
 * surface.
 *
 * The whole subtree is forced to dynamic rendering: admin pages
 * read from the filesystem (insights MDX) and from request cookies,
 * so prerendering them at build time would either fail or capture
 * stale state. The proxy in src/proxy.ts already 404s these routes
 * in production, but force-dynamic + the prerender-skip below is
 * a belt-and-braces guarantee.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin · Phil G.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#0a0a0c] text-white">{children}</div>;
}
