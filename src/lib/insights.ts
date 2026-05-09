/**
 * Insights. Thought-leadership / writings index.
 *
 * Static seed array. Phil edits this file directly to add or swap pieces.
 * Until real artwork arrives, every entry reuses `/images/about.jpg` as
 * the visual; swap the `image` field per piece when ready.
 *
 * Each insight has a `body` array of typed blocks rendered by the
 * /insights/[slug] page. Block types: paragraph (p), heading (h),
 * pull-quote (quote), bulleted list (list).
 */

export type InsightType =
  | "Essay"
  | "Article"
  | "Case Study"
  | "Talk"
  | "Podcast";

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "list"; items: string[] };

export type Insight = {
  /** /insights/[slug] route key. */
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
  /** Future external URL. Currently routes to internal /insights/[slug]. */
  href: string;
  /** Exactly one entry should be true. */
  featured?: boolean;
  /** Article body. Renders on the /insights/[slug] page. */
  body?: ArticleBlock[];
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
    href: "/insights/design-is-a-leadership-problem",
    body: [
      {
        type: "p",
        text: "For the first ten years of my career I thought design was about making things people loved. I was right. I just wasn't right enough. Once you sit at a CEO's table, 'people love it' is not a sentence that closes a budget. It's table stakes. The unlock is design as a leadership problem.",
      },
      {
        type: "p",
        text: "At Cemex, we shipped a B2B platform that 20,000 enterprise customers across 50 countries actually used. Field-crew adoption went from 28% to 71% in six months. The platform isn't beautiful, exactly. It's beloved by the people who depend on it. The reason it shipped, the reason it shipped on time, the reason it shipped at all, was that I learned to translate design as a leadership problem rather than a craft problem.",
      },
      { type: "h", text: "Four moves that worked" },
      {
        type: "p",
        text: "First, I reframed design as outcome rather than output. Output is screens. Outcome is field-crew adoption percentage. Once leadership saw a single number that meant 'are we doing the work or are we not', design moved from a budget item to a metric on the deck.",
      },
      {
        type: "p",
        text: "Second, I led with metrics the CEO already cared about. Design as time-to-market. Design as customer satisfaction. Design as engineering velocity. Pick the metric that's already in the boardroom; design owns it.",
      },
      {
        type: "p",
        text: "Third, I built internal champions before pitching. The wrong order is: pitch the executive committee, then look for support. The right order is: get one VP, then one C-suite officer, both publicly aligned, before the deck ever hits the executive committee agenda.",
      },
      {
        type: "p",
        text: "Fourth, I went for a small win in 90 days. Not a transformation. A measurable, undeniable, one-product-area win that changed a number leadership tracked. From there, 'let's do that across more of the platform' was their idea, not mine.",
      },
      {
        type: "quote",
        text: "Design is a leadership problem. The craft problem is what you bring to the leadership problem. Solve them in that order and you ship.",
      },
      {
        type: "p",
        text: "The temptation in our field is to lead with craft. To assume that if the design is good enough, the executives will see it. They won't. Executives see what's on their dashboard. The leadership problem is making sure design is on the dashboard, with a number against it, every quarter.",
      },
      { type: "p", text: "That's not selling out. It's being in the room." },
    ],
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
    href: "/insights/ai-prototyping-stack",
    body: [
      {
        type: "p",
        text: "I get asked at least once a week what AI tools I use to ship faster. The honest answer is short. The unhelpful answer is 'depends on the project'. The useful answer is the specific stack below, which I run on every Fortune 500 engagement.",
      },
      { type: "h", text: "The four layers" },
      {
        type: "list",
        items: [
          "Custom GPTs trained on the client's brand voice and design tokens. Writes copy, generates component variants, answers stakeholder questions in the client's actual register.",
          "AI agents for research synthesis. Customer interview transcripts go in; structured journey maps and JTBD statements come out, drafted in the client's terminology.",
          "Generative UI tooling for rapid prototyping. From prompt to clickable React in minutes, grounded in the client's design tokens, not generic component libraries.",
          "AI-aware design system. Component contracts and prop schemas that LLMs can reliably emit. Lets the prototype be production-shaped, not throwaway.",
        ],
      },
      { type: "h", text: "What it actually feels like" },
      {
        type: "p",
        text: "A typical Tuesday on a 12-week sprint: 9 AM I push a discovery synthesis prompt into the research GPT with last week's interviews. By 9:15 I have a draft journey map. I refine for 30 minutes. By 10 I'm prompting the generative UI tooling for three component options, grounded in the client's design tokens. By 11 I have clickable React the engineering team can pull immediately.",
      },
      {
        type: "p",
        text: "That cadence (research to interactive prototype in a morning, every week) was unimaginable five years ago. It's also unimaginable for the people not actually building it. Most of what I see online about AI in design is performative. The stack above is the boring, working version.",
      },
      {
        type: "quote",
        text: "I don't talk about AI. I ship with it. The talking is everyone else's job.",
      },
      {
        type: "p",
        text: "Tools change. The shape of the stack doesn't. Discovery feeds research feeds prototype feeds production. AI compresses each step; the steps remain.",
      },
    ],
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
    href: "/insights/kuoni-design-system",
    body: [
      {
        type: "p",
        text: "At Kuoni Tumlare, we shipped a fully tokenized, AI-ready design system that let twelve designers across Europe, Asia, and India ship in parallel without the system breaking. The case study below is the actual sequence we ran.",
      },
      { type: "h", text: "The setup" },
      {
        type: "p",
        text: "Kuoni Tumlare is a B2B travel platform. Their design org was 4 people; their engineering org was 100+. The bottleneck wasn't engineering. It was the throughput of designed-and-validated specs reaching engineering.",
      },
      {
        type: "p",
        text: "My mandate: hire 8 designers, scale to 12, ship a system the engineers would adopt rather than circumvent.",
      },
      { type: "h", text: "The system" },
      { type: "p", text: "We built three things in parallel:" },
      {
        type: "list",
        items: [
          "Design tokens (color, type, spacing, motion, elevation) wired to a CSS variable system the engineers were already using.",
          "Component contracts (props, states, accessibility behavior) co-authored with the engineering platform team in 2-week sprints.",
          "An AI-native prototyping pipeline that generated production React from token-aware Figma. The system, not a prompt, was the source of truth.",
        ],
      },
      { type: "h", text: "The result" },
      {
        type: "p",
        text: "Six months in, the design org was shipping 40% more specs per sprint. Engineering reported half the friction they'd had before, by their own metric. Customer-facing improvements went from quarterly to monthly. None of this required us to grow the design org beyond 12.",
      },
      {
        type: "quote",
        text: "A real design system is not a Figma file. It's a contract. Make the contract and AI can hold it.",
      },
    ],
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
    href: "/insights/seventeen-years-mentees",
    body: [
      {
        type: "p",
        text: "I've been mentoring designers since 2009. Four of them are now design leads at Meta. Several at Booking, Uber, IBM, Accenture. Eleven countries' worth.",
      },
      {
        type: "p",
        text: "The math is easy: 1,000 mentees over 17 years is roughly one new conversation a week, every week, for two decades. The pattern is harder. Not everything that worked for the first hundred works for the next hundred.",
      },
      { type: "h", text: "Four traps that don't scale" },
      {
        type: "list",
        items: [
          "The 1:1 trap. Hour-long calls scale linearly. Your hours don't. After 50 mentees, the 1:1 model breaks. Build cohort and group spaces.",
          "The dialect trap. What works for a US senior designer reads as career-ending advice for a junior in India. Translate, don't replicate.",
          "The lifecycle trap. The advice that gets a designer their first job is the wrong advice for promotion to senior. Stage your guidance.",
          "The ego trap. Mentees grow up. They will eventually disagree with you and be right. Invite that, plan for it, celebrate it.",
        ],
      },
      { type: "h", text: "What actually scales" },
      {
        type: "p",
        text: "One belief, repeated. For me it's: design is a leadership problem. I say it the same way at the IDEO Creative Leadership program, in 1:1s, in conference talks, in cohort group calls. The repetition is the lesson.",
      },
      {
        type: "quote",
        text: "1,000 mentees taught me the same thing 1,000 times. That was the point.",
      },
    ],
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
    href: "/insights/cemex-50-countries-talk",
    body: [
      {
        type: "p",
        text: "This is a description of a 2023 conference talk on enterprise design at scale at Cemex. The talk is recorded; below is the structured summary.",
      },
      { type: "h", text: "The thesis" },
      {
        type: "p",
        text: "Big enterprise platforms don't fail because of design quality. They fail because the design lives in tension with the regulatory, regional, and operational reality of the platform's actual users. At Cemex, 'users' meant a job-site foreman in Mexico checking truck schedules from a phone with one bar of signal, while a procurement officer in Egypt reviewed contract pricing on a desktop in a regulator-mandated language. Same platform. Different reality.",
      },
      { type: "h", text: "The four design constraints" },
      {
        type: "list",
        items: [
          "Speed beats depth. Platform users are not on Cemex.com to admire it. They are on it for a 90-second job. Cut every step that doesn't get them there.",
          "Locale is design, not localization. Translation is the smallest part of the work. Pricing structure, currency norms, regulatory disclosures, units of measurement are all design problems that change per region.",
          "One design system, regional content packs. The system lives in code. The packs live in CMS. Designers in Texas don't need to know about Egyptian VAT disclosure rules; they just need to know there's a slot for them.",
          "Mobile-first means truck-cab-first. Patchy reception. Dusty screens. One thumb. Every page-weight decision should pass the truck-cab test.",
        ],
      },
      {
        type: "quote",
        text: "Design at scale is the discipline of not being there. Your absence has to feel intentional.",
      },
      {
        type: "p",
        text: "A recording of the talk and the deck are available on request.",
      },
    ],
  },
];

/** Lookup by slug. Returns undefined if not found. */
export const getInsight = (slug: string) =>
  insights.find((i) => i.slug === slug);
