"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

const subscribeFinePointer = (callback: () => void) => {
  if (typeof window === "undefined") return () => undefined;
  const mq = window.matchMedia(FINE_POINTER_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
};

const getFinePointerSnapshot = () =>
  typeof window === "undefined"
    ? false
    : window.matchMedia(FINE_POINTER_QUERY).matches;

const getFinePointerServerSnapshot = () => false;

const TRAIL_MAX_LENGTH = 14;
const TRAIL_LIFETIME_MS = 600;
const MIN_DISTANCE = 4; // px between recorded points

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot,
  );

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

    const draw = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const last = trail[trail.length - 1];
      if (
        mouseX > -100 &&
        (!last || Math.hypot(last.x - mouseX, last.y - mouseY) > MIN_DISTANCE)
      ) {
        trail.push({ x: mouseX, y: mouseY, t: now });
      }
      while (trail.length > TRAIL_MAX_LENGTH) trail.shift();
      // Drop expired points so the array doesn't keep stale data when idle.
      while (trail.length && now - trail[0].t > TRAIL_LIFETIME_MS) {
        trail.shift();
      }

      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const age = (now - p.t) / TRAIL_LIFETIME_MS;
        const alpha = Math.max(0, (1 - age) * 0.32);
        if (alpha <= 0) continue;
        const positional = i / Math.max(1, trail.length - 1); // 0 oldest -> 1 newest
        const radius = 1.2 + positional * 1.6;
        ctx.fillStyle = `rgba(244, 244, 245, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
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
