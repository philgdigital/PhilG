import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CATEGORIES, type Category } from "@/lib/insights/schema";

/**
 * Admin-side content helpers for managing /content/insights/*.mdx
 * AND the runtime Blob overlay that holds admin-edited versions.
 *
 * STORAGE MODEL
 *
 *   Seed: /content/insights/*.mdx committed to git. These are the
 *   posts that ship with the deploy.
 *
 *   Overlay: Vercel Blob, prefix `insights/`. When admin saves a
 *   post (new or edit), the .mdx text lands in Blob under
 *   `insights/{filename}.mdx`. The seed files are NEVER mutated
 *   at runtime — they're the immutable initial dataset.
 *
 *   Audio: Vercel Blob, prefix `audio/`. (Same store, different
 *   prefix.) In dev with no Blob token, audio falls back to
 *   /public/audio/{slug}.mp3.
 *
 * READS
 *
 *   The deployed site reads Blob FIRST, falls back to the seed
 *   file for any slug not present in Blob. This means existing
 *   /content/insights/*.mdx posts keep working as-is, AND admin-
 *   created posts on production appear immediately (after the
 *   page's ISR revalidate window).
 *
 *   In dev, with no BLOB_READ_WRITE_TOKEN, only seed files exist.
 *   The admin still works — saves write to the filesystem (and
 *   regenerate data.json inline).
 *
 * THIS IS THE ENTIRE PRODUCTION SETUP
 *
 *   1. Vercel dashboard → Storage → Create Blob store (one click;
 *      Vercel auto-injects BLOB_READ_WRITE_TOKEN into the env).
 *   2. Vercel dashboard → Environment Variables →
 *      ADMIN_PASSWORD = whatever (one input).
 *   3. Redeploy.
 *
 *   No GitHub PAT, no Vercel CLI, no separate audio storage. Just
 *   one Blob store + one password.
 */

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

/** True when we should write to Vercel Blob instead of the filesystem. */
function shouldUseBlob(): boolean {
  return !!BLOB_TOKEN;
}

export const CONTENT_DIR = path.join(process.cwd(), "content", "insights");
export const AUDIO_DIR = path.join(process.cwd(), "public", "audio");
const BLOB_INSIGHTS_PREFIX = "insights/";
const BLOB_AUDIO_PREFIX = "audio/";

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

// -----------------------------------------------------------------
// PARSE — shared between seed reads + Blob reads
// -----------------------------------------------------------------

function parseMdx(filename: string, raw: string): AdminInsight {
  const { data, content } = matter(raw);
  const dateStr =
    data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : typeof data.date === "string"
        ? data.date
        : "1970-01-01";
  const category = (CATEGORIES as readonly string[]).includes(data.category)
    ? (data.category as Category)
    : ("Leadership" as Category);
  return {
    slug: slugFromFilename(filename),
    filename,
    title: typeof data.title === "string" ? data.title : "",
    date: /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : "1970-01-01",
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

// -----------------------------------------------------------------
// READS — merged seed + Blob view
// -----------------------------------------------------------------

/**
 * List all known insights. In production with a Blob token set,
 * this is the union of seed files + Blob overrides, with Blob
 * winning on slug collision. In dev with no token, just seed.
 */
export async function listInsights(): Promise<AdminInsight[]> {
  const bySlug = new Map<string, AdminInsight>();

  // Seed pass — every committed MDX file gets indexed first.
  if (fs.existsSync(CONTENT_DIR)) {
    const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
      const insight = parseMdx(file, raw);
      bySlug.set(insight.slug, insight);
    }
  }

  // Blob pass — admin-edited versions override seed.
  if (shouldUseBlob()) {
    try {
      const { list: blobList } = await import("@vercel/blob");
      const result = await blobList({ prefix: BLOB_INSIGHTS_PREFIX });
      // Each blob.pathname looks like "insights/2026-04-12-foo.mdx"
      await Promise.all(
        result.blobs.map(async (b) => {
          const filename = b.pathname.replace(BLOB_INSIGHTS_PREFIX, "");
          if (!filename.endsWith(".mdx")) return;
          const text = await fetch(b.url, { cache: "no-store" }).then((r) =>
            r.text(),
          );
          const insight = parseMdx(filename, text);
          bySlug.set(insight.slug, insight);
        }),
      );
    } catch (err) {
      console.warn("[admin] failed to list Blob insights:", err);
    }
  }

  return Array.from(bySlug.values()).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

export async function readInsightBySlug(
  slug: string,
): Promise<AdminInsight | null> {
  const all = await listInsights();
  return all.find((i) => i.slug === slug) ?? null;
}

// -----------------------------------------------------------------
// SERIALIZE
// -----------------------------------------------------------------

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

function validateFrontmatter(fm: AdminFrontmatter): void {
  if (!fm.title || typeof fm.title !== "string") {
    throw new Error("title is required");
  }
  if (!fm.date || !/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) {
    throw new Error("date must be YYYY-MM-DD");
  }
  if (!(CATEGORIES as readonly string[]).includes(fm.category)) {
    throw new Error(`category must be one of: ${CATEGORIES.join(", ")}`);
  }
  if (!fm.excerpt) throw new Error("excerpt is required");
  if (fm.excerpt.length > 280) {
    throw new Error(`excerpt must be ≤280 chars (got ${fm.excerpt.length})`);
  }
  if (!fm.readTime) throw new Error("readTime is required");
}

// -----------------------------------------------------------------
// WRITES
// -----------------------------------------------------------------

/**
 * Write (create or update) a post. Returns the resulting filename
 * + slug. In production this writes to Vercel Blob; in dev with
 * no Blob token, to the local filesystem (and regenerates
 * data.json inline so the dev preview is instant).
 */
export async function saveInsight(opts: {
  oldFilename?: string;
  fm: AdminFrontmatter;
  body: string;
}): Promise<{ filename: string; slug: string }> {
  validateFrontmatter(opts.fm);
  const slug = toSlug(opts.fm.title);
  if (!slug) throw new Error("title yields an empty slug");
  const newFilename = filenameFor(opts.fm.date, slug);
  const renaming = !!(opts.oldFilename && opts.oldFilename !== newFilename);
  const mdx = toMdx(opts.fm, opts.body);

  if (shouldUseBlob()) {
    const { put: blobPut, del: blobDel } = await import("@vercel/blob");
    const newPath = `${BLOB_INSIGHTS_PREFIX}${newFilename}`;
    // Note: with Blob we can always overwrite the same path. The
    // seed file (in git) is never touched — Blob just provides an
    // overlay that takes precedence at read time.
    await blobPut(newPath, mdx, {
      access: "public",
      contentType: "text/markdown",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    // If renaming, delete the old Blob entry (if any).
    if (renaming && opts.oldFilename) {
      const oldPath = `${BLOB_INSIGHTS_PREFIX}${opts.oldFilename}`;
      try {
        await blobDel(oldPath);
      } catch {
        // Old blob may not exist (seed file with no prior edit) —
        // not fatal. The seed file in git stays where it is; the
        // new Blob entry at the new path will simply override it.
      }
    }
    return { filename: newFilename, slug };
  }

  // DEV — filesystem.
  const newDiskPath = path.join(CONTENT_DIR, newFilename);
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  if (!opts.oldFilename) {
    if (fs.existsSync(newDiskPath)) {
      throw new Error(
        `Filename ${newFilename} already exists. Pick a different title or date.`,
      );
    }
  } else if (renaming && fs.existsSync(newDiskPath)) {
    throw new Error(
      `Filename ${newFilename} already exists. Pick a different title or date.`,
    );
  }
  fs.writeFileSync(newDiskPath, mdx);
  if (renaming && opts.oldFilename) {
    const oldPath = path.join(CONTENT_DIR, opts.oldFilename);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  regenerateBuildArtifacts();
  return { filename: newFilename, slug };
}

export async function deleteInsight(filename: string): Promise<void> {
  if (shouldUseBlob()) {
    const { del: blobDel } = await import("@vercel/blob");
    try {
      await blobDel(`${BLOB_INSIGHTS_PREFIX}${filename}`);
    } catch {
      // already gone
    }
    return;
  }
  const p = path.join(CONTENT_DIR, filename);
  if (!fs.existsSync(p)) return;
  fs.unlinkSync(p);
  regenerateBuildArtifacts();
}

/**
 * Save an uploaded audio file. In production: Vercel Blob (path
 * `audio/{slug}.mp3`), returns a public CDN URL. In dev: writes
 * to /public/audio/{slug}.mp3, returns `/audio/{slug}.mp3`.
 */
export async function saveAudioFile(
  slug: string,
  buf: Buffer,
  contentType: string = "audio/mpeg",
): Promise<string> {
  if (shouldUseBlob()) {
    const { put: blobPut } = await import("@vercel/blob");
    const result = await blobPut(`${BLOB_AUDIO_PREFIX}${slug}.mp3`, buf, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return result.url;
  }
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  const filename = `${slug}.mp3`;
  fs.writeFileSync(path.join(AUDIO_DIR, filename), buf);
  return `/audio/${filename}`;
}

// -----------------------------------------------------------------
// DEV-ONLY: regenerate the build-time data.json cache so the dev
// preview reflects MDX edits without restarting `npm run dev`.
// -----------------------------------------------------------------

function regenerateBuildArtifacts(): void {
  const dataPath = path.join(
    process.cwd(),
    "src",
    "lib",
    "insights",
    "data.json",
  );
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
          category:
            typeof data.category === "string" ? data.category : "Leadership",
          excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
          readTime: typeof data.readTime === "string" ? data.readTime : "",
          image:
            typeof data.image === "string" ? data.image : "/images/about.jpg",
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
