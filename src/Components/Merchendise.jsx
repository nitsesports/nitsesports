import React from "react";
import { Link } from "react-router-dom";
import merchBg from "../assets/i3.png";

const Merchendise = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          min-height: 100%;
          width: 100%;
          background: #000;
        }

        .samurai-font,
        .samurai-display,
        .samurai-label,
        .samurai-body {
          font-family: 'The Last Shuriken', sans-serif;
        }

        .ui-font {
          font-family: 'Inter', sans-serif;
        }

        /* ==================================================
           SAME CINEMATIC ENTRANCE LANGUAGE AS HERO
        ================================================== */
        @keyframes samuraiFadeUp {
          0% {
            opacity: 0;
            transform: translate3d(0, 34px, 0);
            filter: blur(7px);
          }
          65% {
            opacity: .85;
            filter: blur(1px);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            filter: blur(0);
          }
        }

        @keyframes samuraiGlow {
          0%, 100% {
            opacity: .24;
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            opacity: .48;
            transform: translate3d(0, -10px, 0) scale(1.04);
          }
        }

        .samurai-enter {
          animation: samuraiFadeUp 900ms cubic-bezier(.16, 1, .3, 1) both;
        }

        .samurai-enter-delay {
          animation: samuraiFadeUp 900ms cubic-bezier(.16, 1, .3, 1) 140ms both;
        }

        .samurai-enter-delay-2 {
          animation: samuraiFadeUp 900ms cubic-bezier(.16, 1, .3, 1) 280ms both;
        }

        .ambient-glow {
          animation: samuraiGlow 6s ease-in-out infinite;
        }

        /* ==================================================
           PREMIUM SAMURAI TITLE
           SAME FONT + METALLIC DEPTH + MOVING SHINE AS HERO
        ================================================== */
        .samurai-title-svg {
          display: block;
          width: min(94vw, 1000px);
          height: auto;
          overflow: visible;
          pointer-events: none;
        }

        .title-text {
          font-family: 'The Last Shuriken', sans-serif;
          font-size: 60px;
        }

        @media (min-width: 640px) {
          .title-text { font-size: 72px; }
        }

        @media (min-width: 768px) {
          .title-text { font-size: 84px; }
        }

        @media (min-width: 1024px) {
          .title-text { font-size: 92px; }
        }

        .samurai-title-base {
          fill: url(#merchTitleFillGradient);
          stroke: none;
          paint-order: normal;
          filter: url(#merchPremiumTitleShadow);
        }

        .samurai-title-inner {
          fill: url(#merchTitleInnerGradient);
          stroke: none;
          opacity: .34;
          pointer-events: none;
        }

        .samurai-title-shine {
          fill: url(#merchTitleShineGradient);
          stroke: none;
          paint-order: normal;
          pointer-events: none;
          opacity: .88;
          mix-blend-mode: screen;
          filter:
            drop-shadow(0 0 4px rgba(255,255,255,.20))
            drop-shadow(0 0 11px rgba(255,255,255,.08));
        }

        .samurai-label {
          letter-spacing: .45em;
          text-shadow:
            0 2px 7px rgba(0,0,0,.70),
            0 0 8px rgba(255,255,255,.08);
        }

        .samurai-body {
          letter-spacing: .08em;
          text-shadow:
            0 3px 12px rgba(0,0,0,.90),
            0 0 10px rgba(0,0,0,.55);
        }

        /* ==================================================
           DARK GLASS / SAMURAI CARD
        ================================================== */
        .samurai-card {
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.055),
              rgba(0,0,0,.38) 42%,
              rgba(255,255,255,.025)
            );
          border: 1px solid rgba(255,255,255,.14);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow:
            0 30px 90px rgba(0,0,0,.72),
            inset 0 1px 0 rgba(255,255,255,.08),
            inset 0 -1px 0 rgba(255,255,255,.025),
            0 0 45px rgba(255,255,255,.025);
        }

        .samurai-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(
              115deg,
              transparent 0%,
              rgba(255,255,255,.045) 44%,
              transparent 58%
            );
          opacity: .7;
        }

        .samurai-line {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.72),
            transparent
          );
        }

        .samurai-button {
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.18);
          box-shadow:
            0 0 22px rgba(0,0,0,.45),
            inset 0 1px 0 rgba(255,255,255,.08);
          transition:
            transform 300ms ease,
            background 300ms ease,
            border-color 300ms ease,
            box-shadow 300ms ease;
        }

        .samurai-button:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,.10);
          border-color: rgba(255,255,255,.38);
          box-shadow:
            0 0 32px rgba(255,255,255,.10),
            inset 0 1px 0 rgba(255,255,255,.13);
        }

        .samurai-status-dot {
          box-shadow: 0 0 12px rgba(255,255,255,.38);
        }

        @media (max-width: 640px) {
          .samurai-label {
            letter-spacing: .30em;
          }

          .samurai-body {
            letter-spacing: .055em;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .samurai-enter,
          .samurai-enter-delay,
          .samurai-enter-delay-2,
          .ambient-glow,
          .samurai-title-shine {
            animation: none;
          }
        }
      `}</style>

      {/* ==================================================
          BACKGROUND — DARK SAMURAI ATMOSPHERE
      ================================================== */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src={merchBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            filter: "grayscale(1) saturate(0) contrast(1.08) brightness(.72)",
          }}
        />
      </div>

      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,.48), rgba(0,0,0,.58) 42%, rgba(0,0,0,.88) 100%)",
        }}
      />

      {/* CINEMATIC GRID */}
      <div
        className="pointer-events-none fixed inset-0 z-[2] opacity-[.055]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* AMBIENT LIGHT */}
      <div className="ambient-glow pointer-events-none fixed left-[8%] top-[18%] z-[2] h-[320px] w-[420px] rounded-full bg-white/[.035] blur-[140px]" />
      <div className="ambient-glow pointer-events-none fixed bottom-[5%] right-[7%] z-[2] h-[340px] w-[430px] rounded-full bg-white/[.025] blur-[150px]" />

      {/* VIGNETTE */}
      <div
        className="pointer-events-none fixed inset-0 z-[3]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,.32) 64%, rgba(0,0,0,.76) 100%)",
        }}
      />

      {/* ==================================================
          CONTENT
      ================================================== */}
      <main className="relative z-10 flex min-h-screen w-full flex-col items-center px-5 pb-16 pt-[145px] sm:px-8 sm:pt-[160px] md:pt-[175px] lg:pt-[185px]">
        {/* EYEBROW */}
        <div className="samurai-enter samurai-font mb-5 flex items-center gap-3">
          <span className="h-px w-9 bg-gradient-to-r from-transparent to-white/45 sm:w-12" />
          <p className="samurai-label text-[9px] font-semibold uppercase text-white/65 sm:text-[10px]">
            NIT SILCHAR
          </p>
          <span className="h-px w-9 bg-gradient-to-l from-transparent to-white/45 sm:w-12" />
        </div>

        {/* ==================================================
            MAIN TITLE — SAME ANIMATED SHINE AS NITS ESPORTS
        ================================================== */}
        <div className="samurai-enter relative inline-block">
          <svg
            className="samurai-title-svg"
            viewBox="0 0 1000 120"
            preserveAspectRatio="xMidYMid meet"
            aria-label="Merchandise Store"
            role="img"
          >
            <defs>
              <linearGradient
                id="merchTitleFillGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="14%" stopColor="#f1f1f1" />
                <stop offset="30%" stopColor="#c8c8c8" />
                <stop offset="46%" stopColor="#7d7d7d" />
                <stop offset="60%" stopColor="#555555" />
                <stop offset="72%" stopColor="#8f8f8f" />
                <stop offset="86%" stopColor="#d9d9d9" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>

              <linearGradient
                id="merchTitleInnerGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="38%" stopColor="#dddddd" />
                <stop offset="58%" stopColor="#666666" />
                <stop offset="78%" stopColor="#bdbdbd" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>

              {/* IDENTICAL SHINE IDEA: A LIGHT SWEEP INSIDE THE LETTERS */}
              <linearGradient
                id="merchTitleShineGradient"
                gradientUnits="userSpaceOnUse"
                x1="-260"
                y1="0"
                x2="-80"
                y2="0"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="38%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.92" />
                <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  from="0 0"
                  to="1320 0"
                  dur="3.8s"
                  repeatCount="indefinite"
                />
              </linearGradient>

              <filter
                id="merchPremiumTitleShadow"
                x="-30%"
                y="-30%"
                width="160%"
                height="180%"
              >
                <feDropShadow
                  dx="0"
                  dy="7"
                  stdDeviation="4"
                  floodColor="#000000"
                  floodOpacity=".95"
                />
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="2"
                  floodColor="#000000"
                  floodOpacity=".70"
                />
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="1"
                  floodColor="#ffffff"
                  floodOpacity=".10"
                />
              </filter>
            </defs>

            {/* BASE */}
            <text
              x="50%"
              y="86"
              textAnchor="middle"
              fontFamily="The Last Shuriken, sans-serif"
              fontSize="92"
              fontWeight="700"
              letterSpacing="-4"
              className="title-text samurai-title-base"
            >
              MERCHANDISE STORE
            </text>

            {/* METALLIC DEPTH */}
            <text
              x="50%"
              y="86"
              textAnchor="middle"
              fontFamily="The Last Shuriken, sans-serif"
              fontSize="92"
              fontWeight="700"
              letterSpacing="-4"
              className="title-text samurai-title-inner"
            >
              MERCHANDISE STORE
            </text>

            {/* MOVING SHINE */}
            <text
              x="50%"
              y="86"
              textAnchor="middle"
              fontFamily="The Last Shuriken, sans-serif"
              fontSize="92"
              fontWeight="700"
              letterSpacing="-4"
              className="title-text samurai-title-shine"
            >
              MERCHANDISE STORE
            </text>
          </svg>
        </div>

        {/* SUBTITLE */}
        <div className="samurai-enter-delay samurai-body mt-4 max-w-3xl text-center text-[13px] font-medium leading-[1.9] text-white/68 sm:text-[15px] md:text-[17px]">
          Represent your club. Carry the spirit. Wear the legacy.
        </div>

        <div className="samurai-enter-delay mt-3 flex items-center gap-3">
          <span className="h-px w-7 bg-white/20" />
          <span className="samurai-font text-[9px] uppercase tracking-[.28em] text-white/45">
            OFFICIAL ESPORTS MERCHANDISE
          </span>
          <span className="h-px w-7 bg-white/20" />
        </div>

        {/* ==================================================
            COMING SOON CARD
        ================================================== */}
        <section className="samurai-enter-delay-2 samurai-card relative mt-12 flex min-h-[400px] w-full max-w-[850px] flex-col items-center justify-center overflow-hidden rounded-[26px] px-6 py-14 text-center sm:mt-14 sm:rounded-[30px] sm:px-12 md:min-h-[450px]">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[.025] blur-[90px]" />

          <div className="relative z-10 flex flex-col items-center">
            {/* SAMURAI MARK */}
            <div className="mb-7 flex h-[66px] w-[66px] items-center justify-center rounded-full border border-white/15 bg-black/45 shadow-[0_0_35px_rgba(255,255,255,.06)]">
              <div className="relative h-9 w-9 rotate-45 border border-white/65">
                <div className="absolute left-1/2 top-1/2 h-5 w-px -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white/80" />
                <div className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white/80" />
              </div>
            </div>

            <div className="samurai-font mb-3 text-[9px] font-semibold uppercase tracking-[.42em] text-white/45">
              THE DROP IS COMING
            </div>

            <h2 className="samurai-font text-4xl font-bold tracking-[.025em] text-white sm:text-5xl md:text-[54px]" style={{ textShadow: "0 4px 0 rgba(0,0,0,.72), 0 7px 18px rgba(0,0,0,.72)" }}>
              COMING SOON
            </h2>

            <div className="samurai-line mt-5 h-px w-28 opacity-60" />

            <p className="samurai-body mt-5 max-w-[650px] text-[13px] leading-[1.9] text-white/62 sm:text-[15px] md:text-[17px]">
              Our merchandise store is almost ready. Stay tuned for the official drop of exclusive club apparel and gaming gear.
            </p>

            {/* STATUS */}
            <div className="mt-7 flex items-center gap-3 rounded-full border border-white/10 bg-black/35 px-4 py-2.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/65 opacity-60" />
                <span className="samurai-status-dot relative inline-flex h-2 w-2 rounded-full bg-white/75" />
              </span>
              <span className="samurai-font text-[8px] uppercase tracking-[.25em] text-white/48 sm:text-[9px]">
                OFFICIAL DROP IN PREPARATION
              </span>
            </div>

            <Link
              to="/"
              className="samurai-button samurai-font mt-8 inline-flex items-center justify-center rounded-xl px-6 py-3 text-[11px] font-semibold uppercase tracking-[.20em] text-white/85"
            >
              Back to Home
            </Link>
          </div>
        </section>
      </main>

      {/* BOTTOM SAMURAI CONNECTOR */}
      <div className="pointer-events-none fixed bottom-0 left-0 z-50 w-full">
        <div className="relative h-px w-full overflow-hidden bg-white/[.10]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <div
            className="absolute left-0 top-0 h-full w-[22%]"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,.85), transparent)",
              animation: "merchConnectorFlow 12s linear infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes merchConnectorFlow {
          0% { transform: translateX(-130%); opacity: 0; }
          12% { opacity: .8; }
          50% { opacity: 1; }
          88% { opacity: .8; }
          100% { transform: translateX(520%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Merchendise;
