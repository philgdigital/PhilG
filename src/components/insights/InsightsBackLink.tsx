"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowUpLeft } from "@/components/icons/Icons";
import {
  readInsightsBackRef,
  type InsightsBackRef,
} from "@/lib/insights-back-ref";

const SSR_DEFAULT: InsightsBackRef = {
  href: "/insights",
  label: "All insights",
};

/**
 * Empty subscribe callback. sessionStorage is read once at mount;
 * we don't subscribe to changes because the back-link only matters
 * at the moment the visitor first lands on the detail page.
 * (If we ever want it to react to storage events from other tabs
 * we can replace this with a real subscriber.)
 */
const subscribe = () => () => {};

/**
 * useSyncExternalStore reads from an external (non-React) data
 * source — here, sessionStorage — without triggering the
 * "setState in useEffect" lint rule that the simpler
 * useEffect+useState pattern hits. It also handles the SSR/CSR
 * snapshot contract cleanly: the server snapshot returns the
 * safe default ("All insights" → /insights), and the client
 * snapshot reads the actual stored referrer on first paint.
 */
function getServerSnapshot(): InsightsBackRef {
  return SSR_DEFAULT;
}

/**
 * Back-link on insight detail pages. Reads the sessionStorage
 * referrer (set by the card the visitor clicked) and renders the
 * appropriate href + label.
 *
 * If a visitor lands on /insights/[slug] directly (search result,
 * share link, fresh tab) the safe default is preserved and they
 * land on the archive when they click back — the right behaviour.
 */
export function InsightsBackLink() {
  const ref = useSyncExternalStore(
    subscribe,
    readInsightsBackRef,
    getServerSnapshot,
  );

  return (
    <Link
      href={ref.href}
      data-magnetic="true"
      className="group inline-flex items-center gap-2 hover-target font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400 hover:text-white transition-colors"
    >
      <ArrowUpLeft className="w-4 h-4 -rotate-45 transition-transform duration-500 group-hover:-translate-x-1" />
      <span>{ref.label}</span>
    </Link>
  );
}
