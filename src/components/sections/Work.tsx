"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ArrowUpRight } from "@/components/icons/Icons";
import { projects } from "@/lib/projects";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { ElectricBorder } from "@/components/ui/ElectricBorder";

/**
 * Type augmentation for the browser View Transitions API. Stable in
 * Chrome 111+, Edge 111+, Safari 18+. Not yet in Firefox. We use it
 * with feature-detection and fall back to default Next.js navigation
 * when unsupported, so visitors on every browser still get a working
 * link, just without the morph.
 */
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => unknown;
};

export function Work() {
  const router = useRouter();

  /**
   * Intercept the card click. If the browser supports the View
   * Transitions API, wrap the navigation in startViewTransition so the
   * card image + title morph into the case-study page's hero image +
   * title (the matching viewTransitionName values are set on both
   * pages). If unsupported, let the Next.js <Link> default to native
   * client-side navigation.
   */
  const handleCardClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
      const doc = document as ViewTransitionDocument;
      if (typeof doc.startViewTransition !== "function") return;
      // Modifier-click should still open in new tab without animation.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      doc.startViewTransition(() => {
        router.push(`/work/${slug}`);
      });
    },
    [router],
  );


  return (
    <section id="work" className="px-6 md:px-12 lg:px-24 relative z-10 py-32">
      <Reveal>
        <div className="flex items-center gap-4 mb-16">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            <span className="text-zinc-400">06 ·</span> Selected Work
          </h2>
        </div>
      </Reveal>

      {/*
        Each project is a 2-column scrollytelling chapter that left-pins
        an image while the right column scrolls. EVERY project sits on a
        soft darker band so the supporting text is easier to read on top
        of the AnimatedGradientBackground. The dark bands are seamed
        together via the +sibling rule below: the first project fades
        IN from transparent, the last fades OUT, but the middle projects
        stay solid top-to-bottom so the eye reads one continuous reading
        surface across all nine case studies instead of nine separately-
        edged cells. The wrapper escapes the section padding via negative
        margins so the dark band is full-bleed.
      */}
      <div className="flex flex-col">
        {projects.map((p, index) => {
          const total = projects.length;
          const padded = (n: number) => (n < 10 ? `0${n}` : `${n}`);
          const indexLabel = `${padded(index + 1)} / ${padded(total)}`;
          // Every project wrapper carries a soft dark reading surface
          // (0.52 alpha). First project fades in from transparent at
          // the top, last project fades out to transparent at the
          // bottom, middle projects stay solid edge-to-edge so the
          // run reads as one continuous dark surface.
          const isFirst = index === 0;
          const isLast = index === total - 1;
          let background: string;
          if (isFirst) {
            background =
              "linear-gradient(180deg, rgba(2,2,5,0) 0%, rgba(2,2,5,0.52) 30%, rgba(2,2,5,0.52) 100%)";
          } else if (isLast) {
            background =
              "linear-gradient(180deg, rgba(2,2,5,0.52) 0%, rgba(2,2,5,0.52) 70%, rgba(2,2,5,0) 100%)";
          } else {
            background = "rgba(2,2,5,0.52)";
          }
          // Each article declares its own NAMED view-timeline
          // (--w-article-N). The card image + right-column text use
          // animation-timeline: that name. This is the only way the
          // scroll-driven motion can progress while the inner card
          // is sticky-pinned: view() applied directly to the sticky
          // element freezes during pinning, but the article wrapper
          // itself genuinely moves through the viewport.
          const timelineName = `--w-${p.slug.replace(/[^a-z0-9]/gi, "-")}`;
          return (
            <div
              key={p.id}
              className="relative -mx-6 md:-mx-12 lg:-mx-24 px-6 md:px-12 lg:px-24 py-6 md:py-10"
              style={{ background }}
            >
              <article
                id={`work-${p.slug}`}
                className="work-article relative grid md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 md:min-h-[72vh] scroll-mt-32"
                style={
                  {
                    viewTimelineName: timelineName,
                    viewTimelineAxis: "block",
                  } as React.CSSProperties
                }
              >
              {/* LEFT: image card pins to viewport center while content scrolls.
                  The sticky container itself doesn't get the scroll-driven
                  animation (view() freezes during sticky pinning). Instead
                  the card LINK inside carries .work-card-anim with
                  animation-timeline referencing the article's named
                  view-timeline declared above. Browsers without
                  animation-timeline see the static layout. */}
              <div className="md:sticky md:top-0 md:h-screen md:flex md:items-center md:order-1">
                <Reveal direction="left" className="w-full">
                  <TiltCard scale={1.02} maxRotation={3} className="w-full">
                    <Link
                      href={`/work/${p.slug}`}
                      data-card="true"
                      data-magnetic="true"
                      onClick={(e) => handleCardClick(e, p.slug)}
                      // transition-[border-color,box-shadow,opacity]
                      // (not transition-all) so border-radius is never
                      // implicitly transitioned. With transition-all
                      // the GPU was briefly re-rasterizing the rounded
                      // corner on hover, producing a momentary
                      // "unrounded corner" flash.
                      className="work-card-anim group relative block w-full rounded-[2rem] md:rounded-[2.5rem] bg-black/50 border border-white/5 hover-target overflow-hidden aspect-[4/5] md:aspect-[5/6] transition-[border-color,box-shadow,opacity] duration-700 ease-[var(--ease-out)] hover:border-white/15 shadow-2xl will-change-transform"
                      style={
                        {
                          viewTransitionName: `work-card-${p.slug}`,
                          // Refer to the article's named view-timeline
                          // so scroll progress drives the card's
                          // animation (work-card-scroll keyframe) even
                          // while the sticky container is pinned.
                          animationTimeline: timelineName,
                        } as React.CSSProperties
                      }
                    >
                      <ElectricBorder />
                      <ParallaxImage
                        src={p.img}
                        alt={p.title}
                        speed={0.1}
                        priority={index === 0}
                        className="opacity-60 group-hover:opacity-100 transition-all duration-[1500ms] ease-[var(--ease-out)] z-0"
                      />
                      <div
                        className="absolute inset-0 opacity-70 mix-blend-multiply transition-opacity duration-700 z-0"
                        style={{
                          backgroundImage: `linear-gradient(to top, ${p.accent}80, rgba(0,0,0,0.5) 55%, transparent)`,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent opacity-90 group-hover:opacity-50 transition-opacity duration-700 z-0" />

                      {/* Index marker top-left */}
                      <div className="absolute top-6 left-6 z-10 font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-white/60">
                        {indexLabel}
                      </div>
                      {/* Year top-right */}
                      <div className="absolute top-6 right-6 z-10 font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-white/60">
                        {p.year}
                      </div>

                      {/* Title overlaid bottom-left, monumental display */}
                      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10 flex items-end justify-between gap-4">
                        <h3
                          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-2xl break-words"
                          style={{
                            viewTransitionName: `work-title-${p.slug}`,
                          }}
                        >
                          {p.title}
                        </h3>
                        <span className="shrink-0 hidden md:inline-flex w-12 h-12 rounded-full bg-white/10 backdrop-blur-md items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-0 -translate-x-3">
                          <ArrowUpRight className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" />
                        </span>
                      </div>
                    </Link>
                  </TiltCard>
                </Reveal>
              </div>

              {/* RIGHT: content scrolls past the sticky image.
                  work-text-anim uses the same NAMED view-timeline as
                  the card so the slide-in is driven by the article's
                  scroll position, not the text element's own. md:py
                  reduced from 18vh to 10vh so projects sit closer
                  together with less wasted space between them. */}
              <div
                className="work-text-anim md:order-2 flex flex-col justify-center gap-8 md:py-[10vh]"
                style={
                  {
                    animationTimeline: timelineName,
                  } as React.CSSProperties
                }
              >
                <Reveal>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: p.accent,
                        boxShadow: `0 0 10px ${p.accent}`,
                      }}
                    />
                    <span className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
                      {p.category}
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={120}>
                  <p className="text-zinc-200 font-light text-2xl md:text-3xl leading-snug max-w-xl">
                    {p.desc}
                  </p>
                </Reveal>

                <Reveal delay={240}>
                  <dl className="grid grid-cols-2 gap-x-8 gap-y-6 max-w-md mt-2">
                    <div className="flex flex-col gap-1.5">
                      <dt className="font-mono text-[10px] font-medium tracking-[0.22em] uppercase text-zinc-400">
                        Role
                      </dt>
                      <dd className="text-white text-sm md:text-base">
                        {p.role}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <dt className="font-mono text-[10px] font-medium tracking-[0.22em] uppercase text-zinc-400">
                        Year
                      </dt>
                      <dd className="text-white text-sm md:text-base font-mono tabular-nums">
                        {p.year}
                      </dd>
                    </div>
                  </dl>
                </Reveal>

                <Reveal delay={360}>
                  <Link
                    href={`/work/${p.slug}`}
                    data-magnetic="true"
                    className="group w-fit mt-4 flex items-center gap-3 hover-target font-mono text-xs font-medium tracking-[0.22em] uppercase text-white px-6 py-4 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/5 transition-all duration-500 ease-[var(--ease-out)] will-change-transform"
                  >
                    <span>Read case study</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
                  </Link>
                </Reveal>
              </div>
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
