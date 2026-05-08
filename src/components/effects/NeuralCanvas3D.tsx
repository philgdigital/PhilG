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

const NUM_PARTICLES = 120;
const FOV = 350;
const CONNECT_DIST = 250;
const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;

export function NeuralCanvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationId = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };
    const particles: Particle[] = [];

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      if (particles.length === 0) {
        for (let i = 0; i < NUM_PARTICLES; i++) {
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
      }
    };
    init();

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 150);
    };
    const onMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX - width / 2) * 0.5;
      targetMouse.y = (e.clientY - height / 2) * 0.5;
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(3, 3, 5, 0.2)";
      ctx.fillRect(0, 0, width, height);

      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05;

      ctx.lineWidth = 0.5;

      const halfW = width / 2;
      const halfH = height / 2;

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.z < -200) p.z = 1500;
        else if (p.z > 1500) p.z = -200;

        if (p.z <= -FOV) continue;

        const mouseFactor = p.z / 500;
        const dx = p.x - currentMouse.x * mouseFactor;
        const dy = p.y - currentMouse.y * mouseFactor;
        const scale = FOV / (FOV + p.z);
        const x2d = dx * scale + halfW;
        const y2d = dy * scale + halfH;
        const size2d = p.size * scale;

        ctx.beginPath();
        ctx.arc(x2d, y2d, size2d, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, scale * 1.5)})`;
        ctx.fill();

        // Connect to nearby particles. Compare squared distances to skip
        // sqrt for the >99% of pairs that won't connect anyway.
        for (let j = i + 1; j < NUM_PARTICLES; j++) {
          const p2 = particles[j];
          const ddx = p.x - p2.x;
          const ddy = p.y - p2.y;
          const ddz = p.z - p2.z;
          const distSq = ddx * ddx + ddy * ddy + ddz * ddz;
          if (distSq >= CONNECT_DIST_SQ) continue;

          const dist = Math.sqrt(distSq);
          const scale2 = FOV / (FOV + p2.z);
          const mouseFactor2 = p2.z / 500;
          const x2d2 =
            (p2.x - currentMouse.x * mouseFactor2) * scale2 + halfW;
          const y2d2 =
            (p2.y - currentMouse.y * mouseFactor2) * scale2 + halfH;

          ctx.beginPath();
          ctx.moveTo(x2d, y2d);
          ctx.lineTo(x2d2, y2d2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / CONNECT_DIST) * scale * 0.4})`;
          ctx.stroke();
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    const start = () => {
      if (animationId === 0) animationId = requestAnimationFrame(draw);
    };
    const stop = () => {
      if (animationId !== 0) {
        cancelAnimationFrame(animationId);
        animationId = 0;
      }
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
      if (resizeTimer) clearTimeout(resizeTimer);
      stop();
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
