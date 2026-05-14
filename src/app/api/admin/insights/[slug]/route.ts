import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import {
  readInsightBySlug,
  saveInsight,
  deleteInsight,
  type AdminFrontmatter,
} from "@/lib/admin/insights-fs";
import { CATEGORIES, type Category } from "@/lib/insights/schema";

/**
 * GET    /api/admin/insights/[slug]  — read one post (with body)
 * PUT    /api/admin/insights/[slug]  — update (renames file if
 *                                      title/date changed)
 * DELETE /api/admin/insights/[slug]  — remove the .mdx file
 */

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { slug } = await ctx.params;
  const item = await readInsightBySlug(slug);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { slug } = await ctx.params;
  const existing = await readInsightBySlug(slug);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = parsePayload(raw);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  try {
    const result = await saveInsight({
      oldFilename: existing.filename,
      fm: parsed.fm,
      body: parsed.body,
    });
    // Revalidate listing + old slug + new slug (rename case).
    try {
      revalidatePath("/insights");
      revalidatePath(`/insights/${existing.slug}`);
      if (result.slug !== existing.slug) {
        revalidatePath(`/insights/${result.slug}`);
      }
    } catch {
      /* non-fatal */
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Save failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { slug } = await ctx.params;
  const existing = await readInsightBySlug(slug);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await deleteInsight(existing.filename);
    try {
      revalidatePath("/insights");
      revalidatePath(`/insights/${existing.slug}`);
    } catch {
      /* non-fatal */
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

function parsePayload(
  raw: unknown,
):
  | { fm: AdminFrontmatter; body: string }
  | { error: string } {
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
    image: typeof fmRaw.image === "string" && fmRaw.image ? fmRaw.image : undefined,
    featured: fmRaw.featured === true,
    video: typeof fmRaw.video === "string" && fmRaw.video ? fmRaw.video : undefined,
    audio: typeof fmRaw.audio === "string" && fmRaw.audio ? fmRaw.audio : undefined,
  };
  return { fm, body: obj.body as string };
}
