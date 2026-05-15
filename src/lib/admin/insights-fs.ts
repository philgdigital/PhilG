import "server-only";
import { CATEGORIES, type Category, type Insight } from "@/lib/insights/schema";
import { readInsights, writeInsights, mapBlobError } from "./store";

/**
 * Admin-side helpers for managing insights.
 *
 * One JSON array is the entire data model (see ./store.ts). Each
 * entry is an Insight: { slug, title, date, category, excerpt,
 * readTime, image, video, audio, body, href }. The body is plain
 * markdown stored as a string field. The home-page hero is always
 * the most-recent post by date (no separate "featured" flag).
 *
 * Public surface:
 *   listInsights()              — every post, newest first
 *   readInsightBySlug(slug)     — one post or null
 *   saveInsight({ ... })        — create or update
 *   deleteInsight(slug)         — remove
 *   saveAudioFile(slug, buf)    — upload audio to Blob, return URL
 */

export type AdminFrontmatter = {
  title: string;
  date: string;
  category: Category;
  excerpt: string;
  readTime: string;
  image?: string;
  video?: string;
  audio?: string;
};

export type AdminInsight = Insight;

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function validateFrontmatter(fm: AdminFrontmatter): void {
  if (!fm.title) throw new Error("title is required");
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

function sortNewestFirst(items: Insight[]): Insight[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

export async function listInsights(): Promise<Insight[]> {
  return sortNewestFirst(await readInsights());
}

export async function readInsightBySlug(
  slug: string,
): Promise<Insight | null> {
  const all = await readInsights();
  return all.find((i) => i.slug === slug) ?? null;
}

/**
 * Create or update a post. If `oldSlug` is supplied and differs
 * from the new slug (derived from the title), the post is
 * effectively renamed — the old entry is replaced in place using
 * its array position.
 */
export async function saveInsight(opts: {
  oldSlug?: string;
  fm: AdminFrontmatter;
  body: string;
}): Promise<{ slug: string }> {
  validateFrontmatter(opts.fm);
  const slug = toSlug(opts.fm.title);
  if (!slug) throw new Error("title yields an empty slug");

  const all = await readInsights();
  const renaming = !!(opts.oldSlug && opts.oldSlug !== slug);

  // Slug collision check
  if (!opts.oldSlug || renaming) {
    if (all.some((i) => i.slug === slug)) {
      throw new Error(
        `A post with slug "${slug}" already exists. Pick a different title.`,
      );
    }
  }

  const next: Insight = {
    slug,
    title: opts.fm.title,
    date: opts.fm.date,
    category: opts.fm.category,
    excerpt: opts.fm.excerpt,
    readTime: opts.fm.readTime,
    image: opts.fm.image || "/images/about.jpg",
    video: opts.fm.video,
    audio: opts.fm.audio,
    body: opts.body.trim(),
    href: `/insights/${slug}`,
  };

  let updated: Insight[];
  if (opts.oldSlug) {
    const idx = all.findIndex((i) => i.slug === opts.oldSlug);
    if (idx === -1) {
      // The post being edited isn't in the array yet — happens
      // when it was originally part of the seed and the Blob
      // store has just been populated. Append the new version.
      updated = [...all, next];
    } else {
      updated = [...all];
      updated[idx] = next;
    }
  } else {
    updated = [...all, next];
  }

  await writeInsights(sortNewestFirst(updated));
  return { slug };
}

export async function deleteInsight(slug: string): Promise<void> {
  const all = await readInsights();
  const next = all.filter((i) => i.slug !== slug);
  if (next.length !== all.length) {
    await writeInsights(sortNewestFirst(next));
  }
}

/**
 * Upload audio to Vercel Blob (or /public/audio in dev). Returns
 * the public URL to stamp into the insight's `audio:` field.
 */
export async function saveAudioFile(
  slug: string,
  buf: Buffer,
  contentType: string = "audio/mpeg",
): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    try {
      const result = await put(`audio/${slug}.mp3`, buf, {
        access: "public",
        contentType,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return result.url;
    } catch (e) {
      throw mapBlobError(e);
    }
  }
  // DEV — write to /public/audio.
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "audio");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${slug}.mp3`), buf);
  return `/audio/${slug}.mp3`;
}

/**
 * Map a MIME type to a file extension. Anything unrecognised falls
 * back to `jpg` so the file still gets a sensible name and the
 * browser content-sniffs the actual format on retrieval.
 */
function extFromMime(mime: string): "jpg" | "png" | "webp" | "gif" {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg"; // image/jpeg, image/jpg, anything else
}

/**
 * Upload cover image to Vercel Blob (or /public/images in dev).
 * Returns the public URL to stamp into the insight's `image:`
 * field. Mirror of saveAudioFile — same Blob-vs-filesystem branch,
 * same overwrite semantics. The file extension reflects the real
 * format (jpg/png/webp/gif) so the served Content-Type matches.
 */
export async function saveImageFile(
  slug: string,
  buf: Buffer,
  contentType: string = "image/jpeg",
): Promise<string> {
  const ext = extFromMime(contentType);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    try {
      const result = await put(`images/${slug}.${ext}`, buf, {
        access: "public",
        contentType,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return result.url;
    } catch (e) {
      throw mapBlobError(e);
    }
  }
  // DEV — write to /public/images.
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "images");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${slug}.${ext}`), buf);
  return `/images/${slug}.${ext}`;
}
