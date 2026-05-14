"use client";

import { Navbar } from "@/components/Navbar";
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

  // Homepage JSON-LD bundle. Three @graph nodes:
  //   - Person (Phil G.) so AI assistants + Google's Knowledge
  //     Graph can attach a stable entity to the site.
  //   - WebSite with potentialAction for an inline sitelinks
  //     searchbox (no-op for now since the site has no /search
  //     route, but the structured marker is harmless and helps
  //     crawlers understand the site shape).
  //   - ProfessionalService describing the engagement offer so
  //     LLM answers about 'who is Phil G.' can pick up the work
  //     scope, location, and availability.
  // Rendered inline so it appears in the SSR'd HTML before any
  // hydration; LLM + search crawlers see it on first byte.
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://philg.cz";
  const homepageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#phil`,
        name: "Phil G.",
        url: siteUrl,
        jobTitle: "UX/Product Design Leader",
        description:
          "AI-native product design leader with 17+ years building products for Walmart, VMware, Pivotal Labs, Microsoft, SAP, WWF, Cemex, Vodafone, Kuoni Tumlare, and the Royal Air Force.",
        knowsLanguage: [
          { "@type": "Language", name: "English", alternateName: "en" },
          { "@type": "Language", name: "Portuguese", alternateName: "pt" },
          { "@type": "Language", name: "Spanish", alternateName: "es" },
        ],
        knowsAbout: [
          "Product Design",
          "Design Leadership",
          "AI-Native Prototyping",
          "Product Discovery",
          "Design Systems",
          "UX Research",
          "Systems Thinking",
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Prague",
          addressCountry: "CZ",
        },
        email: "hi@philg.cz",
        sameAs: ["https://www.linkedin.com/in/felipeaela/"],
        hasCredential: [
          {
            "@type": "EducationalOccupationalCredential",
            name: "NN/g Certified UX Master",
          },
          {
            "@type": "EducationalOccupationalCredential",
            name: "IDEO Creative Leadership graduate",
          },
          {
            "@type": "EducationalOccupationalCredential",
            name: "IBM Enterprise Design Thinking practitioner",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Phil G.",
        description:
          "UX/Product Design Leader. Prague-based, AI-native, 17+ years.",
        publisher: { "@id": `${siteUrl}/#phil` },
        inLanguage: "en",
      },
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#service`,
        name: "Phil G. - Product Design & AI-Native Acceleration",
        provider: { "@id": `${siteUrl}/#phil` },
        areaServed: "Worldwide",
        description:
          "Embedded senior product designer + builder. Discovery, AI-native prototyping, design leadership, design systems, production-grade React.",
        url: siteUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Inline-emitted on SSR so search engines + LLM crawlers
        // pick up the Person / WebSite / Service triple on first
        // paint. dangerouslySetInnerHTML is the standard React
        // pattern; the JSON is fully literal so there's no
        // injection risk.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      {/* Skip-to-content link. Visible ONLY on KEYBOARD focus (tab
          navigation), never on mouse / click focus. The earlier
          `focus:` modifiers matched any focus state, so clicking
          the Phil G. logo (or any focusable element via mouse)
          briefly revealed the pill in the top-left. Switching to
          `focus-visible:` uses the browser's heuristic for
          'genuinely came from the keyboard', which is the canonical
          pattern for accessibility skip-links. */}
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[400] focus-visible:bg-white focus-visible:text-black focus-visible:font-mono focus-visible:font-medium focus-visible:tracking-[0.18em] focus-visible:uppercase focus-visible:text-xs focus-visible:px-4 focus-visible:py-3 focus-visible:rounded-full focus-visible:shadow-lg"
      >
        Skip to main content
      </a>
      <Navbar />
      <SectionProgress />
      <main id="main-content" data-section-dividers>
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
      {/* Footer is mounted globally in src/app/layout.tsx via
          <FooterMount />, so it appears on every route — not just
          here. Don't duplicate it on this page. */}
    </>
  );
}
