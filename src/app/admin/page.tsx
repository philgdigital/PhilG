"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { adminFetch } from "@/lib/admin/client-auth";
import type { Insight } from "@/lib/insights/schema";

/**
 * Admin dashboard — lists every insight in a table with edit
 * links. Client component: fetches via /api/admin/insights with
 * the bearer token from localStorage.
 */

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDashboardPage() {
  return (
    <AdminAuthGate>
      <AdminDashboard />
    </AdminAuthGate>
  );
}

function AdminDashboard() {
  const [items, setItems] = useState<Insight[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminFetch("/api/admin/insights");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (!cancelled) setError(body?.error ?? `Load failed (${res.status})`);
          return;
        }
        const body = await res.json();
        if (!cancelled) setItems((body.items ?? []) as Insight[]);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="px-6 md:px-12 lg:px-24 py-10 md:py-16 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-10 md:mb-14">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-sans font-black text-xl tracking-[-0.03em] text-white">
              Phil G
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0f62fe] shadow-[0_0_6px_rgba(15,98,254,0.8)]" />
            <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-500">
              Admin
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Insights
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/insights/new"
            className="rounded-full bg-[#0f62fe] hover:bg-[#4589ff] px-5 py-2.5 font-mono text-[11px] tracking-[0.22em] uppercase text-white transition-colors"
          >
            + New insight
          </Link>
          <LogoutButton />
        </div>
      </header>

      {error && (
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-red-400 mb-6">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/8">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02]">
            <tr className="text-left font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Media</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items === null && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {items !== null && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">
                  No insights yet.{" "}
                  <Link
                    href="/admin/insights/new"
                    className="text-[#4589ff] hover:underline"
                  >
                    Create the first one →
                  </Link>
                </td>
              </tr>
            )}
            {items?.map((item) => (
              <tr
                key={item.slug}
                className="border-t border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400 whitespace-nowrap">
                  {formatDate(item.date)}
                </td>
                <td className="px-5 py-3 text-white">
                  <Link
                    href={`/admin/insights/${item.slug}`}
                    className="hover:text-[#4589ff] transition-colors"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="px-5 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400">
                  {item.category}
                </td>
                <td className="px-5 py-3 text-zinc-400 font-mono text-[10px] tracking-[0.18em] uppercase">
                  {item.video ? "📺" : ""}
                  {item.audio ? "🎙" : ""}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/insights/${item.slug}`}
                    className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#4589ff] hover:text-white transition-colors"
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
