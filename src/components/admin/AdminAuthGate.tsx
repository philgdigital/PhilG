"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { getToken } from "@/lib/admin/client-auth";

/**
 * Client-side auth gate for /admin/* pages.
 *
 * Subscribes to localStorage via useSyncExternalStore so the
 * presence/absence of the admin token is the rendering source of
 * truth. When the token is missing, the user is bounced to
 * /admin/login. While the gate is determining state on the very
 * first paint, children render a brief "loading" shell rather than
 * the admin chrome (no flash of unauthorized UI).
 *
 * Stays out of /admin/login itself — see Layout: only the gated
 * routes wrap their content in this component.
 */

const subscribe = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // null = "uninitialized" (SSR / first paint), "" = no token, otherwise the token
  const token = useSyncExternalStore(
    subscribe,
    () => getToken() || null,
    () => null,
  );

  useEffect(() => {
    if (token === null) return; // initial paint, wait for hydration
    if (!token) router.replace("/admin/login");
  }, [token, router]);

  // SSR / first-render: render a minimal shell so the page doesn't
  // flash the admin chrome before redirecting.
  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center text-zinc-500 font-mono text-[10px] tracking-[0.32em] uppercase">
        Loading…
      </main>
    );
  }
  return <>{children}</>;
}
