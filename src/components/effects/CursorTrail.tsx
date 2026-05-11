"use client";

import { useEffect, useRef } from "react";
import { useFinePointer } from "@/lib/hooks/use-fine-pointer";

const TRAIL_MAX_LENGTH = 8;
const TRAIL_LIFETIME_MS = 450;
const MIN_DISTANCE = 4; // px between recorded points
const MAX_OPACITY = 0.22;

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isFinePointer = useFinePointer();

  useEffect(() => {
    if (!isFinePointer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let raf = 0;
    let mouseX = -1000;
    let mouseY = -1000;
    type Point = { x: number; y: number; t: number };
    const trail: Point[] = [];

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Tracks whether the previous frame had visible trail content.
    // When transitioning from 'had content' to 'empty', we clear the
    // canvas one last time, then skip clearRect on subsequent frames
    // until there's new content to draw. Avoids a full-viewport
    // clearRect call every single frame when the cursor is idle.
    let hadContent = false;

    const draw = () => {
      const now = performance.now();

      const last = trail[trail.length - 1];
      if (
        mouseX > -100 &&
        (!last || Math.hypot(last.x - mouseX, last.y - mouseY) > MIN_DISTANCE)
      ) {
        trail.push({ x: mouseX, y: mouseY, t: now });
      }
      while (trail.length > TRAIL_MAX_LENGTH) trail.shift();
      while (trail.length && now - trail[0].t > TRAIL_LIFETIME_MS) {
        trail.shift();
      }

      const hasContent = trail.length > 0;
      // Skip work entirely when nothing changed last frame either.
      if (!hasContent && !hadContent) {
        raf = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const age = (now - p.t) / TRAIL_LIFETIME_MS;
        const alpha = Math.max(0, (1 - age) * MAX_OPACITY);
        if (alpha <= 0) continue;
        const positional = i / Math.max(1, trail.length - 1);
        const radius = 1.0 + positional * 1.2;
        ctx.fillStyle = `rgba(244, 244, 245, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      hadContent = hasContent;
      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (raf === 0) raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isFinePointer]);

  if (!isFinePointer) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[98] pointer-events-none"
      aria-hidden
    />
  );
}

export default CursorTrail;
