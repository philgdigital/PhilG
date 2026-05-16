/**
 * TrustRow — the Fortune-500 "trusted-by" wordmark row.
 *
 * Shared component used by the homepage Hero AND the CV page so
 * the brand strip reads identically across surfaces. Each entry
 * is a brand-approximate wordmark in the brand's signature
 * typography + accent colour, paired with a small geometric
 * accent mark where appropriate (sparkle for Walmart, 4-colour
 * square for Microsoft, roundel for the RAF, etc.).
 *
 * None of these reproduce a trademarked logo file — they're
 * editorial typographic homages.
 *
 * Props let the host page tweak the eyebrow ("Trusted by" on
 * Hero, "Delivered for" on the CV) and the top margin without
 * forking the markup.
 */

type Props = {
  /** Label above the wordmark strip. Defaults to "Trusted by". */
  eyebrow?: string;
  /** Optional class applied to the root wrapper. Lets host pages
   *  control spacing without reaching inside. */
  className?: string;
};

export function TrustRow({
  eyebrow = "Trusted by",
  className = "",
}: Props) {
  return (
    <div className={`flex flex-col gap-5 md:gap-7 ${className}`}>
      <p className="font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-zinc-400 whitespace-nowrap">
        {eyebrow}
      </p>
      {/* Desktop: flex-nowrap + justify-between spreads the ten
          entries edge-to-edge.  Mobile / tablet: flex-wrap with a
          small gap-x so entries wrap cleanly. */}
      <ul className="flex flex-wrap lg:flex-nowrap lg:justify-between items-center gap-x-5 md:gap-x-7 lg:gap-x-0 gap-y-4 md:gap-y-5 w-full">
        {/* WALMART: 6-ray sparkle. */}
        <li className="group flex items-center gap-1.5 cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
          <svg
            viewBox="0 0 20 20"
            aria-hidden
            className="w-[18px] h-[18px] shrink-0 text-[#ffc220] group-hover:drop-shadow-[0_0_8px_rgba(255,194,32,0.6)] transition-all duration-500"
          >
            {[0, 60, 120].map((deg) => (
              <rect
                key={deg}
                x="9.1"
                y="2"
                width="1.8"
                height="16"
                rx="0.9"
                fill="currentColor"
                transform={`rotate(${deg} 10 10)`}
              />
            ))}
          </svg>
          <span className="font-sans font-bold tracking-tight text-base md:text-lg text-[#0a8fff] group-hover:text-[#2da5ff] transition-colors duration-500">
            Walmart
          </span>
        </li>

        {/* VMWARE: italic two-tone wordmark. */}
        <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
          <span className="font-sans italic font-extrabold tracking-tight text-base md:text-lg text-zinc-200">
            vm
            <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors duration-500">
              ware
            </span>
          </span>
        </li>

        {/* PIVOTAL LABS: two-tone lime + grey. */}
        <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
          <span className="font-sans font-bold tracking-tight text-base md:text-lg text-[#82c63a] group-hover:text-[#a3df60] transition-colors duration-500">
            Pivotal
            <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors duration-500">
              {" "}
              Labs
            </span>
          </span>
        </li>

        {/* SAP: cyan-blue uppercase black. */}
        <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
          <span className="font-sans font-black uppercase tracking-[0.04em] text-base md:text-lg text-[#21a8ec] group-hover:text-[#4dbdf2] transition-colors duration-500">
            SAP
          </span>
        </li>

        {/* MICROSOFT: 2x2 four-colour square + light sans. */}
        <li className="group flex items-center gap-1.5 cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
          <svg viewBox="0 0 14 14" aria-hidden className="w-3.5 h-3.5 shrink-0">
            <rect x="0" y="0" width="6" height="6" fill="#f25022" />
            <rect x="8" y="0" width="6" height="6" fill="#7fba00" />
            <rect x="0" y="8" width="6" height="6" fill="#00a4ef" />
            <rect x="8" y="8" width="6" height="6" fill="#ffb900" />
          </svg>
          <span className="font-sans font-light tracking-tight text-base md:text-lg text-zinc-200">
            Microsoft
          </span>
        </li>

        {/* VODAFONE: red extra-bold wordmark. */}
        <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
          <span className="font-sans font-extrabold tracking-tight text-base md:text-lg text-[#ff2c2c] group-hover:text-[#ff5757] transition-colors duration-500">
            Vodafone
          </span>
        </li>

        {/* CEMEX: mid-blue uppercase black. */}
        <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
          <span className="font-sans font-black uppercase tracking-[0.05em] text-base md:text-lg text-[#2d8ce0] group-hover:text-[#5aa9eb] transition-colors duration-500">
            CEMEX
          </span>
        </li>

        {/* NESPRESSO: cream serif italic. */}
        <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
          <span className="font-serif italic font-light tracking-tight text-base md:text-lg text-[#e6d8c0] group-hover:text-[#f4e9d6] transition-colors duration-500">
            Nespresso
          </span>
        </li>

        {/* WWF / OpenSC: two-tone with WWF emphasized. */}
        <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
          <span className="font-sans font-bold tracking-tight text-base md:text-lg text-zinc-200">
            WWF
            <span className="text-zinc-500"> / OpenSC</span>
          </span>
        </li>

        {/* KUONI TUMLARE: two-tone semibold sans. */}
        <li className="group cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
          <span className="font-sans font-semibold tracking-tight text-base md:text-lg text-zinc-200">
            Kuoni
            <span className="text-zinc-400"> Tumlare</span>
          </span>
        </li>

        {/* ROYAL AIR FORCE: roundel + tracked mono. */}
        <li className="group flex items-center gap-1.5 cursor-default opacity-75 hover:opacity-100 transition-all duration-500 ease-[var(--ease-out)] hover:scale-[1.04] origin-left whitespace-nowrap">
          <svg viewBox="0 0 16 16" aria-hidden className="w-4 h-4 shrink-0">
            <circle cx="8" cy="8" r="7.5" fill="#1f4eaa" />
            <circle cx="8" cy="8" r="5" fill="#f4f4f5" />
            <circle cx="8" cy="8" r="2.5" fill="#c81f3a" />
          </svg>
          <span className="font-mono font-medium uppercase tracking-[0.18em] text-[10px] md:text-[11px] text-zinc-200">
            Royal Air Force
          </span>
        </li>
      </ul>
    </div>
  );
}
