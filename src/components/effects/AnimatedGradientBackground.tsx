/**
 * Ambient page backdrop. Carbon Black base + 4 animated orbs
 * (IBM Blue + Emerald). The TOP HALF is bright and colorful so the
 * Hero feels alive; the bottom half is softer ambient drift for
 * reading sections. Reading sections that need additional calm apply
 * their own local darkening (bg-black/xx) over the orbs.
 */
export function AnimatedGradientBackground() {
  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden bg-[#0a0a0c]">
      {/* Top-left + top-right orbs are the Hero's color source.
          Pushed to 28% blue / 22% emerald so the Hero center reads
          as a living, moody surface, not a flat dark plane. */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#0f62fe]/28 mix-blend-screen filter blur-[110px] md:blur-[150px] animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#10b981]/22 mix-blend-screen filter blur-[110px] md:blur-[150px] animate-blob animation-delay-2000" />
      {/* Bottom orbs softer so reading sections stay calm. */}
      <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-[#0f62fe]/10 mix-blend-screen filter blur-[120px] md:blur-[160px] animate-blob animation-delay-4000" />
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#10b981]/11 mix-blend-screen filter blur-[100px] md:blur-[140px] animate-blob animation-delay-6000" />
      {/* Very light base flatten - just enough to soften pure orb
          peaks. Removed the previous global vignette that was double-
          dimming the Hero center. Reading sections add their own
          darker bgs over this layer when they need calm. */}
      <div className="absolute inset-0 bg-[#0a0a0c]/10" />
    </div>
  );
}
