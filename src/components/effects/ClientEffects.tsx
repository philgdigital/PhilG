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

// InitialLoader is NOT in this list any more. It is imported directly
// in layout.tsx so its markup ships in the initial server-rendered
// HTML and is painted on the very first frame. Without that the
// visitor briefly saw the page content before the loader hydrated.

export function ClientEffects() {
  return (
    <>
      <CursorTrail />
      <CustomCursor />
      <ScrollBlur />
    </>
  );
}
