import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ChevronLeft } from "lucide-react";

import { supabase } from "@/lib/supabase.js";

const games = [
  { id: "bgmi", name: "BGMI", image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372612/bgmi_lxvrnt.jpg", brochure: "https://gamma.app/docs/VANGUARD-ARENA-i71v4n1968gk240", prize: 25000 },
  { id: "rc", name: "Real Cricket 24", image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1766304221/KRAFTON.jpg_ms0hab.webp", brochure: "https://gamma.app/docs/VANGUARD-xpmguxeg1uuld3q", prize: 5000 },
  { id: "valorant", name: "Valorant", image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372668/valorant_qxje8q.jpg", brochure: "https://gamma.app/docs/Vanguard-Arena-zrpooho817957yj", prize: 5000 },
  { id: "ml", name: "Mobile Legends", image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372633/ml_h8honj.jpg", brochure: "https://gamma.app/docs/TECNOESIS-CUP-mlbb-h5oottx9xnwqnet", prize: 5000 },
  { id: "fifa", name: "FIFA 25", image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372618/FIFA_tzgbj9.jpg", brochure: "https://gamma.app/docs/TECNOESIS-CUP-mlbb-h5oottx9xnwqnet", prize: 5000 },
];

const CLOSED_GAMES = new Set(["rc", "bgmi", "valorant", "ml"]);

const VanguardArena = () => {
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000); // hide after 3s
  };

  const handleRegisterClick = async (g) => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        // redirect to login and preserve current path
        navigate('/login', { state: { from: `/events/vanguardarena/register/${g.id}` } });
        return;
      }
      navigate(`/events/vanguardarena/register/${g.id}`);
    } catch (err) {
      showToast("Auth check failed");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 relative">
      {/* Back Button */}
      <div className="container mx-auto px-4 mb-6">
        <Button
          variant="outline"
          className="flex items-center gap-2 font-orbitron"
          onClick={() => navigate("/events")}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </div>

      {/* Hero banner */}
      <div className="w-full px-4">
        <div className="mx-auto rounded-xl overflow-hidden shadow-xl max-w-[1400px]">
          <div className="relative">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F778be80571eb4edd92c70f9fecab8fab%2Fb08a719e7a5748bd857bfb0fe32be8a0?format=webp&width=1600"
              alt="Lock & Load banner"
              className="w-full h-72 md:h-80 lg:h-96 object-cover brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-6 py-8 text-center">
                <h1 className="font-orbitron text-4xl md:text-6xl font-bold text-white">Vanguard Arena</h1>
                <p className="mt-2 text-white/90 max-w-2xl mx-auto drop-shadow-md">
                  A fast-paced multi-game tournament featuring top clubs across multiple titles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Games grid */}
      <div className="container mx-auto px-4 mt-8">
        <h2 className="font-orbitron text-2xl font-bold mb-6">Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((g) => (
            <Card key={g.id} className="glass-card overflow-hidden">
              <div className="relative h-40">
                <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
              </div>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="font-orbitron">{g.name}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Prize pool: <span className="font-orbitron font-semibold text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">₹{g.prize.toLocaleString("en-IN")}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <a href={g.brochure} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full font-orbitron mb-2">
                      View Details
                    </Button>
                  </a>
                  {CLOSED_GAMES.has(g.id) ? (
                    <Button
                      className="w-full font-orbitron bg-purple-600 hover:bg-purple-700"
                      onClick={() => navigate(`/events/vanguardarena/leaderboard/${g.id}`)}
                    >
                      View Leaderboard
                    </Button>
                  ) : (
                    <Button
                      className="w-full font-orbitron"
                      onClick={() => handleRegisterClick(g)}
                    >
                      Register Team
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-yellow-400 text-black px-5 py-3 rounded-lg shadow-lg animate-fade-in-out z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default VanguardArena;
