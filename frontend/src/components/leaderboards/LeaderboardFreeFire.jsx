import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fetchPointsSnapshot, savePointsSnapshot, isSupabaseConfigured } from "@/data/leaderboardPoints";

const GROUP_LETTERS = ["A", "B", "C", "D"]; // Removed: GroupLetter[]
const SEMIFINAL_MATCH_KEYS = ["match1", "match2", "match3"]; // Removed: FreeFireSemifinalMatchKey[]

// Removed return types
const createEmptyFreeFireMatch = () => ({ gamesPlayed: 0, booyah: 0, placement: 0, kills: 0, points: 0 });
const createEmptyFreeFireMatches = () => ({ match1: createEmptyFreeFireMatch(), match2: createEmptyFreeFireMatch() });
// Removed parameter and return types
const createFreeFireGroupRows = ({ count, startRank, startTeamNumber, basePoints, step }) =>
  Array.from({ length: count }, (_, index) => ({
    rank: startRank + index,
    team: `Team ${startTeamNumber + index}`,
    gamesPlayed: 0,
    booyah: 0,
    placement: 0,
    kills: 0,
    points: 0,
    matches: createEmptyFreeFireMatches(),
    originalIndex: index,
  }));

// Removed return types
const createEmptySemifinalMatch = () => ({ booyah: 0, placement: 0, kills: 0, points: 0 });
const createEmptySemifinalMatches = () => ({ match1: createEmptySemifinalMatch(), match2: createEmptySemifinalMatch(), match3: createEmptySemifinalMatch() });

// Removed parameter and return types
const normalizeSemifinalMatches = (matches) => {
  const base = createEmptySemifinalMatches();
  SEMIFINAL_MATCH_KEYS.forEach((key) => {
    const data = matches?.[key] ?? {};
    const booyah = Number((data?.booyah ?? 0)) || 0; // Removed: as number
    const placement = Number((data?.placement ?? 0)) || 0; // Removed: as number
    const kills = Number((data?.kills ?? 0)) || 0; // Removed: as number
    base[key] = { booyah, placement, kills, points: placement + kills };
  });
  return base;
};

// Removed parameter and return types
const normalizeSemifinalRow = (row, fallbackGroup, fallbackIndex) => {
  const group = (row?.group) ?? fallbackGroup; // Removed: as GroupLetter
  const seedIndexCandidate = typeof row?.seedIndex === "number" ? row.seedIndex : Number(row?.seedIndex ?? fallbackIndex);
  const seedIndex = Number.isFinite(seedIndexCandidate) ? seedIndexCandidate : fallbackIndex;
  const id = row?.id ?? `${group}-${seedIndex}`;
  const team = typeof row?.team === "string" && row.team.trim().length > 0 ? row.team : `Team ${fallbackIndex + 1}`;
  return { id, group, seedIndex, team, matches: normalizeSemifinalMatches(row?.matches) };
};

// Removed: LeaderboardFreeFireProps type definition

// Removed: type annotation from props
const LeaderboardFreeFire = ({ eventId, game, canEdit }) => {
  const [freefireGroups, setFreefireGroups] = useState(() => ({ // Removed: <FreeFireGroupState>
    A: createFreeFireGroupRows({ count: 12, startRank: 1, startTeamNumber: 1, basePoints: 120, step: 6 }),
    B: createFreeFireGroupRows({ count: 12, startRank: 13, startTeamNumber: 13, basePoints: 120, step: 6 }),
    C: createFreeFireGroupRows({ count: 11, startRank: 25, startTeamNumber: 25, basePoints: 120, step: 6 }),
    D: createFreeFireGroupRows({ count: 11, startRank: 36, startTeamNumber: 36, basePoints: 120, step: 6 }),
  }));
  const [semifinalRows, setSemifinalRows] = useState([]); // Removed: <FreeFireSemifinalRow[]>
  const [freefireFinalsRows, setFreefireFinalsRows] = useState([]); // Removed: <FreeFireFinalsRow[]>

  const [loadingPoints, setLoadingPoints] = useState(false);
  const [savingPoints, setSavingPoints] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null); // Removed: <string | null>

  // Removed parameter types
  const getSortedGroupRows = (letter, groups) => {
    const rows = (groups?.[letter] ?? []); // Removed: as any[]
    const withTotals = rows.map((row) => { // Removed: (row: any)
      const m1 = row.matches?.match1 ?? { placement: 0, kills: 0, booyah: 0 };
      const m2 = row.matches?.match2 ?? { placement: 0, kills: 0, booyah: 0 };
      const totalBooyah = (m1.booyah || 0) + (m2.booyah || 0);
      const totalPlacement = (m1.placement || 0) + (m2.placement || 0);
      const totalKills = (m1.kills || 0) + (m2.kills || 0);
      const computedPoints = totalPlacement + totalKills;
      const storedPoints = (typeof row.points === 'number' ? row.points : Number(row.points)) || (row.totalPoints ?? 0);
      const totalPoints = computedPoints || storedPoints || 0;
      return { ...row, totalBooyah, totalPlacement, totalKills, totalPoints };
    });
    return withTotals.sort((a, b) => b.totalPoints - a.totalPoints); // Removed: (a: any, b: any)
  };

  const buildSemifinalRowsFromGroups = useCallback((groups) => { // Removed parameter and return types
    const rows = []; // Removed: FreeFireSemifinalRow[]
    GROUP_LETTERS.forEach((letter) => {
      const topRows = getSortedGroupRows(letter, groups).slice(0, 3);
      topRows.forEach((row, idx) => { // Removed: (row: any, idx: number)
        const seedIndex = row.originalIndex ?? idx;
        rows.push({
          id: `${letter}-${seedIndex}`,
          group: letter,
          seedIndex,
          team: row.team,
          matches: createEmptySemifinalMatches(),
        });
      });
    });
    return rows;
  }, []); // getSortedGroupRows is not a dependency as it's a pure function

  useEffect(() => {
    setSemifinalRows((prev) => {
      if (prev.length > 0) return prev;
      return buildSemifinalRowsFromGroups(freefireGroups);
    });
  }, [freefireGroups, buildSemifinalRowsFromGroups]);

  const updateFreefireMatchStat = useCallback(
    // Removed parameter types
    (group, originalIndex, matchKey, field, rawValue) => {
      const parsed = Number(rawValue);
      const numericValue = Number.isFinite(parsed) ? parsed : 0;
      setFreefireGroups((prev) => {
        const groupRows = (prev[group] ?? []).map((row, index) => {
          if (index !== originalIndex) return row;
          const existingMatches = row.matches ?? createEmptyFreeFireMatches();
          const existingMatch = existingMatches[matchKey] ?? createEmptyFreeFireMatch();
          const updatedMatch = { ...existingMatch, [field]: numericValue }; // Removed: as FreeFireMatchStats
          const placementValue = field === "placement" ? numericValue : existingMatch.placement ?? 0;
          const killsValue = field === "kills" ? numericValue : existingMatch.kills ?? 0;
          return {
            ...row,
            matches: {
              ...existingMatches,
              [matchKey]: { ...updatedMatch, points: placementValue + killsValue },
            },
          };
        });
        return { ...prev, [group]: groupRows };
      });
      setIsDirty(true);
    }, []
  );

  // Removed parameter types
  const renderFreefireStatCell = (group, originalIndex, matchKey, field, value) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    if (!canEdit) return safeValue;
    return <Input type="number" className="text-right" value={safeValue} onChange={(e) => updateFreefireMatchStat(group, originalIndex, matchKey, field, e.target.value)} />;
  };
  
  const updateSemifinalMatchStat = useCallback(
    // Removed parameter types
    (rowId, matchKey, field, value) => {
      const numericValue = Number(value);
      const parsed = Number.isFinite(numericValue) ? numericValue : 0;
      setSemifinalRows((prev) =>
        prev.map((row) => {
          if (row.id !== rowId) return row;
          const currentMatch = row.matches[matchKey];
          const updatedMatch = { ...currentMatch, [field]: parsed };
          const points = (updatedMatch.placement || 0) + (updatedMatch.kills || 0);
          return { ...row, matches: { ...row.matches, [matchKey]: { ...updatedMatch, points } } };
        })
      );
      setIsDirty(true);
    }, []
  );

  const semifinalOverviewRows = useMemo(() => {
    return semifinalRows
      .map((row) => {
        const totals = SEMIFINAL_MATCH_KEYS.reduce(
          (acc, key) => {
            const match = row.matches[key];
            acc.booyah += match.booyah || 0;
            acc.placement += match.placement || 0;
            acc.kills += match.kills || 0;
            return acc;
          }, { booyah: 0, placement: 0, kills: 0 }
        );
        const totalPoints = totals.placement + totals.kills;
        return { id: row.id, group: row.group, team: row.team, totalBooyah: totals.booyah, totalPlacement: totals.placement, totalKills: totals.kills, totalPoints };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [semifinalRows]);

  useEffect(() => {
    const finalsTeams = semifinalOverviewRows.slice(0, 4);
    if (finalsTeams.length > 0) {
      setFreefireFinalsRows((prevRows) => {
        const newRows = finalsTeams.map((row) => ({
          id: row.id,
          team: row.team,
          group: row.group,
          booyah: row.totalBooyah,
          placement: row.totalPlacement,
          kills: row.totalKills,
          total: row.totalPoints,
        }));
        if (prevRows.length > 0) {
          return newRows.map((newRow, idx) => {
            const prevRow = prevRows[idx];
            if (prevRow) {
              return { ...newRow, booyah: prevRow.booyah, placement: prevRow.placement, kills: prevRow.kills, total: prevRow.total };
            }
            return newRow;
          });
        }
        return newRows;
      });
    }
  }, [semifinalOverviewRows]);

  // Removed parameter types
  const updateFreeFireFinalsCell = (teamId, key, value) => {
    const numericValue = Number(value) || 0;
    setFreefireFinalsRows((prev) =>
      prev.map((row) => {
        if (row.id !== teamId) return row;
        const updated = { ...row, [key]: numericValue };
        updated.total = (updated.placement || 0) + (updated.kills || 0);
        return updated;
      })
    );
    setIsDirty(true);
  };
  
  // Data Loading
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLastSavedAt(null);
      setIsDirty(false);
      return;
    }
    let cancelled = false;
    const loadFreefire = async () => {
      setLoadingPoints(true);
      try {
        const snapshot = await fetchPointsSnapshot(eventId, game.id); // Removed: <string>
        if (cancelled) return;
        if (snapshot?.groups) {
          const g = snapshot.groups; // Removed: as Record<string, any[]>
          const mapped = {}; // Removed: as FreeFireGroupState
          (GROUP_LETTERS).forEach((letter) => {
            const arr = g[letter] ?? [];
            mapped[letter] = arr.map((r, idx) => ({ // Removed: (r: any, idx: number)
              rank: r.rank ?? idx + 1,
              team: r.team ?? `Team ${idx+1}`,
              gamesPlayed: typeof r.gamesPlayed === 'number' ? r.gamesPlayed : Number(r.gamesPlayed) || 0,
              booyah: typeof r.booyah === 'number' ? r.booyah : Number(r.booyah) || 0,
              placement: typeof r.placement === 'number' ? r.placement : Number(r.placement) || 0,
              kills: typeof r.kills === 'number' ? r.kills : Number(r.kills) || 0,
              points: typeof r.points === 'number' ? r.points : Number(r.points) || 0,
              matches: r.matches ?? { match1: { placement: 0, kills: 0 }, match2: { placement: 0, kills: 0 } },
              originalIndex: r.originalIndex ?? idx,
            }));
          });
          setFreefireGroups((prev) => ({ ...prev, ...mapped }));
          const savedSemis = snapshot?.semifinals; // Removed: (snapshot as any) ... as any[] | undefined
          if (savedSemis && Array.isArray(savedSemis) && savedSemis.length > 0) {
            setSemifinalRows(savedSemis.map((r, i) => normalizeSemifinalRow(r, (r?.group) ?? 'A', typeof r?.seedIndex === 'number' ? r.seedIndex : i))); // Removed: (r: any, i: number), (r?.group as GroupLetter)
          } else {
            setSemifinalRows(buildSemifinalRowsFromGroups(mapped));
          }
        } else {
          const savedSemis = snapshot?.semifinals; // Removed: (snapshot as any) ... as any[] | undefined
          if (savedSemis && Array.isArray(savedSemis) && savedSemis.length > 0) {
            setSemifinalRows(savedSemis.map((r, i) => normalizeSemifinalRow(r, (r?.group) ?? 'A', typeof r?.seedIndex === 'number' ? r.seedIndex : i))); // Removed: (r: any, i: number), (r?.group as GroupLetter)
          }
        }
        const savedFinals = snapshot?.finals; // Removed: (snapshot as any) ... as any[] | undefined
        if (savedFinals && Array.isArray(savedFinals) && savedFinals.length > 0) {
          setFreefireFinalsRows(
            savedFinals.map((r) => { // Removed: (r: any)
              const placement = Number(r.placement ?? 0);
              const kills = Number(r.kills ?? 0);
              return {
                id: r.id ?? `team-${Math.random()}`,
                team: r.team ?? 'Unknown',
                group: r.group ?? 'A',
                booyah: Number(r.booyah ?? 0),
                placement,
                kills,
                total: Number(r.total ?? placement + kills),
              };
            })
          );
        }
        setLastSavedAt(snapshot?.updatedAt ?? null);
      } catch (e) {
        toast.error('Failed to load saved Free Fire points');
        console.error(e);
      } finally {
        if (!cancelled) setLoadingPoints(false);
      }
    };
    loadFreefire();
    return () => { cancelled = true; };
  }, [eventId, game.id, buildSemifinalRowsFromGroups]);

  // Data Saving
  const saveFreeFirePoints = async () => {
    try {
      setSavingPoints(true);
      const payload = { groups: freefireGroups, semifinals: semifinalRows, finals: freefireFinalsRows }; // Removed: as any
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
            <TabsTrigger value="semifinals">Semifinals</TabsTrigger>
            <TabsTrigger value="groupstage">Finals</TabsTrigger>
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

              {(GROUP_LETTERS).map((letter) => (
                <TabsContent key={`group-tab-${letter}`} value={`group-${letter.toLowerCase()}`}>
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
                                <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveFreeFirePoints}>{savingPoints ? "Saving..." : "Save"}</Button>
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
                        <Tabs defaultValue="overall">
                          <TabsList className="w-full">
                            <TabsTrigger value="overall">Overall</TabsTrigger>
                            <TabsTrigger value="match1">Match 1</TabsTrigger>
                            <TabsTrigger value="match2">Match 2</TabsTrigger>
                          </TabsList>
                          <TabsContent value="overall">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-border/50">
                                  <TableHead className="font-orbitron">#</TableHead>
                                  <TableHead className="font-orbitron">Team</TableHead>
                                  <TableHead className="font-orbitron text-right">Booyah</TableHead>
                                  <TableHead className="font-orbitron text-right">Placement</TableHead>
                                  <TableHead className="font-orbitron text-right">Kills</TableHead>
                                  <TableHead className="font-orbitron text-right">Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getSortedGroupRows(letter, freefireGroups).map((row, idx) => {
                                  const origIdx = row.originalIndex ?? row.rank - 1;
                                  return (
                                    <TableRow key={`freefire-${letter}-${origIdx}`} className="border-border/50">
                                      <TableCell className="font-semibold">{idx + 1}.</TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{letter}</div>
                                          {canEdit ? (
                                            <Input value={row.team} onChange={(e) => { const v = e.target.value; setFreefireGroups(prev => ({ ...prev, [letter]: prev[letter].map((r,i) => i === origIdx ? { ...r, team: v } : r) })); setIsDirty(true); }} />
                                          ) : ( <div>{row.team}</div> )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">{row.totalBooyah}</TableCell>
                                      <TableCell className="text-right">{row.totalPlacement}</TableCell>
                                      <TableCell className="text-right">{row.totalKills}</TableCell>
                                      <TableCell className="text-right font-semibold">{row.totalPoints}</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TabsContent>
                          <TabsContent value="match1">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-border/50">
                                  <TableHead className="font-orbitron">#</TableHead>
                                  <TableHead className="font-orbitron">Team</TableHead>
                                  <TableHead className="font-orbitron text-right">Booyah</TableHead>
                                  <TableHead className="font-orbitron text-right">Placement</TableHead>
                                  <TableHead className="font-orbitron text-right">Kills</TableHead>
                                  <TableHead className="font-orbitron text-right">Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {freefireGroups[letter].map((row) => {
                                  const origIdx = row.originalIndex ?? row.rank - 1;
                                  const m = row.matches?.match1 ?? createEmptyFreeFireMatch();
                                  return (
                                    <TableRow key={`freefire-${letter}-m1-${row.rank}`} className="border-border/50">
                                      <TableCell className="font-semibold">{row.rank}.</TableCell>
                                      <TableCell><div>{row.team}</div></TableCell>
                                      <TableCell className="text-right">{renderFreefireStatCell(letter, origIdx, 'match1', 'booyah', m.booyah ?? 0)}</TableCell>
                                      <TableCell className="text-right">{renderFreefireStatCell(letter, origIdx, 'match1', 'placement', m.placement ?? 0)}</TableCell>
                                      <TableCell className="text-right">{renderFreefireStatCell(letter, origIdx, 'match1', 'kills', m.kills ?? 0)}</TableCell>
                                      <TableCell className="text-right">{(m.placement || 0) + (m.kills || 0)}</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TabsContent>
                          <TabsContent value="match2">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-border/50">
                                  <TableHead className="font-orbitron">#</TableHead>
                                  <TableHead className="font-orbitron">Team</TableHead>
                                  <TableHead className="font-orbitron text-right">Booyah</TableHead>
                                  <TableHead className="font-orbitron text-right">Placement</TableHead>
                                  <TableHead className="font-orbitron text-right">Kills</TableHead>
                                  <TableHead className="font-orbitron text-right">Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {freefireGroups[letter].map((row) => {
                                  const origIdx = row.originalIndex ?? row.rank - 1;
                                  const m = row.matches?.match2 ?? createEmptyFreeFireMatch();
                                  return (
                                    <TableRow key={`freefire-${letter}-m2-${row.rank}`} className="border-border/50">
                                      <TableCell className="font-semibold">{row.rank}.</TableCell>
                                      <TableCell><div>{row.team}</div></TableCell>
                                      <TableCell className="text-right">{renderFreefireStatCell(letter, origIdx, 'match2', 'booyah', m.booyah ?? 0)}</TableCell>
                                      <TableCell className="text-right">{renderFreefireStatCell(letter, origIdx, 'match2', 'placement', m.placement ?? 0)}</TableCell>
                                      <TableCell className="text-right">{renderFreefireStatCell(letter, origIdx, 'match2', 'kills', m.kills ?? 0)}</TableCell>
                                      <TableCell className="text-right">{(m.placement || 0) + (m.kills || 0)}</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="semifinals">
          <div>
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-orbitron text-2xl">Semifinals</CardTitle>
                  {canEdit && <Button onClick={saveSemifinalPoints} disabled={!isDirty || savingPoints}>{savingPoints ? 'Saving...' : 'Save Points'}</Button>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Tabs defaultValue="overall">
                    <div className="overflow-x-auto pb-2">
                      <TabsList className="w-full justify-start sm:w-auto">
                        <TabsTrigger value="overall">Overall</TabsTrigger>
                        <TabsTrigger value="match1">Match 1</TabsTrigger>
                        <TabsTrigger value="match2">Match 2</TabsTrigger>
                        <TabsTrigger value="match3">Match 3</TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="overall">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead className="font-orbitron">#</TableHead>
                            <TableHead className="font-orbitron">Team</TableHead>
                            <TableHead className="font-orbitron text-right">Booyah</TableHead>
                            <TableHead className="font-orbitron text-right">Placement</TableHead>
                            <TableHead className="font-orbitron text-right">Kills</TableHead>
                            <TableHead className="font-orbitron text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {semifinalOverviewRows.map((row) => (
                            <TableRow key={`semifinals-${row.id}`} className="border-border/50">
                              <TableCell className="font-semibold">{row.rank}.</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{row.group}</div>
                                  <div>{row.team}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{row.totalBooyah}</TableCell>
                              <TableCell className="text-right">{row.totalPlacement}</TableCell>
                              <TableCell className="text-right">{row.totalKills}</TableCell>
                              <TableCell className="text-right font-semibold">{row.totalPoints}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="text-xs text-muted-foreground mt-2">Top 4 teams qualify for the Finals.</div>
    
                    </TabsContent>
                    <TabsContent value="match1">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead className="font-orbitron">#</TableHead>
                            <TableHead className="font-orbitron">Team</TableHead>
                            <TableHead className="font-orbitron text-right">Booyah</TableHead>
                            <TableHead className="font-orbitron text-right">Placement</TableHead>
                            <TableHead className="font-orbitron text-right">Kills</TableHead>
                            <TableHead className="font-orbitron text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {semifinalRows.map((row, idx) => {
                            const m = row.matches.match1;
                            return (
                              <TableRow key={`semifinals-m1-${row.id}`} className="border-border/50">
                                <TableCell className="font-semibold">{idx + 1}.</TableCell>
                                <TableCell><div>{row.team}</div></TableCell>
                                <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.booyah} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match1', 'booyah', e.target.value)} />) : m.booyah}</TableCell>
                                <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.placement} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match1', 'placement', e.target.value)} />) : m.placement}</TableCell>
                                <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.kills} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match1', 'kills', e.target.value)} />) : m.kills}</TableCell>
                                <TableCell className="text-right">{(m.placement||0)+(m.kills||0)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TabsContent>
                    <TabsContent value="match2">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead className="font-orbitron">#</TableHead>
                            <TableHead className="font-orbitron">Team</TableHead>
                            <TableHead className="font-orbitron text-right">Booyah</TableHead>
                            <TableHead className="font-orbitron text-right">Placement</TableHead>
                            <TableHead className="font-orbitron text-right">Kills</TableHead>
                            <TableHead className="font-orbitron text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {semifinalRows.map((row, idx) => {
                            const m = row.matches.match2;
                            return (
                              <TableRow key={`semifinals-m2-${row.id}`} className="border-border/50">
                                <TableCell className="font-semibold">{idx + 1}.</TableCell>
                                <TableCell><div>{row.team}</div></TableCell>
                                <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.booyah} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match2', 'booyah', e.target.value)} />) : m.booyah}</TableCell>
                                <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.placement} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match2', 'placement', e.target.value)} />) : m.placement}</TableCell>
                                <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.kills} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match2', 'kills', e.target.value)} />) : m.kills}</TableCell>
                                <TableCell className="text-right">{(m.placement||0)+(m.kills||0)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TabsContent>
                    <TabsContent value="match3">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead className="font-orbitron">#</TableHead>
                            <TableHead className="font-orbitron">Team</TableHead>
                            <TableHead className="font-orbitron text-right">Booyah</TableHead>
                            <TableHead className="font-orbitron text-right">Placement</TableHead>
                            <TableHead className="font-orbitron text-right">Kills</TableHead>
                            <TableHead className="font-orbitron text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {semifinalRows.map((row, idx) => {
                            const m = row.matches.match3;
                            return (
                              <TableRow key={`semifinals-m3-${row.id}`} className="border-border/50">
                                <TableCell className="font-semibold">{idx + 1}.</TableCell>
                                <TableCell><div>{row.team}</div></TableCell>
                                <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.booyah} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match3', 'booyah', e.target.value)} />) : m.booyah}</TableCell>
                                <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.placement} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match3', 'placement', e.target.value)} />) : m.placement}</TableCell>
                                <TableCell className="text-right">{canEdit ? (<Input type="number" className="text-right" value={m.kills} onChange={(e)=>updateSemifinalMatchStat(row.id, 'match3', 'kills', e.target.value)} />) : m.kills}</TableCell>
                                <TableCell className="text-right">{(m.placement||0)+(m.kills||0)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groupstage">
          <div>
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-orbitron text-2xl">Finals</CardTitle>
                  {canEdit && <Button onClick={saveFreeFireFinals} disabled={!isDirty || savingPoints}>{savingPoints ? 'Saving...' : 'Save Points'}</Button>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {semifinalOverviewRows.every((r) => (r.totalPoints || 0) === 0) ? (
                    <div className="p-6 text-center text-muted-foreground">
                      Finalists will be announced once semifinal results are in.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="font-orbitron">#</TableHead>
                          <TableHead className="font-orbitron">Team</TableHead>
                          <TableHead className="font-orbitron text-right">Booyah</TableHead>
                          <TableHead className="font-orbitron text-right">Placement</TableHead>
                          <TableHead className="font-orbitron text-right">Kills</TableHead>
                          <TableHead className="font-orbitron text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...freefireFinalsRows].sort((a, b) => b.total - a.total).map((row, idx) => (
                          <TableRow key={`freefire-finals-${row.id}`} className={`border-border/50 ${idx === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : ''}`}>
                            <TableCell className="font-semibold">{idx === 0 ? '🏆' : idx + 1}.</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{row.group}</div>
                                <div>{idx === 0 ? <span className="font-bold text-yellow-400">{row.team}</span> : row.team}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right w-24">
                              {canEdit ? (<Input className="text-right" type="number" value={row.booyah} onChange={(e) => updateFreeFireFinalsCell(row.id, "booyah", e.target.value)} />) : row.booyah}
                            </TableCell>
                            <TableCell className="text-right w-36">
                              {canEdit ? (<Input className="text-right" type="number" value={row.placement} onChange={(e) => updateFreeFireFinalsCell(row.id, "placement", e.target.value)} />) : row.placement}
                            </TableCell>
                            <TableCell className="text-right w-32">
                              {canEdit ? (<Input className="text-right" type="number" value={row.kills} onChange={(e) => updateFreeFireFinalsCell(row.id, "kills", e.target.value)} />) : row.kills}
                            </TableCell>
                            <TableCell className="text-right font-semibold">{row.total}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardFreeFire;
