import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { getAllInsights } from "@/lib/insights";

/**
 * Dynamic sitemap.
 *
 * Next.js App Router picks this up automatically and serves
 * /sitemap.xml. Enumerates the homepage + every /work/[slug] +
 * /insights/[slug] route so search engines (and LLM crawlers) can
 * discover and revisit every page on the site without relying on
 * link-following alone.
 *
 * `lastModified` is sourced from the insight's `date` field where
 * available; case studies use the project `year` as a coarse
 * approximation (year-only is acceptable per the sitemap spec).
 *
 * Site URL resolution mirrors layout.tsx: env override -> Vercel
 * -> localhost fallback for previews.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

/**
 * Same indexing gate as robots.ts. On previews + locally we return
 * an empty sitemap so even if a crawler ignores robots.txt and hits
 * /sitemap.xml directly, there's nothing for it to enumerate.
 */
const isProduction = process.env.VERCEL_ENV === "production";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isProduction) return [];
  const now = new Date();

  const homepage: MetadataRoute.Sitemap[number] = {
    url: siteUrl,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1.0,
  };

  const workRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${siteUrl}/work/${p.slug}`,
    // Year-only is acceptable per the sitemap spec; use Jan 1 of
    // the project year as a stable timestamp.
    lastModified: new Date(`${p.year}-01-01`),
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  const insights = getAllInsights();

  // Individual insight pages
  const insightRoutes: MetadataRoute.Sitemap = insights.map((i) => ({
    url: `${siteUrl}/insights/${i.slug}`,
    lastModified: new Date(i.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // /insights listing root + numbered pagination pages
  const PAGE_SIZE = 12;
  const totalPages = Math.max(1, Math.ceil(insights.length / PAGE_SIZE));
  const listingLastModified = insights[0]
    ? new Date(insights[0].date)
    : new Date();

  const listingRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/insights`,
      lastModified: listingLastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
      url: `${siteUrl}/insights/page/${i + 2}`,
      lastModified: listingLastModified,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];

  return [homepage, ...workRoutes, ...listingRoutes, ...insightRoutes];
}
