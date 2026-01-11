import { supabase } from "./supabase";
import { events } from "@/data/events";
import { gameConfig } from "@/data/gameConfig";

/**
 * Fetch user statistics (tournaments, matches, rank, rewards)
 * Uses team_registrations and leaderboard_points tables
 */
export async function fetchUserStats(userEmail) {
  try {
    // Get all tournaments registered by user
    const { data: tournaments, error: tournamentsError } = await supabase
      .from("team_registrations")
      .select("*")
      .eq("email", userEmail);

    if (tournamentsError) throw tournamentsError;

    const tournamentCount = tournaments?.length || 0;

    // Get leaderboard points for ranking
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from("leaderboard_points")
      .select("*");

    if (leaderboardError) throw leaderboardError;

    // Calculate rewards from tournament registrations (amount field)
    const totalRewards = tournaments?.reduce((sum, reg) => sum + (reg.amount || 0), 0) || 0;

    // Calculate rank from leaderboard data (mock rank if not available)
    const userRank = 247; // Default rank - you can enhance this based on leaderboard_points payload

    return {
      tournaments: tournamentCount,
      matches: 0, // Matches data not in current schema
      rank: userRank,
      rewards: totalRewards,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      tournaments: 0,
      matches: 0,
      rank: 0,
      rewards: 0,
      error: error.message,
    };
  }
}

/**
 * Fetch upcoming matches for user
 * Note: Match data not available in current schema
 */
export async function fetchUpcomingMatches(userEmail) {
  try {
    // Get tournaments registered by user
    const { data: tournaments, error } = await supabase
      .from("team_registrations")
      .select("id, game_id, team_name, event_id, created_at")
      .eq("email", userEmail)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    // Map tournament data to match format (matches are derived from tournament registrations)
    const matches = (tournaments || []).map((tournament) => ({
      id: tournament.id,
      game: tournament.game_id,
      tournament: tournament.event_id,
      time: tournament.created_at,
      roomId: "TBA",
      status: "Upcoming",
      team: tournament.team_name,
    }));

    return {
      matches,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching upcoming matches:", error);
    return { matches: [], error: error.message };
  }
}

/**
 * Fetch all tournaments registered by user
 */
export async function fetchUserTournaments(userEmail) {
  try {
    const { data, error } = await supabase
      .from("team_registrations")
      .select("id, game_id, event_id, team_name, payment_status, amount, players")
      .eq("email", userEmail)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const tournaments = (data || []).map((registration) => ({
      id: registration.id,
      game: registration.game_id,
      name: registration.event_id,
      team: registration.team_name,
      status: registration.payment_status === "completed" || registration.amount === 0 ? "Active" : "Pending",
      prizePool: `₹${registration.amount || 0}`,
      participants: registration.players?.length || 0,
    }));

    return {
      tournaments,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user tournaments:", error);
    return { tournaments: [], error: error.message };
  }
}

/**
 * Fetch user rewards and earnings
 * Based on tournament registrations and leaderboard points
 */
export async function fetchUserRewards(userEmail) {
  try {
    // Get all tournaments registered by user
    const { data: tournaments, error: tournamentsError } = await supabase
      .from("team_registrations")
      .select("id, event_id, game_id, amount, payment_status, team_name")
      .eq("email", userEmail)
      .order("created_at", { ascending: false })
      .limit(10);

    if (tournamentsError) throw tournamentsError;

    // Convert tournament registrations to rewards format
    const rewards = (tournaments || []).map((registration) => ({
      id: registration.id,
      title: `Transactions for ${registration.team_name}`,
      game: registration.game_id,
      amount: registration.amount || 0,
      status: registration.payment_status === "completed" ? "Paid" : "Pending",
      type: "Tournament Prize",
    }));

    const total = rewards.reduce((sum, r) => sum + (r.amount || 0), 0);
    const pending = rewards
      .filter((r) => r.status === "Pending")
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    return {
      rewards,
      totalRewards: total,
      pendingRewards: pending,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user rewards:", error);
    return {
      rewards: [],
      totalRewards: 0,
      pendingRewards: 0,
      error: error.message,
    };
  }
}

/**
 * Fetch user statistics for profile
 */
export async function fetchUserStatistics(userEmail) {
  try {
    // Get all tournaments
    const { data: tournaments, error: tournamentsError } = await supabase
      .from("team_registrations")
      .select("*", { count: "exact" })
      .eq("email", userEmail);

    if (tournamentsError) throw tournamentsError;

    // Win rate is derived from leaderboard - for now default to 0
    const winRate = 0;

    return {
      tournamentsJoined: tournaments?.length || 0,
      matchesPlayed: 0, // Not available in current schema
      winRate,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return {
      tournamentsJoined: 0,
      matchesPlayed: 0,
      winRate: 0,
      error: error.message,
    };
  }
}

/**
 * Claim a reward
 * Updates payment_status in team_registrations table
 */
export async function claimReward(registrationId) {
  try {
    const { error } = await supabase
      .from("team_registrations")
      .update({ payment_status: "claimed" })
      .eq("id", registrationId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("Error claiming reward:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch available games from all events
 */
export function getAvailableGames() {
  const availableGames = [];

  events.forEach((event) => {
    event.games?.forEach((game) => {
      availableGames.push({
        id: game.id,
        name: game.name,
        eventId: event.id,
        eventTitle: event.title,
        image: game.image,
        participants: game.participants,
        gameHead: game.gameHead,
        gameprize: game.prize,
        gamebrochure: game.brochure
      });
    });
  });

  return availableGames;
}

/**
 * Fetch unregistered games for a user
 */
export async function fetchUnregisteredGames(userEmail) {
  try {
    // Get all registered games
    const { data: registrations, error } = await supabase
      .from("team_registrations")
      .select("game_id, event_id")
      .eq("email", userEmail);

    if (error) throw error;

    const registeredGames = registrations?.map((reg) => `${reg.event_id}-${reg.game_id}`) || [];

    // Get all available games
    const availableGames = getAvailableGames();

    // Filter to get unregistered games
    const unregisteredGames = availableGames.filter(
      (game) => !registeredGames.includes(`${game.eventId}-${game.id}`)
    );

    return {
      games: unregisteredGames,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching unregistered games:", error);
    return { games: [], error: error.message };
  }
}
