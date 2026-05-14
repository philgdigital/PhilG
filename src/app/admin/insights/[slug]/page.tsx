import Link from "next/link";
import { notFound } from "next/navigation";
import { readInsightBySlug } from "@/lib/admin/insights-fs";
import { InsightEditor } from "@/components/admin/InsightEditor";

/**
 * Admin → Edit insight by slug. Reads the existing post via the
 * filesystem helper and hands the values to InsightEditor in
 * "edit" mode.
 */

type RouteProps = { params: Promise<{ slug: string }> };

export default async function EditInsightPage({ params }: RouteProps) {
  const { slug } = await params;
  const item = await readInsightBySlug(slug);
  if (!item) notFound();

  return (
    <main className="px-6 md:px-12 lg:px-24 py-10 md:py-16 max-w-6xl mx-auto">
      <header className="mb-10">
        <Link
          href="/admin"
          className="inline-block font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-500 hover:text-white transition-colors mb-3"
        >
          ← Back to admin
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Edit insight
        </h1>
        <p className="mt-2 font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500">
          {item.filename}
        </p>
      </header>
      <InsightEditor
        mode="edit"
        oldSlug={item.slug}
        initial={{
          title: item.title,
          date: item.date,
          category: item.category,
          excerpt: item.excerpt,
          readTime: item.readTime,
          image: item.image,
          featured: item.featured,
          video: item.video,
          audio: item.audio,
          body: item.body,
        }}
      />
    </main>
  );
}
