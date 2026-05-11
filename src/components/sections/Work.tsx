"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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

type Project = (typeof projects)[number];

/**
 * Stable wrapper that either bypasses Reveal (when `skip` is true)
 * or wraps the children in a Reveal entrance. Declared at module
 * level so it isn't re-created on every render of ProjectComposition
 * (which would trip React's static-components rule and remount its
 * children each render, losing animation state).
 */
function MaybeReveal({
  skip,
  children,
}: {
  skip: boolean;
  children: React.ReactNode;
}) {
  if (skip) return <>{children}</>;
  return <Reveal>{children}</Reveal>;
}

/**
 * Shared 2-column composition for a single project: BANNER (card
 * image on the left) + TEXT AREA (category, description, role/year,
 * CTA on the right). Used by BOTH the desktop pinned horizontal
 * track and the mobile vertical stack so the visible content is
 * identical across breakpoints; only the OUTER layout (horizontal
 * pinned scroll vs. column flow) differs.
 *
 * On desktop the grid is `lg:grid-cols-2`; on mobile it collapses to
 * a single column with the banner stacked on top of the text. Each
 * project keeps its own accent color for the category dot + the
 * card's bottom-up color wash.
 */
function ProjectComposition({
  project: p,
  index,
  total,
  onCardClick,
  insidePinnedTrack,
}: {
  project: Project;
  index: number;
  total: number;
  onCardClick: (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => void;
  /** True when rendered inside the desktop pinned horizontal track.
   *  Used to disable IntersectionObserver-based Reveal entrances,
   *  which don't make sense when every article shares the same
   *  pinned viewport window. */
  insidePinnedTrack: boolean;
}) {
  const padded = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const indexLabel = `${padded(index + 1)} / ${padded(total)}`;

  return (
    <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      {/* BANNER (card image, left column on lg). */}
      <div className="relative w-full">
        <MaybeReveal skip={insidePinnedTrack}>
          <TiltCard scale={1.02} maxRotation={3} className="w-full">
            <Link
              href={`/work/${p.slug}`}
              data-card="true"
              data-magnetic="true"
              onClick={(e) => onCardClick(e, p.slug)}
              // CORNER-FLASH FIX (preserved from earlier version):
              // clip-path: inset(0 round Xrem) is a GPU-stable
              // rounded clip that survives compositing transforms.
              className="group relative block w-full rounded-[2rem] md:rounded-[2.5rem] [clip-path:inset(0_round_2rem)] md:[clip-path:inset(0_round_2.5rem)] bg-black/50 border border-white/5 hover-target overflow-hidden aspect-[4/5] transition-[border-color,box-shadow] duration-700 ease-[var(--ease-out)] hover:border-white/15 shadow-2xl"
              style={{
                viewTransitionName: `work-card-${p.slug}`,
              }}
            >
              <ElectricBorder />
              <ParallaxImage
                src={p.img}
                alt={p.title}
                speed={0.1}
                priority={index < 2}
                className="opacity-65 group-hover:opacity-100 transition-all duration-[1500ms] ease-[var(--ease-out)] z-0"
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

              {/* Title overlaid bottom-left, monumental display. */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10 flex items-end justify-between gap-4">
                <h3
                  className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-2xl break-words"
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
        </MaybeReveal>
      </div>

      {/* TEXT AREA (right column on lg). */}
      <div className="flex flex-col items-start gap-6 md:gap-8">
        <MaybeReveal skip={insidePinnedTrack}>
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
        </MaybeReveal>

        <MaybeReveal skip={insidePinnedTrack}>
          <p className="text-zinc-200 font-light text-2xl md:text-3xl leading-snug max-w-xl">
            {p.desc}
          </p>
        </MaybeReveal>

        <MaybeReveal skip={insidePinnedTrack}>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-6 max-w-md mt-2">
            <div className="flex flex-col gap-1.5">
              <dt className="font-mono text-[10px] font-medium tracking-[0.22em] uppercase text-zinc-400">
                Role
              </dt>
              <dd className="text-white text-sm md:text-base">{p.role}</dd>
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
        </MaybeReveal>

        <MaybeReveal skip={insidePinnedTrack}>
          <Link
            href={`/work/${p.slug}`}
            data-magnetic="true"
            className="group w-fit mt-4 flex items-center gap-3 hover-target font-mono text-xs font-medium tracking-[0.22em] uppercase text-white px-6 py-4 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/5 transition-all duration-500 ease-[var(--ease-out)] will-change-transform"
          >
            <span>Read case study</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
          </Link>
        </MaybeReveal>
      </div>
    </div>
  );
}

export function Work() {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  /** Direct refs for the elements whose styles need to update at
   *  60fps (track translateX, progress-bar scaleX). Mutating these
   *  via refs instead of via React state means we don't pay the
   *  reconciliation cost of a full re-render on every scroll frame;
   *  the only React state that changes per-frame is the rounded
   *  activeIdx, which only flips at project boundaries. */
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  /** Active project index (0-based). Only changes at project
   *  boundaries, used to drive the pip counter, inert/aria-hidden
   *  on offscreen articles, and the side-menu hash. */
  const [activeIdx, setActiveIdx] = useState(0);
  /** matchMedia(lg+); pin scroll only activates on desktop. */
  const [isDesktop, setIsDesktop] = useState(false);

  const handleCardClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
      const doc = document as ViewTransitionDocument;
      if (typeof doc.startViewTransition !== "function") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      doc.startViewTransition(() => {
        router.push(`/work/${slug}`);
      });
    },
    [router],
  );

  // Track desktop / mobile breakpoint so the pinned-horizontal scroll
  // only engages at lg+. matchMedia change is rare (orientation flip,
  // window resize across the breakpoint) so the listener cost is
  // negligible.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // SMOOTHED SCROLL -> HORIZONTAL TRACK (desktop only).
  //
  // Previous implementation: setProgress(raw) on every rAF, which
  // re-rendered the whole component each frame AND mapped raw
  // scroll position directly to translateX. Two visible bugs from
  // that:
  //   (a) On macOS / trackpad momentum scroll, scroll events fire in
  //       bursts with quiet periods between them. The transform
  //       jumped on each burst and froze between, reading as stutter.
  //   (b) React re-rendered the entire ProjectComposition tree on
  //       every frame, including 9 cards w/ TiltCard + Image. On
  //       slower hardware that bottlenecked at the React reconciler.
  //
  // New approach:
  //   - Scroll events update a target progress (raw, clamped to
  //     [0, 1]) stored in a ref.
  //   - A continuous rAF loop lerps current toward target with an
  //     exponential approach (~95% in 180ms). The lerp irons out
  //     scroll bursts so the transform is fluid even when the input
  //     is stuttery.
  //   - The transform is written DIRECTLY to the track element's
  //     style via the trackRef. No React state involved per frame.
  //   - The progress bar's scaleX is updated the same way via
  //     progressBarRef.
  //   - React state (activeIdx) is only updated when the rounded
  //     active project changes (e.g., progress crosses 0.5/(N-1) -
  //     0.5 ratio). That triggers the pip + inert flip but happens
  //     at most ~9 times per full scroll, not 60 times per second.
  useEffect(() => {
    if (!isDesktop) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const N = projects.length;
    const transitions = Math.max(1, N - 1);
    let target = 0;
    let current = 0;
    let lastFrameTime = 0;
    let alive = true;
    let lastIdx = -1;

    const measureTarget = () => {
      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const pinDuration = transitions * vh;
      if (pinDuration <= 0) {
        target = 0;
        return;
      }
      const raw = -rect.top / pinDuration;
      target = Math.max(0, Math.min(1, raw));
    };

    const applyToDOM = (p: number) => {
      const tx = -p * transitions * 100;
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${tx}vw, 0, 0)`;
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${p})`;
      }
      const idx = Math.round(p * transitions);
      if (idx !== lastIdx) {
        lastIdx = idx;
        setActiveIdx(idx);
      }
    };

    const tick = (now: number) => {
      if (!alive) return;
      const dt = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, 0.1) : 0;
      lastFrameTime = now;
      // Exponential approach. k = 18 -> ~95% caught up in ~180ms,
      // ~99% in ~280ms. Fast enough to feel direct, slow enough to
      // sand off scroll bursts.
      const k = 18;
      const alpha = 1 - Math.exp(-k * dt);
      const diff = target - current;
      if (Math.abs(diff) < 0.0002) {
        current = target;
      } else {
        current += diff * alpha;
      }
      applyToDOM(current);
      requestAnimationFrame(tick);
    };

    const onScroll = () => {
      measureTarget();
    };

    // Initial measure + render so the track is positioned correctly
    // on first paint (e.g. if the visitor lands mid-page via a
    // deep link).
    measureTarget();
    current = target;
    applyToDOM(current);
    lastFrameTime = performance.now();
    requestAnimationFrame(tick);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measureTarget);

    return () => {
      alive = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measureTarget);
    };
  }, [isDesktop]);

  // INITIAL-LOAD HASH NAVIGATION.
  // If the visitor lands on the page with a hash like #work-sap
  // (e.g. a shared deep link), the browser's native anchor scroll
  // can't position correctly because all the desktop article
  // elements share the same vertical y inside the pinned track.
  // Programmatically scroll to the project's pin position once the
  // InitialLoader has released the body-scroll lock (the loader
  // dispatches 'philg:loader-done' when its overlay fades out).
  useEffect(() => {
    if (!isDesktop) return;
    if (typeof window === "undefined") return;

    const handleHashNav = () => {
      const hash = window.location.hash;
      if (!hash.startsWith("#work-")) return;
      const slug = hash.slice("#work-".length);
      const idx = projects.findIndex((p) => p.slug === slug);
      if (idx < 0) return;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      // Wait one frame so layout has settled before measuring
      // offsetTop (especially after web-font swap).
      requestAnimationFrame(() => {
        if (!wrapper) return;
        const targetY = wrapper.offsetTop + idx * window.innerHeight;
        window.scrollTo({ top: targetY, behavior: "auto" });
      });
    };

    type WithFlag = Window & { __philgLoaderDone?: boolean };
    if ((window as WithFlag).__philgLoaderDone) {
      handleHashNav();
      return;
    }
    window.addEventListener("philg:loader-done", handleHashNav, { once: true });
    return () => {
      window.removeEventListener("philg:loader-done", handleHashNav);
    };
  }, [isDesktop]);

  // SIDE-MENU NAVIGATION INTERCEPT.
  // The SectionProgress sub-items render anchor links like
  // <a href="#work-{slug}">. Native anchor scroll on desktop is
  // BROKEN here because every project article lives at the same
  // vertical position inside the sticky horizontal track, so the
  // browser sees them all at the same scrollY and can't land on the
  // right one. This document-level click interceptor catches those
  // clicks before the browser handles them and programmatically
  // scrolls to the EXACT scrollY that puts the requested project in
  // view via the pinned-horizontal scroll math:
  //
  //   targetScrollY = wrapper.offsetTop + idx * window.innerHeight
  //
  // The native window.scrollTo({ smooth }) animation drives the
  // page's scrollY over 200-500ms; the measure() effect above
  // re-reads scroll position every frame and updates the horizontal
  // track's translateX, so the visitor sees the gallery scroll
  // smoothly to the requested project (vertical scroll + horizontal
  // track motion happen in lockstep, exactly like a real scroll).
  //
  // On mobile we hand off to scrollIntoView on the article's
  // data-anchor element, since the articles there are in a normal
  // vertical column and we just want to land on the right one.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest(
        'a[href^="#work-"]',
      ) as HTMLAnchorElement | null;
      if (!link) return;
      // Honor modifier clicks (open in new tab / window).
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const hash = link.getAttribute("href");
      if (!hash) return;
      const slug = hash.slice("#work-".length);
      const idx = projects.findIndex((p) => p.slug === slug);
      if (idx < 0) return;

      e.preventDefault();
      history.replaceState(null, "", hash);

      if (isDesktop) {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const targetY =
          wrapper.offsetTop + idx * window.innerHeight;
        window.scrollTo({ top: targetY, behavior: "smooth" });
      } else {
        const article = document.querySelector<HTMLElement>(
          `[data-work-anchor="${slug}"]`,
        );
        if (article) {
          article.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [isDesktop]);

  const N = projects.length;
  // Header pip counter (e.g. "03 / 09") tracks the closest project
  // to the current scroll position. Driven by the activeIdx state
  // that the rAF lerp loop only updates on integer transitions.
  const pip = `${String(activeIdx + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;

  return (
    <section
      id="work"
      ref={wrapperRef}
      className="relative z-10 lg:[height:calc(var(--work-n)*100vh)]"
      style={
        {
          "--work-n": N,
          // Strong dark band beneath the gallery so the cards and
          // their accent washes don't fight with the page's ambient
          // bg orbs. 4% top fade + 4% bottom fade give a soft handoff
          // to the neighbouring sections (Testimonials above, AI Lab
          // below) so the dark band doesn't read as a hard horizontal
          // edge cutting the page.
          background:
            "linear-gradient(180deg, rgba(2,2,5,0) 0%, rgba(2,2,5,0.88) 4%, rgba(2,2,5,0.92) 50%, rgba(2,2,5,0.88) 96%, rgba(2,2,5,0) 100%)",
        } as React.CSSProperties
      }
    >
      {/* DESKTOP: pinned horizontal scroll.
          The outer section is N * 100vh tall. The sticky child pins
          at top:0 for (N - 1) * 100vh of vertical scroll, during
          which the horizontal track inside it translates left by
          (N - 1) * 100vw. Each viewport-height of vertical scroll
          surfaces one project transition. The whole thing breaks the
          page's vertical rhythm and reads as a gallery the visitor
          is walking through sideways. */}
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
        {/* Pinned section header. Sits in the upper-left corner of
            the sticky window with the live project pip on the right.
            pointer-events-none so it doesn't block hover on whatever
            project is currently in view. */}
        <div className="absolute top-12 left-0 right-0 z-30 px-12 lg:px-24 pointer-events-none">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
            <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
              <span className="text-zinc-400">06 ·</span> Selected Work
            </h2>
            <div className="ml-auto font-mono text-[11px] tracking-[0.32em] uppercase text-zinc-400 tabular-nums">
              {pip}
            </div>
          </div>
        </div>

        {/* Horizontal scroll hint: subtle "Scroll ->" affordance in
            the bottom-center so visitors understand the page-scroll
            input is being translated to horizontal gallery motion. */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-400 flex items-center gap-3 pointer-events-none">
          <span>Scroll</span>
          <span aria-hidden className="inline-block w-6 h-px bg-zinc-600" />
          <span aria-hidden>→</span>
        </div>

        {/* Progress bar: thin hairline along the bottom of the
            pinned window, fills left-to-right as the visitor scrolls
            through the gallery. Updated via progressBarRef directly
            (DOM mutation) so the bar tracks the smoothed transform
            at 60fps without paying a React re-render per frame. */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 z-30 h-px bg-white/5 pointer-events-none"
        >
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-[#0f62fe] via-[#4589ff] to-[#10b981] shadow-[0_0_12px_rgba(15,98,254,0.5)] origin-left"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        {/* Horizontal track. Width = N * 100vw, transform driven by
            the rAF lerp loop directly via trackRef (no React state
            per frame). will-change keeps the GPU layer warm so the
            transform animation stays glassy under paint load.

            Each article is `inert` + `aria-hidden` when it's not the
            currently active project, so keyboard tab navigation
            and screen readers skip past the offscreen cards. The
            visitor can still tab through links inside the active
            project. */}
        <div
          ref={trackRef}
          className="flex h-full will-change-transform"
          style={{
            width: `${N * 100}vw`,
            transform: "translate3d(0, 0, 0)",
          }}
        >
          {projects.map((p, index) => (
            <article
              key={p.id}
              id={`work-${p.slug}`}
              aria-hidden={index !== activeIdx ? "true" : undefined}
              inert={index !== activeIdx}
              className="shrink-0 w-screen h-screen flex items-center justify-center px-12 lg:px-24 pt-32 pb-24"
            >
              <ProjectComposition
                project={p}
                index={index}
                total={N}
                onCardClick={handleCardClick}
                insidePinnedTrack
              />
            </article>
          ))}
        </div>
      </div>

      {/* MOBILE: vertical stack. Each project is a regular flow
          article with the same BANNER + TEXT composition collapsing
          to a single column (lg:grid-cols-2 -> grid-cols-1). Reveal
          entrances are kept here since each project genuinely enters
          the viewport on its own scroll position. */}
      <div className="lg:hidden">
        <div className="px-6 md:px-12 pt-24 pb-10">
          <Reveal>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
              <h2 className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-zinc-400">
                <span className="text-zinc-400">06 ·</span> Selected Work
              </h2>
            </div>
          </Reveal>
        </div>
        <div className="flex flex-col">
          {projects.map((p, index) => (
            <article
              key={p.id}
              id={`work-${p.slug}-m`}
              data-work-anchor={p.slug}
              className="px-6 md:px-12 py-16"
            >
              <ProjectComposition
                project={p}
                index={index}
                total={N}
                onCardClick={handleCardClick}
                insidePinnedTrack={false}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
