
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fetchPointsSnapshot, savePointsSnapshot, isSupabaseConfigured } from "@/data/leaderboardPoints";

const BGMI_MATCH_KEYS = ["match1", "match2", "match3", "match4", "match5", "match6"]; 

const LeaderboardBgmi = ({ eventId, game, canEdit }) => { 
const GROUPS = (eventId === "lock-load") ? { A: [0, 7], B: [8, 15], C: [16, 23], D: [24, 30] } : { A: [0, 8], B: [9, 17], C: [18, 26], D: [27, 35] } ; 
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null); 
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [savingPoints, setSavingPoints] = useState(false);

  const teamNames = (eventId === "lock-load") ? useMemo(() => Array.from({ length: 31 }, (_, i) => `Team ${i + 1}`), []) : useMemo(() => Array.from({ length: 36 }, (_, i) => `Team ${i + 1}`), []);
  const initialRows = useMemo(() => teamNames.map((t) => ({ team: t, wwcd: 0, placement: 0, kills: 0, total: 0 })), [teamNames]); 
  
  const createMatchTemplate = useCallback(
    () =>
      BGMI_MATCH_KEYS.reduce((acc, key) => {
        acc[key] = initialRows.map((row) => ({ ...row }));
        return acc;
      }, {}), 
    [initialRows]
  );

  const [matchData, setMatchData] = useState(() => createMatchTemplate()); 
  const [finalsRows, setFinalsRows] = useState([]); 
  const getTeamName = useCallback((origIdx) => { 
    const firstMatch = matchData[BGMI_MATCH_KEYS[0]];
    return firstMatch && firstMatch[origIdx] ? firstMatch[origIdx].team : `Team ${origIdx + 1}`;
  }, [matchData]);
  
  const updateTeamName = (origIdx, name) => { 
    setMatchData((prev) => {
      const next = { ...prev }; 
      for (const key of BGMI_MATCH_KEYS) {
        const rows = next[key].slice();
        const row = { ...rows[origIdx] };
        row.team = name;
        rows[origIdx] = row;
        next[key] = rows;
      }
      return next;
    });
    setFinalsRows((prev) => prev.map((r) => (r.origIdx === origIdx ? { ...r, team: name } : r)));
    setIsDirty(true);
  };

  const updateCell = (m, i, key, value) => { 
    setMatchData((prev) => {
      const next = { ...prev };
      const rows = [...next[m]];
      const row = { ...rows[i] };
      if (key === "wwcd" || key === "placement" || key === "kills") {
        row[key] = Number(value) || 0; 
        row.total = (row.placement || 0) + (row.kills || 0);
      } else if (key === "team") {
        row.team = value;
      }
      rows[i] = row;
      next[m] = rows;
      return next;
    });
    setIsDirty(true);
  };

  const indicesForGroups = (...groups) => 
    groups.flatMap((g) => {
      const [s, e] = GROUPS[g];
      return Array.from({ length: e - s + 1 }, (_, i) => s + i);
    });

  const indicesForMatch = (mk) => { 
    switch (mk) {
      case "match1": return indicesForGroups("A", "B");
      case "match2": return indicesForGroups("C", "D");
      case "match3": return indicesForGroups("A", "C");
      case "match4": return indicesForGroups("B", "D");
      case "match5": return indicesForGroups("A", "D");
      case "match6": return indicesForGroups("B", "C");
      default: return teamNames.map((_, i) => i);
    }
  };

  const groupLetterForIndex = (idx) => { 
    if (idx >= GROUPS.A[0] && idx <= GROUPS.A[1]) return "A";
    if (idx >= GROUPS.B[0] && idx <= GROUPS.B[1]) return "B";
    if (idx >= GROUPS.C[0] && idx <= GROUPS.C[1]) return "C";
    if (idx >= GROUPS.D[0] && idx <= GROUPS.D[1]) return "D";
    return "?";
  };

  const overallRows = useMemo(() => {
    if (!matchData || !teamNames || teamNames.length === 0) return [];
    const aggregated = teamNames.map((_, idx) => {
      const firstMatch = matchData[BGMI_MATCH_KEYS[0]];
      const team = firstMatch && firstMatch[idx] ? firstMatch[idx].team : `Team ${idx + 1}`;
      let wwcd = 0, placement = 0, kills = 0, total = 0;
      for (const mk of BGMI_MATCH_KEYS) {
        const match = matchData[mk];
        if (!match || !Array.isArray(match)) continue;
        const r = match[idx];
        if (r) {
          wwcd += typeof r.wwcd === 'number' ? r.wwcd : 0;
          placement += typeof r.placement === 'number' ? r.placement : 0;
          kills += typeof r.kills === 'number' ? r.kills : 0;
          total += (typeof r.placement === 'number' ? r.placement : 0) + (typeof r.kills === 'number' ? r.kills : 0);
        }
      }
      return { team, wwcd, placement, kills, total, origIdx: idx };
    });
    aggregated.sort((a, b) => b.total - a.total);
    return aggregated.map((row, i) => ({ rank: i + 1, ...row }));
  }, [matchData, teamNames]);

  const overallTotalsByIndex = useMemo(() => {
    const map = new Map(); 
    for (const row of overallRows) map.set(row.origIdx, row.total);
    return map;
  }, [overallRows]);

  const finalsDisplayRows = useMemo(() => {
    return [...finalsRows]
      .sort((a, b) => b.total - a.total)
      .map((row, index) => ({ rank: index + 1, ...row }));
  }, [finalsRows]);

  const updateFinalsCell = (origIdx, key, value) => { 
    const numericValue = Number(value) || 0;
    setFinalsRows((prev) =>
      prev.map((row) => {
        if (row.origIdx !== origIdx) return row;
        const updated = { ...row, [key]: numericValue }; 
        updated.total = (updated.placement || 0) + (updated.kills || 0);
        return updated;
      })
    );
    setIsDirty(true);
  };

  useEffect(() => {
    setFinalsRows((prev) => {
      const topTeams = overallRows.slice(0, 16);
      const next = topTeams.map((row) => {
        const existing = prev.find((p) => p.origIdx === row.origIdx);
        if (existing) {
          return { ...existing, team: row.team };
        }
        return { origIdx: row.origIdx, team: row.team, wwcd: 0, placement: 0, kills: 0, total: 0 };
      });
      return next;
    });
  }, [overallRows]);
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLastSavedAt(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingPoints(true);
      try {
        const snapshot = await fetchPointsSnapshot(eventId, game.id); 
        if (cancelled) return;
        if (!snapshot) {
          setMatchData(createMatchTemplate());
          setFinalsRows([]);
          setLastSavedAt(null);
          setIsDirty(false);
          return;
        }
        if (snapshot.matchData) {
          const next = createMatchTemplate();
          for (const key of BGMI_MATCH_KEYS) {
            const savedRows = snapshot.matchData?.[key] ?? [];
            next[key] = initialRows.map((row, index) => {
              const saved = savedRows[index];
              const placement = Number(saved?.placement ?? 0);
              const kills = Number(saved?.kills ?? 0);
              return {
                team: saved?.team ?? row.team,
                wwcd: Number(saved?.wwcd ?? 0),
                placement,
                kills,
                total: placement + kills,
              };
            });
          }
          setMatchData(next);
        } else {
          setMatchData(createMatchTemplate());
        }
        if (snapshot.finals && snapshot.finals.length > 0) {
          const finalsList = snapshot.finals;
          setFinalsRows(
            finalsList.filter((r) => r.origIdx !== -1 && r.team !== 'N-ZIGGER').slice(0, 16).map((row) => { 
              const placement = Number(row.placement ?? 0);
              const kills = Number(row.kills ?? 0);
              return {
                origIdx: row.origIdx,
                team: row.team ?? teamNames[row.origIdx] ?? `Team ${row.origIdx + 1}`,
                wwcd: Number(row.wwcd ?? 0),
                placement,
                kills,
                total: Number(row.total ?? placement + kills),
              };
            })
          );
        } else {
          setFinalsRows([]);
        }
        setLastSavedAt(snapshot.updatedAt ?? null);
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
    load();
    return () => { cancelled = true; };
  }, [createMatchTemplate, eventId, game.id, initialRows, teamNames]);

  const saveBgmiPoints = async () => {
    try {
      setSavingPoints(true);
      const payload = {
        matchData,
        finals: [
          ...finalsRows.map((r) => ({ origIdx: r.origIdx, team: r.team, wwcd: r.wwcd, placement: r.placement, kills: r.kills, total: r.total })),
        ],
      };
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
                  <TabsTrigger value="points-table">Points Table</TabsTrigger>
                </TabsList>
              </div>

              {(['A', 'B', 'C', 'D']).map((letter) => ( 
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
                                <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveBgmiPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
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

                              <TableHead className="font-orbitron text-right">Total Points</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {indicesForGroups(letter).map((origIdx, i) => (
                              <TableRow key={`group-${letter}-${origIdx}`} className="border-border/50">
                                <TableCell className="font-semibold">{i + 1}.</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{letter}</div>
                                    {canEdit ? (
                                      <Input value={getTeamName(origIdx)} onChange={(e) => updateTeamName(origIdx, e.target.value)} />
                                    ) : (
                                      <div>{getTeamName(origIdx)}</div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-semibold">{overallTotalsByIndex.get(origIdx) ?? 0}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}

              <TabsContent value="points-table">
                <Card className="glass-card border-primary/20">
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <CardTitle className="font-orbitron text-2xl">Points Table</CardTitle>
                      {canEdit && (
                        <div className="flex items-center gap-3 text-sm">
                           {/* ... Save Button ... */}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overall">
                      <TabsList>
                        <TabsTrigger value="overall">Overall</TabsTrigger>
                        {BGMI_MATCH_KEYS.map((k, i) => (
                          <TabsTrigger key={k} value={k}>{`Match ${i + 1}`}</TabsTrigger>
                        ))}
                      </TabsList>
                      <TabsContent value="overall">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border/50">
                                <TableHead className="font-orbitron">#</TableHead>
                                <TableHead className="font-orbitron">Team</TableHead>
                                <TableHead className="font-orbitron text-right">WWCD!</TableHead>
                                <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                                <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                <TableHead className="font-orbitron text-right">Total Points</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {overallRows.map((row) => (
                                <TableRow key={`overall-${row.rank}`} className="border-border/50">
                                  <TableCell className="font-semibold">{row.rank}.</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{groupLetterForIndex(row.origIdx)}</div>
                                      <div>{row.team}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">{row.wwcd}</TableCell>
                                  <TableCell className="text-right">{row.placement}</TableCell>
                                  <TableCell className="text-right">{row.kills}</TableCell>
                                  <TableCell className="text-right font-semibold">{row.total}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                      {BGMI_MATCH_KEYS.map((mk) => (
                        <TabsContent key={mk} value={mk}>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                 {/* ... Match Table Header ... */}
                              </TableHeader>
                              <TableBody>
                                {indicesForMatch(mk).map((origIdx, i) => {
                                  const row = matchData[mk][origIdx];
                                  return (
                                    <TableRow key={`${mk}-${origIdx}`} className="border-border/50">
                                      <TableCell className="font-semibold">{i + 1}.</TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{groupLetterForIndex(origIdx)}</div>
                                          <div>{row.team}</div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right w-28">{canEdit ? (<Input className="text-right" type="number" value={row.wwcd} onChange={(e) => updateCell(mk, origIdx, "wwcd", e.target.value)} />) : row.wwcd}</TableCell>
                                      <TableCell className="text-right w-36">{canEdit ? (<Input className="text-right" type="number" value={row.placement} onChange={(e) => updateCell(mk, origIdx, "placement", e.target.value)} />) : row.placement}</TableCell>
                                      <TableCell className="text-right w-32">{canEdit ? (<Input className="text-right" type="number" value={row.kills} onChange={(e) => updateCell(mk, origIdx, "kills", e.target.value)} />) : row.kills}</TableCell>
                                      <TableCell className="text-right w-32">{(row.placement || 0) + (row.kills || 0)}</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="groupstage">
          <div>
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="font-orbitron text-2xl">{game.name} — Finals</CardTitle>
                  {canEdit && (
                     <div className="flex items-center gap-3 text-sm">
                        {isSupabaseConfigured() ? (
                          <>
                            <div className="text-muted-foreground">
                              {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                              {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                            </div>
                            <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveBgmiPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
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
                        <TableHead className="font-orbitron text-right">WWCD!</TableHead>
                        <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                        <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                        <TableHead className="font-orbitron text-right">Total Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {finalsDisplayRows.map((row) => (
                        <TableRow key={`finals-${row.origIdx}`} className="border-border/50">
                          <TableCell className="font-semibold">{row.rank}.</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{groupLetterForIndex(row.origIdx)}</div>
                              <div>{row.team}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right w-28">
                            {canEdit ? (<Input className="text-right" type="number" value={row.wwcd} onChange={(e) => updateFinalsCell(row.origIdx, "wwcd", e.target.value)} />) : row.wwcd}
                          </TableCell>
                          <TableCell className="text-right w-36">
                            {canEdit ? (<Input className="text-right" type="number" value={row.placement} onChange={(e) => updateFinalsCell(row.origIdx, "placement", e.target.value)} />) : row.placement}
                          </TableCell>
                          <TableCell className="text-right w-32">
                            {canEdit ? (<Input className="text-right" type="number" value={row.kills} onChange={(e) => updateFinalsCell(row.origIdx, "kills", e.target.value)} />) : row.kills}
                          </TableCell>
                          <TableCell className="text-right font-semibold">{row.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardBgmi;