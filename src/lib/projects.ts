export type CaseStudyMetric = {
  value: string;
  label: string;
};

export type Project = {
  id: number;
  slug: string;
  title: string;
  category: string;
  role: string;
  year: string;
  img: string;
  desc: string;
  /** Hex accent used for hover overlay tint and highlights. */
  accent: string;

  /* Case study fields */
  client: string;
  duration: string;
  team: string;
  scope: string[];
  overview: string;
  challenge: string;
  approach: string;
  outcome: string;
  metrics: CaseStudyMetric[];
};

const BLUE = "#0f62fe";
const EMERALD = "#10b981";

export const projects: Project[] = [
  {
    id: 1,
    slug: "walmart",
    title: "Walmart",
    category: "Retail · Customer Experience",
    role: "Lead UX",
    year: "2024",
    img: "/images/projects/walmart.jpg",
    desc: "Redefined customer journeys for millions of shoppers. Drove engagement and usability through user-centered design across the Walmart digital ecosystem.",
    accent: BLUE,
    client: "Walmart Inc.",
    duration: "8 months · 2024",
    team: "Cross-functional team of 14, partnered with 4 product squads",
    scope: [
      "UX Strategy",
      "Customer Journey Design",
      "Design System",
      "AI Personalization",
    ],
    overview:
      "A top-to-bottom rethink of Walmart's digital customer journey. Applied deep ethnographic research and AI-driven personalization to one of the world's most-trafficked retail platforms.",
    challenge:
      "Walmart's legacy customer flow had accumulated layers of complexity from decades of feature sprawl. Competing internal teams shipped against each other; the cart, search, and account systems each had their own design language. Customers in our research described the experience as 'big, sometimes overwhelming.'\n\nThe brief was clear but vast: bring coherence to a 47-state customer journey without breaking what already worked at Walmart's scale.",
    approach:
      "I started with six weeks of in-context research across three markets: home shoppers in suburban USA, mobile-first buyers in Mexico, and bulk-purchasing small business owners. We mapped every distinct journey state and clustered them into seven coherent flows.\n\nFrom there I built a tokenized design system that gave each of 14 squads a shared language for color, type, spacing, motion, and AI-output components, so they could ship in parallel without diverging. We integrated AI-driven personalization at three high-impact moments: search ranking, cart recovery, and post-purchase next-action.",
    outcome:
      "The redesign rolled out in stages over six months. Internally the system became the reference for new product launches; externally, the journey-state count dropped from 47 to 19 with no loss of capability.",
    metrics: [
      { value: "+12%", label: "Checkout completion" },
      { value: "-28%", label: "Cart abandonment" },
      { value: "14", label: "Squads on the system" },
      { value: "47 → 19", label: "Journey states unified" },
    ],
  },
  {
    id: 2,
    slug: "wwf-opensc",
    title: "WWF / OpenSC",
    category: "Sustainability · Blockchain",
    role: "Product Design Lead",
    year: "2023",
    img: "/images/projects/wwf-opensc.jpg",
    desc: "Blockchain-powered platform empowering ethical consumerism with transparent, verifiable supply-chain data. From idea to launch.",
    accent: EMERALD,
    client: "WWF / OpenSC",
    duration: "11 months · 2022 to 2023",
    team: "Founding design team of 4, working with WWF scientists and BCG Digital Ventures",
    scope: [
      "Product Strategy",
      "Brand & Identity",
      "Consumer App",
      "Verification UX",
    ],
    overview:
      "Co-led design from idea to launch on a blockchain-anchored supply chain platform. Made trustworthy supply-chain data accessible at the moment of purchase, through scannable codes and a consumer-facing verification flow.",
    challenge:
      "Consumers want to buy ethically, but supply chains are deliberately opaque. WWF and the Boston Consulting Group's Digital Ventures arm wanted to ship a platform that proved a fish, a coffee bean, or a cotton shirt's origin with verifiable cryptographic evidence, and did it in a way that a shopper holding their phone for three seconds would actually understand.\n\nThe research was the design problem. We needed to translate cryptographic verification into a glanceable answer: caught here, by this boat, on this date.",
    approach:
      "I led product design across the consumer mobile experience, the verification microsite, and the supplier upload tools. The discovery work paired sustainability scientists with shoppers in Sydney supermarkets, watching them scan QR codes on tuna packaging and reading their faces at every screen.\n\nWe converged on a single-screen verification: a map, a date, a confidence indicator, a one-paragraph story. Everything else lived behind progressive disclosure for the curious. The supplier upload tools used a structured data model so honest suppliers could prove themselves cheaply, raising the cost of fraud in the rest of the network.",
    outcome:
      "Shipped end-to-end with WWF's Patagonian toothfish and Austral Fisheries pilots, then expanded across six product lines. Won multiple industry awards for sustainability tech and was cited in WWF's 2024 trust report as a proof point for blockchain-anchored origin verification.",
    metrics: [
      { value: "6", label: "Product lines onboarded" },
      { value: "82%", label: "Shopper trust score (post-scan)" },
      { value: "100%", label: "Supplier verification (Pilot fleet)" },
      { value: "0", label: "Successful provenance fraud attempts" },
    ],
  },
  {
    id: 3,
    slug: "cemex",
    title: "Cemex",
    category: "B2B Platform · Global",
    role: "UX Lead",
    year: "2022",
    img: "/images/projects/cemex.jpg",
    desc: "Led UX for a global digital platform serving 20,000+ enterprise customers in 50+ countries. Streamlined the entire digital transformation.",
    accent: BLUE,
    client: "Cemex (NYSE: CX)",
    duration: "14 months · 2021 to 2022",
    team: "Design org of 9, embedded with 22 engineering squads across 4 regions",
    scope: [
      "Enterprise UX Architecture",
      "Design System",
      "International Localization",
      "B2B Workflow Design",
    ],
    overview:
      "Led the UX architecture for Cemex's global B2B customer platform: order, schedule, track, and invoice across construction projects in 50+ countries.",
    challenge:
      "Cemex serves construction crews from 20,000+ companies. Their work happens at job sites, in trucks, and in mid-week scheduling crunches, not at desks. The legacy customer portals had grown into a tangle of regional implementations: every country had its own variant, none of them mobile-first, and field-team adoption was below 30%.\n\nThe ask was to design one platform that worked at every level of customer sophistication, in every country, and on a job-site phone with patchy reception.",
    approach:
      "We did three months of fieldwork in Mexico, Egypt, the Philippines, and Texas. The research was unambiguous: customers wanted job-site speed, not enterprise depth. Speed was the actual product.\n\nI architected a single design system with regional content packs, an offline-first mobile-web shell, and a five-step canonical job flow that absorbed every country's variant. Every screen was designed to be operable in four taps from cold-start with one hand on a dusty phone. We built a translation discipline that treated each market as a customer, not an afterthought.",
    outcome:
      "Adoption among field crews jumped from 28% to 71% in the first six months. The platform now serves 20,000+ companies across 50+ countries on a single design system, with regional teams shipping features in parallel against shared primitives.",
    metrics: [
      { value: "20K+", label: "Enterprise customers" },
      { value: "50+", label: "Countries on the platform" },
      { value: "28% → 71%", label: "Field-crew adoption (6 months)" },
      { value: "1", label: "Unified design system" },
    ],
  },
  {
    id: 4,
    slug: "pivotal-vmware",
    title: "Pivotal / VMware",
    category: "Enterprise · DevOps",
    role: "Senior Product Designer",
    year: "2021",
    img: "/images/projects/pivotal-vmware.jpg",
    desc: "Spearheaded digital transformations for global enterprises modernizing their developer platforms and engineering culture.",
    accent: EMERALD,
    client: "Pivotal Labs / VMware Tanzu",
    duration: "16 months · 2019 to 2021",
    team: "Embedded with three Fortune 500 client engineering organizations",
    scope: [
      "Developer Platform UX",
      "Internal Tooling",
      "Workflow Modernization",
      "Engineering Culture",
    ],
    overview:
      "Embedded with global enterprises modernizing their developer platforms. Designed internal tooling that engineers actually wanted to use, and helped shift engineering cultures toward continuous delivery.",
    challenge:
      "Pivotal's bet was that great developer experience changes how companies build software. Three Fortune 500 clients had each built sprawling internal-developer platforms that engineers worked around rather than with. Build times were measured in hours; deployment friction was stalling product velocity at the leadership level.\n\nMy mandate was to design internal-developer tooling that engineers preferred to their workarounds, and to use those tools as a Trojan horse for cultural change toward continuous delivery and pair programming.",
    approach:
      "We pair-designed alongside engineers. Every feature shipped came from a session of watching a real developer hit a real wall. I built three product surfaces: a self-service deployment console, a pipeline observability tool, and a service catalog with AI-assisted onboarding.\n\nThe key UX move was reframing the platform from 'admin control panel' to 'working tool'. Every screen had to make a developer faster within 20 seconds of opening it. Anything that didn't, we cut.",
    outcome:
      "Across the three clients, deployment frequency rose by an average of 9× and lead time dropped from days to hours. The patterns we developed were absorbed into VMware Tanzu's product roadmap after the Pivotal acquisition.",
    metrics: [
      { value: "9×", label: "Deployment frequency lift" },
      { value: "−85%", label: "Lead time to production" },
      { value: "3", label: "Fortune 500 platforms shipped" },
      { value: "Tanzu", label: "Patterns absorbed into VMware product" },
    ],
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);
