import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster.jsx";
import { Toaster as Sonner } from "@/components/ui/sonner.jsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useParams } from "react-router-dom";
import Navigation from "./components/Navigation.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Events from "./pages/Events.jsx";
import Schedule from "./pages/Schedule.jsx";
import Team from "./pages/Team.jsx";
import Gallery from "./pages/Gallery.jsx";
import Merchandise from "./pages/Merchandise.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";
import EventLeaderboard from "./pages/EventLeaderboard.jsx";
import LockLoad from "./pages/LockLoad.jsx";
import EventSchedule from "./pages/EventSchedule.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentFail from "./pages/PaymentFail.jsx";
import RequireAuth from "./auth/RequireAuth";
import RequireAdmin from "./auth/RequireAdmin";
import VanguardArena from "./pages/Gamingbonanza.jsx";
import TeamRegistration from "./pages/TeamRegistration.jsx";
import RegistrationConfirmation from "./pages/RegistrationConfirmation.jsx";
import CashfreeReturn from "./pages/CashfreeReturn.jsx";
import IntroOverlay, { hasSeenIntro } from "./components/IntroOverlay.jsx";
import PlexusBackground from "./components/PlexusBackground.jsx";
import SEO from "./components/SEO.jsx";
import GamingCursor from "./components/GamingCursor.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";

const queryClient = new QueryClient();

function RouteSEO() {
  const location = useLocation();
  const path = location.pathname;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const canonical = typeof window !== 'undefined' ? window.location.href : undefined;

  const defaultImage = `${origin}/placeholder.svg`;

  const noindex = [
    /^\/login$/,
    /^\/admin/,
    /^\/PaymentSuccess$/i,
    /^\/PaymentFail$/i,
    /^\/cashfree-return$/,
    /^\/registration-confirmation\//,
    /^\/events\/[^/]+\/register\//,
  ].some(r => r.test(path));

  const map = {
    "/": {
      title: "NIT Silchar Esports Club — Competitive Gaming Community",
      description: "Official esports club of NIT Silchar. Join tournaments, view schedules, and climb the leaderboards.",
    },
    "/events": {
      title: "Events & Tournaments — NIT Silchar Esports Club",
      description: "Explore upcoming esports events, tournaments, and competitions at NIT Silchar.",
    },
    "/schedule": {
      title: "Schedule — NIT Silchar Esports Club",
      description: "View the latest match schedules and event timelines for our esports tournaments.",
    },
    "/team": {
      title: "Our Team & Community — NIT Silchar Esports Club",
      description: "Meet the players, organizers, and community behind NIT Silchar Esports Club.",
    },
    "/gallery": {
      title: "Gallery — NIT Silchar Esports Club",
      description: "Photos and highlights from tournaments and events at NIT Silchar Esports Club.",
    },
    "/merchandise": {
      title: "Merchandise — NIT Silchar Esports Club",
      description: "Official esports club merchandise for fans and players at NIT Silchar.",
    },
    "/about": {
      title: "About — NIT Silchar Esports Club",
      description: "Learn about the mission and activities of the NIT Silchar Esports Club.",
    },
  };

  const meta = map[path] || {
    title: "NIT Silchar Esports Club",
    description: "Esports tournaments, leaderboards, schedules, and community at NIT Silchar.",
  };

  const robots = noindex ? "noindex, nofollow" : "index, follow";

  const structuredData = path === "/" ? [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "NIT Silchar Esports Club",
      ...(origin ? { "url": origin } : {}),
      "logo": `${origin}/placeholder.svg`
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      ...(origin ? { "url": origin } : {}),
      "name": "NIT Silchar Esports Club"
    }
  ] : undefined;

  return (
    <SEO
      title={meta.title}
      description={meta.description}
      image={defaultImage}
      robots={robots}
      canonical={canonical}
      structuredData={structuredData}
    />
  );
}


function MainRoutes() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <main className={`flex-1 ${isHome ? "pt-0" : "pt-16"}`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId/leaderboard" element={<EventLeaderboard />} />
        <Route path="/events/:eventId/leaderboard/:gameId" element={<EventLeaderboard />} />
        <Route path="/events/lock-load" element={<LockLoad />} />
        <Route path="/events/vanguardarena" element={<VanguardArena />} />
        <Route path="/events/:eventId/schedule" element={<EventSchedule />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/team" element={<Team />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/merchandise" element={<Merchandise />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
        <Route path="/PaymentFail" element={<PaymentFail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/events/:eventId/register/:gameId" element={<RequireAuth><TeamRegistration /></RequireAuth>} />
        <Route path="/registration-confirmation/:registrationId" element={<RequireAuth><RegistrationConfirmation /></RequireAuth>} />
        <Route path="/cashfree-return" element={<RequireAuth><CashfreeReturn /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

const App = () => {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
  
    const seen = hasSeenIntro();
    setShowIntro(!seen);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PlexusBackground/>
          {/* <GamingCursor /> */}
           <RouteSEO />
          <div className="relative min-h-screen bg-gradient-to-b from-[#050505]/30 via-[#0a0a1f]/20 to-[#000000]/20 text-white flex flex-col z-30">
            <Navigation />
            <MainRoutes />
            <Footer />
          </div>
          {showIntro && <IntroOverlay onClose={() => setShowIntro(false)} />}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
