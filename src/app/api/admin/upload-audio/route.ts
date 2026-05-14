import { NextResponse, type NextRequest } from "next/server";
import { saveAudioFile } from "@/lib/admin/insights-fs";
import { toSlug } from "@/lib/admin/insights-fs";
import { requireAuth } from "@/lib/admin/auth";

/**
 * POST /api/admin/upload-audio
 *
 * Requires `Authorization: Bearer <token>`.
 *
 * multipart/form-data:
 *   file: the audio file
 *   slug: the post slug
 *
 * Returns the public URL to stamp into the post's `audio:` field.
 */

const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }
  const file = form.get("file");
  const slugRaw = form.get("slug");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (typeof slugRaw !== "string" || !slugRaw) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }
  const slug = toSlug(slugRaw);
  if (!slug) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 413 },
    );
  }
  if (!file.type.startsWith("audio/")) {
    return NextResponse.json(
      { error: `Expected audio/*, got ${file.type || "unknown"}` },
      { status: 400 },
    );
  }
  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const publicUrl = await saveAudioFile(slug, buf, file.type || "audio/mpeg");
    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
