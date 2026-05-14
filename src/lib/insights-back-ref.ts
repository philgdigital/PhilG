/**
 * Referrer tracking for the "All insights" back-link on insight
 * detail pages.
 *
 * Why this exists: when a visitor navigates to /insights/[slug], we
 * want the back-link in the page header to point to wherever they
 * came from inside the site —
 *
 *   - From the homepage Insights section (/#insights)
 *       → back goes to /#insights
 *   - From the /insights archive root (any filter combo + page)
 *       → back goes to /insights[?same-filters][&page=N]
 *   - From /insights/page/N (a paginated unfiltered view)
 *       → back goes to /insights/page/N
 *   - From elsewhere or a direct landing (search result, share
 *     link, etc.)
 *       → back falls back to /insights (the full archive)
 *
 * Implementation: every insights-card click writes the current
 * `pathname + search` to sessionStorage just before the navigation
 * starts. The detail page reads it on hydration and uses it to
 * render the back link. sessionStorage is scoped to the browser
 * tab so different tabs don't trample each other.
 *
 * Why not document.referrer? It works for direct external referrals
 * but is unreliable across same-origin SPA navigations (especially
 * with View Transitions API in the middle). Storing the ref
 * explicitly at click time is the deterministic version.
 *
 * Why not a URL query param like ?from=... ? It pollutes the
 * canonical URL of the detail page, can leak filters into share
 * links, and ages badly if the back URL itself contains a query.
 */

const KEY = "philg:insightsBack";

/** What we render in the back-link UI. */
export type InsightsBackRef = {
  /** The href to navigate to when the back link is clicked. */
  href: string;
  /** The visible label, e.g. "All insights" or "Back to home". */
  label: string;
};

/**
 * Sentinel string for "the visitor came from the homepage". Pinning
 * it to a constant rather than the bare "/" path keeps the read side
 * unambiguous when the home anchor is `/#insights`.
 */
export const HOME_REF = "HOME";

export function setInsightsBackRef(value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, value);
  } catch {
    // sessionStorage can throw if the tab is in private mode in some
    // older browsers, or the quota is exceeded. Failures here just
    // mean the back link falls back to the default — never fatal.
  }
}

/**
 * Read the stored referrer and interpret it into a {href, label}
 * pair. Returns the default ("All insights" → /insights) when no
 * referrer is stored (direct landing, cleared session, etc.).
 */
export function readInsightsBackRef(): InsightsBackRef {
  if (typeof window === "undefined") {
    // SSR pass — render the safe default. The client-side hydration
    // will swap to the correct ref on mount.
    return { href: "/insights", label: "All insights" };
  }
  let stored: string | null = null;
  try {
    stored = window.sessionStorage.getItem(KEY);
  } catch {
    stored = null;
  }
  if (!stored) {
    return { href: "/insights", label: "All insights" };
  }
  if (stored === HOME_REF) {
    return { href: "/#insights", label: "Back to home" };
  }
  // Any other value is treated as a same-origin path (with optional
  // search string). Defensive: ensure it starts with "/".
  if (stored.startsWith("/")) {
    return { href: stored, label: "All insights" };
  }
  return { href: "/insights", label: "All insights" };
}
