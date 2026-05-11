/**
 * Ambient page backdrop. Carbon Black base with 4 animated orbs
 * (IBM Blue + Emerald). Balanced opacities: strong enough that the
 * Hero feels alive and the page reads as 'considered moody' rather
 * than flat dark, but soft enough that text content reads cleanly.
 * Two stronger orbs anchored to the top half so the Hero gets the
 * most impact; two weaker orbs anchored to the bottom for ambient
 * drift through the rest of the page.
 */
export function AnimatedGradientBackground() {
  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden bg-[#0a0a0c]">
      {/* Top-left + top-right orbs are the Hero's color source. */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#0f62fe]/18 mix-blend-screen filter blur-[110px] md:blur-[150px] animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#10b981]/14 mix-blend-screen filter blur-[110px] md:blur-[150px] animate-blob animation-delay-2000" />
      {/* Bottom orbs are softer so reading sections stay calm. */}
      <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-[#0f62fe]/8 mix-blend-screen filter blur-[120px] md:blur-[160px] animate-blob animation-delay-4000" />
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#10b981]/9 mix-blend-screen filter blur-[100px] md:blur-[140px] animate-blob animation-delay-6000" />
      {/* Light base flatten to soften pure orb peaks; reading text
          still gets enough Carbon Black behind it for AA contrast. */}
      <div className="absolute inset-0 bg-[#0a0a0c]/20" />
    </div>
  );
}
