"use client";

import { useEffect } from "react";

/**
 * Tags <html> with data-scrolling="true" while the visitor is actively
 * scrolling, clears it after the scroll stops. globals.css uses this
 * to apply a subtle 1.2px blur to <main> during scroll, softening
 * edges + reducing the visual strain of fast scrolling. The blur
 * snaps off as soon as the page settles so reading stays crisp.
 *
 * No animation loop, no JS work per frame. Just a debounced flag.
 * Respects prefers-reduced-motion: skips entirely so visitors who
 * prefer no motion get crisp content always.
 */
export function ScrollBlur() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let idleTimer = 0;
    const root = document.documentElement;

    const onScroll = () => {
      if (root.dataset.scrolling !== "true") {
        root.dataset.scrolling = "true";
      }
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        delete root.dataset.scrolling;
      }, 140);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idleTimer);
      delete root.dataset.scrolling;
    };
  }, []);

  return null;
}
