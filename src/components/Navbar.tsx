"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { XIcon as X } from "@/components/icons/Icons";
import { LinkedinIcon } from "@/components/icons/BrandIcons";
import { useFormContext } from "@/lib/form-context";

/**
 * Top-level navigation links. Five flavours, discriminated by `kind`:
 *
 *   - "route"    — internal Next.js route, navigated via <Link>.
 *   - "anchor"   — homepage section anchor. From a subpage we
 *                  prefix '/' so the hash resolves on the homepage
 *                  rather than crashing on /work/[slug]/#testimonials.
 *   - "external" — opens in a new tab via plain <a target=_blank>.
 *   - "action"   — runs a side-effect (currently only `openForm`,
 *                  the global ProjectFormModal trigger from
 *                  FormProvider). Rendered as a <button>.
 *   - "disabled" — placeholder for routes that aren't ready yet.
 *                  Rendered as a muted span with cursor-not-allowed
 *                  + a "soon" title attr; not focusable.
 *
 * Order = visual order in both the desktop pill and the mobile
 * drawer. Adding / removing entries only touches this array.
 */
type NavLink =
  | { kind: "route"; href: string; label: string }
  | { kind: "anchor"; href: string; label: string }
  | {
      kind: "external";
      href: string;
      label: string;
      /** When set, render an icon instead of the text label (label
       *  stays as the accessible name via aria-label). Currently
       *  only `linkedin` is wired in. */
      icon?: "linkedin";
    }
  | { kind: "action"; action: "openForm"; label: string }
  | { kind: "disabled"; label: string };

const NAV_LINKS: NavLink[] = [
  { kind: "route", href: "/", label: "Overview" },
  { kind: "anchor", href: "#testimonials", label: "Testimonials" },
  { kind: "route", href: "/insights", label: "Insights" },
  { kind: "disabled", label: "Portfolio" },
  { kind: "disabled", label: "CV" },
  { kind: "action", action: "openForm", label: "Hire Me" },
  {
    kind: "external",
    href: "https://www.linkedin.com/in/felipeaela/",
    label: "LinkedIn",
    icon: "linkedin",
  },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { openForm } = useFormContext();

  /**
   * Resolve an anchor href against the current pathname. On the
   * homepage `#testimonials` works as-is; on a subpage the browser
   * has no `<section id="testimonials">` to jump to, so we prefix
   * the homepage route ('/') and Next routes there first.
   */
  const resolveAnchorHref = (hash: string): string =>
    pathname === "/" ? hash : `/${hash}`;

  /**
   * Is this route-kind link currently "active" (i.e. the visitor is
   * already on it)? Exact match for `/` so it doesn't light up on
   * every subpage; prefix match for any deeper route so
   * /insights, /insights/page/2, /insights/some-slug all keep the
   * Insights link active. Anchor/external/action/disabled never
   * activate.
   */
  const isRouteActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  /**
   * Shared className builder for every clickable nav item — desktop
   * pill variant. Active links use the same hover-state visuals
   * (filled subtle bg, text-white) PLUS an IBM-blue accent dot
   * before the label so "you are here" reads at a glance.
   */
  const itemClass = (active: boolean) =>
    `hover-target px-4 py-2 rounded-full uppercase transition-all duration-300 ease-[var(--ease-out)] hover:text-white hover:bg-white/[0.08] ${
      active ? "text-white bg-white/[0.08]" : ""
    }`;
  const disabledClass =
    "px-4 py-2 rounded-full uppercase text-zinc-600 cursor-not-allowed select-none";

  /**
   * Tiny IBM-blue dot rendered before the label when the link is
   * active. Same brand-mark accent the logo uses, scaled down.
   */
  const ActiveDot = () => (
    <span
      aria-hidden
      className="inline-block w-1 h-1 rounded-full bg-[#0f62fe] shadow-[0_0_6px_rgba(15,98,254,0.7)] mr-2 align-middle"
    />
  );

  /**
   * Logo click handler. On the homepage, smooth-scrolls to the top.
   * On any other page (/work/[slug], /insights/[slug]), navigates
   * back to the homepage. Either way the visitor ends up at the
   * very top of the homepage, which is what they expect when they
   * click the logo.
   */
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Floating PILL header (builders-secrets pattern).
          - mx-auto centered with max-width 1120px so it doesn't run
            edge-to-edge; pulls in slightly from the side gutters.
          - top-3 + rounded-full + backdrop-blur-2xl + bg-black/55 +
            white/8 hairline border so it reads as a glass capsule
            floating above the page.
          - Soft drop shadow under the pill so it lifts off the
            content beneath without a hard line.
          - Each nav link is a px-4 py-2 rounded-full pill itself;
            hover fills with a soft white/8 bg so the hover hit-area
            reads as a unit rather than just a text color change.
          - The mix-blend-difference logo trick is dropped here: the
            pill bg is consistently dark so we don't need to invert
            the logo against bright content underneath. */}
      <nav
        aria-label="Primary"
        className="fixed top-5 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] md:w-[min(96%,1400px)] px-3 md:px-4 py-3 flex justify-between items-center gap-4 rounded-full backdrop-blur-3xl bg-black/30 border border-white/8 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        {/* Logo: bold "Phil G." wordmark. IBM Plex Sans black, tight
            tracking, white default, IBM-blue period as the signature
            accent. Hover shifts the wordmark to IBM blue and pulses
            the period. No frame, no box. */}
        <Link
          href="/"
          onClick={handleLogoClick}
          data-cursor-no-hint="true"
          className="group shrink-0 ml-2 md:ml-3 hover-target inline-flex items-baseline leading-none"
          aria-label="Phil G, back to home"
        >
          <span className="font-sans font-black text-xl md:text-2xl tracking-[-0.03em] leading-none text-white transition-colors duration-500 ease-[var(--ease-out)] group-hover:text-[#4589ff]">
            Phil G
          </span>
          <span
            aria-hidden
            className="inline-block w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_6px_rgba(15,98,254,0.85)] ml-0.5 -mb-0.5 transition-all duration-500 ease-[var(--ease-out)] group-hover:scale-[1.45] group-hover:shadow-[0_0_14px_rgba(15,98,254,1)]"
          />
        </Link>
        {/* Desktop nav. Each link is a hash anchor (#work, #insights,
            etc.) on the homepage. When the visitor is on a subpage
            (/work/[slug] or /insights/[slug]), the hash alone won't
            resolve - there's no <section id="work"> on a case study
            page - so we prefix the homepage route ('/') to the href
            and use next/link's client-side navigation. The browser
            then routes back to / and scrolls to the section, which
            is what every link in the menu should do regardless of
            current page. */}
        <div className="hidden md:flex items-center gap-1 font-mono text-xs font-medium tracking-[0.22em] text-zinc-300">
          {NAV_LINKS.map((link, i) => {
            const k = link.kind;
            if (k === "disabled") {
              return (
                <span
                  key={`disabled-${i}`}
                  title="Coming soon"
                  aria-disabled="true"
                  data-cursor-no-hint="true"
                  className={disabledClass}
                >
                  {link.label}
                </span>
              );
            }
            if (k === "action") {
              return (
                <button
                  key={`action-${link.action}`}
                  type="button"
                  onClick={openForm}
                  data-cursor-no-hint="true"
                  className={itemClass(false)}
                >
                  {link.label}
                </button>
              );
            }
            if (k === "external") {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-no-hint="true"
                  aria-label={link.label}
                  className={itemClass(false)}
                >
                  {link.icon === "linkedin" ? (
                    <LinkedinIcon className="w-3.5 h-3.5" />
                  ) : (
                    link.label
                  )}
                </a>
              );
            }
            // route + anchor → next/link
            const active = k === "route" && isRouteActive(link.href);
            return (
              <Link
                key={link.href}
                href={
                  k === "route" ? link.href : resolveAnchorHref(link.href)
                }
                data-cursor-no-hint="true"
                aria-current={active ? "page" : undefined}
                className={itemClass(active)}
              >
                {active && <ActiveDot />}
                {link.label}
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          data-cursor-no-hint="true"
          className="md:hidden text-white hover-target p-2 mr-1"
        >
          <span className="block w-7 h-0.5 bg-white mb-1.5" />
          <span className="block w-7 h-0.5 bg-white" />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-all duration-500 ease-[var(--ease-out)] ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          data-cursor-no-hint="true"
          onClick={() => setIsMenuOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-2xl w-full h-full hover-target cursor-default"
        />
        <div
          className={`relative h-full flex flex-col p-8 transition-transform duration-700 ease-[var(--ease-out)] ${
            isMenuOpen ? "translate-y-0" : "-translate-y-8"
          }`}
        >
          <div className="flex justify-between items-center mb-16">
            {/* Mobile drawer logo: same Phil G. wordmark as the
                desktop pill, scaled slightly larger since the
                drawer has more room. */}
            <span className="inline-flex items-baseline leading-none">
              <span className="font-sans font-black text-xl tracking-[-0.03em] leading-none text-white">
                Phil G
              </span>
              <span
                aria-hidden
                className="inline-block w-1.5 h-1.5 rounded-full bg-[#0f62fe] shadow-[0_0_6px_rgba(15,98,254,0.85)] ml-0.5 -mb-0.5"
              />
            </span>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              data-cursor-no-hint="true"
              className="text-white hover-target p-2"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
          <ul className="flex flex-col gap-8">
            {NAV_LINKS.map((link, i) => {
              const liCls = `transition-all duration-700 ease-[var(--ease-out)] ${
                isMenuOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`;
              const linkCls = (active: boolean) =>
                `block text-5xl font-black tracking-tighter uppercase transition-colors hover-target ${
                  active
                    ? "text-[#4589ff]"
                    : "text-white hover:text-[#0f62fe]"
                }`;
              const disabledLinkCls =
                "block text-5xl font-black tracking-tighter text-zinc-700 uppercase cursor-not-allowed select-none";
              const delay = { transitionDelay: `${i * 80 + 200}ms` };
              const k = link.kind;
              if (k === "disabled") {
                return (
                  <li
                    key={`disabled-${i}`}
                    className={liCls}
                    style={delay}
                  >
                    <span
                      title="Coming soon"
                      aria-disabled="true"
                      data-cursor-no-hint="true"
                      className={disabledLinkCls}
                    >
                      {link.label}
                    </span>
                  </li>
                );
              }
              if (k === "action") {
                return (
                  <li
                    key={`action-${link.action}`}
                    className={liCls}
                    style={delay}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        openForm();
                      }}
                      data-cursor-no-hint="true"
                      className={`${linkCls(false)} text-left`}
                    >
                      {link.label}
                    </button>
                  </li>
                );
              }
              if (k === "external") {
                return (
                  <li key={link.href} className={liCls} style={delay}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMenuOpen(false)}
                      data-cursor-no-hint="true"
                      aria-label={link.label}
                      className={
                        link.icon === "linkedin"
                          ? "inline-flex hover-target hover:text-[#0f62fe] transition-colors text-white"
                          : linkCls(false)
                      }
                    >
                      {link.icon === "linkedin" ? (
                        <LinkedinIcon className="w-12 h-12" />
                      ) : (
                        link.label
                      )}
                    </a>
                  </li>
                );
              }
              const active = k === "route" && isRouteActive(link.href);
              return (
                <li key={link.href} className={liCls} style={delay}>
                  <Link
                    href={
                      k === "route"
                        ? link.href
                        : resolveAnchorHref(link.href)
                    }
                    onClick={() => setIsMenuOpen(false)}
                    data-cursor-no-hint="true"
                    aria-current={active ? "page" : undefined}
                    className={linkCls(active)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
