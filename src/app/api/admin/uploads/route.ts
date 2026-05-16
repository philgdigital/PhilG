import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin/auth";

/**
 * GET /api/admin/uploads
 *
 * Lists every admin-uploaded file in Vercel Blob under the
 * deterministic prefixes used by the upload pipeline:
 *
 *   images/{slug}.{ext}   ← saveImageFile()  (src/lib/admin/insights-fs.ts)
 *   audio/{slug}.mp3      ← saveAudioFile()
 *
 * The slug → URL mapping is the only piece of data we need to
 * re-connect orphaned insights (whose JSON record was deleted but
 * whose underlying image / audio files survived in Blob, because
 * the JSON delete only touched `philg/insights.json`, not the
 * `images/` or `audio/` prefixes).
 *
 * Auth: same Bearer-token guard the other admin routes use.
 */

type UploadEntry = {
  slug: string;
  url: string;
  ext?: string;
  uploadedAt?: string;
};

function slugFromImagesPath(pathname: string): {
  slug: string;
  ext: string;
} | null {
  // images/{slug}.{ext}
  const m = pathname.match(/^images\/(.+)\.([a-zA-Z0-9]+)$/);
  if (!m) return null;
  return { slug: m[1], ext: m[2] };
}

function slugFromAudioPath(pathname: string): string | null {
  // audio/{slug}.mp3 (always mp3 per saveAudioFile)
  const m = pathname.match(/^audio\/(.+)\.mp3$/);
  return m ? m[1] : null;
}

export async function GET(req: NextRequest) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN is not configured. This endpoint is only useful in environments where uploads went to Vercel Blob.",
      },
      { status: 503 },
    );
  }

  const { list } = await import("@vercel/blob");

  const images: UploadEntry[] = [];
  const audio: UploadEntry[] = [];

  try {
    const { blobs: imageBlobs } = await list({ prefix: "images/" });
    for (const b of imageBlobs) {
      const parsed = slugFromImagesPath(b.pathname);
      if (!parsed) continue;
      images.push({
        slug: parsed.slug,
        ext: parsed.ext,
        url: b.url,
        uploadedAt:
          b.uploadedAt instanceof Date
            ? b.uploadedAt.toISOString()
            : (b.uploadedAt as string | undefined),
      });
    }

    const { blobs: audioBlobs } = await list({ prefix: "audio/" });
    for (const b of audioBlobs) {
      const slug = slugFromAudioPath(b.pathname);
      if (!slug) continue;
      audio.push({
        slug,
        url: b.url,
        uploadedAt:
          b.uploadedAt instanceof Date
            ? b.uploadedAt.toISOString()
            : (b.uploadedAt as string | undefined),
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Blob list failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ images, audio });
}
