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

/**
 * Safe default reference. Used during SSR and whenever the visitor
 * lands on a detail page without a stored referrer (direct URL,
 * search result, share link, fresh tab).
 *
 * Declared as a module-level constant so the SAME object reference
 * is returned every time the default branch is taken — critical for
 * the useSyncExternalStore contract (see below).
 */
export const SSR_DEFAULT: InsightsBackRef = Object.freeze({
  href: "/insights",
  label: "All insights",
});

const HOME_BACK_REF: InsightsBackRef = Object.freeze({
  href: "/#insights",
  label: "Back to home",
});

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
 * Snapshot cache. The readInsightsBackRef() function is consumed by
 * React's useSyncExternalStore, which uses Object.is to detect "did
 * the value change between renders". If we returned a freshly-built
 * object on every call, even with identical content, Object.is(prev,
 * new) would always be false and React would re-render in an
 * infinite loop (the bug that caused the post-navigation white
 * "page couldn't load" error before this fix).
 *
 * The cache returns the SAME reference until the underlying
 * sessionStorage value actually changes. The key is the raw
 * sessionStorage string (or null); the value is the resolved
 * InsightsBackRef object. `cachedKey === undefined` is the
 * "never read yet" sentinel (distinct from `null`, which means
 * "read and was absent").
 */
let cachedKey: string | null | undefined = undefined;
let cachedSnapshot: InsightsBackRef = SSR_DEFAULT;

function resolveRef(stored: string | null): InsightsBackRef {
  if (!stored) return SSR_DEFAULT;
  if (stored === HOME_REF) return HOME_BACK_REF;
  // Same-origin path (with optional search string). Defensive:
  // ensure it starts with "/".
  if (stored.startsWith("/")) {
    return { href: stored, label: "All insights" };
  }
  return SSR_DEFAULT;
}

/**
 * Read the stored referrer and interpret it into a {href, label}
 * pair. Returns the same object reference across calls until the
 * underlying sessionStorage value changes — stable-snapshot
 * contract required by useSyncExternalStore.
 */
export function readInsightsBackRef(): InsightsBackRef {
  if (typeof window === "undefined") {
    return SSR_DEFAULT;
  }
  let stored: string | null = null;
  try {
    stored = window.sessionStorage.getItem(KEY);
  } catch {
    stored = null;
  }
  if (stored === cachedKey) {
    return cachedSnapshot;
  }
  cachedKey = stored;
  cachedSnapshot = resolveRef(stored);
  return cachedSnapshot;
}
