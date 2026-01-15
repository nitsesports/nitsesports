// src/pages/EventSchedule.jsx

import { useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useParams } from "react-router-dom";
import { getEventById } from "@/data/eventsStore";
import { Button } from "@/components/ui/button";
import { parse, addDays, differenceInCalendarDays, format } from "date-fns";
import { FileText, ExternalLink } from "lucide-react";

const EventSchedule = () => {
  const { eventId } = useParams();
  const storeEvent = eventId ? getEventById(eventId) : undefined;

  /* ---------- FALLBACK EVENTS ---------- */
  const event =
    storeEvent ??
    (eventId === "lock-load"
      ? {
          id: "lock-load",
          title: "Lock & Load",
          startDate: "Oct 12, 2025",
          endDate: "Oct 18, 2025",
          location: "Online",
          status: "completed",
          games: [],
        }
      : eventId === "vanguard-arena"
      ? {
          id: "vanguard-arena",
          title: "Vanguard Arena",
          startDate: "Jan 15, 2026",
          endDate: "Jan 18, 2026",
          location: "Online",
          status: "live",
          games: [
            {
              id: "bgmi",
              name: "BGMI",
              schedule: [
                {
                  date: "Jan 15, 2026",
                  time: "6:00 PM",
                  matchups: [
                    "M1 — Group A — Erangel",
                    "M1 — Group B — Erangel",
                  ],
                },
                {
                  date: "Jan 15, 2026",
                  time: "6:40 PM",
                  matchups: [
                    "M2 — Group A — Erangel",
                    "M2 — Group B — Erangel",
                  ],
                },
                {
                  date: "Jan 15, 2026",
                  time: "7:20 PM",
                  matchups: [
                    "M3 — Group A — Miramar",
                    "M3 — Group B — Miramar",
                  ],
                },
              ],
            },
            {
              id: "fifa",
              name: "FIFA",
              schedule: [],
            },

            {
              id: "ml",
              name: "Mobile Legends",
              schedule: [
                {
                  date: "Jan 15, 2026",
                  time: "9:00 PM - 9:40 PM",
                  matchups: [
                    " A1 vs A2 ",
                    " A3 vs A4 ",
                    " B1 vs B2 ",
                    " B3 vs B4 ",
                  ],
                },
                {
                  date: "Jan 15, 2026",
                  time: "9:40 PM - 10:20 PM",
                  matchups: [
                    " A1 vs A3 ",
                    " A2 vs A4 ",
                    " B1 vs B3 ",
                    " B2 vs B4 ",
                  ],
                },
                {
                  date: "Jan 15, 2026",
                  time: "10:20 PM - 11:00 PM",
                  matchups: [
                    " A1 vs A4 ",
                    " A2 vs A3 ",
                    " B1 vs B4 ",
                    " B2 vs B3 ",
                  ],
                },
                {
                  date: "Jan 15, 2026",
                  time: "11:00 PM - 11:40 PM",
                  matchups: [
                    " C1 vs C2 ",
                    " C3 vs C4 ",
                    " D1 vs D2 ",
                    " D3 vs D4 ",
                  ],
                },
                {
                  date: "Jan 15, 2026",
                  time: "11:40 PM - 12:20 AM",
                  matchups: [
                    " C1 vs C3 ",
                    " C2 vs C4 ",
                    " D1 vs D3 ",
                    " D2 vs D4 ",
                  ],
                },
                {
                  date: "Jan 15, 2026",
                  time: "12:20 AM - 01:00 AM",
                  matchups: [
                    " C1 vs C4 ",
                    " C2 vs C3 ",
                    " D1 vs D4 ",
                    " D2 vs D3 ",
                  ],
                },
                {
                  date: "Jan 16, 2026",
                  time: "9:00 AM - 9:40 AM",
                  matchups: [
                    " E1 vs E2 ",
                    " E3 vs E4 ",
                    " F1 vs F2 ",
                    " F3 vs F4 ",
                  ],
                },
                {
                  date: "Jan 16, 2026",
                  time: "9:40 AM - 10:20 AM",
                  matchups: [
                    " E1 vs E3 ",
                    " E2 vs E4 ",
                    " F1 vs F3 ",
                    " F2 vs F4 ",
                  ],
                },
                {
                  date: "Jan 16, 2026",
                  time: "10:20 AM - 11:00 AM",
                  matchups: [
                    " E1 vs E4 ",
                    " E2 vs E3 ",
                    " F1 vs F4 ",
                    " F2 vs F3 ",
                  ],
                },
                {
                  date: "Jan 16, 2026",
                  time: "11:00 AM - 11:40 AM",
                  matchups: [
                    " G1 vs G2 ",
                    " G3 vs G4 ",
                    " H1 vs H2 ",
                    " H3 vs H4 ",
                  ],
                },
                {
                  date: "Jan 16, 2026",
                  time: "11:40 AM - 12:20 PM",
                  matchups: [
                    " G1 vs G3 ",
                    " G2 vs G4 ",
                    " H1 vs H3 ",
                    " H2 vs H4 ",
                  ],
                },
                {
                  date: "Jan 16, 2026",
                  time: "12:20 PM - 01:00 PM",
                  matchups: [
                    " G1 vs G4 ",
                    " G2 vs G3 ",
                    " H1 vs H4 ",
                    " H2 vs H3 ",
                  ],
                },
              ],
            },
            {
              id: "rc",
              name: "Real Cricket",
              schedule: [],
            },
            {
              id: "valorant",
              name: "Valorant",
              schedule: [],
            },
          ],
        }
      : undefined);

  if (!event) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6 text-center">
              Event not found.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ---------- EVENT ENDED VIEW ---------- */
  if (event.status === "completed") {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Card className="glass-card border-border/50">
            <CardContent className="p-12 text-center">
              <h1 className="font-orbitron text-4xl font-bold mb-3">
                Event Ended
              </h1>
              <p className="text-muted-foreground mb-6">
                This event has concluded. Thank you for participating!
              </p>
              <Link to="/schedule">
                <Button variant="outline">Back to Schedule</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ---------- GAME TABS ---------- */
  const [activeGameId, setActiveGameId] = useState(event.games[0]?.id);
  const activeGame = event.games.find((g) => g.id === activeGameId);

  /* ---------- BUILD DAY LIST ---------- */
  const days = [];
  const start = parse(event.startDate, "MMM d, yyyy", new Date());
  const end = parse(event.endDate, "MMM d, yyyy", new Date());
  const diff = differenceInCalendarDays(end, start);
  for (let i = 0; i <= diff; i++) days.push(addDays(start, i));

  /* ---------- GROUP SCHEDULE BY DAY ---------- */
  const scheduleByDay = {};

  if (activeGame?.schedule) {
    activeGame.schedule.forEach((slot, idx) => {
      const dayStr = format(
        parse(slot.date, "MMM d, yyyy", new Date()),
        "MMM d, yyyy"
      );

      if (!scheduleByDay[dayStr]) scheduleByDay[dayStr] = [];
      scheduleByDay[dayStr].push({
        key: `${activeGame.id}-${idx}`,
        time: slot.time,
        matchups: Array.isArray(slot.matchups)
          ? slot.matchups.join(", ")
          : slot.matchups,
      });
    });
  }

  const gameDocuments = {
    bgmi: {
      title: "BGMI",
      docs: [
        {
          label: "Group Division",
          link: "https://drive.google.com/file/d/1m8imgZHWoOW8a3UDjoygJuehLS-e9-El/view?usp=sharing",
        },
        {
          label: "Tournament Flow",
          link: "https://drive.google.com/file/d/1rTxcW-ituhT_s-BrJtjUS_nXTbVNPWpB/view?usp=sharing",
        },
        {
          label: "Points System",
          link: "https://drive.google.com/file/d/169xIa1KtEtCnYqTwWVPgyXZ3sKedefaw/view?usp=sharing",
        },
        {
          label: "Rules & Regulations",
          link: "https://drive.google.com/file/d/1-DdAlBKkbcy74iPi3IVXKmVLN0H3iH8B/view?usp=sharing",
        },
      ],
    },
    ml: {
      title: "MLBB",
      docs: [
        {
          label: "Group Division",
          link: "https://drive.google.com/file/d/14e34Lwe8pRZVjcNcNdowoZ6P1EKRqG_w/view?usp=sharing",
        },
        {
          label: "Tournament Flow",
          link: "https://drive.google.com/file/d/1z8kjTI5HI3hEw92qBm326H2BzsfNtRxq/view?usp=sharing",
        },
        {
          label: "Rules & Regulations",
          link: "https://drive.google.com/file/d/1rT3MuZu69hacYyHz-_6Sk7xJUO7rqjZA/view?usp=sharing",
        },
      ],
    },
  };

  /* ---------- LIVE EVENT UI ---------- */
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="font-orbitron text-4xl font-bold">
              {event.title} Schedule
            </h1>
            <p className="flex items-center gap-4 text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {event.startDate} – {event.endDate}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
            </p>
          </div>

          <Link to="/schedule">
            <Button variant="outline">Back</Button>
          </Link>
        </div>

        {/* GAME TABS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {event.games.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveGameId(game.id)}
              className={`px-4 py-2 mx-1 rounded-md font-orbitron text-sm transition ${
                activeGameId === game.id
                  ? "bg-primary text-white"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>
        {gameDocuments[activeGameId] && (
          <Card className="mb-4 border border-primary/30 bg-primary/5">
            <CardContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {gameDocuments[activeGameId].docs.map((doc) => (
                  <a
                    key={doc.label}
                    href={doc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-border rounded-lg p-2 
           hover:bg-muted hover:border-primary transition"
                  >
                    <p className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {doc.label}
                    </p>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* DAY-WISE SCHEDULE */}
        {days.map((day) => {
          const dayStr = format(day, "MMM d, yyyy");
          const slots = scheduleByDay[dayStr] || [];

          return (
            <Card key={dayStr} className="mb-6">
              <CardHeader>
                <CardTitle className="font-orbitron">{dayStr}</CardTitle>
              </CardHeader>
              <CardContent>
                {slots.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Matchups</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {slots.map((s) => (
                        <TableRow key={s.key}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {s.time}
                            </div>
                          </TableCell>
                          <TableCell>{s.matchups}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center text-muted-foreground py-6">
                    Match schedule will be announced soon.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EventSchedule;
