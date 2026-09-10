import { useEffect, useId, useRef, useState } from "react";

import i10 from "../assets/i10.png";
import f1 from "../assets/f1.png";
import f2 from "../assets/f2.png";
import f3 from "../assets/f3.png";
import f4 from "../assets/f4.png";
import f5 from "../assets/f5.png";
import liw from "../assets/liw.png";
import insw from "../assets/insw.png";
import ytw from "../assets/ytw.png";
import fbw from "../assets/fbw.png";



// =========================================================
// HERO-STYLE SHINING SAMURAI HEADING — WHERE WE ARE ONLY
// =========================================================
const ShiningHeading = ({ children, size = 76, maxWidth = 760, className = "" }) => {
  const uid = useId().replace(/:/g, "");
  const fillId = `shineFill-${uid}`;
  const innerId = `shineInner-${uid}`;
  const shineId = `shineTravel-${uid}`;
  const shadowId = `shineShadow-${uid}`;

  return (
    <div className={`shining-heading-wrap ${className}`}>
      <svg
        className="shining-heading-svg"
        style={{ width: `min(${maxWidth}px, 92vw)` }}
        viewBox={`0 0 ${maxWidth} 105`}
        preserveAspectRatio="xMidYMid meet"
        role="heading"
        aria-level="2"
      >
        <defs>
          <linearGradient
            id={fillId}
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
            id={innerId}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".20" />
            <stop offset="45%" stopColor="#000000" stopOpacity=".28" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity=".12" />
          </linearGradient>

          <linearGradient
            id={shineId}
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
            id={shadowId}
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
          fontSize={size}
          fontWeight="700"
          letterSpacing="-4"
          fill={`url(#${fillId})`}
          filter={`url(#${shadowId})`}
        >
          {children}
        </text>

        <text
          x="50%"
          y="76"
          textAnchor="middle"
          fontFamily="The Last Shuriken, sans-serif"
          fontSize={size}
          fontWeight="700"
          letterSpacing="-4"
          fill={`url(#${innerId})`}
          opacity=".34"
          pointerEvents="none"
          aria-hidden="true"
        >
          {children}
        </text>

        <text
          x="50%"
          y="76"
          textAnchor="middle"
          fontFamily="The Last Shuriken, sans-serif"
          fontSize={size}
          fontWeight="700"
          letterSpacing="-4"
          fill={`url(#${shineId})`}
          opacity=".88"
          style={{ mixBlendMode: "screen" }}
          pointerEvents="none"
          aria-hidden="true"
        >
          {children}
        </text>
      </svg>
    </div>
  );
};

const ScrollSection5 = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // =========================================================
  // ===================== BACK TO TOP =======================
  // =========================================================

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // ======================= SOCIALS =========================
  // =========================================================

  const socials = [
    {
      name: "Instagram",
      logo: insw,
      description: "Follow our journey",
      href: "#",
    },
    {
      name: "Facebook",
      logo: fbw,
      description: "Join our community",
      href: "#",
    },
    {
      name: "LinkedIn",
      logo: liw,
      description: "Connect with us",
      href: "#",
    },
    {
      name: "YouTube",
      logo: ytw,
      description: "Watch our content",
      href: "#",
    },
  ];

  // =========================================================
  // ======================= APP LOGOS ========================
  // =========================================================

  const appLogos = [
    {
      image: f1,
      name: "App",
    },
    {
      image: f2,
      name: "Esports",
    },
    {
      image: f3,
      name: "Community",
    },
    {
      image: f4,
      name: "Events",
    },
    {
      image: f5,
      name: "Gaming",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="where- we-are"
      className="
        samurai-display
        relative
        min-h-[100vh]
        w-full
        overflow-hidden
        bg-[#050509]
        border-t-[0.5px] border-white/20
        py-16
        sm:py-20
        md:py-24
      "
      style={{
        fontFamily: '"The Last Shuriken", sans-serif',
      }}
    >

      {/* ========================================================= */}
      {/* ================= BACKGROUND IMAGE ====================== */}
      {/* ========================================================= */}

      <img
        src={i10}
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
          opacity-100
          brightness-[0.18]
          grayscale
          saturate-0
          contrast-[1.10]
          pointer-events-none
        "
      />

      {/* ========================================================= */}
      {/* ============ PROFESSIONAL IMAGE BLEND ================== */}
      {/* ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          bg-black/[0.04]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          bg-gradient-to-b
          from-[#000000]/[0.16]
          via-transparent
          to-[#000000]/[0.24]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(255,255,255,0.018)_48%,rgba(0,0,0,0.16)_100%)]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          bg-gradient-to-r
          from-[#000000]/[0.12]
          via-transparent
          to-[#000000]/[0.10]
        "
      />

      {/* ========================================================= */}
      {/* ================= WHITE ATMOSPHERE ====================== */}
      {/* ========================================================= */}

      <div
        className="
          absolute
          inset-0
          z-10
          bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,0.05),transparent_48%)]
        "
      />

      <div
        className="
          absolute
          bottom-0
          left-0
          z-10
          h-[45%]
          w-full
          bg-[radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.04),transparent_55%)]
        "
      />

      {/* ========================================================= */}
      {/* ================= MAIN CONTENT ========================== */}
      {/* ========================================================= */}

      <div
        className="
          relative
          z-30
          mx-auto
          flex
          w-full
          max-w-6xl
          flex-col
          items-center
          px-5
        "
      >
        {/* ======================================================= */}
        {/* ===================== HEADING ========================= */}
        {/* ======================================================= */}

        <div
          className={`
            flex
            flex-col
            items-center
            text-center
            transform-gpu
            transition-all
            duration-[1000ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              visible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-20 scale-75 opacity-0"
            }
          `}
          style={{
            transitionDelay: visible ? "100ms" : "0ms",
          }}
        >
          <ShiningHeading maxWidth={760} size={76}>
            WHERE WE ARE
          </ShiningHeading>

          <p
            className="
              mt-4
              max-w-xl
              text-xs
              font-medium
              uppercase
              tracking-[0.12em]
              text-white/65
              sm:text-sm
            "
          >
            CONNECT WITH NIT SILCHAR ESPORTS CLUB
          </p>

          {/* ================= HEADING DIVIDER ================= */}

          <div
            className={`
              mt-6
              flex
              items-center
              justify-center
              gap-3
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
            <div
              className="
                h-[1px]
                w-14
                bg-gradient-to-r
                from-transparent
                via-[#ffffff]
                to-[#bdbdbd]
                shadow-[0_0_8px_rgba(255,255,255,0.45)]
                sm:w-24
                md:w-32
              "
            />

            <div
              className="
                h-[7px]
                w-[7px]
                shrink-0
                rounded-full
                bg-white
                shadow-[0_0_8px_rgba(255,255,255,1),0_0_16px_rgba(255,255,255,0.6)]
              "
            />

            <div
              className="
                h-[1px]
                w-14
                bg-gradient-to-l
                from-transparent
                via-[#9a9a9a]
                to-[#ffffff]
                shadow-[0_0_8px_rgba(255,255,255,0.45)]
                sm:w-24
                md:w-32
              "
            />
          </div>
        </div>

        {/* ======================================================= */}
        {/* =================== SOCIAL SECTION =================== */}
        {/* ======================================================= */}

        <div
          className="
            mt-12
            grid
            w-full
            grid-cols-2
            gap-3
            sm:mt-14
            sm:grid-cols-4
            sm:gap-4
            md:max-w-5xl
          "
        >
          {socials.map((social, index) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className={`
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.16]
                bg-white/[0.075]
                px-4
                py-5
                shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_rgba(0,0,0,0.18)]
                transform-gpu
                transition-all
                duration-[900ms]
                ease-[cubic-bezier(0.16,1,0.3,1)]
                hover:-translate-y-2
                hover:border-[#bdbdbd]/70
                hover:bg-[#0c0c0c]/90
                hover:shadow-[0_0_30px_rgba(255,255,255,0.10)]
                ${
                  visible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-20 scale-75 opacity-0"
                }
              `}
              style={{
                transitionDelay: visible
                  ? `${600 + index * 120}ms`
                  : "0ms",
              }}
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  rounded-2xl
                  bg-gradient-to-br
                  from-white/[0.10]
                  via-transparent
                  to-white/[0.04]
                  opacity-80
                "
              />

              <div
                className="
                  absolute
                  -right-10
                  -top-10
                  h-24
                  w-24
                  rounded-full
                  bg-white/10
                  transition-all
                  duration-500
                  group-hover:bg-white/20
                "
              />

              <div
                className="
                  relative
                  z-10
                  mx-auto
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/[0.16]
                  bg-white/[0.055]
                  p-2.5
                  shadow-[0_0_15px_rgba(255,255,255,0.10)]
                  transition-all
                  duration-500
                  group-hover:scale-110
                  group-hover:border-white/50
                  group-hover:bg-white/[0.08]
                  group-hover:shadow-[0_0_20px_rgba(255,255,255,0.16)]
                "
              >
                <img
                  src={social.logo}
                  alt={`${social.name} logo`}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="relative z-10 mt-3 text-center">
                <h3 className="text-sm font-bold text-white">
                  {social.name}
                </h3>

                <p
                  className="
                    mt-1
                    text-[9px]
                    uppercase
                    tracking-[0.08em]
                    text-white/45
                  "
                >
                  {social.description}
                </p>
              </div>

              <div
                className="
                  absolute
                  bottom-0
                  left-1/2
                  h-[1px]
                  w-0
                  -translate-x-1/2
                  bg-gradient-to-r
                  from-[#777777]
                  via-[#ffffff]
                  to-[#d0d0d0]
                  shadow-[0_0_8px_#ffffff]
                  transition-all
                  duration-500
                  group-hover:w-3/4
                "
              />
            </a>
          ))}
        </div>

        {/* ======================================================= */}
        {/* ===================== APP SECTION ==================== */}
        {/* ======================================================= */}

        <div
          className={`
            mt-16
            w-full
            transform-gpu
            transition-all
            duration-[1000ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              visible
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }
          `}
          style={{
            transitionDelay: visible ? "1050ms" : "0ms",
          }}
        >
          <div className="flex flex-col items-center text-center">
            <span
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-[#bdbdbd]
              "
            >
              EVERYTHING IN ONE PLACE
            </span>

            <div className="app-heading-wrap mt-2">
              <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-white sm:text-3xl">
                Our App
              </h2>
            </div>

            <p
              className="
                mt-2
                max-w-lg
                text-xs
                leading-relaxed
                text-white/50
                sm:text-sm
              "
            >
              Stay connected with tournaments, events, teams and
              everything happening at NIT Silchar Esports Club.
            </p>
          </div>

          <div
            className="
              mx-auto
              mt-7
              flex
              max-w-3xl
              flex-wrap
              items-center
              justify-center
              gap-3
              sm:gap-5
            "
          >
            {appLogos.map((app, index) => (
              <div
                key={index}
                className="
                  group
                  relative
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.16]
                  bg-white/[0.075]
                  p-3
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_35px_rgba(0,0,0,0.20)]
                  transform-gpu
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  hover:scale-105
                  hover:border-[#ffffff]/60
                  hover:shadow-[0_0_25px_rgba(255,255,255,0.12)]
                  sm:h-20
                  sm:w-20
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-[1px]
                    rounded-2xl
                    border
                    border-white/[0.06]
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.16),rgba(255,255,255,0.06)_35%,transparent_70%)]
                    opacity-0
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                  "
                />

                <img
                  src={app.image}
                  alt={app.name}
                  className="
                    relative
                    z-10
                    h-full
                    w-full
                    object-contain
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                />
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================= */}
        {/* ================= QUICK ACCESS FOOTER ================= */}
        {/* ======================================================= */}

        <footer
          className={`
            mt-14
            w-full
            border-t
            border-white/[0.08]
            pt-10
            pb-6
            transform-gpu
            transition-all
            duration-[1000ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              visible
                ? "translate-y-0 opacity-100"
                : "translate-y-16 opacity-0"
            }
          `}
          style={{
            transitionDelay: visible ? "1350ms" : "0ms",
          }}
        >
          <div className="w-full">
            <div
              className="
                grid
                grid-cols-1
                gap-10
                sm:grid-cols-2
                lg:grid-cols-4
                lg:gap-12
              "
            >
              {/* ================= NIT SILCHAR ================= */}

              <div className="lg:pr-8">
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-white/[0.16]
                      bg-white/[0.07]
                      shadow-[0_0_25px_rgba(255,255,255,0.06)]
                    "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-7 w-7 text-[#d0d0d0]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 8h10a4 4 0 0 1 3.8 5.2l-1.2 4A2.5 2.5 0 0 1 17.2 19h-.4a2.5 2.5 0 0 1-2-1l-1.3-1.7h-3L9.2 18a2.5 2.5 0 0 1-2 1h-.4a2.5 2.5 0 0 1-2.4-1.8l-1.2-4A4 4 0 0 1 7 8Z"
                      />

                      <path
                        strokeLinecap="round"
                        d="M8 12v3M6.5 13.5h3"
                      />

                      <circle
                        cx="16.5"
                        cy="12.5"
                        r=".8"
                      />

                      <circle
                        cx="18.5"
                        cy="14.5"
                        r=".8"
                      />
                    </svg>
                  </div>

                  {/* ================================================= */}
                  {/* ================ NIT SILCHAR ==================== */}
                  {/* ================================================= */}

                  <div className="footer-brand-heading flex min-h-[52px] items-start">
                    <h2 className="m-0 text-xl font-bold uppercase leading-none tracking-[0.06em] text-white sm:text-2xl">
                      NIT SILCHAR
                    </h2>
                  </div>
                </div>

                <p
                  className="
                    max-w-[330px]
                    text-sm
                    leading-6
                    text-white/50
                    sm:text-[15px]
                  "
                >
                  Official Esports Club of NIT Silchar.
                  Join the competition.
                </p>
              </div>

              {/* ================= QUICK LINKS ================= */}

              <div>
                <div className="footer-column-heading flex min-h-[36px] items-start">
                  <h3 className="m-0 text-lg font-bold uppercase leading-none tracking-[0.06em] text-white">
                    Quick Links
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  <a
                    href="#home"
                    className="
                      group
                      w-fit
                      text-sm
                      text-white/50
                      transition-all
                      duration-300
                      hover:translate-x-1
                      hover:text-white
                      sm:text-[15px]
                    "
                  >
                    <span className="transition-colors duration-300 group-hover:text-[#ffffff]">
                      Home
                    </span>
                  </a>

                  <a
                    href="#events"
                    className="
                      group
                      w-fit
                      text-sm
                      text-white/50
                      transition-all
                      duration-300
                      hover:translate-x-1
                      hover:text-white
                      sm:text-[15px]
                    "
                  >
                    <span className="transition-colors duration-300 group-hover:text-[#ffffff]">
                      Events
                    </span>
                  </a>
                </div>
              </div>

              {/* ================= COMMUNITY =================== */}

              <div>
                <div className="footer-column-heading flex min-h-[36px] items-start">
                  <h3 className="m-0 text-lg font-bold uppercase leading-none tracking-[0.06em] text-white">
                    Community
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  <a
                    href="#team"
                    className="
                      group
                      w-fit
                      text-sm
                      text-white/50
                      transition-all
                      duration-300
                      hover:translate-x-1
                      hover:text-white
                      sm:text-[15px]
                    "
                  >
                    <span className="transition-colors duration-300 group-hover:text-[#c8c8c8]">
                      Team
                    </span>
                  </a>

                  <a
                    href="#about"
                    className="
                      group
                      w-fit
                      text-sm
                      text-white/50
                      transition-all
                      duration-300
                      hover:translate-x-1
                      hover:text-white
                      sm:text-[15px]
                    "
                  >
                    <span className="transition-colors duration-300 group-hover:text-[#c8c8c8]">
                      About Us
                    </span>
                  </a>
                </div>
              </div>

              {/* ================= CONTACT ===================== */}

              <div>
                <div className="footer-column-heading flex min-h-[36px] items-start">
                  <h3 className="m-0 text-lg font-bold uppercase leading-none tracking-[0.06em] text-white">
                    Contact
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  {/* LOCATION */}

                  <div className="flex items-start gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="
                        mt-0.5
                        h-5
                        w-5
                        shrink-0
                        text-[#d0d0d0]
                      "
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"
                      />

                      <circle
                        cx="12"
                        cy="9"
                        r="2.3"
                      />
                    </svg>

                    <span
                      className="
                        text-sm
                        leading-6
                        text-white/50
                        sm:text-[15px]
                      "
                    >
                      NIT Silchar, Assam
                    </span>
                  </div>

                  {/* EMAIL */}

                  <a
                    href="mailto:esports.nits@gmail.com"
                    className="
                      group
                      flex
                      items-center
                      gap-3
                      text-sm
                      text-white/50
                      transition-colors
                      duration-300
                      hover:text-white
                      sm:text-[15px]
                    "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="
                        h-5
                        w-5
                        shrink-0
                        text-[#d0d0d0]
                        transition-colors
                        duration-300
                        group-hover:text-[#c8c8c8]
                      "
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />

                      <path
                        strokeLinecap="round"
                        d="m4 7 8 6 8-6"
                      />
                    </svg>

                    esports.nits@gmail.com
                  </a>

                  {/* PHONE NUMBERS */}

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-x-5
                      gap-y-3
                    "
                  >
                    <a
                      href="tel:+918434307257"
                      className="
                        group
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-white/50
                        transition-colors
                        duration-300
                        hover:text-white
                      "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="
                          h-5
                          w-5
                          shrink-0
                          text-[#d0d0d0]
                        "
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 4h3l2 5-2 2a15 15 0 0 0 5 5l2-2 5 2v3a2 2 0 0 1-2 2C10.8 21 3 13.2 3 6a2 2 0 0 1 2-2Z"
                        />
                      </svg>

                      +91 84343 07257
                    </a>

                    <a
                      href="tel:+918252445506"
                      className="
                        group
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-white/50
                        transition-colors
                        duration-300
                        hover:text-white
                      "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="
                          h-5
                          w-5
                          shrink-0
                          text-[#d0d0d0]
                        "
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 4h3l2 5-2 2a15 15 0 0 0 5 5l2-2 5 2v3a2 2 0 0 1-2 2C10.8 21 3 13.2 3 6a2 2 0 0 1 2-2Z"
                        />
                      </svg>

                      +91 82524 45506
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================== */}
            {/* ================= FOOTER BOTTOM ================== */}
            {/* =================================================== */}

            <div
              className="
                mt-12
                flex
                flex-col
                items-center
                justify-between
                gap-4
                border-t
                border-white/[0.08]
                pt-6
                text-center
                sm:flex-row
                sm:text-left
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.12em]
                  text-white/35
                  sm:text-xs
                "
              >
                © {new Date().getFullYear()} NIT Silchar Esports Club
              </p>

              <button
                type="button"
                onClick={scrollToTop}
                className="
                  group
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-white/45
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:text-white
                  sm:text-xs
                "
              >
                Back to top

                <span
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/[0.14]
                    bg-white/[0.05]
                    transition-all
                    duration-300
                    group-hover:border-white/40
                    group-hover:bg-white/[0.10]
                  "
                >
                  ↑
                </span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default ScrollSection5;
