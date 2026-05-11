/**
 * Ambient page backdrop. Carbon Black base with 4 soft animated orbs
 * (IBM Blue + Emerald). Halved intensity vs. earlier passes so the
 * site reads as calm dark MOST of the time, with the orbs working as
 * background ambient color (not as a competing surface). Focal
 * colorful moments (Hero giant headline, Trusted By marquee, PullQuote,
 * AI Lab gradient mesh) carry the accent character; this layer just
 * tints the deep background.
 */
export function AnimatedGradientBackground() {
  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden bg-[#0a0a0c]">
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#0f62fe]/10 mix-blend-screen filter blur-[120px] md:blur-[160px] animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#10b981]/7 mix-blend-screen filter blur-[120px] md:blur-[160px] animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-[#0f62fe]/5 mix-blend-screen filter blur-[120px] md:blur-[160px] animate-blob animation-delay-4000" />
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#10b981]/6 mix-blend-screen filter blur-[100px] md:blur-[140px] animate-blob animation-delay-6000" />
      {/* Stronger base flatten so the orbs sit behind a deeper bg. */}
      <div className="absolute inset-0 bg-[#0a0a0c]/35" />
    </div>
  );
}
