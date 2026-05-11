"use client";

import dynamic from "next/dynamic";

// Heavy interactive effects: load on the client only.
// All depend on `window` and shouldn't block initial paint.
const CustomCursor = dynamic(
  () => import("./CustomCursor").then((m) => m.CustomCursor),
  { ssr: false },
);

const CursorTrail = dynamic(
  () => import("./CursorTrail").then((m) => m.CursorTrail),
  { ssr: false },
);

const ScrollBlur = dynamic(
  () => import("./ScrollBlur").then((m) => m.ScrollBlur),
  { ssr: false },
);

// Initial loader is also client-only (needs window.load + body scroll
// lock). Loading it via next/dynamic means it doesn't ship in the
// initial server HTML; we instead render an inline SSR overlay in
// layout.tsx so the visitor sees the Carbon-Black canvas IMMEDIATELY
// on first paint, and this client component just handles the fade-out
// + scroll lock + removal.
const InitialLoader = dynamic(
  () => import("./InitialLoader").then((m) => m.InitialLoader),
  { ssr: false },
);

export function ClientEffects() {
  return (
    <>
      <InitialLoader />
      <CursorTrail />
      <CustomCursor />
      <ScrollBlur />
    </>
  );
}
