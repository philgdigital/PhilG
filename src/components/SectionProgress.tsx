"use client";

import { useEffect, useState } from "react";
import { projects } from "@/lib/projects";

/**
 * Sticky section progress nav.
 *
 * Right-side fixed column of dots, one per major homepage section.
 * Tracks the visitor's scroll position via IntersectionObserver and
 * lights up the active section. Click any dot to smooth-scroll there.
 *
 * When the active section is "Selected Work" (05), the nav expands a
 * sub-list of the four case-study projects below the dot. Each sub-item
 * tracks its own intersection and highlights as the visitor scrolls
 * through that article. Sub-items collapse again when the visitor
 * leaves the Work section.
 *
 * Editorial pattern borrowed from EPAM / Linear / IDEO Journal / Stripe
 * Press: gives the long page a tangible spine and lets a returning
 * visitor jump straight to the section they care about.
 *
 * Hidden on mobile (< md). Hidden until the visitor has scrolled past
 * the first viewport so it doesn't float over the hero.
 */

type SubItem = { id: string; label: string };
type Section = {
  id: string;
  num: string;
  label: string;
  subItems?: SubItem[];
};

const SECTIONS: Section[] = [
  { id: "clients", num: "01", label: "Trusted By" },
  { id: "about", num: "02", label: "The Architect" },
  { id: "advantage", num: "03", label: "The Enterprise Advantage" },
  { id: "impact", num: "04", label: "Impact" },
  {
    id: "work",
    num: "05",
    label: "Selected Work",
    subItems: projects.map((p) => ({
      id: `work-${p.slug}`,
      label: p.title,
    })),
  },
  { id: "testimonials", num: "06", label: "Client Voice" },
  { id: "expertise", num: "07", label: "Capabilities" },
  { id: "ai-lab", num: "08", label: "The AI Lab" },
  { id: "process", num: "09", label: "How I Work" },
  { id: "faq", num: "10", label: "Common Questions" },
  { id: "anti-pattern", num: "11", label: "Anti-Pattern" },
  { id: "insights", num: "12", label: "Insights" },
  { id: "contact", num: "13", label: "Initiate" },
];

export function SectionProgress() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeWorkSubId, setActiveWorkSubId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Section-level observer. Uses a band 35-65% of the viewport height
    // so the active dot tracks "what the visitor is reading" not "what
    // is exactly centered".
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        const sorted = intersecting.sort(
          (a, b) =>
            Math.abs(a.boundingClientRect.top) -
            Math.abs(b.boundingClientRect.top),
        );
        setActiveId(sorted[0].target.id);
      },
      {
        rootMargin: "-35% 0px -65% 0px",
        threshold: 0,
      },
    );

    SECTIONS.forEach(({ id }) => {
      const node = document.getElementById(id);
      if (node) sectionObserver.observe(node);
    });

    // Sub-article observer for Work case studies. A wider band (20-80%)
    // because each Work article is taller than a viewport and we want
    // the sub-item to track which article is on screen, not just which
    // crossed the precise center.
    const workSubObserver = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        const sorted = intersecting.sort(
          (a, b) =>
            Math.abs(a.boundingClientRect.top) -
            Math.abs(b.boundingClientRect.top),
        );
        setActiveWorkSubId(sorted[0].target.id);
      },
      {
        rootMargin: "-20% 0px -75% 0px",
        threshold: 0,
      },
    );

    const workSection = SECTIONS.find((s) => s.id === "work");
    workSection?.subItems?.forEach(({ id }) => {
      const node = document.getElementById(id);
      if (node) workSubObserver.observe(node);
    });

    return () => {
      sectionObserver.disconnect();
      workSubObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    // rAF-throttled scroll handler. Coalesces multiple scroll events
    // into one state read per animation frame. Prevents React setState
    // from firing 60-120 times per second during fast scrolls.
    let rafId = 0;
    const compute = () => {
      rafId = 0;
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    const onScroll = () => {
      if (rafId !== 0) return;
      rafId = requestAnimationFrame(compute);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <nav
      aria-label="Section progress"
      className={`hidden md:flex fixed right-6 lg:right-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 transition-opacity duration-700 ease-[var(--ease-out)] ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Soft cloud-like scrim. blur-3xl on the element itself feathers
          all edges into nothing so the dark bg reads as a diffuse halo
          around the menu, not a contained box. Generous -inset so the
          blurred extent reaches past the items without cutting off. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-y-24 -left-24 -right-12 -z-10 bg-gradient-to-l from-black/55 via-black/30 to-transparent blur-3xl"
      />

      {SECTIONS.map((s) => {
        const isActive = activeId === s.id;
        const hasSubItems = !!s.subItems?.length;
        const showSubItems = hasSubItems && isActive;
        return (
          <div key={s.id} className="flex flex-col items-end gap-2">
            {/* Floating fluid hover:
                - Whole row pulls LEFT (-translate-x-3) like the cursor is
                  magnetically pulling it forward.
                - Label slides in from -8px → 0 + fades on hover.
                - Dot grows to 2× + glows in IBM blue.
                - data-magnetic="true" lets CustomCursor add the magnetic
                  pull to the cursor ring itself.
                - data-cursor-no-hint suppresses the 'Click for more' pill
                  (the dot + label already signal the link). */}
            <a
              href={`#${s.id}`}
              data-magnetic="true"
              data-cursor-no-hint="true"
              aria-label={`${s.num} · ${s.label}`}
              aria-current={isActive ? "true" : undefined}
              className="group flex items-center justify-end gap-3 hover-target transition-transform duration-500 ease-[var(--ease-out)] hover:-translate-x-3 will-change-transform"
            >
              <span
                className={`font-mono text-[10px] tracking-[0.22em] uppercase whitespace-nowrap transition-all duration-500 ease-[var(--ease-out)] ${
                  isActive
                    ? "opacity-100 text-white translate-x-0"
                    : "opacity-0 -translate-x-2 text-zinc-300 group-hover:opacity-100 group-hover:translate-x-0"
                }`}
              >
                <span className="text-[#4589ff] mr-2">{s.num}</span>
                {s.label}
              </span>
              <span
                aria-hidden
                className={`shrink-0 rounded-full transition-all duration-500 ease-[var(--ease-out)] ${
                  isActive
                    ? "w-2.5 h-2.5 bg-[#0f62fe] shadow-[0_0_14px_rgba(15,98,254,0.9)]"
                    : "w-1.5 h-1.5 bg-white/30 group-hover:bg-[#4589ff] group-hover:scale-[1.8] group-hover:shadow-[0_0_14px_rgba(69,137,255,0.7)]"
                }`}
              />
            </a>

            {/* Sub-items: collapse/expand when entering/leaving Work */}
            {hasSubItems && (
              <div
                className={`flex flex-col items-end gap-2 mr-[5px] pr-3 border-r border-white/10 overflow-hidden transition-all duration-500 ease-[var(--ease-out)] ${
                  showSubItems
                    ? "max-h-72 opacity-100 mt-1"
                    : "max-h-0 opacity-0"
                }`}
              >
                {s.subItems!.map((sub, i) => {
                  const subActive = activeWorkSubId === sub.id;
                  return (
                    <a
                      key={sub.id}
                      href={`#${sub.id}`}
                      data-magnetic="true"
                      data-cursor-no-hint="true"
                      aria-label={sub.label}
                      aria-current={subActive ? "true" : undefined}
                      className="group flex items-center justify-end gap-2.5 hover-target transition-transform duration-500 ease-[var(--ease-out)] hover:-translate-x-2 will-change-transform"
                      style={{
                        transitionDelay: showSubItems
                          ? `${i * 60 + 100}ms`
                          : "0ms",
                      }}
                    >
                      <span
                        className={`font-mono text-[10px] tracking-[0.18em] uppercase whitespace-nowrap transition-all duration-500 ease-[var(--ease-out)] ${
                          subActive
                            ? "opacity-100 text-[#4589ff]"
                            : "opacity-70 group-hover:opacity-100 text-zinc-300"
                        }`}
                      >
                        {sub.label}
                      </span>
                      <span
                        aria-hidden
                        className={`shrink-0 rounded-full transition-all duration-500 ease-[var(--ease-out)] ${
                          subActive
                            ? "w-2 h-2 bg-[#4589ff] shadow-[0_0_10px_rgba(69,137,255,0.8)]"
                            : "w-1 h-1 bg-white/25 group-hover:bg-[#4589ff] group-hover:scale-[1.8] group-hover:shadow-[0_0_10px_rgba(69,137,255,0.6)]"
                        }`}
                      />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
