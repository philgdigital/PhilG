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
  "AI Exploration",
  "Digital Business",
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
 *                 The most-recent post by date is automatically the
 *                 hero on the home Insights section — no separate
 *                 "featured" flag.
 *   category    — one of CATEGORIES exactly.
 *   excerpt     — ≤280 chars. Card subtitle + meta description.
 *   readTime    — free-form ("8 min read", "32 min watch", "45 min listen").
 *   image       — path under /public. Optional, defaults to about.jpg.
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
  /**
   * Optional companion video for the article. Must be a YouTube URL
   * (youtube.com/watch?v=… or youtu.be/…). The player renders the
   * embed but strips YouTube chrome via a custom skin — see
   * src/components/insights/VideoPlayer.tsx.
   */
  video: z.string().url().optional(),
  /**
   * Optional MP3 audio companion (Phil's narration of the article).
   * Path under /public (typically /audio/{slug}.mp3) or an external
   * absolute URL. The audio player mounts inline at the top of the
   * article body AND in a minimised sticky pill that appears once
   * the inline player scrolls off-screen.
   */
  audio: z.string().optional(),
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
