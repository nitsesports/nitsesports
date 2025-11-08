import { useRef, useEffect } from "react";

export default function PlexusBackground() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let dpr = window.devicePixelRatio || 1;

    const colors = ["#00e5ff", "#9b5cff", "#ff5caa"];
    const MIN_PARTICLES_DESKTOP = 160;
    const MIN_PARTICLES_MOBILE = 80;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    let LINK_DISTANCE = 200;
    let particles = [];

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isMobile = width < 768 || window.matchMedia('(pointer: coarse)').matches;

      const area = Math.max(1, width * height);
      const base = isMobile ? 8000 : 4000; 
      const calculated = Math.floor(area / base);
      const particleCount = Math.max(isMobile ? MIN_PARTICLES_MOBILE : MIN_PARTICLES_DESKTOP, calculated);

      LINK_DISTANCE = isMobile ? 120 : 220;

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (isMobile ? 0.4 : 0.6),
          vy: (Math.random() - 0.5) * (isMobile ? 0.4 : 0.6),
          r: (isMobile ? 1 : 1) + Math.random() * (isMobile ? 2 : 3),
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DISTANCE) {
            const alpha = 1 - dist / LINK_DISTANCE;
            ctx.beginPath();
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = alpha * 0.14; 
            ctx.lineWidth = 1.0;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.42; 
        ctx.shadowBlur = 2; 
        ctx.shadowColor = p.color;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function step() {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > height) { p.y = height; p.vy *= -1; }
      }

      draw();
      rafRef.current = requestAnimationFrame(step);
    }

    resize();
    rafRef.current = requestAnimationFrame(step);

    let resizeTimer = null;
    function onResizeDebounced() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
      }, 120);
    }

    window.addEventListener("resize", onResizeDebounced);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResizeDebounced);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="tsparticles"
      className="fixed inset-0 -z-20 pointer-events-none opacity-80"
      aria-hidden="true"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
