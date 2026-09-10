import { useEffect, useState } from "react";
import characterImage from "../assets/ch2.png";

const Hero = () => {
  const [showSponsors, setShowSponsors] = useState(false);
  const [characterVisible, setCharacterVisible] = useState(false);
  const [characterScrollProgress, setCharacterScrollProgress] = useState(0);
  const [heroEnded, setHeroEnded] = useState(false);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  const scrollDown = () => {
    document.getElementById("about")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // ==========================================
  // SPONSOR LOGOS
  // ==========================================

  const sponsorLogos = [
    "/brand1.png",
    "/brand2.png",
    "/brand3.png",
    "/brand4.png",
  ];

  // ==========================================
  // EVENT ↔ SPONSORS
  // ==========================================

  useEffect(() => {
    const interval = setInterval(() => {
      setShowSponsors((prev) => !prev);
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // CHARACTER + SCROLL TRANSITION
  // ==========================================

  useEffect(() => {
    const showTimer = window.setTimeout(() => {
      setCharacterVisible(true);
    }, 250);

    const handleScroll = (isUserScroll = false) => {
      const hero = document.querySelector(".hero-section");

      if (!hero) return;

      const scrollY =
        window.scrollY || window.pageYOffset;

      const heroHeight = hero.offsetHeight;

      /*
        IMPORTANT:
        The initial page-load calculation must NEVER trigger
        the character exit animation.

        The exit starts only after a real scroll event.
      */

      if (isUserScroll) {
        setHasUserScrolled(true);
      }

      /*
        Before the first real scroll:
        keep character completely untouched.
      */

      if (!isUserScroll && !hasUserScrolled) {
        setCharacterScrollProgress(0);
        setHeroEnded(false);
        return;
      }

      const transitionStart =
        heroHeight * 0.03;

      const transitionEnd =
        heroHeight * 0.68;

      const progress = Math.min(
        1,
        Math.max(
          0,
          (scrollY - transitionStart) /
            (transitionEnd - transitionStart)
        )
      );

      setCharacterScrollProgress(progress);

      /*
        HARD EXIT:
        remove the character before Page 2.
      */

      if (
        scrollY >= heroHeight * 0.78 ||
        hero.getBoundingClientRect().bottom <= 0
      ) {
        setHeroEnded(true);
        setCharacterScrollProgress(1);
      } else {
        setHeroEnded(false);
      }
    };

    /*
      Initial check:
      NEVER starts the exit animation.
    */

    handleScroll(false);


    const onUserScroll = () => handleScroll(true);

    window.addEventListener(
      "scroll",
      onUserScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      handleScroll
    );

    return () => {
      window.clearTimeout(showTimer);

      window.removeEventListener(
        "scroll",
        onUserScroll
      );

      window.removeEventListener(
        "resize",
        handleScroll
      );
    };
  }, []);

  // ==========================================
  // CHARACTER SCROLL VALUES
  // ==========================================

  const viewportHeight =
    typeof window !== "undefined"
      ? window.innerHeight
      : 800;

  /*
    Keep the entrance separate from scroll exit.
  */

  const exitProgress = hasUserScrolled
    ? Math.min(
        1,
        Math.max(
          0,
          characterScrollProgress
        )
      )
    : 0;

  /*
    CINEMATIC SHRINK + BLUR EXIT

    The character stays in place while
    subtly shrinking, blurring and fading out.

    It does NOT travel into Page 2.
  */

  const characterTranslateY = 0;

  /*
    Subtle shrink.
    1.00 -> 0.92
  */

  const characterScale =
    1 -
    exitProgress * 0.06;

  /*
    Smooth fade.
    Force exact ZERO near the end.
  */

  const characterOpacity = !hasUserScrolled
    ? 0.82
    : 0.45 +
      (0.82 - 0.45) *
        Math.pow(
          1 - exitProgress,
          1.15
        );

  /*
    Cinematic blur increases gently.
    0px -> 8px
  */

  const characterBlur = hasUserScrolled
    ? Math.pow(exitProgress, 1.2) * 5
    : 0;

  return (
    <section
      className="
        hero-section
        relative
        z-10
        h-screen
        min-h-screen
        w-full
        overflow-hidden
        text-white
        isolate
      "
    >
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        /* ==================================================
           FONTS
        ================================================== */

        .hero-font {
          font-family: 'Inter', sans-serif;
          font-variant-numeric: tabular-nums;
        }

        /*
          SAME SAMURAI FONT AS NITS ESPORTS
        */

        .samurai-font,
        .samurai-display,
        .samurai-label,
        .hero-description,
        .hero-status {
          font-family: 'The Last Shuriken', sans-serif;
        }

        .samurai-display {
          font-weight: 700;
          letter-spacing: 0.025em;

          text-shadow:
            0 4px 0 rgba(0, 0, 0, .72),
            0 7px 18px rgba(0, 0, 0, .72),
            0 0 12px rgba(255, 255, 255, .10);
        }

        .samurai-label {
          letter-spacing: 0.22em;

          text-shadow:
            0 2px 7px rgba(0, 0, 0, .70),
            0 0 8px rgba(255, 255, 255, .08);
        }

        /* ==================================================
           TICKER
        ================================================== */

        /*
          TICKER DIRECTION
          Complete LEFT -> RIGHT movement.
          Both Latest Event and Sponsors use this animation.
        */
        @keyframes synchronizedTicker {
          0% {
            transform: translate3d(-100%, 0, 0);
          }

          100% {
            transform: translate3d(100vw, 0, 0);
          }
        }

        .event-ticker,
        .sponsor-ticker {
          width: max-content;
          flex: 0 0 auto;

          animation:
            synchronizedTicker
            18s
            linear
            infinite;

          will-change: transform;

          transform: translate3d(0, 0, 0);
        }

        .ticker-group {
          display: flex;
          flex: 0 0 100vw;
          min-width: 100vw;

          align-items: center;

          gap: 2.5rem;

          padding-left: 145px;
          padding-right: 40px;

          box-sizing: border-box;
        }

        .ticker-premium-text {
          position: relative;

          color: rgba(255, 255, 255, .72);

          text-shadow:
            0 1px 0 rgba(255, 255, 255, .16),
            0 0 5px rgba(255, 255, 255, .10),
            0 0 14px rgba(255, 255, 255, .07);

          filter:
            drop-shadow(
              0 2px 4px rgba(0, 0, 0, .55)
            );
        }

        .ticker-premium-symbol {
          color: rgba(255, 255, 255, .88);

          text-shadow:
            0 0 5px rgba(255, 255, 255, .35),
            0 0 12px rgba(255, 255, 255, .14);

          filter:
            drop-shadow(
              0 2px 3px rgba(0, 0, 0, .65)
            );
        }

        .event-ticker:hover,
        .sponsor-ticker:hover {
          animation-play-state: paused;
        }

        .sponsor-logo {
          height: 20px;
          width: auto;
          max-width: 80px;

          object-fit: contain;

          opacity: 0.65;

          filter:
            grayscale(1)
            contrast(1.08)
            drop-shadow(
              0 2px 4px rgba(0, 0, 0, .55)
            );

          transition:
            opacity 300ms ease,
            transform 300ms ease,
            filter 300ms ease;
        }

        .sponsor-logo:hover {
          opacity: 1;

          transform: scale(1.05);

          filter:
            grayscale(1)
            contrast(1.15)
            drop-shadow(
              0 3px 7px rgba(255, 255, 255, .14)
            );
        }

        .ticker-switch {
          transition:
            opacity 450ms ease,
            transform 450ms ease;
        }

        .ticker-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .ticker-hidden {
          opacity: 0;
          transform: translateY(5px);
        }

        /* ==================================================
           NITS ESPORTS TITLE
           
           NO BORDER
           NO STROKE
           NO OUTLINE
        ================================================== */

        .neon-title-svg {
          display: block;

          width: min(92vw, 1000px);
          height: auto;

          overflow: visible;

          pointer-events: none;
        }

        .title-text {
          font-size: 60px;
        }

        @media (min-width: 640px) {
          .title-text {
            font-size: 72px;
          }
        }

        @media (min-width: 768px) {
          .title-text {
            font-size: 84px;
          }
        }

        @media (min-width: 1024px) {
          .title-text {
            font-size: 92px;
          }
        }

        .neon-title-base {
          fill: url(#titleFillGradient);

          stroke: none;

          paint-order: normal;

          filter: url(#premiumTitleShadow);
        }

        /*
          Subtle metallic depth.
          NOT a border.
        */

        .neon-title-inner {
          fill: url(#titleInnerGradient);

          stroke: none;

          opacity: .34;

          pointer-events: none;
        }

        .neon-title-border {
          display: none;
        }

        /* ==================================================
           PREMIUM MOVING SHINE

           Highlight stays INSIDE the text.
           No border, no outline, no stroke.
        ================================================== */

        .neon-title-shine {
          fill: url(#titleShineGradient);
          stroke: none;
          paint-order: normal;
          pointer-events: none;
          opacity: .88;
          mix-blend-mode: screen;
          filter:
            drop-shadow(0 0 4px rgba(255,255,255,.20))
            drop-shadow(0 0 11px rgba(255,255,255,.08));
        }

        /* ==================================================
           CHARACTER ENTRANCE
        ================================================== */

        @keyframes homeCharacterPop {
          0% {
            opacity: 0;

            transform:
              translate3d(-50%, 100%, 0)
              scale(.52);
          }

          60% {
            opacity: 1;

            transform:
              translate3d(-50%, -4px, 0)
              scale(1.01);
          }

          100% {
            opacity: 1;

            transform:
              translate3d(-50%, 0, 0)
              scale(1);
          }
        }

        /*
          CHARACTER

          The character is absolute and clipped by
          the Hero's overflow-hidden boundary.

          During scroll it SHRINKS + BLURS + FADES,
          then is removed before Page 2.
        */

        .home-character {
          --character-size:
            clamp(430px, 49vw, 700px);

          --character-left: 50%;

          --character-bottom: -285px;

          /* IMPORTANT: keep the character INSIDE the Hero.
             Fixed positioning was allowing it to bleed into Page 2. */
          position: absolute;

          left: var(--character-left);
          bottom: var(--character-bottom);

          z-index: 5;

          width: var(--character-size);
          height: auto;

          pointer-events: none;

          transform-origin: center bottom;
          transform-style: preserve-3d;

          will-change:
            transform,
            opacity,
            filter;

          filter:
            grayscale(1)
            saturate(0)
            contrast(1.08)
            brightness(.90);

          mix-blend-mode: multiply;

          opacity: .82;

          backface-visibility: hidden;

          -webkit-mask-image:
            radial-gradient(
              ellipse 82% 94% at 50% 54%,
              #000 0%,
              #000 48%,
              rgba(0, 0, 0, .96) 62%,
              rgba(0, 0, 0, .72) 76%,
              rgba(0, 0, 0, .30) 90%,
              transparent 100%
            );

          mask-image:
            radial-gradient(
              ellipse 82% 94% at 50% 54%,
              #000 0%,
              #000 48%,
              rgba(0, 0, 0, .96) 62%,
              rgba(0, 0, 0, .72) 76%,
              rgba(0, 0, 0, .30) 90%,
              transparent 100%
            );
        }

        .home-character-pop {
          animation:
            homeCharacterPop
            850ms
            cubic-bezier(.16, 1, .3, 1)
            both;
        }

        .home-character-exiting {
          animation: none !important;
        }

        /* Absolute + Hero overflow-hidden guarantees the character
           can never render outside the Hero section. */
        .hero-section .home-character {
          max-width: none;
        }

        /* ==================================================
           CHARACTER VIGNETTE
        ================================================== */

        .character-blend-vignette {
          position: absolute;

          left: 50%;
          top: 61%;

          width: min(760px, 78vw);
          height: min(620px, 62vh);

          transform:
            translate(-50%, -50%);

          pointer-events: none;

          z-index: 4;

          border-radius: 50%;

          background:
            radial-gradient(
              ellipse at center,
              rgba(0, 0, 0, .30) 0%,
              rgba(0, 0, 0, .18) 38%,
              rgba(0, 0, 0, .07) 62%,
              transparent 82%
            );

          filter: blur(34px);

          opacity: .72;

          transition:
            opacity 400ms ease;
        }

        /* ==================================================
           DESCRIPTION
        ================================================== */

        .hero-description {
          margin-top: 28px;

          max-width: 680px;

          font-size: clamp(
            15px,
            1.35vw,
            19px
          );

          font-weight: 500;

          line-height: 1.9;

          letter-spacing: .08em;

          color: rgba(255, 255, 255, .72);

          text-shadow:
            0 3px 12px rgba(0, 0, 0, .90),
            0 0 10px rgba(0, 0, 0, .55);
        }

        .hero-description-main {
          color: rgba(255, 255, 255, .78);
        }

        .hero-description-main strong {
          color: #ffffff;

          font-weight: 600;

          text-shadow:
            0 2px 8px rgba(0, 0, 0, .95),
            0 0 8px rgba(255, 255, 255, .08);
        }

        .hero-tagline {
          margin-top: 4px;

          color: rgba(255, 255, 255, .68);

          letter-spacing: .14em;
        }

        .hero-tagline .word-one {
          color: rgba(255, 255, 255, .54);
        }

        .hero-tagline .word-two {
          color: rgba(255, 255, 255, .72);
        }

        .hero-tagline .word-three {
          color: rgba(255, 255, 255, .90);
        }

        /* ==================================================
           STATUS
        ================================================== */

        .hero-status {
          margin-top: 28px;

          display: flex;

          align-items: center;

          gap: 9px;

          border-radius: 999px;

          border: 1px solid rgba(
            255,
            255,
            255,
            .10
          );

          background: rgba(
            0,
            0,
            0,
            .34
          );

          padding:
            9px 17px;

          box-shadow:
            0 0 20px
            rgba(
              255,
              255,
              255,
              .06
            );

          backdrop-filter:
            blur(12px);

          color:
            rgba(
              255,
              255,
              255,
              .52
            );

          font-size: 10px;

          font-weight: 500;

          letter-spacing: .20em;

          text-transform: uppercase;

          text-shadow:
            0 2px 7px
            rgba(
              0,
              0,
              0,
              .8
            );
        }

        /* ==================================================
           SCROLL DOWN
        ================================================== */

        .hero-scroll-button {
          position: fixed !important;

          left: 50% !important;

          bottom: 28px !important;

          top: auto !important;

          transform:
            translateX(-50%) !important;

          z-index: 1000 !important;

          pointer-events: auto;

          isolation: isolate;

          transition:
            opacity 400ms ease,
            transform 300ms ease;
        }

        .hero-scroll-button:hover {
          transform:
            translateX(-50%)
            translateY(-4px) !important;
        }

        /*
          When Hero is passed, hide the scroll control.
        */

        .hero-scroll-button.hero-scroll-hidden {
          opacity: 0 !important;
          pointer-events: none;
          visibility: hidden;
        }

        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 640px) {
          .home-character {
            --character-size:
              clamp(
                370px,
                78vw,
                590px
              );

            --character-left: 50%;

            --character-bottom: -245px;
          }

          .hero-scroll-button {
            left: 50% !important;

            bottom: 22px !important;

            transform:
              translateX(-50%) !important;

            z-index: 1000 !important;
          }

          .hero-scroll-button:hover {
            transform:
              translateX(-50%)
              translateY(-4px) !important;
          }

          .character-blend-vignette {
            top: 63%;

            width: 100vw;

            height: 58vh;

            opacity: .62;
          }

          .sponsor-logo {
            height: 17px;

            max-width: 65px;
          }

          .event-ticker,
          .sponsor-ticker {
            animation-duration: 18s;
          }

          .ticker-group {
            flex: 0 0 auto;

            min-width: max-content;

            gap: 1.75rem;

            padding-left: 125px;

            padding-right: 30px;
          }

          .hero-description {
            max-width: 92vw;

            font-size: 13px;

            line-height: 1.85;

            letter-spacing: .075em;
          }

          .hero-status {
            margin-top: 22px;

            font-size: 8px;

            letter-spacing: .17em;

            padding:
              8px 13px;
          }
        }

        /* ==================================================
           BOTTOM CONNECTOR
        ================================================== */

        @keyframes samuraiConnectorFlow {
          0% {
            transform:
              translateX(-130%);

            opacity: 0;
          }

          12% {
            opacity: .85;
          }

          50% {
            opacity: 1;
          }

          88% {
            opacity: .85;
          }

          100% {
            transform:
              translateX(430%);

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
              rgba(255, 255, 255, .95),
              transparent
            );

          filter: blur(.4px);

          animation:
            samuraiConnectorFlow
            18s
            linear
            infinite;

          will-change:
            transform,
            opacity;
        }

        /* ==================================================
           REDUCED MOTION
        ================================================== */

        @media (prefers-reduced-motion: reduce) {
          .event-ticker,
          .sponsor-ticker,
          .home-character-pop,
          .samurai-connector-flow {
            animation: none;
          }

          .neon-title-shine {
            opacity: 0;
          }

          .home-character {
            transition: none;
          }
        }
      `}</style>

      {/* ==================================================
          CINEMATIC ATMOSPHERE
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-b
          from-[#05000d]/40
          via-[#080016]/10
          to-[#020208]/70
        "
      />

      {/* ==================================================
          WHITE ATMOSPHERE
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[48%]
          h-[520px]
          w-[620px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-white/[0.025]
          blur-[170px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[52%]
          h-[560px]
          w-[680px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-black/25
          blur-[150px]
        "
      />

      {/* ==================================================
          GRID
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.08]
          [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)]
          [background-size:80px_80px]
        "
      />

      {/* ==================================================
          TICKER
      ================================================== */}

      <div
        className="
          hero-font
          absolute
          left-0
          right-0
          top-[112px]
          z-40
          h-9
          overflow-hidden
          border-y
          border-white/10
          bg-black/20
          backdrop-blur-[2px]
        "
      >
        {/* LABEL */}

        <div
          className={`
            absolute
            left-0
            top-0
            z-30
            flex
            h-full
            items-center
            border-r
            px-4
            transition-all
            duration-500
            ${
              showSponsors
                ? "border-white/15 bg-black/20"
                : "border-white/15 bg-black/25"
            }
          `}
        >
          <span
            className={`
              mr-2
              h-1.5
              w-1.5
              rounded-full
              ${
                showSponsors
                  ? "bg-white/70 shadow-[0_0_8px_rgba(255,255,255,.28)]"
                  : "bg-white/75 shadow-[0_0_8px_rgba(255,255,255,.30)]"
              }
            `}
          />

          <span
            className="
              whitespace-nowrap
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-white/50
            "
          >
            {showSponsors
              ? "Sponsors"
              : "Latest Event"}
          </span>
        </div>

        {/* EVENT */}

        <div
          className={`
            ticker-switch
            absolute
            inset-0
            flex
            items-center
            overflow-hidden
            ${
              showSponsors
                ? "ticker-hidden pointer-events-none"
                : "ticker-visible"
            }
          `}
        >
          <div className="event-ticker">
            <div className="ticker-group">

              <span
                className="
                  ticker-premium-text
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                "
              >
                NITS ESPORTS
                CHAMPIONSHIP 2026
              </span>

              <span className="ticker-premium-symbol">
                ◆
              </span>

              <span
                className="
                  ticker-premium-text
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                "
              >
                REGISTRATIONS ARE
                NOW OPEN
              </span>

              <span className="ticker-premium-symbol">
                ◆
              </span>

              <span
                className="
                  ticker-premium-text
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                "
              >
                BATTLE FOR THE CROWN
              </span>

              <span className="ticker-premium-symbol">
                ◆
              </span>

            </div>
          </div>
        </div>

        {/* SPONSORS */}

        <div
          className={`
            ticker-switch
            absolute
            inset-0
            flex
            items-center
            overflow-hidden
            ${
              showSponsors
                ? "ticker-visible"
                : "ticker-hidden pointer-events-none"
            }
          `}
        >
          <div className="sponsor-ticker">
            <div className="ticker-group">

              {sponsorLogos.map(
                (logo, index) => (
                  <div
                    key={`${logo}-${index}`}
                    className="
                      flex
                      h-7
                      min-w-[80px]
                      items-center
                      justify-center
                      px-2
                    "
                  >
                    <img
                      src={logo}
                      alt={`Sponsor ${
                        index + 1
                      }`}
                      className="sponsor-logo"
                    />
                  </div>
                )
              )}

            </div>
          </div>
        </div>

        {/* RIGHT FADE */}

        <div
          className="
            pointer-events-none
            absolute
            right-0
            top-0
            z-20
            h-full
            w-16
            bg-gradient-to-l
            from-black/25
            to-transparent
          "
        />
      </div>

      {/* ==================================================
          HERO CONTENT
      ================================================== */}

      <div
        className="
          hero-font
          relative
          z-20
          flex
          h-full
          flex-col
          items-center
          justify-center
          px-6
          text-center
        "
      >
        {/* ==================================================
            NIT SILCHAR
        ================================================== */}

        <div
          className="
            samurai-font
            mb-6
            flex
            items-center
            gap-3
          "
        >
          <span
            className="
              h-px
              w-10
              bg-gradient-to-r
              from-transparent
              to-white/45
            "
          />

          <p
            className="
              samurai-label
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.45em]
              text-white/70
            "
          >
            NIT SILCHAR
          </p>

          <span
            className="
              h-px
              w-10
              bg-gradient-to-l
              from-transparent
              to-white/45
            "
          />
        </div>

        {/* ==================================================
            MAIN TITLE
        ================================================== */}

        <div
          className="
            relative
            inline-block
          "
        >
          <svg
            className="neon-title-svg"
            viewBox="0 0 1000 120"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>

              {/* MAIN METALLIC GRADIENT */}

              <linearGradient
                id="titleFillGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#ffffff"
                />

                <stop
                  offset="14%"
                  stopColor="#f1f1f1"
                />

                <stop
                  offset="30%"
                  stopColor="#c8c8c8"
                />

                <stop
                  offset="46%"
                  stopColor="#7d7d7d"
                />

                <stop
                  offset="60%"
                  stopColor="#555555"
                />

                <stop
                  offset="72%"
                  stopColor="#8f8f8f"
                />

                <stop
                  offset="86%"
                  stopColor="#d9d9d9"
                />

                <stop
                  offset="100%"
                  stopColor="#ffffff"
                />
              </linearGradient>

              {/* INNER METALLIC DEPTH */}

              <linearGradient
                id="titleInnerGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#ffffff"
                />

                <stop
                  offset="38%"
                  stopColor="#dddddd"
                />

                <stop
                  offset="58%"
                  stopColor="#666666"
                />

                <stop
                  offset="78%"
                  stopColor="#bdbdbd"
                />

                <stop
                  offset="100%"
                  stopColor="#ffffff"
                />
              </linearGradient>

              {/* PREMIUM MOVING SHINE — TEXT ONLY, NO BORDER / NO STROKE */}

              <linearGradient
                id="titleShineGradient"
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

              {/* PREMIUM SHADOW */}

              <filter
                id="premiumTitleShadow"
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

            {/* NITS ESPORTS */}

            <text
              x="50%"
              y="86"
              textAnchor="middle"
              fontFamily="The Last Shuriken, sans-serif"
              fontSize="92"
              fontWeight="700"
              letterSpacing="-4"
              className="
                title-text
                neon-title-base
              "
            >
              NITS ESPORTS
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
              className="
                title-text
                neon-title-inner
              "
            >
              NITS ESPORTS
            </text>

            {/* MOVING PREMIUM SHINE */}

            <text
              x="50%"
              y="86"
              textAnchor="middle"
              fontFamily="The Last Shuriken, sans-serif"
              fontSize="92"
              fontWeight="700"
              letterSpacing="-4"
              className="
                title-text
                neon-title-shine
              "
            >
              NITS ESPORTS
            </text>

          </svg>
        </div>

        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        <div className="hero-description">

          <div className="hero-description-main">
           

            <strong>
              
            </strong>

            
          </div>

          <div className="hero-tagline">
            <span className="word-one">
              Compete.
            </span>{" "}

            <span className="word-two">
              Connect.
            </span>{" "}

            <span className="word-three">
              Conquer.
            </span>
          </div>

        </div>

        {/* ==================================================
            STATUS
        ================================================== */}

        <div className="hero-status">

          <span
            className="
              relative
              flex
              h-2
              w-2
            "
          >
            <span
              className="
                absolute
                inline-flex
                h-full
                w-full
                animate-ping
                rounded-full
                bg-white/70
                opacity-60
              "
            />

            <span
              className="
                relative
                inline-flex
                h-2
                w-2
                rounded-full
                bg-white/70
                shadow-[0_0_10px_rgba(255,255,255,.25)]
              "
            />
          </span>

          <span>
            Official Esports Club
          </span>

        </div>
      </div>

      {/* ==================================================
          CHARACTER VIGNETTE
      ================================================== */}

      <div
        className="character-blend-vignette"
        aria-hidden="true"
      />

      {/* ==================================================
          CHARACTER
      ================================================== */}

      {characterVisible &&
        !heroEnded && (
        <img
          src={characterImage}
          alt=""
          aria-hidden="true"
          className={`
            home-character
            ${hasUserScrolled ? "home-character-exiting" : "home-character-pop"}
          `}
          style={{
            transform: `
              translate3d(
                -50%,
                ${characterTranslateY}px,
                0
              )
              scale(${characterScale})
            `,

            opacity:
              characterOpacity,

            filter: `
              grayscale(1)
              saturate(0)
              contrast(1.08)
              brightness(.90)
              blur(${characterBlur}px)
            `,
          }}
        />
      )}

      {/* ==================================================
          SCROLL DOWN
      ================================================== */}

      <button
        onClick={scrollDown}
        className={`
          hero-font
          hero-scroll-button
          group
          flex
          flex-col
          items-center
          ${
            heroEnded
              ? "hero-scroll-hidden"
              : ""
          }
        `}
      >
        <span
          className="
            mb-3
            text-[9px]
            font-medium
            uppercase
            tracking-[0.45em]
            text-white/60
            transition-colors
            duration-300
            group-hover:text-white/90
          "
        >
          Scroll Down
        </span>

        <div
          className="
            relative
            flex
            h-12
            w-8
            items-start
            justify-center
            rounded-full
            border
            border-white/25
            bg-black/60
            pt-2
            shadow-[0_0_20px_rgba(0,0,0,.65)]
            backdrop-blur-md
            transition-all
            duration-300
            group-hover:border-white/55
            group-hover:bg-black/75
            group-hover:shadow-[0_0_28px_rgba(255,255,255,.12)]
          "
        >
          <span
            className="
              h-2
              w-1
              animate-bounce
              rounded-full
              bg-white/90
              shadow-[0_0_10px_rgba(255,255,255,.35)]
            "
          />
        </div>

        <div
          className="
            mt-2
            h-px
            w-10
            bg-gradient-to-r
            from-transparent
            via-white/60
            to-transparent
            opacity-70
          "
        />
      </button>

      {/* ==================================================
          BOTTOM CONNECTOR
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          z-50
          w-full
        "
      >
        <div
          className="
            relative
            h-[2px]
            w-full
            overflow-hidden
            bg-white/[0.10]
          "
        >
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-transparent
              via-white/45
              to-transparent
            "
          />

          <div
            className="
              samurai-connector-flow
            "
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;