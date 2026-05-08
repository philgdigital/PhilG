"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const NAV_LINKS = [
  { href: "#work", label: "Enterprise Work" },
  { href: "#advantage", label: "AI Advantage" },
  { href: "#expertise", label: "Capabilities" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <nav className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 lg:px-24 py-8 flex justify-between items-center backdrop-blur-md bg-black/20 border-b border-white/5 transition-all duration-500">
        <a
          href="#"
          className="font-black text-2xl tracking-tighter text-white hover-target mix-blend-difference"
        >
          PG<span className="text-[#0f62fe]">®</span>
        </a>
        <div className="hidden md:flex gap-12 font-mono text-[11px] font-medium tracking-[0.22em] text-zinc-300">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover-target hover:text-white transition-colors uppercase"
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
          className="md:hidden text-white hover-target p-2 -mr-2"
        >
          <span className="block w-8 h-0.5 bg-white mb-2" />
          <span className="block w-8 h-0.5 bg-white" />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsMenuOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-2xl w-full h-full hover-target cursor-default"
        />
        <div
          className={`relative h-full flex flex-col p-8 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMenuOpen ? "translate-y-0" : "-translate-y-8"
          }`}
        >
          <div className="flex justify-between items-center mb-16">
            <span className="font-black text-2xl tracking-tighter text-white">
              PG<span className="text-[#0f62fe]">®</span>
            </span>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              className="text-white hover-target p-2"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
          <ul className="flex flex-col gap-8">
            {NAV_LINKS.map((link, i) => (
              <li
                key={link.href}
                className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isMenuOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 80 + 200}ms` }}
              >
                <a
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
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
