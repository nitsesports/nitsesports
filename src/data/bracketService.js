import { supabase } from "@/lib/supabase.js";

const TABLE_NAME = "bracket_data";

const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const isSupabaseConfigured = () => hasSupabaseConfig;

/**
 * Fetch bracket data for an event/game
 */
export async function fetchBracketData(eventId, gameId) {
  if (!hasSupabaseConfig || !eventId || !gameId) return null;

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("teams, bracket, final_stage, updated_at")
      .eq("event_id", eventId)
      .eq("game_id", gameId)
      .maybeSingle();

    if (error) {
      console.error("fetchBracketData error:", error);
      return null;
    }

    if (!data) return null;

    return {
      teams: data.teams || [],
      bracket: data.bracket || null,
      finalStage: data.final_stage || null,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.error("Error fetching bracket data:", err);
    return null;
  }
}

/**
 * Save bracket data to Supabase
 */
export async function saveBracketData(eventId, gameId, { teams, bracket, finalStage }) {
  if (!hasSupabaseConfig) throw new Error("Supabase configuration missing");
  if (!eventId || !gameId) throw new Error("Missing eventId/gameId");

  try {
    const { error } = await supabase.from(TABLE_NAME).upsert(
      {
        event_id: eventId,
        game_id: gameId,
        teams: teams || [],
        bracket: bracket || null,
        final_stage: finalStage || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_id,game_id" }
    );

    if (error) {
      console.error("saveBracketData error:", error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error("Error saving bracket data:", err);
    throw err;
  }
}
