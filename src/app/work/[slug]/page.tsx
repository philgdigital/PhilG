import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "@/components/icons/Icons";
import { projects, getProject } from "@/lib/projects";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/ui/Reveal";
import { DiscussProjectButton } from "@/components/DiscussProjectButton";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Case study not found" };
  const url = `/work/${project.slug}`;
  return {
    title: `${project.title} · Case Study`,
    description: project.desc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title: `${project.title} · Phil G.`,
      description: project.desc,
      url,
      images: [
        {
          url: project.img,
          alt: `${project.title} - case study by Phil G.`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} · Phil G.`,
      description: project.desc,
      images: [{ url: project.img, alt: project.title }],
    },
  };
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export default async function CaseStudy({ params }: RouteProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length];

  // Article JSON-LD. Surfaces this case study as structured data
  // for search engines + LLM crawlers so the title, summary, image,
  // author (Phil G. as a Person), and canonical URL show up in
  // assistant answers and rich-result snippets.
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    description: project.desc,
    image: [`${siteUrl}${project.img}`],
    datePublished: `${project.year}-01-01`,
    author: {
      "@type": "Person",
      name: "Phil G.",
      url: siteUrl,
      jobTitle: "UX/Product Design Leader",
    },
    publisher: {
      "@type": "Person",
      name: "Phil G.",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/work/${project.slug}`,
    },
    about: project.category,
    keywords: project.scope.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD is intentionally inline-rendered (server-side) so
        // crawlers see it on first paint without waiting for client
        // hydration. dangerouslySetInnerHTML is the standard React
        // pattern for emitting raw script content here; the JSON is
        // produced from typed project data so there's no injection
        // surface.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Navbar />
      <main className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 pb-32">
        {/* Top: index marker + back link */}
        <div className="flex items-center justify-between mb-16">
          <Link
            href="/#work"
            data-magnetic="true"
            className="group inline-flex items-center gap-2 hover-target font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400 hover:text-white transition-colors will-change-transform"
          >
            <ArrowUpLeft className="w-4 h-4 -rotate-45 transition-transform duration-500 group-hover:-translate-x-1" />
            <span>All work</span>
          </Link>
          <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400">
            {`0${idx + 1} / 0${projects.length}`}
          </span>
        </div>

        {/* Hero block */}
        <Reveal>
          <div className="flex items-center gap-4 mb-10">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: project.accent,
                boxShadow: `0 0 10px ${project.accent}`,
              }}
            />
            <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
              {project.category}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1
            className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-[0.9] text-white mb-12 max-w-[15ch]"
            style={{ viewTransitionName: `work-title-${project.slug}` }}
          >
            {project.title}
          </h1>
        </Reveal>

        {/* Overview paragraph. Matches the visual width of the
            headline above (which renders at ~1100-1200px wide on
            lg viewports for typical project titles) so the two
            blocks read as one composed unit instead of a wide
            title hovering over a narrow paragraph.
            line-clamp-3 caps any overview at three lines max; if
            a project's overview ever overflows that, it gets
            truncated with an ellipsis. The full content is still
            available below in the Challenge/Approach sections, so
            the truncation isn't a content loss. */}
        <Reveal delay={200}>
          <p className="text-2xl md:text-3xl font-light text-zinc-200 leading-snug max-w-6xl mb-20 line-clamp-3">
            {project.overview}
          </p>
        </Reveal>

        {/* Project meta dl: Client, Year, Role, Duration */}
        <Reveal delay={300}>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 mb-24 border-t border-white/8 pt-12">
            {[
              { label: "Client", value: project.client },
              { label: "Year", value: project.year },
              { label: "Role", value: project.role },
              { label: "Duration", value: project.duration },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-2">
                <dt className="font-mono text-[10px] font-medium tracking-[0.22em] uppercase text-zinc-400">
                  {item.label}
                </dt>
                <dd className="text-white font-light text-base md:text-lg">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Hero visual */}
        <Reveal delay={400}>
          <div
            className="relative w-full aspect-[16/10] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/8 mb-32 shadow-2xl"
            style={{ viewTransitionName: `work-card-${project.slug}` }}
          >
            <Image
              src={project.img}
              alt={project.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0 mix-blend-multiply opacity-50"
              style={{
                backgroundImage: `linear-gradient(to top, ${project.accent}99, transparent 60%)`,
              }}
            />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </Reveal>

        {/*
          LADDER LAYOUT for case-study sections (Scope / Team /
          Challenge / Approach / Outcome).

          Each section is a 12-col grid:
            col-span-2 (md) / col-span-3 (lg)  : section LABEL
            col-span-10 (md) / col-span-9 (lg) : section CONTENT

          The label column is RIGHT-aligned (md:text-right) and
          sticky-top-aligned so it hugs the inner column gap. The
          earlier 4/8 split with left-aligned labels left a large
          dead gap between the short mono label and the content
          column; that gap read as a layout bug. The new split
          tightens the label to the right edge of its column and
          gives the content more reading width.

          The label gets `md:sticky md:top-32 self-start` so on
          long sections (Challenge, Approach) it stays visible at
          the top of the viewport while the visitor reads past
          multiple paragraphs.
        */}

        {/* Scope chips */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-8 md:gap-x-12 mb-24">
          <Reveal className="md:col-span-2 lg:col-span-3 md:text-right md:sticky md:top-32 self-start">
            <h3 className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
              Scope
            </h3>
          </Reveal>
          <div className="md:col-span-10 lg:col-span-9 flex flex-wrap gap-3">
            {project.scope.map((s, i) => (
              <Reveal key={s} delay={i * 80}>
                <span className="glass px-5 py-2.5 rounded-full font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-white">
                  {s}
                </span>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-8 md:gap-x-12 mb-24 border-t border-white/8 pt-16">
          <Reveal className="md:col-span-2 lg:col-span-3 md:text-right md:sticky md:top-32 self-start">
            <h3 className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
              Team
            </h3>
          </Reveal>
          <Reveal delay={100} className="md:col-span-10 lg:col-span-9">
            <p className="text-zinc-200 font-light text-xl md:text-2xl leading-relaxed max-w-3xl">
              {project.team}
            </p>
          </Reveal>
        </section>

        {/* Challenge */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-8 md:gap-x-12 mb-24 border-t border-white/8 pt-16">
          <Reveal className="md:col-span-2 lg:col-span-3 md:text-right md:sticky md:top-32 self-start">
            <h3 className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
              Challenge
            </h3>
          </Reveal>
          <Reveal delay={100} className="md:col-span-10 lg:col-span-9">
            <div className="text-zinc-200 font-light text-xl md:text-2xl leading-relaxed max-w-3xl space-y-6 whitespace-pre-line">
              {project.challenge}
            </div>
          </Reveal>
        </section>

        {/* Approach */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-8 md:gap-x-12 mb-24 border-t border-white/8 pt-16">
          <Reveal className="md:col-span-2 lg:col-span-3 md:text-right md:sticky md:top-32 self-start">
            <h3 className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
              Approach
            </h3>
          </Reveal>
          <Reveal delay={100} className="md:col-span-10 lg:col-span-9">
            <div className="text-zinc-200 font-light text-xl md:text-2xl leading-relaxed max-w-3xl space-y-6 whitespace-pre-line">
              {project.approach}
            </div>
          </Reveal>
        </section>

        {/*
          Outcome section. Two distinct rows so the metrics tier can
          break out of the ladder grid:
            Row A (ladder): label-left + outcome paragraph-right,
              same col-span-2/3 + col-span-10/9 pattern as every
              other section on the page.
            Row B (FULL WIDTH): the 4-up metrics block lives outside
              the ladder grid and spans the whole content width so
              each number gets more breathing room and reads as a
              standalone summary panel. The earlier nested version
              squeezed the four metrics into the right column's
              ~75% width, which crammed the values when their labels
              were long.
        */}
        <section className="mb-24 border-t border-white/8 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-8 md:gap-x-12">
            <Reveal className="md:col-span-2 lg:col-span-3 md:text-right md:sticky md:top-32 self-start">
              <h3 className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
                Outcome
              </h3>
            </Reveal>
            <Reveal className="md:col-span-10 lg:col-span-9">
              <p className="text-zinc-200 font-light text-xl md:text-2xl leading-relaxed max-w-3xl">
                {project.outcome}
              </p>
            </Reveal>
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {project.metrics.map((m, i) => (
              <Reveal key={m.label} delay={i * 100}>
                <div
                  className="flex flex-col gap-3 border-l-2 pl-6 py-2"
                  style={{ borderColor: project.accent }}
                >
                  <span className="text-3xl md:text-4xl font-mono font-medium tabular-nums text-white tracking-tight">
                    {m.value}
                  </span>
                  <span className="font-mono text-[10px] font-medium tracking-[0.22em] uppercase text-zinc-400">
                    {m.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Next project + back to work */}
        <section className="border-t border-white/8 pt-16 mt-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12">
            <div>
              <Reveal>
                <span className="font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400 mb-3 block">
                  Next project
                </span>
              </Reveal>
              <Reveal delay={80}>
                <Link
                  href={`/work/${next.slug}`}
                  data-magnetic="true"
                  className="group inline-flex items-baseline gap-4 hover-target will-change-transform"
                >
                  <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white group-hover:text-white transition-colors">
                    {next.title}
                  </h2>
                  <ArrowUpRight className="w-8 h-8 md:w-10 md:h-10 text-zinc-400 group-hover:text-white transition-all duration-500 group-hover:rotate-12" />
                </Link>
              </Reveal>
            </div>
            <Reveal delay={200}>
              <DiscussProjectButton />
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
