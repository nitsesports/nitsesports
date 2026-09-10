import { useEffect, useRef, useState } from "react";
import klogo from "../assets/klogo.png";
import i9 from "../assets/i9.png";

const ScrollSection3 = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.05,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');

        /* =========================================================
           BASE
        ========================================================= */

        .samurai-section {
          font-family: "The Last Shuriken", Arial, sans-serif;
          background: #000;
          isolation: isolate;
        }

        .samurai-font {
          font-family: "The Last Shuriken", Arial, sans-serif;
        }

        /* =========================================================
           CINEMATIC SAMURAI ATMOSPHERE
        ========================================================= */

        .samurai-section::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background:
            radial-gradient(
              ellipse at 50% 42%,
              rgba(255,255,255,0.035) 0%,
              rgba(255,255,255,0.012) 32%,
              transparent 68%
            );
        }

        .samurai-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 8;
          opacity: 0.075;
          background-image:
            linear-gradient(
              rgba(255,255,255,0.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.055) 1px,
              transparent 1px
            );
          background-size: 80px 80px;
        }

        .samurai-vignette {
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          background:
            linear-gradient(
              to bottom,
              rgba(0,0,0,0.18),
              transparent 35%,
              rgba(0,0,0,0.42)
            );
        }

        .samurai-side-vignette {
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          background:
            linear-gradient(
              90deg,
              rgba(0,0,0,0.25),
              transparent 25%,
              transparent 75%,
              rgba(0,0,0,0.24)
            );
        }

        .samurai-atmosphere {
          position: absolute;
          left: 50%;
          top: 48%;
          width: min(720px, 90vw);
          height: 560px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 11;
          background:
            radial-gradient(
              ellipse,
              rgba(255,255,255,0.028) 0%,
              rgba(255,255,255,0.012) 36%,
              transparent 72%
            );
          filter: blur(80px);
        }

        /* =========================================================
           METALLIC SAMURAI TEXT
        ========================================================= */

        .samurai-heading-svg {
          display: block;
          width: 100%;
          height: auto;
          overflow: visible;
          pointer-events: none;
        }

        .samurai-heading-text {
          font-family: "The Last Shuriken", Arial, sans-serif;
          font-weight: 700;
          letter-spacing: 0.015em;
        }

        .samurai-base-text {
          fill: url(#samuraiMetalGradient);
          stroke: none;
          paint-order: normal;
          filter: url(#samuraiTextShadow);
        }

        .samurai-inner-text {
          fill: url(#samuraiInnerGradient);
          stroke: none;
          opacity: 0.34;
          pointer-events: none;
        }

        /* =========================================================
           MOVING SHINE — INSIDE LETTERS ONLY
        ========================================================= */

        .samurai-shine {
          fill: url(#samuraiShineGradient);
          stroke: none;
          opacity: 0.9;
          mix-blend-mode: screen;
          pointer-events: none;

          filter:
            drop-shadow(
              0 0 4px rgba(255,255,255,0.20)
            )
            drop-shadow(
              0 0 11px rgba(255,255,255,0.08)
            );
        }

        .samurai-shine-journey {
          fill: url(#journeyShineGradient);
          stroke: none;
          opacity: 0.9;
          mix-blend-mode: screen;
          pointer-events: none;

          filter:
            drop-shadow(
              0 0 4px rgba(255,255,255,0.20)
            )
            drop-shadow(
              0 0 11px rgba(255,255,255,0.08)
            );
        }

        @keyframes samuraiShineMove {
          0% {
            transform: translateX(-280px);
          }

          100% {
            transform: translateX(980px);
          }
        }

        /* HERO.JSX STYLE — SHARP MOVING METALLIC SHINE */
        .samurai-shine-animated {
          will-change: auto;
        }

        /* =========================================================
           SMALL LABEL
        ========================================================= */

        .samurai-label {
          font-family: "The Last Shuriken", Arial, sans-serif;
          font-weight: 700;
          letter-spacing: 0.25em;
          color: rgba(255,255,255,0.62);

          text-shadow:
            0 2px 7px rgba(0,0,0,0.75),
            0 0 8px rgba(255,255,255,0.08);
        }

        /* =========================================================
           SUBTITLE
        ========================================================= */

        .samurai-subtitle {
          font-family: "The Last Shuriken", Arial, sans-serif;
          color: rgba(255,255,255,0.66);
          letter-spacing: 0.11em;

          text-shadow:
            0 2px 9px rgba(0,0,0,0.9);
        }

        /* =========================================================
           DECORATIVE SAMURAI LINE
        ========================================================= */

        .samurai-divider {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .samurai-divider-line {
          height: 1px;
          width: 90px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.62),
              rgba(130,130,130,0.82)
            );

          box-shadow:
            0 0 7px rgba(255,255,255,0.28);
        }

        .samurai-divider-line.right {
          background:
            linear-gradient(
              90deg,
              rgba(130,130,130,0.82),
              rgba(255,255,255,0.62),
              transparent
            );
        }

        .samurai-divider-dot {
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: 999px;
          background: #fff;

          box-shadow:
            0 0 7px rgba(255,255,255,0.9),
            0 0 15px rgba(255,255,255,0.45);
        }

        /* =========================================================
           PARTNER CARD
        ========================================================= */

        .samurai-card {
          position: relative;
          overflow: hidden;

          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,0.075),
              rgba(255,255,255,0.025)
            );

          box-shadow:
            0 10px 38px rgba(0,0,0,0.58),
            inset 0 1px 0 rgba(255,255,255,0.16),
            inset 0 0 25px rgba(255,255,255,0.025);

          backdrop-filter: blur(10px);

          transition:
            transform 500ms cubic-bezier(.16,1,.3,1),
            border-color 500ms ease,
            box-shadow 500ms ease;
        }

        .samurai-card:hover {
          transform: translateY(-4px) scale(1.025);

          border-color: rgba(255,255,255,0.38);

          box-shadow:
            0 0 35px rgba(255,255,255,0.12),
            0 18px 55px rgba(0,0,0,0.7),
            inset 0 1px 0 rgba(255,255,255,0.22);
        }

        .samurai-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 72%;
          height: 2px;
          transform: translateX(-50%);

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.82),
              transparent
            );

          box-shadow:
            0 0 11px rgba(255,255,255,0.32);
        }

        .samurai-card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;

          border-radius: 14px;

          box-shadow:
            inset 0 0 22px rgba(255,255,255,0.035);
        }

        .samurai-card-shine {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;

          background:
            linear-gradient(
              115deg,
              transparent 25%,
              rgba(255,255,255,0.08) 48%,
              transparent 70%
            );

          transform: translateX(-100%);

          transition:
            opacity 500ms ease,
            transform 900ms ease;
        }

        .samurai-card:hover .samurai-card-shine {
          opacity: 1;
          transform: translateX(100%);
        }

        /* =========================================================
           LOGO
        ========================================================= */

        .samurai-logo {
          width: 140px;
          height: auto;
          object-fit: contain;

          filter:
            contrast(1.08)
            brightness(1.05)
            drop-shadow(
              0 3px 8px rgba(0,0,0,0.55)
            );

          opacity: 1;

          transition:
            transform 400ms ease,
            opacity 400ms ease,
            filter 400ms ease;
        }

        .samurai-card:hover .samurai-logo {
          transform: scale(1.055);
          opacity: 1;

          filter:
            contrast(1.15)
            brightness(1.12)
            drop-shadow(
              0 4px 12px rgba(255,255,255,0.13)
            );
        }

        /* =========================================================
           DESCRIPTION
        ========================================================= */

        .samurai-description {
          font-family: "The Last Shuriken", Arial, sans-serif;
          color: rgba(255,255,255,0.60);
          letter-spacing: 0.055em;
          line-height: 1.85;

          text-shadow:
            0 3px 12px rgba(0,0,0,0.9);
        }

        /* =========================================================
           BUTTON
        ========================================================= */

        .samurai-button {
          position: relative;
          overflow: hidden;

          font-family: "The Last Shuriken", Arial, sans-serif;
          font-weight: 700;
          letter-spacing: 0.08em;

          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 12px;

          color: rgba(255,255,255,0.88);

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,0.09),
              rgba(255,255,255,0.025)
            );

          box-shadow:
            0 8px 30px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.14);

          transition:
            transform 450ms cubic-bezier(.16,1,.3,1),
            border-color 450ms ease,
            box-shadow 450ms ease;
        }

        .samurai-button:hover {
          transform: translateY(-3px) scale(1.035);

          border-color: rgba(255,255,255,0.40);

          box-shadow:
            0 0 30px rgba(255,255,255,0.13),
            0 14px 42px rgba(0,0,0,0.62),
            inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .samurai-button-shine {
          position: absolute;
          inset: 0;

          transform: translateX(-110%);

          background:
            linear-gradient(
              100deg,
              transparent,
              rgba(255,255,255,0.16),
              transparent
            );

          transition:
            transform 750ms cubic-bezier(.16,1,.3,1);
        }

        .samurai-button:hover .samurai-button-shine {
          transform: translateX(110%);
        }

        /* =========================================================
           BOTTOM CONNECTOR
        ========================================================= */

        .samurai-connector {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          z-index: 50;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.70),
              rgba(190,190,190,0.70)
            );

          box-shadow:
            0 0 8px rgba(255,255,255,0.42),
            0 0 14px rgba(170,170,170,0.24);
        }

        .samurai-connector-inner {
          position: absolute;
          left: 15%;
          top: 0;

          width: 70%;
          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              white,
              transparent
            );

          opacity: 0.72;
        }

        @keyframes samuraiConnectorFlow {
          0% {
            transform: translateX(-130%);
            opacity: 0;
          }

          12% {
            opacity: 0.8;
          }

          50% {
            opacity: 1;
          }

          88% {
            opacity: 0.8;
          }

          100% {
            transform: translateX(430%);
            opacity: 0;
          }
        }

        .samurai-connector-flow {
          position: absolute;
          top: 0;
          left: 0;

          width: 24%;
          height: 100%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.95),
              transparent
            );

          filter: blur(0.4px);

          animation:
            samuraiConnectorFlow
            18s
            linear
            infinite;

          will-change:
            transform,
            opacity;
        }

        /* =========================================================
           ENTRANCE ANIMATIONS
        ========================================================= */

        .samurai-enter {
          transform: translateY(70px) scale(0.82);
          opacity: 0;

          transition:
            transform 1000ms cubic-bezier(.16,1,.3,1),
            opacity 1000ms cubic-bezier(.16,1,.3,1);
        }

        .samurai-enter.visible {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        .samurai-card-enter {
          transform: translateY(80px) scale(0.72);
          opacity: 0;

          transition:
            transform 1000ms cubic-bezier(.16,1,.3,1),
            opacity 1000ms cubic-bezier(.16,1,.3,1);
        }

        .samurai-card-enter.visible {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        .samurai-journey-enter {
          transform: translateY(90px) scale(0.78);
          opacity: 0;

          transition:
            transform 1000ms cubic-bezier(.16,1,.3,1),
            opacity 1000ms cubic-bezier(.16,1,.3,1);
        }

        .samurai-journey-enter.visible {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        /* =========================================================
           MOBILE
        ========================================================= */

        @media (max-width: 640px) {
          .samurai-heading-text {
            letter-spacing: 0;
          }

          .samurai-divider-line {
            width: 58px;
          }

          .samurai-logo {
            width: 120px;
          }

          .samurai-description {
            font-size: 13px;
            line-height: 1.8;
            letter-spacing: 0.045em;
          }

          .samurai-grid {
            background-size: 60px 60px;
          }
        }

        /* =========================================================
           REDUCED MOTION
        ========================================================= */

        @media (prefers-reduced-motion: reduce) {
          .samurai-shine-animated,
          .samurai-connector-flow {
            animation: none;
          }

          .samurai-enter,
          .samurai-card-enter,
          .samurai-journey-enter {
            transition: none;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="
          samurai-section
          relative
          flex
          min-h-[100vh]
          w-full
          items-center
          justify-center
          overflow-hidden
          bg-black
          py-16
          sm:py-20
        "
      >

        {/* =======================================================
            BACKGROUND
        ======================================================= */}

        <img
          src={i9}
          alt=""
          aria-hidden="true"
          className="
            absolute
            inset-0
            z-0
            h-full
            w-full
            object-cover
            scale-[1.065]
            brightness-[0.92]
            grayscale
            saturate-0
            contrast-[1.12]
            pointer-events-none
          "
        />

        {/* DARK SAMURAI OVERLAY */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[2]
            bg-black/[0.68]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[3]
            bg-gradient-to-b
            from-black/[0.40]
            via-transparent
            to-black/[0.58]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[4]
            bg-[radial-gradient(ellipse_at_50%_44%,transparent_0%,rgba(0,0,0,0.05)_40%,rgba(0,0,0,0.42)_100%)]
          "
        />

        <div className="samurai-grid" />
        <div className="samurai-vignette" />
        <div className="samurai-side-vignette" />
        <div className="samurai-atmosphere" />

        {/* =======================================================
            CONTENT
        ======================================================= */}

        <div
          className="
            relative
            z-30
            flex
            w-full
            max-w-5xl
            flex-col
            items-center
            px-5
          "
        >

          {/* =====================================================
              OUR PARTNERS
          ===================================================== */}

          <div
            className={`
              samurai-enter
              w-full
              text-center
              ${visible ? "visible" : ""}
            `}
            style={{
              transitionDelay: visible ? "100ms" : "0ms",
            }}
          >

            <svg
              className="
                samurai-heading-svg
                mx-auto
                max-w-[720px]
              "
              viewBox="0 0 720 100"
              preserveAspectRatio="xMidYMid meet"
              role="heading"
              aria-level="2"
              aria-label="OUR PARTNERS"
            >

              <defs>

                {/* MAIN METALLIC GRADIENT */}

                <linearGradient
                  id="samuraiMetalGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ffffff" />

                  <stop offset="15%" stopColor="#f1f1f1" />

                  <stop offset="32%" stopColor="#c8c8c8" />

                  <stop offset="48%" stopColor="#777777" />

                  <stop offset="62%" stopColor="#4f4f4f" />

                  <stop offset="74%" stopColor="#8d8d8d" />

                  <stop offset="88%" stopColor="#d7d7d7" />

                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>

                {/* INNER DEPTH */}

                <linearGradient
                  id="samuraiInnerGradient"
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

                {/* MOVING SHINE */}

                <linearGradient
                  id="samuraiShineGradient"
                  gradientUnits="userSpaceOnUse"
                  x1="-300"
                  y1="0"
                  x2="-60"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="38%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity=".92" />
                  <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />

                  <animateTransform
                    attributeName="gradientTransform"
                    type="translate"
                    from="0 0"
                    to="1500 0"
                    dur="3.8s"
                    repeatCount="indefinite"
                  />
                </linearGradient>

                {/* TEXT SHADOW */}

                <filter
                  id="samuraiTextShadow"
                  x="-30%"
                  y="-30%"
                  width="160%"
                  height="160%"
                >
                  <feDropShadow
                    dx="0"
                    dy="4"
                    stdDeviation="5"
                    floodColor="#000000"
                    floodOpacity="0.72"
                  />

                  <feDropShadow
                    dx="0"
                    dy="7"
                    stdDeviation="9"
                    floodColor="#000000"
                    floodOpacity="0.55"
                  />
                </filter>

              </defs>

              {/* BASE */}

              <text
                x="360"
                y="72"
                textAnchor="middle"
                className="samurai-heading-text samurai-base-text"
                fontSize="62"
              >
                OUR PARTNERS
              </text>

              {/* INNER METALLIC DEPTH */}

              <text
                x="360"
                y="72"
                textAnchor="middle"
                className="
                  samurai-heading-text
                  samurai-inner-text
                "
                fontSize="62"
              >
                OUR PARTNERS
              </text>

              {/* MOVING LIGHT */}

              <text
                x="360"
                y="72"
                textAnchor="middle"
                className="
                  samurai-heading-text
                  samurai-shine
                  samurai-shine-animated
                "
                fontSize="62"
              >
                OUR PARTNERS
              </text>

            </svg>

            {/* SUBTITLE */}

            <p
              className={`
                samurai-subtitle
                mt-2
                text-[9px]
                uppercase
                sm:text-[10px]
                md:text-xs
                transform-gpu
                transition-all
                duration-700
                ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0"
                }
              `}
              style={{
                transitionDelay: visible ? "450ms" : "0ms",
              }}
            >
              POWERING THE NEXT GENERATION OF ESPORTS ATHLETES
            </p>

            {/* DIVIDER */}

            <div
              className={`
                samurai-divider
                mt-5
                transform-gpu
                transition-all
                duration-700
                ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0"
                }
              `}
              style={{
                transitionDelay: visible ? "650ms" : "0ms",
              }}
            >
              <div className="samurai-divider-line" />

              <div className="samurai-divider-dot" />

              <div className="samurai-divider-line right" />
            </div>

          </div>

          {/* =====================================================
              PARTNER CARD
          ===================================================== */}

          <div
            className={`
              samurai-card-enter
              relative
              z-40
              mt-7
              w-full
              max-w-[300px]
              ${visible ? "visible" : ""}
            `}
            style={{
              transitionDelay: visible ? "300ms" : "0ms",
            }}
          >

            <div className="samurai-card px-5 py-5">

              <div className="samurai-card-shine" />

              <div
                className="
                  relative
                  z-10
                  flex
                  h-[76px]
                  items-center
                  justify-center
                "
              >
                <img
                  src={klogo}
                  alt="Partner Logo"
                  className="samurai-logo"
                />
              </div>

            </div>

          </div>

          {/* =====================================================
              LOWER DECORATIVE LINE
          ===================================================== */}

          <div
            className={`
              mt-6
              flex
              items-center
              gap-3
              transform-gpu
              transition-all
              duration-700
              ${
                visible
                  ? "translate-y-0 opacity-60"
                  : "translate-y-5 opacity-0"
              }
            `}
            style={{
              transitionDelay: visible ? "850ms" : "0ms",
            }}
          >

            <div
              className="
                h-px
                w-10
                bg-gradient-to-r
                from-transparent
                to-white/60
              "
            />

            <div
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-white/80
                shadow-[0_0_9px_rgba(255,255,255,0.55)]
              "
            />

            <div
              className="
                h-px
                w-10
                bg-gradient-to-l
                from-transparent
                to-white/60
              "
            />

          </div>

          {/* =====================================================
              READY TO START
          ===================================================== */}

          <div
            className={`
              samurai-journey-enter
              mt-14
              flex
              w-full
              flex-col
              items-center
              text-center
              ${visible ? "visible" : ""}
            `}
            style={{
              transitionDelay: visible ? "1000ms" : "0ms",
            }}
          >

            <svg
              className="
                samurai-heading-svg
                mx-auto
                w-full
                max-w-[780px]
              "
              viewBox="0 0 780 100"
              preserveAspectRatio="xMidYMid meet"
              role="heading"
              aria-level="2"
              aria-label="Ready to Start Your Journey?"
            >

              <defs>

                <linearGradient
                  id="journeyMetalGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ffffff" />

                  <stop offset="16%" stopColor="#eeeeee" />

                  <stop offset="34%" stopColor="#c5c5c5" />

                  <stop offset="50%" stopColor="#747474" />

                  <stop offset="64%" stopColor="#505050" />

                  <stop offset="78%" stopColor="#a0a0a0" />

                  <stop offset="90%" stopColor="#dddddd" />

                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>

                <linearGradient
                  id="journeyInnerGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ffffff" />

                  <stop offset="38%" stopColor="#dcdcdc" />

                  <stop offset="58%" stopColor="#666666" />

                  <stop offset="80%" stopColor="#bdbdbd" />

                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>

                <linearGradient
                  id="journeyShineGradient"
                  gradientUnits="userSpaceOnUse"
                  x1="-300"
                  y1="0"
                  x2="-60"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="38%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity=".92" />
                  <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />

                  <animateTransform
                    attributeName="gradientTransform"
                    type="translate"
                    from="0 0"
                    to="1500 0"
                    dur="3.8s"
                    repeatCount="indefinite"
                  />
                </linearGradient>

              </defs>

              {/* BASE */}

              <text
                x="390"
                y="72"
                textAnchor="middle"
                className="
                  samurai-heading-text
                  samurai-base-text
                "
                fill="url(#journeyMetalGradient)"
                fontSize="49"
              >
                READY TO START YOUR JOURNEY?
              </text>

              {/* INNER */}

              <text
                x="390"
                y="72"
                textAnchor="middle"
                className="
                  samurai-heading-text
                  samurai-inner-text
                "
                fontSize="49"
              >
                READY TO START YOUR JOURNEY?
              </text>

              {/* MOVING SHINE */}

              <text
                x="390"
                y="72"
                textAnchor="middle"
                className="
                  samurai-heading-text
                  samurai-shine-journey
                  samurai-shine-animated
                "
                fontSize="49"
              >
                READY TO START YOUR JOURNEY?
              </text>

            </svg>

            {/* DESCRIPTION */}

            <p
              className={`
                samurai-description
                mt-3
                max-w-3xl
                px-3
                text-sm
                sm:text-base
                md:text-lg
                transform-gpu
                transition-all
                duration-700
                ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-7 opacity-0"
                }
              `}
              style={{
                transitionDelay: visible ? "1200ms" : "0ms",
              }}
            >
              Join our community today and be part of the most exciting
              esports events in NIT Silchar.
            </p>

            {/* BUTTON */}

            <div
              className={`
                mt-8
                transform-gpu
                transition-all
                duration-[900ms]
                ${
                  visible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-8 scale-75 opacity-0"
                }
              `}
              style={{
                transitionDelay: visible ? "1400ms" : "0ms",
              }}
            >

              <button
                type="button"
                className="
                  samurai-button
                  group
                  relative
                  px-8
                  py-4
                  text-sm
                  sm:px-10
                  sm:text-base
                "
              >

                <span className="samurai-button-shine" />

                <span className="relative z-10">
                  LEARN MORE ABOUT US
                </span>

              </button>

            </div>

          </div>

        </div>

        {/* =======================================================
            BOTTOM SAMURAI CONNECTOR
        ======================================================= */}

        <div className="samurai-connector">

          <div className="samurai-connector-inner" />

          <div className="samurai-connector-flow" />

        </div>

      </section>
    </>
  );
};

export default ScrollSection3;