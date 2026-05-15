import { NextResponse } from "next/server";
import { getAllInsightsLive } from "@/lib/insights/loader-server";

/**
 * GET /api/insights/latest
 *
 * Public, unauthenticated. Returns the 5 most-recent insights and
 * total post count, both fetched live from Vercel Blob via
 * getAllInsightsLive(). The home Insights section consumes this on
 * mount so admin edits (cover image uploads, new posts, etc.)
 * propagate to the homepage cards immediately instead of waiting
 * for a fresh deploy — the homepage `page.tsx` is a client
 * component and can't `await` the server-only live loader directly,
 * so the live data has to round-trip through a public endpoint.
 *
 * Cache: revalidate=0 + dynamic=force-dynamic so every fetch hits
 * the lambda and reads from Blob fresh. Same reasoning as the
 * /insights pages — admin-edited content should never be stale.
 */
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  const all = await getAllInsightsLive();
  // Keep the response small — strip the body (which can be 2KB+
  // per post). Card surfaces only need slug/title/excerpt/category/
  // date/readTime/image/href.
  const latest = all.slice(0, 5).map((i) => ({
    slug: i.slug,
    title: i.title,
    date: i.date,
    category: i.category,
    excerpt: i.excerpt,
    readTime: i.readTime,
    image: i.image,
    href: i.href,
  }));
  return NextResponse.json({ latest, totalCount: all.length });
}
