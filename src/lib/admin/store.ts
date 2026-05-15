import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import type { Insight } from "@/lib/insights/schema";

/**
 * Simple JSON-array store for every insight.
 *
 * Pattern lifted from the reference project (`Codex/2026-05-08/
 * i-need-to-create-a-simple`):
 *
 *   - One JSON file holds the entire array of items.
 *   - In production with BLOB_READ_WRITE_TOKEN set: the JSON lives
 *     in Vercel Blob at `philg/insights.json`. Writes use
 *     addRandomSuffix so the CDN sees a fresh URL every time and
 *     never serves a stale cache; we keep the newest and delete
 *     prior versions after each write.
 *   - In dev with no Blob token: the JSON lives at
 *     `data/insights.json` on disk.
 *
 * No MDX per-file, no seed-vs-overlay merging, no middleware-time
 * cache priming. One read = the full array. One write = the full
 * array. That's it.
 *
 * The first time we read in production with an empty Blob store,
 * we fall back to the build-time seed snapshot bundled with the
 * deploy (`src/lib/insights/data.json`). The first admin save
 * captures the union of seed + edit and persists it to Blob.
 * From then on, Blob is the source of truth.
 */

const LOCAL_FILE = path.join(process.cwd(), "data", "insights.json");
const BLOB_PATH = "philg/insights.json";

function shouldUseBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function blobPrefix(): string {
  // `philg/insights.json` → `philg/insights` (matches reference
  // pattern — we list this prefix and let put() add a random
  // suffix so every version has a unique URL).
  return BLOB_PATH.replace(/\.json$/i, "");
}

type BlobEntry = {
  url: string;
  pathname: string;
  uploadedAt?: Date | string;
};

async function listBlobVersions(): Promise<BlobEntry[]> {
  const { list } = await import("@vercel/blob");
  const prefix = blobPrefix();
  const { blobs } = await list({ prefix });
  return blobs
    .filter((b) => b.pathname.startsWith(prefix))
    .sort((a, b) => {
      const aT = a.uploadedAt instanceof Date ? a.uploadedAt.getTime() : 0;
      const bT = b.uploadedAt instanceof Date ? b.uploadedAt.getTime() : 0;
      return bT - aT;
    });
}

async function readFromBlob(): Promise<Insight[] | null> {
  const versions = await listBlobVersions();
  const latest = versions[0];
  if (!latest) return null;
  const res = await fetch(latest.url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to read insights from Blob (${res.status})`);
  }
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error("Blob insights payload is not an array");
  }
  return data as Insight[];
}

/**
 * Translate a Vercel Blob SDK error into a clearer message when it
 * matches a known mode-mismatch pattern. The bare SDK error is
 * accurate but reads as opaque to the operator clicking Save in
 * the admin form ("Cannot use public access on a private store" —
 * the operator has no idea where to fix that). Re-throws untouched
 * for any error we don't have a clearer phrasing for.
 *
 * Mirrors the "Vercel Blob is not configured" guard in
 * writeInsights (further below) — same shape, same error-surface
 * pattern.
 */
export function mapBlobError(e: unknown): Error {
  const msg = e instanceof Error ? e.message : String(e);
  if (/private store|public access/i.test(msg)) {
    return new Error(
      "Vercel Blob store must be Public. Delete `philg-blob` in " +
        "the Vercel dashboard (Storage → philg-blob → Delete) and " +
        "recreate it with Public access. The old private store " +
        "rejects every public-access write our code makes.",
    );
  }
  return e instanceof Error ? e : new Error(msg);
}

async function writeToBlob(items: Insight[]): Promise<void> {
  const { put, del } = await import("@vercel/blob");
  const priorVersions = await listBlobVersions();
  try {
    await put(BLOB_PATH, JSON.stringify(items, null, 2) + "\n", {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
      cacheControlMaxAge: 0,
    });
  } catch (e) {
    throw mapBlobError(e);
  }
  if (priorVersions.length > 0) {
    try {
      await del(priorVersions.map((v) => v.url));
    } catch {
      // Best-effort. Leftover blobs are harmless: listBlobVersions
      // always picks the newest by uploadedAt.
    }
  }
}

async function ensureLocalFile(): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  try {
    await fs.stat(LOCAL_FILE);
  } catch {
    await fs.writeFile(LOCAL_FILE, "[]\n", "utf8");
  }
}

async function readFromLocal(): Promise<Insight[]> {
  await ensureLocalFile();
  const text = await fs.readFile(LOCAL_FILE, "utf8");
  const data = JSON.parse(text);
  if (!Array.isArray(data)) {
    throw new Error("Local insights file is not an array");
  }
  return data as Insight[];
}

async function writeToLocal(items: Insight[]): Promise<void> {
  await ensureLocalFile();
  await fs.writeFile(LOCAL_FILE, JSON.stringify(items, null, 2) + "\n", "utf8");
}

/**
 * Build-time seed bundled with the deploy. Used ONCE when the Blob
 * store is empty — the next save persists this seed into Blob,
 * and Blob becomes the live source of truth from then on.
 *
 * Dynamic import so the data isn't bundled into client chunks.
 */
async function readSeedSnapshot(): Promise<Insight[]> {
  try {
    const mod = await import("@/lib/insights/data.json");
    return (mod.default ?? []) as unknown as Insight[];
  } catch {
    return [];
  }
}

/**
 * Read the entire insights array.
 *
 * Order of fallbacks:
 *   1. Vercel Blob (if BLOB_READ_WRITE_TOKEN set + a version exists)
 *   2. data/insights.json (local dev, if it exists)
 *   3. Seed snapshot bundled with the deploy (src/lib/insights/data.json)
 */
export async function readInsights(): Promise<Insight[]> {
  if (shouldUseBlob()) {
    const fromBlob = await readFromBlob();
    if (fromBlob !== null) return fromBlob;
    // Empty Blob — return the seed so the public site renders the
    // initial content. First admin write persists the merged result.
    return readSeedSnapshot();
  }
  try {
    const local = await readFromLocal();
    if (local.length > 0) return local;
  } catch {
    // ignore — fall through to seed
  }
  return readSeedSnapshot();
}

/**
 * Replace the entire insights array. In production: Vercel Blob.
 * In dev: data/insights.json.
 *
 * On Vercel the filesystem under /var/task is read-only, so falling
 * back to writeToLocal there would error with a cryptic
 * `ENOENT: mkdir '/var/task/data'`. Detect that scenario explicitly
 * and throw a self-explanatory message — the visitor (i.e. the
 * admin operator) sees this verbatim in the editor's error pill.
 */
export async function writeInsights(items: Insight[]): Promise<void> {
  if (shouldUseBlob()) {
    await writeToBlob(items);
    return;
  }
  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) {
    throw new Error(
      "Vercel Blob is not configured. Add a Blob store to this project " +
        "(Vercel dashboard → Storage → Create Database → Blob) and " +
        "redeploy so BLOB_READ_WRITE_TOKEN is available to the runtime.",
    );
  }
  await writeToLocal(items);
}
