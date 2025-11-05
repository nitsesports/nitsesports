import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster.jsx";
import { Toaster as Sonner } from "@/components/ui/sonner.jsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import GamingCursor from "./components/GamingCursor.jsx";

const queryClient = new QueryClient();

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
