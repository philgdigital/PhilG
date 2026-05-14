"use client";

/**
 * Client-side bearer-token helpers — mirrors the reference
 * project's pattern.
 *
 * On successful login, the server returns { token }. The client
 * stashes it in localStorage and includes it in every admin API
 * call as `Authorization: Bearer <token>`. Sign-out just clears
 * the token from localStorage; no server round-trip needed.
 *
 * The "/admin" pages are wrapped in <AdminAuthGate /> (see
 * src/components/admin/AdminAuthGate.tsx), which redirects to
 * /admin/login when no token is present.
 */

const STORAGE_KEY = "philg-admin-token";

export function getToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * `fetch` wrapper that attaches the admin bearer token. Resolves
 * to the raw Response; the caller checks .ok and parses JSON.
 *
 * On 401 (token expired or wrong) it clears the token so the
 * AdminAuthGate kicks the user back to /admin/login on the next
 * navigation.
 */
export async function adminFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(url, { ...init, headers });
  if (res.status === 401) clearToken();
  return res;
}
