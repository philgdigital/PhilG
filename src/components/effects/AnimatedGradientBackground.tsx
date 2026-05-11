/**
 * Ambient page backdrop. Carbon Black base + 4 animated orbs
 * (IBM Blue + Emerald). The TOP HALF is bright and colorful so the
 * Hero feels alive; the bottom half is softer ambient drift for
 * reading sections. Reading sections that need additional calm apply
 * their own local darkening (bg-black/xx) over the orbs.
 */
export function AnimatedGradientBackground() {
  return (
    <div
      className="fixed inset-0 z-[-2] overflow-hidden bg-[#0a0a0c]"
      // contain: paint isolates the gradient layer so its repaints
      // don't trigger layout work in the document above it. transform
      // creates a stacking context that promotes the whole layer to
      // its own composited surface, so the orb animations stay on
      // the GPU.
      style={{ contain: "paint", transform: "translateZ(0)" }}
    >
      {/* Each orb uses its own keyframe variant + duration so they
          never visually sync. Together they produce a continuously
          evolving gradient where every moment looks different. Top
          orbs at 28% blue / 22% emerald drive the Hero's color
          impact; bottom orbs softer for reading sections. */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#0f62fe]/28 mix-blend-screen filter blur-[100px] md:blur-[140px] animate-blob-a" />
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#10b981]/22 mix-blend-screen filter blur-[100px] md:blur-[140px] animate-blob-b" />
      <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-[#0f62fe]/10 mix-blend-screen filter blur-[110px] md:blur-[150px] animate-blob-c" />
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#10b981]/11 mix-blend-screen filter blur-[90px] md:blur-[120px] animate-blob-d" />
      <div className="absolute inset-0 bg-[#0a0a0c]/10" />
    </div>
  );
}
