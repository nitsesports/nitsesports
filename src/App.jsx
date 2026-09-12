
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

  /* =====================================================
     LOADING COMPLETE
  ===================================================== */

  const handleLoadingComplete = () => {
    setShattering(true);
  };

  /* =====================================================
     SHATTER COMPLETE
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

        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/"
          element={
            <Home
              websiteReady={websiteReady}
            />
          }
        />


        {/* =================================================
            TEAM
        ================================================= */}

        <Route
          path="/team"
          element={
            <TeamPage
              websiteReady={websiteReady}
            />
          }
        />


        {/* =================================================
            EVENTS
        ================================================= */}

        <Route
          path="/events"
          element={
            <EventsPage
              websiteReady={websiteReady}
            />
          }
        />


        {/* =================================================
            ABOUT
        ================================================= */}

        <Route
          path="/about"
          element={
            <AboutPage
              websiteReady={websiteReady}
            />
          }
        />


        {/* =================================================
            MERCHENDISE
        ================================================= */}

        <Route
          path="/merchandise"
          element={
            <MerchandisePage
              websiteReady={websiteReady}
            />
          }
        />


        {/* =================================================
            SCHEDULE
        ================================================= */}

        <Route
          path="/schedule"
          element={
            <SchedulePage
              websiteReady={websiteReady}
            />
          }
        />


        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =================================================
            REGISTER
        ================================================= */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =================================================
            REGISTER-TEST

            Kept for compatibility with the existing
            Sign Up link in Login.jsx.
        ================================================= */}

        <Route
          path="/register-test"
          element={<Register />}
        />


        {/* =================================================
            FALLBACK
        ================================================= */}

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

          Navbar remains visible on ALL pages,
          including Login and Register.
      ================================================= */}

      {websiteReady && <NavbarController />}


      {/* =================================================
          LOADING SCREEN
      ================================================= */}

      {loading && !shattering && (
        <LoadingScreen
          onLoadingComplete={handleLoadingComplete}
        />
      )}


      {/* =================================================
          SHATTER TRANSITION
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
  /*
    Navbar is intentionally visible on every route,
    including:

    /login
    /register
    /register-test
  */

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

        {/* =================================================
            HERO CONTENT

            Landing video completely removed.
            Background is now pure black.
        ================================================= */}

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
          SECTION 4
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
   MERCHENDISE PAGE
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


/* =====================================================
   EXPORT
===================================================== */

export default App;

