import { supabase } from "@/lib/supabase.js";

const TABLE_NAME = "leaderboard_points";

const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const isSupabaseConfigured = () => hasSupabaseConfig;

export async function fetchPointsSnapshot(eventId, gameId, leaderboardKey = "default") {
  if (!hasSupabaseConfig || !eventId || !gameId) return null;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("payload, updated_at")
    .eq("event_id", eventId)
    .eq("game_id", gameId)
    .eq("leaderboard_key", leaderboardKey) // ✅ important
    .maybeSingle();

  if (error) {
    console.error("fetchPointsSnapshot error:", error);
    return null;
  }

  if (!data?.payload) return null;

  return {
    ...(data.payload || {}),
    updatedAt: data.updated_at ?? undefined,
  };
}

export async function savePointsSnapshot(eventId, gameId, payload, leaderboardKey = "default") {
  if (!hasSupabaseConfig) throw new Error("Supabase configuration missing");
  if (!eventId || !gameId) throw new Error("Missing eventId/gameId");

  const { error } = await supabase.from(TABLE_NAME).upsert(
    {
      event_id: eventId,
      game_id: gameId,
      leaderboard_key: leaderboardKey, // ✅ important
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_id,game_id,leaderboard_key" } // ✅ important
  );

  if (error) {
    console.error("savePointsSnapshot error:", error);
    throw error;
  }
}
