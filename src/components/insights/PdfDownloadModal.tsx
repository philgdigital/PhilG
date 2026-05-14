"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon as X } from "@/components/icons/Icons";

/**
 * Insight detail page "Download PDF" affordance.
 *
 * Renders BOTH the trigger pill AND the modal as one self-
 * contained client component. Local [open, setOpen] state — no
 * new context provider needed because the modal lives only on
 * insight detail pages.
 *
 * Modal lets the visitor pick:
 *   - "Digital version"  — dark editorial style with hero image
 *                          on the cover. Best for screen reading.
 *                          Downloads {slug}-digital.pdf.
 *   - "Print-ready"      — light theme, no hero image, friendly
 *                          to paper + greyscale printers.
 *                          Downloads {slug}-print.pdf.
 *
 * Mirrors the existing modal design language from
 * `src/components/ProjectFormModal.tsx`:
 *   - Carbon Black panel + IBM-blue top hairline accent
 *   - Backdrop dismiss + X close button (data-cursor-no-hint)
 *   - Focus trap + focus restore + body-scroll lock while open
 *   - Esc closes
 */

type Props = {
  slug: string;
  title: string;
};

export function PdfDownloadModal({ slug, title }: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Focus trap + body-scroll lock + Esc to close. Lifted verbatim
  // from ProjectFormModal so the interaction feel is identical
  // across the site's modals.
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const firstFocusable =
      dialogRef.current?.querySelector<HTMLElement>("a, button");
    firstFocusable?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus();
    };
  }, [open]);

  // Programmatic download — clicked-option triggers a real <a>
  // click so the browser respects the `download` attribute.
  // After the click fires we close the modal.
  const triggerDownload = (variant: "digital" | "print") => {
    const a = document.createElement("a");
    a.href = `/pdf/${slug}-${variant}.pdf`;
    a.download = `${slug}-${variant}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setOpen(false);
  };

  return (
    <>
      {/* TRIGGER PILL — same markup as the previous direct-download
          <a>, just rebound to open the modal instead. Keeps the
          "Click to download" cursor hint, magnetic-cursor data
          attribute, and visual chrome the visitor already learned. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-magnetic="true"
        data-cursor-hint="Click to download"
        aria-haspopup="dialog"
        className="group hover-target inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-[#0f62fe]/50 bg-white/[0.03] hover:bg-[#0f62fe]/10 font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-zinc-300 hover:text-white transition-all"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 text-[#4589ff] transition-transform duration-500 group-hover:translate-y-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>Download PDF</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-download-title"
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md transition-opacity duration-300"
        >
          {/* Backdrop — full-bleed click target that dismisses */}
          <button
            type="button"
            aria-label="Close dialog"
            data-cursor-no-hint="true"
            className="absolute inset-0 bg-[#0a0a0c]/70 hover-target cursor-default"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            ref={dialogRef}
            className="relative w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-[0_0_80px_rgba(15,98,254,0.25)] animate-modal overflow-hidden"
          >
            {/* Top IBM-blue hairline accent — same flourish as
                ProjectFormModal */}
            <div
              aria-hidden
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0f62fe] to-transparent"
            />

            {/* Close (X) — top-right */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close dialog"
              data-cursor-no-hint="true"
              className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors hover-target"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-3">
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.7)]"
              />
              <span className="font-mono text-[10px] md:text-[11px] tracking-[0.32em] uppercase text-zinc-400">
                Download as PDF
              </span>
            </div>

            <h2
              id="pdf-download-title"
              className="text-2xl md:text-4xl font-black tracking-tighter text-white leading-[1.1] mb-3 pr-12"
            >
              {title}
            </h2>
            <p className="text-zinc-400 font-light text-base md:text-lg leading-relaxed max-w-xl mb-8 md:mb-10">
              Pick the version that fits your reading mode. Screen-friendly
              digital, or a clean print-ready format with no heavy ink.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <OptionCard
                tone="digital"
                title="Digital version"
                blurb="Dark editorial, hero image, brand-wash accents. Best for reading on screen."
                onClick={() => triggerDownload("digital")}
              />
              <OptionCard
                tone="print"
                title="Print-ready"
                blurb="Light theme, no hero image. Friendly to paper and greyscale printers."
                onClick={() => triggerDownload("print")}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * One of the two side-by-side option tiles. Visual diff between
 * tones:
 *   - "digital": Carbon-black mock surface with IBM-blue + emerald
 *                brand-wash ribbon — mirrors the actual PDF cover.
 *   - "print":   White mock surface with subtle hairline rules —
 *                mirrors the print-ready PDF cover.
 */
function OptionCard({
  tone,
  title,
  blurb,
  onClick,
}: {
  tone: "digital" | "print";
  title: string;
  blurb: string;
  onClick: () => void;
}) {
  const isDigital = tone === "digital";
  return (
    <button
      type="button"
      onClick={onClick}
      data-magnetic="true"
      data-cursor-hint={`Download ${title.toLowerCase()}`}
      className="group hover-target relative text-left flex flex-col gap-4 p-5 md:p-6 rounded-2xl border border-white/8 hover:border-[#0f62fe]/50 bg-white/[0.02] hover:bg-[#0f62fe]/[0.06] hover:shadow-[0_12px_40px_-12px_rgba(15,98,254,0.35)] transition-all duration-500"
    >
      {/* Mini-cover preview — visual cue for which variant you
          get. Dark + brand-wash for digital, clean white for print. */}
      <div
        className={`relative aspect-[3/4] w-full rounded-lg overflow-hidden border ${
          isDigital
            ? "bg-[#0a0a0c] border-white/10"
            : "bg-white border-zinc-200"
        }`}
      >
        {isDigital ? (
          <>
            {/* Brand-wash diagonal — matches the cover hero treatment */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(ellipse 80% 70% at 0% 0%, rgba(15,98,254,0.35) 0%, transparent 60%), radial-gradient(ellipse 70% 60% at 100% 100%, rgba(16,185,129,0.22) 0%, transparent 60%)",
              }}
            />
            {/* Skeleton lines hinting at title + body */}
            <div className="absolute inset-x-3 top-3 flex justify-between items-center">
              <div className="h-1 w-8 bg-white/70 rounded-full" />
              <div className="h-1 w-6 bg-[#4589ff]/80 rounded-full" />
            </div>
            <div className="absolute inset-x-3 bottom-3 flex flex-col gap-1">
              <div className="h-1.5 w-3/4 bg-white/80 rounded-full" />
              <div className="h-1.5 w-1/2 bg-white/60 rounded-full" />
              <div className="h-px w-8 bg-[#0f62fe] mt-1" />
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-x-3 top-3 flex justify-between items-center">
              <div className="h-1 w-8 bg-black/70 rounded-full" />
              <div className="h-1 w-6 bg-[#0f62fe]/70 rounded-full" />
            </div>
            <div className="absolute inset-x-3 top-1/3 flex flex-col gap-1">
              <div className="h-1.5 w-3/4 bg-black/80 rounded-full" />
              <div className="h-1.5 w-1/2 bg-black/60 rounded-full" />
              <div className="h-px w-8 bg-[#0f62fe] mt-1" />
            </div>
            {/* Body text mock — thin gray lines */}
            <div className="absolute inset-x-3 bottom-3 flex flex-col gap-1">
              <div className="h-px w-full bg-zinc-300" />
              <div className="h-px w-5/6 bg-zinc-300" />
              <div className="h-px w-3/4 bg-zinc-300" />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight group-hover:text-[#4589ff] transition-colors">
          {title}
        </h3>
        <p className="text-zinc-400 font-light text-sm leading-relaxed group-hover:text-zinc-200 transition-colors">
          {blurb}
        </p>
      </div>

      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-[#4589ff] group-hover:text-white transition-colors mt-auto pt-1">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-y-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>Download</span>
      </div>
    </button>
  );
}
