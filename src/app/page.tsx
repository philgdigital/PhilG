"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProjectFormModal } from "@/components/ProjectFormModal";
import { SectionProgress } from "@/components/SectionProgress";
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

/**
 * Homepage section order (conversion arc):
 *   01  Clients (Trusted By)              proof
 *   02  About (The Architect)             who
 *   03  Advantage (Enterprise Advantage)  promise
 *   --  PullQuote interlude               validation
 *   04  ImpactMetrics                     numbers
 *   05  Work                              case studies
 *   06  Testimonials (Client Voice)       social proof
 *   07  Expertise (Capabilities)          breadth
 *   08  AILab                             AI focus
 *   09  Process (How I Work)              engagement model
 *   10  FAQ (Common Questions)            objection handling
 *   11  Insights                          thought leadership (last; voice + parting gift)
 *   12  Footer (Initiate)                 CTA
 *
 * Insights moved to position 11 in round 6: works as the parting moment
 * before the contact CTA. Visitor leaves with Phil's voice (writings)
 * top-of-mind instead of mid-page.
 *
 * Alternating sections receive `data-tonal="lift"` so section boundaries
 * are felt rather than seen. See globals.css `[data-tonal="lift"]`.
 * The lift is applied to: Clients, Advantage, ImpactMetrics, Testimonials.
 */
export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <Navbar />
      <SectionProgress />
      <main>
        <Hero />
        <div data-tonal="lift">
          <Clients />
        </div>
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
        <Process />
        <FAQ />
        <Insights />
      </main>
      <Footer onOpenForm={() => setIsFormOpen(true)} />
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
}
