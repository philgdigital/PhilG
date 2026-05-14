"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/admin/client-auth";

/**
 * Single-password admin login. POSTs to /api/admin/login; on
 * success stores the returned token in localStorage and redirects
 * to /admin.
 */

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.token) {
        setError(body?.error ?? `Login failed (${res.status})`);
        setSubmitting(false);
        return;
      }
      setToken(body.token);
      router.replace("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm flex flex-col gap-5 p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur"
      >
        <div className="flex items-baseline gap-1.5">
          <span className="font-sans font-black text-2xl tracking-[-0.03em] text-white">
            Phil G
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.8)]" />
          <span className="ml-3 font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-500">
            Admin
          </span>
        </div>
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-400">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            className="bg-white/[0.04] focus:bg-white/[0.08] border border-white/10 focus:border-[#0f62fe]/60 rounded-full px-5 py-3 text-base font-light text-white outline-none transition-colors"
          />
        </label>
        {error && (
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting || !password}
          className="rounded-full bg-[#0f62fe] hover:bg-[#4589ff] disabled:bg-white/10 disabled:text-zinc-500 px-5 py-3 font-mono text-[11px] tracking-[0.32em] uppercase text-white transition-colors"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
