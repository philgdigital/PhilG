"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionProgress } from "@/components/SectionProgress";
import { useFormContext } from "@/lib/form-context";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Advantage } from "@/components/sections/Advantage";
import { PullQuote } from "@/components/sections/PullQuote";
import { ImpactMetrics } from "@/components/sections/ImpactMetrics";
import { Work } from "@/components/sections/Work";
import { Insights } from "@/components/sections/Insights";
import { Testimonials } from "@/components/sections/Testimonials";
import { Expertise } from "@/components/sections/Expertise";
import { AILab } from "@/components/sections/AILab";
import { Process } from "@/components/sections/Process";
import { FAQ } from "@/components/sections/FAQ";
import { Aphorism } from "@/components/sections/Aphorism";
import { AntiPattern } from "@/components/sections/AntiPattern";
import { VelocityGap } from "@/components/sections/VelocityGap";

/**
 * Homepage section order (conversion arc):
 *   --  Hero (with embedded trust row of brand wordmarks)
 *   --  VelocityGap (THE SHIPPING GAP IS WIDENING + 8 tools)
 *   --  Aphorism 1 (Shipped is truth)
 *   01  About (The Architect)
 *   02  Advantage (Enterprise Advantage)
 *   --  PullQuote interlude
 *   03  ImpactMetrics
 *   04  Expertise (Capabilities)
 *   05  Testimonials (Client Voice)
 *   06  Work (Selected Work)
 *   07  AILab
 *   --  Aphorism 2 (Outcomes not optics)
 *   08  Process (How I Work)
 *   09  FAQ (Common Questions)
 *   10  Anti-Pattern (Things I don't do)
 *   11  Insights
 *   12  Footer (Initiate)
 *
 * Round 12: the standalone "01 Trusted By" Clients section was
 * removed. The 13 brand wordmarks now live as a compact trust row
 * INSIDE the Hero, right below the CTA. About is now 01, every
 * later section shifts up one.
 *
 * Section IDs (#work, #testimonials, #expertise) stay unchanged so
 * existing deep links + the Navbar #work anchor still resolve.
 *
 * Alternating sections receive `data-tonal="lift"` so section boundaries
 * are felt rather than seen. See globals.css `[data-tonal="lift"]`.
 */
export default function Home() {
  // openForm comes from the global FormProvider mounted in layout.tsx.
  // The modal itself is mounted inside that provider, so all routes
  // (homepage, work case studies, insight articles) share the same form.
  const { openForm } = useFormContext();

  return (
    <>
      {/* Skip-to-content link. Visible only when keyboard-focused (otherwise
          translated off-screen). Lets screen-reader and keyboard users jump
          past the navbar + section-progress to the start of the page. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[400] focus:bg-white focus:text-black focus:font-mono focus:font-medium focus:tracking-[0.18em] focus:uppercase focus:text-xs focus:px-4 focus:py-3 focus:rounded-full focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Navbar />
      <SectionProgress />
      <main id="main-content">
        <Hero />
        {/* Velocity Gap interlude: punchy "THE SHIPPING GAP IS WIDENING"
            block + 8-tool stack row. Sits between Hero and the first
            numbered section. */}
        <VelocityGap />
        <Aphorism lines={["Shipped is truth.", "Figma is opinion."]} />
        <div data-tonal="lift">
          <About />
        </div>
        <div data-tonal="lift">
          <Advantage />
        </div>
        <PullQuote />
        <div data-tonal="lift">
          <ImpactMetrics />
        </div>
        <Expertise />
        <div data-tonal="lift">
          <Testimonials />
        </div>
        <Work />
        <AILab />
        <Aphorism lines={["Outcomes, not optics.", "Decks don't ship."]} />
        <div data-tonal="lift">
          <Process onOpenForm={openForm} />
        </div>
        <div data-tonal="lift">
          <FAQ onOpenForm={openForm} />
        </div>
        <div data-tonal="lift">
          <AntiPattern />
        </div>
        <Insights />
      </main>
      <Footer onOpenForm={openForm} />
    </>
  );
}
