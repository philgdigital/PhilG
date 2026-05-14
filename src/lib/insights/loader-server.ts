import "server-only";
import type { Insight } from "./schema";
import { readInsights } from "@/lib/admin/store";

/**
 * Server-only async loader path. Lives in a separate file from
 * loader.ts because the client bundle must never include the
 * Blob / node:fs helpers in store.ts — even via dynamic import,
 * Turbopack traces the imports statically and can pull them into
 * client bundles.
 *
 * Server components on /insights and /insights/[slug] import
 * directly from `@/lib/insights/loader-server` to read the live
 * corpus (Blob in production, data/insights.json in dev). The
 * sync functions in loader.ts continue to serve client
 * components from the build-time seed.
 */

export async function getAllInsightsLive(): Promise<Insight[]> {
  const items = await readInsights();
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getInsightLive(
  slug: string,
): Promise<Insight | undefined> {
  const all = await getAllInsightsLive();
  return all.find((i) => i.slug === slug);
}
