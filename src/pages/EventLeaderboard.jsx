// src/pages/EventLeaderboard.jsx

import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEventById } from "@/data/eventsStore";
// Removed: type Event and type Game imports
import { isAuthed } from "@/auth/auth";
import { supabase } from "@/lib/supabase";

// Game assets
import mlImg from "@/assets/ml.jpg";
import valorantImg from "@/assets/valorant.jpg";
import codImg from "@/assets/cod.jpg";
import bgmiImg from "@/assets/bgmi.jpg";
import freefireImg from "@/assets/freefire.jpg";

// Import the new game-specific leaderboard components
import LeaderboardBgmi from "@/components/leaderboards/LeaderboardBgmi";
import LeaderboardFreeFire from "@/components/leaderboards/LeaderboardFreeFire";
import LeaderboardMl from "@/components/leaderboards/LeaderboardMl";
import LeaderboardCodm from "@/components/leaderboards/LeaderboardCodm";
import LeaderboardSimple from "@/components/leaderboards/LeaderboardSimple";

// This is the mock event data, kept in the parent component
const lockLoadHero = "https://cdn.builder.io/api/v1/image/assets%2F778be80571eb4edd92c70f9fecab8fab%2F21e5721d76704013a2fd522cdf0daa0e?format=webp&width=1600";


const specialLockLoad = {
  id: "lock-load",
  title: "Lock & Load",
  date: "TBA",
  location: "TBA",
  participants: "124",
  prize: "2,000",
  status: "completed",
  image: lockLoadHero,
  games: [
    {
      id: "ml",
      name: "Mobile Legends",
      image: mlImg,
      participants: "80",
      gameHead: { name: "Vaibhav Raj", phone: "8434307257" },
      format: "points",
      
    },
    {
      id: "valorant",
      name: "Valorant",
      image: valorantImg,
      participants: "40",
      gameHead: { name: "Sunil Kushwah", phone: "7083644807" },
      format: "points",
     
    },
    {
      id: "codm",
      name: "COD Mobile",
      image: codImg,
      participants: "70",
      gameHead: { name: "Abhishek Kumar", phone: "8877155782" },
      format: "points",
      
    },
    {
      id: "bgmi",
      name: "BGMI",
      image: bgmiImg,
      participants: "124",
      gameHead: { name: "Arkaprovo Mukherjee", phone: "9563136407" },
      format: "points",
      
    },
    {
      id: "freefire",
      name: "Free Fire",
      image: freefireImg,
      participants: "184",
      gameHead: { name: "Suryans Singh", phone: "6307843856" },
      format: "points",
      
    },
  ],
};

const specialVanguardArena = {
  id: "vanguardarena",
  title: "Vanguard Arena",
  date: "TBA",
  location: "Online",
  participants: "150",
  prize: "5,000",
  status: "completed",
  image: lockLoadHero, 
  games: [
    {
      id: "ml",
      name: "Mobile Legends",
      image: mlImg,
      participants: "80",
      gameHead: { name: "Vaibhav Raj", phone: "8434307257" },
      format: "points",
    },
    {
      id: "valorant",
      name: "Valorant",
      image: valorantImg,
      participants: "40",
      gameHead: { name: "Sunil Kushwah", phone: "7083644807" },
      format: "points",
    },
    {
      id: "codm",
      name: "COD Mobile",
      image: codImg,
      participants: "70",
      gameHead: { name: "Abhishek Kumar", phone: "8877155782" },
      format: "points",
    },
    {
      id: "bgmi",
      name: "BGMI",
      image: bgmiImg,
      participants: "124",
      gameHead: { name: "Arkaprovo Mukherjee", phone: "9563136407" },
      format: "points",
    },
    {
      id: "freefire",
      name: "Free Fire",
      image: freefireImg,
      participants: "184",
      gameHead: { name: "Suryans Singh", phone: "6307843856" },
      format: "points",
    },
  ],
};

const mockEvents = {
  "lock-load": specialLockLoad,
  "vanguardarena": specialVanguardArena,
};

const EventLeaderboard = () => {
  const params = useParams();
  const navigate = useNavigate();
  const eventId = params.eventId; 
  const gameId = params.gameId; 

  const baseEvent = getEventById(eventId);
  
  // --- MODIFIED: Use the mockEvents map to load the correct event ---
  const event = baseEvent ?? mockEvents[eventId];

  const selectedGame = useMemo(() => {
    if (!event || !Array.isArray(event.games)) return undefined;
    return gameId ? event.games.find((g) => g.id === gameId) : undefined;
  }, [event, gameId]);

  const [canEdit, setCanEdit] = useState(false); 

  useEffect(() => {
    let mounted = true;
    
    // --- MODIFIED: Define which events are editable ---
    const editableEvents = ["lock-load", "vanguardarena"];
    const isEditableEvent = editableEvents.includes(eventId);

    const check = async () => {
      let ok = isAuthed();
      try {
        const { data } = await supabase.auth.getSession();
        const email = data.session?.user?.email;
        const allowedEmail = import.meta.env.VITE_ADMIN_EMAIL; 
        if (data.session && (!allowedEmail || email === allowedEmail)) ok = true;
      } catch {}
      // --- MODIFIED: Use the new isEditableEvent variable ---
      if (mounted) setCanEdit(ok && isEditableEvent);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const allowedEmail = import.meta.env.VITE_ADMIN_EMAIL; 
      const email = session?.user?.email;
      // --- MODIFIED: Use the new isEditableEvent variable ---
      setCanEdit((isAuthed() || (!!session && (!allowedEmail || email === allowedEmail))) && isEditableEvent);
    });
    return () => {
      mounted = false;
      try { sub.subscription.unsubscribe(); } catch {}
    };
  }, [eventId]);

  if (!event) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="font-orbitron">Event not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/events")}>Back to Events</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderGameLeaderboard = () => {
    if (!selectedGame) return null;

    // Pass the correct props to each game component
    switch (gameId) {
      case "ml":
        return <LeaderboardMl eventId={eventId} game={selectedGame} canEdit={canEdit} />;
      case "bgmi":
        return <LeaderboardBgmi eventId={eventId} game={selectedGame} canEdit={canEdit} />;
      case "freefire":
        return <LeaderboardFreeFire eventId={eventId} game={selectedGame} canEdit={canEdit} />;
      case "codm":
        return <LeaderboardCodm eventId={eventId} game={selectedGame} canEdit={canEdit} />;
      case "valorant":
      default:
        // Use the simple component for Valorant or any other game
        // that just needs to display its `rankings` array.
        return <LeaderboardSimple game={selectedGame} />;
    }
  };

  const header = (
    <div className="mb-8 overflow-hidden rounded-xl border border-border/50 sm:mb-10">
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 bg-background/70 backdrop-blur-sm border-b border-border/40">
        <div>
          {/* --- MODIFIED: Back button should go to the specific event's page --- */}
          <Link to={`/events/${eventId}`}>
            <Button variant="outline" className="w-full sm:w-auto">
              Back
            </Button>
          </Link>
        </div>
      </div>
      <div className="relative h-48 sm:h-56 md:h-64">
        <img
          src={selectedGame?.image ?? event?.image}
          alt={selectedGame ? selectedGame.name : event?.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        <div className="relative z-10 flex h-full flex-col justify-end gap-4 p-4 sm:p-6">
          <div className="flex flex-col gap-4 text-white sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                {event?.title}
              </h1>
              {gameId && selectedGame && (
                <>
                  <div className="mt-2 sm:mt-3">
                    <h2 className="font-orbitron text-lg sm:text-xl text-yellow-400">
                      {selectedGame.name} — Leaderboard
                    </h2>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Prize pool:{" "}
                      <span className="font-orbitron font-semibold text-yellow-400">
                        {event?.prize}
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                    <Badge variant={event?.status === "live" ? "default" : "outline"}>
                      {event?.status === "live" ? "Live" : "Completed"}
                    </Badge>
                    <Badge variant="outline">{selectedGame.participants} participants</Badge>
                    <Badge variant="outline">Prize {event?.prize}</Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12 sm:pt-24">
      <div className="container mx-auto px-4">
        {header}

        {!gameId ? (
          // This is the "Select a Game" grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(event.games) && event.games.map((game) => (
              <div
                key={game.id}
                className="group cursor-pointer rounded-xl bg-gradient-to-r from-primary/40 via-secondary/40 to-accent/40 p-[1px] transition-transform hover:scale-[1.01]"
                onClick={() => navigate(`/events/${event.id}/leaderboard/${game.id}`)}
              >
                <Card className="overflow-hidden rounded-[11px]">
                  <div className="relative h-44 overflow-hidden">
                    <img src={game.image} alt={game.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <CardTitle className="font-orbitron text-xl">{game.name}</CardTitle>
                      <Button size="sm" className="opacity-0 transition-opacity group-hover:opacity-100">View</Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          // This renders the specific game component
          <div className="space-y-4">
            {renderGameLeaderboard()}
            
            {/* Contact Info Card - Stays in the parent */}
            <div className="mt-6">
              <Card className="glass-card border-border/30 bg-black text-white">
                <CardHeader>
                  <CardTitle className="font-orbitron text-2xl">For Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedGame?.gameHead ? (
                    <p className="text-lg text-muted-foreground">
                      For any queries, DM or contact the{' '}
                      <span className="font-semibold text-yellow-400">
                        Game Head — {selectedGame.gameHead.name}
                      </span>{' '}
                      at{' '}
                      <a href={`tel:${selectedGame.gameHead.phone}`} className="font-semibold text-yellow-400">
                        {selectedGame.gameHead.phone}
                      </a>.
                    </p>
                  ) : (
                    <p className="text-lg text-muted-foreground">
                      For any queries, please reach out to the event organizers.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventLeaderboard;
