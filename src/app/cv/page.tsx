import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/ui/Reveal";
import { ClosingCallCTA } from "@/components/ClosingCallCTA";
import { Mail, ArrowUpRight } from "@/components/icons/Icons";

/**
 * /cv — public résumé. Built from the CZ-2026 source PDF the user
 * provided, with phone, portfolio link, and password intentionally
 * stripped (per request). Email re-pointed to hi@philg.cz so it
 * matches every other public surface (Footer, ClosingCallCTA modal).
 *
 * Layout mirrors the canonical page-grid pattern (max-w-[1400px]
 * mx-auto + px-6 md:px-12 lg:px-24) used by every other content
 * page on the site. Section eyebrows reuse the IBM-blue dot + mono
 * tracking idiom from About / Process / Insights so the CV reads
 * as the same editorial voice, not a generic résumé template.
 *
 * Sections (mirrors the PDF's 5-section structure):
 *   00  Header — name, role, location, email
 *   01  Professional summary
 *   02  Impact + expertise (the Fortune-500 case list)
 *   03  Key career highlights (positions in reverse-chron order)
 *   04  Competitive advantage
 *   05  Professional development
 *   ── ClosingCallCTA at the bottom
 */

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  title: "CV · Phil G.",
  description:
    "Senior UX/UI Product Design Leader · 17+ years shipping enterprise products for Walmart, SAP, VMware Pivotal, Cemex, Microsoft, WWF, Royal Air Force, Kuoni Tumlare.",
  alternates: { canonical: "/cv" },
  openGraph: {
    type: "profile",
    title: "Phil G. — Senior UX/UI Product Design Leader",
    description:
      "17+ years shipping enterprise products for the Fortune 500. Prague, CZ.",
    url: "/cv",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phil G. — Senior UX/UI Product Design Leader",
    description:
      "17+ years shipping enterprise products for the Fortune 500.",
  },
};

type Impact = {
  client: string;
  outcome: string;
  detail: string;
};

const IMPACT: Impact[] = [
  {
    client: "Cemex Go",
    outcome:
      "Transformed ordering for 20,000+ customers across 50+ countries.",
    detail:
      "Streamlined operations with intuitive interfaces, reducing ordering time and increasing digital adoption.",
  },
  {
    client: "Kuoni Tumlare",
    outcome:
      "Elevated design capability within a global travel enterprise.",
    detail:
      "Built an AI-ready design system accelerating prototyping at scale, hired 6 UX designers, and led a 12-person design team with cross-functional alignment across Europe, Asia, and India.",
  },
  {
    client: "Walmart US",
    outcome:
      "Enhanced shopping for 120M+ monthly users.",
    detail:
      "Optimized List Management through user-centered design within Walmart's $60.4B e-commerce ecosystem.",
  },
  {
    client: "WWF / Nespresso",
    outcome:
      "Enabled ethical coffee sourcing.",
    detail:
      "Created blockchain platform tracking Congo coffee from farm to cup, achieving 100% supply chain visibility.",
  },
  {
    client: "Microsoft Teams",
    outcome:
      "Enhanced global remote collaboration.",
    detail:
      "Designed a 3D meeting interface that improved virtual communication for millions.",
  },
  {
    client: "Royal Air Force",
    outcome:
      "Strengthened defense operations.",
    detail:
      "Delivered secure systems that improved mission-critical workflows while maintaining strict security protocols.",
  },
  {
    client: "Global Mentorship",
    outcome:
      "Launched 1,000+ design careers.",
    detail:
      "Built a talent ecosystem placing designers at Meta, Booking.com, Uber, IBM, and Accenture across 11 countries.",
  },
];

type Role = {
  title: string;
  org: string;
  loc: string;
  period: string;
  summary?: string;
  bullets?: string[];
};

const ROLES: Role[] = [
  {
    title: "Lead UX/UI Product Designer",
    org: "Independent Contractor",
    loc: "Remote",
    period: "Jan 2021 – Present",
    summary:
      "Recent contract work includes multiple clients. Highlights:",
    bullets: [
      "Kuoni Tumlare (CZ) — Joined as UX Designer owning end-to-end UX strategy for a core business stream. Within 4 months, was invited to take on design team leadership — hiring 6 UX designers, managing a team of 12, and building an AI-ready design system for faster prototyping at scale. Collaborated with stakeholders across Europe, Asia, and India to align teams around a consistent product experience.",
      "Walmart (USA) — Led product discovery connecting customer needs with business outcomes, contributing to their digital shopping experience used by 120M+ Americans monthly.",
      "OpenSC / WWF (AU) — Led product discovery on a blockchain-backed ethical sourcing platform, tracing supply chains from origin to consumer.",
      "Microsoft, HSBC, Azul, Toptal, GoodNotes, and other clients — Directed UX strategy and product design across multiple verticals.",
    ],
  },
  {
    title: "Senior Product Designer",
    org: "VMware Pivotal Labs",
    loc: "London, UK",
    period: "Sep 2019 – Dec 2020",
    summary:
      "Drove digital transformation for Royal Air Force UK, VMware R&D, and clients across military, sports, oil & gas, and banking sectors. Led cross-functional teams creating innovative solutions, delivering secure systems that enhanced military efficiency while maintaining strict security protocols. Built high-performing design teams, facilitated alignment through workshops, and applied systems thinking to solve complex problems.",
  },
  {
    title: "Senior Product Designer",
    org: "SAP Concur",
    loc: "Prague, CZ",
    period: "Jul 2018 – Jun 2019",
    summary:
      "Directed end-to-end design for the Concur mobile app, significantly enhancing user satisfaction for ExpenseIt and Request features. Implemented an efficient system for managing UX/UI requests across three mobile teams, drastically improving workflow efficiency and cross-team accountability. Mentored junior talent who secured a permanent position — enabling career advancement and team capability development.",
  },
  {
    title: "Founder · Head of Marketing & Product",
    org: "Aela",
    loc: "Prague / Brazil",
    period: "Dec 2015 – Present · side project",
    summary:
      "Built and scaled a design education business from zero to 4M+ BRL in sales — entirely bootstrapped, managed remotely from Prague. Started in my apartment with no capital and grew to 1,000+ clients across Brazil. This entrepreneurial venture strengthened my business acumen through hands-on experience in product, marketing, and operations.",
  },
];

const ADVANTAGES: { title: string; body: string }[] = [
  {
    title: "Revenue acceleration",
    body: "As demonstrated with Cemex's digital transformation that streamlined operations across 50+ countries and Walmart's improved product discovery experience.",
  },
  {
    title: "Team transformation from world-class mentorship",
    body: "Demonstrated by designers I've guided now leading at top global companies and my work building high-performing teams at VMware and SAP.",
  },
  {
    title: "Technical innovation that creates market advantages",
    body: "Evidenced by pioneering blockchain applications for WWF and advanced interfaces for Microsoft.",
  },
  {
    title: "Accelerated go-to-market through cross-functional alignment",
    body: "Successfully implemented at SAP, Royal Air Force, Cemex, and VMware Pivotal — reducing development cycles.",
  },
];

const DEVELOPMENT: string[] = [
  "Executive MBA in Marketing & Sales — UNIBTA, Brazil",
  "Practical expertise with gen-AI for coding, image generation, video production, copywriting, research, and strategic brainstorming; experience creating custom GPTs and AI agents",
  "Certified UX Master (NN/g) — UX Research, UX Management, Interaction Design",
  "Certified Sales Funnel Builder — ClickFunnels",
  "IDEO Certifications — Creative Leadership and Design Thinking",
  "IBM Enterprise Design Thinking Certification",
  "Bachelor's in Digital Design and Graphic Design — Brazil",
];

const FORTUNE_500_CLIENTS = [
  "Walmart",
  "SAP",
  "VMware Pivotal",
  "Cemex",
  "Microsoft",
  "WWF",
  "Royal Air Force",
  "Kuoni Tumlare",
];

export default function CVPage() {
  /**
   * Person JSON-LD so crawlers + LLM agents pick up Phil's
   * professional identity from a single structured payload.
   */
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Felipe (Phil) G.",
    jobTitle: "Senior UX/UI Product Design Leader",
    email: "hi@philg.cz",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Prague",
      addressCountry: "CZ",
    },
    url: `${siteUrl}/cv`,
    sameAs: ["https://www.linkedin.com/in/felipeaela/"],
    worksFor: ROLES.map((r) => ({
      "@type": "Organization",
      name: r.org,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <Navbar />
      <main className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 pb-32 min-h-screen">
        {/* Canonical content grid — matches every other page on
            the site (Hero, Insights, Work case studies). */}
        <div className="max-w-[1400px] mx-auto">

          {/* 00 · Header */}
          <header className="mb-20 md:mb-28">
            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
                <span className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
                  Curriculum Vitae · CZ 2026
                </span>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.02] mb-6">
                Felipe (Phil) G.
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-2xl md:text-3xl font-light text-zinc-200 leading-snug max-w-3xl mb-10">
                Senior UX/UI Product Design Leader{" "}
                <span className="text-zinc-500">·</span> Digital
                Transformation{" "}
                <span className="text-zinc-500">·</span> Tech Products
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 font-mono text-xs md:text-sm tracking-[0.18em] uppercase text-zinc-400">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="text-[#4589ff]">●</span>
                  Prague, CZ
                </span>
                <a
                  href="mailto:hi@philg.cz"
                  data-magnetic="true"
                  className="hover-target inline-flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  hi@philg.cz
                </a>
                <a
                  href="https://www.linkedin.com/in/felipeaela/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-magnetic="true"
                  className="hover-target inline-flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                >
                  LinkedIn
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </Reveal>
          </header>

          {/* 01 · Professional summary */}
          <Section num="01" label="Professional Summary">
            <Reveal>
              <p className="text-zinc-300 font-light text-lg md:text-xl leading-relaxed max-w-4xl">
                UX/UI product designer with{" "}
                <span className="text-white font-medium">17+ years</span> of
                experience delivering impactful digital products through user
                research, design thinking, and usability optimization. Expert in
                building{" "}
                <span className="text-white font-medium">design systems</span>,
                facilitating workshops, and leading{" "}
                <span className="text-white font-medium">
                  cross-functional teams
                </span>{" "}
                using Figma and prototyping tools. My expertise spans from
                project leadership to design strategy and innovation processes —
                elevating user satisfaction while driving business metrics.
                After delivering results for global organizations,{" "}
                <span className="font-serif italic text-white">
                  I&apos;m seeking a long-term role to continue value delivery
                  within key functional areas.
                </span>
              </p>
            </Reveal>
          </Section>

          {/* 02 · Impact & expertise */}
          <Section num="02" label="Impact & Expertise">
            <Reveal>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-12 md:mb-16">
                {FORTUNE_500_CLIENTS.map((c, i) => (
                  <span
                    key={c}
                    className="font-mono text-xs md:text-sm font-medium tracking-[0.18em] uppercase text-white"
                  >
                    {c}
                    {i < FORTUNE_500_CLIENTS.length - 1 && (
                      <span aria-hidden className="text-zinc-600 ml-3">
                        ·
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={100}>
              <p className="font-mono text-[11px] md:text-xs tracking-[0.22em] uppercase text-zinc-500 mb-8">
                Proven results for Fortune 500 companies
              </p>
            </Reveal>

            <ul className="flex flex-col gap-8 md:gap-10">
              {IMPACT.map((it, i) => (
                <Reveal key={it.client} delay={150 + i * 70}>
                  <li className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10 pt-8 border-t border-white/8 first:pt-0 first:border-t-0">
                    <div className="md:col-span-3">
                      <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                        {it.client}
                      </h3>
                    </div>
                    <div className="md:col-span-9 flex flex-col gap-2">
                      <p className="text-lg md:text-xl text-white font-light leading-snug">
                        {it.outcome}
                      </p>
                      <p className="text-zinc-400 font-light text-base md:text-lg leading-relaxed">
                        {it.detail}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </Section>

          {/* 03 · Key career highlights */}
          <Section num="03" label="Key Career Highlights">
            <ul className="flex flex-col gap-12 md:gap-16">
              {ROLES.map((role, i) => (
                <Reveal key={`${role.org}-${role.period}`} delay={i * 80}>
                  <li className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10">
                    {/* Period column */}
                    <div className="md:col-span-3">
                      <span className="font-mono text-[11px] md:text-xs tracking-[0.22em] uppercase text-zinc-400">
                        {role.period}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="md:col-span-9 flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                          {role.title}
                        </h3>
                        <p className="font-mono text-xs md:text-sm tracking-[0.18em] uppercase text-[#4589ff]">
                          {role.org}{" "}
                          <span aria-hidden className="text-zinc-600 mx-2">
                            ·
                          </span>{" "}
                          <span className="text-zinc-400">{role.loc}</span>
                        </p>
                      </div>

                      {role.summary && (
                        <p className="text-zinc-300 font-light text-base md:text-lg leading-relaxed max-w-3xl">
                          {role.summary}
                        </p>
                      )}

                      {role.bullets && (
                        <ul className="flex flex-col gap-4 mt-2 max-w-3xl">
                          {role.bullets.map((b) => (
                            <li
                              key={b}
                              className="flex items-start gap-4 text-zinc-400 font-light text-base md:text-lg leading-relaxed"
                            >
                              <span
                                aria-hidden
                                className="shrink-0 mt-2.5 w-1.5 h-1.5 rounded-full bg-[#0f62fe]/60"
                              />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={ROLES.length * 80 + 100}>
              <p className="mt-12 md:mt-16 font-mono text-[11px] md:text-xs tracking-[0.22em] uppercase text-zinc-500">
                For earlier roles, see{" "}
                <a
                  href="https://www.linkedin.com/in/felipeaela/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-magnetic="true"
                  className="hover-target text-[#4589ff] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  LinkedIn
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </p>
            </Reveal>
          </Section>

          {/* 04 · Competitive advantage */}
          <Section num="04" label="Competitive Advantage">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {ADVANTAGES.map((a, i) => (
                <Reveal key={a.title} delay={i * 100}>
                  <article className="flex flex-col gap-4 p-8 md:p-10 rounded-2xl bg-white/[0.02] border border-white/8 backdrop-blur-sm h-full">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                      {a.title}
                    </h3>
                    <p className="text-zinc-400 font-light text-base md:text-lg leading-relaxed">
                      {a.body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* 05 · Professional development */}
          <Section num="05" label="Professional Development">
            <ul className="flex flex-col gap-5 md:gap-6 max-w-3xl">
              {DEVELOPMENT.map((d, i) => (
                <Reveal key={d} delay={i * 60}>
                  <li className="flex items-start gap-4 text-zinc-300 font-light text-base md:text-lg leading-relaxed">
                    <span
                      aria-hidden
                      className="shrink-0 mt-2.5 w-1.5 h-1.5 rounded-full bg-[#0f62fe]/60"
                    />
                    <span>{d}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </Section>

          {/* Closing CTA */}
          <Reveal delay={200}>
            <div className="mt-24 md:mt-32 pt-10 md:pt-14 relative">
              <span
                aria-hidden
                className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
              />
              <ClosingCallCTA
                title="Want to talk through whether this fits your team?"
                subtitle="Let's walk through your context on a 30-min call."
                buttonLabel="Book a 30-min intro"
              />
            </div>
          </Reveal>
        </div>
      </main>
    </>
  );
}

/**
 * Section — numbered editorial section wrapper, mirroring the
 * "01 · Section Label" pattern the rest of the site uses.
 */
function Section({
  num,
  label,
  children,
}: {
  num: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-20 md:mb-28">
      <Reveal>
        <div className="flex items-center gap-4 mb-10 md:mb-14">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            <span className="text-zinc-400">{num} ·</span> {label}
          </h2>
        </div>
      </Reveal>
      {children}
    </section>
  );
}
