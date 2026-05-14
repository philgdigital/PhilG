import { NextResponse } from "next/server";

/**
 * POST /api/admin/logout
 *
 * Clears the philg_admin cookie. Middleware will redirect any
 * subsequent /admin/* request back to /admin/login.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("philg_admin", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    path: "/",
    maxAge: 0,
  });
  return res;
}
