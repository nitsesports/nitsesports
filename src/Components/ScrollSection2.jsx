import React, { useEffect, useRef, useState } from "react";
import characterVideo from "../assets/character.webm";

const galleryImages = [
  "/gallery/gallery1.jpg",
  "/gallery/gallery2.jpg",
  "/gallery/gallery3.jpg",
  "/gallery/gallery4.jpg",
  "/gallery/gallery5.jpg",
  "/gallery/gallery6.jpg",
];

const features = [
  {
    number: "01",
    icon: "✦",
    title: "Competitive Gaming",
    description:
      "Participate in tournaments and climb the rankings.",
  },
  {
    number: "02",
    icon: "◉",
    title: "Active Community",
    description:
      "Join a vibrant community of passionate gamers.",
  },
  {
    number: "03",
    icon: "▣",
    title: "Regular Events",
    description:
      "Weekly tournaments and gaming sessions.",
  },
];

const ScrollSection2 = () => {
  const backgroundBrightness = 0.62;

  const sectionRef = useRef(null);
  const whyJoinRef = useRef(null);
  const galleryRef = useRef(null);
  const videoRef = useRef(null);

  const [videoReady, setVideoReady] = useState(false);
  const [whyJoinVisible, setWhyJoinVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);

  /* =========================================================
     SECTION CONTENT OBSERVER
  ========================================================= */

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === whyJoinRef.current) {
            setWhyJoinVisible(entry.isIntersecting);
          }

          if (entry.target === galleryRef.current) {
            setGalleryVisible(entry.isIntersecting);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    if (whyJoinRef.current) {
      observer.observe(whyJoinRef.current);
    }

    if (galleryRef.current) {
      observer.observe(galleryRef.current);
    }

    return () => observer.disconnect();
  }, []);

  /* =========================================================
     BACKGROUND VIDEO
  ========================================================= */

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;

    if (!section || !video) return;

    let cancelled = false;

    const playVideo = async () => {
      if (cancelled) return;

      try {
        if (video.readyState < 2) {
          video.load();
        }

        await video.play();

        if (!cancelled) {
          setVideoReady(true);
        }
      } catch {
        if (!cancelled) {
          setVideoReady(false);
        }
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (cancelled) return;

        if (entry.isIntersecting) {
          playVideo();
        } else {
          video.pause();
        }
      },
      {
        rootMargin: "300px 0px",
        threshold: 0.05,
      }
    );

    observer.observe(section);

    const handleVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else {
        const rect = section.getBoundingClientRect();

        const visible =
          rect.bottom > 0 &&
          rect.top < window.innerHeight;

        if (visible) {
          playVideo();
        }
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      cancelled = true;

      observer.disconnect();

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      video.pause();
    };
  }, []);

  /* =========================================================
     REDUCED MOTION
  ========================================================= */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotion = () => {
      if (mediaQuery.matches) {
        video.pause();
      }
    };

    updateMotion();

    mediaQuery.addEventListener?.(
      "change",
      updateMotion
    );

    return () => {
      mediaQuery.removeEventListener?.(
        "change",
        updateMotion
      );
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        gallery-page-font
        relative
        min-h-screen
        w-full
        overflow-hidden
        isolate
        bg-black
        text-white
      "
      style={{
        fontFamily:
          "'The Last Shuriken', sans-serif",
      }}
    >
      {/* =====================================================
          GLOBAL SECTION STYLES
      ===================================================== */}

      <style>{`
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');

        .gallery-page-font,
        .gallery-page-font *,
        .gallery-page-font svg text {
          font-family:
            'The Last Shuriken',
            sans-serif !important;
        }

        /* ==================================================
           SAMURAI TYPOGRAPHY
        ================================================== */

        .samurai-display {
          font-family:
            'The Last Shuriken',
            sans-serif;

          font-weight: 700;
          letter-spacing: 0.025em;

          text-shadow:
            0 4px 0 rgba(0,0,0,.78),
            0 7px 18px rgba(0,0,0,.78),
            0 0 12px rgba(255,255,255,.08);
        }

        .samurai-label {
          font-family:
            'The Last Shuriken',
            sans-serif;

          letter-spacing: 0.18em;

          text-shadow:
            0 2px 7px rgba(0,0,0,.75),
            0 0 8px rgba(255,255,255,.06);
        }

        /* ==================================================
           HEADING ANIMATION
        ================================================== */

        @keyframes headingNeonFlow {
          from {
            stroke-dashoffset: 1000;
          }

          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes galleryScroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .animate-galleryScroll {
          animation:
            galleryScroll
            32s
            linear
            infinite;
        }

        /* ==================================================
           HEADING WRAPPER
        ================================================== */

        .neon-heading-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          line-height: 1;
        }

        .neon-heading-svg {
          display: block;
          width: min(720px, 92vw);
          height: auto;
          overflow: visible;
          pointer-events: none;
        }

        .gallery-neon-svg {
          display: block;
          width: min(560px, 92vw);
          height: auto;
          overflow: visible;
          pointer-events: none;
        }

        /* ==================================================
           WHY JOIN US
        ================================================== */

        .neon-heading-base {
          fill: url(#headingFillGradient);
          stroke: none;
          paint-order: normal;
          filter: url(#headingPremiumShadow);
        }

        .neon-heading-inner {
          fill: url(#headingInnerGradient);
          stroke: none;
          opacity: .34;
          pointer-events: none;
        }

        .neon-heading-shine {
          fill: url(#headingShineGradient);
          stroke: none;
          paint-order: normal;
          pointer-events: none;
          opacity: .88;
          mix-blend-mode: screen;

          filter:
            drop-shadow(
              0 0 4px
              rgba(255,255,255,.20)
            )
            drop-shadow(
              0 0 11px
              rgba(255,255,255,.08)
            );
        }

        /* ==================================================
           GALLERY HEADING
        ================================================== */

        .gallery-heading-base {
          fill: url(#galleryFillGradient);
          stroke: none;
          paint-order: normal;
          filter: url(#galleryPremiumShadow);
        }

        .gallery-heading-inner {
          fill: url(#galleryInnerGradient);
          stroke: none;
          opacity: .34;
          pointer-events: none;
        }

        .gallery-heading-shine {
          fill: url(#galleryShineGradient);
          stroke: none;
          paint-order: normal;
          pointer-events: none;
          opacity: .88;
          mix-blend-mode: screen;

          filter:
            drop-shadow(
              0 0 4px
              rgba(255,255,255,.20)
            )
            drop-shadow(
              0 0 11px
              rgba(255,255,255,.08)
            );
        }

        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 768px) {
          .neon-heading-svg {
            width: min(720px, 96vw);
          }

          .gallery-neon-svg {
            width: min(560px, 96vw);
          }
        }

        /* ==================================================
           REDUCED MOTION
        ================================================== */

        @media (prefers-reduced-motion: reduce) {
          .animate-galleryScroll,
          .section2-character-pop {
            animation: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          FULL PAGE BACKGROUND VIDEO
      ===================================================== */}

      {!videoReady && (
        <div
          className="
            absolute
            inset-0
            z-0
            bg-black
          "
          aria-hidden="true"
        />
      )}

      {/* FULL SECTION VIDEO WRAPPER */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          h-full
          w-full
          overflow-hidden
        "
      >
        <video
          ref={videoRef}
          src={characterVideo}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
          style={{
            filter:
              `brightness(${backgroundBrightness}) saturate(0.58) contrast(1.06)`,
          }}
        />

        {/* =================================================
            CINEMATIC VERTICAL FADE
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_55%,rgba(0,0,0,.25)_70%,rgba(0,0,0,.65)_88%,#000_100%)]
          "
        />

        {/* =================================================
            SIDE FADE
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[linear-gradient(to_right,rgba(0,0,0,.45)_0%,transparent_18%,transparent_82%,rgba(0,0,0,.45)_100%)]
          "
        />
      </div>

      {/* =====================================================
          BLACK BACKGROUND TONE
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
          bg-black/42
        "
        aria-hidden="true"
      />

      {/* EXTRA DARK CINEMATIC VEIL */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
          bg-[linear-gradient(180deg,rgba(0,0,0,.48)_0%,rgba(0,0,0,.28)_38%,rgba(0,0,0,.58)_100%)]
        "
        aria-hidden="true"
      />

      {/* =====================================================
          CENTER LIGHT
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[2]
          bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.018)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.62)_100%)]
        "
        aria-hidden="true"
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          px-5
          py-20
          md:px-10
          lg:px-16
        "
      >
        <div
          className="
            mx-auto
            max-w-[1700px]
          "
        >
          {/* =================================================
              WHY JOIN US
          ================================================= */}

          <div
            ref={whyJoinRef}
            className={`
              mb-14
              text-center
              transform
              transition-all
              duration-1000
              ease-[cubic-bezier(0.16,1,0.3,1)]
              ${
                whyJoinVisible
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-24 opacity-0 scale-95"
              }
            `}
          >
            <p
              className="
                samurai-label
                mb-4
                text-xs
                font-medium
                uppercase
                tracking-[0.35em]
                text-white/45
              "
            >
              Level Up Your Experience
            </p>

            <div className="neon-heading-wrap">
              <svg
                className="neon-heading-svg"
                viewBox="0 0 720 105"
                preserveAspectRatio="xMidYMid meet"
                role="heading"
                aria-level="2"
                aria-label="WHY JOIN US?"
              >
                <defs>
                  <linearGradient
                    id="headingFillGradient"
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
                    id="headingInnerGradient"
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

                  <linearGradient
                    id="headingShineGradient"
                    gradientUnits="userSpaceOnUse"
                    x1="-260"
                    y1="0"
                    x2="-80"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    />

                    <stop
                      offset="38%"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    />

                    <stop
                      offset="50%"
                      stopColor="#ffffff"
                      stopOpacity="0.92"
                    />

                    <stop
                      offset="62%"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    />

                    <stop
                      offset="100%"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    />

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
                    id="headingPremiumShadow"
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

                <text
                  x="360"
                  y="76"
                  textAnchor="middle"
                  fontSize="76"
                  fontWeight="700"
                  letterSpacing="-1"
                  className="neon-heading-base"
                >
                  WHY JOIN US?
                </text>

                <text
                  x="360"
                  y="76"
                  textAnchor="middle"
                  fontSize="76"
                  fontWeight="700"
                  letterSpacing="-1"
                  className="neon-heading-inner"
                >
                  WHY JOIN US?
                </text>

                <text
                  x="360"
                  y="76"
                  textAnchor="middle"
                  fontSize="76"
                  fontWeight="700"
                  letterSpacing="-1"
                  className="neon-heading-shine"
                >
                  WHY JOIN US?
                </text>
              </svg>
            </div>

            {/* DIVIDER */}

            <div
              className="
                mx-auto
                mt-6
                flex
                w-44
                items-center
                justify-center
                gap-2
              "
            >
              <span
                className="
                  h-px
                  flex-1
                  bg-gradient-to-r
                  from-transparent
                  via-white/45
                  to-white/15
                "
              />

              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-white
                  shadow-[0_0_12px_rgba(255,255,255,.4)]
                "
              />

              <span
                className="
                  h-px
                  flex-1
                  bg-gradient-to-r
                  from-white/15
                  via-white/45
                  to-transparent
                "
              />
            </div>
          </div>

          {/* =================================================
              FEATURE CARDS
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              gap-6
              md:grid-cols-3
            "
          >
            {features.map((feature) => (
              <div
                key={feature.number}
                className="
                  group
                  relative
                  min-h-[230px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/20
                  bg-black/62
                  p-7
                  shadow-[0_12px_35px_rgba(0,0,0,.6),inset_0_1px_0_rgba(255,255,255,.08)]
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  hover:border-white/60
                  hover:shadow-[0_0_35px_rgba(255,255,255,.14)]
                "
              >
                <div
                  className="
                    absolute
                    left-0
                    top-0
                    h-px
                    w-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/60
                    to-transparent
                  "
                />

                <div
                  className="
                    absolute
                    right-6
                    top-5
                    text-xs
                    font-medium
                    tracking-[0.3em]
                    text-white/20
                  "
                >
                  {feature.number}
                </div>

                <div
                  className="
                    mb-8
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/30
                    bg-white/[0.035]
                    text-xl
                    text-white
                    shadow-[inset_0_0_20px_rgba(255,255,255,.025)]
                    transition-all
                    duration-500
                    group-hover:border-white/65
                    group-hover:bg-white/[0.07]
                  "
                >
                  {feature.icon}
                </div>

                <h3
                  className="
                    samurai-display
                    text-2xl
                    font-semibold
                    tracking-tight
                    text-white
                  "
                >
                  {feature.title}
                </h3>

                <p
                  className="
                    mt-4
                    max-w-md
                    font-sans
                    text-sm
                    leading-6
                    text-white/55
                  "
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* =================================================
              GALLERY HEADING
          ================================================= */}

          <div
            ref={galleryRef}
            className={`
              mb-10
              mt-28
              text-center
              transform
              transition-all
              duration-1000
              ease-[cubic-bezier(0.16,1,0.3,1)]
              ${
                galleryVisible
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-24 opacity-0 scale-95"
              }
            `}
          >
            <p
              className="
                samurai-label
                mb-4
                text-xs
                uppercase
                tracking-[0.35em]
                text-white/40
              "
            >
              Moments From The Arena
            </p>

            <div className="neon-heading-wrap">
              <svg
                className="gallery-neon-svg"
                viewBox="0 0 560 105"
                preserveAspectRatio="xMidYMid meet"
                role="heading"
                aria-level="2"
                aria-label="GALLERY"
              >
                <defs>
                  <linearGradient
                    id="galleryFillGradient"
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
                    id="galleryInnerGradient"
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

                  <linearGradient
                    id="galleryShineGradient"
                    gradientUnits="userSpaceOnUse"
                    x1="-260"
                    y1="0"
                    x2="-80"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    />

                    <stop
                      offset="38%"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    />

                    <stop
                      offset="50%"
                      stopColor="#ffffff"
                      stopOpacity=".92"
                    />

                    <stop
                      offset="62%"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    />

                    <stop
                      offset="100%"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    />

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
                    id="galleryPremiumShadow"
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

                <text
                  x="280"
                  y="76"
                  textAnchor="middle"
                  fontSize="76"
                  fontWeight="700"
                  letterSpacing="-1"
                  className="gallery-heading-base"
                >
                  GALLERY
                </text>

                <text
                  x="280"
                  y="76"
                  textAnchor="middle"
                  fontSize="76"
                  fontWeight="700"
                  letterSpacing="-1"
                  className="gallery-heading-inner"
                >
                  GALLERY
                </text>

                <text
                  x="280"
                  y="76"
                  textAnchor="middle"
                  fontSize="76"
                  fontWeight="700"
                  letterSpacing="-1"
                  className="gallery-heading-shine"
                >
                  GALLERY
                </text>
              </svg>
            </div>

            {/* GALLERY DIVIDER */}

            <div
              className="
                mx-auto
                mt-6
                flex
                w-44
                items-center
                justify-center
                gap-2
              "
            >
              <span
                className="
                  h-px
                  flex-1
                  bg-gradient-to-r
                  from-transparent
                  via-white/45
                  to-white/15
                "
              />

              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-white
                  shadow-[0_0_12px_rgba(255,255,255,.4)]
                "
              />

              <span
                className="
                  h-px
                  flex-1
                  bg-gradient-to-r
                  from-white/15
                  via-white/45
                  to-transparent
                "
              />
            </div>

            <p
              className="
                mx-auto
                mt-4
                max-w-2xl
                font-sans
                text-sm
                text-white/50
                md:text-base
              "
            >
              Explore moments from our tournaments,
              events, and community gatherings.
            </p>
          </div>
        </div>

        {/* ===================================================
            GALLERY STRIP
        =================================================== */}

        <div
          className="
            relative
            left-1/2
            w-screen
            -translate-x-1/2
            overflow-hidden
          "
        >
          {/* LEFT FADE */}

          <div
            className="
              pointer-events-none
              absolute
              left-0
              top-0
              z-20
              h-full
              w-24
              bg-gradient-to-r
              from-black
              to-transparent
              md:w-40
            "
          />

          {/* RIGHT FADE */}

          <div
            className="
              pointer-events-none
              absolute
              right-0
              top-0
              z-20
              h-full
              w-24
              bg-gradient-to-l
              from-black
              to-transparent
              md:w-40
            "
          />

          {/* SCROLLING IMAGES */}

          <div
            className="
              flex
              w-max
              animate-galleryScroll
              gap-5
            "
          >
            {[...galleryImages, ...galleryImages].map(
              (image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="
                    group
                    relative
                    h-[180px]
                    w-[280px]
                    flex-shrink-0
                    overflow-hidden
                    rounded-xl
                    border
                    border-white/30
                    bg-black/70
                    p-[2px]
                    shadow-[0_0_22px_rgba(255,255,255,.10)]
                  "
                >
                  <div
                    className="
                      relative
                      h-full
                      w-full
                      overflow-hidden
                      rounded-[10px]
                    "
                  >
                    <img
                      src={image}
                      alt={`Gallery moment ${
                        (index % galleryImages.length) + 1
                      }`}
                      loading="lazy"
                      decoding="async"
                      className="
                        h-full
                        w-full
                        object-cover
                        brightness-[0.72]
                        contrast-[1.08]
                        saturate-[0.72]
                        transition-transform
                        duration-700
                        group-hover:scale-110
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/65
                        via-transparent
                        to-transparent
                      "
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <div className="h-16" />
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

export default ScrollSection2;