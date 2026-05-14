"use client";

import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/admin/client-auth";

/**
 * Sign-out is purely client-side: drop the bearer token from
 * localStorage, then bounce to /admin/login. No server round-trip
 * needed.
 */
export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        clearToken();
        router.replace("/admin/login");
      }}
      className="rounded-full border border-white/10 hover:border-white/25 px-4 py-2.5 font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-400 hover:text-white transition-colors"
    >
      Sign out
    </button>
  );
}
