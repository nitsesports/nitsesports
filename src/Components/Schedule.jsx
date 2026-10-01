import React, { useEffect } from "react";
import * as THREE from "three";

const Schedule = () => {
  // =========================================================
  // EVENT DATA
  // =========================================================

  const upcomingEvents = [
    {
      title: "RAMPAGE 2026",
      date: "PROBABLE DATE: TO BE ANNOUNCED",
      location: "NIT SILCHAR",
      teams: "TO BE ANNOUNCED",
      prize: "TO BE ANNOUNCED",
      status: "Upcoming",
      image: "/events/neon-clash.jpg",
    },
    {
      title: "SPORTOMANIA",
      date: "PROBABLE DATE: TO BE ANNOUNCED",
      location: "NIT SILCHAR",
      teams: "TO BE ANNOUNCED",
      prize: "TO BE ANNOUNCED",
      status: "Upcoming",
      image: "/events/cyber-warfare.jpg",
    },
  ];

  const ongoingEvents = [];

  const pastEvents = [
    {
      title: "Vanguard Arena",
      date: "Jan 15, 2026 - Jan 18, 2026",
      location: "Online",
      teams: "168 Teams",
      prize: "₹45,000",
      status: "Completed",
      image: "/events/vanguard-arena.jpg",
    },
    {
      title: "Lock & Load",
      date: "Oct 12, 2025 - Oct 18, 2025",
      location: "Online",
      teams: "117 Teams",
      prize: "₹10,000",
      status: "Completed",
      image: "/events/lock-load.jpg",
    },
    {
      title: "Freefire Tournament",
      date: "Feb 06, 2026 - Feb 07, 2026",
      location: "Online",
      teams: "80 Teams",
      prize: "₹4,000",
      status: "Completed",
      image: "/events/freefire.jpg",
    },
  ];

  // =========================================================
  // SCROLL REVEAL OBSERVER
  // =========================================================

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


  // =========================================================
  // SCROLL REVEAL OBSERVER
  // =========================================================
  useEffect(() => {
    const elements = document.querySelectorAll(".schedule-root .scroll-reveal");

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);


  // =========================================================
  // ICONS
  // =========================================================

  const CalendarIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  const LocationIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );

  const UsersIcon = () => (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const TrophyIcon = () => (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H3v2a4 4 0 0 0 4 4" />
      <path d="M17 6h4v2a4 4 0 0 1-4 4" />
    </svg>
  );

  const ArrowIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );

  // =========================================================
  // SECTION ICON
  // =========================================================

  const SectionIcon = ({ type }) => {
    const Icon = type === "ongoing" ? TrophyIcon : CalendarIcon;

    return (
      <div className="schedule-section-icon relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.045] text-white/75 backdrop-blur-xl transition-all duration-300">
        <div className="absolute inset-0 rounded-xl bg-white/[0.025] blur-md" />

        <span className="relative">
          <Icon />
        </span>
      </div>
    );
  };

  // =========================================================
  // EVENT CARD
  // =========================================================

  const EventCard = ({ event, index }) => {
    const isUpcoming = event.status === "Upcoming";
    const isLive = event.status === "Live Now";

    return (
      <div
        style={{
          transitionDelay: `${index * 100}ms`,
        }}
        className="
          scroll-reveal
          group relative overflow-hidden rounded-3xl
          border border-white/15
          bg-white/[0.07]
          backdrop-blur-2xl
          shadow-[0_18px_65px_rgba(0,0,0,0.65)]
          transition-all duration-700 ease-out
          hover:-translate-y-2
          hover:border-white/35
          hover:bg-white/[0.10]
          hover:shadow-[0_22px_75px_rgba(255,255,255,0.10),0_24px_75px_rgba(0,0,0,0.65)]
        "
      >
        {/* STEEL TOP EDGE */}

        <div
          className="
            pointer-events-none
            absolute inset-x-0 top-0 z-20 h-px
            bg-gradient-to-r
            from-transparent
            via-white/55
            to-transparent
            opacity-70
          "
        />

        {/* SUBTLE CARD LIGHT */}

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-40
            w-40
            rounded-full
            bg-white/[0.025]
            blur-3xl
            transition-all
            duration-700
            group-hover:bg-white/[0.055]
          "
        />

        {/* IMAGE */}

        <div className="relative h-[220px] overflow-hidden bg-[#070709]">
          <img
            src={event.image}
            alt={event.title}
            className="
              h-full
              w-full
              object-cover
              opacity-80
              grayscale
              contrast-[1.12]
              saturate-0
              transition-all
              duration-700
              group-hover:scale-110
              group-hover:opacity-95
            "
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          {/* IMAGE DARKEN */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/90
              via-black/30
              to-black/5
            "
          />

          {/* SUBTLE WHITE OVERLAY */}

          <div
            className="
              absolute
              inset-0
              bg-white/[0.025]
              opacity-0
              transition-opacity
              duration-500
              group-hover:opacity-100
            "
          />

          {/* STATUS */}

          <div
            className="
              absolute
              right-4
              top-4
              rounded-full
              border
              border-white/20
              bg-black/45
              px-4
              py-1.5
              text-xs
              font-semibold
              tracking-wide
              text-white/85
              backdrop-blur-xl
              shadow-[0_0_20px_rgba(255,255,255,0.06)]
            "
          >
            {isLive && (
              <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white shadow-[0_0_8px_white]" />
            )}

            {event.status}
          </div>
        </div>

        {/* CONTENT */}

        <div className="relative p-6">
          <h3
            className="
              schedule-card-title
              mb-5
              text-[23px]
              font-bold
              tracking-tight
              text-white
              transition-colors
              duration-300
            "
          >
            {event.title}
          </h3>

          {/* DATE */}

          <div className="mb-4 flex items-center gap-3 text-[15px] text-white/65">
            <span className="text-white/55">
              <CalendarIcon />
            </span>

            <span>{event.date}</span>
          </div>

          {/* LOCATION */}

          <div className="mb-7 flex items-center gap-3 text-[15px] text-white/65">
            <span className="text-white/55">
              <LocationIcon />
            </span>

            <span>{event.location}</span>
          </div>

          {/* TEAMS / PRIZE */}

          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[15px] text-white/85">
              <span className="text-white/55">
                <UsersIcon />
              </span>

              <span>{event.teams}</span>
            </div>

            <div className="flex items-center gap-2.5 text-[15px] font-semibold text-white">
              <span className="text-white/65">
                <TrophyIcon />
              </span>

              <span>{event.prize}</span>
            </div>
          </div>

          {/* BUTTON */}

          <button
            className="
              group/button
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/20
              bg-white/[0.055]
              px-5
              py-3
              text-sm
              font-semibold
              text-white/85
              shadow-[0_0_25px_rgba(255,255,255,0.06)]
              backdrop-blur-xl
              transition-all
              duration-300
              hover:border-white/60
              hover:bg-white/[0.10]
              hover:text-white
              hover:shadow-[0_0_40px_rgba(255,255,255,0.12)]
            "
          >
            View Schedule
            <span className="transition-transform duration-300 group-hover/button:translate-x-1">
              <ArrowIcon />
            </span>
          </button>
        </div>
      </div>
    );
  };

  // =========================================================
  // EVENT SECTION
  // =========================================================

  const EventSection = ({
    title,
    subtitle,
    events,
    type,
  }) => {
    return (
      <section className="mb-20">
        {/* SECTION HEADING */}

        <div className="scroll-reveal mb-8 flex items-center gap-4">
          <SectionIcon type={type} />

          <div>
            <h2 className="schedule-section-heading text-2xl font-bold tracking-tight text-white md:text-3xl">
              {title}
            </h2>

            <p className="mt-1 text-sm text-white/55">
              {subtitle}
            </p>
          </div>
        </div>

        {/* CARDS */}

        {events.length === 0 ? (
          <div className="scroll-reveal rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-10 text-center backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.18em] text-white/45">
              No ongoing events currently
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-7 ${
              events.length === 1
                ? "grid-cols-1 max-w-md"
                : events.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            }`}
          >
            {events.map((event, index) => (
              <EventCard
                key={`${event.title}-${index}`}
                event={event}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    );
  };

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="schedule-root relative min-h-screen w-full overflow-hidden bg-black text-white">

      {/* ==================================================
          MERCHENDISE-STYLE CINEMATIC BACKGROUND
      ================================================== */}

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
          CONTENT
      ====================================================== */}

      <main
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1500px]
          px-5
          pb-20
          pt-[175px]
          sm:px-8
          sm:pt-[185px]
          lg:px-10
          lg:pt-[190px]
        "
      >

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <div className="scroll-reveal mb-20 text-center">

          {/* SAMURAI BADGE */}

          <div
            className="
              mb-5
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-white/15
              bg-black/45
              px-5
              py-2
              shadow-[0_8px_30px_rgba(0,0,0,0.35)]
              backdrop-blur-2xl
            "
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.35)]" />

            <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/70">
              Esports Schedule
            </span>
          </div>

          {/* =================================================
              METALLIC SAMURAI TITLE
          ================================================== */}

          <div className="schedule-title-center">
            <div className="relative inline-block">

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
                    <stop offset="0%" stopColor="#ffffff" />

                    <stop offset="14%" stopColor="#f1f1f1" />

                    <stop offset="30%" stopColor="#c8c8c8" />

                    <stop offset="46%" stopColor="#7d7d7d" />

                    <stop offset="60%" stopColor="#555555" />

                    <stop offset="72%" stopColor="#8f8f8f" />

                    <stop offset="86%" stopColor="#d9d9d9" />

                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>

                  {/* INNER METALLIC DEPTH */}

                  <linearGradient
                    id="titleInnerGradient"
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
                    id="titleShineGradient"
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
                      floodOpacity=".98"
                    />

                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation="2"
                      floodColor="#000000"
                      floodOpacity=".75"
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

                {/* MAIN TITLE */}

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
                  SCHEDULE
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
                  SCHEDULE
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
                  className="
                    title-text
                    neon-title-shine
                  "
                >
                  SCHEDULE
                </text>

              </svg>

            </div>
          </div>

          <p className="mx-auto mt-5 max-w-2xl text-base text-white/65 sm:text-lg">
            Ongoing tournaments, upcoming battles and fixtures
          </p>

          {/* SAMURAI DIVIDER — PHOTO REFERENCE STYLE */}

          <div className="schedule-samurai-divider mx-auto mt-8 flex w-full max-w-[380px] items-center justify-center">

            {/* LEFT THIN LINE */}

            <div className="samurai-divider-line samurai-divider-left" />

            {/* CENTER DIAMOND */}

            <div className="samurai-divider-diamond" aria-hidden="true" />

            {/* RIGHT THIN LINE */}

            <div className="samurai-divider-line samurai-divider-right" />

          </div>

        </div>

        {/* ===================================================
            UPCOMING
        =================================================== */}

        <EventSection
          title="Upcoming Events"
          subtitle="Prepare for the next battle"
          events={upcomingEvents}
          type="upcoming"
        />

        {/* ===================================================
            ONGOING
        =================================================== */}

        <EventSection
          title="Ongoing Events"
          subtitle="The battle is happening right now"
          events={ongoingEvents}
          type="ongoing"
        />

        {/* ===================================================
            PAST
        =================================================== */}

        <EventSection
          title="Past Events"
          subtitle="Completed tournaments and fixtures"
          events={pastEvents}
          type="past"
        />

      </main>

      {/* =====================================================
          SAMURAI TYPOGRAPHY + ANIMATIONS
      ====================================================== */}

      <style>{`

        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');


        /* ==================================================
           THREE.JS STARFIELD — FULL PAGE BACKGROUND
           Stars are copied from File 1 exactly.
        ================================================== */

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

        /* ==================================================
           GLOBAL FONT
        ================================================== */

        .schedule-root,
        .schedule-root * {
          font-family: 'The Last Shuriken', sans-serif;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #000;
        }

        ::selection {
          background: rgba(255,255,255,.18);
          color: #fff;
        }

        /* ==================================================
           TITLE
        ================================================== */

        .neon-title-svg {
          display: block;

          width: min(92vw, 1000px);
          height: auto;

          overflow: visible;

          pointer-events: none;

          margin-left: auto;
          margin-right: auto;
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

        .neon-title-inner {
          fill: url(#titleInnerGradient);

          stroke: none;

          opacity: .34;

          pointer-events: none;
        }

        .neon-title-border {
          display: none;
        }

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

        .schedule-title-center {
          width: 100%;

          display: flex;

          justify-content: center;

          align-items: center;
        }

        /* ==================================================
           SAMURAI DIVIDER
           Matches the supplied reference:
           thin horizontal lines + centered diamond
           NO dots / NO dashed border / NO neon gradient
        ================================================== */

        .schedule-samurai-divider {
          position: relative;
          height: 18px;
          gap: 0;
        }

        .samurai-divider-line {
          height: 1px;
          flex: 1 1 auto;
          background: rgba(255,255,255,.32);
          box-shadow: 0 0 5px rgba(255,255,255,.05);
        }

        .samurai-divider-left {
          margin-right: 14px;
          background:
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(255,255,255,.28) 8%,
              rgba(255,255,255,.36) 100%
            );
        }

        .samurai-divider-right {
          margin-left: 14px;
          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,.36) 0%,
              rgba(255,255,255,.28) 92%,
              transparent 100%
            );
        }

        .samurai-divider-diamond {
          position: relative;
          width: 10px;
          height: 10px;
          flex: 0 0 10px;
          transform: rotate(45deg);
          border: 1px solid rgba(255,255,255,.58);
          background: rgba(3,3,5,.92);
          box-shadow:
            0 0 7px rgba(255,255,255,.08),
            inset 0 0 5px rgba(255,255,255,.04);
        }

        .samurai-divider-diamond::after {
          content: "";
          position: absolute;
          inset: 2px;
          border: 1px solid rgba(255,255,255,.12);
        }

        @media (max-width: 480px) {
          .schedule-samurai-divider {
            max-width: 88vw;
          }

          .samurai-divider-left {
            margin-right: 11px;
          }

          .samurai-divider-right {
            margin-left: 11px;
          }

          .samurai-divider-diamond {
            width: 9px;
            height: 9px;
            flex-basis: 9px;
          }
        }

        @media (max-width: 640px) {
          .neon-title-svg {
            width: min(94vw, 720px);
          }
        }

        /* ==================================================
           SECTION / CARD HEADINGS
        ================================================== */

        .schedule-section-heading,
        .schedule-card-title {
          font-family: 'The Last Shuriken', sans-serif !important;

          font-weight: 700;

          letter-spacing: .025em;

          text-shadow:
            0 3px 0 rgba(0,0,0,.82),
            0 6px 16px rgba(0,0,0,.88),
            0 0 10px rgba(255,255,255,.06);
        }

        .schedule-section-heading {
          position: relative;
        }

        .schedule-section-heading::after {
          content: "";

          display: block;

          width: 52px;

          height: 1px;

          margin-top: 9px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.18),
              rgba(255,255,255,.72),
              rgba(255,255,255,.18),
              transparent
            );

          box-shadow:
            0 0 10px rgba(255,255,255,.10);
        }

        /* ==================================================
           DARK SAMURAI GLASS
        ================================================== */

        .schedule-root .group {
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.075),
              rgba(3,3,5,.78) 48%,
              rgba(255,255,255,.025)
            );

          border-color: rgba(255,255,255,.15);

          backdrop-filter:
            blur(20px)
            saturate(70%);

          -webkit-backdrop-filter:
            blur(20px)
            saturate(70%);
        }

        .schedule-root .group::before {
          content: "";

          position: absolute;

          inset: 0;

          pointer-events: none;

          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(255,255,255,.065),
              transparent 36%
            );

          opacity: .9;
        }

        /* ==================================================
           STEEL CARD TOP EDGE
        ================================================== */

        .schedule-root
        .group
        > .absolute.inset-x-0.top-0 {
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.20),
              rgba(255,255,255,.62),
              rgba(255,255,255,.20),
              transparent
            );
        }

        /* ==================================================
           SECTION ICON
        ================================================== */

        .schedule-section-icon {
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.08),
            0 10px 30px rgba(0,0,0,.35);
        }

        .schedule-section-icon:hover {
          border-color: rgba(255,255,255,.35);

          background: rgba(255,255,255,.07);

          box-shadow:
            0 0 25px rgba(255,255,255,.08),
            inset 0 1px 0 rgba(255,255,255,.12);
        }

        /* ==================================================
           SCROLL POP-UP
        ================================================== */

        .scroll-reveal {
          opacity: 0;

          transform:
            translateY(75px)
            scale(.97);

          filter: blur(6px);

          transition:
            opacity .8s ease,
            transform .8s cubic-bezier(.16,1,.3,1),
            filter .8s ease;
        }

        .scroll-reveal.is-visible {
          opacity: 1;

          transform:
            translateY(0)
            scale(1);

          filter: blur(0);
        }

        /* ==================================================
           REDUCED MOTION
        ================================================== */

        @media (prefers-reduced-motion: reduce) {

          .scroll-reveal,
          .schedule-title-center {
            opacity: 1;

            transform: none;

            filter: none;

            transition: none;

            animation: none;
          }

          html {
            scroll-behavior: auto;
          }
        }

      `}</style>

    </div>
  );
};

export default Schedule;