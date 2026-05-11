"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { XIcon as X } from "@/components/icons/Icons";

const NAV_LINKS = [
  { href: "#work", label: "Work" },
  { href: "#insights", label: "Insights" },
  { href: "#ai-lab", label: "AI Lab" },
  { href: "#process", label: "Process" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] md:w-[min(96%,1120px)] px-3 md:px-4 py-2.5 flex justify-between items-center gap-4 rounded-full backdrop-blur-3xl bg-black/30 border border-white/8 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        {/* Logo: square monogram badge instead of the old 'PG R' text.
            36px rounded-square with a hairline border + glass bg +
            mono-black 'PG' centered + a small IBM-blue corner dot.
            Hover lights up the border, fills the bg with a blue tint,
            adds an ambient glow + scales the corner dot. Reads as a
            real mark rather than a typographic placeholder. */}
        <Link
          href="/"
          onClick={handleLogoClick}
          data-cursor-no-hint="true"
          className="group shrink-0 ml-1 md:ml-2 hover-target"
          aria-label="Phil G, back to home"
        >
          <span className="relative flex items-center justify-center w-9 h-9 rounded-[10px] border border-white/15 bg-white/[0.04] backdrop-blur-md transition-all duration-500 ease-[var(--ease-out)] group-hover:border-[#0f62fe]/60 group-hover:bg-[#0f62fe]/15 group-hover:shadow-[0_0_18px_rgba(15,98,254,0.45)]">
            <span className="font-mono font-black text-white text-[13px] tracking-tighter leading-none">
              PG
            </span>
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.75)] transition-all duration-500 ease-[var(--ease-out)] group-hover:scale-125 group-hover:shadow-[0_0_14px_rgba(15,98,254,1)]"
            />
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1 font-mono text-[11px] font-medium tracking-[0.22em] text-zinc-300">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-cursor-no-hint="true"
              className="hover-target px-4 py-2 rounded-full uppercase transition-all duration-300 ease-[var(--ease-out)] hover:text-white hover:bg-white/[0.08]"
            >
              {link.label}
            </a>
          ))}
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
            {/* Mobile drawer logo: same square monogram as the desktop
                pill so the brand mark stays consistent across surfaces. */}
            <span className="relative flex items-center justify-center w-9 h-9 rounded-[10px] border border-white/15 bg-white/[0.04] backdrop-blur-md">
              <span className="font-mono font-black text-white text-[13px] tracking-tighter leading-none">
                PG
              </span>
              <span
                aria-hidden
                className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.75)]"
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
            {NAV_LINKS.map((link, i) => (
              <li
                key={link.href}
                className={`transition-all duration-700 ease-[var(--ease-out)] ${
                  isMenuOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 80 + 200}ms` }}
              >
                <a
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  data-cursor-no-hint="true"
                  className="block text-5xl font-black tracking-tighter text-white uppercase hover:text-[#0f62fe] transition-colors hover-target"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
