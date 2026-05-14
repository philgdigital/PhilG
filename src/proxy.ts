import { NextResponse, type NextRequest } from "next/server";

/**
 * Admin proxy. Gates /admin/* and /api/admin/* on the
 * philg_admin=ok cookie (set by POST /api/admin/login after a
 * successful password check).
 *
 * The admin works in BOTH local dev and production:
 *   - DEV: MDX writes go to the local filesystem under
 *     /content/insights and /public/audio.
 *   - PRODUCTION: MDX writes commit through the GitHub API to the
 *     philgdigital/PhilG repo. Audio uploads land in Vercel Blob.
 *     Vercel auto-rebuilds on the commit, so saved posts go live
 *     within ~60 s.
 *
 * Threat model: a leaked cookie can't reveal anything sensitive
 * (the cookie value is a static sentinel), but it COULD let an
 * attacker push commits via the GitHub token. Mitigations:
 *   - Strong ADMIN_PASSWORD env var.
 *   - HttpOnly + sameSite=strict cookie.
 *   - 12 h session expiry.
 *   - Production deployments should set ADMIN_PASSWORD to a long
 *     random string and rotate periodically.
 */

const ADMIN_PATH = "/admin";
const ADMIN_API = "/api/admin";
const LOGIN_PATH = "/admin/login";
const LOGIN_API = "/api/admin/login";
const COOKIE_NAME = "philg_admin";
const COOKIE_VALUE = "ok";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminUi = pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
  const isAdminApi = pathname.startsWith(`${ADMIN_API}/`) || pathname === ADMIN_API;
  if (!isAdminUi && !isAdminApi) {
    return NextResponse.next();
  }

  // AUTH. Skip the auth check for the login page + login API
  // themselves — otherwise the visitor could never log in.
  const isLoginPage = pathname === LOGIN_PATH;
  const isLoginApi = pathname === LOGIN_API;
  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE_NAME);
  if (cookie?.value === COOKIE_VALUE) {
    return NextResponse.next();
  }

  // Unauthorized
  if (isAdminApi) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  // UI: redirect to login, preserving the original path so the
  // login form can bounce back after success.
  const url = req.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Run the middleware on /admin/* and /api/admin/* only.
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
