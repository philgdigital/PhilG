import { z } from "zod";

/**
 * Insight taxonomy. Single primary category per post (no tags).
 * Six topic-based buckets. Adding a new bucket = append here, update
 * CATEGORY_BADGE in any consumer, and TypeScript / Zod do the rest.
 *
 * The list is declared `as const` so its members become a string-literal
 * union for the `Category` type — that gives autocomplete in editors
 * and a compile-time guard on every `category:` literal in MDX
 * frontmatter (validated by Zod at load time too).
 */
export const CATEGORIES = [
  "Leadership",
  "AI & Prototyping",
  "Process & Systems",
  "Case Studies",
  "Psychology",
  "Way of Working",
] as const;

export type Category = (typeof CATEGORIES)[number];

/**
 * Frontmatter shape. Every .mdx file in /content/insights starts with
 * a `---` YAML block that must satisfy this schema. Parsed once at
 * build time per file by the loader; throws (with the filename) on
 * any violation so a malformed post fails the build instead of
 * silently producing a broken page.
 *
 *   title       — display H1 + browser tab + OG title
 *   date        — ISO YYYY-MM-DD. Used for sort + display + sitemap.
 *   category    — one of CATEGORIES exactly.
 *   excerpt     — ≤280 chars. Card subtitle + meta description.
 *   readTime    — free-form ("8 min read", "32 min watch", "45 min listen").
 *   image       — path under /public. Optional, defaults to about.jpg.
 *   featured    — at most one post should be true. The home Insights
 *                 section uses this to pick the hero card; if no post
 *                 is featured, it falls back to the most-recent.
 */
export const FrontmatterSchema = z.object({
  title: z.string().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be ISO YYYY-MM-DD"),
  category: z.enum(CATEGORIES),
  excerpt: z.string().min(1).max(280),
  readTime: z.string().min(1),
  image: z.string().optional().default("/images/about.jpg"),
  featured: z.boolean().optional().default(false),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;

/**
 * The shape every consumer of the loader receives. Frontmatter plus
 * three loader-derived fields:
 *   slug — derived from the filename (sans YYYY-MM-DD- prefix and .mdx)
 *   body — raw MDX source (everything after the closing `---`).
 *          Rendered by next-mdx-remote/rsc in the detail page.
 *   href — convenience `/insights/${slug}` for direct link consumers.
 */
export type Insight = Frontmatter & {
  slug: string;
  body: string;
  href: string;
};
