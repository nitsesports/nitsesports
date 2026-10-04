import { useState, useEffect } from "react";
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import LoadingScreen from "./Components/LoadingScreen";
import ShatterTransition from "./Components/ShatterTransition";

import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";
import ScrollSection from "./Components/ScrollSection";
import ScrollSection2 from "./Components/ScrollSection2";
import ScrollSection3 from "./Components/ScrollSection3";
import ScrollSection4 from "./Components/ScrollSection4";
import ScrollSection5 from "./Components/ScrollSection5";

import Team from "./Components/Team";
import Events from "./Components/Events";
import About from "./Components/About";
import Merchandise from "./Components/Merchendise";
import Schedule from "./Components/Schedule";

import Login from "./Components/Login";
import Register from "./Components/Register";

/* =====================================================
   APP
===================================================== */

function App() {
  const [loading, setLoading] = useState(true);
  const [shattering, setShattering] = useState(false);

  // Loading screen chalte waqt background scroll lock rahega
  useEffect(() => {
    if (loading || shattering) {
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [loading, shattering]);

  /* =====================================================
     LOADING COMPLETE
     Nayi LoadingScreen 100% hone par ye trigger hoga
  ===================================================== */
  const handleLoadingComplete = () => {
    // OPTION A (Default): Loading ke turant baad sidha Landing Page open hoga
    setLoading(false);
    setShattering(false);

    // OPTION B: Agar aapko beech me ShatterTransition bhi chahiye,
    // toh upar ki 2 lines hata kar niche wali line uncomment kar lein:
    // setShattering(true);
  };

  /* =====================================================
     SHATTER COMPLETE (Agar ShatterTransition use karein)
  ===================================================== */
  const handleShatterComplete = () => {
    setLoading(false);
    setShattering(false);
  };

  /* =====================================================
     WEBSITE READY
  ===================================================== */
  const websiteReady = !loading && !shattering;

  return (
    <BrowserRouter>

      {/* =================================================
          SCROLL TO TOP
      ================================================= */}
      <ScrollToTop />

      {/* =================================================
          ROUTES
      ================================================= */}
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={
            <Home
              websiteReady={websiteReady}
            />
          }
        />

        {/* TEAM */}
        <Route
          path="/team"
          element={
            <TeamPage
              websiteReady={websiteReady}
            />
          }
        />

        {/* EVENTS */}
        <Route
          path="/events"
          element={
            <EventsPage
              websiteReady={websiteReady}
            />
          }
        />

        {/* ABOUT */}
        <Route
          path="/about"
          element={
            <AboutPage
              websiteReady={websiteReady}
            />
          }
        />

        {/* MERCHANDISE */}
        <Route
          path="/merchandise"
          element={
            <MerchandisePage
              websiteReady={websiteReady}
            />
          }
        />

        {/* SCHEDULE */}
        <Route
          path="/schedule"
          element={
            <SchedulePage
              websiteReady={websiteReady}
            />
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* REGISTER-TEST */}
        <Route
          path="/register-test"
          element={<Register />}
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            <Home
              websiteReady={websiteReady}
            />
          }
        />

      </Routes>

      {/* =================================================
          NAVBAR
      ================================================= */}
      {websiteReady && <NavbarController />}

      {/* =================================================
          NEW CYBER LOADING SCREEN
      ================================================= */}
      {loading && !shattering && (
        <LoadingScreen
          minDuration={3200} // 3.2 seconds loading animation
          onComplete={handleLoadingComplete}
          onLoadingComplete={handleLoadingComplete}
        />
      )}

      {/* =================================================
          SHATTER TRANSITION (Agar Option B enable karein)
      ================================================= */}
      {shattering && (
        <ShatterTransition
          onComplete={handleShatterComplete}
        />
      )}

    </BrowserRouter>
  );
}

/* =====================================================
   NAVBAR CONTROLLER
===================================================== */
function NavbarController() {
  return <Navbar />;
}

/* =====================================================
   SCROLL TO TOP
===================================================== */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

/* =====================================================
   HOME PAGE
===================================================== */
function Home({ websiteReady }) {
  return (
    <main
      className="
        relative
        w-full
        overflow-x-hidden
        bg-black
      "
    >

      {/* =================================================
          HERO
      ================================================= */}
      <section
        id="home"
        className="
          relative
          h-screen
          w-full
          overflow-hidden
          bg-black
        "
      >
        {websiteReady && (
          <div
            className="
              relative
              z-[2]
              h-full
              w-full
            "
          >
            <Hero />
          </div>
        )}
      </section>

      {/* =================================================
          SECTION 1
      ================================================= */}
      {websiteReady && (
        <section
          id="scroll-section"
          className="
            relative
            min-h-screen
            w-full
            bg-black
          "
        >
          <ScrollSection />
        </section>
      )}

      {/* =================================================
          SECTION 2
      ================================================= */}
      {websiteReady && (
        <section
          id="scroll-section-2"
          className="
            relative
            min-h-screen
            w-full
            bg-black
          "
        >
          <ScrollSection2 />
        </section>
      )}

      {/* =================================================
          SECTION 3
      ================================================= */}
      {websiteReady && (
        <section
          id="scroll-section-3"
          className="
            relative
            min-h-screen
            w-full
            bg-black
          "
        >
          <ScrollSection3 />
        </section>
      )}

      {/* =================================================
          SECTION 4 (The Experience)
      ================================================= */}
      {websiteReady && (
        <section
          id="scroll-section-4"
          className="
            relative
            min-h-screen
            w-full
            bg-black
          "
        >
          <ScrollSection4 />
        </section>
      )}

      {/* =================================================
          SECTION 5
      ================================================= */}
      {websiteReady && (
        <section
          id="scroll-section-5"
          className="
            relative
            min-h-screen
            w-full
            bg-black
          "
        >
          <ScrollSection5 />
        </section>
      )}

    </main>
  );
}

/* =====================================================
   TEAM PAGE
===================================================== */
function TeamPage({ websiteReady }) {
  return (
    <main
      className="
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        bg-black
      "
    >
      {websiteReady && <Team />}
    </main>
  );
}

/* =====================================================
   EVENTS PAGE
===================================================== */
function EventsPage({ websiteReady }) {
  return (
    <main
      className="
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        bg-black
      "
    >
      {websiteReady && <Events />}
    </main>
  );
}

/* =====================================================
   ABOUT PAGE
===================================================== */
function AboutPage({ websiteReady }) {
  return (
    <main
      className="
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        bg-black
      "
    >
      {websiteReady && <About />}
    </main>
  );
}

/* =====================================================
   MERCHANDISE PAGE
===================================================== */
function MerchandisePage({ websiteReady }) {
  return (
    <main
      className="
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        bg-black
      "
    >
      {websiteReady && <Merchandise />}
    </main>
  );
}

/* =====================================================
   SCHEDULE PAGE
===================================================== */
function SchedulePage({ websiteReady }) {
  return (
    <main
      className="
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        bg-black
      "
    >
      {websiteReady && <Schedule />}
    </main>
  );
}

export default App;