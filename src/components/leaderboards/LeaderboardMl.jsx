// src/components/leaderboards/LeaderboardMl.jsx

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
 * GROUP CONFIG
 * --------------------------------- */

// ✅ Lock&Load etc: 4 groups
const GROUP_LETTERS_4 = ["A", "B", "C", "D"];

// ✅ Vanguard Arena: 8 groups
const GROUP_LETTERS_8 = ["A", "B", "C", "D", "E", "F", "G", "H"];

/**
 * ✅ Create groups with fixed number of rows (pre-filled)
 * Prevents blank table when no data exists in Supabase.
 */
const createGroupsWithRows = (letters, rowsPerGroup) => {
  return letters.reduce((acc, letter) => {
    acc[letter] = Array.from({ length: rowsPerGroup }, (_, i) => ({
      rank: i + 1,
      team: `Team ${letter}${i + 1}`,
      points: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      originalIndex: i,
    }));
    return acc;
  }, {});
};

/**
 * ✅ Clone helper (keeps originalIndex stable)
 */
const cloneGroupRows = (letters, source) => {
  return letters.reduce((acc, letter) => {
    const rows = source?.[letter] ?? [];
    acc[letter] = rows.map((row, index) => ({
      ...row,
      originalIndex: row.originalIndex ?? index,
    }));
    return acc;
  }, {});
};

const deriveGroupRowStats = (row) => {
  const points = Number(row.points ?? 0) || 0;
  const gamesPlayed = row.gamesPlayed ?? Math.max(0, Math.floor(points / 50));
  const gamesWon = row.gamesWon ?? Math.max(0, Math.floor(gamesPlayed * 0.6));
  return { gamesPlayed, gamesWon };
};

/**
 * ✅ Sort group rows by gamesWon -> points -> name
 */
const getGroupRowsForGame = (group, groupsState) => {
  const baseRows = (groupsState?.[group] ?? []).map((row, index) => ({
    ...row,
    originalIndex: row.originalIndex ?? index,
  }));

  const rowsWithStats = baseRows.map((row) => {
    const stats = deriveGroupRowStats(row);
    return { ...row, ...stats };
  });

  rowsWithStats.sort((a, b) => {
    const aw = Number(a.gamesWon ?? 0) || 0;
    const bw = Number(b.gamesWon ?? 0) || 0;
    if (bw !== aw) return bw - aw;

    const ap = Number(a.points ?? 0) || 0;
    const bp = Number(b.points ?? 0) || 0;
    if (bp !== ap) return bp - ap;

    return String(a.team ?? "").localeCompare(String(b.team ?? ""));
  });

  return rowsWithStats.map((row, index) => ({ ...row, rank: index + 1 }));
};

/** --------------------------------
 * MAIN COMPONENT
 * --------------------------------- */

const LeaderboardMl = ({ eventId, game, canEdit }) => {
  // ✅ Vanguard Arena => 8 groups of 4 teams
  const isVanguardArena = eventId === "vanguardarena";
  const GROUP_LETTERS = isVanguardArena ? GROUP_LETTERS_8 : GROUP_LETTERS_4;

  // ✅ Vanguard => 4 teams per group
  // ⚠️ If you want Lock&Load to also show default teams, set a number like 5 or 8
  const rowsPerGroup = 4;

  // ✅ Prevent "previous event data hindering"
  const leaderboardKey = isVanguardArena ? "ml-vanguard-8groups" : "default";


  const [mlGroupData, setMlGroupData] = useState(() =>
    createGroupsWithRows(GROUP_LETTERS, rowsPerGroup)
  );

  const [mlBracket, setMlBracket] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [savingPoints, setSavingPoints] = useState(false);

  /** --------------------------------
   * BRACKET BUILDER
   * --------------------------------- */
  const buildMlBracketFromGroups = useCallback(() => {
    const sortGroup = (letter) => {
      const rows = (mlGroupData?.[letter] ?? []).map((r, i) => ({
        ...r,
        originalIndex: r.originalIndex ?? i,
      }));

      const withStats = rows.map((r) => {
        const pts = Number(r.points ?? 0) || 0;
        const stats = deriveGroupRowStats(r);
        return { ...r, points: pts, ...stats };
      });

      withStats.sort((a, b) => {
        const aw = Number(a.gamesWon ?? 0) || 0;
        const bw = Number(b.gamesWon ?? 0) || 0;
        if (bw !== aw) return bw - aw;

        const ap = Number(a.points ?? 0) || 0;
        const bp = Number(b.points ?? 0) || 0;
        if (bp !== ap) return bp - ap;

        return String(a.team ?? "").localeCompare(String(b.team ?? ""));
      });

      return withStats;
    };

    let bracketTeams = [];

    if (isVanguardArena) {
      // ✅ Vanguard Arena: 8 groups => top 1 per group => 8 teams
      bracketTeams = GROUP_LETTERS.map((g) => sortGroup(g)[0]?.team ?? "—");
    } else {
      // ✅ Old logic: top 2 per group from A-D => 8 teams
      const A = sortGroup("A").slice(0, 2).map((r) => r.team ?? "—");
      const B = sortGroup("B").slice(0, 2).map((r) => r.team ?? "—");
      const C = sortGroup("C").slice(0, 2).map((r) => r.team ?? "—");
      const D = sortGroup("D").slice(0, 2).map((r) => r.team ?? "—");

      bracketTeams = [A[0], B[0], C[0], D[0], A[1], B[1], C[1], D[1]].map(
        (x) => x ?? "—"
      );
    }

    const quarterfinals = [
      { teamA: bracketTeams[0] ?? "—", teamB: bracketTeams[7] ?? "—", scoreA: 0, scoreB: 0, status: "upcoming" },
      { teamA: bracketTeams[1] ?? "—", teamB: bracketTeams[6] ?? "—", scoreA: 0, scoreB: 0, status: "upcoming" },
      { teamA: bracketTeams[2] ?? "—", teamB: bracketTeams[5] ?? "—", scoreA: 0, scoreB: 0, status: "upcoming" },
      { teamA: bracketTeams[3] ?? "—", teamB: bracketTeams[4] ?? "—", scoreA: 0, scoreB: 0, status: "upcoming" },
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
  }, [mlGroupData, isVanguardArena, GROUP_LETTERS]);

  /** ✅ initialize bracket each time event/game changes */
  useEffect(() => {
    setMlBracket(buildMlBracketFromGroups());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, game.id]);

  /** --------------------------------
   * BRACKET SCORE PROPAGATION
   * --------------------------------- */
  const propagateMatches = (br, col, mIdx) => {
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
  };

  const handleMlScoreChange = (col, mIdx, newA, newB) => {
    setMlBracket((prev) => {
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
   * GROUP EDITING
   * --------------------------------- */
  const updateMlTeamName = (group, origIdx, name) => {
    setMlGroupData((prev) => {
      const next = { ...prev };
      const rows = next[group] ? [...next[group]] : [];

      const existing =
        rows[origIdx] ?? {
          rank: origIdx + 1,
          team: `Team ${group}${origIdx + 1}`,
          points: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          originalIndex: origIdx,
        };

      rows[origIdx] = { ...existing, team: name };
      next[group] = rows;

      return next;
    });

    setIsDirty(true);
  };

  const updateMlPoints = (group, origIdx, value) => {
    const points = Number(value) || 0;

    setMlGroupData((prev) => {
      const next = { ...prev };
      const rows = next[group] ? [...next[group]] : [];

      const existing =
        rows[origIdx] ?? {
          rank: origIdx + 1,
          team: `Team ${group}${origIdx + 1}`,
          points: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          originalIndex: origIdx,
        };

      rows[origIdx] = { ...existing, points };
      next[group] = rows;

      return next;
    });

    setIsDirty(true);
  };

  const updateMlStat = (group, origIdx, key, value) => {
    const numericValue = Number(value);

    setMlGroupData((prev) => {
      const next = { ...prev };
      const rows = next[group] ? [...next[group]] : [];

      const existing =
        rows[origIdx] ?? {
          rank: origIdx + 1,
          team: `Team ${group}${origIdx + 1}`,
          points: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          originalIndex: origIdx,
        };

      rows[origIdx] = {
        ...existing,
        [key]: Number.isFinite(numericValue) ? numericValue : 0,
      };

      next[group] = rows;
      return next;
    });

    setIsDirty(true);
  };

  /** --------------------------------
   * LOAD SNAPSHOT (Supabase)
   * --------------------------------- */
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setMlGroupData(createGroupsWithRows(GROUP_LETTERS, rowsPerGroup));
      setLastSavedAt(null);
      setIsDirty(false);
      return;
    }

    let cancelled = false;

    const loadMobileLegends = async () => {
      setLoadingPoints(true);

      try {
        // ✅ FIX: use leaderboardKey to prevent data mixing
        const snapshot = await fetchPointsSnapshot(eventId, game.id, leaderboardKey);
        if (cancelled) return;

        if (snapshot?.groups) {
          // ✅ start from default structure (pre-filled)
          const base = createGroupsWithRows(GROUP_LETTERS, rowsPerGroup);

          for (const letter of GROUP_LETTERS) {
            const savedRows = snapshot.groups?.[letter];

            if (savedRows && savedRows.length > 0) {
              base[letter] = savedRows.map((row, index) => ({
                rank: typeof row.rank === "number" ? row.rank : index + 1,
                team:
                  row.team ??
                  base[letter][index]?.team ??
                  `Team ${letter}${index + 1}`,
                points: typeof row.points === "number" ? row.points : Number(row.points) || 0,
                gamesPlayed: typeof row.gamesPlayed === "number" ? row.gamesPlayed : 0,
                gamesWon: typeof row.gamesWon === "number" ? row.gamesWon : 0,
                originalIndex: row.originalIndex ?? index,
              }));

              // ✅ If saved rows are less than rowsPerGroup, fill remaining
              if (base[letter].length < rowsPerGroup) {
                const missing = rowsPerGroup - base[letter].length;
                const startIndex = base[letter].length;

                base[letter].push(
                  ...Array.from({ length: missing }, (_, k) => ({
                    rank: startIndex + k + 1,
                    team: `Team ${letter}${startIndex + k + 1}`,
                    points: 0,
                    gamesPlayed: 0,
                    gamesWon: 0,
                    originalIndex: startIndex + k,
                  }))
                );
              }
            }
          }

          setMlGroupData(cloneGroupRows(GROUP_LETTERS, base));

          try {
            const snapAny = snapshot;
            if (snapAny?.bracket?.columns) {
              setMlBracket(snapAny.bracket);
            } else {
              setMlBracket(buildMlBracketFromGroups());
            }
          } catch {
            setMlBracket(buildMlBracketFromGroups());
          }

          setLastSavedAt(snapshot.updatedAt ?? null);
          setIsDirty(false);
        } else {
          // ✅ no snapshot
          setMlGroupData(createGroupsWithRows(GROUP_LETTERS, rowsPerGroup));
          setMlBracket(buildMlBracketFromGroups());
          setLastSavedAt(snapshot?.updatedAt ?? null);
          setIsDirty(false);
        }
      } catch (error) {
        toast.error("Failed to load saved leaderboard");
        console.error(error);
      } finally {
        if (!cancelled) setLoadingPoints(false);
      }
    };

    loadMobileLegends();
    return () => {
      cancelled = true;
    };
  }, [eventId, game.id, buildMlBracketFromGroups, GROUP_LETTERS, rowsPerGroup, leaderboardKey]);

  /** --------------------------------
   * SAVE SNAPSHOT
   * --------------------------------- */
  const saveMlPoints = async () => {
    try {
      setSavingPoints(true);

      const payload = {
        groups: mlGroupData,
        bracket: mlBracket ?? buildMlBracketFromGroups(),
      };

      // ✅ FIX: use leaderboardKey to prevent data mixing
      await savePointsSnapshot(eventId, game.id, payload, leaderboardKey);

      setLastSavedAt(new Date().toISOString());
      setIsDirty(false);
      toast.success("Points saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save points");
    } finally {
      setSavingPoints(false);
    }
  };

  /** --------------------------------
   * UI
   * --------------------------------- */
  return (
    <div>
      <Tabs defaultValue={"knockout"}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start sm:w-auto">
            <TabsTrigger value="knockout">Knockout Stage</TabsTrigger>
            <TabsTrigger value="pointrush">Double Elimination</TabsTrigger>
          </TabsList>
        </div>

        {/* ================= GROUPS ================= */}
        <TabsContent value="knockout">
          <div>
            <Tabs defaultValue={`group-${GROUP_LETTERS[0].toLowerCase()}`}>
              <div className="overflow-x-auto pb-2">
                <TabsList className="w-full justify-start sm:w-auto">
                  {GROUP_LETTERS.map((letter) => (
                    <TabsTrigger key={letter} value={`group-${letter.toLowerCase()}`}>
                      Group {letter}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {GROUP_LETTERS.map((letter) => (
                <TabsContent key={`group-${letter}`} value={`group-${letter.toLowerCase()}`}>
                  <Card className="glass-card border-primary/20">
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="font-orbitron text-2xl">
                          {game.name} — Group {letter}
                        </CardTitle>

                        {canEdit && (
                          <div className="flex items-center gap-3 text-sm">
                            {isSupabaseConfigured() ? (
                              <>
                                <div className="text-muted-foreground">
                                  {lastSavedAt
                                    ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago`
                                    : "Never saved"}
                                  {isDirty && (
                                    <span className="ml-2 text-yellow-500">(unsaved)</span>
                                  )}
                                </div>

                                <Button
                                  size="sm"
                                  disabled={!isDirty || savingPoints}
                                  onClick={saveMlPoints}
                                >
                                  {savingPoints ? "Saving..." : "Save"}
                                </Button>
                              </>
                            ) : (
                              <div className="text-red-500">Supabase not configured</div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/50">
                              <TableHead className="font-orbitron">#</TableHead>
                              <TableHead className="font-orbitron">Team</TableHead>
                              <TableHead className="font-orbitron text-right">
                                Games Played
                              </TableHead>
                              <TableHead className="font-orbitron text-right">
                                Games Won
                              </TableHead>
                              <TableHead className="font-orbitron text-right">
                                Total Points
                              </TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {getGroupRowsForGame(letter, mlGroupData).map((row) => {
                              const origIdx = row.originalIndex ?? row.rank - 1;
                              const storedRow = mlGroupData[letter]?.[origIdx];

                              const displayTeam = storedRow?.team ?? row.team;
                              const displayGamesPlayed = storedRow?.gamesPlayed ?? row.gamesPlayed;
                              const displayGamesWon = storedRow?.gamesWon ?? row.gamesWon;
                              const displayPoints = storedRow?.points ?? row.points;

                              return (
                                <TableRow key={`group-${letter}-${row.rank}`} className="border-border/50">
                                  <TableCell className="font-semibold">{row.rank}.</TableCell>

                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                                        {letter}
                                      </div>

                                      {canEdit ? (
                                        <Input
                                          value={displayTeam ?? ""}
                                          onChange={(e) =>
                                            updateMlTeamName(letter, origIdx, e.target.value)
                                          }
                                        />
                                      ) : (
                                        <div>{displayTeam}</div>
                                      )}
                                    </div>
                                  </TableCell>

                                  <TableCell className="text-right">
                                    {canEdit ? (
                                      <Input
                                        className="text-right"
                                        type="number"
                                        value={displayGamesPlayed ?? 0}
                                        onChange={(e) =>
                                          updateMlStat(letter, origIdx, "gamesPlayed", e.target.value)
                                        }
                                      />
                                    ) : (
                                      displayGamesPlayed ?? 0
                                    )}
                                  </TableCell>

                                  <TableCell className="text-right">
                                    {canEdit ? (
                                      <Input
                                        className="text-right"
                                        type="number"
                                        value={displayGamesWon ?? 0}
                                        onChange={(e) =>
                                          updateMlStat(letter, origIdx, "gamesWon", e.target.value)
                                        }
                                      />
                                    ) : (
                                      displayGamesWon ?? 0
                                    )}
                                  </TableCell>

                                  <TableCell className="text-right font-semibold">
                                    {canEdit ? (
                                      <Input
                                        className="text-right"
                                        type="number"
                                        value={displayPoints ?? 0}
                                        onChange={(e) =>
                                          updateMlPoints(letter, origIdx, e.target.value)
                                        }
                                      />
                                    ) : (
                                      displayPoints ?? 0
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </TabsContent>

        {/* ================= DOUBLE ELIMINATION ================= */}
        <TabsContent value="pointrush">
          <div className="space-y-6">
            <h3 className="font-orbitron text-2xl tracking-tight">
              Double Elimination — 8 Teams
            </h3>

            {isVanguardArena && (
              <div className="text-sm text-muted-foreground">
                ✅ Qualified Teams: <b>Top 1</b> from each group (A–H)
              </div>
            )}

            {canEdit && (
              <div className="flex items-center gap-3 text-sm mt-2">
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
                        setMlBracket(buildMlBracketFromGroups());
                        setIsDirty(true);
                        toast.success("Bracket reseeded from groups");
                      }}
                    >
                      Reseed from Groups
                    </Button>

                    <Button
                      size="sm"
                      disabled={!isDirty || savingPoints}
                      onClick={saveMlPoints}
                    >
                      {savingPoints ? "Saving..." : "Save"}
                    </Button>
                  </>
                ) : (
                  <div className="text-red-500">Supabase not configured</div>
                )}
              </div>
            )}

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
                      columns: (mlBracket ?? buildMlBracketFromGroups()).columns.slice(0, 3),
                    }}
                    onScoreChange={canEdit ? handleMlScoreChange : undefined}
                  />
                </div>

                <div className="rounded-lg border border-border/40 bg-gradient-to-b from-background/60 to-background/30 p-4">
                  <h4 className="text-sm uppercase text-muted-foreground mb-3">
                    Lower Bracket (Losers)
                  </h4>
                  <BracketView
                    bracket={{
                      columns: (mlBracket ?? buildMlBracketFromGroups()).columns.slice(3, 7),
                    }}
                    onScoreChange={canEdit ? handleMlScoreChange : undefined}
                    colOffset={3}
                  />
                </div>

                <div className="text-right text-xs text-muted-foreground mt-2">
                  Winners advance in Upper Bracket; losers move to Lower Bracket.
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
                        columns: [(mlBracket ?? buildMlBracketFromGroups()).columns[7]],
                      }}
                      onScoreChange={canEdit ? handleMlScoreChange : undefined}
                      colOffset={7}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-3">
                    Grand Final determines the champion.
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>

      {loadingPoints && (
        <div className="mt-3 text-sm text-muted-foreground">
          Loading saved points...
        </div>
      )}
    </div>
  );
};

export default LeaderboardMl;
