export type Project = {
  id: number;
  slug: string;
  title: string;
  category: string;
  role: string;
  year: string;
  img: string;
  desc: string;
  /** Hex accent used for the card's hover overlay tint. */
  accent: string;
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
  },
];
