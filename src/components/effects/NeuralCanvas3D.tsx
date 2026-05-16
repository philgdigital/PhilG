"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
};

export function NeuralCanvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reduced-motion users get a static empty canvas (no rAF loop at
    // all). Faster, calmer, respects WCAG 2.3.3.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let width = 0;
    let height = 0;
    let animationId = 0;

    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };

    // Particle count drop from 120 → 60. The connection loop is
    // O(n²) so this halves the per-frame distance checks from
    // ~7,200 worst-case down to ~1,800. Visual density still
    // reads as "neural network" rather than sparse points.
    const numParticles = 60;
    let particles: Particle[] = [];
    const fov = 350;

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: (Math.random() - 0.5) * width * 3,
          y: (Math.random() - 0.5) * height * 3,
          z: Math.random() * 1500,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          vz: (Math.random() - 0.5) * 2,
          size: Math.random() * 2 + 1,
        });
      }
    };
    init();

    const onResize = () => init();
    const onMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX - width / 2) * 0.5;
      targetMouse.y = (e.clientY - height / 2) * 0.5;
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);

    // Pause the rAF loop when the tab is hidden — same pattern
    // CursorTrail uses. Without this the canvas burns CPU/battery
    // in background tabs, with no visible benefit.
    let paused = false;
    const onVisibilityChange = () => {
      if (document.hidden) {
        paused = true;
        if (animationId) cancelAnimationFrame(animationId);
        animationId = 0;
      } else if (paused) {
        paused = false;
        animationId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(3, 3, 5, 0.2)";
      ctx.fillRect(0, 0, width, height);

      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05;

      ctx.lineWidth = 0.5;

      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.z < -200) p.z = 1500;
        if (p.z > 1500) p.z = -200;

        const dx = p.x - currentMouse.x * (p.z / 500);
        const dy = p.y - currentMouse.y * (p.z / 500);

        const scale = fov / (fov + p.z);
        const x2d = dx * scale + width / 2;
        const y2d = dy * scale + height / 2;
        const size2d = p.size * scale;

        if (p.z > -fov) {
          ctx.beginPath();
          ctx.arc(x2d, y2d, size2d, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, scale * 1.5)})`;
          ctx.fill();

          for (let j = i + 1; j < numParticles; j++) {
            const p2 = particles[j];
            const dist = Math.sqrt(
              Math.pow(p.x - p2.x, 2) +
                Math.pow(p.y - p2.y, 2) +
                Math.pow(p.z - p2.z, 2),
            );

            if (dist < 250) {
              const scale2 = fov / (fov + p2.z);
              const x2d_2 =
                (p2.x - currentMouse.x * (p2.z / 500)) * scale2 + width / 2;
              const y2d_2 =
                (p2.y - currentMouse.y * (p2.z / 500)) * scale2 + height / 2;

              ctx.beginPath();
              ctx.moveTo(x2d, y2d);
              ctx.lineTo(x2d_2, y2d_2);
              ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 250) * scale * 0.4})`;
              ctx.stroke();
            }
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      aria-hidden
    />
  );
}

export default NeuralCanvas3D;
