import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CATEGORIES, type Category } from "@/lib/insights/schema";

// @vercel/blob is imported dynamically inside saveAudioFile /
// deleteAudioBlob so the import only runs when those code paths
// actually execute. A top-level static import was tripping
// Turbopack's page-data collection step.

/**
 * Admin-side content helpers for managing /content/insights/*.mdx.
 *
 * Two execution modes:
 *
 *   DEV MODE — the local `npm run dev` workflow. Reads + writes hit
 *   the actual local filesystem under /content/insights and
 *   /public/audio. Saves are instant; data.json is regenerated
 *   inline so the dev preview reflects the change on next request.
 *
 *   PRODUCTION MODE — running on Vercel. Reads still hit the
 *   filesystem (the deployed code includes the MDX files baked at
 *   build time), but WRITES go through the GitHub API to commit
 *   to philgdigital/PhilG. Vercel's GitHub webhook then triggers
 *   a rebuild and the new/edited post goes live within ~60 s.
 *   Audio uploads land in Vercel Blob and the public URL is
 *   stamped into the frontmatter's `audio:` field.
 *
 * Mode is selected by env vars: if GITHUB_TOKEN + GITHUB_REPO are
 * set, the production path is used. Otherwise, filesystem.
 *
 * Conventions:
 *   - Filename format is YYYY-MM-DD-{slug}.mdx
 *   - Slug derivation strips the date prefix; collisions on slug
 *     are detected on save.
 */

const GH_TOKEN = process.env.GITHUB_TOKEN;
// e.g. "philgdigital/PhilG"
const GH_REPO = process.env.GITHUB_REPO;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

/** True when we should commit via GitHub instead of writing locally. */
function shouldUseGitHub(): boolean {
  return !!(GH_TOKEN && GH_REPO);
}

/** True when we should upload to Vercel Blob instead of /public/audio. */
function shouldUseBlob(): boolean {
  return !!BLOB_TOKEN;
}

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

// -----------------------------------------------------------------
// GitHub API helpers — used when GITHUB_TOKEN + GITHUB_REPO are set.
// Just enough wrapper around the REST contents API to read SHAs,
// commit files, and delete them. No external dep — plain fetch.
// -----------------------------------------------------------------

const GH_API = "https://api.github.com";

function ghHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/** Returns { sha } when the file exists, null when it doesn't (404). */
async function ghGetFileSha(repoPath: string): Promise<string | null> {
  const url = `${GH_API}/repos/${GH_REPO}/contents/${encodeURIComponent(repoPath).replace(/%2F/g, "/")}?ref=${encodeURIComponent(GH_BRANCH)}`;
  const res = await fetch(url, { headers: ghHeaders(), cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub GET ${repoPath} failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { sha?: string };
  return body.sha ?? null;
}

/** Create or update a file via the contents API. */
async function ghPutFile(
  repoPath: string,
  contentB64: string,
  message: string,
  sha?: string,
): Promise<void> {
  const url = `${GH_API}/repos/${GH_REPO}/contents/${encodeURIComponent(repoPath).replace(/%2F/g, "/")}`;
  const body: Record<string, unknown> = {
    message,
    content: contentB64,
    branch: GH_BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`GitHub PUT ${repoPath} failed: ${res.status} ${await res.text()}`);
  }
}

/** Delete a file via the contents API. */
async function ghDeleteFile(
  repoPath: string,
  sha: string,
  message: string,
): Promise<void> {
  const url = `${GH_API}/repos/${GH_REPO}/contents/${encodeURIComponent(repoPath).replace(/%2F/g, "/")}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ message, sha, branch: GH_BRANCH }),
  });
  if (!res.ok) {
    throw new Error(`GitHub DELETE ${repoPath} failed: ${res.status} ${await res.text()}`);
  }
}

function b64(input: string): string {
  return Buffer.from(input, "utf8").toString("base64");
}

// -----------------------------------------------------------------
// PUBLIC SURFACE — saveInsight, deleteInsight, saveAudioFile
// Each detects the mode (filesystem vs GitHub / Vercel Blob) and
// dispatches accordingly.
// -----------------------------------------------------------------

/**
 * Write (create or update) a post. Returns the resulting filename
 * + slug. In production this commits via the GitHub API; in dev
 * it writes to the local filesystem and regenerates data.json.
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

  if (shouldUseGitHub()) {
    // PRODUCTION — commit through GitHub API. Vercel webhooks
    // rebuild the deployment after the commit lands.
    const newRepoPath = `content/insights/${newFilename}`;
    const existingSha = opts.oldFilename
      ? await ghGetFileSha(`content/insights/${opts.oldFilename}`)
      : null;

    if (!opts.oldFilename) {
      // CREATE — error if the target already exists.
      const collide = await ghGetFileSha(newRepoPath);
      if (collide) {
        throw new Error(
          `Filename ${newFilename} already exists. Pick a different title or date.`,
        );
      }
      await ghPutFile(newRepoPath, b64(mdx), `admin: create ${slug}`);
    } else if (renaming) {
      // RENAME — write new, then delete old.
      const collide = await ghGetFileSha(newRepoPath);
      if (collide) {
        throw new Error(
          `Filename ${newFilename} already exists. Pick a different title or date.`,
        );
      }
      await ghPutFile(newRepoPath, b64(mdx), `admin: rename ${opts.oldFilename} → ${newFilename}`);
      if (existingSha) {
        await ghDeleteFile(
          `content/insights/${opts.oldFilename}`,
          existingSha,
          `admin: remove old ${opts.oldFilename} after rename`,
        );
      }
    } else {
      // UPDATE in place — needs the existing SHA.
      if (!existingSha) {
        throw new Error(
          `Existing file ${opts.oldFilename} not found in repo — cannot update.`,
        );
      }
      await ghPutFile(newRepoPath, b64(mdx), `admin: update ${slug}`, existingSha);
    }
    return { filename: newFilename, slug };
  }

  // DEV — local filesystem.
  const newPath = path.join(CONTENT_DIR, newFilename);
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  if (!opts.oldFilename) {
    if (fs.existsSync(newPath)) {
      throw new Error(
        `Filename ${newFilename} already exists. Pick a different title or date.`,
      );
    }
  } else if (renaming && fs.existsSync(newPath)) {
    throw new Error(
      `Filename ${newFilename} already exists. Pick a different title or date.`,
    );
  }
  fs.writeFileSync(newPath, mdx);
  if (renaming) {
    const oldPath = path.join(CONTENT_DIR, opts.oldFilename!);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  regenerateBuildArtifacts();
  return { filename: newFilename, slug };
}

export async function deleteInsight(filename: string): Promise<void> {
  if (shouldUseGitHub()) {
    const repoPath = `content/insights/${filename}`;
    const sha = await ghGetFileSha(repoPath);
    if (!sha) return; // already gone
    await ghDeleteFile(repoPath, sha, `admin: delete ${filename}`);
    return;
  }
  const p = path.join(CONTENT_DIR, filename);
  if (!fs.existsSync(p)) return;
  fs.unlinkSync(p);
  regenerateBuildArtifacts();
}

/**
 * Save an uploaded audio file. In production, the file goes to
 * Vercel Blob and the returned URL is a public CDN link (which
 * is what gets stamped into the post's `audio:` frontmatter). In
 * dev, it lands under /public/audio/{slug}.mp3.
 *
 * Phil can later replace the audio by uploading again with the
 * same slug — the old blob is not auto-deleted (orphan cleanup
 * would be a separate pass; cost is negligible at this volume).
 */
export async function saveAudioFile(
  slug: string,
  buf: Buffer,
  contentType: string = "audio/mpeg",
): Promise<string> {
  if (shouldUseBlob()) {
    // Dynamic import — see top-of-file note. Returns the public
    // CDN URL we stamp into frontmatter.
    const { put: blobPut } = await import("@vercel/blob");
    const blobPath = `audio/${slug}.mp3`;
    const result = await blobPut(blobPath, buf, {
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

/** Best-effort blob cleanup. Currently unused but exported so a
 * future "remove audio" UI can call it. */
export async function deleteAudioBlob(url: string): Promise<void> {
  if (!shouldUseBlob() || !url.startsWith("http")) return;
  try {
    const { del: blobDel } = await import("@vercel/blob");
    await blobDel(url);
  } catch {
    // Non-fatal: blob may already be gone or token may lack delete.
  }
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
