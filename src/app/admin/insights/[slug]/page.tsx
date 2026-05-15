"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { InsightEditor } from "@/components/admin/InsightEditor";
import { adminFetch } from "@/lib/admin/client-auth";
import type { Insight } from "@/lib/insights/schema";

/**
 * Admin → edit one insight. Client component that fetches the
 * post via /api/admin/insights/[slug] with the bearer token and
 * hands the values to InsightEditor in "edit" mode.
 */

type RouteProps = { params: Promise<{ slug: string }> };

export default function EditInsightPage({ params }: RouteProps) {
  const { slug } = use(params);
  return (
    <AdminAuthGate>
      <EditInsight slug={slug} />
    </AdminAuthGate>
  );
}

function EditInsight({ slug }: { slug: string }) {
  const [item, setItem] = useState<Insight | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminFetch(`/api/admin/insights/${slug}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (!cancelled) setError(body?.error ?? `Load failed (${res.status})`);
          return;
        }
        const body = await res.json();
        if (!cancelled) setItem(body.item as Insight);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return (
      <main className="px-6 md:px-12 lg:px-24 py-10 md:py-16 max-w-6xl mx-auto">
        <Link
          href="/admin"
          className="inline-block font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-500 hover:text-white transition-colors mb-3"
        >
          ← Back to admin
        </Link>
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-red-400">
          {error}
        </p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="px-6 md:px-12 lg:px-24 py-10 md:py-16 max-w-6xl mx-auto">
        <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-500">
          Loading…
        </p>
      </main>
    );
  }

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
          /insights/{item.slug}
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
          video: item.video,
          audio: item.audio,
          body: item.body,
        }}
      />
    </main>
  );
}
