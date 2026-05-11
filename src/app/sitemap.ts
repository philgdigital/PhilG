import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { insights } from "@/lib/insights";

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

export default function sitemap(): MetadataRoute.Sitemap {
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

  const insightRoutes: MetadataRoute.Sitemap = insights.map((i) => ({
    url: `${siteUrl}/insights/${i.slug}`,
    lastModified: new Date(i.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [homepage, ...workRoutes, ...insightRoutes];
}
