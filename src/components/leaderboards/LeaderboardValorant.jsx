// src/components/leaderboards/LeaderboardValorant.jsx

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import {
  fetchPointsSnapshot,
  savePointsSnapshot,
  isSupabaseConfigured,
} from "@/data/leaderboardPoints";

import BracketView from "@/components/bracket/BracketView";

/** --------------------------------
 * TEAM HELPERS
 * --------------------------------- */
const createDefaultTeams = () =>
  Array.from({ length: 8 }, (_, i) => ({
    id: i,
    name: `Team ${i + 1}`,
  }));

/** --------------------------------
 * BRACKET HELPERS
 * --------------------------------- */
const buildBracketFromTeams = (teams) => {
  const getTeam = (idx) => teams?.[idx]?.name ?? `Team ${idx + 1}`;

  const quarterfinals = [
    { teamA: getTeam(0), teamB: getTeam(7), scoreA: 0, scoreB: 0, status: "upcoming" },
    { teamA: getTeam(1), teamB: getTeam(6), scoreA: 0, scoreB: 0, status: "upcoming" },
    { teamA: getTeam(2), teamB: getTeam(5), scoreA: 0, scoreB: 0, status: "upcoming" },
    { teamA: getTeam(3), teamB: getTeam(4), scoreA: 0, scoreB: 0, status: "upcoming" },
  ];

  const upperSemis = [
    { teamA: "Winner UB1", teamB: "Winner UB2", scoreA: 0, scoreB: 0, status: "upcoming" },
    { teamA: "Winner UB3", teamB: "Winner UB4", scoreA: 0, scoreB: 0, status: "upcoming" },
  ];

  const upperFinal = [
    { teamA: "Winner UB5", teamB: "Winner UB6", scoreA: 0, scoreB: 0, status: "upcoming" },
  ];

  const lowerRound1 = [
    { teamA: "Loser UB1", teamB: "Loser UB2", scoreA: 0, scoreB: 0, status: "upcoming" },
    { teamA: "Loser UB3", teamB: "Loser UB4", scoreA: 0, scoreB: 0, status: "upcoming" },
  ];

  const lowerQFs = [
    { teamA: "Winner LB1", teamB: "Loser UB6", scoreA: 0, scoreB: 0, status: "upcoming" },
    { teamA: "Winner LB2", teamB: "Loser UB5", scoreA: 0, scoreB: 0, status: "upcoming" },
  ];

  const lowerSemi = [
    { teamA: "Winner LB3", teamB: "Winner LB4", scoreA: 0, scoreB: 0, status: "upcoming" },
  ];

  const lowerFinal = [
    { teamA: "Loser UB7", teamB: "Winner LB5", scoreA: 0, scoreB: 0, status: "upcoming" },
  ];

  const grandFinal = [
    { teamA: "Winner UB7", teamB: "Winner LB6", scoreA: 0, scoreB: 0, status: "upcoming" },
  ];

  return {
    columns: [
      { title: "Upper • Quarterfinals", matches: quarterfinals },
      { title: "Upper • Semifinals", matches: upperSemis },
      { title: "Upper • Final", matches: upperFinal },
      { title: "Lower • Round 1 (Elimination)", matches: lowerRound1 },
      { title: "Lower • Quarterfinals", matches: lowerQFs },
      { title: "Lower • Semifinal", matches: lowerSemi },
      { title: "Lower • Final", matches: lowerFinal },
      { title: "Grand Final", matches: grandFinal },
    ],
  };
};

/**
 * ✅ Replace ONLY team names in Quarterfinals
 * Winner/Loser placeholders remain intact.
 */
const applyTeamNamesToBracket = (bracket, teams) => {
    if (!bracket?.columns?.length) return bracket;
  
    const teamNames = Array.from(
      { length: 8 },
      (_, i) => teams?.[i]?.name ?? `Team ${i + 1}`
    );
  
    const updated = {
      ...bracket,
      columns: bracket.columns.map((col) => ({
        ...col,
        matches: col.matches.map((m) => ({ ...m })),
      })),
    };
  
    // Quarterfinal mapping
    const qfMap = [
      [0, 0, "teamA", 0],
      [0, 0, "teamB", 7],
      [0, 1, "teamA", 1],
      [0, 1, "teamB", 6],
      [0, 2, "teamA", 2],
      [0, 2, "teamB", 5],
      [0, 3, "teamA", 3],
      [0, 3, "teamB", 4],
    ];
  
    for (const [colIdx, matchIdx, side, teamIdx] of qfMap) {
      if (!updated.columns[colIdx]?.matches?.[matchIdx]) continue;
      updated.columns[colIdx].matches[matchIdx][side] = teamNames[teamIdx];
    }
  
    return updated;
  };
  

/** --------------------------------
 * MAIN COMPONENT
 * --------------------------------- */
const LeaderboardValorant = ({ eventId, game, canEdit }) => {
  const leaderboardKey = "valorant-double-elim";

  const [teams, setTeams] = useState(() => createDefaultTeams());
  const [bracket, setBracket] = useState(() => buildBracketFromTeams(createDefaultTeams()));

  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [savingPoints, setSavingPoints] = useState(false);

  /** --------------------------------
   * PROPAGATION (same as ML)
   * --------------------------------- */
  const propagateMatches = useCallback((br, col, mIdx) => {
    const updated = {
      ...br,
      columns: br.columns.map((c) => ({
        ...c,
        matches: c.matches.map((m) => ({ ...m })),
      })),
    };

    const match = updated.columns[col]?.matches?.[mIdx];
    if (!match) return updated;
    if (match.scoreA === match.scoreB) return updated;

    const winner = match.scoreA > match.scoreB ? match.teamA : match.teamB;
    const loser = match.scoreA > match.scoreB ? match.teamB : match.teamA;

    if (col === 0) {
      const ufMap = [
        [1, 0, "teamA"],
        [1, 0, "teamB"],
        [1, 1, "teamA"],
        [1, 1, "teamB"],
      ];
      const lbMap = [
        [3, 0, "teamA"],
        [3, 0, "teamB"],
        [3, 1, "teamA"],
        [3, 1, "teamB"],
      ];

      const [ufCol, ufMatch, ufSide] = ufMap[mIdx];
      const [lbCol, lbMatch, lbSide] = lbMap[mIdx];

      updated.columns[ufCol].matches[ufMatch][ufSide] = winner;
      updated.columns[lbCol].matches[lbMatch][lbSide] = loser;
    }

    if (col === 1) {
      updated.columns[2].matches[0][mIdx === 0 ? "teamA" : "teamB"] = winner;
      if (mIdx === 0) updated.columns[4].matches[1].teamB = loser;
      else updated.columns[4].matches[0].teamB = loser;
    }

    if (col === 2) {
      updated.columns[7].matches[0].teamA = winner;
      updated.columns[6].matches[0].teamA = loser;
    }

    if (col === 3) {
      const target = mIdx === 0 ? 0 : 1;
      updated.columns[4].matches[target].teamA = winner;
    }

    if (col === 4) {
      updated.columns[5].matches[0][mIdx === 0 ? "teamA" : "teamB"] = winner;
    }

    if (col === 5) {
      updated.columns[6].matches[0].teamB = winner;
    }

    if (col === 6) {
      updated.columns[7].matches[0].teamB = winner;
    }

    if (col === 7) {
      updated.winner = winner;
    }

    return updated;
  }, []);

  const handleScoreChange = (col, mIdx, newA, newB) => {
    setBracket((prev) => {
      if (!prev) return prev;

      const next = {
        ...prev,
        columns: prev.columns.map((c) => ({
          ...c,
          matches: c.matches.map((m) => ({ ...m })),
        })),
      };

      next.columns[col].matches[mIdx].scoreA = newA;
      next.columns[col].matches[mIdx].scoreB = newB;
      if (newA !== newB) next.columns[col].matches[mIdx].status = "completed";

      return propagateMatches(next, col, mIdx);
    });

    setIsDirty(true);
  };

  /** --------------------------------
   * SAVE TO SUPABASE
   * --------------------------------- */
  const saveData = async () => {
    try {
      setSavingPoints(true);

      const payload = {
        teams,
        bracket,
      };

      await savePointsSnapshot(eventId, game.id, payload, leaderboardKey);

      setLastSavedAt(new Date().toISOString());
      setIsDirty(false);
      toast.success("Saved successfully ✅");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save ❌");
    } finally {
      setSavingPoints(false);
    }
  };

  /** --------------------------------
   * TEAMS EDITING
   * --------------------------------- */
  const updateTeamName = (idx, name) => {
    setTeams((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], name };
      return next;
    });

    // ✅ Update QF names live
    setBracket((prev) => {
      const nextTeams = teams.map((t, i) => (i === idx ? { ...t, name } : t));
      return applyTeamNamesToBracket(prev, nextTeams);
    });

    setIsDirty(true);
  };

  /** --------------------------------
   * LOAD FROM SUPABASE
   * --------------------------------- */
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const t = createDefaultTeams();
      setTeams(t);
      setBracket(buildBracketFromTeams(t));
      setLastSavedAt(null);
      setIsDirty(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoadingPoints(true);

      try {
        const snapshot = await fetchPointsSnapshot(eventId, game.id, leaderboardKey);
        if (cancelled) return;

        const savedTeams = snapshot?.teams?.length ? snapshot.teams : createDefaultTeams();
        const savedBracket =
          snapshot?.bracket?.columns?.length
            ? snapshot.bracket
            : buildBracketFromTeams(savedTeams);

        const fixedBracket = applyTeamNamesToBracket(savedBracket, savedTeams);

        setTeams(savedTeams);
        setBracket(fixedBracket);

        setLastSavedAt(snapshot?.updatedAt ?? null);
        setIsDirty(false);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load Valorant leaderboard ❌");
      } finally {
        if (!cancelled) setLoadingPoints(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId, game.id]);

  /** --------------------------------
   * UI
   * --------------------------------- */
  return (
    <div>
      {/* ✅ Teams first */}
      <Tabs defaultValue="teams">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start sm:w-auto">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="double-elim">Double Elimination</TabsTrigger>
          </TabsList>
        </div>

        {/* ================= Teams Editable Tab ================= */}
        <TabsContent value="teams">
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-orbitron text-2xl tracking-tight">
                Valorant — Teams (8 Slots)
              </h3>

              {canEdit && (
                <div className="flex items-center gap-3 text-sm">
                  {isSupabaseConfigured() ? (
                    <>
                      <div className="text-muted-foreground">
                        {lastSavedAt
                          ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago`
                          : "Never saved"}
                        {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                      </div>

                      <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveData}>
                        {savingPoints ? "Saving..." : "Save"}
                      </Button>
                    </>
                  ) : (
                    <div className="text-red-500">Supabase not configured</div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border/40 bg-gradient-to-b from-background/60 to-background/30 p-4 space-y-3">
              {teams.map((t, idx) => (
                <div
                  key={t.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-sm text-muted-foreground">Slot #{idx + 1}</div>

                  <Input
                    value={t.name}
                    disabled={!canEdit}
                    onChange={(e) => updateTeamName(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="text-xs text-muted-foreground">
              ✅ Team names will automatically carry forward into the bracket.
            </div>

            {loadingPoints && (
              <div className="text-sm text-muted-foreground">Loading saved data...</div>
            )}
          </div>
        </TabsContent>

        {/* ================= Double Elim Bracket ================= */}
        <TabsContent value="double-elim">
          <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-orbitron text-2xl tracking-tight">
                Valorant — Double Elimination (8 Teams)
              </h3>

              {canEdit && (
                <div className="flex items-center gap-3 text-sm">
                  {isSupabaseConfigured() ? (
                    <>
                      <div className="text-muted-foreground">
                        {lastSavedAt
                          ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago`
                          : "Never saved"}
                        {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const t = createDefaultTeams();
                          setTeams(t);
                          setBracket(buildBracketFromTeams(t));
                          setIsDirty(true);
                          toast.success("Reset done ✅");
                        }}
                      >
                        Reset
                      </Button>

                      <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveData}>
                        {savingPoints ? "Saving..." : "Save"}
                      </Button>
                    </>
                  ) : (
                    <div className="text-red-500">Supabase not configured</div>
                  )}
                </div>
              )}
            </div>

            <Tabs defaultValue="bracket">
              <TabsList className="w-full justify-start sm:w-auto">
                <TabsTrigger value="bracket">Bracket</TabsTrigger>
                <TabsTrigger value="grand">Grand Final</TabsTrigger>
              </TabsList>

              <TabsContent value="bracket" className="mt-4">
                <div className="rounded-lg border border-border/40 bg-gradient-to-b from-background/60 to-background/30 p-4">
                  <h4 className="text-sm uppercase text-muted-foreground mb-3">
                    Upper Bracket
                  </h4>

                  <BracketView
                    bracket={{
                      columns: (bracket ?? buildBracketFromTeams(teams)).columns.slice(0, 3),
                    }}
                    onScoreChange={canEdit ? handleScoreChange : undefined}
                  />
                </div>

                <div className="rounded-lg border border-border/40 bg-gradient-to-b from-background/60 to-background/30 p-4">
                  <h4 className="text-sm uppercase text-muted-foreground mb-3">
                    Lower Bracket (Losers)
                  </h4>

                  <BracketView
                    bracket={{
                      columns: (bracket ?? buildBracketFromTeams(teams)).columns.slice(3, 7),
                    }}
                    onScoreChange={canEdit ? handleScoreChange : undefined}
                    colOffset={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="grand" className="mt-4">
                <div className="rounded-lg border border-border/40 bg-gradient-to-b from-background/60 to-background/30 p-6 text-center">
                  <h4 className="text-sm uppercase text-muted-foreground mb-3">
                    Grand Final
                  </h4>

                  <div className="max-w-xl mx-auto">
                    <BracketView
                      bracket={{
                        columns: [(bracket ?? buildBracketFromTeams(teams)).columns[7]],
                      }}
                      onScoreChange={canEdit ? handleScoreChange : undefined}
                      colOffset={7}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardValorant;