"use client";

import dynamic from "next/dynamic";

// Heavy interactive effects: load on the client only.
// Both depend on `window` and shouldn't block initial paint.
const CustomCursor = dynamic(
  () => import("./CustomCursor").then((m) => m.CustomCursor),
  { ssr: false },
);

const NeuralCanvas3D = dynamic(
  () => import("./NeuralCanvas3D").then((m) => m.NeuralCanvas3D),
  { ssr: false },
);

export function ClientEffects() {
  return (
    <>
      <NeuralCanvas3D />
      <CustomCursor />
    </>
  );
}
