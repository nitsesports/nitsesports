import { useEffect, useState, useRef } from "react";
// Aapka logo import path:
import defaultLogo from "../assets/logoo.png";

/**
 * NITS Esports — Premium Cyber Loading Screen
 * @param {Function} onComplete - Callback function called when loading finishes
 * @param {Function} onLoadingComplete - Alternate prop for App.jsx compatibility
 * @param {string} logoSrc - Optional custom logo path (defaults to logoo.png)
 * @param {number} minDuration - Minimum loading duration in ms (default: 3200ms)
 */
const LoadingScreen = ({
  onComplete,
  onLoadingComplete,
  logoSrc = defaultLogo,
  minDuration = 3200,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const particlesRef = useRef(null);

  const statusMessages = [
    "INITIALIZING COMBAT ENGINE...",
    "CALIBRATING SHADER PIPELINE...",
    "SYNCING TO NIT SILCHAR GRID...",
    "ESTABLISHING PROTOCOL...",
    "LOADING THE ARENA...",
    "ARENA READY // ENTERING",
  ];

  // =========================================================
  // BUTTERY SMOOTH 60FPS PROGRESS ENGINE
  // =========================================================
  useEffect(() => {
    let animId;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const raw = Math.min(1, elapsed / minDuration);

      // Smooth custom esports easing curve
      let eased;
      if (raw < 0.55) {
        eased = (raw / 0.55) * 68;
      } else if (raw < 0.82) {
        const sub = (raw - 0.55) / 0.27;
        eased = 68 + sub * 18;
      } else {
        const sub = (raw - 0.82) / 0.18;
        eased = 86 + (1 - Math.pow(1 - sub, 2)) * 14;
      }

      const currentVal = Math.min(100, eased);
      setProgress(currentVal);

      if (raw < 1) {
        animId = requestAnimationFrame(update);
      } else {
        setProgress(100);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            const finish = onComplete || onLoadingComplete;
            if (finish) finish();
          }, 700);
        }, 350);
      }
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [minDuration, onComplete, onLoadingComplete]);

  // Update status messages according to progress percentage
  useEffect(() => {
    if (progress < 20) setStatusIndex(0);
    else if (progress < 42) setStatusIndex(1);
    else if (progress < 65) setStatusIndex(2);
    else if (progress < 85) setStatusIndex(3);
    else if (progress < 100) setStatusIndex(4);
    else setStatusIndex(5);
  }, [progress]);

  // =========================================================
  // SUBTLE AMBIENT PARTICLES (CANVAS)
  // =========================================================
  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrame;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.2 + 0.4,
      vy: -(Math.random() * 0.45 + 0.15),
      vx: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.55 + 0.15,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";

      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-[#030305] text-white select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isExiting
          ? "scale-105 opacity-0 blur-md pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

        .loader-samurai {
          font-family: 'The Last Shuriken', sans-serif;
        }

        .loader-sans {
          font-family: 'Inter', sans-serif;
        }

        /* =========================================================
           CIRCULAR ROTATING PORTAL ANIMATIONS (AROUND LOGO)
        ========================================================= */
        @keyframes portalSpinCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes portalSpinCCW {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        .portal-spin-cw {
          animation: portalSpinCW 18s linear infinite;
          will-change: transform;
        }

        .portal-spin-ccw {
          animation: portalSpinCCW 11s linear infinite;
          will-change: transform;
        }

        .portal-spin-cw-slow {
          animation: portalSpinCW 26s linear infinite;
          will-change: transform;
        }

        /* =========================================================
           FAST DIAGONAL CHROME SHINE SWEEP (135 DEGREE)
           Applies directly on the image clone — ZERO background leak!
        ========================================================= */
        @keyframes diagonalShineSweep {
          0% {
            -webkit-mask-position: 0% 0%;
            mask-position: 0% 0%;
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            -webkit-mask-position: 100% 100%;
            mask-position: 100% 100%;
            opacity: 0;
          }
        }

        /* 1. Main Diagonal Metallic Glow */
        .shine-logo-clone {
          filter: brightness(3.2) drop-shadow(0 0 10px rgba(255, 255, 255, 0.95));
          mix-blend-mode: screen;
          -webkit-mask-image: linear-gradient(
            135deg,
            transparent 0%,
            transparent 42%,
            rgba(0, 0, 0, 1) 48%,
            rgba(0, 0, 0, 1) 52%,
            transparent 58%,
            transparent 100%
          );
          mask-image: linear-gradient(
            135deg,
            transparent 0%,
            transparent 42%,
            rgba(0, 0, 0, 1) 48%,
            rgba(0, 0, 0, 1) 52%,
            transparent 58%,
            transparent 100%
          );
          -webkit-mask-size: 270% 270%;
          mask-size: 270% 270%;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          animation: diagonalShineSweep 1.6s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          will-change: mask-position, -webkit-mask-position;
        }

        /* 2. Razor-Sharp Center Glint Line */
        .shine-logo-glint {
          filter: brightness(4.5) drop-shadow(0 0 6px #ffffff);
          mix-blend-mode: screen;
          -webkit-mask-image: linear-gradient(
            135deg,
            transparent 0%,
            transparent 47%,
            rgba(0, 0, 0, 1) 49.5%,
            rgba(0, 0, 0, 1) 50.5%,
            transparent 53%,
            transparent 100%
          );
          mask-image: linear-gradient(
            135deg,
            transparent 0%,
            transparent 47%,
            rgba(0, 0, 0, 1) 49.5%,
            rgba(0, 0, 0, 1) 50.5%,
            transparent 53%,
            transparent 100%
          );
          -webkit-mask-size: 270% 270%;
          mask-size: 270% 270%;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          animation: diagonalShineSweep 1.6s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          will-change: mask-position, -webkit-mask-position;
        }

        /* Subtle Breathing Pulse */
        @keyframes logoPulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 22px rgba(255, 255, 255, 0.20));
          }
          50% {
            transform: scale(1.02);
            filter: drop-shadow(0 0 42px rgba(255, 255, 255, 0.38))
                    drop-shadow(0 0 15px rgba(255, 255, 255, 0.60));
          }
        }

        .logo-pulse-box {
          animation: logoPulse 3.2s ease-in-out infinite;
        }

        /* Scanline Texture */
        .scanlines {
          background: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 3px,
            rgba(255, 255, 255, 0.02) 4px
          );
        }
      `}</style>

      {/* AMBIENT BACKGROUND LAYERS */}
      <canvas ref={particlesRef} className="pointer-events-none absolute inset-0 z-0 opacity-70" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_65%)]" />
      <div className="scanlines pointer-events-none absolute inset-0 z-0" />

      {/* PERSPECTIVE CYBER GRID */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:60px_60px]" />

      {/* TOP HUD TELEMETRY */}
      <div className="loader-sans absolute top-6 left-6 right-6 flex items-center justify-between text-[8px] sm:text-[9px] tracking-[0.35em] text-white/40 uppercase">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-ping" />
          <span>SYS.CONNECT // NIT SILCHAR</span>
        </div>
        <div className="hidden sm:block">
          SECURE SIMULATION // V.2.6
        </div>
      </div>

      {/* =====================================================
          MAIN CENTRAL CONTENT (BALANCED COMPACT LAYOUT)
         ===================================================== */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full">
        
        {/* LOGO CONTAINER */}
        <div className="relative flex items-center justify-center">

          {/* =====================================================
              SMALL CIRCULAR ROTATING PORTAL (ONLY AROUND THE LOGO)
             ===================================================== */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square w-[116%] sm:w-[114%] max-w-[390px] flex items-center justify-center">
            
            {/* 1. Core Portal Glow */}
            <div className="absolute inset-0 rounded-full bg-white/[0.035] blur-md shadow-[0_0_25px_rgba(255,255,255,0.08)_inset]" />

            {/* 2. Outer Rotating Dashed Cyber Ring (Clockwise) */}
            <div className="portal-spin-cw absolute inset-0 rounded-full border border-dashed border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.15)]" />

            {/* 3. Middle High-Tech Accent Ring with Diamond Nodes (Counter-Clockwise) */}
            <div className="portal-spin-ccw absolute inset-[6px] sm:inset-[8px] rounded-full border border-white/15">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rotate-45 bg-white shadow-[0_0_8px_#ffffff]" />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rotate-45 bg-white/70" />
              <span className="absolute top-1/2 -left-1 -translate-y-1/2 h-1.5 w-1.5 rotate-45 bg-white/70" />
              <span className="absolute top-1/2 -right-1 -translate-y-1/2 h-1.5 w-1.5 rotate-45 bg-white/70" />
            </div>

            {/* 4. Fine Dotted Inner Track (Slow Clockwise) */}
            <div className="portal-spin-cw-slow absolute inset-[14px] sm:inset-[16px] rounded-full border border-dotted border-white/20" />
          </div>
          
          {/* Logo Pulse Wrapper */}
          <div className="logo-pulse-box relative flex items-center justify-center">
            
            {/* 1. Base Logo */}
            <img
              src={logoSrc}
              alt="NITS Esports"
              className="relative z-10 w-56 sm:w-72 md:w-80 lg:w-96 max-w-[82vw] h-auto object-contain block select-none"
              draggable="false"
            />

            {/* 2. Metallic Diagonal Shine Layer (100% on-logo only) */}
            <img
              src={logoSrc}
              alt=""
              aria-hidden="true"
              className="shine-logo-clone absolute inset-0 z-20 w-full h-full object-contain pointer-events-none select-none"
              draggable="false"
            />

            {/* 3. Razor-Sharp Diagonal Chrome Glint */}
            <img
              src={logoSrc}
              alt=""
              aria-hidden="true"
              className="shine-logo-glint absolute inset-0 z-25 w-full h-full object-contain pointer-events-none select-none"
              draggable="false"
            />

          </div>
        </div>

        {/* =====================================================
            LOADING THE ARENA — TEXT & TELEMETRY
           ===================================================== */}
        <div className="mt-4 sm:mt-5 flex flex-col items-center text-center">
          
          {/* MAIN HEADING: "LOADING THE ARENA" */}
          <div className="loader-samurai flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-bold tracking-[0.25em] text-white">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-white/70" />
            <span className="drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]">
              LOADING THE ARENA
            </span>
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-white/70" />
          </div>

          {/* DYNAMIC SUBSURFACE STATUS */}
          <div className="loader-sans mt-2 h-4 flex items-center justify-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-white/55">
            <span className="inline-block h-1 w-1 rounded-full bg-white/70 animate-pulse" />
            <span>{statusMessages[statusIndex]}</span>
          </div>

          {/* =====================================================
              TACTICAL SILKY-SMOOTH PROGRESS BAR (UNCHANGED POSITION)
             ===================================================== */}
          <div className="mt-4 sm:mt-5 w-[280px] sm:w-[340px] md:w-[400px]">
            
            {/* Top Bar Indicators */}
            <div className="loader-sans mb-1.5 flex items-center justify-between text-[9px] font-semibold tracking-[0.20em] text-white/50">
              <span>SYNCING PROTOCOL</span>
              <span className="text-white font-mono text-[11px] font-bold drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">
                {String(Math.floor(progress)).padStart(2, "0")}%
              </span>
            </div>

            {/* Outer Progress Track */}
            <div className="relative h-2.5 w-full rounded-sm border border-white/20 bg-black/60 p-[2px] shadow-[0_0_15px_rgba(0,0,0,0.8)]">
              {/* Inner Glowing Fill Bar */}
              <div
                className="relative h-full rounded-[1px] bg-gradient-to-r from-white/40 via-white/80 to-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                style={{
                  width: `${progress}%`,
                  transition: "width 0.05s linear",
                }}
              >
                {/* Leading Edge Spark */}
                <div className="absolute top-0 right-0 h-full w-2 bg-white shadow-[0_0_8px_#ffffff]" />
              </div>
            </div>

            {/* Segmented Ticks underneath */}
            <div className="mt-1 flex justify-between px-0.5 opacity-30">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-px ${
                    (progress / 100) * 14 >= i ? "bg-white opacity-100" : "bg-white/40"
                  }`}
                />
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* BOTTOM FOOTER TELEMETRY */}
      <div className="loader-sans absolute bottom-5 text-center text-[7.5px] uppercase tracking-[0.40em] text-white/30">
        NIT SILCHAR OFFICIAL ESPORTS // ALL RIGHTS RESERVED
      </div>
    </div>
  );
};

export default LoadingScreen;