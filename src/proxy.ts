import { NextResponse, type NextRequest } from "next/server";

/**
 * Admin middleware. Two jobs:
 *
 * 1. PRODUCTION GATE — the /admin UI + /api/admin/* routes are
 *    LOCAL-ONLY by design. The filesystem on Vercel is read-only
 *    at runtime, so a deployed admin couldn't write MDX files
 *    anyway. We hard-block these paths in any non-development
 *    environment with a 404, hiding the surface from the public
 *    web entirely.
 *
 * 2. AUTH — for the local dev environment, every /admin/* request
 *    (except the login page) and every /api/admin/* request
 *    (except /api/admin/login itself) requires the
 *    `philg_admin=ok` httpOnly cookie that's set by a successful
 *    POST to /api/admin/login. Missing/invalid cookie redirects
 *    to /admin/login (for page navigations) or returns 401 (for
 *    API calls).
 *
 * The cookie is a static sentinel value rather than a JWT or
 * session token because the threat model is "Phil on his own
 * laptop". A leaked cookie wouldn't matter — production blocks
 * the route entirely.
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

  // PRODUCTION GATE. NODE_ENV is set by Next.js itself; on Vercel
  // production builds this is "production". Local `npm run dev` is
  // "development". Local `npm start` after a `npm run build` is
  // "production" too — that's intentional. Admin only works in dev.
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
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
