export function AnimatedGradientBackground() {
  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden bg-[#0a0a0c]">
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#0f62fe]/20 mix-blend-screen filter blur-[100px] md:blur-[140px] animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#0f62fe]/12 mix-blend-screen filter blur-[100px] md:blur-[140px] animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-[#0f62fe]/8 mix-blend-screen filter blur-[100px] md:blur-[140px] animate-blob animation-delay-4000" />
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-white/4 mix-blend-screen filter blur-[80px] md:blur-[120px] animate-blob animation-delay-6000" />
      <div className="absolute inset-0 bg-[#0a0a0c]/20" />
    </div>
  );
}
