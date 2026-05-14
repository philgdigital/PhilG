import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";

/**
 * POST /api/admin/login
 *
 * Body: { password: string }
 *
 * Compares the provided password against ADMIN_PASSWORD env var
 * using a timing-safe comparison. On success, sets the
 * philg_admin=ok httpOnly cookie that the middleware checks on
 * subsequent /admin/* and /api/admin/* requests.
 *
 * The env var must be set in .env.local. If it isn't set, ALL
 * login attempts return 503 so the admin can never be accessed
 * without an explicit password configured.
 */

const COOKIE_NAME = "philg_admin";
const COOKIE_VALUE = "ok";
// 12-hour session — generous for local dev so we're not constantly
// re-logging in across editor sessions.
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;

function timingSafeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  // Buffers must have equal length for timingSafeEqual; pad the
  // shorter one to neutralize the length-leak.
  const maxLen = Math.max(ab.length, bb.length);
  const padA = Buffer.alloc(maxLen);
  const padB = Buffer.alloc(maxLen);
  ab.copy(padA);
  bb.copy(padB);
  return crypto.timingSafeEqual(padA, padB) && ab.length === bb.length;
}

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      {
        error:
          "ADMIN_PASSWORD env var is not set. Add it to .env.local and restart `npm run dev`.",
      },
      { status: 503 },
    );
  }

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const provided =
    typeof body === "object" && body !== null && "password" in body
      ? String((body as { password: unknown }).password ?? "")
      : "";

  if (!timingSafeEquals(provided, expected)) {
    // Generic error — don't leak whether the password was empty
    // vs wrong-length vs wrong-content.
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "strict",
    secure: false, // local dev only — https unavailable on localhost
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return res;
}
