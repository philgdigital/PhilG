import { NextResponse, type NextRequest } from "next/server";
import { getAdminPassword } from "@/lib/admin/auth";
import crypto from "node:crypto";

/**
 * POST /api/admin/login
 *
 * Body: { password: string }
 *
 * On success returns { token: string } — the client stores it in
 * localStorage and sends it back as `Authorization: Bearer <token>`
 * on every subsequent admin API call. The token IS the password
 * (matches the reference project's pattern).
 *
 * 503 when ADMIN_PASSWORD isn't configured — the admin can never
 * be reached without explicit setup.
 * 401 on wrong password.
 */

function timingSafeEquals(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  const maxLen = Math.max(aBuf.length, bBuf.length);
  const aPad = Buffer.alloc(maxLen);
  const bPad = Buffer.alloc(maxLen);
  aBuf.copy(aPad);
  bBuf.copy(bPad);
  return crypto.timingSafeEqual(aPad, bPad) && aBuf.length === bBuf.length;
}

export async function POST(req: NextRequest) {
  const expected = getAdminPassword();
  if (!expected) {
    return NextResponse.json(
      {
        error:
          "ADMIN_PASSWORD env var not set. Configure it on Vercel or in .env.local.",
      },
      { status: 503 },
    );
  }
  let body: unknown;
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
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  // Token IS the password (matches reference). Simple, deliberate.
  return NextResponse.json({ token: expected });
}
