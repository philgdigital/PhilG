import type { Insight } from "./schema";
import data from "./data.json";

/**
 * SYNC view of the insights corpus — reads from the build-time
 * data.json snapshot bundled with the deploy. Safe for client
 * components and any context where async reads aren't allowed.
 *
 * The async, live-read variant (getAllInsightsLive /
 * getInsightLive) lives in `loader-server.ts` so the client
 * bundle never pulls in the Blob/fs helpers from
 * `src/lib/admin/store.ts`.
 *
 * The sync view always reflects the LAST DEPLOY. After admin
 * edits on production, only the async server-side variant is
 * current; the sync snapshot catches up on the next deploy.
 */

const SEED = data as unknown as Insight[];

export function getAllInsights(): Insight[] {
  return SEED;
}

export function getInsight(slug: string): Insight | undefined {
  return SEED.find((i) => i.slug === slug);
}

export function getLatestInsights(n: number): Insight[] {
  return SEED.slice(0, n);
}
