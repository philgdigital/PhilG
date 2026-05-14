import "server-only";
import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Bearer-token auth helper, matching the reference project's
 * pattern (`api.js` in Codex/.../i-need-to-create-a-simple).
 *
 * Login posts the password → server compares against ADMIN_PASSWORD
 * with timing-safe compare → on success returns the password as the
 * token. The client stores the token in localStorage and sends it
 * back in `Authorization: Bearer <token>` on every admin API call.
 *
 * Every protected API route calls `requireAuth(req)` as its first
 * line — it returns a NextResponse with 401 when the token is
 * missing or wrong, otherwise null (caller proceeds).
 *
 * Because the token IS the password, a leaked token leaks the
 * password. That's fine for this single-author admin use case;
 * mitigation is to pick a strong ADMIN_PASSWORD.
 */

export function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

function timingSafeEquals(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  const maxLen = Math.max(aBuf.length, bBuf.length);
  const aPad = Buffer.alloc(maxLen);
  const bPad = Buffer.alloc(maxLen);
  aBuf.copy(aPad);
  bBuf.copy(bPad);
  return (
    crypto.timingSafeEqual(aPad, bPad) && aBuf.length === bBuf.length
  );
}

/**
 * Extract the bearer token from the Authorization header.
 * Returns the empty string when missing.
 */
export function bearerToken(req: NextRequest): string {
  const header = req.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

/**
 * Returns null when authorized; returns a NextResponse with 401
 * (or 503 when ADMIN_PASSWORD isn't configured) otherwise.
 *
 * Inline this check at the top of every protected route handler.
 */
export function requireAuth(req: NextRequest): NextResponse | null {
  const expected = getAdminPassword();
  if (!expected) {
    return NextResponse.json(
      {
        error:
          "ADMIN_PASSWORD env var not set. Configure it on Vercel (Settings → Environment Variables) or in .env.local for dev.",
      },
      { status: 503 },
    );
  }
  const provided = bearerToken(req);
  if (!provided || !timingSafeEquals(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
