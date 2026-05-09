"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProjectFormModal } from "@/components/ProjectFormModal";
import { Hero } from "@/components/sections/Hero";
import { Clients } from "@/components/sections/Clients";
import { About } from "@/components/sections/About";
import { Advantage } from "@/components/sections/Advantage";
import { PullQuote } from "@/components/sections/PullQuote";
import { ImpactMetrics } from "@/components/sections/ImpactMetrics";
import { Work } from "@/components/sections/Work";
import { Testimonials } from "@/components/sections/Testimonials";
import { Expertise } from "@/components/sections/Expertise";

/**
 * Homepage section order:
 *   01  Clients (Trusted By)
 *   02  About (The Architect)
 *   03  Advantage (The Enterprise Advantage)
 *   --  PullQuote interlude
 *   04  ImpactMetrics
 *   05  Work
 *   06  Testimonials
 *   07  Expertise
 *   08  Footer (Initiate)
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
      </main>
      <Footer onOpenForm={() => setIsFormOpen(true)} />
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
}
