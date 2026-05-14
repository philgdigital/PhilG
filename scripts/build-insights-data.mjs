/**
 * Insights content-layer build script.
 *
 * Walks /content/insights/*.mdx, parses frontmatter, validates against
 * the schema (in lock-step with src/lib/insights/schema.ts), and emits
 * a single JSON file at src/lib/insights/data.json with the array of
 * fully-resolved Insight records (frontmatter + slug + raw MDX body +
 * href).
 *
 * Runs via `prebuild` and `predev` in package.json so the JSON is
 * always fresh before Next.js sees the imports.
 *
 * Why a JSON file? The homepage is a Client Component, which means
 * the Insights section that hangs off it also has to be a Client
 * Component, which means it cannot use node:fs at render time. A
 * pre-generated JSON file is importable from BOTH client and server
 * contexts (Next.js inlines it via the bundler), so a single source
 * of truth flows through the whole app without duplicating the loader
 * logic per render context.
 *
 * Why .mjs (not .ts)? Plain Node ESM means we can `node` it directly
 * without adding a TypeScript runner as a build-time dep. Validation
 * lives here as plain JS; the schema in src/lib/insights/schema.ts
 * remains the source of truth for the TypeScript types consumers
 * see, and any divergence between this script and the schema would
 * fail at build (either here at validation, or in Next.js at type
 * check).
 *
 * Throws on:
 *   - Missing required frontmatter (title/date/category/excerpt/readTime)
 *   - Invalid date format (must be ISO YYYY-MM-DD)
 *   - Invalid category (must be one of CATEGORIES below)
 *   - Empty title or excerpt
 *   - Excerpt > 280 chars
 *
 * Sort order is reverse-chronological so consumers can treat the
 * first N entries as "the N latest posts" without re-sorting.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CATEGORIES = [
  "Leadership",
  "AI & Prototyping",
  "Process & Systems",
  "Case Studies",
  "Psychology",
  "Way of Working",
];

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "insights");
const OUT_PATH = path.join(ROOT, "src", "lib", "insights", "data.json");

function fail(file, message) {
  throw new Error(`[build-insights-data] ${file}: ${message}`);
}

function validate(file, fm) {
  if (typeof fm.title !== "string" || fm.title.length < 1) {
    fail(file, "frontmatter.title is required and must be a non-empty string");
  }
  if (typeof fm.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) {
    fail(file, `frontmatter.date is required and must match YYYY-MM-DD (got ${JSON.stringify(fm.date)})`);
  }
  if (!CATEGORIES.includes(fm.category)) {
    fail(
      file,
      `frontmatter.category must be one of: ${CATEGORIES.map((c) => `"${c}"`).join(", ")} (got ${JSON.stringify(fm.category)})`,
    );
  }
  if (typeof fm.excerpt !== "string" || fm.excerpt.length < 1) {
    fail(file, "frontmatter.excerpt is required and must be a non-empty string");
  }
  if (fm.excerpt.length > 280) {
    fail(file, `frontmatter.excerpt must be ≤280 chars (got ${fm.excerpt.length})`);
  }
  if (typeof fm.readTime !== "string" || fm.readTime.length < 1) {
    fail(file, "frontmatter.readTime is required and must be a non-empty string");
  }
  if (fm.image !== undefined && typeof fm.image !== "string") {
    fail(file, "frontmatter.image, if provided, must be a string path");
  }
  if (fm.featured !== undefined && typeof fm.featured !== "boolean") {
    fail(file, "frontmatter.featured, if provided, must be a boolean");
  }
}

function slugFromFilename(file) {
  return file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.mdx$/, "");
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    // First run before any content is committed — still emit an empty
    // array so downstream imports compile. Equivalent to "no posts yet".
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, "[]\n");
    console.log(`[build-insights-data] no /content/insights dir; wrote empty array to ${path.relative(ROOT, OUT_PATH)}`);
    return;
  }

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"));

  const insights = files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data: fm, content } = matter(raw);
    // YAML auto-parses unquoted ISO dates into JS Date objects, which
    // makes downstream string handling brittle. Coerce back to the
    // canonical YYYY-MM-DD string at the boundary before validation.
    if (fm.date instanceof Date) {
      fm.date = fm.date.toISOString().slice(0, 10);
    }
    validate(file, fm);
    const slug = slugFromFilename(file);
    return {
      title: fm.title,
      date: fm.date,
      category: fm.category,
      excerpt: fm.excerpt,
      readTime: fm.readTime,
      image: typeof fm.image === "string" ? fm.image : "/images/about.jpg",
      featured: fm.featured === true,
      slug,
      body: content.trim(),
      href: `/insights/${slug}`,
    };
  });

  insights.sort((a, b) => b.date.localeCompare(a.date));

  // Warn if multiple are featured (only one should drive the home
  // section's hero). Not an error — we just take the first one.
  const featuredCount = insights.filter((i) => i.featured).length;
  if (featuredCount > 1) {
    console.warn(
      `[build-insights-data] ${featuredCount} posts marked featured: ${insights
        .filter((i) => i.featured)
        .map((i) => i.slug)
        .join(", ")} (only the most recent will be used as the hero)`,
    );
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(insights, null, 2) + "\n");
  console.log(
    `[build-insights-data] wrote ${insights.length} post${insights.length === 1 ? "" : "s"} to ${path.relative(ROOT, OUT_PATH)}`,
  );
}

main();
