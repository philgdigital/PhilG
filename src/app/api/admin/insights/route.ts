import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import {
  listInsights,
  saveInsight,
  type AdminFrontmatter,
} from "@/lib/admin/insights-fs";
import { requireAuth } from "@/lib/admin/auth";
import { CATEGORIES, type Category } from "@/lib/insights/schema";

/**
 * GET  /api/admin/insights — list all insights (with body)
 * POST /api/admin/insights — create a new post
 *
 * Both require `Authorization: Bearer <token>` where token =
 * the value returned from POST /api/admin/login (= the admin
 * password).
 */

export async function GET(req: NextRequest) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;
  const items = await listInsights();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = parsePayload(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  try {
    const result = await saveInsight({ fm: parsed.fm, body: parsed.body });
    try {
      revalidatePath("/insights");
      revalidatePath(`/insights/${result.slug}`);
    } catch {
      /* non-fatal */
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Save failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

function parsePayload(
  raw: unknown,
): { fm: AdminFrontmatter; body: string } | { error: string } {
  if (typeof raw !== "object" || raw === null) return { error: "Body must be an object" };
  const obj = raw as Record<string, unknown>;
  if (typeof obj.fm !== "object" || obj.fm === null) {
    return { error: "Body must contain `fm` object" };
  }
  if (typeof obj.body !== "string") {
    return { error: "Body must contain `body` string" };
  }
  const fmRaw = obj.fm as Record<string, unknown>;
  const category = fmRaw.category;
  if (
    typeof category !== "string" ||
    !(CATEGORIES as readonly string[]).includes(category)
  ) {
    return {
      error: `fm.category must be one of: ${CATEGORIES.join(", ")}`,
    };
  }
  const fm: AdminFrontmatter = {
    title: String(fmRaw.title ?? ""),
    date: String(fmRaw.date ?? ""),
    category: category as Category,
    excerpt: String(fmRaw.excerpt ?? ""),
    readTime: String(fmRaw.readTime ?? ""),
    image:
      typeof fmRaw.image === "string" && fmRaw.image ? fmRaw.image : undefined,
    video:
      typeof fmRaw.video === "string" && fmRaw.video ? fmRaw.video : undefined,
    audio:
      typeof fmRaw.audio === "string" && fmRaw.audio ? fmRaw.audio : undefined,
  };
  return { fm, body: obj.body as string };
}
