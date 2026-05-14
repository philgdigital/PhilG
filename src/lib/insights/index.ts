/**
 * Public surface of the insights content layer. Every other file in
 * the app imports from `@/lib/insights` — never from `./schema` or
 * `./loader` directly — so this barrel is the single rename point if
 * the internal file layout changes.
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
