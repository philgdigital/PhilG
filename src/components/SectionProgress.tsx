"use client";

import { useEffect, useState } from "react";

/**
 * Sticky section progress nav.
 *
 * Right-side fixed column of 10 dots, one per major homepage section.
 * Tracks the visitor's scroll position via IntersectionObserver and
 * lights up the active section. Click any dot to smooth-scroll to that
 * section. The active section's label appears next to its dot.
 *
 * Editorial pattern borrowed from EPAM / Linear / IDEO Journal / Stripe
 * Press: gives the long page a tangible spine and lets a returning
 * visitor jump straight to the section they care about.
 *
 * Hidden on:
 *   - mobile (< md): the dots are too small to be useful at thumb scale
 *   - while still in the hero (first viewport): floats over Hero
 *     unnecessarily; only fades in after the user has started reading
 *   - prefers-reduced-motion: works the same, but no entrance fade
 */

const SECTIONS: { id: string; num: string; label: string }[] = [
  { id: "clients", num: "01", label: "Trusted By" },
  { id: "about", num: "02", label: "The Architect" },
  { id: "advantage", num: "03", label: "The Enterprise Advantage" },
  { id: "impact", num: "04", label: "Impact" },
  { id: "work", num: "05", label: "Selected Work" },
  { id: "insights", num: "06", label: "Insights" },
  { id: "testimonials", num: "07", label: "Client Voice" },
  { id: "expertise", num: "08", label: "Capabilities" },
  { id: "ai-lab", num: "09", label: "The AI Lab" },
  { id: "contact", num: "10", label: "Initiate" },
];

export function SectionProgress() {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Visible only after user scrolls past the hero (first viewport).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Pick the section whose top-edge crossed the upper third of the
    // viewport most recently. rootMargin biases the observation zone
    // upward so the active dot tracks "what you're reading" not "what's
    // exactly centered".
    const observer = new IntersectionObserver(
      (entries) => {
        // Filter to currently intersecting entries; pick the one whose
        // top is closest to the rootMargin top boundary.
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        // Of the intersecting sections, choose the one whose top is
        // smallest (i.e. closest to the top of the viewport but still
        // within the active band).
        const sorted = intersecting.sort(
          (a, b) =>
            Math.abs(a.boundingClientRect.top) -
            Math.abs(b.boundingClientRect.top),
        );
        setActiveId(sorted[0].target.id);
      },
      {
        // Active band: from 35% from top of viewport down to 65%.
        // A section that has any pixel inside this band is "current".
        rootMargin: "-35% 0px -65% 0px",
        threshold: 0,
      },
    );

    SECTIONS.forEach(({ id }) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Show after the visitor has scrolled at least one viewport height.
    // Hides again if they scroll back to top.
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Section progress"
      className={`hidden md:flex fixed right-6 lg:right-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 transition-opacity duration-700 ease-[var(--ease-out)] ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {SECTIONS.map((s) => {
        const isActive = activeId === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            data-magnetic="true"
            aria-label={`${s.num} · ${s.label}`}
            aria-current={isActive ? "true" : undefined}
            className="group flex items-center justify-end gap-3 hover-target"
          >
            {/* Label: visible only on hover (always visible for active) */}
            <span
              className={`font-mono text-[10px] tracking-[0.22em] uppercase whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? "opacity-100 text-white"
                  : "opacity-0 group-hover:opacity-100 text-zinc-400"
              }`}
            >
              <span className="text-zinc-600 mr-2">{s.num}</span>
              {s.label}
            </span>

            {/* Dot */}
            <span
              aria-hidden
              className={`shrink-0 rounded-full transition-all duration-300 ease-[var(--ease-out)] ${
                isActive
                  ? "w-2.5 h-2.5 bg-[#0f62fe] shadow-[0_0_12px_rgba(15,98,254,0.8)]"
                  : "w-1.5 h-1.5 bg-white/30 group-hover:bg-white/70"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
