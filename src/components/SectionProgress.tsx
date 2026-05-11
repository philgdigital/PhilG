"use client";

import { useEffect, useState } from "react";
import { projects } from "@/lib/projects";
import { ArrowUp } from "@/components/icons/Icons";

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
  // Round 12: standalone Clients (Trusted By) removed; brand logos
  // now live inside the Hero. Every remaining section shifts up by
  // one number. Section IDs unchanged so deep links keep working.
  { id: "about", num: "01", label: "The Architect" },
  { id: "advantage", num: "02", label: "The Enterprise Advantage" },
  { id: "impact", num: "03", label: "Impact" },
  { id: "expertise", num: "04", label: "Capabilities" },
  { id: "testimonials", num: "05", label: "Client Voice" },
  {
    id: "work",
    num: "06",
    label: "Selected Work",
    subItems: projects.map((p) => ({
      id: `work-${p.slug}`,
      label: p.title,
    })),
  },
  { id: "ai-lab", num: "07", label: "The AI Lab" },
  { id: "process", num: "08", label: "How I Work" },
  { id: "faq", num: "09", label: "Common Questions" },
  { id: "anti-pattern", num: "10", label: "Anti-Pattern" },
  { id: "insights", num: "11", label: "Insights" },
  { id: "contact", num: "12", label: "Initiate" },
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
          blurred extent reaches past the items without cutting off.
          Bumped the dark ramp so labels stay legible on bright sections
          (Hero gradient, Work cards) without losing the diffuse feel. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-y-24 -left-24 -right-12 -z-10 bg-gradient-to-l from-black/80 via-black/50 to-transparent blur-3xl"
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
              {/* Label gets its own pill backdrop (backdrop-blur-md +
                  bg-black/45) so the mono text stays readable on
                  whatever page section sits underneath. The pill is
                  always rendered but is invisible until the label is
                  active or hovered (opacity gates both the text and
                  the backdrop together). */}
              <span
                className={`font-mono text-[10px] tracking-[0.22em] uppercase whitespace-nowrap backdrop-blur-md rounded-full px-3 py-1 transition-all duration-500 ease-[var(--ease-out)] ${
                  isActive
                    ? "opacity-100 text-white translate-x-0 bg-black/45 ring-1 ring-white/10"
                    : "opacity-0 -translate-x-2 text-zinc-200 bg-black/40 group-hover:opacity-100 group-hover:translate-x-0 group-hover:ring-1 group-hover:ring-white/10"
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
                      {/* Sub-item label: same pill-backdrop treatment as
                          the top-level labels, slightly smaller padding so
                          the indented sub-list reads as a child of the
                          parent. backdrop-blur-md keeps the label readable
                          even when the active Work project's image fills
                          the sticky horizontal track underneath. */}
                      <span
                        className={`font-mono text-[10px] tracking-[0.18em] uppercase whitespace-nowrap backdrop-blur-md rounded-full px-2.5 py-1 bg-black/40 ring-1 ring-white/5 transition-all duration-500 ease-[var(--ease-out)] ${
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

      {/* Scroll-to-top control, perfectly center-aligned with the
          dot column.

          Geometry: the dots in each section row are right-aligned
          inside the nav, with the active dot 10px wide (w-2.5) and
          the inactive dots 6px wide (w-1.5). The "dot column center"
          we want to align with is the vertical axis running through
          the dots' geometric centers, which for the dominant inactive
          state sits ~3px to the left of the nav's right edge.

          Implementation:
            - Outer wrapper is self-end (aligns to nav right) and
              w-1.5 (6px wide), matching the inactive dot diameter.
            - The button is absolutely positioned with
              left-1/2 -translate-x-1/2 inside the 6px wrapper, so
              the BUTTON CENTER lines up exactly on the wrapper
              center (= the dot column center).
            - This puts the arrow's middle precisely on the same
              vertical line the inactive dots sit on, with the active
              dot being only 2px off (negligible visual).
            - On hover: floating-fluid -translate-x-1.5 pull (same
              as section links), border + arrow shift to IBM blue. */}
      <div
        className="relative self-end mt-4 h-7"
        style={{ width: "6px" }}
      >
        <button
          type="button"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
          data-magnetic="true"
          data-cursor-no-hint="true"
          aria-label="Back to top"
          className="group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full border border-white/20 hover-target transition-all duration-500 ease-[var(--ease-out)] hover:border-[#0f62fe] hover:shadow-[0_0_14px_rgba(15,98,254,0.55)] hover:[transform:translate(calc(-50%-6px),-50%)] will-change-transform"
        >
          <ArrowUp className="w-3.5 h-3.5 text-zinc-400 transition-all duration-500 ease-[var(--ease-out)] group-hover:text-[#4589ff] group-hover:-translate-y-px" />
        </button>
      </div>
    </nav>
  );
}
