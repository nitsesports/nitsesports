import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { listEvents } from "@/data/eventsStore";
import lockImg from "@/assets/valorant.jpg";
import vanguard from "@/assets/vanguard.mp4";
import { supabase } from "@/lib/supabase.js";
import { useState ,useEffect} from "react";
import { useRef } from "react";




const Events = () => {
  const REGISTRATION_START = new Date("2026-01-01T00:00:00");
  const [toastMessage, setToastMessage] = useState("");
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState("");

useEffect(() => {
  const updateTimer = () => {
    const now = new Date();
    const diff = REGISTRATION_START - now;

    if (diff <= 0) {
      setTimeLeft("");
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    setTimeLeft(
      `${days}d ${hours}h ${minutes}m ${seconds}s`
    );
  };

  updateTimer();
  const interval = setInterval(updateTimer, 1000);
  return () => clearInterval(interval);
}, []);


  const navigate = useNavigate();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

 const handleRegisterClick = async (g) => {
  try {
    const { data } = await supabase.auth.getSession();
    const target = `/events/vanguardarena/register/${g.id}`;

    if (!data?.session) {
      // ✅ store intended page
      sessionStorage.setItem("post_login_redirect", target);

      // ✅ go to login (NO state)
      navigate("/login");
      return;
    }

    // user already logged in
    navigate(target);
  } catch (err) {
    showToast("Auth check failed");
  }
};

  const games = [
    { id: "bgmi", name: "BGMI", image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372612/bgmi_lxvrnt.jpg", brochure: "https://gamma.app/docs/VANGUARD-ARENA-i71v4n1968gk240", prize: 25000 },
    { id: "rc", name: "Real Cricket", image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1766304221/KRAFTON.jpg_ms0hab.webp", brochure: "https://gamma.app/docs/VANGUARD-xpmguxeg1uuld3q", prize: 5000 },
    { id: "freefire", name: "Free Fire", image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372616/freefire_uutecs.jpg", brochure: "https://gamma.app/docs/VANGUARD-ARENA-aei2y0ivstdkaww", prize: 15000 },
    { id: "valorant", name: "Valorant", image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372668/valorant_qxje8q.jpg", brochure: "https://gamma.app/docs/Vanguard-Arena-zrpooho817957yj", prize: 10000 },
    { id: "ml", name: "Mobile Legends", image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372633/ml_h8honj.jpg", brochure: "https://gamma.app/docs/TECNOESIS-CUP-mlbb-h5oottx9xnwqnet", prize: 10000 },
    // { id: "fifa", name: "FIFA 25", image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372618/FIFA_tzgbj9.jpg", brochure: "https://example.com/brochures/fifa" },
    // { id: "bulletchoe", name: "Bullet Echo", image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372614/bullet_echo_ai4ekj.jpg", brochure: "https://example.com/brochures/bulletchoe" },
    // { id: "clashroyale", name: "Clash Royale", image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372615/clash_royale_q1nbd7.jpg", brochure: "https://example.com/brochures/clashroyale" },
  ];

  const allEvents = listEvents();
  const liveEvents = allEvents.filter((e) => e.status === "live");

  const pastEvents = [
    {
      id: "lock-load",
      title: "Lock & Load",
      date: "Oct 12, 2025 - Oct 19, 2025",
      location: "Online",
      status: "past",
      prize: "₹10,000",
      image: "https://cdn.builder.io/api/v1/image/assets%2F778be80571eb4edd92c70f9fecab8fab%2F8efd1aa0a2864beeb58f62fed4425fdd?format=webp&width=1200",
      teams: 120,
    }
  ]

  const stats = [
    { value: "1000+", label: "Players" },
    { value: "₹65,000", label: "Prize pool" },
    { value: "5", label: "Competitions" },
  ];

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section with Video Background */}
      <section className="font-orbitron relative z-10 font-bold -mt-24">
        {/* Background Video Container */}
        <div className="absolute start-0 top-0 -z-10 size-full">
          {/* ... video and mute button */}
<img
  src="https://res.cloudinary.com/dtbak3q8e/image/upload/v1767018186/WhatsApp_Image_2025-12-29_at_7.31.30_PM_laliwu.jpg"
  alt="Vanguard Arena"
  className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-700 ${
    videoLoaded ? "opacity-0" : "opacity-100"
  }`}
/>

<video
  ref={videoRef}
  className="absolute inset-0 w-full h-full object-cover z-0 "
  src="https://res.cloudinary.com/dtbak3q8e/video/upload/v1736246495/1031_2_1_1_wpgqk0.mp4"
  autoPlay
  loop
  muted
  playsInline
  preload="auto"
  onPlay={() => setVideoLoaded(true)}
  onLoadedData={() => {
    // 🔥 force play on mobile
    videoRef.current?.play().catch(() => {});
  }}
/>




          
          {/* Overlay gradient for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        {/* Main Content (Text and Stats) */}
        <div className="px-4 pt-[200px] pb-[100px] lg:px-8 lg:py-[126px] xl:py-[120px] 2xl:py-[204px]">
          <div className="mx-auto flex w-fit max-w-6xl flex-col items-center gap-5 md:gap-8">
            {/* Date Tag */}
            <div className="rounded-[9px] bg-gradient-to-r from-[#4E442D] to-yellow-700/50 px-2.5 py-1.5">
              <p className="text-sm leading-tight tracking-tight text-white uppercase md:text-base">
                Jan 14 - Jan 17 2026
              </p>
            </div>

            {/* Logo/Title Section */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-lg tracking-wider">
              Vanguard Arena
            </h1>

            {/* Statistic Cards Container */}
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="mb-2 flex w-fit flex-col items-center justify-center overflow-hidden rounded-[18px] bg-white/10 p-4 text-white backdrop-blur-2xl border border-white/20"
                >
                  {/* Statistic Value */}
                  <span className="font-orbitron font-[28px] md:text-[36px] lg:text-[64px] ">
                    {stat.value}
                  </span>
                  {/* Statistic Label */}
                  <span className="font-base text-[12px] md:text-[14px] text-white/90">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Tagline */}
            <div className="max-w-[802px] text-center">
              <p
  className="
    text-sm leading-tight uppercase font-semibold
    text-white md:text-[21px]

    bg-black/40 md:bg-transparent
    px-3 py-2 rounded-md
    drop-shadow-md

    max-w-[90%] mx-auto
  "
>

                Rise Above The Competition. Vanguard Arena Features the World's Best Gaming Talent
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-12">

        {/* Gaming Cards Section */}
        <section className="mb-16">
          <h2 className="font-orbitron text-2xl font-bold mb-6">Games</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((g) => (
              <Card key={g.id} className="glass-card electric-border overflow-hidden">
                <div className="relative h-40">
                  <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
                </div>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="font-orbitron">{g.name}</CardTitle>
                  <div className=" font-orbitron text-sm text-muted-foreground font-semibold">
                    Prize pool: <span className="font-orbitron text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] font-bold">
  ₹{g.prize.toLocaleString("en-IN")}
</span>


                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <a href={g.brochure} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full font-orbitron mb-2">
                        View Details
                      </Button>
                    </a>
<Button
  className="w-full font-orbitron"
  onClick={() =>
    new Date() < REGISTRATION_START
      ? showToast("Registrations open on 01 January 2026")
      : handleRegisterClick(g)
  }
>
  Register Team
</Button>





                    
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

      
        <section>
          <h2 className="font-orbitron text-3xl font-bold mb-8 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-accent" />
            Past Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents?.map((event) => (
              <Card key={event.id} className="glass-card border-secondary/20 hover:border-secondary/50 transition-all overflow-hidden group">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  <Badge className="absolute top-4 right-4 bg-secondary/90 font-orbitron">
                    Completed
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="font-orbitron text-xl">{event.title}</CardTitle>
                  <div className="text-sm text-muted-foreground space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      {event.location}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-secondary" />
                      <span className="text-sm">{event.teams} Teams</span>
                      
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-accent" />
                      <span className="text-sm font-semibold">{event.prize}</span>
                    </div>
                  </div>
                  {/* <div className="grid grid-cols-2 gap-2"> */}
                  <div>
                    <Link to={`/events/${event.id}`}>
                      <Button className="w-full font-orbitron">Details</Button>
                    </Link>
                    <a href="https://forms.gle/uEKn5cnCHTqT6zo26" target="_blank" rel="noreferrer">
                      {/* <Button variant="outline" className="w-full font-orbitron">Register</Button> */}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>


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

export default Events;
