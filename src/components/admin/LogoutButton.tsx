"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Tiny client-component logout pill. POSTs to /api/admin/logout
 * (clears the cookie) then bounces to /admin/login.
 */
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await fetch("/api/admin/logout", { method: "POST" });
        } finally {
          router.replace("/admin/login");
        }
      }}
      className="rounded-full border border-white/10 hover:border-white/25 px-4 py-2.5 font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-400 hover:text-white transition-colors"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
