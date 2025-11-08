import { supabase } from "@/lib/supabase.js";

const TABLE_NAME = "leaderboard_points";

const hasSupabaseConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = () => hasSupabaseConfig;

export async function fetchPointsSnapshot(eventId, gameId) {
  if (!hasSupabaseConfig || !eventId || !gameId) return null;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("payload, updated_at")
    .eq("event_id", eventId)
    .eq("game_id", gameId)
    .maybeSingle();

  if (error || !data?.payload) {
    return null;
  }

  return {
    ...(data.payload || {}),
    updatedAt: data.updated_at ?? undefined,
  };
}

export async function savePointsSnapshot(eventId, gameId, payload) {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase configuration missing");
  }

  const { error } = await supabase.from(TABLE_NAME).upsert(
    {
      event_id: eventId,
      game_id: gameId,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_id,game_id" }
  );

  if (error) {
    throw error;
  }
}
