import { useEffect, useState, useRef } from "react";

import { useLocation } from "react-router-dom";

// Aapke logo import paths:

import defaultLogo from "../assets/logoo.png";

import battleblazeLogo from "../assets/logoo2.png";

/**

 * NITS Esports — Dynamic Cyber Loading Screen (Supports Standard & BattleBlaze modes)

 */

const LoadingScreen = ({

  onComplete,

  onLoadingComplete,

  minDuration = 3200,

}) => {

  const [progress, setProgress] = useState(0);

  const [statusIndex, setStatusIndex] = useState(0);

  const [isExiting, setIsExiting] = useState(false);

  const particlesRef = useRef(null);

  const location = useLocation();

  // Use the BattleBlaze loading screen on BattleBlaze, registration, PS5 Rush,
  // and all common Admin Panel routes.
  const currentPath = location.pathname.replace(/\/+$/, "").toLowerCase() || "/";

  const isAdminPanelMode =
    currentPath === "/admin" ||
    currentPath.startsWith("/admin/") ||
    currentPath === "/adminpanel" ||
    currentPath.startsWith("/adminpanel/") ||
    currentPath === "/admin-panel" ||
    currentPath.startsWith("/admin-panel/") ||
    currentPath === "/admin/panel";

  const isBattleblazeMode =
    currentPath.includes("battleblaze") ||
    currentPath === "/bbschedule" ||
    currentPath.startsWith("/bbschedule/") ||
    currentPath.includes("register") ||
    currentPath.includes("ps5-rush") ||
    currentPath.includes("ps5rush") ||
    currentPath === "/results" ||
    currentPath.startsWith("/results/") ||
    isAdminPanelMode;

  const logoSrc = isBattleblazeMode ? battleblazeLogo : defaultLogo;

  const statusMessages = isBattleblazeMode

    ? [

        "INITIALIZING BATTLEBLAZE ARENA...",

        "SYNCING ESPORTS TOURNAMENT GRID...",

        "LOADING SQUAD MODULES...",

        "ESTABLISHING SECURE CONNECTION...",

        "ARENA READY // ENTERING",

      ]

    : [

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

    const maxIdx = statusMessages.length - 1;

    const idx = Math.min(

      maxIdx,

      Math.floor((progress / 100) * (maxIdx + 1))

    );

    setStatusIndex(idx);

  }, [progress, statusMessages.length]);

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

      ctx.fillStyle = isBattleblazeMode ? "#c4b5fd" : "#ffffff";

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

  }, [isBattleblazeMode]);

  return (

    <div

      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden text-white select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${

        isExiting

          ? "scale-105 opacity-0 blur-md pointer-events-none"

          : "opacity-100 scale-100"

      }`}

      style={{

        backgroundColor: isBattleblazeMode ? "#05030d" : "#030305",

        backgroundImage: isBattleblazeMode

          ? "radial-gradient(ellipse at 12% 18%, rgba(109, 40, 217, 0.35), transparent 40%), radial-gradient(ellipse at 88% 30%, rgba(37, 99, 235, 0.25), transparent 42%), linear-gradient(135deg, #05030d 0%, #100821 48%, #050914 100%)"

          : "none",

      }}

    >

      <style>{`

        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');

        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght\@400;600;700;800&family=Inter:wght\@400;600;700&display=swap');

        .loader-samurai {

          font-family: 'The Last Shuriken', sans-serif;

        }

        .loader-orbitron {

          font-family: 'Orbitron', sans-serif;

        }

        .loader-sans {

          font-family: 'Inter', sans-serif;

        }

        /* Standard Portal Spin */

        @keyframes portalSpinCW {

          0% { transform: rotate(0deg); }

          100% { transform: rotate(360deg); }

        }

        @keyframes portalSpinCCW {

          0% { transform: rotate(360deg); }

          100% { transform: rotate(0deg); }

        }

        .portal-spin-cw { animation: portalSpinCW 18s linear infinite; will-change: transform; }

        .portal-spin-ccw { animation: portalSpinCCW 11s linear infinite; will-change: transform; }

        .portal-spin-cw-slow { animation: portalSpinCW 26s linear infinite; will-change: transform; }

        /* BattleBlaze Border Moving Purple/Blue Line Animation */

        @keyframes borderLineRotate {

          0% {

            background-position: 0% 50%;

          }

          50% {

            background-position: 100% 50%;

          }

          100% {

            background-position: 0% 50%;

          }

        }

        .battleblaze-logo-frame {

          position: relative;

          padding: 0 !important;

          border: 0 !important;

          border-radius: 0 !important;

          background: transparent !important;

          box-shadow: none !important;

          isolation: isolate;

        }

        /* Neon corners only — no rectangular outline behind logoo2.png. */

        .battleblaze-logo-frame::before {

          content: "";

          position: absolute;

          inset: -8px;

          z-index: 30;

          pointer-events: none;

          background:

            linear-gradient(90deg, #a855f7, #60a5fa) left top / 30px 2px no-repeat,

            linear-gradient(180deg, #a855f7, #60a5fa) left top / 2px 30px no-repeat,

            linear-gradient(90deg, #60a5fa, #a855f7) right top / 30px 2px no-repeat,

            linear-gradient(180deg, #60a5fa, #a855f7) right top / 2px 30px no-repeat,

            linear-gradient(90deg, #a855f7, #60a5fa) left bottom / 30px 2px no-repeat,

            linear-gradient(180deg, #60a5fa, #a855f7) left bottom / 2px 30px no-repeat,

            linear-gradient(90deg, #60a5fa, #a855f7) right bottom / 30px 2px no-repeat,

            linear-gradient(180deg, #a855f7, #60a5fa) right bottom / 2px 30px no-repeat;

          filter:

            drop-shadow(0 0 4px rgba(168, 85, 247, 0.9))

            drop-shadow(0 0 8px rgba(59, 130, 246, 0.7));

          animation: battleblazeCornerGlow 1.8s ease-in-out infinite;

        }

        @keyframes battleblazeCornerGlow {

          0%, 100% {

            opacity: 0.65;

            filter: drop-shadow(0 0 3px rgba(168, 85, 247, 0.75)) drop-shadow(0 0 5px rgba(59, 130, 246, 0.55));

          }

          50% {

            opacity: 1;

            filter: drop-shadow(0 0 5px rgba(192, 132, 252, 1)) drop-shadow(0 0 11px rgba(59, 130, 246, 0.95));

          }

        }

        @media (prefers-reduced-motion: reduce) {

          .battleblaze-logo-frame::before { animation: none; }

        }

        /* Diagonal Shine Sweep */

        @keyframes diagonalShineSweep {

          0% {

            -webkit-mask-position: 0% 0%;

            mask-position: 0% 0%;

            opacity: 0;

          }

          15% { opacity: 1; }

          85% { opacity: 1; }

          100% {

            -webkit-mask-position: 100% 100%;

            mask-position: 100% 100%;

            opacity: 0;

          }

        }

        .shine-logo-clone {

          filter: brightness(3.2) drop-shadow(0 0 12px rgba(255, 255, 255, 0.95));

          mix-blend-mode: screen;

          -webkit-mask-image: linear-gradient(135deg, transparent 0%, transparent 42%, rgba(0,0,0,1) 48%, rgba(0,0,0,1) 52%, transparent 58%, transparent 100%);

          mask-image: linear-gradient(135deg, transparent 0%, transparent 42%, rgba(0,0,0,1) 48%, rgba(0,0,0,1) 52%, transparent 58%, transparent 100%);

          -webkit-mask-size: 270% 270%;

          mask-size: 270% 270%;

          animation: diagonalShineSweep 1.6s cubic-bezier(0.25, 1, 0.5, 1) infinite;

        }

        @keyframes logoPulse {

          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 22px rgba(255, 255, 255, 0.20)); }

          50% { transform: scale(1.02); filter: drop-shadow(0 0 42px rgba(139, 92, 246, 0.45)); }

        }

        .logo-pulse-box { animation: logoPulse 3.2s ease-in-out infinite; }

        .scanlines {

          background: repeating-linear-gradient(to bottom, transparent 0, transparent 3px, rgba(255, 255, 255, 0.02) 4px);

        }

      `}</style>

      {/* AMBIENT BACKGROUND LAYERS */}

      <canvas ref={particlesRef} className="pointer-events-none absolute inset-0 z-0 opacity-70" />

      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_65%)]" />

      <div className="scanlines pointer-events-none absolute inset-0 z-0" />

      {/* PERSPECTIVE CYBER GRID */}

      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:60px_60px]" />

      {/* TOP HUD TELEMETRY */}

      <div className="loader-sans absolute top-6 left-6 right-6 flex items-center justify-between text-[8px] sm:text-[9px] tracking-[0.35em] text-white/40 uppercase">

        <div className="flex items-center gap-2">

          <span className={`h-1.5 w-1.5 rounded-full ${isBattleblazeMode ? "bg-[#8b5cf6] shadow-[0_0_8px_#8b5cf6]" : "bg-white shadow-[0_0_8px_#ffffff]"} animate-ping`} />

          <span>{isBattleblazeMode ? "BATTLEBLAZE.SYS // 2026" : "SYS.CONNECT // NIT SILCHAR"}</span>

        </div>

        <div className="hidden sm:block">

          {isBattleblazeMode ? "RAMPAGE SECURE GRID" : "SECURE SIMULATION // V.2.6"}

        </div>

      </div>

      {/* =====================================================

          MAIN CENTRAL CONTENT

         ===================================================== */}

      <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full">

        {/* LOGO CONTAINER */}

        <div className="relative flex items-center justify-center">

          {!isBattleblazeMode && (

            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square w-[116%] sm:w-[114%] max-w-[390px] flex items-center justify-center">

              <div className="absolute inset-0 rounded-full bg-white/[0.035] blur-md shadow-[0_0_25px_rgba(255,255,255,0.08)_inset]" />

              <div className="portal-spin-cw absolute inset-0 rounded-full border border-dashed border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.15)]" />

              <div className="portal-spin-ccw absolute inset-[6px] sm:inset-[8px] rounded-full border border-white/15">

                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rotate-45 bg-white shadow-[0_0_8px_#ffffff]" />

                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rotate-45 bg-white/70" />

                <span className="absolute top-1/2 -left-1 -translate-y-1/2 h-1.5 w-1.5 rotate-45 bg-white/70" />

                <span className="absolute top-1/2 -right-1 -translate-y-1/2 h-1.5 w-1.5 rotate-45 bg-white/70" />

              </div>

              <div className="portal-spin-cw-slow absolute inset-[14px] sm:inset-[16px] rounded-full border border-dotted border-white/20" />

            </div>

          )}

          {/* Logo Pulse Wrapper */}

          <div className={`logo-pulse-box relative flex items-center justify-center ${isBattleblazeMode ? "battleblaze-logo-frame" : ""}`}>

            <img

              src={logoSrc}

              alt={isBattleblazeMode ? "Battleblaze 2026" : "NITS Esports"}

              className={`relative z-10 object-contain block select-none ${

                isBattleblazeMode

                  ? "w-64 sm:w-80 md:w-96 lg:w-[420px] max-w-[88vw] h-auto drop-shadow-[0_0_25px_rgba(139,92,246,0.5)]"

                  : "w-56 sm:w-72 md:w-80 lg:w-96 max-w-[82vw] h-auto"

              }`}

              draggable="false"

            />

            <img

              src={logoSrc}

              alt=""

              aria-hidden="true"

              className="shine-logo-clone absolute inset-0 z-20 w-full h-full object-contain pointer-events-none select-none"

              draggable="false"

            />

          </div>

        </div>

        {/* =====================================================

            LOADING TEXT & PROGRESS BAR

           ===================================================== */}

        <div className="mt-5 sm:mt-6 flex flex-col items-center text-center">

          <div className={`${isBattleblazeMode ? "loader-orbitron font-extrabold tracking-[0.28em] text-[#f5f3ff]" : "loader-samurai font-bold tracking-[0.25em] text-white"} flex items-center gap-3 text-lg sm:text-xl md:text-2xl`}>

            <span className={`h-px w-6 bg-gradient-to-r from-transparent ${isBattleblazeMode ? "to-[#8b5cf6]" : "to-white/70"}`} />

            <span className="drop-shadow-[0_0_15px_rgba(139,92,246,0.55)]">

              {isBattleblazeMode ? "BATTLEBLAZE LOADING..." : "LOADING THE ARENA"}

            </span>

            <span className={`h-px w-6 bg-gradient-to-l from-transparent ${isBattleblazeMode ? "to-[#60a5fa]" : "to-white/70"}`} />

          </div>

          <div className="loader-sans mt-2 h-4 flex items-center justify-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-white/60">

            <span className={`inline-block h-1 w-1 rounded-full ${isBattleblazeMode ? "bg-[#c4b5fd]" : "bg-white/70"} animate-pulse`} />

            <span>{statusMessages[statusIndex]}</span>

          </div>

          <div className="mt-4 sm:mt-5 w-[280px] sm:w-[340px] md:w-[400px]">

            <div className="loader-sans mb-1.5 flex items-center justify-between text-[9px] font-semibold tracking-[0.20em] text-white/60">

              <span>SYNCING PROTOCOL</span>

              <span className={`${isBattleblazeMode ? "text-[#c4b5fd]" : "text-white"} font-mono text-[11px] font-bold drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]`}>

                {String(Math.floor(progress)).padStart(2, "0")}%

              </span>

            </div>

            <div className={`relative h-2.5 w-full rounded-sm border ${isBattleblazeMode ? "border-[#8b5cf6]/40 bg-black/70 shadow-[0_0_20px_rgba(139,92,246,0.25)]" : "border-white/20 bg-black/60 shadow-[0_0_15px_rgba(0,0,0,0.8)]"} p-[2px]`}>

              <div

                className={`relative h-full rounded-[1px] ${

                  isBattleblazeMode

                    ? "bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#60a5fa] shadow-[0_0_14px_rgba(139,92,246,0.8)]"

                    : "bg-gradient-to-r from-white/40 via-white/80 to-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"

                }`}

                style={{

                  width: `${progress}%`,

                  transition: "width 0.05s linear",

                }}

              >

                <div className={`absolute top-0 right-0 h-full w-2 ${isBattleblazeMode ? "bg-[#60a5fa] shadow-[0_0_10px_#60a5fa]" : "bg-white shadow-[0_0_8px_#ffffff]"}`} />

              </div>

            </div>

            <div className="mt-1 flex justify-between px-0.5 opacity-35">

              {Array.from({ length: 14 }).map((_, i) => (

                <span

                  key={i}

                  className={`h-1 w-px ${

                    (progress / 100) * 14 >= i

                      ? `${isBattleblazeMode ? "bg-[#c4b5fd]" : "bg-white"} opacity-100`

                      : "bg-white/40"

                  }`}

                />

              ))}

            </div>

          </div>

        </div>

      </div>

      {/* BOTTOM FOOTER TELEMETRY */}

      <div className="loader-sans absolute bottom-5 text-center text-[7.5px] uppercase tracking-[0.40em] text-white/35">

        {isBattleblazeMode ? "BATTLEBLAZE 2026 // NITS ESPORTS" : "NIT SILCHAR OFFICIAL ESPORTS // ALL RIGHTS RESERVED"}

      </div>

    </div>

  );

};

export default LoadingScreen;
