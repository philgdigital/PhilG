"use client";

import Link from "next/link";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { InsightEditor } from "@/components/admin/InsightEditor";

export default function NewInsightPage() {
  return (
    <AdminAuthGate>
      <main className="px-6 md:px-12 lg:px-24 py-10 md:py-16 max-w-6xl mx-auto">
        <header className="mb-10">
          <Link
            href="/admin"
            className="inline-block font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-500 hover:text-white transition-colors mb-3"
          >
            ← Back to admin
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            New insight
          </h1>
        </header>
        <InsightEditor mode="new" />
      </main>
    </AdminAuthGate>
  );
}
