"use client";

import { Reveal } from "@/components/ui/Reveal";

/**
 * Velocity Gap interlude. Punchy urgency block borrowed from the
 * "AI Gap is Widening" pattern on builders-secrets, translated to
 * Phil's voice and stack.
 *
 * Structure:
 *   - Monumental two-line headline ("THE SHIPPING / GAP IS WIDENING.")
 *     bold, tight tracking, white with a single accent word in IBM blue.
 *   - One-sentence body that names the cost of staying slow.
 *   - "I SHIP WITH" eyebrow + horizontal row of EIGHT tool glyphs Phil
 *     actually runs end-to-end on every engagement: analog (Pen and
 *     Paper, Whiteboard), design (Figma, Miro), AI engineering (Claude
 *     Code, Codex, Gemini), delivery (Jira).
 *
 * Visual treatment:
 *   - Sits on a soft dark surface so the typography pops against the
 *     ambient orbs without going pure black. Wide top/bottom fade so
 *     no edge is visible.
 *   - 1180px max width matches the reading-friendly grid pattern used
 *     by builders-secrets; tighter than the rest of the page so the
 *     copy feels deliberate, not flat-bento.
 *   - All eight glyphs are simple geometric SVGs drawn inline (no
 *     third-party logos). Each fades to IBM blue on hover.
 *
 * Position in page.tsx: between Hero and Clients (01) so it lands as
 * an immediate "why care" hit right after the hero promise.
 */

type Tool = {
  name: string;
  glyph: React.ReactNode;
};

/**
 * Tool glyphs. Each is a 22x22 SVG drawn as a stylized geometric mark
 * that evokes the tool without reproducing its logo. currentColor is
 * used for stroke/fill so the hover-state color shift propagates.
 */
// Order: lead with the primary daily ship-tools (design + AI), then
// the ideation toolchain (Miro / Pen & Paper / Whiteboard), close
// with delivery (Jira). Reflects Phil's actual day-in-the-life
// sequence: design surface -> AI engineering -> support / sync ->
// ship tracking.
const TOOLS: Tool[] = [
  {
    name: "Figma",
    glyph: (
      // Three rounded rectangles stacked vertically, evoking Figma's
      // signature stack-of-circles silhouette.
      <svg viewBox="0 0 22 22" fill="none">
        <rect x="6" y="3" width="7" height="5" rx="2.5" fill="currentColor" />
        <rect x="6" y="8.5" width="7" height="5" rx="2.5" fill="currentColor" />
        <circle cx="13.5" cy="16.5" r="2.5" fill="currentColor" />
        <rect x="6" y="14" width="5" height="5" rx="2.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Claude Code",
    glyph: (
      // Eight-point starburst evoking Anthropic / Claude's signature mark.
      <svg viewBox="0 0 22 22" fill="currentColor">
        <path d="M11 1 L12.2 9.8 L21 11 L12.2 12.2 L11 21 L9.8 12.2 L1 11 L9.8 9.8 Z" />
      </svg>
    ),
  },
  {
    name: "Codex",
    glyph: (
      // Angle brackets, the universal "code" glyph.
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="8 5 3 11 8 17" />
        <polyline points="14 5 19 11 14 17" />
      </svg>
    ),
  },
  {
    name: "Gemini",
    glyph: (
      // Four-point star (Gemini's signature blade-of-light shape).
      <svg viewBox="0 0 22 22" fill="currentColor">
        <path d="M11 1 C11.2 6 13 8.8 18 9.5 C13 10.2 11.2 13 11 18 C10.8 13 9 10.2 4 9.5 C9 8.8 10.8 6 11 1 Z" />
        <path d="M11 11 C11.1 17 12.5 19.5 16 20 C12.5 20.5 11.1 22 11 22 C10.9 22 9.5 20.5 6 20 C9.5 19.5 10.9 17 11 11 Z" opacity="0" />
      </svg>
    ),
  },
  {
    name: "Miro",
    glyph: (
      // Four arcs / curved bars (the Miro signature "M" of curves).
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M5 17 L5 5 L8 12 L8 17" strokeLinejoin="miter" strokeLinecap="round" />
        <path d="M11 17 L11 5 L14 12 L14 17" strokeLinejoin="miter" strokeLinecap="round" />
        <path d="M17 17 L17 9" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Pen & Paper",
    glyph: (
      // A pen tip nib above a horizontal page line.
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13 L11 3 L17 13 L11 16 Z" fill="currentColor" />
        <line x1="3" y1="19" x2="19" y2="19" />
      </svg>
    ),
  },
  {
    name: "Whiteboard",
    glyph: (
      // A bordered rectangle with a 2x2 grid inside.
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="16" height="12" rx="1.5" />
        <line x1="11" y1="4" x2="11" y2="16" />
        <line x1="3" y1="10" x2="19" y2="10" />
        <line x1="8" y1="16" x2="8" y2="19" strokeLinecap="round" />
        <line x1="14" y1="16" x2="14" y2="19" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Jira",
    glyph: (
      // Three nested chevrons / diamonds, evoking Jira's logo shape.
      <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M11 2 L18 9 L11 9 Z" fill="currentColor" />
        <path d="M11 9 L18 16 L11 16 Z" fill="currentColor" opacity="0.7" />
        <path d="M4 16 L11 9 L11 16 Z" fill="currentColor" opacity="0.45" />
      </svg>
    ),
  },
];

export function VelocityGap() {
  return (
    <section
      id="velocity"
      // Padding tightened: previous py-32 md:py-44 was leaving a huge
      // black gap between the tool row and the next section's
      // headline (Aphorism's "Shipped is truth."). The block is a
      // punchy 3-element composition (headline + body + tool row) so
      // it doesn't need monumental top/bottom air. pt slightly bigger
      // than pb so the headline still feels intentionally arrived at;
      // pb-16 lets the Aphorism's own top air absorb the rest.
      className="relative z-10 pt-24 md:pt-32 pb-16 md:pb-20 px-6 md:px-12 lg:px-24 overflow-hidden"
      style={{
        // Soft dark band. Top fade tightened to 6% (was 20%) so the
        // dark surface starts immediately after the universal section
        // divider hairline at top:0. The earlier 20% fade-in let the
        // page bg orbs bleed through the top of the section, which
        // read as a stray fluid blob right beneath the divider.
        // Bottom fade kept wide for a soft handoff to the Aphorism.
        background:
          "linear-gradient(180deg, rgba(2,2,5,0) 0%, rgba(2,2,5,0.72) 6%, rgba(2,2,5,0.72) 80%, rgba(2,2,5,0) 100%)",
      }}
    >
      {/* Soft IBM-blue glow behind the headline for depth. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[50vh] rounded-full bg-[#0f62fe]/[0.06] blur-[140px]"
      />

      {/* Reading-friendly grid width (1180px max), tighter than the
          rest of the homepage so the headline + body land as one
          deliberate block. */}
      <div className="relative z-10 max-w-[1400px] mx-auto text-center">
        <Reveal>
          <span className="eyebrow-scroll font-mono text-[11px] md:text-xs font-medium tracking-[0.32em] uppercase text-zinc-400">
            <span className="text-[#4589ff] mr-3">·</span>
            The Stack
          </span>
        </Reveal>

        <Reveal delay={120}>
          <h2 className="headline-scroll mt-8 md:mt-10 text-5xl md:text-7xl lg:text-[8rem] font-black tracking-[-0.02em] leading-[0.92] uppercase text-white">
            The Shipping Gap
            <br />
            <span className="text-[#4589ff] drop-shadow-[0_0_30px_rgba(15,98,254,0.35)]">
              Is Widening.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-10 md:mt-14 mx-auto max-w-2xl text-lg md:text-xl text-zinc-300 font-light leading-relaxed">
            Every quarter your team spends in discovery slides, another team is
            shipping the next iteration into production. The window to be
            early is closing,{" "}
            <span className="text-white font-medium">
              and the stack to close it isn&apos;t optional anymore.
            </span>
          </p>
        </Reveal>

        {/* Tool row label */}
        <Reveal delay={360}>
          <div className="mt-16 md:mt-24 relative">
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
            />
            <span className="relative inline-block bg-[#0a0a0c] px-6 font-mono text-[11px] md:text-xs font-medium tracking-[0.32em] uppercase text-zinc-400">
              I Ship With
            </span>
          </div>
        </Reveal>

        {/* Tool row. Strictly ONE LINE for all 8 tools:
              - lg+: flex-nowrap + justify-between spreads the eight
                entries across the full 1180px container width.
              - md/sm: horizontal scroll via overflow-x-auto on a
                wrapper that breaks out of the section padding so the
                row can scroll edge-to-edge of the viewport without
                cutting off the first / last entry. Scrollbar hidden
                visually (still keyboard-accessible).
            Each glyph + label is a hover target that shifts to IBM
            blue on hover. shrink-0 on each item prevents flexbox
            compression below the natural width. */}
        <Reveal delay={480}>
          <div className="mt-10 md:mt-14 -mx-6 md:mx-0 px-6 md:px-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="flex flex-nowrap items-center justify-between gap-x-5 md:gap-x-6 min-w-max md:min-w-0">
              {TOOLS.map((tool) => (
                <li
                  key={tool.name}
                  className="group shrink-0 flex items-center gap-2.5 text-zinc-300 transition-colors duration-500 ease-[var(--ease-out)] hover:text-[#4589ff]"
                >
                  <span className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(15,98,254,0.55)]">
                    {tool.glyph}
                  </span>
                  <span className="font-mono text-xs md:text-sm font-medium tracking-[0.02em] whitespace-nowrap">
                    {tool.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
