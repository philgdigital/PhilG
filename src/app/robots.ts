import type { MetadataRoute } from "next";

/**
 * robots.txt
 *
 * Next.js App Router picks this up automatically and serves
 * /robots.txt at build / request time.
 *
 * Policy:
 *   - Allow all standard search crawlers (Googlebot, Bingbot, etc.)
 *     to index the full site.
 *   - Explicitly allow major LLM training / answer-engine crawlers
 *     (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) so the
 *     site's insights + case studies show up inside AI assistants'
 *     answers. Phil's positioning is 'AI-native', so opting OUT of
 *     these crawlers would be self-defeating.
 *   - Point everyone at the sitemap so they can enumerate every
 *     route, not just what's link-discoverable from the homepage.
 *
 * The default `Allow: '/'` applies to anything not explicitly named
 * below, so any AI / search crawler we don't list here gets the
 * permissive default.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
      // Explicit allow rules for AI crawlers so policy is unambiguous.
      // These bots respect robots.txt and read it before crawling.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      { userAgent: "Meta-ExternalAgent", allow: "/" },
      { userAgent: "Meta-ExternalFetcher", allow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
