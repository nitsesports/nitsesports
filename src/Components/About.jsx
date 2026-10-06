
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const About = () => {
  const pageRef = useRef(null);

  const values = [
    {
      title: "Excellence",
      description:
        "We strive for excellence in every game we play and every tournament we host.",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-10 w-10"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      ),
    },
    {
      title: "Innovation",
      description:
        "Embracing new gaming technologies and strategies to stay ahead of the curve.",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-10 w-10"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13.2 2.5L5.5 13h5.3l-.9 8.5L18.5 11h-5.3l0-8.5Z" />
        </svg>
      ),
    },
    {
      title: "Community",
      description:
        "Building a supportive and inclusive community for all gaming enthusiasts.",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-10 w-10"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.5 8.5c0-2.8-2.1-5-4.8-5-1.5 0-2.9.7-3.7 1.9C11.1 4.2 9.8 3.5 8.3 3.5c-2.7 0-4.8 2.2-4.8 5 0 5.4 8.5 10.7 8.5 10.7s8.5-5.3 8.5-10.7Z" />
        </svg>
      ),
    },
    {
      title: "Integrity",
      description:
        "Maintaining fair play, sportsmanship, and ethical gaming practices.",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-10 w-10"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3 19 6v5.5c0 4.7-3 7.9-7 9.5-4-1.6-7-4.8-7-9.5V6l7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
  ];

  /* =====================================================
     SCROLL POP-UP ANIMATION
  ===================================================== */

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.className = "merch-starfield-canvas";
    document.body.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.018);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });

    // Same render quality as Hero — intentionally capped for smoothness.
    const getPixelRatio = () =>
      Math.min(window.devicePixelRatio || 1, 1.25);

    renderer.setPixelRatio(getPixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMappingExposure = 1.15;

    // ---------------------------------------------------------
    // PARTICLE TUNNEL — EXACT HERO STAR PROPERTIES
    // ---------------------------------------------------------

    const particleCount = 1400;
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.2 + Math.pow(Math.random(), 0.52) * 11.5;
      const z = -10 + Math.random() * 12;

      particleSpeeds[i] = 0.008 + Math.random() * 0.035;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.sin(a) * r;
      positions[i * 3 + 2] = z;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particlePositionAttribute = particleGeometry.attributes.position;

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.085,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );

    scene.add(particles);

    // ---------------------------------------------------------
    // MOUSE PARALLAX — SAME AS HERO
    // ---------------------------------------------------------

    let mouseX = 0;
    let mouseY = 0;
    let smoothX = 0;
    let smoothY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -((event.clientY / window.innerHeight - 0.5) * 2);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let scrollTarget = 0;
    let scrollCurrent = 0;
    let lastScroll = window.scrollY;

    const handleScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScroll;

      scrollTarget = THREE.MathUtils.clamp(
        scrollTarget + delta * 0.02,
        -3.5,
        9
      );

      lastScroll = current;
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setPixelRatio(getPixelRatio());
      renderer.setSize(width, height, false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    handleResize();

    const clock = new THREE.Clock();
    let animationFrame;
    let time = 0;

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.033);
      time += dt;

      const damping = (speed) => 1 - Math.exp(-speed * dt);

      // Same smooth mouse interpolation as Hero.
      smoothX += (mouseX - smoothX) * damping(9);
      smoothY += (mouseY - smoothY) * damping(9);

      scrollCurrent +=
        (scrollTarget - scrollCurrent) * damping(5.5);

      const cameraZ = 9 - scrollCurrent * 1.35;
      camera.position.z +=
        (cameraZ - camera.position.z) * damping(6);

      // Exact Hero forward star movement.
      for (let i = 0; i < particleCount; i++) {
        const index = i * 3;
        let z = positions[index + 2] + particleSpeeds[i];

        if (z > 3) z = -10;

        positions[index + 2] = z;
      }

      // Exact Hero star-field rotation/parallax.
      particles.rotation.z = time * 0.025;

      particlePositionAttribute.needsUpdate = true;

      if (!document.hidden) {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      particleGeometry.dispose();
      particles.material.dispose();
      renderer.dispose();

      if (canvas.parentNode === document.body) {
        document.body.removeChild(canvas);
      }
    };
  }, []);

  useEffect(() => {
    const container = pageRef.current;

    if (!container) return;

    const elements = container.querySelectorAll(".scroll-pop");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("pop-visible");
          } else {
            entry.target.classList.remove("pop-visible");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -70px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={pageRef}
      className="about-root relative min-h-screen w-full overflow-x-hidden bg-black text-white"
    >
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #000;
        }

        /* =====================================================
           SAMURAI FONT
        ===================================================== */

        .about-root,
        .about-root button,
        .about-root a,
        .about-root p,
        .about-root span,
        .about-root h1,
        .about-root h2,
        .about-root h3 {
          font-family: "The Last Shuriken", sans-serif;
        }

        /* =====================================================
           SCROLL POP-UP
        ===================================================== */

        .scroll-pop {
          opacity: 0;
          transform: translateY(55px) scale(0.97);
          filter: blur(7px);
          transition:
            opacity 0.8s cubic-bezier(.22,1,.36,1),
            transform 0.9s cubic-bezier(.22,1,.36,1),
            filter 0.8s cubic-bezier(.22,1,.36,1);
          will-change: transform, opacity, filter;
        }

        .scroll-pop.pop-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }

        .pop-delay-1 {
          transition-delay: .08s;
        }

        .pop-delay-2 {
          transition-delay: .16s;
        }

        .pop-delay-3 {
          transition-delay: .24s;
        }

        .pop-delay-4 {
          transition-delay: .32s;
        }

        /* =====================================================
           MAIN SAMURAI HEADING
        ===================================================== */

        .about-title-wrap {
          animation:
            aboutTitleReveal
            1100ms
            cubic-bezier(.16,1,.3,1)
            both;
        }

        .about-title-svg {
          display: block;
          width: min(92vw, 1000px);
          height: auto;
          margin: 0 auto;
          overflow: visible;
          pointer-events: none;
        }

        .about-title-text {
          font-family: "The Last Shuriken", sans-serif;
          font-weight: 700;
          letter-spacing: -2px;
        }

        .about-title-base {
          fill: url(#aboutTitleFillGradient);
          stroke: none;
          filter: url(#aboutPremiumTitleShadow);
        }

        .about-title-inner {
          fill: url(#aboutTitleInnerGradient);
          stroke: none;
          opacity: .34;
          pointer-events: none;
        }

        .about-title-shine {
          fill: url(#aboutTitleShineGradient);
          stroke: none;
          opacity: .88;
          mix-blend-mode: screen;
          pointer-events: none;
          filter:
            drop-shadow(0 0 4px rgba(255,255,255,.20))
            drop-shadow(0 0 11px rgba(255,255,255,.08));
        }

        @keyframes aboutTitleReveal {
          0% {
            opacity: 0;
            transform: translateY(22px) scale(.96);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* =====================================================
           SMALL LABEL
        ===================================================== */

        .samurai-label {
          letter-spacing: .42em;
          text-shadow: 0 2px 7px rgba(0,0,0,.75);
        }

        /* =====================================================
           FORGED DIVIDER
        ===================================================== */

        .samurai-line {
          animation: samuraiPulse 3s ease-in-out infinite;
        }

        @keyframes samuraiPulse {
          0%,
          100% {
            opacity: .38;
          }

          50% {
            opacity: .85;
          }
        }

        /* =====================================================
           CINEMATIC BACKGROUND
        ===================================================== */

        .merch-starfield-canvas {
          position: fixed !important;
          inset: 0 !important;
          display: block;
          width: 100vw !important;
          height: 100vh !important;
          min-width: 100vw !important;
          min-height: 100vh !important;
          z-index: 0 !important;
          pointer-events: none !important;
        }

        /* =====================================================
           SAMURAI GLASS CARD
        ===================================================== */

        .samurai-card {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.075),
              rgba(255,255,255,.025) 48%,
              rgba(255,255,255,.045)
            );
          border: 1px solid rgba(255,255,255,.105);
          box-shadow:
            0 28px 80px rgba(0,0,0,.58),
            inset 0 1px 0 rgba(255,255,255,.09),
            inset 0 -1px 0 rgba(255,255,255,.02);
          backdrop-filter: blur(18px) saturate(120%);
          -webkit-backdrop-filter: blur(18px) saturate(120%);
        }

        .samurai-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(255,255,255,.075),
              transparent 34%
            ),
            linear-gradient(
              135deg,
              transparent 60%,
              rgba(255,255,255,.025)
            );
        }

        .samurai-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.52),
              rgba(255,255,255,.16),
              transparent
            );
          opacity: .7;
          pointer-events: none;
        }

        /* =====================================================
           SECTION HEADINGS
        ===================================================== */

        .section-heading {
          font-family: "The Last Shuriken", sans-serif;
          font-weight: 700;
          letter-spacing: .025em;
          text-shadow:
            0 4px 0 rgba(0,0,0,.72),
            0 7px 18px rgba(0,0,0,.72),
            0 0 12px rgba(255,255,255,.10);
        }

        .section-heading::after {
          content: "";
          display: block;
          width: 48px;
          height: 1px;
          margin: 18px auto 0;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.75),
              transparent
            );
          box-shadow: 0 0 12px rgba(255,255,255,.18);
        }

        /* =====================================================
           VALUE CARDS
        ===================================================== */

        .value-card {
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.075),
              rgba(255,255,255,.025) 52%,
              rgba(0,0,0,.16)
            );
          border: 1px solid rgba(255,255,255,.10);
          box-shadow:
            0 20px 55px rgba(0,0,0,.46),
            inset 0 1px 0 rgba(255,255,255,.075);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          transition:
            transform .45s cubic-bezier(.22,1,.36,1),
            border-color .4s ease,
            box-shadow .45s ease,
            background .45s ease;
        }

        .value-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(255,255,255,.075),
              transparent 38%
            );
        }

        .value-card::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0;
          height: 1px;
          background: white;
          box-shadow: 0 0 15px rgba(255,255,255,.45);
          transition: width .55s ease;
        }

        .value-card:hover {
          transform: translateY(-9px);
          border-color: rgba(255,255,255,.25);
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.10),
              rgba(255,255,255,.035) 52%,
              rgba(0,0,0,.20)
            );
          box-shadow:
            0 28px 70px rgba(0,0,0,.62),
            0 0 35px rgba(255,255,255,.045),
            inset 0 1px 0 rgba(255,255,255,.13);
        }

        .value-card:hover::after {
          width: 100%;
        }

        /* =====================================================
           ICON
        ===================================================== */

        .samurai-icon {
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.13),
              rgba(255,255,255,.035)
            );
          border: 1px solid rgba(255,255,255,.13);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.14),
            0 12px 35px rgba(0,0,0,.35);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition:
            transform .4s ease,
            border-color .35s ease,
            background .35s ease;
        }

        .value-card:hover .samurai-icon {
          transform: scale(1.08);
          border-color: rgba(255,255,255,.28);
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.18),
              rgba(255,255,255,.045)
            );
        }

        /* =====================================================
           BODY TEXT
        ===================================================== */

        .samurai-body {
          font-family: "The Last Shuriken", sans-serif;
          color: rgba(255,255,255,.68);
          letter-spacing: .015em;
        }

        /* =====================================================
           JOURNEY
        ===================================================== */

        .journey-item {
          position: relative;
        }

        .journey-item + .journey-item {
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .journey-year {
          font-family: "The Last Shuriken", sans-serif;
          font-weight: 700;
          color: rgba(255,255,255,.72);
          text-shadow: 0 0 15px rgba(255,255,255,.12);
        }

        .journey-title {
          font-family: "The Last Shuriken", sans-serif;
          font-weight: 700;
          letter-spacing: .015em;
          text-shadow:
            0 3px 12px rgba(0,0,0,.75);
        }

        /* =====================================================
           CONTACT
        ===================================================== */

        .contact-item {
          position: relative;
          padding: 21px 22px;
          border: 1px solid rgba(255,255,255,.075);
          background: rgba(0,0,0,.27);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.05),
            0 15px 40px rgba(0,0,0,.25);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition:
            transform .35s ease,
            border-color .35s ease,
            background .35s ease;
        }

        .contact-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 0;
          height: 1px;
          background: white;
          transition: width .45s ease;
        }

        .contact-item:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,.18);
          background: rgba(255,255,255,.045);
        }

        .contact-item:hover::before {
          width: 100%;
        }

        .contact-label {
          font-family: "The Last Shuriken", sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .14em;
          text-shadow: 0 2px 7px rgba(0,0,0,.65);
        }

        /* =====================================================
           SECTION META
        ===================================================== */

        .section-meta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .section-meta-line {
          width: 34px;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.5)
            );
        }

        .section-meta-line.right {
          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,.5),
              transparent
            );
        }

        .section-meta-text {
          font-family: "The Last Shuriken", sans-serif;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .35em;
          color: rgba(255,255,255,.36);
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .about-title-svg {
            width: min(96vw, 700px);
          }

          .scroll-pop {
            transform: translateY(38px) scale(.985);
          }

          .samurai-card {
            border-radius: 14px;
          }

          .value-card {
            min-height: 285px;
          }

          .about-title-text {
            letter-spacing: -3px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {

          .scroll-pop,
          .about-title-wrap {
            opacity: 1;
            transform: none;
            filter: none;
            animation: none;
            transition: none;
          }

          .samurai-line {
            animation: none;
          }
        }
      `}</style>

      {/* =====================================================
          CINEMATIC BACKGROUND
      ===================================================== */}

      {/* =====================================================
          MERCHENDISE THREE.JS BACKGROUND — EXACT COPY
      ===================================================== */}

      <div
        className="pointer-events-none fixed inset-0 z-[2] opacity-[.055]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="pointer-events-none fixed left-[8%] top-[18%] z-[2] h-[320px] w-[420px] rounded-full bg-white/[.075] blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[5%] right-[7%] z-[2] h-[340px] w-[430px] rounded-full bg-white/[.055] blur-[130px]" />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="relative z-10 w-full px-[5%]">

        {/* ===================================================
            ABOUT HERO
        =================================================== */}

        <section
          className="
            flex
            min-h-[500px]
            flex-col
            items-center
            justify-center
            pt-[145px]
            text-center
            sm:pt-[155px]
          "
        >

          {/* SMALL LABEL */}

          <div className="mb-5 flex items-center gap-3 scroll-pop">

            <span
              className="
                h-[1px]
                w-9
                bg-gradient-to-r
                from-transparent
                to-white/60
              "
            />

            <span
              className="
                samurai-label
                text-[9px]
                font-bold
                uppercase
                text-white/45
              "
            >
              NITS ESPORTS
            </span>

            <span
              className="
                h-[1px]
                w-9
                bg-gradient-to-l
                from-transparent
                to-white/60
              "
            />

          </div>

          {/* =================================================
              ABOUT US — SINGLE LINE
          ================================================= */}

          <div className="about-title-wrap relative inline-block w-full">

            <svg
              className="about-title-svg"
              viewBox="0 0 1200 180"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >

              <defs>

                {/* METALLIC WHITE */}

                <linearGradient
                  id="aboutTitleFillGradient"
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

                {/* INNER HIGHLIGHT */}

                <linearGradient
                  id="aboutTitleInnerGradient"
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
                  id="aboutTitleShineGradient"
                  gradientUnits="userSpaceOnUse"
                  x1="-300"
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
                    to="1500 0"
                    dur="3.8s"
                    repeatCount="indefinite"
                  />

                </linearGradient>

                {/* PREMIUM TITLE SHADOW */}

                <filter
                  id="aboutPremiumTitleShadow"
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

              {/* BASE TEXT */}

              <text
                x="50%"
                y="112"
                textAnchor="middle"
                fontFamily="The Last Shuriken, sans-serif"
                fontSize="105"
                fontWeight="700"
                className="
                  about-title-text
                  about-title-base
                "
              >
                ABOUT US
              </text>

              {/* INNER TEXT */}

              <text
                x="50%"
                y="112"
                textAnchor="middle"
                fontFamily="The Last Shuriken, sans-serif"
                fontSize="105"
                fontWeight="700"
                className="
                  about-title-text
                  about-title-inner
                "
              >
                ABOUT US
              </text>

              {/* SHINE TEXT */}

              <text
                x="50%"
                y="112"
                textAnchor="middle"
                fontFamily="The Last Shuriken, sans-serif"
                fontSize="105"
                fontWeight="700"
                className="
                  about-title-text
                  about-title-shine
                "
              >
                ABOUT US
              </text>

            </svg>

          </div>

          {/* FORGED DIVIDER */}

          <div
            className="
              mt-6
              flex
              w-[240px]
              items-center
              gap-3
              sm:w-[360px]
            "
          >

            <div
              className="
                samurai-line
                h-[1px]
                flex-1
                bg-gradient-to-r
                from-transparent
                to-white/60
              "
            />

            <div
              className="
                h-2
                w-2
                rotate-45
                border
                border-white/70
                bg-black
                shadow-[0_0_12px_rgba(255,255,255,.15)]
              "
            />

            <div
              className="
                samurai-line
                h-[1px]
                flex-1
                bg-gradient-to-l
                from-transparent
                to-white/60
              "
            />

          </div>

          {/* DESCRIPTION */}

          <p
            className="
              scroll-pop
              pop-delay-1
              mt-6
              max-w-[850px]
              text-[clamp(15px,1.3vw,19px)]
              leading-[1.7]
              tracking-[.02em]
              text-white/55
            "
          >
            The official esports club of NIT Silchar, dedicated to fostering
            competitive gaming excellence.
          </p>

        </section>

        {/* ===================================================
            OUR MISSION
        =================================================== */}

        <section className="mb-[90px] w-full">

          <div className="mb-9 text-center">

            <div className="section-meta scroll-pop">

              <span className="section-meta-line" />

              <span className="section-meta-text">
                OUR PURPOSE
              </span>

              <span className="section-meta-line right" />

            </div>

            <h2
              className="
                section-heading
                scroll-pop
                m-0
                text-[clamp(31px,3vw,44px)]
                uppercase
              "
            >
              Our Mission
            </h2>

          </div>

          <div
            className="
              samurai-card
              scroll-pop
              mx-auto
              w-full
              max-w-[1400px]
              rounded-[18px]
              px-[8%]
              py-[43px]
              text-center
            "
          >

            <p
              className="
                samurai-body
                mx-auto
                max-w-[1050px]
                text-[clamp(16px,1.25vw,20px)]
                leading-[1.8]
                text-white/70
              "
            >
              To create a thriving esports ecosystem at NIT Silchar that
              nurtures talent, promotes competitive gaming, and builds a
              strong community of passionate gamers. We aim to provide a
              platform where students can develop their skills, compete at the
              highest level, and represent our institution in national and
              international esports tournaments.
            </p>

          </div>

        </section>

        {/* ===================================================
            OUR VALUES
        =================================================== */}

        <section className="mb-[90px] w-full">

          <div className="mb-10 text-center">

            <div className="section-meta scroll-pop">

              <span className="section-meta-line" />

              <span className="section-meta-text">
                WHAT WE STAND FOR
              </span>

              <span className="section-meta-line right" />

            </div>

            <h2
              className="
                section-heading
                scroll-pop
                m-0
                text-[clamp(31px,3vw,44px)]
                uppercase
              "
            >
              Our Values
            </h2>

          </div>

          <div
            className="
              mx-auto
              grid
              w-full
              max-w-[1400px]
              grid-cols-1
              gap-5
              min-[700px]:grid-cols-2
              min-[1100px]:grid-cols-4
            "
          >

            {values.map((value, index) => (

              <div
                key={value.title}
                className={`
                  value-card
                  scroll-pop
                  pop-delay-${index + 1}
                  group
                  flex
                  min-h-[315px]
                  flex-col
                  items-center
                  rounded-[16px]
                  px-[25px]
                  py-[30px]
                  text-center
                `}
              >

                <div
                  className="
                    samurai-icon
                    mb-7
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-full
                    text-white/75
                  "
                >
                  {value.icon}
                </div>

                <h3
                  className="
                    mb-5
                    text-[24px]
                    font-bold
                    uppercase
                    tracking-[.025em]
                    text-white
                  "
                >
                  {value.title}
                </h3>

                <p
                  className="
                    samurai-body
                    m-0
                    text-[16px]
                    leading-[1.7]
                    text-white/55
                  "
                >
                  {value.description}
                </p>

              </div>

            ))}

          </div>

        </section>

        {/* ===================================================
            OUR JOURNEY
        =================================================== */}

        <section className="mb-[90px] w-full">

          <div className="mb-10 text-center">

            <div className="section-meta scroll-pop">

              <span className="section-meta-line" />

              <span className="section-meta-text">
                OUR STORY
              </span>

              <span className="section-meta-line right" />

            </div>

            <h2
              className="
                section-heading
                scroll-pop
                m-0
                text-[clamp(31px,3vw,44px)]
                uppercase
              "
            >
              Our Journey
            </h2>

          </div>

          <div
            className="
              samurai-card
              scroll-pop
              mx-auto
              w-full
              max-w-[1400px]
              rounded-[18px]
              px-5
              py-[25px]
              min-[700px]:px-10
              min-[700px]:py-[35px]
            "
          >

            {/* FOUNDATION */}

            <div
              className="
                journey-item
                grid
                grid-cols-1
                gap-3
                py-5
                min-[700px]:grid-cols-[100px_1fr]
                min-[700px]:gap-5
              "
            >

              <div className="journey-year text-[20px] tracking-[.12em]">
                2025
              </div>

              <div>

                <h3
                  className="
                    journey-title
                    mb-3
                    text-[23px]
                    uppercase
                    text-white
                  "
                >
                  Club Foundation
                </h3>

                <p className="samurai-body m-0 text-[16px] leading-[1.7]">
                  The NIT Silchar Esports Club was officially established with
                  10 founding members passionate about competitive gaming.
                </p>

              </div>

            </div>

            {/* LOCK & LOAD */}

            <div
              className="
                journey-item
                grid
                grid-cols-1
                gap-3
                py-6
                min-[700px]:grid-cols-[100px_1fr]
                min-[700px]:gap-5
              "
            >

              <div className="journey-year text-[20px] tracking-[.12em]">
                2025
              </div>

              <div>

                <h3
                  className="
                    journey-title
                    mb-3
                    text-[23px]
                    uppercase
                    text-white
                  "
                >
                  Lock &amp; Load Esports Module
                </h3>

                <p className="samurai-body m-0 text-[16px] leading-[1.7]">

                  Successfully hosted{" "}

                  <span className="font-bold text-white/85">
                    Lock &amp; Load
                  </span>

                  {" "}— NIT SILCHAR esports module featuring{" "}

                  <strong className="text-white/85">
                    BGMI
                  </strong>
                  ,{" "}

                  <strong className="text-white/85">
                    Valorant
                  </strong>
                  ,{" "}

                  <strong className="text-white/85">
                    CODM
                  </strong>
                  , and{" "}

                  <strong className="text-white/85">
                    MLBB
                  </strong>
                  .

                  {" "}With over{" "}

                  <strong className="text-white/90">
                    500+ participants
                  </strong>

                  {" "}from across the region, the event marked a new milestone
                  in our journey to elevate the collegiate esports scene.

                </p>

              </div>

            </div>

            {/* GENESIS CUP */}
            <div
              className="
                journey-item
                grid
                grid-cols-1
                gap-3
                py-6
                min-[700px]:grid-cols-[100px_1fr]
                min-[700px]:gap-5
              "
            >
              <div className="journey-year text-[20px] tracking-[.12em]">
                2025
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.08em] text-white/70">
                    28th Oct – 5th Nov 2025
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.08em] text-white/70">
                    Online
                  </span>
                </div>

                <h3
                  className="
                    journey-title
                    mb-2
                    text-[23px]
                    uppercase
                    text-white
                  "
                >
                  Genesis Cup (Inter-NIT Esports)
                </h3>

                <p className="samurai-body mb-2 text-[14px] text-white/75">
                  <span className="font-semibold text-white/90">Games Played:</span>{" "}
                  <strong className="text-white/85">BGMI</strong> (Organised &amp; Managed by NITS Esports),{" "}
                  <strong className="text-white/85">Free Fire</strong>,{" "}
                  <strong className="text-white/85">Valorant</strong>,{" "}
                  <strong className="text-white/85">CODM</strong>,{" "}
                  <strong className="text-white/85">Clash Royale</strong>,{" "}
                  <strong className="text-white/85">eFootball</strong>, and{" "}
                  <strong className="text-white/85">Clash of Clans</strong>.
                </p>

                <p className="samurai-body m-0 text-[16px] leading-[1.7]">
                  A nationwide Inter-NIT esports tournament uniting <strong className="text-white/90">15 National Institutes of Technology</strong> and over <strong className="text-white/90">1,400+ participants</strong> across 7 gaming titles, hosted entirely free of cost. NITS Esports Club spearheaded the complete organisation and administration of the marquee <strong className="text-white/85">BGMI</strong> championship, orchestrating competition for <strong className="text-white/90">73 registered squads</strong> across 4 groups and culminating in an intense 2-day, 16-team Grand Finals testing squads on consistency, adaptability, and high-pressure execution across repeated competitive lobbies.
                </p>
              </div>
            </div>

            {/* VANGUARD ARENA */}
            <div
              className="
                journey-item
                grid
                grid-cols-1
                gap-3
                py-6
                min-[700px]:grid-cols-[100px_1fr]
                min-[700px]:gap-5
              "
            >
              <div className="journey-year text-[20px] tracking-[.12em]">
                2026
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.08em] text-white/70">
                    15th – 18th January 2026
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.08em] text-white/70">
                    Hybrid (Online Qualifiers + LAN Finals)
                  </span>
                </div>

                <h3
                  className="
                    journey-title
                    mb-2
                    text-[23px]
                    uppercase
                    text-white
                  "
                >
                  Vanguard Arena — Tecnoesis 2026
                </h3>

                <p className="samurai-body mb-2 text-[14px] text-white/75">
                  <span className="font-semibold text-white/90">Games Played:</span>{" "}
                  <strong className="text-white/85">BGMI</strong>,{" "}
                  <strong className="text-white/85">RC24 (Real Cricket 24)</strong>,{" "}
                  <strong className="text-white/85">FIFA 26</strong>,{" "}
                  <strong className="text-white/85">MLBB (Mobile Legends: Bang Bang)</strong>, and{" "}
                  <strong className="text-white/85">VALORANT</strong>.
                </p>

                <p className="samurai-body m-0 text-[16px] leading-[1.7]">
                  The official Esports module of Tecnoesis 2026, organized by NITS Esports Club, featuring a structured hybrid tournament framework and securing a <strong className="text-white/90">₹50,000 sponsorship from Krafton India Esports</strong> under the College Campus Tour initiative. The module brought together competitive action across 5 diverse titles: <strong className="text-white/85">BGMI</strong> (74 teams, ₹25,000 prize pool), <strong className="text-white/85">VALORANT</strong> (8 elite squads, ₹5,000 prize pool), <strong className="text-white/85">RC24</strong> (32 teams cricket simulation, ₹5,000 prize pool), <strong className="text-white/85">MLBB</strong> (32 teams 5v5 MOBA double elimination, ₹5,000 prize pool), and <strong className="text-white/85">FIFA 26</strong> (24 players football simulation, ₹5,000 prize pool).
                </p>
              </div>
            </div>

            {/* ARTHNITI 2.0 */}
            <div
              className="
                journey-item
                grid
                grid-cols-1
                gap-3
                py-6
                min-[700px]:grid-cols-[100px_1fr]
                min-[700px]:gap-5
              "
            >
              <div className="journey-year text-[20px] tracking-[.12em]">
                2026
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.08em] text-white/70">
                    February 2026
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.08em] text-white/70">
                    Online
                  </span>
                </div>

                <h3
                  className="
                    journey-title
                    mb-2
                    text-[23px]
                    uppercase
                    text-white
                  "
                >
                  ARTHNITI 2.0
                </h3>

                <p className="samurai-body mb-2 text-[14px] text-white/75">
                  <span className="font-semibold text-white/90">Games Played:</span>{" "}
                  <strong className="text-white/85">Free Fire</strong>.
                </p>

                <p className="samurai-body m-0 text-[16px] leading-[1.7]">
                  Organized in association with the Finance &amp; Investment Club (FIC) as part of ARTHNITI 2.0. The event brought high-octane battle royale action featuring a prize pool of <strong className="text-white/90">₹4,000</strong>, with competitive squads battling across dynamic elimination lobbies that tested survival strategy, rapid rotations, and sharp mechanical coordination.
                </p>
              </div>
            </div>

            {/* POWERSURGE */}
            <div
              className="
                journey-item
                grid
                grid-cols-1
                gap-3
                py-6
                min-[700px]:grid-cols-[100px_1fr]
                min-[700px]:gap-5
              "
            >
              <div className="journey-year text-[20px] tracking-[.12em]">
                2026
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.08em] text-white/70">
                    13th – 14th April
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.08em] text-white/70">
                    Online
                  </span>
                </div>

                <h3
                  className="
                    journey-title
                    mb-2
                    text-[23px]
                    uppercase
                    text-white
                  "
                >
                  Powersurge
                </h3>

                <p className="samurai-body mb-2 text-[14px] text-white/75">
                  <span className="font-semibold text-white/90">Games Played:</span>{" "}
                  <strong className="text-white/85">BGMI (Battlegrounds Mobile India)</strong> and{" "}
                  <strong className="text-white/85">Free Fire</strong>.
                </p>

                <p className="samurai-body m-0 text-[16px] leading-[1.7]">
                  An intra-departmental competitive esports initiative organized jointly by the Electrical Society and NITS Esports Club, exclusively for Electrical Engineering Department students. Fostering grassroots competitive gaming and departmental bonding, the tournament showcased high-pressure battle royale action across <strong className="text-white/85">BGMI</strong> (10 teams, ₹1,250 prize pool) and <strong className="text-white/85">Free Fire</strong> (12 teams, ₹1,250 prize pool).
                </p>
              </div>
            </div>

            {/* HONOUR OF KINGS */}
            <div
              className="
                journey-item
                grid
                grid-cols-1
                gap-3
                py-6
                min-[700px]:grid-cols-[100px_1fr]
                min-[700px]:gap-5
              "
            >
              <div className="journey-year text-[20px] tracking-[.12em]">
                2026
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.08em] text-white/70">
                    18th April 2026
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.08em] text-white/70">
                    Gymkhana Park, NIT Silchar • Offline LAN &amp; On-Ground Activation
                  </span>
                </div>

                <h3
                  className="
                    journey-title
                    mb-2
                    text-[23px]
                    uppercase
                    text-white
                  "
                >
                  Honour of Kings — Campus Tour
                </h3>

                <p className="samurai-body mb-2 text-[14px] text-white/75">
                  <span className="font-semibold text-white/90">Games Played:</span>{" "}
                  <strong className="text-white/85">Honor of Kings (5v5 MOBA)</strong>.
                </p>

                <p className="samurai-body m-0 text-[16px] leading-[1.7]">
                  An official promotional tour bringing the world-renowned 5v5 multiplayer online battle arena (MOBA) title directly to NIT Silchar at Gymkhana Park. The event transformed the venue into a live esports arena featuring on-spot registrations, exhibition matches, and interactive gaming challenges. Teams of 5 competed through structured knockout LAN rounds testing hero drafts, objective control, and clutch execution under live pressure, with top performers awarded an <strong className="text-white/90">Infinix GT 5G Gaming Smartphone</strong> and official exclusive merchandise valued at <strong className="text-white/90">₹30,000+</strong>.
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* ===================================================
            GET IN TOUCH
        =================================================== */}

        <section className="w-full pb-[80px]">

          <div className="mb-10 text-center">

            <div className="section-meta scroll-pop">

              <span className="section-meta-line" />

              <span className="section-meta-text">
                CONNECT WITH US
              </span>

              <span className="section-meta-line right" />

            </div>

            <h2
              className="
                section-heading
                scroll-pop
                m-0
                text-[clamp(31px,3vw,44px)]
                uppercase
              "
            >
              Get in Touch
            </h2>

          </div>

          <div
            className="
              samurai-card
              scroll-pop
              mx-auto
              w-full
              max-w-[1400px]
              rounded-[18px]
              px-5
              py-[35px]
              min-[700px]:px-[8%]
              min-[700px]:py-[45px]
            "
          >

            <div
              className="
                mx-auto
                grid
                max-w-[850px]
                grid-cols-1
                gap-5
                min-[700px]:grid-cols-2
                min-[700px]:gap-7
              "
            >

              {/* LEFT */}

              <div className="flex flex-col gap-5">

                <div className="contact-item">

                  <h3 className="contact-label mb-3 text-[16px] text-white">
                    Email
                  </h3>

                  <p className="samurai-body m-0 text-[16px] text-white/55">
                    esports.nits@gmail.com
                  </p>

                </div>

                <div className="contact-item">

                  <h3 className="contact-label mb-3 text-[16px] text-white">
                    Phone
                  </h3>

                  <p className="samurai-body m-0 text-[16px] text-white/55">
                    +91 84343 07257
                  </p>

                </div>

              </div>

              {/* RIGHT */}

              <div className="flex flex-col gap-5">

                <div className="contact-item">

                  <h3 className="contact-label mb-3 text-[16px] text-white">
                    Location
                  </h3>

                  <p className="samurai-body m-0 text-[16px] text-white/55">
                    NIT Silchar, Assam, India
                  </p>

                </div>

                <div className="contact-item">

                  <h3 className="contact-label mb-3 text-[16px] text-white">
                    Social Media
                  </h3>

                  <p className="samurai-body m-0 text-[16px] text-white/55">
                    @nits.esports
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* =====================================================
          BOTTOM SAMURAI LINE
      ===================================================== */}

      <div
        className="
          fixed
          bottom-0
          left-0
          z-50
          h-[1px]
          w-full
          bg-white/35
          shadow-[0_0_12px_rgba(255,255,255,.22)]
        "
      />

    </div>
  );
};

export default About;
