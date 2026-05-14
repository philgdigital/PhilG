import type { Insight } from "./schema";
import data from "./data.json";

/**
 * Runtime view of the insights corpus.
 *
 * The actual disk walk + frontmatter parse happens at BUILD time in
 * `scripts/build-insights-data.mjs`, which writes
 * `src/lib/insights/data.json`. That file is what's imported here.
 *
 * Why pre-generate? The homepage is a Client Component, so anything
 * it transitively imports must be bundle-safe (no node:fs). A JSON
 * import is inlined by the Next.js bundler and works in both server
 * AND client contexts from the same source of truth — no per-context
 * duplication, no client/server divergence.
 *
 * The cast through Insight[] is safe because the build script
 * validates each entry against the same schema before writing the
 * JSON; any divergence would have failed the build.
 */
const INSIGHTS = data as unknown as Insight[];

/**
 * Every post, newest first. Already-sorted at build time.
 */
export function getAllInsights(): Insight[] {
  return INSIGHTS;
}

/**
 * Single-post lookup by slug. Returns undefined when the slug isn't
 * found — caller is expected to call `notFound()` in a route handler
 * or fall back gracefully.
 */
export function getInsight(slug: string): Insight | undefined {
  return INSIGHTS.find((i) => i.slug === slug);
}

/**
 * The most-recent N posts. Used by the home Insights section
 * ("hero + 4" → n=5) and anywhere a small slice of latest content
 * is needed without filtering.
 */
export function getLatestInsights(n: number): Insight[] {
  return INSIGHTS.slice(0, n);
}
