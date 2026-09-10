import React, { useEffect } from "react";
import Navbar from "./Navbar";
import eventsBg from "../assets/i5.png";

const upcomingEvents = [
  {
    title: "ESPORTS SHOWDOWN",
    date: "15 • SEPTEMBER • 2026",
    time: "6:00 PM",
    mode: "ONLINE",
    game: "VALORANT",
    location: "ONLINE ARENA",
    description:
      "An intense competitive showdown where teams battle for the top spot.",
    image: "/events/upcoming-01.jpg",
  },
  {
    title: "CAMPUS CLASH",
    date: "28 • SEPTEMBER • 2026",
    time: "4:00 PM",
    mode: "OFFLINE",
    game: "MULTI-GAME",
    location: "MAIN ARENA",
    description:
      "A campus-wide esports battle bringing players together across multiple titles.",
    image: "/events/upcoming-02.jpg",
  },
  {
    title: "NIGHT RUSH",
    date: "10 • OCTOBER • 2026",
    time: "8:00 PM",
    mode: "ONLINE",
    game: "BGMI",
    location: "ONLINE ARENA",
    description:
      "A late-night competitive session built for high-energy squads and clutch plays.",
    image: "/events/upcoming-03.jpg",
  },
];

const pastEvents = [
  {
    title: "WINTER WARZONE",
    date: "12 • JANUARY • 2026",
    time: "5:00 PM",
    mode: "ONLINE",
    game: "VALORANT",
    location: "ONLINE ARENA",
    description:
      "A fast-paced tournament featuring competitive teams and memorable plays.",
    image: "/events/past-01.jpg",
  },
  {
    title: "ARENA INVITATIONAL",
    date: "22 • FEBRUARY • 2026",
    time: "3:00 PM",
    mode: "OFFLINE",
    game: "MULTI-GAME",
    location: "ESPORTS ARENA",
    description:
      "Players came together for an action-packed day of competition and community.",
    image: "/events/past-02.jpg",
  },
  {
    title: "SPRING SKIRMISH",
    date: "18 • APRIL • 2026",
    time: "7:00 PM",
    mode: "ONLINE",
    game: "BGMI",
    location: "ONLINE ARENA",
    description:
      "A competitive community event filled with teamwork, strategy and close finishes.",
    image: "/events/past-03.jpg",
  },
];

/* =========================================================
   ICONS
========================================================= */

const CalendarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
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
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const TrophyIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H3v2a4 4 0 0 0 4 4" />
    <path d="M17 6h4v2a4 4 0 0 1-4 4" />
  </svg>
);

/* =========================================================
   SECTION ICON
========================================================= */

const SectionIcon = ({ type }) => {
  const Icon = type === "upcoming" ? CalendarIcon : TrophyIcon;

  return (
    <div className="events-section-icon relative flex h-11 w-11 shrink-0 items-center justify-center">
      <div className="absolute inset-0" />
      <span className="relative">
        <Icon />
      </span>
    </div>
  );
};

/* =========================================================
   EVENT CARD
========================================================= */

const EventCard = ({ event, index, upcoming }) => (
  <article
    style={{ transitionDelay: `${index * 100}ms` }}
    className="
      events-card
      scroll-reveal
      group
      relative
      overflow-hidden
      rounded-3xl
      border
      transition-all
      duration-700
      ease-out
      hover:-translate-y-2
    "
  >
    {/* STEEL TOP EDGE */}
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px events-card-top-edge" />

    {/* SUBTLE LIGHT */}
    <div className="pointer-events-none absolute -right-20 -top-20 z-10 h-40 w-40 rounded-full bg-white/[0.025] blur-3xl transition-all duration-700 group-hover:bg-white/[0.055]" />

    {/* IMAGE */}
    <div className="relative h-[220px] overflow-hidden bg-[#070709]">
      <img
        src={event.image}
        alt={event.title}
        className="
          h-full
          w-full
          object-cover
          opacity-75
          grayscale
          contrast-[1.14]
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

      {/* DARK SAMURAI IMAGE TREATMENT */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,.08),transparent_45%)] opacity-70" />

      {/* STATUS */}
      <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/55 px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[0.20em] text-white/75 backdrop-blur-xl">
        {upcoming ? "UPCOMING" : "COMPLETED"}
      </div>

      {/* NUMBER */}
      <div className="absolute right-4 top-4 rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-[9px] font-bold tracking-[0.20em] text-white/50 backdrop-blur-xl">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* IMAGE BOTTOM EDGE */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>

    {/* CONTENT */}
    <div className="relative z-20 p-6">
      {/* TAGS */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="events-tag events-tag-primary">
          {event.game}
        </span>

        <span className="events-tag">
          {event.mode}
        </span>
      </div>

      {/* TITLE */}
      <h3 className="events-card-title mb-5 text-[23px] font-bold uppercase leading-none text-white">
        {event.title}
      </h3>

      {/* INFO */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-[14px] text-white/65">
          <span className="text-white/45">
            <CalendarIcon />
          </span>
          <span>{event.date}</span>
        </div>

        <div className="flex items-center gap-3 text-[14px] text-white/65">
          <span className="text-white/45">
            <ClockIcon />
          </span>
          <span>{event.time}</span>
        </div>

        <div className="flex items-center gap-3 text-[14px] text-white/65">
          <span className="text-white/45">
            <LocationIcon />
          </span>
          <span>{event.location}</span>
        </div>
      </div>

      {/* DESCRIPTION */}
      <p className="mt-5 text-xs leading-6 text-white/40">
        {event.description}
      </p>

      {/* EVENT STATUS STRIP */}
      <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4">
        <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-white/30">
          {upcoming ? "NEXT BATTLE" : "BATTLE ARCHIVE"}
        </span>

        <span className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.18em] text-white/45">
          <TrophyIcon />
          {event.game}
        </span>
      </div>
    </div>

    {/* HOVER STEEL LINE */}
    <div className="events-hover-line pointer-events-none absolute bottom-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full" />
  </article>
);

/* =========================================================
   EVENT SECTION
========================================================= */

const EventSection = ({ title, subtitle, events, type }) => (
  <section className="mb-24">
    <div className="scroll-reveal mb-9 flex items-center gap-4">
      <SectionIcon type={type} />

      <div>
        <h2 className="events-section-heading text-2xl font-bold uppercase tracking-[0.02em] text-white md:text-3xl">
          {title}
        </h2>

        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40 sm:text-sm">
          {subtitle}
        </p>
      </div>
    </div>

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
          upcoming={type === "upcoming"}
        />
      ))}
    </div>
  </section>
);

/* =========================================================
   MAIN EVENTS PAGE
========================================================= */

const Events = () => {
  useEffect(() => {
    const revealElements = document.querySelectorAll(".scroll-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => {
      revealElements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, []);

  return (
    <div className="events-root relative min-h-screen w-full overflow-x-hidden bg-[#030305] text-white">
      {/* =====================================================
          DARK SAMURAI BACKGROUND
      ====================================================== */}

      <img
        src={eventsBg}
        alt=""
        aria-hidden="true"
        className="
          fixed
          inset-0
          z-0
          h-full
          w-full
          object-cover
          scale-[1.04]
          grayscale
          brightness-[0.70]
          saturate-0
          contrast-[1.18]
          pointer-events-none
        "
      />

      {/* DARK SAMURAI OVERLAYS */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-black/[0.48]" />

      <div className="pointer-events-none fixed inset-0 z-[2] bg-gradient-to-b from-black/[0.42] via-black/[0.12] to-black/[0.70]" />

      <div className="pointer-events-none fixed inset-0 z-[2] bg-gradient-to-r from-black/[0.28] via-transparent to-black/[0.28]" />

      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_50%_32%,transparent_0%,rgba(255,255,255,0.018)_42%,rgba(0,0,0,0.48)_100%)]" />

      {/* FINE FILM / STEEL TEXTURE */}
      <div className="events-noise pointer-events-none fixed inset-0 z-[3]" />

      {/* NAVBAR */}
      <Navbar />

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
          pb-24
          pt-[175px]
          sm:px-8
          sm:pt-[185px]
          lg:px-10
          lg:pt-[190px]
        "
      >
        {/* ===================================================
            PAGE HEADER
        ================================================== */}

        <div className="scroll-reveal mb-20 text-center">
          {/* SAMURAI BADGE */}
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/45 px-5 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white/75 shadow-[0_0_12px_rgba(255,255,255,0.25)]" />

            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/65 sm:text-xs">
              Esports Events
            </span>
          </div>

          {/* METALLIC SAMURAI TITLE */}
          <div className="events-title-center">
            <div className="relative inline-block">
              <svg
                className="events-title-svg"
                viewBox="0 0 1000 120"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                <defs>
                  {/* MAIN METALLIC GRADIENT */}
                  <linearGradient
                    id="eventsTitleFill"
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
                    id="eventsTitleInner"
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
                    id="eventsTitleShine"
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
                    id="eventsTitleShadow"
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

                <text
                  x="50%"
                  y="86"
                  textAnchor="middle"
                  fontFamily="The Last Shuriken, sans-serif"
                  fontSize="92"
                  fontWeight="700"
                  letterSpacing="-4"
                  className="events-title-text events-title-base"
                >
                  EVENTS
                </text>

                <text
                  x="50%"
                  y="86"
                  textAnchor="middle"
                  fontFamily="The Last Shuriken, sans-serif"
                  fontSize="92"
                  fontWeight="700"
                  letterSpacing="-4"
                  className="events-title-text events-title-inner"
                >
                  EVENTS
                </text>

                <text
                  x="50%"
                  y="86"
                  textAnchor="middle"
                  fontFamily="The Last Shuriken, sans-serif"
                  fontSize="92"
                  fontWeight="700"
                  letterSpacing="-4"
                  className="events-title-text events-title-shine"
                >
                  EVENTS
                </text>
              </svg>
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Upcoming battles, completed tournaments and the moments
            <br className="hidden sm:block" />
            that define our esports arena.
          </p>

          {/* PHOTO-REFERENCE SAMURAI DIVIDER */}
          <div className="events-divider mx-auto mt-8 flex w-full max-w-[380px] items-center justify-center">
            <div className="events-divider-line events-divider-left" />
            <div className="events-divider-diamond" aria-hidden="true" />
            <div className="events-divider-line events-divider-right" />
          </div>
        </div>

        {/* UPCOMING */}
        <EventSection
          title="UPCOMING EVENTS"
          subtitle="Prepare for the next battle"
          events={upcomingEvents}
          type="upcoming"
        />

        {/* PAST */}
        <EventSection
          title="PAST EVENTS"
          subtitle="Completed tournaments and fixtures"
          events={pastEvents}
          type="past"
        />
      </main>


      <style>{`
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');

        /* ==================================================
           GLOBAL SAMURAI TYPOGRAPHY
        ================================================== */

        .events-root,
        .events-root * {
          font-family: 'The Last Shuriken', sans-serif;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #030305;
        }

        ::selection {
          background: rgba(255,255,255,.18);
          color: #fff;
        }

        /* ==================================================
           BACKGROUND TEXTURE
        ================================================== */

        .events-noise {
          opacity: .10;
          background-image:
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,.018) 0px,
              rgba(255,255,255,.018) 1px,
              transparent 1px,
              transparent 4px
            );
          mix-blend-mode: screen;
        }

        /* ==================================================
           TITLE
        ================================================== */

        .events-title-center {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .events-title-svg {
          display: block;
          width: min(92vw, 1000px);
          height: auto;
          overflow: visible;
          pointer-events: none;
          margin-left: auto;
          margin-right: auto;
        }

        .events-title-text {
          font-size: 60px;
        }

        @media (min-width: 640px) {
          .events-title-text {
            font-size: 72px;
          }
        }

        @media (min-width: 768px) {
          .events-title-text {
            font-size: 84px;
          }
        }

        @media (min-width: 1024px) {
          .events-title-text {
            font-size: 92px;
          }
        }

        .events-title-base {
          fill: url(#eventsTitleFill);
          stroke: none;
          paint-order: normal;
          filter: url(#eventsTitleShadow);
        }

        .events-title-inner {
          fill: url(#eventsTitleInner);
          stroke: none;
          opacity: .34;
          pointer-events: none;
        }

        .events-title-shine {
          fill: url(#eventsTitleShine);
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
           PHOTO-REFERENCE DIVIDER
        ================================================== */

        .events-divider {
          position: relative;
          height: 18px;
          gap: 0;
        }

        .events-divider-line {
          height: 1px;
          flex: 1 1 auto;
          background: rgba(255,255,255,.32);
          box-shadow: 0 0 5px rgba(255,255,255,.05);
        }

        .events-divider-left {
          margin-right: 14px;
          background:
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(255,255,255,.28) 8%,
              rgba(255,255,255,.36) 100%
            );
        }

        .events-divider-right {
          margin-left: 14px;
          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,.36) 0%,
              rgba(255,255,255,.28) 92%,
              transparent 100%
            );
        }

        .events-divider-diamond {
          position: relative;
          width: 10px;
          height: 10px;
          flex: 0 0 10px;
          transform: rotate(45deg);
          border: 1px solid rgba(255,255,255,.58);
          background: rgba(3,3,5,.94);
          box-shadow:
            0 0 7px rgba(255,255,255,.08),
            inset 0 0 5px rgba(255,255,255,.04);
        }

        .events-divider-diamond::after {
          content: "";
          position: absolute;
          inset: 2px;
          border: 1px solid rgba(255,255,255,.12);
        }

        /* ==================================================
           SECTION ICON
        ================================================== */

        .events-section-icon {
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 12px;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.07),
              rgba(3,3,5,.76)
            );
          color: rgba(255,255,255,.68);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.08),
            0 10px 30px rgba(0,0,0,.40);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transition: all .3s ease;
        }

        .events-section-icon::before {
          content: "";
          position: absolute;
          inset: 5px;
          border: 1px solid rgba(255,255,255,.045);
          border-radius: 8px;
          pointer-events: none;
        }

        .events-section-icon:hover {
          border-color: rgba(255,255,255,.35);
          color: rgba(255,255,255,.90);
          background: rgba(255,255,255,.07);
          box-shadow:
            0 0 25px rgba(255,255,255,.08),
            inset 0 1px 0 rgba(255,255,255,.12);
        }

        /* ==================================================
           SECTION / CARD TYPOGRAPHY
        ================================================== */

        .events-section-heading,
        .events-card-title {
          font-family: 'The Last Shuriken', sans-serif !important;
          font-weight: 700;
          letter-spacing: .025em;
          text-shadow:
            0 3px 0 rgba(0,0,0,.82),
            0 6px 16px rgba(0,0,0,.88),
            0 0 10px rgba(255,255,255,.06);
        }

        .events-section-heading {
          position: relative;
        }

        .events-section-heading::after {
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
          box-shadow: 0 0 10px rgba(255,255,255,.10);
        }

        /* ==================================================
           DARK SAMURAI GLASS CARDS
        ================================================== */

        .events-card {
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.075),
              rgba(3,3,5,.80) 48%,
              rgba(255,255,255,.025)
            );
          border-color: rgba(255,255,255,.15);
          backdrop-filter: blur(20px) saturate(70%);
          -webkit-backdrop-filter: blur(20px) saturate(70%);
          box-shadow: 0 18px 65px rgba(0,0,0,.65);
        }

        .events-card::before {
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

        .events-card:hover {
          border-color: rgba(255,255,255,.35);
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.09),
              rgba(3,3,5,.82) 48%,
              rgba(255,255,255,.035)
            );
          box-shadow:
            0 22px 75px rgba(0,0,0,.72),
            0 0 28px rgba(255,255,255,.045);
        }

        .events-card-top-edge {
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.20),
              rgba(255,255,255,.62),
              rgba(255,255,255,.20),
              transparent
            );
          opacity: .70;
        }

        .events-hover-line {
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.22),
              rgba(255,255,255,.78),
              rgba(255,255,255,.22),
              transparent
            );
          box-shadow: 0 0 12px rgba(255,255,255,.12);
        }

        /* ==================================================
           TAGS
        ================================================== */

        .events-tag {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(255,255,255,.11);
          border-radius: 999px;
          background: rgba(255,255,255,.035);
          padding: 6px 12px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .16em;
          color: rgba(255,255,255,.46);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .events-tag-primary {
          border-color: rgba(255,255,255,.20);
          background: rgba(255,255,255,.055);
          color: rgba(255,255,255,.72);
        }

        /* ==================================================
           SCROLL POP-UP
        ================================================== */

        .scroll-reveal {
          opacity: 0;
          transform: translateY(75px) scale(.97);
          filter: blur(6px);
          transition:
            opacity .8s ease,
            transform .8s cubic-bezier(.16,1,.3,1),
            filter .8s ease;
        }

        .scroll-reveal.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }

        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 640px) {
          .events-title-svg {
            width: min(94vw, 720px);
          }

          .events-divider {
            max-width: 88vw;
          }

          .events-divider-left {
            margin-right: 11px;
          }

          .events-divider-right {
            margin-left: 11px;
          }

          .events-divider-diamond {
            width: 9px;
            height: 9px;
            flex-basis: 9px;
          }

          .events-card {
            border-radius: 22px;
          }
        }

        /* ==================================================
           REDUCED MOTION
        ================================================== */

        @media (prefers-reduced-motion: reduce) {
          .scroll-reveal {
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

      {/* STEEL BOTTOM LINE */}
      <div className="pointer-events-none fixed bottom-0 left-0 z-50 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
};

/* =========================================================
   STYLES — DARK SAMURAI SYSTEM
========================================================= */

export default Events;
