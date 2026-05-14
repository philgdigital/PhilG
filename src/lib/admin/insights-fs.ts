import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CATEGORIES, type Category } from "@/lib/insights/schema";

/**
 * Admin-side filesystem helpers for managing /content/insights/*.mdx.
 * Server-only — the entire admin surface is gated to local dev by
 * middleware, but be paranoid: anything calling these MUST come
 * from a Route Handler that has already passed the auth+gate.
 *
 * Conventions:
 *   - Filename format is YYYY-MM-DD-{slug}.mdx
 *   - Slug derivation strips the date prefix; collisions on slug
 *     are detected on save.
 *   - After any write, runs build:insights so data.json + PDFs
 *     stay in sync. This is synchronous-ish (spawns a child
 *     process) but it's local dev — a few seconds of latency on
 *     save is acceptable.
 */

export const CONTENT_DIR = path.join(process.cwd(), "content", "insights");
export const AUDIO_DIR = path.join(process.cwd(), "public", "audio");

export type AdminFrontmatter = {
  title: string;
  date: string;
  category: Category;
  excerpt: string;
  readTime: string;
  image?: string;
  featured?: boolean;
  video?: string;
  audio?: string;
};

export type AdminInsight = AdminFrontmatter & {
  slug: string;
  filename: string;
  body: string;
};

function slugFromFilename(file: string): string {
  return file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.mdx$/, "");
}

function filenameFor(date: string, slug: string): string {
  return `${date}-${slug}.mdx`;
}

/**
 * Slug-safe transform: lowercase, hyphenate spaces, strip non
 * url-safe chars, collapse repeats.
 */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function listInsights(): AdminInsight[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map((file) => readInsightByFilename(file))
    .filter((x): x is AdminInsight => x !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function readInsightByFilename(filename: string): AdminInsight | null {
  const p = path.join(CONTENT_DIR, filename);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, "utf8");
  const { data, content } = matter(raw);
  // Coerce YAML-parsed Date back to YYYY-MM-DD string.
  let dateStr =
    data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : typeof data.date === "string"
        ? data.date
        : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) dateStr = "1970-01-01";

  const category = (CATEGORIES as readonly string[]).includes(data.category)
    ? (data.category as Category)
    : ("Leadership" as Category);

  return {
    slug: slugFromFilename(filename),
    filename,
    title: typeof data.title === "string" ? data.title : "",
    date: dateStr,
    category,
    excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
    readTime: typeof data.readTime === "string" ? data.readTime : "",
    image: typeof data.image === "string" ? data.image : undefined,
    featured: data.featured === true,
    video: typeof data.video === "string" ? data.video : undefined,
    audio: typeof data.audio === "string" ? data.audio : undefined,
    body: content.trim(),
  };
}

export function readInsightBySlug(slug: string): AdminInsight | null {
  const found = listInsights().find((i) => i.slug === slug);
  return found ?? null;
}

/**
 * Serialize an AdminFrontmatter + body to MDX string. YAML keys
 * are quoted where needed; date is emitted unquoted in YYYY-MM-DD
 * which the build script's Date-coercion path handles.
 */
function toMdx(fm: AdminFrontmatter, body: string): string {
  const lines: string[] = ["---"];
  lines.push(`title: ${JSON.stringify(fm.title)}`);
  lines.push(`date: ${fm.date}`);
  lines.push(`category: ${JSON.stringify(fm.category)}`);
  lines.push(`excerpt: ${JSON.stringify(fm.excerpt)}`);
  lines.push(`readTime: ${JSON.stringify(fm.readTime)}`);
  if (fm.image) lines.push(`image: ${JSON.stringify(fm.image)}`);
  if (fm.featured) lines.push(`featured: true`);
  if (fm.video) lines.push(`video: ${JSON.stringify(fm.video)}`);
  if (fm.audio) lines.push(`audio: ${JSON.stringify(fm.audio)}`);
  lines.push("---");
  lines.push("");
  lines.push(body.trim());
  lines.push("");
  return lines.join("\n");
}

/**
 * Validate frontmatter shape before writing. Throws with a clear
 * message on the first violation.
 */
function validateFrontmatter(fm: AdminFrontmatter): void {
  if (!fm.title || typeof fm.title !== "string") {
    throw new Error("title is required");
  }
  if (!fm.date || !/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) {
    throw new Error("date must be YYYY-MM-DD");
  }
  if (!(CATEGORIES as readonly string[]).includes(fm.category)) {
    throw new Error(
      `category must be one of: ${CATEGORIES.join(", ")}`,
    );
  }
  if (!fm.excerpt) {
    throw new Error("excerpt is required");
  }
  if (fm.excerpt.length > 280) {
    throw new Error(`excerpt must be ≤280 chars (got ${fm.excerpt.length})`);
  }
  if (!fm.readTime) {
    throw new Error("readTime is required");
  }
}

/**
 * Write (create or update) a post. If `oldFilename` is supplied
 * AND it differs from the new computed filename, the old file is
 * deleted (rename = delete+create). On create, errors out if a
 * file with the target filename already exists.
 */
export function saveInsight(opts: {
  oldFilename?: string;
  fm: AdminFrontmatter;
  body: string;
}): { filename: string; slug: string } {
  validateFrontmatter(opts.fm);
  const slug = toSlug(opts.fm.title);
  if (!slug) throw new Error("title yields an empty slug");
  const newFilename = filenameFor(opts.fm.date, slug);
  const newPath = path.join(CONTENT_DIR, newFilename);

  fs.mkdirSync(CONTENT_DIR, { recursive: true });

  const renaming =
    opts.oldFilename && opts.oldFilename !== newFilename;
  if (!opts.oldFilename) {
    // CREATE
    if (fs.existsSync(newPath)) {
      throw new Error(
        `Filename ${newFilename} already exists. Pick a different title or date.`,
      );
    }
  } else if (renaming) {
    // RENAME
    if (fs.existsSync(newPath)) {
      throw new Error(
        `Filename ${newFilename} already exists. Pick a different title or date.`,
      );
    }
  }

  fs.writeFileSync(newPath, toMdx(opts.fm, opts.body));

  // Clean up the old file if we renamed
  if (renaming) {
    const oldPath = path.join(CONTENT_DIR, opts.oldFilename!);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  regenerateBuildArtifacts();
  return { filename: newFilename, slug };
}

export function deleteInsight(filename: string): void {
  const p = path.join(CONTENT_DIR, filename);
  if (!fs.existsSync(p)) return;
  fs.unlinkSync(p);
  regenerateBuildArtifacts();
}

/**
 * Save an uploaded audio file to /public/audio/{slug}.mp3.
 * Caller passes a Buffer + the post's slug.
 */
export function saveAudioFile(slug: string, buf: Buffer): string {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  const filename = `${slug}.mp3`;
  fs.writeFileSync(path.join(AUDIO_DIR, filename), buf);
  return `/audio/${filename}`;
}

/**
 * Re-walk the MDX corpus and rewrite src/lib/insights/data.json so
 * the running dev server picks up admin changes on next page load.
 *
 * Originally this spawned a child process (the same
 * `scripts/build-insights-data.mjs` used by predev/prebuild), but
 * Turbopack does aggressive static analysis on spawnSync arguments
 * and tries to resolve the script path as an importable module —
 * failing the build. Inlining the regeneration here sidesteps that
 * entirely and keeps the code path synchronous + fast.
 *
 * PDFs are NOT regenerated on save — they'd require booting
 * @react-pdf/renderer in the API route, doubling cold-start cost
 * and bundle size. Phil can run `npm run build:insights-pdfs`
 * manually to refresh them, or just restart dev (`predev` does it).
 */
function regenerateBuildArtifacts(): void {
  const dataPath = path.join(process.cwd(), "src", "lib", "insights", "data.json");
  try {
    const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
    const items = files
      .map((file) => {
        const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
        const { data, content } = matter(raw);
        const dateStr =
          data.date instanceof Date
            ? data.date.toISOString().slice(0, 10)
            : typeof data.date === "string"
              ? data.date
              : "1970-01-01";
        const slug = slugFromFilename(file);
        return {
          title: typeof data.title === "string" ? data.title : "",
          date: dateStr,
          category: typeof data.category === "string" ? data.category : "Leadership",
          excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
          readTime: typeof data.readTime === "string" ? data.readTime : "",
          image: typeof data.image === "string" ? data.image : "/images/about.jpg",
          featured: data.featured === true,
          ...(typeof data.video === "string" ? { video: data.video } : {}),
          ...(typeof data.audio === "string" ? { audio: data.audio } : {}),
          slug,
          body: content.trim(),
          href: `/insights/${slug}`,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify(items, null, 2) + "\n");
  } catch (err) {
    console.warn("[admin] data.json regeneration failed:", err);
  }
}
