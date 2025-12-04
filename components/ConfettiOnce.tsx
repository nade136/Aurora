"use client";

import { useEffect, useRef } from "react";

export default function ConfettiOnce({ duration = 1500 }: { duration?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const colors = ["#D4AF37", "#ffd166", "#06d6a0", "#ef476f", "#118ab2"];

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; color: string; life: number };
    const parts: Particle[] = [];
    const count = Math.min(160, Math.floor((width + height) / 20));
    for (let i = 0; i < count; i++) {
      parts.push({
        x: width * Math.random(),
        y: -20 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 6,
        vy: 3 + Math.random() * 3,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      });
    }

    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const elapsed = t - start;
      ctx.clearRect(0, 0, width, height);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.life -= 0.008;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.x + p.y) * 0.02);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    const cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      // clear canvas and hide overlay container
      ctx.clearRect(0, 0, width, height);
      const parent = canvas.parentElement as HTMLElement | null;
      if (parent) {
        parent.style.pointerEvents = "none";
        parent.style.display = "none";
      }
    };

    const timeout = window.setTimeout(cleanup, duration + 300);
    return () => {
      cleanup();
      clearTimeout(timeout);
    };
  }, [duration]);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }} aria-hidden>
      <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
