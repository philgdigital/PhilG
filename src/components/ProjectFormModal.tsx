"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { X, Sparkles } from "lucide-react";

type ProjectFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ProjectFormModal({ isOpen, onClose }: ProjectFormModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const firstField = dialogRef.current?.querySelector<HTMLInputElement>(
      "input, textarea, select",
    );
    firstField?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire up Resend/Formspree/etc.
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-form-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md transition-opacity duration-300"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[#030305]/70 hover-target cursor-default"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="relative w-full max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-[0_0_80px_rgba(79,70,229,0.25)] animate-modal overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors hover-target"
        >
          <X className="w-8 h-8" />
        </button>

        <h2
          id="project-form-title"
          className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-2"
        >
          Initiate Project
        </h2>
        <p className="text-neutral-400 font-light mb-8 text-lg">
          Tell me about your enterprise vision and let&apos;s calculate the velocity we can achieve.
        </p>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="form-name"
                className="text-xs font-bold tracking-widest uppercase text-neutral-500"
              >
                Name
              </label>
              <input
                id="form-name"
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all hover-target"
                placeholder="Tim Cook"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="form-company"
                className="text-xs font-bold tracking-widest uppercase text-neutral-500"
              >
                Company
              </label>
              <input
                id="form-company"
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all hover-target"
                placeholder="Apple"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="form-budget"
              className="text-xs font-bold tracking-widest uppercase text-neutral-500"
            >
              Budget Scope
            </label>
            <select
              id="form-budget"
              defaultValue="50-100"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-neutral-300 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all hover-target appearance-none"
            >
              <option value="50-100" className="bg-[#0a0a0f]">
                $50k – $100k (MVP Acceleration)
              </option>
              <option value="100-250" className="bg-[#0a0a0f]">
                $100k – $250k (System Architecture)
              </option>
              <option value="250+" className="bg-[#0a0a0f]">
                $250k+ (Enterprise Overhaul)
              </option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="form-vision"
              className="text-xs font-bold tracking-widest uppercase text-neutral-500"
            >
              Project Vision
            </label>
            <textarea
              id="form-vision"
              required
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all hover-target resize-none"
              placeholder="We need to rethink our spatial computing ecosystem..."
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-white text-black font-bold tracking-widest uppercase py-5 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 hover-target flex items-center justify-center gap-3"
          >
            <Sparkles className="w-5 h-5" />
            Submit Inquiry
          </button>
        </form>
      </div>
    </div>
  );
}
