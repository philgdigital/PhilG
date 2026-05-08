export type Project = {
  id: number;
  slug: string;
  title: string;
  category: string;
  role: string;
  year: string;
  img: string;
  desc: string;
  color: string;
};

export const projects: Project[] = [
  {
    id: 1,
    slug: "lumina-os",
    title: "Lumina OS",
    category: "Spatial Computing",
    role: "UX / Frontend Architecture",
    year: "2026",
    img: "/images/projects/lumina-os.jpg",
    desc: "A complete operating system reimagined for spatial computing. We used AI agents to rapidly simulate massive multi-tasking workflows prior to production build.",
    color: "from-blue-900/90",
  },
  {
    id: 2,
    slug: "aether-platform",
    title: "Aether Platform",
    category: "Enterprise Big Data",
    role: "Lead Product Designer",
    year: "2025",
    img: "/images/projects/aether-platform.jpg",
    desc: "Data visualization engine for global logistics. We reduced cognitive overload by 70% by introducing predictive contextual menus.",
    color: "from-purple-900/90",
  },
];
