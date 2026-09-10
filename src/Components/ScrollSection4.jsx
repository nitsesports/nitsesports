import { useEffect, useRef, useState } from "react";
import backgroundVideo from "../assets/v4.webm";

const ScrollSection4 = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(false);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setVisible(true);
            });
          });
        } else {
          setVisible(false);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-black text-white isolate"
    >
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');

        .experience-page,
        .experience-page *,
        .experience-page svg text {
          font-family: 'The Last Shuriken', sans-serif !important;
        }

        /* =========================================================
           HERO-STYLE HEADING — SAME METALLIC TREATMENT
        ========================================================= */

        .experience-heading-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          line-height: 1;
        }

        .experience-heading-svg {
          display: block;
          width: min(720px, 92vw);
          height: auto;
          overflow: visible;
          pointer-events: none;
        }

        .experience-heading-base {
          fill: url(#experienceHeadingFillGradient);
          stroke: none;
          paint-order: normal;
          filter: url(#experienceHeadingPremiumShadow);
        }

        .experience-heading-inner {
          fill: url(#experienceHeadingInnerGradient);
          stroke: none;
          opacity: .34;
          pointer-events: none;
        }

        .experience-heading-shine {
          fill: url(#experienceHeadingShineGradient);
          stroke: none;
          paint-order: normal;
          pointer-events: none;
          opacity: .88;
          mix-blend-mode: screen;
          filter:
            drop-shadow(0 0 4px rgba(255,255,255,.20))
            drop-shadow(0 0 11px rgba(255,255,255,.08));
        }

        /* =========================================================
           SAMURAI VIDEO FRAME
        ========================================================= */

        .samurai-video-frame {
          position: relative;
          width: min(1040px, 88vw);
          aspect-ratio: 16 / 9;
          isolation: isolate;
          overflow: visible;
        }

        .samurai-video-inner {
          position: absolute;
          inset: 10px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(255,255,255,.24);
          box-shadow:
            0 0 0 1px rgba(255,255,255,.04),
            0 14px 45px rgba(0,0,0,.72),
            0 0 55px rgba(255,255,255,.045);
        }

        .samurai-video-inner::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,.07),
              transparent 12%,
              transparent 88%,
              rgba(255,255,255,.07)
            ),
            linear-gradient(
              180deg,
              rgba(255,255,255,.055),
              transparent 14%,
              transparent 86%,
              rgba(255,255,255,.08)
            );
        }

        .samurai-video-inner::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          border: 1px solid rgba(255,255,255,.06);
          box-shadow: inset 0 0 35px rgba(0,0,0,.65);
        }

        .samurai-corner {
          position: absolute;
          z-index: 10;
          width: 42px;
          height: 42px;
          pointer-events: none;
        }

        .samurai-corner.tl {
          left: 0;
          top: 0;
          border-left: 2px solid rgba(255,255,255,.78);
          border-top: 2px solid rgba(255,255,255,.78);
        }

        .samurai-corner.tr {
          right: 0;
          top: 0;
          border-right: 2px solid rgba(255,255,255,.78);
          border-top: 2px solid rgba(255,255,255,.78);
        }

        .samurai-corner.bl {
          left: 0;
          bottom: 0;
          border-left: 2px solid rgba(255,255,255,.52);
          border-bottom: 2px solid rgba(255,255,255,.52);
        }

        .samurai-corner.br {
          right: 0;
          bottom: 0;
          border-right: 2px solid rgba(255,255,255,.52);
          border-bottom: 2px solid rgba(255,255,255,.52);
        }

        .samurai-edge {
          position: absolute;
          pointer-events: none;
          z-index: 9;
          left: 11%;
          right: 11%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.55),
            transparent
          );
        }

        .samurai-edge.top {
          top: 0;
        }

        .samurai-edge.bottom {
          bottom: 0;
        }

        .samurai-label {
          font-family: 'The Last Shuriken', sans-serif;
          letter-spacing: .30em;
          text-shadow:
            0 2px 7px rgba(0,0,0,.8),
            0 0 10px rgba(255,255,255,.08);
        }

        @media (max-width: 640px) {
          .samurai-video-frame {
            width: 92vw;
          }

          .samurai-video-inner {
            inset: 7px;
          }

          .samurai-corner {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>

      <div className="experience-page absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover brightness-[0.58] contrast-[1.08] saturate-0"
        >
          <source src={backgroundVideo} type="video/webm" />
        </video>

        <div className="absolute inset-0 bg-black/50" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/80" />

        <div className="pointer-events-none absolute -left-[15%] top-[10%] h-[340px] w-[340px] rounded-full bg-white/[0.045] blur-[120px]" />
        <div className="pointer-events-none absolute -right-[12%] top-[20%] h-[380px] w-[380px] rounded-full bg-white/[0.035] blur-[130px]" />
      </div>

      <div className="experience-page relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-5 py-20 sm:px-8 md:px-12">

        {/* THE EXPERIENCE */}
        <div
          className={`
            experience-heading-wrap
            transform-gpu
            transition-all
            duration-[1000ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${visible
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-16 scale-95 opacity-0"}
          `}
        >
          <svg
            className="experience-heading-svg"
            viewBox="0 0 720 105"
            preserveAspectRatio="xMidYMid meet"
            role="heading"
            aria-level="2"
            aria-label="THE EXPERIENCE"
          >
            <defs>
              {/* SAME HERO METALLIC BASE */}
              <linearGradient
                id="experienceHeadingFillGradient"
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

              {/* SAME HERO INNER DEPTH */}
              <linearGradient
                id="experienceHeadingInnerGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity=".20" />
                <stop offset="45%" stopColor="#000000" stopOpacity=".28" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity=".12" />
              </linearGradient>

              {/* SAME HERO MOVING SHINE */}
              <linearGradient
                id="experienceHeadingShineGradient"
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

              <filter
                id="experienceHeadingPremiumShadow"
                x="-30%"
                y="-30%"
                width="160%"
                height="180%"
              >
                <feDropShadow
                  dx="0"
                  dy="7"
                  stdDeviation="5"
                  floodColor="#000000"
                  floodOpacity=".98"
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

            <text
              x="50%"
              y="76"
              textAnchor="middle"
              fontFamily="The Last Shuriken, sans-serif"
              fontSize="76"
              fontWeight="700"
              letterSpacing="-4"
              className="experience-heading-base"
            >
              THE EXPERIENCE
            </text>

            <text
              x="50%"
              y="76"
              textAnchor="middle"
              fontFamily="The Last Shuriken, sans-serif"
              fontSize="76"
              fontWeight="700"
              letterSpacing="-4"
              className="experience-heading-inner"
              aria-hidden="true"
            >
              THE EXPERIENCE
            </text>

            <text
              x="50%"
              y="76"
              textAnchor="middle"
              fontFamily="The Last Shuriken, sans-serif"
              fontSize="76"
              fontWeight="700"
              letterSpacing="-4"
              className="experience-heading-shine"
              aria-hidden="true"
            >
              THE EXPERIENCE
            </text>
          </svg>
        </div>

        {/* SAMURAI DIVIDER */}
        <div
          className={`
            mt-5 mb-8 flex items-center justify-center gap-3
            transition-all duration-[900ms] delay-[180ms]
            ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}
          `}
        >
          <div className="h-px w-14 bg-gradient-to-r from-transparent via-white to-white/40 sm:w-24 md:w-32" />
          <div className="h-1.5 w-1.5 rotate-45 bg-white shadow-[0_0_8px_rgba(255,255,255,.9)]" />
          <div className="h-px w-14 bg-gradient-to-l from-transparent via-white to-white/40 sm:w-24 md:w-32" />
        </div>

        {/* YOUTUBE — NORMAL SIZE */}
        <div
          className={`
            samurai-video-frame
            transform-gpu
            transition-all
            duration-[1000ms]
            delay-[300ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${visible
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-12 scale-[0.97] opacity-0"}
          `}
        >
          <span className="samurai-corner tl" />
          <span className="samurai-corner tr" />
          <span className="samurai-corner bl" />
          <span className="samurai-corner br" />

          <span className="samurai-edge top" />
          <span className="samurai-edge bottom" />

          <div className="samurai-video-inner">
            <iframe
              className="absolute inset-0 z-[1] h-full w-full"
              src="https://www.youtube.com/embed/VIDEO_ID"
              title="The Experience"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        <p
          className={`
            samurai-label
            mt-7
            text-[9px]
            uppercase
            text-white/35
            transition-all
            duration-700
            delay-[450ms]
            ${visible ? "opacity-100" : "opacity-0"}
          `}
        >
          ENTER THE EXPERIENCE
        </p>
      </div>

      {/* =====================================================
          SECTION CONNECTOR
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          z-30
          w-full
        "
      >

        <div
          className="
            h-[2px]
            w-full
            bg-gradient-to-r
            from-transparent
            via-white/55
            to-transparent
            shadow-[0_0_10px_rgba(255,255,255,.16)]
          "
        />

        <div
          className="
            absolute
            left-[15%]
            top-0
            h-px
            w-[70%]
            bg-gradient-to-r
            from-transparent
            via-white
            to-transparent
            opacity-65
          "
        />

      </div>

    </section>
  );
};

export default ScrollSection4;
