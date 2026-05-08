export function AnimatedGradientBackground() {
  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden bg-[#030305] animate-hue">
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/60 mix-blend-screen filter blur-[100px] md:blur-[140px] animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/50 mix-blend-screen filter blur-[100px] md:blur-[140px] animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-purple-600/50 mix-blend-screen filter blur-[100px] md:blur-[140px] animate-blob animation-delay-4000" />
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-emerald-600/40 mix-blend-screen filter blur-[80px] md:blur-[120px] animate-blob animation-delay-6000" />
      <div className="absolute inset-0 bg-[#030305]/10" />
    </div>
  );
}
