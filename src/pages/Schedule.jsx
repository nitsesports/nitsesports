import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { listEvents } from "@/data/eventsStore";

const Schedule = () => {
  const ongoing = listEvents().filter(
    (e) => e.status === "live" && e.id !== "ewc-2025",
  );

  const FreefireTournament = {
    id: "freefiretournament",
    title: "Freefire Tournament",
    date: "Feb 06 - Feb 07, 2026",
    startDate: "Feb 06, 2026",
    endDate: "Feb 07, 2026",
    location: "Online",
    participants: 80,
    prize: "₹4,000",
    image:
      "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372616/freefire_uutecs.jpg",
    status: "completed",
  };
  const vanguardArenaEvent = {
    id: "vanguard-arena",
    title: "Vanguard Arena",
    date: "Jan 15, 2026 - Jan 18, 2026",
    startDate: "Jan 15, 2026",
    endDate: "Jan 18, 2026",
    location: "Online",
    participants: 168,
    prize: "₹45,000",
    image:
      "https://res.cloudinary.com/dboqkwvhv/image/upload/v1768466009/tempImage4DyI6t_ekzmcw.jpg",
    status: "completed",
  };

  const lockEvent = {
    id: "lock-load",
    title: "Lock & Load",
    date: "Oct 12, 2025 - Oct 18, 2025",
    startDate: "Oct 12, 2025",
    endDate: "Oct 18, 2025",
    location: "Online",
    participants: 117,
    prize: "₹10,000",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F778be80571eb4edd92c70f9fecab8fab%2F8efd1aa0a2864beeb58f62fed4425fdd?format=webp&width=1200",
    status: "completed",
  };

  const displayEvents = [
    vanguardArenaEvent,
    lockEvent,
    FreefireTournament,
    ...ongoing.filter(
      (e) =>
        !["lock-load", "vanguard-arena", "freefiretournament"].includes(e.id),
    ),
  ];

  const liveEvents = displayEvents.filter((e) => e.status === "live");
  const completedEvents = displayEvents.filter((e) => e.status === "completed");
  const EventCard = ({ event, badge, badgeColor }) => (
    <Card className="glass-card border-primary/20 hover:border-primary/50 transition-all overflow-hidden group">
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <Badge className={`absolute top-4 right-4 ${badgeColor} font-orbitron`}>
          {badge}
        </Badge>
      </div>

      <CardHeader>
        <CardTitle className="font-orbitron text-xl">{event.title}</CardTitle>
        <CardDescription className="space-y-2 mt-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            {event.date}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            {event.location}
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-secondary" />
            <span className="text-sm">{event.participants} Teams</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold">{event.prize}</span>
          </div>
        </div>

        <Link to={`/events/${event.id}/schedule`}>
          <Button
            className="w-full font-orbitron my-2"
            disabled={badge === "Completed"}
          >
            {badge === "Completed" ? "Event Ended" : "Schedule"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-5xl font-bold mb-4 text-gradient">
            Schedule
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ongoing tournaments and fixtures
          </p>
        </div>

        {displayEvents.length === 0 ? (
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 text-center text-muted-foreground">
              No ongoing events right now.
            </CardContent>
          </Card>
        ) : (
          <>
            {liveEvents.length > 0 && (
              <section className="mb-16">
                <h2 className="font-orbitron text-3xl font-bold mb-8 flex items-center gap-2">
                  <Calendar className="h-8 w-8 text-green-500" />
                  Live Events
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      badge="Live"
                      badgeColor="bg-green-600 animate-pulse"
                    />
                  ))}
                </div>
              </section>
            )}

            {completedEvents.length > 0 && (
              <section className="mb-16">
                <h2 className="font-orbitron text-3xl font-bold mb-8 flex items-center gap-2">
                  <Calendar className="h-8 w-8 text-primary" />
                  Past Events
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      badge="Completed"
                      badgeColor="bg-primary/90"
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Schedule;
