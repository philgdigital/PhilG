"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns true when the user's primary input is a fine pointer (mouse,
 * trackpad). False on touch devices and when the media query is not
 * supported. SSR-safe (returns false during server render).
 *
 * Use this to gate cursor effects, hover-based interactions, and any
 * UI that doesn't make sense without a hovering pointer.
 */
const QUERY = "(hover: hover) and (pointer: fine)";

const subscribe = (callback: () => void) => {
  if (typeof window === "undefined") return () => undefined;
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
};

const getSnapshot = () =>
  typeof window !== "undefined" && window.matchMedia(QUERY).matches;

const getServerSnapshot = () => false;

export function useFinePointer() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
