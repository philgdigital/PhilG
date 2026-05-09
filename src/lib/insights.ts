/**
 * Insights. Thought-leadership / writings index.
 *
 * Static seed array. Phil edits this file directly to add or swap pieces.
 * Until real artwork arrives, every entry reuses `/images/about.jpg` as
 * the visual; swap the `image` field to a per-piece asset when ready.
 *
 * Until the /insights/[slug] route exists, set `href` to "#" and link
 * out to a LinkedIn / Medium / YouTube / podcast URL when one is ready.
 */

export type InsightType =
  | "Essay"
  | "Article"
  | "Case Study"
  | "Talk"
  | "Podcast";

export type Insight = {
  /** Future /insights/[slug] route. Lowercase-kebab. */
  slug: string;
  type: InsightType;
  /** ISO date "YYYY-MM-DD". Used for sort + display. */
  date: string;
  title: string;
  /** 1-2 sentences, 140 chars max for clean display. */
  excerpt: string;
  /** "8 min read" / "32 min watch" / "45 min listen". */
  readTime: string;
  /** Path under /public. Currently a shared placeholder. */
  image: string;
  /** External URL or "#" placeholder until live. */
  href: string;
  /** Exactly one entry should be true. */
  featured?: boolean;
};

export const insights: Insight[] = [
  {
    featured: true,
    slug: "design-is-a-leadership-problem",
    type: "Essay",
    date: "2026-04-12",
    title: "Design is a leadership problem.",
    excerpt:
      "Why selling design upward to a CEO is harder than the design itself, and the four moves I learned at Cemex that finally worked.",
    readTime: "8 min read",
    image: "/images/about.jpg",
    href: "#",
  },
  {
    slug: "ai-prototyping-stack",
    type: "Article",
    date: "2026-03-28",
    title: "The AI prototyping stack I actually use.",
    excerpt:
      "Custom GPTs, agents, and generative UI: the practical wiring behind shipping a real React prototype in three days, not three quarters.",
    readTime: "6 min read",
    image: "/images/about.jpg",
    href: "#",
  },
  {
    slug: "kuoni-design-system",
    type: "Case Study",
    date: "2026-03-04",
    title: "From insight to shipped product, in days.",
    excerpt:
      "How a single AI-ready design system at Kuoni Tumlare let twelve designers across three continents ship in parallel.",
    readTime: "5 min read",
    image: "/images/about.jpg",
    href: "#",
  },
  {
    slug: "seventeen-years-mentees",
    type: "Essay",
    date: "2026-02-14",
    title: "17 years, 11 countries, 1,000 mentees.",
    excerpt:
      "What scales when you mentor a thousand designers, and the four traps that don't.",
    readTime: "7 min read",
    image: "/images/about.jpg",
    href: "#",
  },
  {
    slug: "cemex-50-countries-talk",
    type: "Talk",
    date: "2026-01-22",
    title: "Designing for 50+ countries at Cemex.",
    excerpt:
      "Conference recording: enterprise design at scale across regions, regulations, and an industrial customer base.",
    readTime: "32 min watch",
    image: "/images/about.jpg",
    href: "#",
  },
];
