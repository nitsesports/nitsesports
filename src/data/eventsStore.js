import { events as defaultEvents } from "./events.js";

const STORAGE_KEY = "esports_events_v1";

const load = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const save = (data) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const listEvents = () => load() ?? defaultEvents;

export const getEventById = (id) => listEvents().find((e) => e.id === id);

export const updateGameRankings = (eventId, gameId, rankings) => {
  const current = listEvents().map((e) => ({ ...e, games: e.games.map((g) => ({ ...g, rankings: [...g.rankings] })) }));
  const targetEvent = current.find((e) => e.id === eventId);
  if (!targetEvent) return;
  const targetGame = targetEvent.games.find((g) => g.id === gameId);
  if (!targetGame) return;
  targetGame.rankings = rankings;
  save(current);
};

export const replaceAllEvents = (events) => {
  save(events);
};
