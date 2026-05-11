"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionProgress } from "@/components/SectionProgress";
import { useFormContext } from "@/lib/form-context";
import { Hero } from "@/components/sections/Hero";
import { Clients } from "@/components/sections/Clients";
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

/**
 * Homepage section order (conversion arc):
 *   01  Clients (Trusted By)              proof
 *   --  Aphorism 1 (Shipped is truth)     editorial pause
 *   02  About (The Architect)             who
 *   03  Advantage (Enterprise Advantage)  promise
 *   --  PullQuote interlude               testimonial
 *   04  ImpactMetrics                     numbers
 *   05  Work                              case studies
 *   06  Testimonials (Client Voice)       social proof
 *   07  Expertise (Capabilities)          breadth
 *   08  AILab                             AI focus
 *   --  Aphorism 2 (Outcomes not optics)  editorial pause
 *   09  Process (How I Work)              engagement model
 *   10  FAQ (Common Questions)            objection handling
 *   11  Anti-Pattern (Things I don't do)  negative positioning
 *   12  Insights                          thought leadership
 *   13  Footer (Initiate)                 CTA
 *
 * Two Aphorism interstitials added in round 8 (end.game-style Phil-
 * authored aphorisms, NOT testimonials; those rotate in PullQuote).
 * Anti-Pattern section added between FAQ and Insights to name what
 * Phil won't do (frees the buyer from agency overhead fears).
 *
 * Alternating sections receive `data-tonal="lift"` so section boundaries
 * are felt rather than seen. See globals.css `[data-tonal="lift"]`.
 * The lift is applied to: Clients, Advantage, ImpactMetrics, Testimonials.
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
        <div data-tonal="lift">
          <Clients />
        </div>
        <Aphorism lines={["Shipped is truth.", "Figma is opinion."]} />
        <About />
        <div data-tonal="lift">
          <Advantage />
        </div>
        <PullQuote />
        <div data-tonal="lift">
          <ImpactMetrics />
        </div>
        <Work />
        <div data-tonal="lift">
          <Testimonials />
        </div>
        <Expertise />
        <AILab />
        <Aphorism lines={["Outcomes, not optics.", "Decks don't ship."]} />
        <div data-tonal="lift">
          <Process onOpenForm={openForm} />
        </div>
        <FAQ onOpenForm={openForm} />
        <div data-tonal="lift">
          <AntiPattern />
        </div>
        <Insights />
      </main>
      <Footer onOpenForm={openForm} />
    </>
  );
}
