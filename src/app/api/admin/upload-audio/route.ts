import { NextResponse, type NextRequest } from "next/server";
import { saveAudioFile, toSlug } from "@/lib/admin/insights-fs";

/**
 * POST /api/admin/upload-audio
 *
 * multipart/form-data:
 *   file:   the MP3 (or audio/*) file
 *   slug:   the post slug (filename will be {slug}.mp3)
 *
 * Writes to /public/audio/{slug}.mp3 and returns the resulting
 * public URL the admin form should drop into the post's
 * frontmatter `audio:` field.
 */

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
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
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 413 },
    );
  }
  // Loose mime check — audio/* covers mp3, m4a, ogg, etc.
  if (!file.type.startsWith("audio/")) {
    return NextResponse.json(
      { error: `Expected audio/*, got ${file.type || "unknown"}` },
      { status: 400 },
    );
  }

  const arrayBuf = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuf);
  try {
    const publicUrl = await saveAudioFile(slug, buf, file.type || "audio/mpeg");
    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
