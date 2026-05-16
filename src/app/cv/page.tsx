import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/ui/Reveal";
import { ClosingCallCTA } from "@/components/ClosingCallCTA";
import {
  Mail,
  ArrowUpRight,
  Award,
  Users,
  Globe,
  Sparkles,
  Compass,
  Cpu,
  type IconComponent,
} from "@/components/icons/Icons";
import { TrustRow } from "@/components/TrustRow";

/**
 * /cv — Phil G.'s public résumé.
 *
 * Built from the CZ-2026 source PDF. Phone, portfolio link and
 * password are intentionally stripped (per user request). Email
 * re-pointed to hi@philg.cz so it matches every other public
 * surface (Footer, ClosingCallCTA modal).
 *
 * Design direction (this is the 10x rebuild — the previous pass
 * was a clean editorial layout; this one treats the CV as a
 * standalone visual moment):
 *
 *   • A dedicated DARK READING BACKDROP sits behind the whole CV
 *     column — same pattern as the article body backdrop in
 *     /insights/[slug]. Plants the long-form text against a
 *     high-contrast Carbon Black surface so the page-level orbs
 *     no longer fight the prose.
 *
 *   • Hero is anchored by a STAT TOWER on the right (17+ years,
 *     1,050+ designers, 11 countries, $60.4B reach) — the same
 *     editorial pattern the Selected Work gate uses. Numbers
 *     come first; the verbal pitch follows.
 *
 *   • TRUST ROW of Fortune-500 wordmarks pulled inline so the
 *     credibility hooks read at a glance (matches the Hero on
 *     the homepage so the two surfaces feel like one design
 *     family).
 *
 *   • IMPACT cards are individual glass surfaces with the
 *     headline metric foregrounded — not bullets in a list.
 *
 *   • CAREER is a vertical TIMELINE with a hairline thread and
 *     numbered role markers, so 17 years reads as a deliberate
 *     spine, not a wall of paragraphs.
 *
 *   • ADVANTAGE keeps the 2-col glass-card grid; numbered
 *     prefixes added for visual rhythm.
 *
 *   • DEVELOPMENT uses chip-pills so credentials are scannable.
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

// ─────────────────────────────────────────────────────────────
// CONTENT
// ─────────────────────────────────────────────────────────────

type HeroStat = {
  value: string;
  label: string;
  icon: IconComponent;
};

const HERO_STATS: HeroStat[] = [
  { value: "17+ years", label: "Shipping enterprise products", icon: Award },
  { value: "1,050+", label: "Designers mentored, 11 countries", icon: Users },
  { value: "50+", label: "Countries Cemex Go runs in", icon: Globe },
  { value: "120M+", label: "Walmart shoppers monthly", icon: Sparkles },
];

type Impact = {
  client: string;
  metric: string;
  outcome: string;
  detail: string;
};

const IMPACT: Impact[] = [
  {
    client: "Cemex Go",
    metric: "20,000+ users · 50+ countries",
    outcome:
      "Transformed ordering for enterprise customers at industrial scale.",
    detail:
      "Streamlined operations with intuitive interfaces, reducing ordering time and increasing digital adoption.",
  },
  {
    client: "Kuoni Tumlare",
    metric: "12-person team · AI-ready system",
    outcome:
      "Elevated design capability within a global travel enterprise.",
    detail:
      "Built an AI-ready design system accelerating prototyping at scale, hired 6 UX designers, and led a 12-person team with cross-functional alignment across Europe, Asia and India.",
  },
  {
    client: "Walmart US",
    metric: "120M+ monthly users",
    outcome:
      "Enhanced shopping experience within a $60.4B e-commerce ecosystem.",
    detail:
      "Optimized List Management through user-centered design connecting customer needs with business outcomes.",
  },
  {
    client: "WWF / Nespresso",
    metric: "100% supply chain visibility",
    outcome: "Enabled ethical coffee sourcing on a blockchain platform.",
    detail:
      "Created blockchain-backed platform tracking Congo coffee from farm to cup, achieving end-to-end traceability.",
  },
  {
    client: "Microsoft Teams",
    metric: "Millions of users",
    outcome: "Enhanced global remote collaboration.",
    detail:
      "Designed a 3D meeting interface that improved virtual communication for one of the world's most-used collaboration platforms.",
  },
  {
    client: "Royal Air Force",
    metric: "Mission-critical workflows",
    outcome: "Strengthened defense operations.",
    detail:
      "Delivered secure systems that improved mission-critical workflows while maintaining strict security protocols.",
  },
  {
    client: "Global Mentorship",
    metric: "1,000+ designers · 11 countries",
    outcome: "Launched a generation of design careers.",
    detail:
      "Built a talent ecosystem placing designers at Meta, Booking.com, Uber, IBM, and Accenture.",
  },
  {
    client: "SAP Concur",
    metric: "3 mobile teams · enterprise SaaS",
    outcome: "Directed end-to-end design for the Concur mobile app.",
    detail:
      "Significantly enhanced user satisfaction for ExpenseIt and Request features, and implemented an efficient cross-team UX/UI request system that drastically improved workflow efficiency.",
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
    loc: "Remote · Prague-based",
    period: "Jan 2021 – Present",
    summary:
      "Recent contract work includes multiple clients. Highlights:",
    bullets: [
      "Kuoni Tumlare (CZ) — Joined as UX Designer owning end-to-end UX strategy for a core business stream. Within 4 months, was invited to take on design team leadership — hiring 6 UX designers, managing a team of 12, and building an AI-ready design system for faster prototyping at scale. Collaborated with stakeholders across Europe, Asia, and India to align teams around a consistent product experience.",
      "Walmart (USA) — Led product discovery connecting customer needs with business outcomes, contributing to the digital shopping experience used by 120M+ Americans monthly.",
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
    loc: "Prague / Brazil · side project",
    period: "Dec 2015 – Present",
    summary:
      "Built and scaled a design education business from zero to 4M+ BRL in sales — entirely bootstrapped, managed remotely from Prague. Started in my apartment with no capital and grew to 1,000+ clients across Brazil. This entrepreneurial venture strengthened my business acumen through hands-on experience in product, marketing, and operations.",
  },
];

type Advantage = {
  num: string;
  icon: IconComponent;
  title: string;
  body: string;
};

const ADVANTAGES: Advantage[] = [
  {
    num: "01",
    icon: Sparkles,
    title: "Revenue acceleration",
    body: "As demonstrated with Cemex's digital transformation that streamlined operations across 50+ countries and Walmart's improved product discovery experience.",
  },
  {
    num: "02",
    icon: Users,
    title: "Team transformation from world-class mentorship",
    body: "Demonstrated by designers I've guided now leading at top global companies and my work building high-performing teams at VMware and SAP.",
  },
  {
    num: "03",
    icon: Cpu,
    title: "Technical innovation that creates market advantages",
    body: "Evidenced by pioneering blockchain applications for WWF and advanced 3D interfaces for Microsoft Teams.",
  },
  {
    num: "04",
    icon: Compass,
    title: "Accelerated go-to-market through cross-functional alignment",
    body: "Successfully implemented at SAP, Royal Air Force, Cemex, and VMware Pivotal — reducing development cycles end-to-end.",
  },
];

const DEVELOPMENT: string[] = [
  "Executive MBA · Marketing & Sales · UNIBTA, Brazil",
  "Practical gen-AI expertise · custom GPTs, agents, coding, image / video generation, research",
  "Certified UX Master · NN/g · Research · Management · Interaction",
  "IDEO Certifications · Creative Leadership · Design Thinking",
  "IBM Enterprise Design Thinking · Certified",
  "Certified Sales Funnel Builder · ClickFunnels",
  "Bachelor's · Digital Design & Graphic Design · Brazil",
];

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────

export default function CVPage() {
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
    worksFor: ROLES.map((r) => ({ "@type": "Organization", name: r.org })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <Navbar />

      {/* Page-wide dark backdrop for the CV column. Same recipe as
          the article body backdrop in /insights/[slug] — a strong
          rgba(2,2,5,0.92) Carbon ground with soft top + bottom
          fades, sitting at -z-10 so the page orbs visible at the
          rim don't fight the prose. Without it the long-form CV
          text sat on the ambient gradient orbs and washed out. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(2,2,5,0) 0%, rgba(2,2,5,0.88) 6%, rgba(2,2,5,0.95) 30%, rgba(2,2,5,0.95) 70%, rgba(2,2,5,0.88) 94%, rgba(2,2,5,0) 100%)",
        }}
      />

      <main className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 pb-32 min-h-screen">
        <div className="max-w-[1400px] mx-auto">

          {/* ─── 00 · HERO ─── */}
          <header className="mb-14 md:mb-20">
            <Reveal>
              <div className="flex items-center gap-4 mb-7">
                <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
                <span className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
                  Curriculum Vitae
                </span>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              {/* LEFT — name + role + contact */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <Reveal delay={100}>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.02]">
                    Felipe{" "}
                    <span className="font-serif italic font-light text-zinc-400">
                      (Phil)
                    </span>{" "}
                    Guimarães
                  </h1>
                </Reveal>

                <Reveal delay={200}>
                  <p className="text-2xl md:text-3xl font-light text-zinc-200 leading-snug max-w-2xl">
                    Senior UX/UI Product Design Leader.{" "}
                    <span className="text-zinc-400">
                      Digital transformation, tech products, embedded
                      delivery.
                    </span>
                  </p>
                </Reveal>

                <Reveal delay={300}>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs md:text-sm tracking-[0.18em] uppercase text-zinc-400">
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
                    {/* Working-style strip — Prague-based, fluent in
                        global remote engagements, comfortable with US
                        East Coast (NY) timezone overlap. Surfaces the
                        availability up front so recruiters reading
                        the CV from a US org know there's no schedule
                        friction. */}
                    <p className="font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-zinc-500">
                      Global remote experience · NY-hours compatible
                    </p>
                  </div>
                </Reveal>
              </div>

              {/* RIGHT — 2x2 stat grid. Previously a 4-row tower
                  which made the right column much taller than the
                  left, leaving a wide empty band below the contact
                  row. 2x2 balances the two columns so the hero
                  reads as one composed unit. */}
              <div className="lg:col-span-5">
                <Reveal delay={250}>
                  <dl className="grid grid-cols-2 gap-3 md:gap-4">
                    {HERO_STATS.map((s) => (
                      <div
                        key={s.value}
                        className="flex flex-col gap-3 p-5 md:p-6 rounded-2xl bg-[#0a0a0c]/85 border border-white/10 backdrop-blur-md"
                      >
                        <span className="shrink-0 w-9 h-9 rounded-full bg-[#0f62fe]/10 border border-[#0f62fe]/30 flex items-center justify-center">
                          <s.icon className="w-4 h-4 text-[#4589ff]" />
                        </span>
                        <dt className="font-sans font-bold text-2xl md:text-3xl text-white tabular-nums tracking-tight leading-none">
                          {s.value}
                        </dt>
                        <dd className="font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-zinc-400 leading-snug">
                          {s.label}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              </div>
            </div>
          </header>

          {/* ─── TRUST ROW ───
              Shared TrustRow component from the homepage Hero —
              same brand-typography wordmarks (Walmart sparkle,
              vmware italic, RAF roundel, etc.) so the CV strip
              reads as part of the same design system. */}
          <Reveal>
            <div className="mb-14 md:mb-20 pt-7 md:pt-9 border-t border-white/8">
              <TrustRow eyebrow="Delivered for" />
            </div>
          </Reveal>

          {/* ─── 01 · PROFESSIONAL SUMMARY ─── */}
          <Section num="01" label="Professional Summary">
            <Reveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                <p className="lg:col-span-9 text-zinc-200 font-light text-xl md:text-2xl leading-relaxed">
                  UX/UI product designer with{" "}
                  <span className="text-white font-medium">17+ years</span>{" "}
                  delivering impactful digital products through user research,
                  design thinking and usability optimization. Expert in
                  building{" "}
                  <span className="text-white font-medium">
                    design systems
                  </span>
                  , facilitating workshops, and leading{" "}
                  <span className="text-white font-medium">
                    cross-functional teams
                  </span>{" "}
                  using Figma and prototyping tools. My expertise spans
                  project leadership, design strategy and innovation —
                  elevating user satisfaction while driving business metrics.{" "}
                  <span className="font-serif italic text-white">
                    After delivering results for global organizations, I&apos;m
                    seeking a long-term role to continue value delivery within
                    key functional areas.
                  </span>
                </p>
              </div>
            </Reveal>
          </Section>

          {/* ─── 02 · IMPACT & EXPERTISE ─── */}
          <Section num="02" label="Impact & Expertise">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {IMPACT.map((it, i) => (
                <Reveal key={it.client} delay={i * 60}>
                  <article className="group h-full flex flex-col gap-4 p-7 md:p-8 rounded-2xl bg-[#0a0a0c]/85 border border-white/10 backdrop-blur-md hover:border-[#0f62fe]/40 hover:bg-[#0a0a0c]/95 transition-all duration-500">
                    {/* metric pill */}
                    <span className="self-start inline-flex items-center font-mono text-[10px] tracking-[0.22em] uppercase font-medium text-[#4589ff] px-3 py-1 rounded-full border border-[#0f62fe]/30 bg-[#0f62fe]/[0.06]">
                      {it.metric}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                      {it.client}
                    </h3>
                    <p className="text-base md:text-lg text-white/90 font-light leading-snug">
                      {it.outcome}
                    </p>
                    <p className="text-zinc-400 font-light text-sm md:text-base leading-relaxed mt-auto">
                      {it.detail}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* ─── 03 · KEY CAREER HIGHLIGHTS ─── */}
          <Section num="03" label="Key Career Highlights">
            <div className="relative">
              {/* Vertical thread runs down the left side at md+. The
                  per-role period markers (the IBM-blue circles) sit
                  on this thread, visually anchoring the timeline. */}
              <span
                aria-hidden
                className="hidden md:block pointer-events-none absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-white/12 via-white/8 to-white/3"
              />
              <ol className="flex flex-col gap-14 md:gap-16">
                {ROLES.map((role, i) => (
                  <Reveal key={`${role.org}-${role.period}`} delay={i * 80}>
                    <li className="relative grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10 md:pl-10">
                      {/* Thread dot */}
                      <span
                        aria-hidden
                        className="hidden md:block absolute left-0 top-2 w-[15px] h-[15px] rounded-full bg-[#0a0a0c] border-2 border-[#0f62fe] shadow-[0_0_14px_rgba(15,98,254,0.5)]"
                      />

                      {/* Period (left col on md+) */}
                      <div className="md:col-span-3">
                        <span className="font-mono text-[11px] md:text-xs tracking-[0.22em] uppercase text-zinc-400">
                          {role.period}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="md:col-span-9 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                            {role.title}
                          </h3>
                          <p className="font-mono text-xs md:text-sm tracking-[0.18em] uppercase">
                            <span className="text-[#4589ff]">{role.org}</span>
                            <span aria-hidden className="text-zinc-600 mx-2.5">
                              ·
                            </span>
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
              </ol>
            </div>

            <Reveal delay={ROLES.length * 80 + 100}>
              <p className="mt-12 md:mt-16 md:pl-10 font-mono text-[11px] md:text-xs tracking-[0.22em] uppercase text-zinc-500">
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

          {/* ─── 04 · COMPETITIVE ADVANTAGE ─── */}
          <Section num="04" label="Competitive Advantage">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {ADVANTAGES.map((a, i) => (
                <Reveal key={a.title} delay={i * 100}>
                  <article className="h-full flex flex-col gap-5 p-8 md:p-10 rounded-2xl bg-[#0a0a0c]/85 border border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <span className="shrink-0 w-12 h-12 rounded-full bg-[#0f62fe]/10 border border-[#0f62fe]/30 flex items-center justify-center">
                        <a.icon className="w-5 h-5 text-[#4589ff]" />
                      </span>
                      <span className="font-mono text-xs tracking-[0.32em] uppercase text-zinc-500">
                        {a.num}
                      </span>
                    </div>
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

          {/* ─── 05 · PROFESSIONAL DEVELOPMENT ─── */}
          <Section num="05" label="Professional Development">
            <div className="flex flex-wrap gap-3 md:gap-4">
              {DEVELOPMENT.map((d, i) => (
                <Reveal key={d} delay={i * 50}>
                  <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#0a0a0c]/85 border border-white/10 backdrop-blur-md text-zinc-200 font-light text-sm md:text-base hover:bg-[#0a0a0c]/95 hover:border-white/20 transition-colors">
                    <span
                      aria-hidden
                      className="w-1.5 h-1.5 rounded-full bg-[#0f62fe]/70"
                    />
                    {d}
                  </span>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* ─── CLOSING CTA ─── */}
          <Reveal delay={200}>
            <div className="mt-16 md:mt-20 pt-8 md:pt-10 relative">
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
 * Section — numbered editorial section wrapper. Same shape as
 * About / Process / FAQ / AntiPattern eyebrows so the CV reads
 * as part of the same design family.
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
    <section className="mb-16 md:mb-20">
      <Reveal>
        <div className="flex items-center gap-4 mb-7 md:mb-10">
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
