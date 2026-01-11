import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, MapPin, Calendar, Zap } from "lucide-react";
import { isAuthed } from "@/auth/auth";
import { supabase } from "@/lib/supabase";
import freefireImg from "@/assets/freefire.jpg";
import LeaderboardFreeFire from "@/components/leaderboards/LeaderboardFreeFire";

const FreeFire = () => {
  const navigate = useNavigate();
  const [canEdit, setCanEdit] = useState(false);
  const [user, setUser] = useState(null);

  // FreeFire RUPYVERSE event data
  const ficFreeFire = {
    id: "ficfreefire",
    title: "RUPYVERSE",
    subtitle: "Free Fire Tournament by Finance and Investment Club",
    date: "19-22 January",
    location: "CC BUILDING",
    colaboratedby: "NITS ESPORTS CLUB",
    //participants: "184",
    prize: "10,000",
    status: "upcoming", // Change to "live" or "completed" to show leaderboard
    image: freefireImg,
    game: {
      id: "freefire",
      name: "Free Fire",
      image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372616/freefire_uutecs.jpg",
      participants: "#",
      gameHead: { name: "Suryans Singh", phone: "6307843856" },
      format: "points",
      
    },
    format: "4v4 Squad-based Battle Royale",
    conductedBy: "Finance and Investment Club",
    docLink: "https://gamma.app/docs/VANGUARD-ARENA-aei2y0ivstdkaww",
  };

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      let ok = isAuthed();
      try {
        const { data } = await supabase.auth.getSession();
        const email = data.session?.user?.email;
        const allowedEmail = import.meta.env.VITE_ADMIN_EMAIL;
        setUser(data.session?.user ?? null);
        if (data.session && (!allowedEmail || email === allowedEmail)) ok = true;
      } catch {}
      if (mounted) setCanEdit(ok);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const allowedEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const email = session?.user?.email;
      setUser(session?.user ?? null);
      setCanEdit(isAuthed() || (!!session && (!allowedEmail || email === allowedEmail)));
    });
    return () => {
      mounted = false;
      try {
        sub.subscription.unsubscribe();
      } catch {}
    };
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12 sm:pt-24">
      <div className="container mx-auto px-4">
        {/* Hero Header */}
        <div className="mb-8 overflow-hidden rounded-xl border border-border/50 sm:mb-10">
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 bg-background/70 backdrop-blur-sm border-b border-border/40">
            <Button variant="outline" onClick={() => navigate("/events")} className="w-full sm:w-auto">
              Back
            </Button>
          </div>
          <div className="relative h-48 sm:h-56 md:h-64">
            <img
              src={ficFreeFire.image}
              alt={ficFreeFire.game.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
            <div className="relative z-10 flex h-full flex-col justify-end gap-4 p-4 sm:p-6">
              <div>
                <p className="text-yellow-300 font-orbitron text-sm sm:text-base mb-2">
                  {ficFreeFire.conductedBy}
                  <br />
                  PRESENTS
                </p>
                <h1 className="font-orbitron text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-2">
                  {ficFreeFire.title}
                </h1>
                <p className="text-yellow-400 font-orbitron text-lg sm:text-xl font-bold">
                  {ficFreeFire.game.name.toUpperCase()} TOURNAMENTS
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <Badge variant={ficFreeFire.status === "live" ? "default" : ficFreeFire.status === "completed" ? "outline" : "secondary"}>
                    {ficFreeFire.status === "live"
                      ? "🔴 Live Now"
                      : ficFreeFire.status === "completed"
                      ? "Completed"
                      : "🔔 Coming Soon"}
                  </Badge>
                  <Badge variant="outline">Prize ₹{ficFreeFire.prize}</Badge>
                  <Badge variant="outline">{ficFreeFire.participants} Teams</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Show Leaderboard if Tournament is Live */}
        {(ficFreeFire.status === "live" || ficFreeFire.status === "completed") ? (
          <div className="space-y-4">
            <LeaderboardFreeFire
              eventId={ficFreeFire.id}
              game={ficFreeFire.game}
              canEdit={canEdit}
            />

            {/* Contact Info Card */}
            <div className="mt-6">
              <Card className="glass-card border-border/30 bg-black text-white">
                <CardHeader>
                  <CardTitle className="font-orbitron text-2xl">For Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  {ficFreeFire.game.gameHead ? (
                    <p className="text-lg text-muted-foreground">
                      For any queries, DM or contact the{" "}
                      <span className="font-semibold text-yellow-400">
                        Game Head — {ficFreeFire.game.gameHead.name}
                      </span>{" "}
                      at{" "}
                      <a
                        href={`tel:${ficFreeFire.game.gameHead.phone}`}
                        className="font-semibold text-yellow-400"
                      >
                        {ficFreeFire.game.gameHead.phone}
                      </a>
                      .
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
        ) : (
          // Show Details and Registration when Tournament is Not Live
          <div className="space-y-6">
            {/* Tournament Overview */}
            <Card className="glass-card border-border/30">
              <CardHeader>
                <CardTitle className="font-orbitron text-2xl flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  Tournament Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dates</p>
                      <p className="font-orbitron text-lg">{ficFreeFire.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-orbitron text-lg">{ficFreeFire.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Trophy className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Prize Pool</p>
                      <p className="font-orbitron text-lg">₹{ficFreeFire.prize}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border/30 space-y-2">
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-white">In Association With:</span> {ficFreeFire.colaboratedby}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-white">Format:</span> {ficFreeFire.format}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tournament Details & Rules */}
            <Card className="glass-card border-border/30 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5">
              <CardHeader>
                <CardTitle className="font-orbitron text-2xl">Tournament Rules & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  For complete tournament rules, format details, prize distribution, and all other information, please refer to the official tournament documentation.
                </p>
                <Button
                  onClick={() => window.open(ficFreeFire.docLink, "_blank")}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-orbitron"
                  size="lg"
                >
                  📄 View Full Tournament Rules & Details
                </Button>
                <p className="text-xs text-muted-foreground">
                  Documentation opens in a new tab. Make sure to read all rules before registering.
                </p>
              </CardContent>
            </Card>

            {/* Registration Section */}
            <Card className="glass-card border-border/30 bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/10">
              <CardHeader>
                <CardTitle className="font-orbitron text-2xl text-yellow-400">Ready to Compete?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user ? (
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      Sign in with your account to register your team for the tournament.
                    </p>
                    <Button
                      onClick={() => navigate("/login")}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-orbitron"
                      size="lg"
                    >
                      Sign In to Register
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      You are logged in as <span className="font-semibold text-white">{user.email}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Registration details and team management will be available soon. Check back for updates!
                    </p>
                    <Button
                      onClick={() => navigate(`/events/${ficFreeFire.id}/register/${ficFreeFire.game.id}`)}
                      className="w-full font-orbitron"
                      size="lg"
                    >
                      Registration Team
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card className="glass-card border-border/30 bg-black text-white">
              <CardHeader>
                <CardTitle className="font-orbitron text-2xl">For Queries</CardTitle>
              </CardHeader>
              <CardContent>
                {ficFreeFire.game.gameHead ? (
                  <div className="space-y-3">
                    <p className="text-lg text-muted-foreground">
                      For any queries, contact the{" "}
                      <span className="font-semibold text-yellow-400">
                        Game Head — {ficFreeFire.game.gameHead.name}
                      </span>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">📱</span>
                      <a
                        href={`tel:${ficFreeFire.game.gameHead.phone}`}
                        className="font-semibold text-yellow-400 hover:underline"
                      >
                        {ficFreeFire.game.gameHead.phone}
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg text-muted-foreground">
                    For any queries, please reach out to the event organizers.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeFire;