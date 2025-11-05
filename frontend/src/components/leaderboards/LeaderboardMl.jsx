// src/components/leaderboards/LeaderboardMl.jsx

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fetchPointsSnapshot, savePointsSnapshot, isSupabaseConfigured } from "@/data/leaderboardPoints";
import BracketView from "@/components/bracket/BracketView";
// Removed: type { Bracket, SimpleGroupRow, GroupLetter, Game } import

// Removed ML-Specific Types

const GROUP_LETTERS = ["A", "B", "C", "D"]; // Removed: GroupLetter[]

// ML-Specific Data and Logic
// Removed: Record<GroupLetter, SimpleGroupRow[]> type
const mobileLegendsGroupData = {
  A: [
    { rank: 1, team: "RRQ Hoshi", points: 184 },
    { rank: 2, team: "ONIC Esports", points: 176 },
    { rank: 3, team: "Blacklist International", points: 168 },
    { rank: 4, team: "Falcon Esports", points: 152 },
  ],
  B: [
    { rank: 1, team: "EVOS Legends", points: 182 },
    { rank: 2, team: "Burn x Flash", points: 170 },
    { rank: 3, team: "Bigetron Alpha", points: 158 },
    { rank: 4, team: "Rebellion Zion", points: 146 },
  ],
  C: [
    { rank: 1, team: "Team SMG", points: 188 },
    { rank: 2, team: "AP.Bren", points: 174 },
    { rank: 3, team: "RSG Philippines", points: 160 },
    { rank: 4, team: "HomeBois", points: 148 },
  ],
  D: [
    { rank: 1, team: "Echo Philippines", points: 186 },
    { rank: 2, team: "Geek Fam", points: 168 },
    { rank: 3, team: "Todak", points: 154 },
    { rank: 4, team: "See You Soon", points: 140 },
  ],
};

// Removed parameter and return types
const cloneGroupRows = (source) => {
  return GROUP_LETTERS.reduce((acc, letter) => {
    const rows = source[letter] ?? [];
    acc[letter] = rows.map((row, index) => ({ ...row, originalIndex: row.originalIndex ?? index }));
    return acc;
  }, {}); // Removed 'as MobileLegendsGroupState'
};

// Removed parameter and return types
const deriveGroupRowStats = (row) => {
  const gamesPlayed = row.gamesPlayed ?? Math.max(1, Math.floor(row.points / 50));
  const gamesWon = row.gamesWon ?? Math.max(0, Math.floor(gamesPlayed * 0.6));
  return { gamesPlayed, gamesWon };
};

// Removed parameter and return types
const getGroupRowsForGame = (group, mobileLegendsGroups) => {
  const sourceGroups = mobileLegendsGroups ?? mobileLegendsGroupData;
  const baseRows = (sourceGroups[group] ?? mobileLegendsGroupData[group]).map((row, index) => ({
    ...row,
    originalIndex: row.originalIndex ?? index,
  }));

  const rowsWithStats = baseRows.map((row) => {
    const stats = deriveGroupRowStats(row);
    return { ...row, ...stats };
  });

  rowsWithStats.sort((a, b) => {
    if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
    return a.team.localeCompare(b.team);
  });

  return rowsWithStats.map((row, index) => ({ ...row, rank: index + 1 }));
};

// Removed: LeaderboardMlProps type definition

// Removed: type annotation from props
const LeaderboardMl = ({ eventId, game, canEdit }) => {
  const [mlGroupData, setMlGroupData] = useState(() => cloneGroupRows(mobileLegendsGroupData)); // Removed: <MobileLegendsGroupState>
  const [mlBracket, setMlBracket] = useState(null); // Removed: <Bracket | null>
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null); // Removed: <string | null>
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [savingPoints, setSavingPoints] = useState(false);

  const buildMlBracketFromGroups = useCallback(() => { // Removed: (): Bracket
    const sortByPoints = (letter) => { // Removed: (letter: GroupLetter)
      const base = (mlGroupData[letter] ?? mobileLegendsGroupData[letter]).map((r, i) => ({ ...r, originalIndex: r.originalIndex ?? i }));
      const withStats = base.map((r) => {
        const pts = typeof r.points === 'number' ? r.points : Number(r.points) || 0;
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
        return a.team.localeCompare(b.team);
      });
      return withStats.slice(0, 2).map(r => r.team);
    };

    const A = sortByPoints('A');
    const B = sortByPoints('B');
    const C = sortByPoints('C');
    const D = sortByPoints('D');

    const quarterfinals = [
      { teamA: A[0] ?? '—', teamB: D[1] ?? '—', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
      { teamA: B[0] ?? '—', teamB: C[1] ?? '—', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
      { teamA: C[0] ?? '—', teamB: B[1] ?? '—', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
      { teamA: D[0] ?? '—', teamB: A[1] ?? '—', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
    ];
    const upperSemis = [
      { teamA: 'Winner UB1', teamB: 'Winner UB2', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
      { teamA: 'Winner UB3', teamB: 'Winner UB4', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
    ];
    const upperFinal = [
      { teamA: 'Winner UB5', teamB: 'Winner UB6', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
    ];
    const lowerRound1 = [
      { teamA: 'Loser UB1', teamB: 'Loser UB2', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
      { teamA: 'Loser UB3', teamB: 'Loser UB4', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
    ];
    const lowerQFs = [
      { teamA: 'Winner LB1', teamB: 'Loser UB6', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
      { teamA: 'Winner LB2', teamB: 'Loser UB5', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
    ];
    const lowerSemi = [
      { teamA: 'Winner LB3', teamB: 'Winner LB4', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
    ];
    const lowerFinal = [
      { teamA: 'Loser UB7', teamB: 'Winner LB5', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
    ];
    const grandFinal = [
      { teamA: 'Winner UB7', teamB: 'Winner LB6', scoreA: 0, scoreB: 0, status: 'upcoming' }, // Removed 'as const'
    ];

    return { columns: [
      { title: 'Upper • Quarterfinals', matches: quarterfinals },
      { title: 'Upper • Semifinals', matches: upperSemis },
      { title: 'Upper • Final', matches: upperFinal },
      { title: 'Lower • Round 1 (Elimination)', matches: lowerRound1 },
      { title: 'Lower • Quarterfinals', matches: lowerQFs },
      { title: 'Lower • Semifinal', matches: lowerSemi },
      { title: 'Lower • Final', matches: lowerFinal },
      { title: 'Grand Final', matches: grandFinal },
    ] }; // Removed 'as Bracket'
  }, [mlGroupData]);

  useEffect(() => {
    if (mlBracket) return; // Only initialize once
    setMlBracket(buildMlBracketFromGroups());
  }, []); // Empty dependency array - initialize only once on mount

  const propagateMatches = (br, col, mIdx) => { // Removed: br: Bracket
    const updated = { ...br, columns: br.columns.map(c => ({ ...c, matches: c.matches.map(m => ({ ...m })) })) }; // Removed: as Bracket
    const match = updated.columns[col].matches[mIdx];
    if (!match) return updated;
    if (match.scoreA === match.scoreB) return updated;
    const winner = match.scoreA > match.scoreB ? match.teamA : match.teamB;
    const loser = match.scoreA > match.scoreB ? match.teamB : match.teamA;

    // ... (rest of propagateMatches logic remains identical) ...
    // Column mappings based on layout
    if (col === 0) {
      // UB -> upper semis and lower round1
      const ufMap = [ [1,0,'teamA'], [1,0,'teamB'], [1,1,'teamA'], [1,1,'teamB'] ];
      const lbMap = [ [3,0,'teamA'], [3,0,'teamB'], [3,1,'teamA'], [3,1,'teamB'] ];
      const [ufCol, ufMatch, ufSide] = ufMap[mIdx]; // Removed: as any
      const [lbCol, lbMatch, lbSide] = lbMap[mIdx]; // Removed: as any
      (updated.columns[ufCol].matches[ufMatch])[ufSide] = winner; // Removed: as any
      (updated.columns[lbCol].matches[lbMatch])[lbSide] = loser; // Removed: as any
    }
    if (col === 1) {
      (updated.columns[2].matches[0])[mIdx === 0 ? 'teamA' : 'teamB'] = winner; // Removed: as any
      if (mIdx === 0) (updated.columns[4].matches[1]).teamB = loser; // Removed: as any
      else (updated.columns[4].matches[0]).teamB = loser; // Removed: as any
    }
    if (col === 2) {
      (updated.columns[7].matches[0]).teamA = winner; // Removed: as any
      (updated.columns[6].matches[0]).teamA = loser; // Removed: as any
    }
    if (col === 3) {
      const target = mIdx === 0 ? 0 : 1;
      (updated.columns[4].matches[target]).teamA = winner; // Removed: as any
    }
    if (col === 4) {
      (updated.columns[5].matches[0])[mIdx === 0 ? 'teamA' : 'teamB'] = winner; // Removed: as any
    }
    if (col === 5) {
      (updated.columns[6].matches[0]).teamB = winner; // Removed: as any
    }
    if (col === 6) {
      (updated.columns[7].matches[0]).teamB = winner; // Removed: as any
    }
    if (col === 7) {
      updated.winner = winner; // Removed: (updated as any)
    }
    return updated;
  };

  // Removed parameter types
  const handleMlScoreChange = (col, mIdx, newA, newB) => {
    setMlBracket((prev) => {
      if (!prev) return prev;
      const next = { ...prev, columns: prev.columns.map(c => ({ ...c, matches: c.matches.map(m => ({ ...m })) })) }; // Removed: as Bracket
      next.columns[col].matches[mIdx].scoreA = newA;
      next.columns[col].matches[mIdx].scoreB = newB;
      if (newA !== newB) next.columns[col].matches[mIdx].status = 'completed';
      const propagated = propagateMatches(next, col, mIdx);
      return propagated;
    });
    setIsDirty(true);
  };

  // Removed parameter types
  const updateMlTeamName = (group, origIdx, name) => {
    setMlGroupData((prev) => {
      const next = { ...prev };
      const rows = next[group] ? [...next[group]] : [];
      const existing = rows[origIdx] ?? { rank: origIdx + 1, team: `Team ${origIdx + 1}`, points: 0, originalIndex: origIdx };
      rows[origIdx] = { ...existing, team: name };
      next[group] = rows;
      return next;
    });
    setIsDirty(true);
  };

  // Removed parameter types
  const updateMlPoints = (group, origIdx, value) => {
    const points = Number(value) || 0;
    setMlGroupData((prev) => {
      const next = { ...prev };
      const rows = next[group] ? [...next[group]] : [];
      const existing = rows[origIdx] ?? { rank: origIdx + 1, team: `Team ${origIdx + 1}`, points: 0, originalIndex: origIdx };
      rows[origIdx] = { ...existing, points };
      next[group] = rows;
      return next;
    });
    setIsDirty(true);
  };

  // Removed parameter types
  const updateMlStat = (group, origIdx, key, value) => {
    const numericValue = Number(value);
    setMlGroupData((prev) => {
      const next = { ...prev };
      const rows = next[group] ? [...next[group]] : [];
      const existing = rows[origIdx] ?? { rank: origIdx + 1, team: `Team ${origIdx + 1}`, points: 0, originalIndex: origIdx };
      rows[origIdx] = {
        ...existing,
        [key]: Number.isFinite(numericValue) ? numericValue : 0,
      };
      next[group] = rows;
      return next;
    });
    setIsDirty(true);
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setMlGroupData(cloneGroupRows(mobileLegendsGroupData));
      setLastSavedAt(null);
      setIsDirty(false);
      return;
    }
    let cancelled = false;
    const loadMobileLegends = async () => {
      setLoadingPoints(true);
      try {
        const snapshot = await fetchPointsSnapshot(eventId, game.id); // Removed: <string>
        if (cancelled) return;

        if (snapshot?.groups) {
          const base = cloneGroupRows(mobileLegendsGroupData);
          for (const letter of GROUP_LETTERS) {
            const savedRows = snapshot.groups?.[letter];
            if (savedRows && savedRows.length > 0) {
              base[letter] = savedRows.map((row, index) => ({
                rank: typeof row.rank === "number" ? row.rank : index + 1,
                team: row.team ?? base[letter][index]?.team ?? `Team ${index + 1}`,
                points: typeof row.points === "number" ? row.points : base[letter][index]?.points ?? 0,
                gamesPlayed: typeof row.gamesPlayed === "number" ? row.gamesPlayed : undefined,
                gamesWon: typeof row.gamesWon === "number" ? row.gamesWon : undefined,
                originalIndex: row.originalIndex ?? index,
              }));
            }
          }
          setMlGroupData(cloneGroupRows(base));
          try {
            const snapAny = snapshot; // Removed: as any
            if (snapAny?.bracket?.columns) {
              setMlBracket(snapAny.bracket); // Removed: as Bracket
            } else {
              setMlBracket(buildMlBracketFromGroups());
            }
          } catch {
            setMlBracket(buildMlBracketFromGroups());
          }
          setLastSavedAt(snapshot.updatedAt ?? null);
        } else {
          setMlGroupData(cloneGroupRows(mobileLegendsGroupData));
          setMlBracket(buildMlBracketFromGroups());
          setLastSavedAt(snapshot?.updatedAt ?? null);
        }
        setIsDirty(false);
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to load saved leaderboard");
          console.error(error);
        }
      } finally {
        if (!cancelled) {
          setLoadingPoints(false);
        }
      }
    };
    loadMobileLegends();
    return () => { cancelled = true; };
  }, [eventId, game.id, buildMlBracketFromGroups]);

  const saveMlPoints = async () => {
    try {
      setSavingPoints(true);
      const payload = { groups: mlGroupData, bracket: mlBracket ?? buildMlBracketFromGroups() }; // Removed: as any
      await savePointsSnapshot(eventId, game.id, payload);
      const now = new Date().toISOString();
      setLastSavedAt(now);
      setIsDirty(false);
      toast.success("Points saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save points");
    } finally {
      setSavingPoints(false);
    }
  };

  return (
    <div>
      <Tabs defaultValue={"knockout"}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start sm:w-auto">
            <TabsTrigger value="knockout">Knockout Stage</TabsTrigger>
            <TabsTrigger value="pointrush">Double Elimination</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="knockout">
          <div>
            <Tabs defaultValue="group-a">
              <div className="overflow-x-auto pb-2">
                <TabsList className="w-full justify-start sm:w-auto">
                  <TabsTrigger value="group-a">Group A</TabsTrigger>
                  <TabsTrigger value="group-b">Group B</TabsTrigger>
                  <TabsTrigger value="group-c">Group C</TabsTrigger>
                  <TabsTrigger value="group-d">Group D</TabsTrigger>
                </TabsList>
              </div>

              {GROUP_LETTERS.map((letter) => (
                <TabsContent key={`group-${letter}`} value={`group-${letter.toLowerCase()}`}>
                  <Card className="glass-card border-primary/20">
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="font-orbitron text-2xl">{game.name} — Group {letter}</CardTitle>
                        {canEdit && (
                          <div className="flex items-center gap-3 text-sm">
                            {isSupabaseConfigured() ? (
                              <>
                                <div className="text-muted-foreground">
                                  {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                                  {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                                </div>
                                <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveMlPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
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
                              <TableHead className="font-orbitron text-right">Games Played</TableHead>
                              <TableHead className="font-orbitron text-right">Games Won</TableHead>
                              <TableHead className="font-orbitron text-right">Total Points</TableHead>
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
                                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{letter}</div>
                                      {canEdit ? (
                                        <Input value={displayTeam} onChange={(e) => updateMlTeamName(letter, origIdx, e.target.value)} />
                                      ) : (
                                        <div>{displayTeam}</div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {canEdit ? (
                                      <Input className="text-right" type="number" value={displayGamesPlayed} onChange={(e) => updateMlStat(letter, origIdx, 'gamesPlayed', e.target.value)} />
                                    ) : ( displayGamesPlayed )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {canEdit ? (
                                      <Input className="text-right" type="number" value={displayGamesWon} onChange={(e) => updateMlStat(letter, origIdx, 'gamesWon', e.target.value)} />
                                    ) : ( displayGamesWon )}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold">
                                    {canEdit ? (
                                      <Input className="text-right" type="number" value={displayPoints} onChange={(e) => updateMlPoints(letter, origIdx, e.target.value)} />
                                    ) : ( displayPoints )}
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

        <TabsContent value="pointrush">
          <div className="space-y-6">
            <h3 className="font-orbitron text-2xl tracking-tight">Double Elimination — 8 Teams</h3>
            {canEdit && (
              <div className="flex items-center gap-3 text-sm mt-2">
                {isSupabaseConfigured() ? (
                  <>
                    <div className="text-muted-foreground">
                      {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                      {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setMlBracket(buildMlBracketFromGroups()); setIsDirty(true); toast.success('Bracket reseeded from groups'); }}>Reseed from Groups</Button>
                    <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveMlPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
                  </>
                ) : (
                  <div className="text-red-500">Supabase not configured</div>
                )}
              </div>
            )}

            <div className="space-y-6">
              <Tabs defaultValue="bracket">
                <TabsList className="w-full justify-start sm:w-auto">
                  <TabsTrigger value="bracket">Bracket</TabsTrigger>
                  <TabsTrigger value="grand">Grand Final</TabsTrigger>
                </TabsList>

                <TabsContent value="bracket" className="mt-4">
                  <div className="rounded-lg border border-border/40 bg-gradient-to-b from-background/60 to-background/30 p-4">
                    <h4 className="text-sm uppercase text-muted-foreground mb-3">Upper Bracket</h4>
                    <BracketView bracket={{ columns: (mlBracket ?? buildMlBracketFromGroups()).columns.slice(0, 3) }} onScoreChange={canEdit ? handleMlScoreChange : undefined} />
                  </div>

                  <div className="rounded-lg border border-border/40 bg-gradient-to-b from-background/60 to-background/30 p-4">
                    <h4 className="text-sm uppercase text-muted-foreground mb-3">Lower Bracket (Losers)</h4>
                    <BracketView bracket={{ columns: (mlBracket ?? buildMlBracketFromGroups()).columns.slice(3, 7) }} onScoreChange={canEdit ? handleMlScoreChange : undefined} colOffset={3} />
                  </div>

                  <div className="text-right text-xs text-muted-foreground mt-2">Winners advance in Upper Bracket; losers move to Lower Bracket.</div>
                </TabsContent>

                <TabsContent value="grand" className="mt-4">
                  <div className="rounded-lg border border-border/40 bg-gradient-to-b from-background/60 to-background/30 p-6 text-center">
                    <h4 className="text-sm uppercase text-muted-foreground mb-3">Grand Final</h4>
                    <div className="max-w-xl mx-auto">
                      <BracketView bracket={{ columns: [(mlBracket ?? buildMlBracketFromGroups()).columns[7]] }} onScoreChange={canEdit ? handleMlScoreChange : undefined} colOffset={7} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">Grand Final determines the champion.</div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardMl;
