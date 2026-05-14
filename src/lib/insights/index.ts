/**
 * Public surface of the insights content layer. Every other file in
 * the app imports from `@/lib/insights` — never from `./schema` or
 * `./loader` directly — so this barrel is the single rename point if
 * the internal file layout changes.
 *
 * The async server-only variants (getAllInsightsLive,
 * getInsightLive) are NOT re-exported here on purpose. Server
 * pages import them directly from `@/lib/insights/loader-server`
 * so Turbopack can't accidentally trace those imports into client
 * bundles.
 */
export {
  CATEGORIES,
  type Category,
  type Frontmatter,
  type Insight,
} from "./schema";
export {
  getAllInsights,
  getInsight,
  getLatestInsights,
} from "./loader";
